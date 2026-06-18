'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewItemPage() {
    const router = useRouter();
    const { addItem } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        estimateUnitPrice: 0 as number | undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'quantity' || name === 'unitPrice' || name === 'estimateUnitPrice' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addItem({
            ...formData,
            minStockLevel: 0,
            updatedAt: new Date().toISOString(),
        });
        router.push('/inventory');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/inventory" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">新規商品登録</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                            商品名
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
                        <label htmlFor="sku" className="block text-sm font-medium leading-6 text-slate-900">
                            規格・寸法
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="sku"
                                id="sku"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.sku}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="category" className="block text-sm font-medium leading-6 text-slate-900">
                            カテゴリー
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="category"
                                id="category"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.category}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="unitPrice" className="block text-sm font-medium leading-6 text-slate-900">
                            発注用単価 (材料費のみ)
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="unitPrice"
                                id="unitPrice"
                                min="0"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.unitPrice}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="estimateUnitPrice" className="block text-sm font-medium leading-6 text-slate-900">
                            見積用単価 (材料費＋労務費M単価)
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="estimateUnitPrice"
                                id="estimateUnitPrice"
                                min="0"
                                placeholder="未入力の場合は発注用単価を使用"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.estimateUnitPrice || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-slate-900">
                            在庫数
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                min="0"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="unit" className="block text-sm font-medium leading-6 text-slate-900">
                            単位
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="unit"
                                id="unit"
                                required
                                placeholder="個, 箱, m, etc."
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                </div>

                <div className="flex items-center justify-end pt-6">
                    <Link href="/inventory" className="text-sm font-semibold leading-6 text-slate-900 mr-4">
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
