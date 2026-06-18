'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditRequesterPage() {
    const router = useRouter();
    const params = useParams();
    const { requesters, updateRequester } = useApp();

    const requester = requesters.find(r => r.id === params.id);

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');

    useEffect(() => {
        if (requester) {
            setName(requester.name);
            setDepartment(requester.department);
        }
    }, [requester]);

    if (!requester) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/requesters" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">部門が見つかりません</h2>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateRequester(requester.id, {
            name,
            department,
        });
        router.push('/requesters');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/requesters" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">部門を編集</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                部門名
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="department" className="block text-sm font-medium leading-6 text-slate-900">
                                部門コード
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="department"
                                    id="department"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-6">
                    <Link href="/requesters" className="text-sm font-semibold leading-6 text-slate-900 mr-4">
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
}
