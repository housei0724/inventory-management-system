'use client';

import { useState } from 'react';
import { Item } from '@/types';
import { Search, Plus, Minus, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface InventoryTableProps {
    items: Item[];
    onUpdateQuantity: (id: string, newQuantity: number) => void;
    onDelete: (id: string) => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
}

export function InventoryTable({ items, onUpdateQuantity, onDelete, selectedIds, onSelectionChange }: InventoryTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id));

    const handleSelectAll = () => {
        if (allFilteredSelected) {
            const newSelected = new Set(selectedIds);
            filteredItems.forEach(item => newSelected.delete(item.id));
            onSelectionChange(newSelected);
        } else {
            const newSelected = new Set(selectedIds);
            filteredItems.forEach(item => newSelected.add(item.id));
            onSelectionChange(newSelected);
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        onSelectionChange(newSelected);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex flex-1 items-center space-x-4">
                    <div className="relative max-w-xs flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="商品名またはSKUで検索"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <Link
                        href="/inventory/new"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        新規商品登録
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={allFilteredSelected}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                商品名 / SKU
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                カテゴリ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                単価
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                在庫数
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                状態
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">操作</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={selectedIds.has(item.id) ? 'bg-indigo-50' : ''}>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => handleSelectOne(item.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            <div className="text-sm text-slate-500">{item.sku}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    ¥{item.unitPrice.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="min-w-[3rem] text-center font-medium text-slate-900">
                                            {item.quantity} {item.unit}
                                        </span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {item.quantity <= item.minStockLevel ? (
                                        <span className="inline-flex items-center text-sm text-red-600">
                                            <AlertTriangle className="mr-1.5 h-4 w-4" />
                                            在庫不足
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-sm text-green-600">
                                            適正
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <Link href={`/inventory/${item.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        詳細
                                    </Link>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
