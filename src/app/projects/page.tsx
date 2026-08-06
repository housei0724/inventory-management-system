'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, MapPin, User, Plus, Edit } from 'lucide-react';
import { useState } from 'react';

const statusConfig = {
    active:    { label: '稼働中', className: 'bg-green-100 text-green-800' },
    completed: { label: '完了',   className: 'bg-slate-100 text-slate-600' },
    on_hold:   { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
} as const;

type FilterTab = 'active' | 'completed' | 'on_hold' | 'all';

export default function ProjectsPage() {
    const { projects } = useApp();
    const router = useRouter();
    const [filterTab, setFilterTab] = useState<FilterTab>('active');

    const filteredProjects = filterTab === 'all'
        ? projects
        : projects.filter(p => p.status === filterTab);

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'active',    label: `稼働中 (${projects.filter(p => p.status === 'active').length})` },
        { key: 'completed', label: `完了 (${projects.filter(p => p.status === 'completed').length})` },
        { key: 'on_hold',   label: `保留中 (${projects.filter(p => p.status === 'on_hold').length})` },
        { key: 'all',       label: `すべて (${projects.length})` },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">工事現場 (プロジェクト)</h2>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    新規現場登録
                </Link>
            </div>

            {/* フィルタータブ */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterTab(tab.key)}
                            className={`whitespace-nowrap pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                filterTab === tab.key
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {filteredProjects.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">該当する現場がありません</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => {
                        const status = statusConfig[project.status] ?? { label: project.status, className: 'bg-slate-100 text-slate-800' };
                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className={`block overflow-hidden rounded-lg bg-white shadow transition-transform hover:scale-105 ${project.status === 'completed' ? 'opacity-70' : ''}`}
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <HardHat className={`h-8 w-8 ${project.status === 'active' ? 'text-orange-500' : 'text-slate-400'}`} />
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium leading-6 text-slate-900">{project.name}</h3>
                                                <p className="text-sm text-slate-500">{project.projectNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${status.className}`}>
                                                {status.label}
                                            </span>
                                            <button
                                                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 z-10 relative"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    router.push(`/projects/${project.id}/edit`);
                                                }}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {project.address || '住所未登録'}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <User className="mr-2 h-4 w-4" />
                                            {project.manager || '担当者未登録'}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
