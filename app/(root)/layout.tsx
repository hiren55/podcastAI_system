import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster"
import PodcastPlayer from "@/components/PodcastPlayer";
import { SignedIn } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col scrollbar-ai">
      <main className="relative flex">
        <SignedIn>
          <LeftSidebar />
        </SignedIn>

        <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-14 scrollbar-ai">
          <div className="mx-auto flex w-full max-w-5xl flex-col max-sm:px-4">
            <div className="flex h-16 items-center justify-between md:hidden">
              <SignedIn>
                <MobileNav />
              </SignedIn>
            </div>
            <div className="flex flex-col md:pb-14">
              <Toaster />

              {children}
            </div>
          </div>
        </section>

        <SignedIn>
          <RightSidebar />
        </SignedIn>
      </main>

      <PodcastPlayer />
    </div>
  );
}
