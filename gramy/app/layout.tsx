import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navigation-bar";
import { ModalProvider } from "@/context/ModalContext";
import Register from "@/components/user/register";
import Login from "@/components/user/login";
import Footer from "@/components/layout/footer";
import CreateCollectionModal from "@/components/collections/create-collection-modal";
import GameLogModal from "@/components/game-actions/game-log-modal";
import { TabRefreshHandler } from "@/components/tab-refresh-handler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gromy - Your Gaming Library",
  description: "Organize and track your video game collection with Gramy. Discover new games, log your playtime, and share your gaming journey with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <TabRefreshHandler />
        <ModalProvider>
          <Navbar />
          <Login />
          <Register />
          <GameLogModal />
          <CreateCollectionModal />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}