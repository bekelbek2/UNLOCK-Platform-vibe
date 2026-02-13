'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Award,
  Building2,
  CheckSquare,
  FileText,
  Video,
  BarChart3,
  LogOut,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Activities & Honors', href: '/dashboard/activities-honors', icon: Award },
  { name: 'Applications', href: '/applications', icon: Building2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Sessions', href: '/sessions', icon: Video },
  { name: 'Resource Center', href: '/resources', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 px-4 py-4">
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

      {/* Sign Out */}
      <div className="px-4 py-6">
        <button className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors w-full rounded-md">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
