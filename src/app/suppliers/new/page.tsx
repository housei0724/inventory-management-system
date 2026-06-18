'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext'; // Note: You'll need to add addSupplier to AppContext
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSupplierPage() {
    const router = useRouter();
    const { addSupplier } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addSupplier({
            ...formData,
        });
        router.push('/suppliers');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/suppliers" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">新規取引先登録</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                            会社名 / 取引先名
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="contactName" className="block text-sm font-medium leading-6 text-slate-900">
                            担当者名
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="contactName"
                                id="contactName"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.contactName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                            メールアドレス
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900">
                            電話番号
                        </label>
                        <div className="mt-2">
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium leading-6 text-slate-900">
                            住所
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-6">
                    <Link href="/suppliers" className="text-sm font-semibold leading-6 text-slate-900 mr-4">
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        登録する
                    </button>
                </div>
            </form>
        </div>
    );
}
