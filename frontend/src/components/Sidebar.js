'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, FiBox, FiImage, FiFolder, FiGlobe, 
  FiCpu, FiHardDrive, FiNetwork, FiMessageSquare,
  FiSettings, FiMenu, FiX
} from 'react-icons/fi';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', href: '/' },
  { icon: FiBox, label: 'Containers', href: '/containers' },
  { icon: FiImage, label: 'Imagens', href: '/images' },
  { icon: FiFolder, label: 'Volumes', href: '/volumes' },
  { icon: FiGlobe, label: 'Redes', href: '/networks' },
  { icon: FiCpu, label: 'Sistema', href: '/system' },
  { icon: FiMessageSquare, label: 'Chat IA', href: '/chat' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700 z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-indigo-500 flex items-center gap-2">
            <FiBox className="text-3xl" />
            Sistem-Agent
          </h1>
          <p className="text-sm text-slate-400 mt-1">Docker + IA</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <FiSettings size={20} />
            <span className="font-medium">Configurações</span>
          </Link>
        </div>
      </aside>
    </>
  );
}