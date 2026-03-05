'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Login: Simply assume the password is correct for testing
        // For the sake of local testing, let's treat any email ending in @admin.com as an admin, else student
        const role = email.endsWith('@admin.com') ? 'admin' : 'student';

        const mockUser = {
            id: Math.random().toString(36).substring(7),
            email,
            full_name: email.split('@')[0],
            role: role as 'student' | 'admin',
            avatar_url: null
        };

        useAuthStore.getState().login(mockUser);

        if (role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
        router.refresh();
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#e75e24] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e75e24] via-[#d05520] to-[#b84a1c]" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/5 blur-3xl rounded-full" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-white/5 blur-3xl rounded-full" />

                <div className="relative z-10 text-center px-12 max-w-lg">
                    <Image
                        src="/unlockwht.png"
                        alt="UNLOCK"
                        width={200}
                        height={70}
                        className="mx-auto mb-10 h-14 w-auto"
                        priority
                    />
                    <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                        Your path to the <br />world's best universities.
                    </h2>
                    <p className="text-white/70 text-lg">
                        Strategic advising. Expert mentorship. Proven results at Harvard, NUS, NYU Abu Dhabi, and more.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        {[
                            { stat: '95%', label: 'Acceptance Rate' },
                            { stat: '$2M+', label: 'Scholarships Won' },
                            { stat: '500+', label: 'Students Placed' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-2xl font-black text-white">{item.stat}</p>
                                <p className="text-xs text-white/60 mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FAFAFA]">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <Image
                            src="/unlockwht.png"
                            alt="UNLOCK"
                            width={140}
                            height={50}
                            className="h-10 w-auto brightness-0 sepia saturate-[20] hue-rotate-[10deg]"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-500 mb-8">Sign in to your UNLOCK account to continue.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="h-12 border-gray-200 focus-visible:ring-[#e75e24]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="h-12 border-gray-200 focus-visible:ring-[#e75e24] pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#e75e24] hover:bg-[#d05520] text-white font-semibold text-base shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-[#e75e24] font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
