

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { CheckoutDrawer } from "@/components/cart/checkout-drawer";
import { Toaster } from "@/components/ui/sonner";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const shouldHideCart = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
          {!shouldHideCart && <CheckoutDrawer />}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
