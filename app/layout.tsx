import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./sw-register";

export const metadata: Metadata = {
  title: "WeatherEvents",
  description:
    "Find nearby events matched to the current weather — indoor when it rains, outdoor when it shines.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeatherEvents",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
