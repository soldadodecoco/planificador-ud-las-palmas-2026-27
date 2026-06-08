import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planificador UD Las Palmas 2026/27",
  description: "Planifica renovaciones, salidas, cantera y mercado de la UD Las Palmas 2026/27."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
