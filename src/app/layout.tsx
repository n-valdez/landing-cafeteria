import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Les Antoja? | Pastelería Artesanal & Café de Especialidad',
  description:
    'Cookies, café de especialidad, tortas personalizadas y opciones saludables en Capiatá - Ruta 2.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}
    >
      <body className="bg-[#FAF6F2] text-[#3B1F14] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}