type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

async function proxy(request: Request, context: RouteContext) {
  const upstream = process.env.BACKEND_API_URL?.replace(/\/$/, '');
  if (!upstream) {
    return Response.json(
      { error: 'Backend ainda não configurado.' },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = `${upstream}/${path.map(encodeURIComponent).join('/')}${incoming.search}`;

  const headers = new Headers(request.headers);
  // Cabeçalhos de transporte pertencem à conexão entre o navegador e o
  // Railway. Repassá-los para outra conexão pode fazer o fetch do Node falhar.
  for (const header of [
    'host',
    'connection',
    'content-length',
    'transfer-encoding',
    'upgrade',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
  ]) {
    headers.delete(header);
  }
  headers.set('accept-encoding', 'identity');

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
      redirect: 'manual',
    });
    const outgoingHeaders = new Headers(response.headers);
    outgoingHeaders.delete('content-encoding');
    outgoingHeaders.delete('content-length');
    outgoingHeaders.delete('transfer-encoding');
    return new Response(response.body, {
      status: response.status,
      headers: outgoingHeaders,
    });
  } catch (error) {
    console.error('Falha ao acessar a API do site:', error);
    return Response.json(
      { error: 'A API está temporariamente indisponível.' },
      { status: 502 },
    );
  }
}

export { proxy as DELETE, proxy as GET, proxy as OPTIONS, proxy as PATCH };
export { proxy as POST, proxy as PUT };
