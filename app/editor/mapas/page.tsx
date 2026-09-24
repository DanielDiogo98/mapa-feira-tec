import { ArrowRight, Building2, Map as MapIcon, Trees } from 'lucide-react';

const maps = [
  {
    href: '/editor',
    title: 'Bloco A · Salas',
    description: '25 pontos e 24 conexões já cadastrados.',
    status: 'Rede pronta',
    icon: Building2,
  },
  {
    href: '/editor/patio',
    title: 'Pátio · Biblioteca',
    description:
      'Entrada, pátio, cantina, refeitório, biblioteca e escada do Bloco A.',
    status: 'Rede pronta',
    icon: Trees,
  },
  {
    href: '/editor/bloco-b-andar-1',
    title: 'Bloco B · 1º andar',
    description:
      'Salas, banheiros, escada e saída ligados por 20 pontos e 19 conexões.',
    status: 'Rede pronta',
    icon: Building2,
  },
  {
    href: '/editor/bloco-b-andar-2',
    title: 'Passagem Bloco A · Bloco B · 2º andar',
    description:
      'Passagem alternativa e laboratórios ligados ao segundo andar do Bloco B.',
    status: 'Rede pronta',
    icon: Building2,
  },
];

export default function MapIndex() {
  const enabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_MAP_EDITOR_ENABLED === 'true';
  if (!enabled) {
    return (
      <main className="editor-locked">
        <span className="brand-icon">
          <MapIcon size={24} />
        </span>
        <span className="eyebrow">ÁREA TÉCNICA</span>
        <h1>Editor indisponível</h1>
        <p>
          Os visitantes podem consultar o mapa, mas não alterar pontos ou
          caminhos.
        </p>
        <a className="btn primary" href="/">
          Voltar ao mapa
        </a>
      </main>
    );
  }
  return (
    <main className="map-index">
      <header>
        <span className="brand-icon">
          <MapIcon size={24} />
        </span>
        <div>
          <span className="eyebrow">ESTÚDIO DO MAPA</span>
          <h1>Mapas da Feira Tecnológica</h1>
          <p>Escolha uma planta para revisar pontos e conexões.</p>
        </div>
      </header>
      <section className="map-card-grid">
        {maps.map(({ href, title, description, status, icon: Icon }) => (
          <a className="map-card" href={href} key={href}>
            <span className="map-card-icon">
              <Icon size={22} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
              <small>{status}</small>
            </div>
            <ArrowRight size={19} />
          </a>
        ))}
      </section>
      <a className="btn" href="/">
        Abrir mapa dos visitantes
      </a>
    </main>
  );
}
