import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Mapa | Feira Tecnológica',
  description:
    'Encontre projetos e trace rotas pelos espaços da Feira Tecnológica 2026.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
