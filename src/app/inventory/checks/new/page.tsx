'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Printer } from 'lucide-react';
import { InventoryCheckItem } from '@/types';

export default function NewInventoryCheckPage() {
    const { items, issuers, addInventoryCheck, completeInventoryCheck } = useApp();
    const router = useRouter();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [conductedBy, setConductedBy] = useState('');
    const [notes, setNotes] = useState('');
    const [checkItems, setCheckItems] = useState<InventoryCheckItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize check items with current inventory
    useEffect(() => {
        if (items.length > 0 && checkItems.length === 0) {
            const initialItems = items.map(item => ({
                itemId: item.id,
                expectedQuantity: item.quantity,
                actualQuantity: item.quantity, // Default to expected
                difference: 0,
                notes: ''
            }));
            setCheckItems(initialItems);
        }
    }, [items, checkItems.length]);

    // Set default issuer if available
    useEffect(() => {
        if (issuers.length > 0 && !conductedBy) {
            setConductedBy(issuers[0].id);
        }
    }, [issuers, conductedBy]);

    const handleQuantityChange = (itemId: string, value: string) => {
        const actualQuantity = value === '' ? 0 : parseInt(value, 10);
        if (isNaN(actualQuantity)) return;

        setCheckItems(prev => prev.map(item => {
            if (item.itemId === itemId) {
                return {
                    ...item,
                    actualQuantity,
                    difference: actualQuantity - item.expectedQuantity
                };
            }
            return item;
        }));
    };

    const handleNoteChange = (itemId: string, note: string) => {
        setCheckItems(prev => prev.map(item => {
            if (item.itemId === itemId) {
                return { ...item, notes: note };
            }
            return item;
        }));
    };

    const getItemDetails = (itemId: string) => {
        return items.find(i => i.id === itemId);
    };

    const handleSaveDraft = async () => {
        if (!conductedBy) {
            alert('実施者を選択してください。');
            return;
        }

        setIsSubmitting(true);
        try {
            await addInventoryCheck({
                date,
                status: 'draft',
                conductedBy,
                notes,
                items: checkItems,
                createdAt: new Date().toISOString()
            });
            router.push('/inventory/checks');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('保存に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async () => {
        if (!conductedBy) {
            alert('実施者を選択してください。');
            return;
        }

        if (!confirm('棚卸を完了すると、システムの在庫数が入力した実在庫数で上書きされます。\n本当に完了してよろしいですか？')) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Create the record first
            const newCheckId = await addInventoryCheck({
                date,
                status: 'draft', // Will be updated to completed in completeInventoryCheck
                conductedBy,
                notes,
                items: checkItems,
                createdAt: new Date().toISOString()
            });

            // Update quantities and mark as completed
            const itemsToUpdate = checkItems.map(item => ({
                itemId: item.itemId,
                actualQuantity: item.actualQuantity
            }));
            await completeInventoryCheck(newCheckId, itemsToUpdate);
            
            alert('棚卸が完了し、在庫が更新されました。');
            router.push('/inventory/checks');
        } catch (error) {
            console.error('Error completing check:', error);
            alert('完了処理に失敗しました。');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 print:hidden">
                    <Link href="/inventory/checks" className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">新規棚卸開始</h2>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-300 hover:bg-indigo-50 print:hidden"
                >
                    <Printer className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                    用紙を印刷
                </button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-4 text-center">
                <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-800 pb-2 inline-block">棚卸実地明細表</h2>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6 print:hidden">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                        <label htmlFor="date" className="block text-sm font-medium leading-6 text-slate-900">
                            実施日 <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="conductedBy" className="block text-sm font-medium leading-6 text-slate-900">
                            実施者 <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                            <select
                                id="conductedBy"
                                value={conductedBy}
                                onChange={(e) => setConductedBy(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value="">選択してください</option>
                                {issuers.map((issuer) => (
                                    <option key={issuer.id} value={issuer.id}>
                                        {issuer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="notes" className="block text-sm font-medium leading-6 text-slate-900">
                            全体備考
                        </label>
                        <div className="mt-2">
                            <textarea
                                id="notes"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden print:ring-0 print:shadow-none">
                <div className="px-4 py-3 print:py-1 border-b print:border-b-0 border-slate-200 bg-slate-50 print:bg-white flex justify-between items-end">
                    <h3 className="text-base font-semibold leading-6 text-slate-900 print:hidden">棚卸明細入力</h3>
                    <p className="mt-1 text-sm text-slate-500 print:text-black">対象品目: {checkItems.length}件</p>
                    <div className="hidden print:block text-sm text-black">
                        実施日: ______年 ____月 ____日  ／  実施者: ________________
                    </div>
                </div>
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-left text-sm font-semibold text-slate-900">品名 / SKU</th>
                                <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-center text-sm font-semibold text-slate-900">理論在庫</th>
                                <th scope="col" className="hidden print:table-cell px-6 py-3 print:px-2 print:py-1 text-center text-sm font-semibold text-slate-900">実地数量（手書き）</th>
                                <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 print:hidden">実在庫入力</th>
                                <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-center text-sm font-semibold text-slate-900 print:hidden">差異</th>
                                <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-left text-sm font-semibold text-slate-900">商品備考</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {checkItems
                                .map(item => ({ item, details: getItemDetails(item.itemId) }))
                                .filter((x): x is { item: InventoryCheckItem, details: NonNullable<ReturnType<typeof getItemDetails>> } => !!x.details)
                                .sort((a, b) => {
                                    // First, sort by name (Japanese alphabetical order)
                                    const nameCompare = a.details.name.localeCompare(b.details.name, 'ja');
                                    if (nameCompare !== 0) return nameCompare;

                                    // If names are the same, sort by SKU numerical value
                                    const extractNumber = (sku: string): number => {
                                        const match = sku.match(/[\d.]+/);
                                        return match ? parseFloat(match[0]) : Infinity;
                                    };
                                    return extractNumber(a.details.sku) - extractNumber(b.details.sku);
                                })
                                .map(({ item, details }) => {
                                    return (
                                        <tr 
                                            key={item.itemId} 
                                            className={`${item.difference !== 0 ? 'bg-orange-50/30' : ''} print:break-inside-avoid`}
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 print:px-2 print:py-0">
                                                <div className="font-medium text-slate-900 print:text-xs">{details.name}</div>
                                                <div className="text-xs text-slate-500 print:text-[10px]">{details.sku}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 print:px-2 print:py-0 text-center">
                                                <span className="text-slate-600 print:text-xs">{item.expectedQuantity} {details.unit}</span>
                                            </td>
                                            <td className="hidden print:table-cell whitespace-nowrap px-6 py-4 print:px-2 print:py-0">
                                                {/* 手書き用の空欄 */}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 print:px-2 print:py-0 bg-indigo-50/30 print:hidden">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.actualQuantity}
                                                        onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                                                        className="block w-24 rounded-md border-0 py-1.5 text-center text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-bold"
                                                    />
                                                    <span className="ml-2 text-sm text-slate-500">{details.unit}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 print:px-2 print:py-0 text-center print:hidden">
                                                {item.difference > 0 ? (
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                        +{item.difference}
                                                    </span>
                                                ) : item.difference < 0 ? (
                                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                        {item.difference}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">0</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm print:px-2 print:py-0">
                                                <input
                                                    type="text"
                                                    placeholder="理由など"
                                                    value={item.notes || ''}
                                                    onChange={(e) => handleNoteChange(item.itemId, e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 print:hidden"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fixed Action Bar at bottom */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 p-4 shadow-lg z-10 print:hidden">
                <div className="max-w-screen-2xl mx-auto flex justify-end gap-x-4">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <Save className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                        下書き保存
                    </button>
                    <button
                        type="button"
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                        <CheckCircle className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        棚卸を完了する (在庫更新)
                    </button>
                </div>
            </div>
        </div>
    );
}
