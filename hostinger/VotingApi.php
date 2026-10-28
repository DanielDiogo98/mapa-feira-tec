<?php
declare(strict_types=1);

/** Compatibility adapter for Turma B's HTTP API on PHP-only hosting. */
final class VotingApi
{
    public function __construct(private PDO $pdo, private array $projects, private string $adminToken = '') {}

    private function one(string $sql, array $args = []): ?array
    {
        $query = $this->pdo->prepare($sql);
        $query->execute($args);
        return $query->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function period(): ?array
    {
        $row = $this->one('SELECT * FROM mcm_periodo_votacao ORDER BY id_periodo DESC LIMIT 1');
        if ($row) { $row['id_periodo'] = (int) $row['id_periodo']; $row['andamento'] = (bool) $row['andamento']; }
        return $row;
    }

    private function open(?array $period): bool
    {
        $now = date('Y-m-d H:i:s');
        return $period && $period['andamento'] && $period['data_inicio'] <= $now && $now <= $period['data_encerramento'];
    }

    private function visitor(): ?array
    {
        $token = $_COOKIE['mcm_visitor'] ?? '';
        if (!preg_match('/^[a-f0-9]{64}$/D', $token)) return null;
        return $this->one('SELECT id_visitante, ip, modelo_dispositivo FROM mcm_visitante WHERE token_hash = ?', [hash('sha256', $token)]);
    }

    private function currentVote(int $visitorId): ?array
    {
        $vote = $this->one('SELECT id_curtida, ativa, data_curtida, id_visitante, id_projeto, id_periodo FROM mcm_curtidas WHERE id_visitante = ? AND ativa = 1 ORDER BY data_curtida DESC, id_curtida DESC LIMIT 1', [$visitorId]);
        if (!$vote) return null;
        foreach (['id_curtida', 'ativa', 'id_visitante', 'id_projeto', 'id_periodo'] as $key) $vote[$key] = (int) $vote[$key];
        foreach ($this->projects as $project) if ($project['id'] === $vote['id_projeto']) {
            $vote += ['nome_projeto' => $project['name'], 'turno' => $project['shift'], 'descricao' => $project['description']];
            break;
        }
        return $vote;
    }

    private function ranking(): array
    {
        $counts = $this->pdo->query('SELECT id_projeto, COUNT(*) AS quantidade FROM mcm_curtidas WHERE ativa = 1 GROUP BY id_projeto')->fetchAll(PDO::FETCH_KEY_PAIR);
        $rows = array_map(static fn(array $p): array => [
            'id_projeto' => $p['id'], 'nome_projeto' => $p['name'], 'turno' => $p['shift'],
            'descricao' => $p['description'], 'quantidade_curtidas' => (int) ($counts[$p['id']] ?? 0),
        ], $this->projects);
        usort($rows, static fn(array $a, array $b): int => ($b['quantidade_curtidas'] <=> $a['quantidade_curtidas']) ?: ($a['id_projeto'] <=> $b['id_projeto']));
        return $rows;
    }

    /** @return array{0:int,1:array} */
    public function handle(string $method, string $path, array $body): array
    {
        if ($method === 'GET' && $path === '/votacao/status') {
            $period = $this->period(); $open = $this->open($period);
            return [200, ['aberto' => $open, 'periodo_atual' => $period, 'message' => !$period ? 'Nenhum período de votação configurado.' : ($open ? 'Votação aberta.' : 'Votação fechada.')]];
        }
        if ($method === 'GET' && $path === '/ranking') return [200, ['ranking' => $this->ranking()]];
        if ($method === 'GET' && $path === '/ranking/podio') {
            $rows = [];
            foreach (array_slice($this->ranking(), 0, 3) as $i => $row) $rows[] = ['posicao' => $i + 1, 'id_projeto' => $row['id_projeto'], 'nome_projeto' => $row['nome_projeto'], 'quantidade_curtidas' => $row['quantidade_curtidas']];
            return [200, ['podio' => $rows]];
        }
        if ($method === 'GET' && $path === '/ranking/resultado-final') {
            $rows = $this->pdo->query('SELECT * FROM mcm_resultado ORDER BY data_resultado DESC, posicao ASC')->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$row) foreach ($this->projects as $p) if ((int) $row['id_projeto'] === $p['id']) $row += ['nome_projeto' => $p['name'], 'turno' => $p['shift'], 'descricao' => $p['description']];
            return [200, ['resultado_final' => $rows]];
        }
        if ($method === 'POST' && $path === '/visitantes/identificar') {
            $visitor = $this->visitor();
            if (!$visitor) {
                $token = bin2hex(random_bytes(32));
                // A distinct secure cookie prevents students on shared school Wi-Fi
                // from being treated as the same visitor merely because their IP matches.
                $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
                $device = mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'desconhecido'), 0, 255);
                $query = $this->pdo->prepare('INSERT INTO mcm_visitante (ip, modelo_dispositivo, token_hash) VALUES (?, ?, ?)');
                $query->execute([$ip, $device, hash('sha256', $token)]);
                $visitor = ['id_visitante' => (int) $this->pdo->lastInsertId(), 'ip' => $ip, 'modelo_dispositivo' => $device];
                setcookie('mcm_visitor', $token, ['expires' => time() + 86400 * 30, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly' => true, 'samesite' => 'Lax']);
            }
            $visitor['id_visitante'] = (int) $visitor['id_visitante'];
            return [200, ['message' => 'Visitante identificado com sucesso.', 'visitante' => $visitor, 'cookie_name' => 'mcm_visitor']];
        }
        if ($path === '/votos/meu-voto' && $method === 'GET') {
            $visitor = $this->visitor();
            if (!$visitor) return [401, ['detail' => 'Visitante não identificado.']];
            $vote = $this->currentVote((int) $visitor['id_visitante']);
            return $vote ? [200, ['message' => 'Voto ativo encontrado.', 'voto' => $vote]] : [404, ['detail' => 'Nenhum voto ativo encontrado para este visitante.']];
        }
        if ($path === '/votos' && in_array($method, ['PUT', 'DELETE'], true)) {
            $visitor = $this->visitor();
            if (!$visitor) return [401, ['detail' => 'Visitante não identificado.']];
            if ($method === 'PUT') {
                $projectId = filter_var($body['id_projeto'] ?? null, FILTER_VALIDATE_INT);
                if (!$projectId || $projectId <= 0) return [422, ['detail' => 'O id_projeto deve ser maior que zero.']];
                if (!in_array($projectId, array_column($this->projects, 'id'), true)) return [404, ['detail' => 'Projeto informado não existe.']];
            }
            $visitorId = (int) $visitor['id_visitante'];
            $this->pdo->beginTransaction();
            try {
                $period = $this->one('SELECT * FROM mcm_periodo_votacao ORDER BY id_periodo DESC LIMIT 1 FOR UPDATE');
                if (!$this->open($period)) { $this->pdo->rollBack(); return [409, ['detail' => 'A votação está fechada e não aceita novos votos.']]; }
                $this->one('SELECT id_visitante FROM mcm_visitante WHERE id_visitante = ? FOR UPDATE', [$visitorId]);
                if ($method === 'DELETE' && !$this->currentVote($visitorId)) { $this->pdo->rollBack(); return [404, ['detail' => 'Nenhum voto ativo encontrado para este visitante.']]; }
                $query = $this->pdo->prepare('UPDATE mcm_curtidas SET ativa = 0 WHERE id_visitante = ? AND ativa = 1');
                $query->execute([$visitorId]);
                if ($method === 'PUT') {
                    $query = $this->pdo->prepare('INSERT INTO mcm_curtidas (ativa, data_curtida, id_visitante, id_projeto, id_periodo) VALUES (1, ?, ?, ?, ?)');
                    $query->execute([date('Y-m-d H:i:s'), $visitorId, $projectId, $period['id_periodo']]);
                }
                $vote = $method === 'PUT' ? $this->currentVote($visitorId) : null;
                $this->pdo->commit();
                return $method === 'PUT' ? [200, ['message' => 'Voto registrado com sucesso.', 'voto' => $vote]] : [200, ['message' => 'Voto removido com sucesso.']];
            } catch (Throwable $e) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $e; }
        }
        if (($path === '/votacao/periodo' && $method === 'PATCH') || ($path === '/votacao/encerrar' && $method === 'POST')) {
            if ($this->adminToken === '') return [503, ['detail' => 'Acesso administrativo ainda não configurado.']];
            if (!hash_equals($this->adminToken, $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '')) return [401, ['detail' => 'Credencial administrativa inválida.']];
            return $path === '/votacao/periodo' ? $this->updatePeriod($body) : $this->closePeriod();
        }
        return [404, ['detail' => 'Rota não encontrada.']];
    }

    private function updatePeriod(array $body): array
    {
        try {
            if (empty($body['data_inicio']) || empty($body['data_encerramento'])) throw new InvalidArgumentException();
            $start = new DateTimeImmutable($body['data_inicio']); $end = new DateTimeImmutable($body['data_encerramento']);
            if ($start >= $end) throw new InvalidArgumentException();
        } catch (Throwable) { return [422, ['detail' => 'Informe datas válidas; o início deve ser anterior ao encerramento.']]; }
        $zone = new DateTimeZone('America/Sao_Paulo');
        $this->pdo->beginTransaction();
        try {
            $period = $this->one('SELECT * FROM mcm_periodo_votacao ORDER BY id_periodo DESC LIMIT 1 FOR UPDATE');
            $args = [$start->setTimezone($zone)->format('Y-m-d H:i:s'), $end->setTimezone($zone)->format('Y-m-d H:i:s'), (int) (bool) ($body['andamento'] ?? true)];
            if ($period) { $args[] = $period['id_periodo']; $sql = 'UPDATE mcm_periodo_votacao SET data_inicio = ?, data_encerramento = ?, andamento = ? WHERE id_periodo = ?'; }
            else $sql = 'INSERT INTO mcm_periodo_votacao (data_inicio, data_encerramento, andamento) VALUES (?, ?, ?)';
            $this->pdo->prepare($sql)->execute($args);
            $this->pdo->commit();
        } catch (Throwable $e) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $e; }
        return [200, ['message' => 'Período atualizado com sucesso.', 'periodo' => $this->period()]];
    }

    private function closePeriod(): array
    {
        $this->pdo->beginTransaction();
        try {
            $period = $this->one('SELECT * FROM mcm_periodo_votacao ORDER BY id_periodo DESC LIMIT 1 FOR UPDATE');
            if (!$period) { $this->pdo->rollBack(); return [404, ['detail' => 'Nenhum período de votação encontrado.']]; }
            $ranking = $this->ranking();
            $insert = $this->pdo->prepare('INSERT INTO mcm_resultado (posicao, quantidade_curtidas, data_resultado, id_projeto) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id_projeto = VALUES(id_projeto)');
            foreach ($ranking as $i => $row) $insert->execute([$i + 1, $row['quantidade_curtidas'], $period['data_encerramento'], $row['id_projeto']]);
            $this->pdo->prepare('UPDATE mcm_periodo_votacao SET andamento = 0 WHERE id_periodo = ?')->execute([$period['id_periodo']]);
            $this->pdo->commit();
            return [200, ['message' => 'Votação encerrada com sucesso.', 'resultado' => $ranking]];
        } catch (Throwable $e) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $e; }
    }
}
