'use client';

import { useApp } from '@/context/AppContext';
import { ShoppingCart, Plus, Clock, FileText, HardHat } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { items, orders, suppliers, projects } = useApp();

  // Get recent orders (last 10)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Get pending orders
  const pendingOrders = orders.filter((order) => order.status === 'ordered');

  // Get supplier name
  const getSupplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || 'Unknown';

  // Get project name
  const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name || '-';

  // Get item names for an order (first 2 items + count)
  const getOrderItemSummary = (order: typeof orders[0]) => {
    const itemNames = order.items.map(item => {
      const itemData = items.find(i => i.id === item.itemId);
      return itemData?.name || 'Unknown';
    });
    if (itemNames.length <= 2) {
      return itemNames.join(', ');
    }
    return `${itemNames.slice(0, 2).join(', ')} 他${itemNames.length - 2}件`;
  };

  // Calculate order total
  const getOrderTotal = (order: typeof orders[0]) => {
    return order.items.reduce((sum, item) => sum + (item.quantity * (item.pricePerUnit || 0)), 0);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">ダッシュボード</h2>
        <Link
          href="/orders/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          新規発注作成
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/orders"
          className="overflow-hidden rounded-lg bg-white shadow transition-transform hover:scale-105"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                  <ShoppingCart className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-500">発注残</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{pendingOrders.length}件</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/projects"
          className="overflow-hidden rounded-lg bg-white shadow transition-transform hover:scale-105"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-white">
                  <HardHat className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-500">稼働中現場</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">
                      {projects.filter(p => p.status === 'active').length}件
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/inventory"
          className="overflow-hidden rounded-lg bg-white shadow transition-transform hover:scale-105"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-500 text-white">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-500">登録商品数</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{items.length}件</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-medium leading-6 text-slate-900">最近の発注履歴</h3>
          </div>
          <Link href="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            すべて見る →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">発注履歴がありません</p>
            <Link
              href="/orders/new"
              className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <Plus className="mr-1 h-4 w-4" />
              最初の発注を作成
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    発注番号
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    発注日
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    現場
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    発注先
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    品目
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    金額
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {order.projectId ? getProjectName(order.projectId) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {getSupplierName(order.supplierId)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate" title={getOrderItemSummary(order)}>
                      {getOrderItemSummary(order)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 font-medium">
                      ¥{getOrderTotal(order).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
