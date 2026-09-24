const ACCESS_PAGE =
  '/pages/Tipo_visitante/tipo_visitante.html?erro=acesso-nao-configurado';

export function portalRedirect(variableName: string) {
  const configuredUrl = process.env[variableName]?.trim();

  if (configuredUrl) {
    try {
      const destination = new URL(configuredUrl);
      if (destination.protocol === 'https:' || destination.protocol === 'http:') {
        return Response.redirect(destination, 307);
      }
    } catch {
      // Uma variável inválida volta para a seleção com uma mensagem amigável.
    }
  }

  return new Response(null, {
    status: 307,
    headers: { Location: ACCESS_PAGE },
  });
}
