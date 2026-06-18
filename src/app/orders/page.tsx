'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Copy, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function OrdersPage() {
    const { orders, suppliers, requesters, projects, items, deleteOrder } = useApp();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const getSupplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || 'Unknown';
    const getRequesterName = (id: string) => requesters.find((r) => r.id === id)?.name || 'Unknown';
    const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name || 'Unknown';
    const getItemName = (id: string) => items.find((i) => i.id === id)?.name || 'Unknown';
    const getItemSku = (id: string) => items.find((i) => i.id === id)?.sku || '';

    // Get item names for an order
    const getOrderItemNames = (order: typeof orders[0]) => {
        return order.items.map(item => {
            const itemData = items.find(i => i.id === item.itemId);
            return itemData ? `${itemData.name} (${itemData.sku})` : 'Unknown';
        }).join(', ');
    };

    // Filter orders by search query (item name or SKU)
    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Check if any item in the order matches the search query
        return order.items.some(orderItem => {
            const item = items.find(i => i.id === orderItem.itemId);
            if (!item) return false;
            return item.name.toLowerCase().includes(query) ||
                item.sku.toLowerCase().includes(query);
        });
    });

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-800',
        ordered: 'bg-blue-100 text-blue-800',
        received: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const statusLabels: Record<string, string> = {
        draft: '下書き',
        ordered: '発注済',
        received: '入荷済',
        cancelled: 'キャンセル',
    };

    const handleCopyOrder = (orderId: string) => {
        router.push(`/orders/new?copyFrom=${orderId}`);
    };

    const handleDelete = async (orderId: string) => {
        if (window.confirm('この発注書を削除してもよろしいですか？')) {
            await deleteOrder(orderId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">発注管理</h2>
                <Link
                    href="/orders/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    新規発注作成
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="品名または規格（SKU）で過去の発注を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {searchQuery && (
                    <p className="mt-2 text-sm text-slate-500">
                        {filteredOrders.length}件の発注が見つかりました
                    </p>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                発注番号
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                品目
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                発注先
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                依頼元
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                作成日
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                ステータス
                            </th>
                            <th scope="col" className="relative px-4 py-3">
                                <span className="sr-only">操作</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                                    {order.orderNumber}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate" title={getOrderItemNames(order)}>
                                    {getOrderItemNames(order)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                                    {getSupplierName(order.supplierId)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                                    {order.projectId ? (
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {getProjectName(order.projectId)}
                                        </span>
                                    ) : (
                                        <span>{order.requesterId ? getRequesterName(order.requesterId) : '-'}</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleCopyOrder(order.id)}
                                            className="text-green-600 hover:text-green-900"
                                            title="この発注を引用して新規作成"
                                        >
                                            <Copy className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="この発注を削除"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900" title="発注書詳細">
                                            <FileText className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
