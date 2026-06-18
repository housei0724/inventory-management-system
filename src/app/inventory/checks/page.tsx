'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ClipboardList, Plus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function InventoryChecksPage() {
    const { inventoryChecks, issuers } = useApp();

    const getIssuerName = (id: string) => {
        const issuer = issuers.find(i => i.id === id);
        return issuer ? issuer.name : id;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/inventory" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">棚卸管理</h2>
                </div>
                <Link
                    href="/inventory/checks/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    新規棚卸開始
                </Link>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                                実施日
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                                ステータス
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                                実施者
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                                対象品目数
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                                備考
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">詳細</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {inventoryChecks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                                    <ClipboardList className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    棚卸履歴がありません。
                                </td>
                            </tr>
                        ) : (
                            inventoryChecks.map((check) => (
                                <tr key={check.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                        {format(new Date(check.date), 'yyyy年MM月dd日', { locale: ja })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                            check.status === 'completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {check.status === 'completed' ? '完了済' : '下書き'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {getIssuerName(check.conductedBy)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {check.items.length} 件
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 truncate max-w-xs">
                                        {check.notes || '-'}
                                    </td>
                                    <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <Link
                                            href={`/inventory/checks/${check.id}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            {check.status === 'completed' ? '詳細を見る' : '編集する'}
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
