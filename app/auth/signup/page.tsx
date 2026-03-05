'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, GraduationCap, Shield } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const role = 'student'; // Hardcode role to student for public signups
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Signup: Just log them straight in
        const mockUser = {
            id: Math.random().toString(36).substring(7),
            email,
            full_name: fullName,
            role: role as 'student' | 'admin',
            avatar_url: null
        };

        useAuthStore.getState().login(mockUser);

        setSuccess(true);
        setLoading(false);
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
                        Start your journey <br />to admission success.
                    </h2>
                    <p className="text-white/70 text-lg">
                        Join hundreds of students who have secured placements at the world&apos;s top universities with UNLOCK.
                    </p>
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

                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <GraduationCap className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
                            <p className="text-gray-500 mb-8">
                                We sent a confirmation link to <strong className="text-gray-900">{email}</strong>. Click it to activate your account.
                            </p>
                            <Link href="/auth/login">
                                <Button variant="outline" className="border-[#e75e24] text-[#e75e24] hover:bg-[#e75e24]/5">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
                            <p className="text-gray-500 mb-8">Get started with UNLOCK in seconds.</p>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Full Name</Label>
                                    <Input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Alex Johnson"
                                        required
                                        className="h-12 border-gray-200 focus-visible:ring-[#e75e24]"
                                    />
                                </div>

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
                                            placeholder="Min. 6 characters"
                                            required
                                            minLength={6}
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
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-8">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-[#e75e24] font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
