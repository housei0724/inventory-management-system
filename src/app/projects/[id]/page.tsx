'use client';

import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MonthlyBudget } from '@/types';

function DiffCell({ planned, actual }: { planned: number; actual: number }) {
    const diff = actual - planned;
    if (planned === 0 && actual === 0) return <span className="text-slate-300">-</span>;
    return (
        <span className={diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-slate-500'}>
            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
        </span>
    );
}

export default function ProjectDetailPage() {
    const params = useParams();
    const { projects, monthlyBudgets, addMonthlyBudget, updateMonthlyBudget, deleteMonthlyBudget, orders } = useApp();
    const project = projects.find((p) => p.id === params.id);
    const projectBudgets = monthlyBudgets
        .filter(b => b.projectId === params.id)
        .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

    const projectOrders = orders.filter(o => o.projectId === params.id && o.status !== 'cancelled');
    const monthlyOrderTotals: Record<string, number> = {};
    projectOrders.forEach(order => {
        const month = order.createdAt.slice(0, 7);
        const total = order.items.reduce((sum, item) => sum + (item.quantity * (item.pricePerUnit || 0)), 0);
        monthlyOrderTotals[month] = (monthlyOrderTotals[month] || 0) + total;
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
        notes: '',
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

    // 受注時積算
    const contractAmount = project.contractAmount || 0;
    const budgetMaterialCost = project.budgetMaterialCost || 0;
    const budgetConstructionCost = project.budgetConstructionCost || 0;
    const budgetOtherCost = project.budgetOtherCost || 0;
    const budgetTotal = budgetMaterialCost + budgetConstructionCost + budgetOtherCost;
    const expectedProfit = contractAmount - budgetTotal;
    const expectedProfitRate = contractAmount > 0 ? (expectedProfit / contractAmount) * 100 : null;

    // 実績合計
    const allMonths = Array.from(new Set([
        ...projectBudgets.map(b => b.yearMonth),
        ...Object.keys(monthlyOrderTotals),
    ])).sort();

    const actualMaterialTotal = projectBudgets.reduce((sum, b) => sum + (b.materialCost || 0), 0)
        + Object.values(monthlyOrderTotals).reduce((s, v) => s + v, 0);
    const actualConstructionTotal = projectBudgets.reduce((sum, b) => sum + (b.constructionCost || 0), 0);
    const actualOtherTotal = projectBudgets.reduce((sum, b) => sum + (b.otherCost || 0), 0);
    const actualTotal = actualMaterialTotal + actualConstructionTotal + actualOtherTotal;
    const actualBillingTotal = projectBudgets.reduce((sum, b) => sum + (b.billingAmount || 0), 0);
    const actualProfit = actualBillingTotal - actualTotal;
    const actualProfitRate = actualBillingTotal > 0 ? (actualProfit / actualBillingTotal) * 100 : null;

    // 月次合計
    const totalMaterialCost = actualMaterialTotal;
    const totalConstructionCost = actualConstructionTotal;
    const totalOtherCost = actualOtherTotal;
    const totalSpent = actualTotal;
    const totalBilling = actualBillingTotal;

    const handleAddBudget = async () => {
        if (!newBudget.yearMonth) return;
        await addMonthlyBudget({
            projectId: project.id,
            yearMonth: newBudget.yearMonth!,
            materialCost: Number(newBudget.materialCost) || 0,
            constructionCost: Number(newBudget.constructionCost) || 0,
            otherCost: Number(newBudget.otherCost) || 0,
            billingAmount: Number(newBudget.billingAmount) || 0,
            notes: newBudget.notes || '',
        });
        setIsAddingBudget(false);
        setNewBudget({
            yearMonth: new Date().toISOString().slice(0, 7),
            materialCost: 0,
            constructionCost: 0,
            otherCost: 0,
            billingAmount: 0,
            notes: '',
        });
    };

    const handleUpdateBudget = async (id: string) => {
        await updateMonthlyBudget(id, {
            yearMonth: editForm.yearMonth,
            materialCost: Number(editForm.materialCost) || 0,
            constructionCost: Number(editForm.constructionCost) || 0,
            otherCost: Number(editForm.otherCost) || 0,
            billingAmount: Number(editForm.billingAmount) || 0,
            notes: editForm.notes,
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
                    <Edit className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" />
                    編集
                </Link>
            </div>

            {/* 受注予算 vs 実績サマリー */}
            <div className="rounded-lg bg-white shadow overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-700">予算 vs 実績サマリー</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">項目</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-indigo-600 uppercase">受注時積算</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-orange-500 uppercase">実績</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">差異</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="px-4 py-2 text-slate-600">材料費</td>
                                <td className="px-4 py-2 text-right text-indigo-700">¥{budgetMaterialCost.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-orange-600">¥{actualMaterialTotal.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right font-medium"><DiffCell planned={budgetMaterialCost} actual={actualMaterialTotal} /></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-slate-600">工事費</td>
                                <td className="px-4 py-2 text-right text-indigo-700">¥{budgetConstructionCost.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-orange-600">¥{actualConstructionTotal.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right font-medium"><DiffCell planned={budgetConstructionCost} actual={actualConstructionTotal} /></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-slate-600">その他費</td>
                                <td className="px-4 py-2 text-right text-indigo-700">¥{budgetOtherCost.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-orange-600">¥{actualOtherTotal.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right font-medium"><DiffCell planned={budgetOtherCost} actual={actualOtherTotal} /></td>
                            </tr>
                            <tr className="font-semibold bg-slate-50">
                                <td className="px-4 py-2 text-slate-700">支出合計</td>
                                <td className="px-4 py-2 text-right text-indigo-700">¥{budgetTotal.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-orange-600">¥{actualTotal.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right"><DiffCell planned={budgetTotal} actual={actualTotal} /></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 text-slate-600">受注金額 / 請求済</td>
                                <td className="px-4 py-2 text-right text-slate-700 font-medium">¥{contractAmount.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-slate-500">¥{actualBillingTotal.toLocaleString()}</td>
                                <td className="px-4 py-2"></td>
                            </tr>
                            <tr className="font-bold bg-indigo-50">
                                <td className="px-4 py-3 text-slate-700">粗利</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        ¥{expectedProfit.toLocaleString()}
                                        {expectedProfitRate !== null && <span className="ml-1 text-xs">({expectedProfitRate.toFixed(1)}%)</span>}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={actualProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        ¥{actualProfit.toLocaleString()}
                                        {actualProfitRate !== null && (
                                            <span className="ml-1 text-xs inline-flex items-center gap-0.5">
                                                {actualProfitRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {actualProfitRate.toFixed(1)}%
                                            </span>
                                        )}
                                    </span>
                                </td>
                                <td className="px-4 py-3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 月次実績テーブル */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">月次実績管理</h3>
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
                            {/* 新規追加行 */}
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
                                        <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newBudget.materialCost} onChange={(e) => setNewBudget({ ...newBudget, materialCost: Number(e.target.value) })} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newBudget.constructionCost} onChange={(e) => setNewBudget({ ...newBudget, constructionCost: Number(e.target.value) })} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newBudget.otherCost} onChange={(e) => setNewBudget({ ...newBudget, otherCost: Number(e.target.value) })} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                        ¥{(Number(newBudget.materialCost || 0) + Number(newBudget.constructionCost || 0) + Number(newBudget.otherCost || 0)).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                        <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newBudget.billingAmount} onChange={(e) => setNewBudget({ ...newBudget, billingAmount: Number(e.target.value) })} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                        {(() => {
                                            const spent = Number(newBudget.materialCost || 0) + Number(newBudget.constructionCost || 0) + Number(newBudget.otherCost || 0);
                                            const billing = Number(newBudget.billingAmount || 0);
                                            if (billing === 0) return <span className="text-slate-400">-</span>;
                                            const rate = ((billing - spent) / billing) * 100;
                                            return <span className={rate >= 0 ? 'text-green-600' : 'text-red-600'}>{rate.toFixed(1)}%</span>;
                                        })()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <input type="text" className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newBudget.notes} onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })} />
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button onClick={handleAddBudget} className="text-indigo-600 hover:text-indigo-900 mr-2">保存</button>
                                        <button onClick={() => setIsAddingBudget(false)} className="text-slate-600 hover:text-slate-900">取消</button>
                                    </td>
                                </tr>
                            )}

                            {/* 既存行 */}
                            {allMonths.map((month) => {
                                const budget = projectBudgets.find(b => b.yearMonth === month);
                                const orderTotal = monthlyOrderTotals[month] || 0;
                                const hasBudget = !!budget;

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
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-slate-900">¥{orderTotal.toLocaleString()}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥0</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-400">-</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                <span className="text-xs text-indigo-600">発注データのみ存在</span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => { setNewBudget({ ...newBudget, yearMonth: month }); setIsAddingBudget(true); }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }

                                const actualMat = (budget.materialCost || 0) + orderTotal;
                                const actualCon = budget.constructionCost || 0;
                                const actualOth = budget.otherCost || 0;
                                const spent = actualMat + actualCon + actualOth;
                                const billing = budget.billingAmount || 0;
                                const profitRate = billing > 0 ? ((billing - spent) / billing) * 100 : null;

                                return (
                                    <tr key={budget.id}>
                                        {isEditingBudget === budget.id ? (
                                            <>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <input type="month" className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.yearMonth} onChange={(e) => setEditForm({ ...editForm, yearMonth: e.target.value })} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.materialCost} onChange={(e) => setEditForm({ ...editForm, materialCost: Number(e.target.value) })} placeholder="手動入力分" />
                                                        {orderTotal > 0 && <span className="text-xs text-slate-500">+ 発注: ¥{orderTotal.toLocaleString()}</span>}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.constructionCost} onChange={(e) => setEditForm({ ...editForm, constructionCost: Number(e.target.value) })} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.otherCost} onChange={(e) => setEditForm({ ...editForm, otherCost: Number(e.target.value) })} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    ¥{(Number(editForm.materialCost || 0) + orderTotal + Number(editForm.constructionCost || 0) + Number(editForm.otherCost || 0)).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                                                    <input type="number" className="block w-full rounded-md border-0 py-1.5 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.billingAmount} onChange={(e) => setEditForm({ ...editForm, billingAmount: Number(e.target.value) })} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    {(() => {
                                                        const s = Number(editForm.materialCost || 0) + orderTotal + Number(editForm.constructionCost || 0) + Number(editForm.otherCost || 0);
                                                        const b = Number(editForm.billingAmount || 0);
                                                        if (b === 0) return <span className="text-slate-400">-</span>;
                                                        const rate = ((b - s) / b) * 100;
                                                        return <span className={rate >= 0 ? 'text-green-600' : 'text-red-600'}>{rate.toFixed(1)}%</span>;
                                                    })()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <input type="text" className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button onClick={() => handleUpdateBudget(budget.id)} className="text-indigo-600 hover:text-indigo-900 mr-2">保存</button>
                                                    <button onClick={() => setIsEditingBudget(null)} className="text-slate-600 hover:text-slate-900">取消</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">{budget.yearMonth}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                                                    <div className="flex flex-col items-end">
                                                        <span>¥{actualMat.toLocaleString()}</span>
                                                        {orderTotal > 0 && <span className="text-xs text-slate-400">(手動: ¥{budget.materialCost.toLocaleString()} / 発注: ¥{orderTotal.toLocaleString()})</span>}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{actualCon.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{actualOth.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-slate-900">¥{spent.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">¥{billing.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                                    {profitRate === null ? <span className="text-slate-400">-</span> : (
                                                        <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 max-w-xs truncate">{budget.notes}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button onClick={() => startEdit(budget)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteBudget(budget.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}

                            {/* 合計行 */}
                            <tr className="bg-slate-50 font-bold">
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">合計</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalMaterialCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalConstructionCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalOtherCost.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalSpent.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-900">¥{totalBilling.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-bold">
                                    {totalBilling === 0 ? <span className="text-slate-400">-</span> : (
                                        <span className={actualProfitRate! >= 0 ? 'text-green-600' : 'text-red-600'}>{actualProfitRate!.toFixed(1)}%</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500"></td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"></td>
                            </tr>
                        </tbody>
                    </table>
                    {allMonths.length === 0 && !isAddingBudget && (
                        <div className="py-12 text-center text-sm text-slate-500">
                            まだデータがありません。「月次データ追加」から入力してください。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
