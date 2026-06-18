'use client';

import { useRef } from 'react';
import { InventoryTable } from '@/components/InventoryTable';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useApp } from '@/context/AppContext';
import { Upload, ClipboardList, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function InventoryPage() {
    const { items, updateItem, addItem, deleteItem, deleteItems } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        updateItem(id, { quantity: newQuantity });
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteItem(itemToDelete);
            setItemToDelete(null);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        await deleteItems(Array.from(selectedIds));
        setSelectedIds(new Set());
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [name, sku, category, quantity, unit, unitPrice] = line.split(',');

                if (name && sku) {
                    addItem({
                        name,
                        sku,
                        category: category || 'Uncategorized',
                        quantity: parseInt(quantity) || 0,
                        unit: unit || '個',
                        unitPrice: parseInt(unitPrice) || 0,
                        minStockLevel: 0,
                        updatedAt: new Date().toISOString(), // Optional, will be overwritten
                    });
                }
            }
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            alert('インポートが完了しました');
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">在庫管理</h2>
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        >
                            <Trash2 className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            {selectedIds.size}件を削除
                        </button>
                    )}
                    <Link
                        href="/inventory/checks"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <ClipboardList className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        棚卸管理
                    </Link>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                        <Upload className="-ml-0.5 mr-1.5 h-5 w-5 text-slate-400" aria-hidden="true" />
                        CSVインポート
                    </button>
                </div>
            </div>
            <InventoryTable
                items={[...items].sort((a, b) => {
                    // 先頭・末尾のスペースを除去してから比較（データの不整合対策）
                    const nameA = a.name.trim();
                    const nameB = b.name.trim();

                    // 商品名のあいうえお順でソート
                    const nameCompare = nameA.localeCompare(nameB, 'ja');
                    if (nameCompare !== 0) return nameCompare;

                    // 商品名が同じ場合はSKUをナチュラルソートで比較
                    // 数値部分と文字列部分に分割して順番に比較する
                    // 例: "15A×20t" → ["15", "A×", "20", "t"]
                    const naturalSort = (skuA: string, skuB: string): number => {
                        // 先頭・末尾スペースを除去してからトークン分割
                        const tokenize = (s: string) => s.trim().match(/(\d+|\D+)/g) || [];
                        const tokensA = tokenize(skuA);
                        const tokensB = tokenize(skuB);
                        const len = Math.max(tokensA.length, tokensB.length);
                        for (let i = 0; i < len; i++) {
                            if (i >= tokensA.length) return -1;
                            if (i >= tokensB.length) return 1;
                            const numA = parseFloat(tokensA[i]);
                            const numB = parseFloat(tokensB[i]);
                            if (!isNaN(numA) && !isNaN(numB)) {
                                // 両方数値の場合は数値として比較
                                if (numA !== numB) return numA - numB;
                            } else {
                                // 文字列の場合は日本語ロケールで比較（前後スペース除去）
                                const cmp = tokensA[i].trim().localeCompare(tokensB[i].trim(), 'ja');
                                if (cmp !== 0) return cmp;
                            }
                        }
                        return 0;
                    };
                    return naturalSort(a.sku, b.sku);
                })}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="商品を削除"
                message="本当にこの商品を削除しますか？この操作は取り消せません。"
            />
            <ConfirmModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title="商品を一括削除"
                message={`選択した${selectedIds.size}件の商品を削除しますか？この操作は取り消せません。`}
            />
        </div>
    );
}
