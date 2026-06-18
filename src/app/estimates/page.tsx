'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { FileText, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function EstimatesPage() {
    const { estimates } = useApp();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredEstimates = estimates.filter(est => 
        est.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.addressee.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-slate-600" />
                    見積管理
                </h1>
                <Link
                    href="/estimates/new"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    新規見積作成
                </Link>
            </div>

            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex-1 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="工事件名や宛名で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">作成日</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">工事件名</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">宛名</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">金額合計</th>
                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900">状態</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredEstimates.length > 0 ? (
                            filteredEstimates.map((estimate) => (
                                <tr key={estimate.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">
                                        {format(new Date(estimate.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">
                                        {estimate.projectName || '（無題）'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                        {estimate.addressee}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 text-right">
                                        ¥{estimate.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                            {estimate.status === 'draft' ? '下書き' : 
                                             estimate.status === 'submitted' ? '提出済' : 
                                             estimate.status === 'accepted' ? '受注' : 
                                             estimate.status === 'rejected' ? '失注' : '下書き'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                                    見積もりがありません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
