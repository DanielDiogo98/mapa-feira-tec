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

  // O runtime local do mapa não confia na cadeia TLS do domínio gerado pelo
  // Railway. No Railway, deixe o navegador seguir o redirecionamento: ele usa
  // a cadeia normal do sistema e a API continua protegida pelas regras CORS.
  if (new URL(upstream).hostname.endsWith('.up.railway.app')) {
    return Response.redirect(target, 307);
  }

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

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
  } catch {
    return Response.json(
      { error: 'A API está temporariamente indisponível.' },
      { status: 502 },
    );
  }
}

export { proxy as DELETE, proxy as GET, proxy as OPTIONS, proxy as PATCH };
export { proxy as POST, proxy as PUT };
