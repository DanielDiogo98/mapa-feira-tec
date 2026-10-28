import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../../app/globals.css';

const routes: Record<string, ReturnType<typeof lazy>> = {
  '/mapa': lazy(() => import('../../app/mapa/page')),
  '/editor': lazy(() => import('../../app/editor/page')),
  '/editor/mapas': lazy(() => import('../../app/editor/mapas/page')),
  '/editor/patio': lazy(() => import('../../app/editor/patio/page')),
  '/editor/bloco-b-andar-1': lazy(() => import('../../app/editor/bloco-b-andar-1/page')),
  '/editor/bloco-b-andar-2': lazy(() => import('../../app/editor/bloco-b-andar-2/page')),
};
const path = location.pathname.replace(/\/$/, '') || '/mapa';
const Page = routes[path];
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status" style={{ padding: '2rem' }}>Carregando mapa…</p>}>
      {Page ? <Page /> : <p>Página não encontrada. <a href="/">Voltar ao início</a></p>}
    </Suspense>
  </StrictMode>,
);
