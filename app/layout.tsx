import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Mapa | Feira Tecnológica', description: 'Explore as salas e os corredores do Bloco A da Feira Tecnológica.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
