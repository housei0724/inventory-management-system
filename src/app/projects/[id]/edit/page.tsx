'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const { projects, updateProject } = useApp();

    const project = projects.find(p => p.id === params.id);

    const [name, setName] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<'active' | 'completed' | 'on_hold'>('active');
    const [contractAmount, setContractAmount] = useState(0);
    const [budgetMaterialCost, setBudgetMaterialCost] = useState(0);
    const [budgetConstructionCost, setBudgetConstructionCost] = useState(0);
    const [budgetOtherCost, setBudgetOtherCost] = useState(0);

    useEffect(() => {
        if (project) {
            setName(project.name);
            setProjectNumber(project.projectNumber);
            setLocation(project.address || '');
            setStatus(project.status);
            setContractAmount(project.contractAmount || 0);
            setBudgetMaterialCost(project.budgetMaterialCost || 0);
            setBudgetConstructionCost(project.budgetConstructionCost || 0);
            setBudgetOtherCost(project.budgetOtherCost || 0);
        }
    }, [project]);

    if (!project) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/projects" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">工事現場が見つかりません</h2>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProject(project.id, {
            name,
            projectNumber,
            address: location,
            status,
            contractAmount,
            budgetMaterialCost,
            budgetConstructionCost,
            budgetOtherCost,
        });
        router.push('/projects');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/projects" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">工事現場を編集</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                工事現場名
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
                            <label htmlFor="projectNumber" className="block text-sm font-medium leading-6 text-slate-900">
                                工事番号
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="projectNumber"
                                    id="projectNumber"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={projectNumber}
                                    onChange={(e) => setProjectNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-slate-900">
                                場所
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
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
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'on_hold')}
                                >
                                    <option value="active">進行中</option>
                                    <option value="completed">完了</option>
                                    <option value="on_hold">保留中</option>
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
                                    value={contractAmount}
                                    onChange={(e) => setContractAmount(Number(e.target.value))}
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
                                    id="budgetMaterialCost"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={budgetMaterialCost}
                                    onChange={(e) => setBudgetMaterialCost(Number(e.target.value))}
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
                                    id="budgetConstructionCost"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={budgetConstructionCost}
                                    onChange={(e) => setBudgetConstructionCost(Number(e.target.value))}
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
                                    id="budgetOtherCost"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={budgetOtherCost}
                                    onChange={(e) => setBudgetOtherCost(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600 flex gap-6">
                                <span>積算合計: <strong>¥{(budgetMaterialCost + budgetConstructionCost + budgetOtherCost).toLocaleString()}</strong></span>
                                <span>予想粗利: <strong className={(contractAmount - budgetMaterialCost - budgetConstructionCost - budgetOtherCost) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    ¥{(contractAmount - budgetMaterialCost - budgetConstructionCost - budgetOtherCost).toLocaleString()}
                                </strong></span>
                                <span>予想粗利率: <strong className={(contractAmount - budgetMaterialCost - budgetConstructionCost - budgetOtherCost) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {contractAmount > 0 ? (((contractAmount - budgetMaterialCost - budgetConstructionCost - budgetOtherCost) / contractAmount) * 100).toFixed(1) : 0}%
                                </strong></span>
                            </div>
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
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
}
