'use client';

import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MonthlyBudget } from '@/types';

export default function ProjectDetailPage() {
    const params = useParams();
    const { projects, monthlyBudgets, addMonthlyBudget, updateMonthlyBudget, deleteMonthlyBudget, orders } = useApp();
    const project = projects.find((p) => p.id === params.id);
    const projectBudgets = monthlyBudgets.filter(b => b.projectId === params.id).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

    // Filter orders for this project
    const projectOrders = orders.filter(o => o.projectId === params.id && o.status !== 'cancelled');

    // Calculate monthly order totals
    const monthlyOrderTotals: Record<string, number> = {};
    projectOrders.forEach(order => {
        const month = order.createdAt.slice(0, 7); // YYYY-MM
        const orderTotal = order.items.reduce((sum, item) => sum + (item.quantity * (item.pricePerUnit || 0)), 0);
        monthlyOrderTotals[month] = (monthlyOrderTotals[month] || 0) + orderTotal;
    });

    const [isEditingBudget, setIsEditingBudget] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<MonthlyBudget>>({});
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState<Partial<MonthlyBudget>>({
        yearMonth: new Date().toISOString().slice(0, 7),
        materialCost: 0,
        constructionCost: 0,
        otherCost: 0,
        billingAmount: 0,
        notes: ''
    });

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

    // Calculations
    // Get all unique months from both budgets and orders
    const allMonths = Array.from(new Set([
        ...projectBudgets.map(b => b.yearMonth),
        ...Object.keys(monthlyOrderTotals)
    ])).sort();

    const totalMaterialCost = allMonths.reduce((sum, month) => {
        const budget = projectBudgets.find(b => b.yearMonth === month);
        const budgetMaterial = budget?.materialCost || 0;
        const orderMaterial = monthlyOrderTotals[month] || 0;
        return sum + budgetMaterial + orderMaterial;
    }, 0);

    const totalConstructionCost = projectBudgets.reduce((sum, b) => sum + (b.constructionCost || 0), 0);
    const totalOtherCost = projectBudgets.reduce((sum, b) => sum + (b.otherCost || 0), 0);
    const totalSpent = totalMaterialCost + totalConstructionCost + totalOtherCost;
    const totalBilling = projectBudgets.reduce((sum, b) => sum + (b.billingAmount || 0), 0);
    const contractAmount = project.contractAmount || 0;
    const remainingBudget = contractAmount - totalSpent;
    
    // 受注残額（受注金額 - 請求金額合計）
    const remainingContractAmount = contractAmount - totalBilling;
    // 25%利益確保時の残予算（受注金額の75% - 支出合計）
    const budgetWith25PercentProfit = (contractAmount * 0.75) - totalSpent;

    const handleAddBudget = async () => {
        if (!newBudget.yearMonth) return;
        await addMonthlyBudget({
            projectId: project.id,
            yearMonth: newBudget.yearMonth,
            materialCost: Number(newBudget.materialCost) || 0,
            constructionCost: Number(newBudget.constructionCost) || 0,
            otherCost: Number(newBudget.otherCost) || 0,
            billingAmount: Number(newBudget.billingAmount) || 0,
            notes: newBudget.notes || ''
        });
        setIsAddingBudget(false);
        setNewBudget({
            yearMonth: new Date().toISOString().slice(0, 7),
            materialCost: 0,
            constructionCost: 0,
            otherCost: 0,
            billingAmount: 0,
            notes: ''
        });
    };

    const handleUpdateBudget = async (id: string) => {
        await updateMonthlyBudget(id, {
            yearMonth: editForm.yearMonth,
            materialCost: Number(editForm.materialCost) || 0,
            constructionCost: Number(editForm.constructionCost) || 0,
            otherCost: Number(editForm.otherCost) || 0,
            billingAmount: Number(editForm.billingAmount) || 0,
            notes: editForm.notes
        });
        setIsEditingBudget(null);
    };

    const handleDeleteBudget = async (id: string) => {
        if (confirm('この月の予算データを削除してもよろしいですか？')) {
            await deleteMonthlyBudget(id);
        }
    };

    const startEdit = (budget: MonthlyBudget) => {
        setIsEditingBudget(budget.id);
        setEditForm({ ...budget });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/projects" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                        <p className="text-sm text-slate-500">{project.projectNumber}</p>
                    </div>
                </div>
                <Link
                    href={`/projects/${project.id}/edit`}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                >
                    <Edit className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                    編集
                </Link>
            </div>

            {/* Budget Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="rounded-md bg-indigo-500 p-3">
                                    <span className="text-white font-bold text-xl">¥</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">受注金額</dt>
                                    <dd className="text-lg font-medium text-slate-900">¥{contractAmount.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="rounded-md bg-cyan-500 p-3">
                                    <span className="text-white font-bold text-xl">¥</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">受注残額</dt>
                                    <dd className="text-lg font-medium text-slate-900">¥{remainingContractAmount.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="rounded-md bg-orange-500 p-3">
                                    <span className="text-white font-bold text-xl">¥</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">支出合計</dt>
                                    <dd className="text-lg font-medium text-slate-900">¥{totalSpent.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`rounded-md p-3 ${remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                    <span className="text-white font-bold text-xl">¥</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500">予算残額</dt>
                                    <dd className={`text-lg font-medium ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ¥{remainingBudget.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`rounded-md p-3 ${budgetWith25PercentProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}>
                                    <span className="text-white font-bold text-xl">¥</span>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-slate-500" title="25%利益確保時予算残額">25%利益時予算残額</dt>
                                    <dd className={`text-lg font-medium ${budgetWith25PercentProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ¥{budgetWith25PercentProfit.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Budget Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">月次予算管理</h3>
                    {!isAddingBudget && (
                        <button
                            onClick={() => setIsAddingBudget(true)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            月次データ追加
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">年月</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">材料費</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">工事費</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">その他経費</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">支出計</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">請求金額</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">利益率</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">備考</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {/* Add New Row */}
                            {isAddingBudget && (
                                <tr className="bg-indigo-50">
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <input
                                            type="month"
                                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.yearMonth}
                                            onChange={(e) => setNewBudget({ ...newBudget, yearMonth: e.target.value })}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input
                                            type="number"
                                            className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.materialCost}
                                            onChange={(e) => setNewBudget({ ...newBudget, materialCost: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input
                                            type="number"
                                            className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.constructionCost}
                                            onChange={(e) => setNewBudget({ ...newBudget, constructionCost: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input
                                            type="number"
                                            className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.otherCost}
                                            onChange={(e) => setNewBudget({ ...newBudget, otherCost: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                        ¥{(Number(newBudget.materialCost || 0) + Number(newBudget.constructionCost || 0) + Number(newBudget.otherCost || 0)).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input
                                            type="number"
                                            className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.billingAmount}
                                            onChange={(e) => setNewBudget({ ...newBudget, billingAmount: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                        {(() => {
                                            const spent = Number(newBudget.materialCost || 0) + Number(newBudget.constructionCost || 0) + Number(newBudget.otherCost || 0);
                                            const billing = Number(newBudget.billingAmount || 0);
                                            if (billing === 0) return <span className="text-slate-400">-</span>;
                                            const profitRate = ((billing - spent) / billing) * 100;
                                            return <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>;
                                        })()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={newBudget.notes}
                                            onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
                                        />
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button onClick={handleAddBudget} className="text-indigo-600 hover:text-indigo-900 mr-2">保存</button>
                                        <button onClick={() => setIsAddingBudget(false)} className="text-slate-600 hover:text-slate-900">取消</button>
                                    </td>
                                </tr>
                            )}

                            {/* Existing Rows & Order Only Rows */}
                            {allMonths.map((month) => {
                                const budget = projectBudgets.find(b => b.yearMonth === month);
                                const orderTotal = monthlyOrderTotals[month] || 0;
                                const hasBudget = !!budget;

                                // If no budget entry exists but there are orders, show a read-only row or a row that allows adding budget
                                if (!hasBudget) {
                                    return (
                                        <tr key={`order-only-${month}`}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">{month}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                                                <div className="flex flex-col items-end">
                                                    <span>¥{orderTotal.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400">(発注: ¥{orderTotal.toLocaleString()})</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥0</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥0</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-slate-900">
                                                ¥{orderTotal.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥0</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-400">-</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                <span className="text-xs text-indigo-600">発注データのみ存在</span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => {
                                                        setNewBudget({
                                                            ...newBudget,
                                                            yearMonth: month,
                                                        });
                                                        setIsAddingBudget(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }

                                // Existing budget row
                                return (
                                    <tr key={budget!.id}>
                                        {isEditingBudget === budget!.id ? (
                                            <>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <input
                                                        type="month"
                                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        value={editForm.yearMonth}
                                                        onChange={(e) => setEditForm({ ...editForm, yearMonth: e.target.value })}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <input
                                                            type="number"
                                                            className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                            value={editForm.materialCost}
                                                            onChange={(e) => setEditForm({ ...editForm, materialCost: Number(e.target.value) })}
                                                            placeholder="手動入力分"
                                                        />
                                                        {orderTotal > 0 && (
                                                            <span className="text-xs text-slate-500">+ 発注: ¥{orderTotal.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        value={editForm.constructionCost}
                                                        onChange={(e) => setEditForm({ ...editForm, constructionCost: Number(e.target.value) })}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        value={editForm.otherCost}
                                                        onChange={(e) => setEditForm({ ...editForm, otherCost: Number(e.target.value) })}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    ¥{(Number(editForm.materialCost || 0) + orderTotal + Number(editForm.constructionCost || 0) + Number(editForm.otherCost || 0)).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        value={editForm.billingAmount}
                                                        onChange={(e) => setEditForm({ ...editForm, billingAmount: Number(e.target.value) })}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    {(() => {
                                                        const spent = Number(editForm.materialCost || 0) + orderTotal + Number(editForm.constructionCost || 0) + Number(editForm.otherCost || 0);
                                                        const billing = Number(editForm.billingAmount || 0);
                                                        if (billing === 0) return <span className="text-slate-400">-</span>;
                                                        const profitRate = ((billing - spent) / billing) * 100;
                                                        return <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>;
                                                    })()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <input
                                                        type="text"
                                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                        value={editForm.notes}
                                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                    />
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button onClick={() => handleUpdateBudget(budget!.id)} className="text-indigo-600 hover:text-indigo-900 mr-2">保存</button>
                                                    <button onClick={() => setIsEditingBudget(null)} className="text-slate-600 hover:text-slate-900">取消</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">{budget!.yearMonth}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                                                    <div className="flex flex-col items-end">
                                                        <span>¥{(budget!.materialCost + orderTotal).toLocaleString()}</span>
                                                        {orderTotal > 0 && (
                                                            <span className="text-xs text-slate-400">
                                                                (手動: ¥{budget!.materialCost.toLocaleString()} / 発注: ¥{orderTotal.toLocaleString()})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{budget!.constructionCost.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{budget!.otherCost.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-slate-900">
                                                    ¥{(budget!.materialCost + orderTotal + budget!.constructionCost + budget!.otherCost).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{budget!.billingAmount.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    {(() => {
                                                        const spent = budget!.materialCost + orderTotal + budget!.constructionCost + budget!.otherCost;
                                                        const billing = budget!.billingAmount;
                                                        if (billing === 0) return <span className="text-slate-400">-</span>;
                                                        const profitRate = ((billing - spent) / billing) * 100;
                                                        return <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>;
                                                    })()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 max-w-xs truncate">{budget!.notes}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button onClick={() => startEdit(budget!)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteBudget(budget!.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                            {/* Total Row */}
                            <tr className="bg-slate-50 font-bold">
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">合計</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalMaterialCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalConstructionCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalOtherCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalSpent.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalBilling.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-bold">
                                    {(() => {
                                        if (totalBilling === 0) return <span className="text-slate-400">-</span>;
                                        const profitRate = ((totalBilling - totalSpent) / totalBilling) * 100;
                                        return <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>;
                                    })()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500"></td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
