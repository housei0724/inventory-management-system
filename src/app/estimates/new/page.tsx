'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2, Save, FileSpreadsheet, ArrowLeft, Loader2, X } from 'lucide-react';
import { Item, EstimateItem, PricingGroup } from '@/types';

export default function NewEstimatePage() {
    const router = useRouter();
    const { items, pricingGroups, addEstimate } = useApp();

    const [addressee, setAddressee] = useState('');
    const [projectName, setProjectName] = useState('');
    const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([
        { type: 'item', itemId: '', dimension: '', quantity: 1, appliedPrice: 0 }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Modal state for Pricing Table
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [selectedPricingGroupId, setSelectedPricingGroupId] = useState('');
    const [selectedPricingSizeName, setSelectedPricingSizeName] = useState('');

    // --- Actions ---
    const handleAddItem = () => {
        setEstimateItems([...estimateItems, { type: 'item', itemId: '', dimension: '', quantity: 1, appliedPrice: 0 }]);
    };

    const handleAddHeading = () => {
        setEstimateItems([...estimateItems, { type: 'heading', itemName: '', itemId: '', dimension: '', quantity: 0, appliedPrice: 0 }]);
    };

    const handleAddFromPricing = () => {
        if (!selectedPricingGroupId || !selectedPricingSizeName) {
            alert('グループとサイズを選択してください。');
            return;
        }
        const group = pricingGroups.find(g => g.id === selectedPricingGroupId);
        if (!group) return;
        const size = group.sizes.find(s => s.sizeName === selectedPricingSizeName);
        if (!size) return;

        const generatedName = `${group.materialName}${group.finishName ? '+' + group.finishName : ''}`;
        const generatedSpec = `${size.sizeName}${group.thickness ? '×' + group.thickness : ''}`;

        let currentBaseCost = size.baseMaterialCost || 0;
        if (size.baseMaterialId) {
            const baseItem = items.find(i => i.id === size.baseMaterialId);
            if (baseItem) currentBaseCost = baseItem.unitPrice || 0;
        }

        let currentFinishCost = size.finishMaterialCost || 0;
        if (size.finishMaterialId) {
            const finishItem = items.find(i => i.id === size.finishMaterialId);
            if (finishItem) currentFinishCost = finishItem.unitPrice || 0;
        }

        const currentCompositePrice = currentBaseCost + currentFinishCost + (size.auxiliaryMaterialCost || 0) + (size.laborCost || 0);

        setEstimateItems([
            ...estimateItems,
            {
                type: 'item',
                itemId: `pricing_${group.id}`, // Placeholder ID, text takes precedence
                itemName: generatedName,
                dimension: generatedSpec,
                quantity: 1,
                unit: group.unit,
                appliedPrice: currentCompositePrice
            }
        ]);
        
        setIsPricingModalOpen(false);
        setSelectedPricingGroupId('');
        setSelectedPricingSizeName('');
    };

    const handleRemoveItem = (index: number) => {
        setEstimateItems(estimateItems.filter((_, idx) => idx !== index));
    };

    const handleItemChange = (index: number, field: keyof EstimateItem, value: any) => {
        const newItems = [...estimateItems];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // If itemId is changed, auto-fill the appliedPrice and unit
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index].appliedPrice = selectedItem.estimateUnitPrice || selectedItem.unitPrice || 0;
                newItems[index].unit = selectedItem.unit || '個';
            }
        }
        setEstimateItems(newItems);
    };

    const totalAmount = estimateItems.reduce((sum, item) => sum + (item.type === 'heading' ? 0 : (item.quantity * item.appliedPrice)), 0);

    // --- Save & Export ---
    const handleSave = async () => {
        if (!projectName || estimateItems.length === 0) {
            alert('工事件名と少なくとも一つの明細が必要です。');
            return;
        }
        setIsSaving(true);
        try {
            await addEstimate({
                addressee,
                projectName,
                items: estimateItems,
                totalAmount,
                createdAt: new Date().toISOString(),
                status: 'draft'
            });
            alert('保存しました。');
            router.push('/estimates');
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました。');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const exportData = estimateItems.map(estItem => {
                if (estItem.type === 'heading') {
                    return {
                        type: 'heading',
                        name: estItem.itemName || '',
                        spec: '',
                        dimension: '',
                        quantity: 0,
                        unit: '',
                        unit_price: 0
                    };
                }
                const itemDef = items.find(i => i.id === estItem.itemId);
                return {
                    type: 'item',
                    name: estItem.itemName || itemDef?.name || '不明な資材',
                    spec: itemDef?.category || '',
                    dimension: estItem.dimension || '',
                    quantity: estItem.quantity,
                    unit: estItem.unit || itemDef?.unit || '個',
                    unit_price: estItem.appliedPrice
                };
            });

            const res = await fetch('/api/export-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    directData: true,
                    projectName,
                    addressee,
                    items: exportData
                })
            });

            if (!res.ok) throw new Error('Excel出力に失敗しました');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `見積書_${projectName || '無題'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Excel出力中にエラーが発生しました');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-slate-600 transition">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">新規見積作成</h1>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-lg p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">基本情報</h2>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-slate-900">宛名 (相手先会社名)</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={addressee}
                                    onChange={(e) => setAddressee(e.target.value)}
                                    placeholder="例: 株式会社○○建設"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-slate-900">工事件名 <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="例: ○○ビル空調設備工事"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-200 pb-2">見積明細</h2>
                    <div className="space-y-4">
                        {estimateItems.map((item, index) => (
                            <div key={index} className={`flex items-start space-x-3 p-4 rounded-md border relative group ${item.type === 'heading' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex-1">
                                    {item.type === 'heading' ? (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">見出し行</label>
                                            <input
                                                type="text"
                                                className="block w-full rounded-md border-0 py-1.5 text-indigo-900 font-bold shadow-sm ring-1 ring-inset ring-indigo-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={item.itemName || ''}
                                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                placeholder="例: ◆ 1階配管工事"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                            <div className="sm:col-span-3">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">材料</label>
                                                <select
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={item.itemId}
                                                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                                >
                                                    <option value="">直接入力(マスタ外)</option>
                                                    {items.map(i => (
                                                        <option key={i.id} value={i.id}>{i.name} ({i.category || '-'})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">品名(手入力可)</label>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={item.itemName || ''}
                                                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                                    placeholder={item.itemId ? "(上書き用)" : "ポリテープ"}
                                                    title="出力時の品名を変更、または直接入力用"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">寸法 / 仕様</label>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={item.dimension || ''}
                                                    onChange={(e) => handleItemChange(index, 'dimension', e.target.value)}
                                                    placeholder="例: φ150"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">数量 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">単位</label>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-1 text-center"
                                                    value={item.unit || ''}
                                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                    placeholder={item.itemId ? "" : "個"}
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">見積単価</label>
                                                <input
                                                    type="number"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={item.appliedPrice}
                                                    onChange={(e) => handleItemChange(index, 'appliedPrice', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition mt-5"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <div className="space-x-4">
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-md transition"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                明細を追加
                            </button>
                            <button
                                type="button"
                                onClick={handleAddHeading}
                                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md transition"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                見出しを追加
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPricingModalOpen(true)}
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1.5 rounded-md transition border border-blue-200"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                単価表から明細を追加
                            </button>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-slate-500 mr-4">合計金額:</span>
                            <span className="text-2xl font-bold text-slate-900">¥{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2 text-slate-400" />}
                        保存（下書き）
                    </button>
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="h-5 w-5 mr-2 animate-spin text-white" /> : <FileSpreadsheet className="h-5 w-5 mr-2" />}
                        Excelで出力
                    </button>
                </div>
            </div>

            {/* Pricing Modal */}
            {isPricingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-500 bg-opacity-75" onClick={() => setIsPricingModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-slate-900">単価表から明細を追加</h3>
                            <button
                                type="button"
                                className="rounded-md text-slate-400 hover:text-slate-500"
                                onClick={() => setIsPricingModalOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {pricingGroups.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-sm text-slate-500 mb-3">単価表がまだ登録されていません。</p>
                                <a
                                    href="/pricing/new"
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    単価表を新規登録する
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ベース材料グループ</label>
                                    <select
                                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={selectedPricingGroupId}
                                        onChange={(e) => {
                                            setSelectedPricingGroupId(e.target.value);
                                            setSelectedPricingSizeName('');
                                        }}
                                    >
                                        <option value="">選択してください...</option>
                                        {pricingGroups.map(g => (
                                            <option key={g.id} value={g.id}>
                                                {g.materialName} {g.finishName ? `+ ${g.finishName}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPricingGroupId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">サイズ</label>
                                        <select
                                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            value={selectedPricingSizeName}
                                            onChange={(e) => setSelectedPricingSizeName(e.target.value)}
                                        >
                                            <option value="">選択してください...</option>
                                            {pricingGroups.find(g => g.id === selectedPricingGroupId)?.sizes.map((s: any, i) => {
                                                let baseCost = s.baseMaterialCost !== undefined ? s.baseMaterialCost : (s.materialCost || 0);
                                                if (s.baseMaterialId) {
                                                    const item = items.find(it => it.id === s.baseMaterialId);
                                                    if (item) baseCost = item.unitPrice || 0;
                                                }
                                                let finishCost = s.finishMaterialCost || 0;
                                                if (s.finishMaterialId) {
                                                    const item = items.find(it => it.id === s.finishMaterialId);
                                                    if (item) finishCost = item.unitPrice || 0;
                                                }
                                                const livePrice = baseCost + finishCost + (s.auxiliaryMaterialCost || 0) + (s.laborCost || 0);
                                                return (
                                                    <option key={i} value={s.sizeName}>
                                                        {s.sizeName} ({livePrice.toLocaleString()}円)
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                        onClick={() => setIsPricingModalOpen(false)}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                                        disabled={!selectedPricingGroupId || !selectedPricingSizeName}
                                        onClick={handleAddFromPricing}
                                    >
                                        明細に追加
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
