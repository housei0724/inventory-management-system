'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Plus, Search, FileText } from 'lucide-react';

export default function PricingTablePage() {
    const { pricingGroups } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = pricingGroups.filter((group) =>
        group.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.finishName && group.finishName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">単価表マスタ</h1>
                <Link
                    href="/pricing/new"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    単価表を新しく作成
                </Link>
            </div>

            <div className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <Search className="h-5 w-5 text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="材料名や仕上げ材で検索..."
                    className="flex-1 border-0 focus:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                        該当する単価表がありません。
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <Link key={group.id} href={`/pricing/${group.id}/edit`} className="block group">
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {group.materialName} {group.finishName ? `+ ${group.finishName}` : ''}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">厚み: {group.thickness || '指定なし'} / 単位: {group.unit}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex-1">
                                    <p className="text-sm text-slate-600">
                                        <span className="font-medium text-slate-900">{group.sizes.length}</span> 個のサイズが登録されています
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {group.sizes.slice(0, 3).map((s, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                {s.sizeName}
                                            </span>
                                        ))}
                                        {group.sizes.length > 3 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-500">
                                                ...+{group.sizes.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
