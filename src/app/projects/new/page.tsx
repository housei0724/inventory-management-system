'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
    const router = useRouter();
    const { addProject } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        projectNumber: '',
        address: '',
        manager: '',
        status: 'active' as 'active' | 'completed' | 'on_hold',
        contractAmount: 0,
        budgetMaterialCost: 0,
        budgetConstructionCost: 0,
        budgetOtherCost: 0,
    });

    const numberFields = ['contractAmount', 'budgetMaterialCost', 'budgetConstructionCost', 'budgetOtherCost'];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: numberFields.includes(name) ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addProject({
            ...formData,
        });
        router.push('/projects');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/projects" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">新規工事現場登録</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                            工事名称
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
                        <label htmlFor="projectNumber" className="block text-sm font-medium leading-6 text-slate-900">
                            工事番号
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="projectNumber"
                                id="projectNumber"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.projectNumber}
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

                    <div className="sm:col-span-3">
                        <label htmlFor="manager" className="block text-sm font-medium leading-6 text-slate-900">
                            現場代理人
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="manager"
                                id="manager"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.manager}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900">
                            ステータス
                        </label>
                        <div className="mt-2">
                            <select
                                id="status"
                                name="status"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">稼働中</option>
                                <option value="completed">完了</option>
                                <option value="on_hold">保留</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="contractAmount" className="block text-sm font-medium leading-6 text-slate-900">
                            受注金額
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="contractAmount"
                                id="contractAmount"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.contractAmount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 予算内訳 */}
                    <div className="sm:col-span-6">
                        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">積算予算内訳（受注時）</h3>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="budgetMaterialCost" className="block text-sm font-medium leading-6 text-slate-900">
                            積算材料費
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="budgetMaterialCost"
                                id="budgetMaterialCost"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.budgetMaterialCost}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="budgetConstructionCost" className="block text-sm font-medium leading-6 text-slate-900">
                            積算工事費
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="budgetConstructionCost"
                                id="budgetConstructionCost"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.budgetConstructionCost}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="budgetOtherCost" className="block text-sm font-medium leading-6 text-slate-900">
                            積算その他費
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="budgetOtherCost"
                                id="budgetOtherCost"
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                value={formData.budgetOtherCost}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 flex gap-6">
                            <span>積算合計: <strong>¥{(formData.budgetMaterialCost + formData.budgetConstructionCost + formData.budgetOtherCost).toLocaleString()}</strong></span>
                            <span>予想粗利: <strong className={(formData.contractAmount - formData.budgetMaterialCost - formData.budgetConstructionCost - formData.budgetOtherCost) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ¥{(formData.contractAmount - formData.budgetMaterialCost - formData.budgetConstructionCost - formData.budgetOtherCost).toLocaleString()}
                            </strong></span>
                            <span>予想粗利率: <strong className={(formData.contractAmount - formData.budgetMaterialCost - formData.budgetConstructionCost - formData.budgetOtherCost) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formData.contractAmount > 0 ? (((formData.contractAmount - formData.budgetMaterialCost - formData.budgetConstructionCost - formData.budgetOtherCost) / formData.contractAmount) * 100).toFixed(1) : 0}%
                            </strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-6">
                    <Link href="/projects" className="text-sm font-semibold leading-6 text-slate-900 mr-4">
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
