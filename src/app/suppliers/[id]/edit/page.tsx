'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditSupplierPage() {
    const router = useRouter();
    const params = useParams();
    const { suppliers, updateSupplier } = useApp();

    const supplier = suppliers.find(s => s.id === params.id);

    const [name, setName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (supplier) {
            setName(supplier.name);
            setContactName(supplier.contactName || '');
            setEmail(supplier.email || '');
            setPhone(supplier.phone || '');
            setAddress(supplier.address || '');
        }
    }, [supplier]);

    if (!supplier) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/suppliers" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">取引先が見つかりません</h2>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSupplier(supplier.id, {
            name,
            contactName,
            email,
            phone,
            address,
        });
        router.push('/suppliers');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/suppliers" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">取引先を編集</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                取引先名
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

                        <div className="sm:col-span-3">
                            <label htmlFor="contactName" className="block text-sm font-medium leading-6 text-slate-900">
                                担当者名
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="contactName"
                                    id="contactName"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
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
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
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
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
}
