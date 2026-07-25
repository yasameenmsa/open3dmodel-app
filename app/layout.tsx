import './globals.css';

export const metadata = {
  title: 'Open3DModel Executive Anatomy Suite (/ceo)',
  description: 'Interactive 3D Physiotherapy & Anatomy Explorer powered by Open3D models',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
