/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bott Monument",
  description: "Custom memorials crafted in stone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400&family=Alex+Brush&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" data-site-mode="primary">
        {children}
      </body>
    </html>
  );
}
