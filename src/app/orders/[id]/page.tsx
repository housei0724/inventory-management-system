'use client';

import { useApp } from '@/context/AppContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, Copy, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';

function OrderDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { orders, items, suppliers, projects, updateOrder, deleteOrder } = useApp();

    const order = orders.find((o) => o.id === params.id);
    const [editableItems, setEditableItems] = useState(order?.items || []);

    useEffect(() => {
        if (order) {
            setEditableItems(order.items);

            // Auto-print if query parameter is present (after short delay for render)
            if (searchParams.get('print') === 'true') {
                const timer = setTimeout(() => {
                    window.print();
                    // Remove the print parameter from URL without refreshing the page
                    router.replace(`/orders/${params.id}`);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [order, searchParams, router, params.id]);

    if (!order) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/orders" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">発注が見つかりません</h2>
                </div>
            </div>
        );
    }

    const supplier = suppliers.find((s) => s.id === order.supplierId);
    const project = order.projectId ? projects.find((p) => p.id === order.projectId) : null;

    const handlePrint = () => {
        window.print();
    };

    const handleCopyOrder = () => {
        router.push(`/orders/new?copyFrom=${order.id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('この発注書を削除してもよろしいですか？')) {
            await deleteOrder(order.id);
            router.push('/orders');
        }
    };

    const handlePriceChange = async (index: number, price: number) => {
        const newItems = [...editableItems];
        newItems[index] = { ...newItems[index], pricePerUnit: price };
        setEditableItems(newItems);

        // Update in Firestore
        await updateOrder(order.id, { items: newItems });
    };

    const calculateTotal = () => {
        return editableItems.reduce((total, item) => {
            const price = item.pricePerUnit || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    return (
        <div className="space-y-6">
            {/* Header - Hidden when printing */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-4">
                    <Link href="/orders" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-800">発注書詳細</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        title="この発注を削除"
                    >
                        <Trash2 className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        削除
                    </button>
                    <button
                        onClick={handleCopyOrder}
                        className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        title="この発注を引用して新規作成"
                    >
                        <Copy className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        この発注を引用
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <Printer className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        発注書を印刷
                    </button>
                </div>
            </div>

            {/* Purchase Order Content - Optimized for A5 printing */}
            <div className="rounded-lg bg-white p-6 shadow print:shadow-none print:p-4">
                <div className="border-b-2 border-slate-900 pb-2 mb-4">
                    <h1 className="text-2xl font-bold text-center print:text-xl">発注書</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {/* Left Column - Supplier Info */}
                    <div>
                        <h3 className="text-xs font-medium text-slate-500 mb-1">発注先</h3>
                        <div className="border border-slate-300 p-2 rounded">
                            <p className="font-bold">{supplier?.name || '不明'} 御中</p>
                        </div>
                    </div>

                    {/* Right Column - Order Info */}
                    <div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-500">発注番号:</span>
                                <span className="font-semibold">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-500">発注日:</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('ja-JP')}</span>
                            </div>
                            {order.issuer && (
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium text-slate-500">発行者:</span>
                                    <span>{order.issuer}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="mb-4 border border-slate-300 p-2 rounded text-xs">
                        <h3 className="font-medium text-slate-500 mb-1">工事情報</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-slate-600">現場名: </span>
                                <span className="font-semibold">{project.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-600">工事番号: </span>
                                <span className="font-semibold">{project.projectNumber}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items Table */}
                <div className="mb-4">
                    <h3 className="text-xs font-medium text-slate-500 mb-2">発注品目</h3>
                    <table className="min-w-full border border-slate-300 text-xs">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="border border-slate-300 px-2 py-1 text-left font-semibold">No.</th>
                                <th className="border border-slate-300 px-2 py-1 text-left font-semibold">品名</th>
                                <th className="border border-slate-300 px-2 py-1 text-left font-semibold">規格</th>
                                <th className="border border-slate-300 px-2 py-1 text-right font-semibold">数量</th>
                                <th className="border border-slate-300 px-2 py-1 text-left font-semibold">単位</th>
                                <th className="border border-slate-300 px-2 py-1 text-right font-semibold">単価(円)</th>
                                <th className="border border-slate-300 px-2 py-1 text-right font-semibold">金額(円)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableItems.map((orderItem, index) => {
                                const item = items.find((i) => i.id === orderItem.itemId);
                                const amount = (orderItem.pricePerUnit || 0) * orderItem.quantity;
                                // 前行と品名が同じ場合は品名を非表示にする
                                const prevItem = index > 0 ? items.find((i) => i.id === editableItems[index - 1].itemId) : null;
                                const isSameNameAsPrev = prevItem?.name === item?.name;
                                return (
                                    <tr key={index}>
                                        <td className="border border-slate-300 px-2 py-1">{index + 1}</td>
                                        <td className="border border-slate-300 px-2 py-1">{isSameNameAsPrev ? '' : (item?.name || '不明')}</td>
                                        <td className="border border-slate-300 px-2 py-1">{item?.sku || '-'}</td>
                                        <td className="border border-slate-300 px-2 py-1 text-right">{orderItem.quantity}</td>
                                        <td className="border border-slate-300 px-2 py-1">{item?.unit || '-'}</td>
                                        {/* 単価セル: 画面では入力欄、印刷では空欄 */}
                                        <td className="border border-slate-300 px-2 py-1 text-right">
                                            <input
                                                type="number"
                                                className="w-full text-right border-0 p-0 focus:ring-1 focus:ring-indigo-500 rounded print:hidden"
                                                value={orderItem.pricePerUnit || ''}
                                                onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </td>
                                        {/* 金額セル: 画面では計算値、印刷では空欄 */}
                                        <td className="border border-slate-300 px-2 py-1 text-right">
                                            <span className="print:hidden">{amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* 合計行: 印刷時も表示、金額セルは空欄（手書き記入用） */}
                            <tr>
                                <td colSpan={6} className="border border-slate-300 px-2 py-1 text-right font-semibold">
                                    合計金額:
                                </td>
                                <td className="border border-slate-300 px-2 py-1 text-right font-bold">
                                    <span className="print:hidden">¥{calculateTotal().toLocaleString()}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="mb-4">
                        <h3 className="text-xs font-medium text-slate-500 mb-1">備考</h3>
                        <div className="border border-slate-300 p-2 rounded bg-slate-50 text-xs">
                            <p className="whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        size: A5;
                        margin: 10mm;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:p-4 {
                        padding: 1rem !important;
                    }
                    .print\\:text-xl {
                        font-size: 1.25rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderDetailContent />
        </Suspense>
    );
}
