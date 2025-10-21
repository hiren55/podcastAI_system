'use client';

import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useToast, toastSuccess, toastError } from '@/components/ui/use-toast';

export default function RoleSwitcher() {
    const { user, isLoaded, isSignedIn } = useUser();
    const role = useQuery(api.users.getUserRole, user?.id ? { clerkId: user.id } : 'skip');
    const setRole = useMutation(api.users.setUserRole);
    const setRoleByClerk = useMutation(api.users.setUserRoleByClerkId);
    const { toast } = useToast();
    const [updating, setUpdating] = useState(false);

    async function choose(nextRole: 'viewer' | 'creator') {
        if (!isLoaded || !isSignedIn || !user?.id) return;
        try {
            setUpdating(true);
            try {
                await setRole({ role: nextRole });
            } catch {
                await setRoleByClerk({ clerkId: user.id, role: nextRole });
            }
            toastSuccess({
                title: `🎉 Role Updated!`,
                description: `Successfully switched to ${nextRole} role`
            });
        } catch (e) {
            console.error(e);
            toastError({
                title: '❌ Role Switch Failed',
                description: 'Failed to set role. Please try again.'
            });
        } finally {
            setUpdating(false);
        }
    }

    const disabled = !isLoaded || !isSignedIn || updating;

    return (
        <div className="flex flex-col items-center gap-6">
            <SignedOut>
                <SignInButton>
                    <button className="btn-ai-neon px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                        Login / Sign up
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <div className="text-center mb-4">
                    <div className="text-tertiary text-sm mb-2">Current Role</div>
                    <div className="text-2xl font-bold ai-gradient-text capitalize">
                        {role || 'loading...'}
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => choose('viewer')}
                        disabled={disabled}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'btn-ai-glass hover:shadow-lg'
                            } ${role === 'viewer' ? 'ring-2 ring-gray-5' : ''}`}
                    >
                        👀 Viewer
                    </button>
                    <button
                        onClick={() => choose('creator')}
                        disabled={disabled}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'btn-ai-neon hover:shadow-lg'
                            } ${role === 'creator' ? 'ring-2 ring-gray-5' : ''}`}
                    >
                        {updating ? '⏳ Updating...' : '🎙️ Creator'}
                    </button>
                </div>
            </SignedIn>
        </div>
    );
}
