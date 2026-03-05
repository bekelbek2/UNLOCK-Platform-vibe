'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import {
  LayoutDashboard,
  User,
  Award,
  GraduationCap,
  Building2,
  CheckSquare,
  FileText,
  Video,
  BarChart3,
  LogOut,
  Map,
  Shield,
  Loader2,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Activities & Honors', href: '/dashboard/activities-honors', icon: Award },
  { name: 'Catalog', href: '/dashboard/catalog', icon: GraduationCap },
  { name: 'Applications', href: '/dashboard/applications', icon: Building2 },
  { name: 'My Plan', href: '/dashboard/my-plan', icon: Map },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Sessions', href: '/sessions', icon: Video },
  { name: 'Resource Center', href: '/resources', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  // Defer rendering user data to avoid hydration mismatched on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    setSigningOut(true);
    logout();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#e75e24] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6">
        <Image
          src="/unlockwht.png"
          alt="Unlock Logo"
          width={150}
          height={50}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-white text-[#e75e24] font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 space-y-1 border-t border-white/15">
        {mounted && user?.email && (
          <div className="px-4 py-2 mb-1">
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Signed in as</p>
            <p className="text-white text-sm font-medium truncate">{user.email}</p>
          </div>
        )}
        <Link
          href="/admin"
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors w-full rounded-md"
        >
          <Shield size={20} />
          <span>Admin Panel</span>
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors w-full rounded-md"
        >
          {signingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}
