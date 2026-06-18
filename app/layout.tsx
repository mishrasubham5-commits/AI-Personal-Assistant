import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ameriprise - AI IAM Policy Copilot",
  description:
    "Analyze IAM roles, permissions, access controls, SoD conflicts, and compliance requirements using natural language.",
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
