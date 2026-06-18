'use client';

import { useApp } from '@/context/AppContext';
import { User, Building2, Mail, Phone, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
    const { suppliers, requesters } = useApp();

    return (
        <div className="space-y-8">
            {/* Suppliers Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">取引先 (サプライヤー)</h2>
                    <Link
                        href="/suppliers/new"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        新規取引先登録
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Building2 className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium leading-6 text-slate-900">{supplier.name}</h3>
                                            <p className="text-sm text-slate-500">担当: {supplier.contactName}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/suppliers/${supplier.id}/edit`}
                                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {supplier.email}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Phone className="mr-2 h-4 w-4" />
                                        {supplier.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Requesters Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">依頼元 (部門)</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {requesters.map((requester) => (
                        <div key={requester.id} className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <User className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium leading-6 text-slate-900">{requester.name}</h3>
                                            <p className="text-sm text-slate-500">{requester.department}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/requesters/${requester.id}/edit`}
                                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
