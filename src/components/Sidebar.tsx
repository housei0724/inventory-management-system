'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, HardHat, FileText, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
    { name: 'ダッシュボード', href: '/', icon: LayoutDashboard },
    { name: '見積管理', href: '/estimates', icon: FileText },
    { name: '在庫管理', href: '/inventory', icon: Package },
    { name: '発注管理', href: '/orders', icon: ShoppingCart },
    { name: '工事現場', href: '/projects', icon: HardHat },
    { name: '予算管理', href: '/budget', icon: BarChart2 },
    { name: '取引先・部門', href: '/suppliers', icon: Users },
    { name: '単価表マスタ', href: '/pricing', icon: FileText },
    { name: '設定', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-wider">IMS</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-slate-800 p-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
