'use client';

import RoleSwitcher from '@/components/RoleSwitcher';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function RoleSwitchPage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Floating Gradient Orbs */}
            <div className="floating-orb floating-orb-1"></div>
            <div className="floating-orb floating-orb-2"></div>
            <div className="floating-orb floating-orb-3"></div>

            {/* Header */}
            <header className="card-ai-glass border-b border-glass mx-4 mt-4">
                <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                            <Image src="/icons/logo.svg" width={20} height={20} alt="Podcastr logo" />
                        </div>
                        <span className="text-lg font-semibold ai-gradient-text">Podcastr</span>
                    </Link>
                </div>
            </header>

            <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="card-ai-glass p-8 mb-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-6 to-gray-5 rounded-2xl flex items-center justify-center">
                                <span className="text-4xl">🔄</span>
                            </div>
                            <h1 className="text-4xl font-bold ai-gradient-text mb-4">Switch Role</h1>
                            <p className="text-xl text-tertiary">
                                Choose your role to access different features of the platform
                            </p>
                        </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="card-ai-glass p-8">
                        <RoleSwitcher />
                    </div>

                    {/* Role Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="card-ai-podcast p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                    <span className="text-xl">👀</span>
                                </div>
                                <h3 className="text-xl font-bold ai-glow-text">Viewer Role</h3>
                            </div>
                            <ul className="text-tertiary space-y-2">
                                <li>• Discover and listen to podcasts</li>
                                <li>• Create and manage playlists</li>
                                <li>• Download content for offline listening</li>
                                <li>• Follow creators and view profiles</li>
                                <li>• Search and filter content</li>
                            </ul>
                        </div>

                        <div className="card-ai-podcast p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-6 to-gray-5 flex items-center justify-center">
                                    <span className="text-xl">🎙️</span>
                                </div>
                                <h3 className="text-xl font-bold ai-glow-text">Creator Role</h3>
                            </div>
                            <ul className="text-tertiary space-y-2">
                                <li>• Create and publish podcasts</li>
                                <li>• Generate AI-powered content</li>
                                <li>• Manage episodes and series</li>
                                <li>• Access analytics and insights</li>
                                <li>• All viewer features included</li>
                            </ul>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-8">
                        <Link
                            href="/"
                            className="btn-ai-glass inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
