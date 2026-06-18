'use client';

import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MonthlyBudget } from '@/types';

type BudgetFormData = {
    yearMonth: string;
    plannedMaterialCost: number;
    plannedConstructionCost: number;
    plannedOtherCost: number;
    plannedBillingAmount: number;
    materialCost: number;
    constructionCost: number;
    otherCost: number;
    billingAmount: number;
    notes: string;
};

const emptyForm = (): BudgetFormData => ({
    yearMonth: new Date().toISOString().slice(0, 7),
    plannedMaterialCost: 0,
    plannedConstructionCost: 0,
    plannedOtherCost: 0,
    plannedBillingAmount: 0,
    materialCost: 0,
    constructionCost: 0,
    otherCost: 0,
    billingAmount: 0,
    notes: '',
});

function DiffCell({ planned, actual }: { planned: number; actual: number }) {
    const diff = actual - planned;
    if (planned === 0 && actual === 0) return <span className="text-slate-300">-</span>;
    return (
        <span className={diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-slate-500'}>
            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
        </span>
    );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <input
            type="number"
            className="block w-24 rounded-md border-0 py-1 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
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
    const [editForm, setEditForm] = useState<BudgetFormData>(emptyForm());
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState<BudgetFormData>(emptyForm());

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

    // 月次計画合計
    const plannedMaterialTotal = projectBudgets.reduce((sum, b) => sum + (b.plannedMaterialCost || 0), 0);
    const plannedConstructionTotal = projectBudgets.reduce((sum, b) => sum + (b.plannedConstructionCost || 0), 0);
    const plannedOtherTotal = projectBudgets.reduce((sum, b) => sum + (b.plannedOtherCost || 0), 0);
    const plannedTotal = plannedMaterialTotal + plannedConstructionTotal + plannedOtherTotal;
    const plannedBillingTotal = projectBudgets.reduce((sum, b) => sum + (b.plannedBillingAmount || 0), 0);

    const handleAddBudget = async () => {
        if (!newBudget.yearMonth) return;
        await addMonthlyBudget({
            projectId: project.id,
            yearMonth: newBudget.yearMonth,
            plannedMaterialCost: newBudget.plannedMaterialCost,
            plannedConstructionCost: newBudget.plannedConstructionCost,
            plannedOtherCost: newBudget.plannedOtherCost,
            plannedBillingAmount: newBudget.plannedBillingAmount,
            materialCost: newBudget.materialCost,
            constructionCost: newBudget.constructionCost,
            otherCost: newBudget.otherCost,
            billingAmount: newBudget.billingAmount,
            notes: newBudget.notes,
        });
        setIsAddingBudget(false);
        setNewBudget(emptyForm());
    };

    const handleUpdateBudget = async (id: string) => {
        await updateMonthlyBudget(id, {
            yearMonth: editForm.yearMonth,
            plannedMaterialCost: editForm.plannedMaterialCost,
            plannedConstructionCost: editForm.plannedConstructionCost,
            plannedOtherCost: editForm.plannedOtherCost,
            plannedBillingAmount: editForm.plannedBillingAmount,
            materialCost: editForm.materialCost,
            constructionCost: editForm.constructionCost,
            otherCost: editForm.otherCost,
            billingAmount: editForm.billingAmount,
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
        setEditForm({
            yearMonth: budget.yearMonth,
            plannedMaterialCost: budget.plannedMaterialCost || 0,
            plannedConstructionCost: budget.plannedConstructionCost || 0,
            plannedOtherCost: budget.plannedOtherCost || 0,
            plannedBillingAmount: budget.plannedBillingAmount || 0,
            materialCost: budget.materialCost || 0,
            constructionCost: budget.constructionCost || 0,
            otherCost: budget.otherCost || 0,
            billingAmount: budget.billingAmount || 0,
            notes: budget.notes || '',
        });
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
                                <td className="px-4 py-2 text-slate-600">受注金額</td>
                                <td className="px-4 py-2 text-right text-slate-700 font-medium">¥{contractAmount.toLocaleString()}</td>
                                <td className="px-4 py-2 text-right text-slate-500">¥{actualBillingTotal.toLocaleString()}<span className="text-xs ml-1 text-slate-400">(請求済)</span></td>
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
                                            <span className="ml-1 text-xs flex items-center justify-end gap-0.5">
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

            {/* 月次計画 vs 実績テーブル */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 flex justify-between items-center">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">月次管理（計画 vs 実績）</h3>
                    {!isAddingBudget && (
                        <button
                            onClick={() => setIsAddingBudget(true)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                            月次データ追加
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-semibold text-slate-700 border-r border-slate-200">年月</th>
                                <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 border-r border-slate-200 bg-indigo-50">材料費</th>
                                <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 border-r border-slate-200 bg-indigo-50">工事費</th>
                                <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-indigo-600 border-r border-slate-200 bg-indigo-50">その他費</th>
                                <th colSpan={3} className="px-3 py-2 text-center text-xs font-semibold text-slate-700 border-r border-slate-200">支出計</th>
                                <th colSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-slate-700 border-r border-slate-200">請求額</th>
                                <th rowSpan={2} className="px-3 py-2 text-center text-xs font-semibold text-slate-700 border-r border-slate-200">利益率</th>
                                <th rowSpan={2} className="px-3 py-2 text-left text-xs font-semibold text-slate-700 border-r border-slate-200">備考</th>
                                <th rowSpan={2} className="px-3 py-2"></th>
                            </tr>
                            <tr>
                                <th className="px-2 py-1.5 text-center text-xs text-indigo-500 bg-indigo-50">計画</th>
                                <th className="px-2 py-1.5 text-center text-xs text-orange-500 bg-indigo-50">実績</th>
                                <th className="px-2 py-1.5 text-center text-xs text-slate-500 bg-indigo-50 border-r border-slate-200">差異</th>
                                <th className="px-2 py-1.5 text-center text-xs text-indigo-500 bg-indigo-50">計画</th>
                                <th className="px-2 py-1.5 text-center text-xs text-orange-500 bg-indigo-50">実績</th>
                                <th className="px-2 py-1.5 text-center text-xs text-slate-500 bg-indigo-50 border-r border-slate-200">差異</th>
                                <th className="px-2 py-1.5 text-center text-xs text-indigo-500 bg-indigo-50">計画</th>
                                <th className="px-2 py-1.5 text-center text-xs text-orange-500 bg-indigo-50">実績</th>
                                <th className="px-2 py-1.5 text-center text-xs text-slate-500 bg-indigo-50 border-r border-slate-200">差異</th>
                                <th className="px-2 py-1.5 text-center text-xs text-indigo-500">計画</th>
                                <th className="px-2 py-1.5 text-center text-xs text-orange-500">実績</th>
                                <th className="px-2 py-1.5 text-center text-xs text-slate-500 border-r border-slate-200">差異</th>
                                <th className="px-2 py-1.5 text-center text-xs text-indigo-500">計画</th>
                                <th className="px-2 py-1.5 text-center text-xs text-orange-500 border-r border-slate-200">実績</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {/* 新規追加行 */}
                            {isAddingBudget && (
                                <tr className="bg-indigo-50">
                                    <td className="px-2 py-3 border-r border-slate-200">
                                        <input type="month" className="block w-28 rounded border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 text-xs" value={newBudget.yearMonth} onChange={e => setNewBudget({ ...newBudget, yearMonth: e.target.value })} />
                                    </td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.plannedMaterialCost} onChange={v => setNewBudget({ ...newBudget, plannedMaterialCost: v })} /></td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.materialCost} onChange={v => setNewBudget({ ...newBudget, materialCost: v })} /></td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={newBudget.plannedMaterialCost} actual={newBudget.materialCost} /></td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.plannedConstructionCost} onChange={v => setNewBudget({ ...newBudget, plannedConstructionCost: v })} /></td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.constructionCost} onChange={v => setNewBudget({ ...newBudget, constructionCost: v })} /></td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={newBudget.plannedConstructionCost} actual={newBudget.constructionCost} /></td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.plannedOtherCost} onChange={v => setNewBudget({ ...newBudget, plannedOtherCost: v })} /></td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.otherCost} onChange={v => setNewBudget({ ...newBudget, otherCost: v })} /></td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={newBudget.plannedOtherCost} actual={newBudget.otherCost} /></td>
                                    <td className="px-2 py-3 text-right text-xs">
                                        ¥{(newBudget.plannedMaterialCost + newBudget.plannedConstructionCost + newBudget.plannedOtherCost).toLocaleString()}
                                    </td>
                                    <td className="px-2 py-3 text-right text-xs">
                                        ¥{(newBudget.materialCost + newBudget.constructionCost + newBudget.otherCost).toLocaleString()}
                                    </td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200">
                                        <DiffCell planned={newBudget.plannedMaterialCost + newBudget.plannedConstructionCost + newBudget.plannedOtherCost} actual={newBudget.materialCost + newBudget.constructionCost + newBudget.otherCost} />
                                    </td>
                                    <td className="px-1 py-3"><NumberInput value={newBudget.plannedBillingAmount} onChange={v => setNewBudget({ ...newBudget, plannedBillingAmount: v })} /></td>
                                    <td className="px-1 py-3 border-r border-slate-200"><NumberInput value={newBudget.billingAmount} onChange={v => setNewBudget({ ...newBudget, billingAmount: v })} /></td>
                                    <td className="px-2 py-3 text-center text-xs text-slate-400 border-r border-slate-200">-</td>
                                    <td className="px-2 py-3">
                                        <input type="text" className="block w-20 rounded border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 text-xs" value={newBudget.notes} onChange={e => setNewBudget({ ...newBudget, notes: e.target.value })} />
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <button onClick={handleAddBudget} className="text-indigo-600 hover:text-indigo-900 text-xs mr-2 font-medium">保存</button>
                                        <button onClick={() => setIsAddingBudget(false)} className="text-slate-500 hover:text-slate-700 text-xs">取消</button>
                                    </td>
                                </tr>
                            )}

                            {/* 既存行 */}
                            {allMonths.map((month) => {
                                const budget = projectBudgets.find(b => b.yearMonth === month);
                                const orderTotal = monthlyOrderTotals[month] || 0;

                                if (!budget) {
                                    // 発注データのみ
                                    return (
                                        <tr key={`order-${month}`} className="text-xs">
                                            <td className="px-3 py-3 text-slate-700 font-medium border-r border-slate-200">{month}</td>
                                            <td className="px-2 py-3 text-right text-slate-300">-</td>
                                            <td className="px-2 py-3 text-right text-orange-500">¥{orderTotal.toLocaleString()}<span className="text-xs text-slate-400 ml-0.5">(発注)</span></td>
                                            <td className="px-2 py-3 border-r border-slate-200"></td>
                                            <td colSpan={3} className="px-2 py-3 text-slate-300 text-center border-r border-slate-200">-</td>
                                            <td colSpan={3} className="px-2 py-3 text-slate-300 text-center border-r border-slate-200">-</td>
                                            <td colSpan={3} className="px-2 py-3 text-slate-300 text-center border-r border-slate-200">-</td>
                                            <td colSpan={2} className="px-2 py-3 text-slate-300 text-center border-r border-slate-200">-</td>
                                            <td className="px-2 py-3 text-slate-400 text-center border-r border-slate-200">-</td>
                                            <td className="px-2 py-3 text-indigo-500 text-xs">発注データのみ</td>
                                            <td className="px-2 py-3 whitespace-nowrap">
                                                <button onClick={() => { setNewBudget({ ...emptyForm(), yearMonth: month }); setIsAddingBudget(true); }} className="text-indigo-600 hover:text-indigo-900">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }

                                const actualMat = (budget.materialCost || 0) + orderTotal;
                                const actualCon = budget.constructionCost || 0;
                                const actualOth = budget.otherCost || 0;
                                const planMat = budget.plannedMaterialCost || 0;
                                const planCon = budget.plannedConstructionCost || 0;
                                const planOth = budget.plannedOtherCost || 0;
                                const planTotal = planMat + planCon + planOth;
                                const actualSpentTotal = actualMat + actualCon + actualOth;
                                const billing = budget.billingAmount || 0;
                                const profitRate = billing > 0 ? ((billing - actualSpentTotal) / billing) * 100 : null;

                                if (isEditingBudget === budget.id) {
                                    const editActualMat = (editForm.materialCost || 0) + orderTotal;
                                    return (
                                        <tr key={budget.id} className="bg-amber-50 text-xs">
                                            <td className="px-2 py-3 border-r border-slate-200">
                                                <input type="month" className="block w-28 rounded border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 text-xs" value={editForm.yearMonth} onChange={e => setEditForm({ ...editForm, yearMonth: e.target.value })} />
                                            </td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.plannedMaterialCost} onChange={v => setEditForm({ ...editForm, plannedMaterialCost: v })} /></td>
                                            <td className="px-1 py-3">
                                                <NumberInput value={editForm.materialCost} onChange={v => setEditForm({ ...editForm, materialCost: v })} />
                                                {orderTotal > 0 && <div className="text-xs text-slate-400 mt-0.5">+発注¥{orderTotal.toLocaleString()}</div>}
                                            </td>
                                            <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={editForm.plannedMaterialCost} actual={editActualMat} /></td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.plannedConstructionCost} onChange={v => setEditForm({ ...editForm, plannedConstructionCost: v })} /></td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.constructionCost} onChange={v => setEditForm({ ...editForm, constructionCost: v })} /></td>
                                            <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={editForm.plannedConstructionCost} actual={editForm.constructionCost} /></td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.plannedOtherCost} onChange={v => setEditForm({ ...editForm, plannedOtherCost: v })} /></td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.otherCost} onChange={v => setEditForm({ ...editForm, otherCost: v })} /></td>
                                            <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={editForm.plannedOtherCost} actual={editForm.otherCost} /></td>
                                            <td className="px-2 py-3 text-right">¥{(editForm.plannedMaterialCost + editForm.plannedConstructionCost + editForm.plannedOtherCost).toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right">¥{(editActualMat + editForm.constructionCost + editForm.otherCost).toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={editForm.plannedMaterialCost + editForm.plannedConstructionCost + editForm.plannedOtherCost} actual={editActualMat + editForm.constructionCost + editForm.otherCost} /></td>
                                            <td className="px-1 py-3"><NumberInput value={editForm.plannedBillingAmount} onChange={v => setEditForm({ ...editForm, plannedBillingAmount: v })} /></td>
                                            <td className="px-1 py-3 border-r border-slate-200"><NumberInput value={editForm.billingAmount} onChange={v => setEditForm({ ...editForm, billingAmount: v })} /></td>
                                            <td className="px-2 py-3 text-center border-r border-slate-200 text-slate-400">-</td>
                                            <td className="px-2 py-3">
                                                <input type="text" className="block w-20 rounded border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 text-xs" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                                            </td>
                                            <td className="px-2 py-3 whitespace-nowrap">
                                                <button onClick={() => handleUpdateBudget(budget.id)} className="text-indigo-600 hover:text-indigo-900 text-xs mr-2 font-medium">保存</button>
                                                <button onClick={() => setIsEditingBudget(null)} className="text-slate-500 hover:text-slate-700 text-xs">取消</button>
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={budget.id} className="hover:bg-slate-50 text-xs">
                                        <td className="px-3 py-3 text-slate-700 font-medium border-r border-slate-200 whitespace-nowrap">{budget.yearMonth}</td>
                                        <td className="px-2 py-3 text-right text-indigo-600">¥{planMat.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right text-orange-500">
                                            ¥{actualMat.toLocaleString()}
                                            {orderTotal > 0 && <div className="text-slate-400">(発注含む)</div>}
                                        </td>
                                        <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={planMat} actual={actualMat} /></td>
                                        <td className="px-2 py-3 text-right text-indigo-600">¥{planCon.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right text-orange-500">¥{actualCon.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={planCon} actual={actualCon} /></td>
                                        <td className="px-2 py-3 text-right text-indigo-600">¥{planOth.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right text-orange-500">¥{actualOth.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={planOth} actual={actualOth} /></td>
                                        <td className="px-2 py-3 text-right text-indigo-600 font-medium">¥{planTotal.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right text-orange-500 font-medium">¥{actualSpentTotal.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-r border-slate-200 font-medium"><DiffCell planned={planTotal} actual={actualSpentTotal} /></td>
                                        <td className="px-2 py-3 text-right text-indigo-600">¥{(budget.plannedBillingAmount || 0).toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right text-slate-700 border-r border-slate-200">¥{billing.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center border-r border-slate-200 font-medium">
                                            {profitRate === null ? <span className="text-slate-300">-</span> : (
                                                <span className={profitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{profitRate.toFixed(1)}%</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-3 text-slate-500 max-w-xs truncate">{budget.notes}</td>
                                        <td className="px-2 py-3 whitespace-nowrap">
                                            <button onClick={() => startEdit(budget)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteBudget(budget.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* 合計行 */}
                            {allMonths.length > 0 && (
                                <tr className="bg-slate-100 font-bold text-xs">
                                    <td className="px-3 py-3 text-slate-900 border-r border-slate-200">合計</td>
                                    <td className="px-2 py-3 text-right text-indigo-600">¥{plannedMaterialTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right text-orange-500">¥{actualMaterialTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={plannedMaterialTotal} actual={actualMaterialTotal} /></td>
                                    <td className="px-2 py-3 text-right text-indigo-600">¥{plannedConstructionTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right text-orange-500">¥{actualConstructionTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={plannedConstructionTotal} actual={actualConstructionTotal} /></td>
                                    <td className="px-2 py-3 text-right text-indigo-600">¥{plannedOtherTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right text-orange-500">¥{actualOtherTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={plannedOtherTotal} actual={actualOtherTotal} /></td>
                                    <td className="px-2 py-3 text-right text-indigo-600">¥{plannedTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right text-orange-500">¥{actualTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right border-r border-slate-200"><DiffCell planned={plannedTotal} actual={actualTotal} /></td>
                                    <td className="px-2 py-3 text-right text-indigo-600">¥{plannedBillingTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right text-slate-700 border-r border-slate-200">¥{actualBillingTotal.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-center border-r border-slate-200">
                                        {actualProfitRate === null ? <span className="text-slate-400">-</span> : (
                                            <span className={actualProfitRate >= 0 ? 'text-green-600' : 'text-red-600'}>{actualProfitRate.toFixed(1)}%</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-3"></td>
                                    <td className="px-2 py-3"></td>
                                </tr>
                            )}
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
