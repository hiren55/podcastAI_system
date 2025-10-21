"use client";
import Link from "next/link";
import Image from "next/image";
import { SignedOut } from "@clerk/nextjs";
import ToastTest from "@/components/ToastTest";

export default function Dashboard() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Gradient Orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>

      {/* Header (only for signed-out users) */}
      <SignedOut>
        <header className="card-ai-glass border-b border-glass mx-4 mt-4">
          <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                <Image src="/icons/logo.svg" width={20} height={20} alt="Podcastr logo" />
              </div>
              <span className="text-lg font-semibold ai-gradient-text">Podcastr</span>
            </div>
          </div>
        </header>
      </SignedOut>

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero texts (only for signed-out users) */}
          <SignedOut>
            <div className="text-center space-y-6">
              <h1 className="text-4xl sm:text-6xl font-bold ai-gradient-text">Welcome to Podcastr</h1>
              <p className="text-lg sm:text-xl text-tertiary max-w-3xl mx-auto leading-relaxed">
                Create and discover podcasts with advanced AI-powered features.
                Experience the future of audio content creation.
              </p>
            </div>
              </SignedOut>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="card-ai-podcast p-8 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                    </div>
                  </div>
                  <div>
                <h2 className="text-2xl font-bold ai-glow-text mb-3">Discover</h2>
                <p className="text-tertiary mb-6">Explore podcasts and curated playlists with AI-powered recommendations.</p>
              </div>
              <Link href="/discover" className="btn-ai-glass inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium">
                Browse Discover
                <span className="text-lg">→</span>
              </Link>
            </div>

            <div className="card-ai-podcast p-8 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                  <span className="text-2xl">🎙️</span>
                </div>
                </div>
              <div>
                <h2 className="text-2xl font-bold ai-glow-text mb-3">Create</h2>
                <p className="text-tertiary mb-6">Generate scripts and publish your show with AI assistance.</p>
              </div>
              <Link href="/create-podcast" className="btn-ai-neon inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium">
                Start Creating
                <span className="text-lg">⚡</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Test Component */}
      <ToastTest />
    </div>
  );
}