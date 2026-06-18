'use client';

import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditItemPage() {
    const { id } = useParams();
    const router = useRouter();
    const { items, updateItem } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        unitPrice: 0,
        estimateUnitPrice: 0,
        quantity: 0,
        unit: '',
        minStockLevel: 0,
        description: '',
    });

    useEffect(() => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setFormData({
                name: item.name,
                sku: item.sku,
                category: item.category,
                unitPrice: item.unitPrice,
                estimateUnitPrice: item.estimateUnitPrice || 0,
                quantity: item.quantity,
                unit: item.unit,
                minStockLevel: item.minStockLevel,
                description: item.description || '',
            });
        }
    }, [id, items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof id === 'string') {
            updateItem(id, formData);
            router.push(`/inventory/${id}`);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'quantity' || name === 'minStockLevel' || name === 'unitPrice' || name === 'estimateUnitPrice' ? Number(value) : value,
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href={`/inventory/${id}`}
                        className="inline-flex items-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">商品編集</h2>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="sku" className="block text-sm font-medium leading-6 text-slate-900">
                                    SKU
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="sku"
                                        id="sku"
                                        required
                                        value={formData.sku}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="category" className="block text-sm font-medium leading-6 text-slate-900">
                                    カテゴリ
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="category"
                                        id="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        value={formData.unitPrice}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        value={formData.estimateUnitPrice || ''}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-slate-900">
                                    現在在庫数
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="quantity"
                                        id="quantity"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="minStockLevel" className="block text-sm font-medium leading-6 text-slate-900">
                                    最低在庫数
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="minStockLevel"
                                        id="minStockLevel"
                                        required
                                        min="0"
                                        value={formData.minStockLevel}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">
                                    説明
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-x-6 border-t border-slate-900/10 pt-4">
                            <Link href={`/inventory/${id}`} className="text-sm font-semibold leading-6 text-slate-900">
                                キャンセル
                            </Link>
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <Save className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                保存する
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
