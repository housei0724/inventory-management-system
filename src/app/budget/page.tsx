'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { useState } from 'react';
import { TrendingUp, TrendingDown, HardHat, BarChart2 } from 'lucide-react';

type ProjectStatus = 'all' | 'active' | 'completed' | 'on_hold';

export default function BudgetPage() {
    const { projects, monthlyBudgets, orders } = useApp();
    const [statusFilter, setStatusFilter] = useState<ProjectStatus>('active');

    const filteredProjects = statusFilter === 'all'
        ? projects
        : projects.filter(p => p.status === statusFilter);

    // Calculate totals per project
    const projectSummaries = filteredProjects.map(project => {
        const budgets = monthlyBudgets.filter(b => b.projectId === project.id);
        const projectOrders = orders.filter(o => o.projectId === project.id && o.status !== 'cancelled');

        const orderTotal = projectOrders.reduce((sum, order) =>
            sum + order.items.reduce((s, item) => s + (item.quantity * (item.pricePerUnit || 0)), 0), 0);

        const materialCost = budgets.reduce((sum, b) => sum + (b.materialCost || 0), 0) + orderTotal;
        const constructionCost = budgets.reduce((sum, b) => sum + (b.constructionCost || 0), 0);
        const otherCost = budgets.reduce((sum, b) => sum + (b.otherCost || 0), 0);
        const totalSpent = materialCost + constructionCost + otherCost;
        const totalBilling = budgets.reduce((sum, b) => sum + (b.billingAmount || 0), 0);
        const contractAmount = project.contractAmount || 0;
        const remainingBudget = contractAmount - totalSpent;
        const remainingContractAmount = contractAmount - totalBilling;
        const budgetWith25PercentProfit = contractAmount * 0.75 - totalSpent;
        const profitRate = totalBilling > 0 ? ((totalBilling - totalSpent) / totalBilling) * 100 : null;

        return {
            project,
            contractAmount,
            materialCost,
            constructionCost,
            otherCost,
            totalSpent,
            totalBilling,
            remainingBudget,
            remainingContractAmount,
            budgetWith25PercentProfit,
            profitRate,
        };
    });

    // Aggregate totals across all displayed projects
    const grandTotal = projectSummaries.reduce((acc, s) => ({
        contractAmount: acc.contractAmount + s.contractAmount,
        totalSpent: acc.totalSpent + s.totalSpent,
        totalBilling: acc.totalBilling + s.totalBilling,
        remainingBudget: acc.remainingBudget + s.remainingBudget,
        remainingContractAmount: acc.remainingContractAmount + s.remainingContractAmount,
        budgetWith25PercentProfit: acc.budgetWith25PercentProfit + s.budgetWith25PercentProfit,
    }), {
        contractAmount: 0,
        totalSpent: 0,
        totalBilling: 0,
        remainingBudget: 0,
        remainingContractAmount: 0,
        budgetWith25PercentProfit: 0,
    });

    const grandProfitRate = grandTotal.totalBilling > 0
        ? ((grandTotal.totalBilling - grandTotal.totalSpent) / grandTotal.totalBilling) * 100
        : null;

    const statusLabels: Record<ProjectStatus, string> = {
        all: 'すべて',
        active: '稼働中',
        completed: '完了',
        on_hold: '保留中',
    };

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-slate-100 text-slate-800',
        on_hold: 'bg-yellow-100 text-yellow-800',
    };

    const statusLabelsProject: Record<string, string> = {
        active: '稼働中',
        completed: '完了',
        on_hold: '保留中',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">予算管理</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">受注金額合計</dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-900">¥{grandTotal.contractAmount.toLocaleString()}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">支出合計</dt>
                        <dd className="mt-1 text-lg font-semibold text-orange-600">¥{grandTotal.totalSpent.toLocaleString()}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">請求金額合計</dt>
                        <dd className="mt-1 text-lg font-semibold text-indigo-600">¥{grandTotal.totalBilling.toLocaleString()}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">予算残額合計</dt>
                        <dd className={`mt-1 text-lg font-semibold ${grandTotal.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ¥{grandTotal.remainingBudget.toLocaleString()}
                        </dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">受注残額合計</dt>
                        <dd className="mt-1 text-lg font-semibold text-cyan-600">¥{grandTotal.remainingContractAmount.toLocaleString()}</dd>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-4">
                        <dt className="truncate text-xs font-medium text-slate-500">総利益率</dt>
                        <dd className={`mt-1 text-lg font-semibold flex items-center gap-1 ${grandProfitRate === null ? 'text-slate-400' : grandProfitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {grandProfitRate === null ? (
                                '-'
                            ) : (
                                <>
                                    {grandProfitRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    {grandProfitRate.toFixed(1)}%
                                </>
                            )}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6">
                    {(['active', 'all', 'completed', 'on_hold'] as ProjectStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                                statusFilter === status
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}
                        >
                            {statusLabels[status]}
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                statusFilter === status ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {status === 'all' ? projects.length : projects.filter(p => p.status === status).length}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Budget Table */}
            {filteredProjects.length === 0 ? (
                <div className="rounded-lg bg-white shadow px-4 py-12 text-center">
                    <HardHat className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">該当するプロジェクトがありません</p>
                    <Link href="/projects/new" className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        プロジェクトを登録する
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">プロジェクト別予算一覧</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">プロジェクト</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ステータス</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">受注金額</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">支出合計</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">請求金額</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">予算残額</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">受注残額</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 whitespace-nowrap">25%利益時残額</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">利益率</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">担当者</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {projectSummaries.map(({ project, contractAmount, totalSpent, totalBilling, remainingBudget, remainingContractAmount, budgetWith25PercentProfit, profitRate }) => (
                                    <tr key={project.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm">
                                            <Link href={`/projects/${project.id}`} className="font-medium text-indigo-600 hover:text-indigo-900">
                                                {project.name}
                                            </Link>
                                            <p className="text-xs text-slate-400">{project.projectNumber}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[project.status]}`}>
                                                {statusLabelsProject[project.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-slate-900 whitespace-nowrap">
                                            {contractAmount > 0 ? `¥${contractAmount.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium whitespace-nowrap">
                                            {totalSpent > 0 ? `¥${totalSpent.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-indigo-600 whitespace-nowrap">
                                            {totalBilling > 0 ? `¥${totalBilling.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium">
                                            {contractAmount > 0 ? (
                                                <span className={remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    ¥{remainingBudget.toLocaleString()}
                                                </span>
                                            ) : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-cyan-600 whitespace-nowrap">
                                            {contractAmount > 0 ? `¥${remainingContractAmount.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium">
                                            {contractAmount > 0 ? (
                                                <span className={budgetWith25PercentProfit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                                                    ¥{budgetWith25PercentProfit.toLocaleString()}
                                                </span>
                                            ) : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-medium">
                                            {profitRate === null ? (
                                                <span className="text-slate-300">-</span>
                                            ) : (
                                                <span className={`flex items-center justify-end gap-1 ${profitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {profitRate >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                    {profitRate.toFixed(1)}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                                            {project.manager || <span className="text-slate-300">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Grand Total Row */}
                            <tfoot>
                                <tr className="bg-slate-100 font-bold">
                                    <td className="px-4 py-3 text-sm text-slate-900">合計</td>
                                    <td className="px-4 py-3 text-sm"></td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-900 whitespace-nowrap">¥{grandTotal.contractAmount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-orange-600 whitespace-nowrap">¥{grandTotal.totalSpent.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-indigo-600 whitespace-nowrap">¥{grandTotal.totalBilling.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-sm text-right whitespace-nowrap ${grandTotal.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ¥{grandTotal.remainingBudget.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-cyan-600 whitespace-nowrap">¥{grandTotal.remainingContractAmount.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-sm text-right whitespace-nowrap ${grandTotal.budgetWith25PercentProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ¥{grandTotal.budgetWith25PercentProfit.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                                        {grandProfitRate === null ? (
                                            <span className="text-slate-400">-</span>
                                        ) : (
                                            <span className={`flex items-center justify-end gap-1 ${grandProfitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {grandProfitRate >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                {grandProfitRate.toFixed(1)}%
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
