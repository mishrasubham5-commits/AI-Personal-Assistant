import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shubham AI Bot",
  description: "Write emails, LinkedIn posts, blogs and messages in your style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
