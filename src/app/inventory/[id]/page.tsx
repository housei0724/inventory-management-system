'use client';

import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Package, Tag, AlertTriangle } from 'lucide-react';

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { items } = useApp();

    const item = items.find((i) => i.id === id);

    if (!item) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-slate-800">商品が見つかりません</h2>
                <p className="mt-2 text-slate-600">指定されたIDの商品が存在しないか、削除された可能性があります。</p>
                <div className="mt-6">
                    <Link href="/inventory" className="text-indigo-600 hover:text-indigo-900 font-medium">
                        &larr; 在庫一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/inventory"
                        className="inline-flex items-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">{item.name}</h2>
                </div>
                <Link
                    href={`/inventory/${item.id}/edit`}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Edit className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    編集
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Basic Info */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">基本情報</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-slate-500">SKU</dt>
                                <dd className="mt-1 text-sm text-slate-900">{item.sku}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-slate-500">カテゴリ</dt>
                                <dd className="mt-1 text-sm text-slate-900">
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                        {item.category}
                                    </span>
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-slate-500">説明</dt>
                                <dd className="mt-1 text-sm text-slate-900">{item.description || '説明なし'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Stock Info */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">在庫・保管情報</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-slate-500">現在在庫数</dt>
                                <dd className="mt-1 text-2xl font-bold text-slate-900 flex items-baseline">
                                    {item.quantity}
                                    <span className="ml-1 text-sm font-normal text-slate-500">{item.unit}</span>
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-slate-500">最低在庫数 (発注点)</dt>
                                <dd className="mt-1 text-sm text-slate-900 flex items-center">
                                    {item.minStockLevel} {item.unit}
                                    {item.quantity <= item.minStockLevel && (
                                        <span className="ml-2 inline-flex items-center text-xs font-medium text-red-600">
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            在庫不足
                                        </span>
                                    )}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-slate-500">単価</dt>
                                <dd className="mt-1 text-sm text-slate-900 flex items-center">
                                    <Tag className="mr-1.5 h-4 w-4 text-slate-400" />
                                    ¥{item.unitPrice.toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
