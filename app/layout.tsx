import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Cold Email",
  description: "Compose, personalize, and manage cold email outreach campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 px-6 py-8 md:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
