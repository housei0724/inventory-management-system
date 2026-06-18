'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PricingSize } from '@/types';

export default function EditPricingGroupPage() {
    const router = useRouter();
    const params = useParams();
    const { pricingGroups, updatePricingGroup, deletePricingGroup, items } = useApp();
    
    const sortedItems = [...items].sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name, 'ja');
        if (nameCompare !== 0) return nameCompare;
        const extractNumber = (sku: string) => { const m = sku.match(/[\d.]+/); return m ? parseFloat(m[0]) : Infinity; };
        return extractNumber(a.sku) - extractNumber(b.sku);
    });

    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        materialName: '',
        finishName: '',
        thickness: '',
        unit: 'M',
    });

    const [sizes, setSizes] = useState<PricingSize[]>([
        { sizeName: '', baseMaterialId: '', baseMaterialCost: 0, finishMaterialId: '', finishMaterialCost: 0, auxiliaryMaterialCost: 0, laborCost: 0, compositePrice: 0 }
    ]);

    useEffect(() => {
        if (pricingGroups.length > 0 && params.id) {
            const group = pricingGroups.find(g => g.id === params.id);
            if (group) {
                setFormData({
                    materialName: group.materialName,
                    finishName: group.finishName || '',
                    thickness: group.thickness || '',
                    unit: group.unit || 'M',
                });
                if (group.sizes && group.sizes.length > 0) {
                    // Map sizes to ensure backwards compatibility with old 'materialCost'
                    const mappedSizes = group.sizes.map((s: any) => ({
                        sizeName: s.sizeName,
                        baseMaterialId: s.baseMaterialId || '',
                        baseMaterialCost: s.baseMaterialCost !== undefined ? s.baseMaterialCost : (s.materialCost || 0),
                        finishMaterialId: s.finishMaterialId || '',
                        finishMaterialCost: s.finishMaterialCost || 0,
                        auxiliaryMaterialCost: s.auxiliaryMaterialCost || 0,
                        laborCost: s.laborCost || 0,
                        compositePrice: s.compositePrice || 0
                    }));
                    setSizes(mappedSizes);
                }
            }
            setIsLoading(false);
        }
    }, [pricingGroups, params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSizeChange = (index: number, field: string, value: string) => {
        const newSizes = [...sizes];
        if (field === 'sizeName' || field === 'baseMaterialId' || field === 'finishMaterialId') {
            // @ts-ignore
            newSizes[index][field] = value;
            
            // If item selected, try to copy its price
            if (field === 'baseMaterialId' && value) {
                const item = items.find(i => i.id === value);
                if (item) newSizes[index].baseMaterialCost = item.unitPrice || 0;
            }
            if (field === 'finishMaterialId' && value) {
                const item = items.find(i => i.id === value);
                if (item) newSizes[index].finishMaterialCost = item.unitPrice || 0;
            }
        } else {
            const numValue = parseInt(value) || 0;
            // @ts-ignore
            newSizes[index][field] = numValue;
        }
        newSizes[index].compositePrice = newSizes[index].baseMaterialCost + newSizes[index].finishMaterialCost + newSizes[index].auxiliaryMaterialCost + newSizes[index].laborCost;
        setSizes(newSizes);
    };

    const addSizeRow = () => {
        setSizes([...sizes, { sizeName: '', baseMaterialId: '', baseMaterialCost: 0, finishMaterialId: '', finishMaterialCost: 0, auxiliaryMaterialCost: 0, laborCost: 0, compositePrice: 0 }]);
    };

    const removeSizeRow = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const handleDelete = async () => {
        if (window.confirm('この単価表を削除してもよろしいですか？')) {
            await deletePricingGroup(params.id as string);
            router.push('/pricing');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter out empty rows
        const validSizes = sizes.filter(s => s.sizeName.trim() !== '');

        if (validSizes.length === 0) {
            alert('最低1つのサイズを登録してください。');
            return;
        }

        await updatePricingGroup(params.id as string, {
            ...formData,
            sizes: validSizes
        });

        router.push('/pricing');
    };

    if (isLoading) {
        return <div className="text-center py-12">読み込み中...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/pricing"
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">単価表の編集</h1>
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                >
                    <Trash2 className="-ml-0.5 mr-1.5 h-4 w-4" />
                    削除
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 基本情報 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">基本情報（グループ）</h2>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="materialName" className="block text-sm font-medium leading-6 text-slate-900">
                                ベース材料名 <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="materialName"
                                    id="materialName"
                                    required
                                    placeholder="例: グラスウール保温筒"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={formData.materialName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="finishName" className="block text-sm font-medium leading-6 text-slate-900">
                                仕上げ材（任意）
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="finishName"
                                    id="finishName"
                                    placeholder="例: カラー鉄板"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={formData.finishName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="thickness" className="block text-sm font-medium leading-6 text-slate-900">
                                厚み・仕様（任意）
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="thickness"
                                    id="thickness"
                                    placeholder="例: 20mm"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={formData.thickness}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium leading-6 text-slate-900">
                                登録単位 <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <select
                                    name="unit"
                                    id="unit"
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    value={formData.unit}
                                    onChange={handleChange}
                                >
                                    <option value="M">M (メートル)</option>
                                    <option value="㎡">㎡ (平米)</option>
                                    <option value="個">個</option>
                                    <option value="基">基</option>
                                    <option value="式">式</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* サイズごとの単価設定 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-800">サイズごとの単価設定</h2>
                        <button
                            type="button"
                            onClick={addSizeRow}
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            行を追加
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0 w-1/6">
                                        サイズ
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 w-1/4">
                                        ベース材料費
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 w-1/4">
                                        仕上げ材料費
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 w-1/6">
                                        副資材費
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 w-1/6">
                                        施工労務費
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-indigo-600">
                                        合計({formData.unit}単価)
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 w-10">
                                        <span className="sr-only">削除</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {sizes.map((size, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                                            <input
                                                type="text"
                                                placeholder="15A"
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={size.sizeName}
                                                onChange={(e) => handleSizeChange(index, 'sizeName', e.target.value)}
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="flex flex-col space-y-2">
                                                <select
                                                    className="block w-full rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs text-xs"
                                                    value={size.baseMaterialId || ''}
                                                    onChange={(e) => handleSizeChange(index, 'baseMaterialId', e.target.value)}
                                                >
                                                    <option value="">手入力(マスタ外)</option>
                                                    {sortedItems.map(i => (
                                                        <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-right"
                                                    value={size.baseMaterialCost === 0 && size.sizeName === '' ? '' : size.baseMaterialCost}
                                                    onChange={(e) => handleSizeChange(index, 'baseMaterialCost', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="flex flex-col space-y-2">
                                                <select
                                                    className="block w-full rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs text-xs"
                                                    value={size.finishMaterialId || ''}
                                                    onChange={(e) => handleSizeChange(index, 'finishMaterialId', e.target.value)}
                                                >
                                                    <option value="">なし/手入力</option>
                                                    {sortedItems.map(i => (
                                                        <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-right"
                                                    value={size.finishMaterialCost === 0 && size.sizeName === '' ? '' : size.finishMaterialCost}
                                                    onChange={(e) => handleSizeChange(index, 'finishMaterialCost', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 align-bottom">
                                            <input
                                                type="number"
                                                min="0"
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-right"
                                                value={size.auxiliaryMaterialCost === 0 && size.sizeName === '' ? '' : size.auxiliaryMaterialCost}
                                                onChange={(e) => handleSizeChange(index, 'auxiliaryMaterialCost', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 align-bottom">
                                            <input
                                                type="number"
                                                min="0"
                                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-right"
                                                value={size.laborCost === 0 && size.sizeName === '' ? '' : size.laborCost}
                                                onChange={(e) => handleSizeChange(index, 'laborCost', e.target.value)}
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-right font-medium text-indigo-600 align-bottom">
                                            ¥{size.compositePrice.toLocaleString()}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-0">
                                            {sizes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSizeRow(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="button"
                            onClick={addSizeRow}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" />
                            サイズを追加
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6">
                    <Link href="/pricing" className="text-sm font-semibold leading-6 text-slate-900">
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        更新する
                    </button>
                </div>
            </form>
        </div>
    );
}
