'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, Trash, Copy } from 'lucide-react';
import Link from 'next/link';
import { Item } from '@/types';

// Extended order item type with new item fields
type OrderItemInput = {
    mode: 'existing' | 'new';
    itemId: string;
    quantity: number;
    pricePerUnit: number;
    // New item fields (only used when mode is 'new')
    newItemName?: string;
    newItemSku?: string;
    newItemCategory?: string;
    newItemUnit?: string;
};

function NewOrderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialItemId = searchParams.get('itemId');
    const copyFromId = searchParams.get('copyFrom');

    const { items, suppliers, issuers, projects, orders, addOrder, addItem } = useApp();

    // Find the source order if copying
    const sourceOrder = useMemo(() => {
        if (copyFromId) {
            return orders.find(o => o.id === copyFromId);
        }
        return null;
    }, [copyFromId, orders]);

    // Initialize state from source order if copying
    const [supplierId, setSupplierId] = useState(sourceOrder?.supplierId || '');
    const [projectId, setProjectId] = useState(sourceOrder?.projectId || '');
    const [issuer, setIssuer] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [orderItems, setOrderItems] = useState<OrderItemInput[]>(() => {
        if (sourceOrder) {
            return sourceOrder.items.map(item => ({
                mode: 'existing' as const,
                itemId: item.itemId,
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit || 0
            }));
        }
        if (initialItemId) {
            return [{ mode: 'existing' as const, itemId: initialItemId, quantity: 1, pricePerUnit: 0 }];
        }
        return [];
    });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Get unique categories from items
    const categories = Array.from(new Set(items.map(item => item.category)));

    // Get filtered items for a specific order item row
    // Always include the currently selected item regardless of filter
    const getFilteredItemsForRow = (currentItemId: string) => {
        return items.filter(item => {
            // Always show the currently selected item
            if (item.id === currentItemId) {
                return true;
            }
            // Apply filters for other items
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesSearch = !searchFilter ||
                item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchFilter.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, {
            mode: 'existing',
            itemId: '',
            quantity: 1,
            pricePerUnit: 0,
            newItemName: '',
            newItemSku: '',
            newItemCategory: categories[0] || '',
            newItemUnit: '個'
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof OrderItemInput, value: string | number) => {
        const newItems = [...orderItems];

        if (field === 'mode') {
            newItems[index] = {
                ...newItems[index],
                mode: value as 'existing' | 'new',
                // Reset fields when switching mode
                itemId: '',
                newItemName: '',
                newItemSku: '',
                newItemCategory: categories[0] || '',
                newItemUnit: '個',
                pricePerUnit: 0
            };
        } else if (field === 'itemId') {
            newItems[index] = { ...newItems[index], itemId: value as string };
            // If item changed, update default price
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index].pricePerUnit = selectedItem.unitPrice || 0;
            }
        } else if (field === 'quantity') {
            newItems[index] = { ...newItems[index], quantity: Number(value) };
        } else if (field === 'pricePerUnit') {
            newItems[index] = { ...newItems[index], pricePerUnit: Number(value) };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }

        setOrderItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || orderItems.length === 0 || !projectId) return;

        // Validate all items
        for (const item of orderItems) {
            if (item.mode === 'existing' && !item.itemId) {
                alert('すべての品目で商品を選択してください');
                return;
            }
            if (item.mode === 'new' && (!item.newItemName || !item.newItemSku || !item.newItemCategory || item.newItemCategory === '__NEW__')) {
                alert('新規商品の品名、規格、カテゴリーをすべて入力してください');
                return;
            }
        }

        // Register new items first and get their IDs
        const finalOrderItems: { itemId: string; quantity: number; pricePerUnit?: number }[] = [];

        for (const item of orderItems) {
            if (item.mode === 'new') {
                // Create new item in the items collection
                const newItemData = {
                    name: item.newItemName!,
                    sku: item.newItemSku!,
                    category: (item.newItemCategory?.startsWith('__NEW__')
                        ? item.newItemCategory.replace('__NEW__', '')
                        : item.newItemCategory) || '',
                    unit: item.newItemUnit || '個',
                    quantity: 0, // Initial stock is 0
                    minStockLevel: 0,
                    unitPrice: item.pricePerUnit || 0,
                    description: '',
                    updatedAt: new Date().toISOString()
                };

                // Add item and wait for it to be added
                await addItem(newItemData);

                // Find the newly added item by name and sku (since we just added it)
                // Wait a bit for Firestore to sync
                await new Promise(resolve => setTimeout(resolve, 500));

                // Get the updated items list - find by exact match
                const newItem = items.find(i =>
                    i.name === item.newItemName &&
                    i.sku === item.newItemSku
                );

                if (newItem) {
                    finalOrderItems.push({
                        itemId: newItem.id,
                        quantity: item.quantity,
                        pricePerUnit: item.pricePerUnit
                    });
                } else {
                    // Fallback: use a temporary ID that will be updated
                    // In practice, we'll use the newest item
                    const sortedItems = [...items].sort((a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                    if (sortedItems.length > 0) {
                        finalOrderItems.push({
                            itemId: sortedItems[0].id,
                            quantity: item.quantity,
                            pricePerUnit: item.pricePerUnit
                        });
                    }
                }
            } else {
                finalOrderItems.push({
                    itemId: item.itemId,
                    quantity: item.quantity,
                    pricePerUnit: item.pricePerUnit
                });
            }
        }

        if (!orderNumber.trim()) {
            alert('発注番号を入力してください');
            return;
        }

        // Check for duplicate order number
        const isDuplicate = orders.some(o => o.orderNumber === orderNumber.trim());
        if (isDuplicate) {
            alert('この発注番号はすでに使用されています。別の番号を入力してください。');
            return;
        }

        // Build order object, excluding undefined fields for Firestore
        const newOrder: any = {
            orderNumber: orderNumber.trim(),
            supplierId,
            items: finalOrderItems,
            status: 'ordered' as const,
            createdAt: new Date().toISOString(),
        };

        // Add optional fields only if they have values
        if (projectId) {
            newOrder.projectId = projectId;
        }
        if (issuer) {
            newOrder.issuer = issuer;
        }
        if (notes) {
            newOrder.notes = notes;
        }

        const newOrderId = await addOrder(newOrder);
        router.push(`/orders/${newOrderId}?print=true`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/orders" className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800">新規発注作成</h2>
            </div>

            {/* Copy From Banner */}
            {sourceOrder && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Copy className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                発注 {sourceOrder.orderNumber} から引用しています
                            </h3>
                            <p className="mt-1 text-sm text-green-700">
                                サプライヤー、依頼元、品目リストが引き継がれています。必要に応じて編集してください。
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-slate-200 rounded-lg bg-white p-6 shadow">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-b pb-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="orderNumber" className="block text-sm font-medium leading-6 text-slate-900">
                                発注番号 <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="orderNumber"
                                    id="orderNumber"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="例: 63-0001"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 pt-2">
                        <div className="sm:col-span-3">
                            <label htmlFor="supplier" className="block text-sm font-medium leading-6 text-slate-900">
                                発注先 (サプライヤー)
                            </label>
                            <div className="mt-2">
                                <select
                                    id="supplier"
                                    name="supplier"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="project" className="block text-sm font-medium leading-6 text-slate-900">
                                依頼元 (工事現場)
                            </label>
                            <div className="mt-2">
                                <select
                                    id="project"
                                    name="project"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.projectNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">発注品目</h3>

                        {/* Filter Controls */}
                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-md border border-slate-200">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリーで絞り込み</label>
                                <select
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">すべてのカテゴリー</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">商品名・SKUで検索</label>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="商品名またはSKUを入力"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {orderItems.map((orderItem, index) => {
                                const filteredItemsForThisRow = getFilteredItemsForRow(orderItem.itemId);
                                return (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                                        {/* Mode Toggle */}
                                        <div className="flex items-center gap-4 mb-3">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    className="form-radio text-indigo-600"
                                                    checked={orderItem.mode === 'existing'}
                                                    onChange={() => handleItemChange(index, 'mode', 'existing')}
                                                />
                                                <span className="ml-2 text-sm text-slate-700">既存商品から選択</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    className="form-radio text-indigo-600"
                                                    checked={orderItem.mode === 'new'}
                                                    onChange={() => handleItemChange(index, 'mode', 'new')}
                                                />
                                                <span className="ml-2 text-sm text-slate-700">新規商品を入力</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="ml-auto rounded-md p-2 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {orderItem.mode === 'existing' ? (
                                            /* Existing Item Selection */
                                            <div className="flex items-end gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-slate-700">商品</label>
                                                    <select
                                                        required
                                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        value={orderItem.itemId}
                                                        onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                                    >
                                                        <option value="">商品を選択</option>
                                                        {filteredItemsForThisRow.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.name} / {item.sku} (在庫: {item.quantity} {item.unit})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-sm font-medium text-slate-700">数量</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        required
                                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        value={orderItem.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <label className="block text-sm font-medium text-slate-700">単価</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        required
                                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        value={orderItem.pricePerUnit}
                                                        onChange={(e) => handleItemChange(index, 'pricePerUnit', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-28 pb-2 text-right">
                                                    <span className="text-sm font-medium text-slate-700">小計: </span>
                                                    <span className="text-sm text-slate-900">
                                                        ¥{((orderItem.quantity || 0) * (orderItem.pricePerUnit || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* New Item Input */
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700">品名 <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="品名を入力"
                                                            value={orderItem.newItemName || ''}
                                                            onChange={(e) => handleItemChange(index, 'newItemName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700">規格・寸法 <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="規格・寸法を入力"
                                                            value={orderItem.newItemSku || ''}
                                                            onChange={(e) => handleItemChange(index, 'newItemSku', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700">カテゴリー <span className="text-red-500">*</span></label>
                                                        <div className="mt-1 flex items-center gap-3 mb-2">
                                                            <label className="inline-flex items-center text-xs">
                                                                <input
                                                                    type="radio"
                                                                    className="form-radio text-indigo-600"
                                                                    checked={!orderItem.newItemCategory?.startsWith('__NEW__')}
                                                                    onChange={() => handleItemChange(index, 'newItemCategory', categories[0] || '')}
                                                                />
                                                                <span className="ml-1 text-slate-600">既存から選択</span>
                                                            </label>
                                                            <label className="inline-flex items-center text-xs">
                                                                <input
                                                                    type="radio"
                                                                    className="form-radio text-indigo-600"
                                                                    checked={orderItem.newItemCategory?.startsWith('__NEW__') || false}
                                                                    onChange={() => handleItemChange(index, 'newItemCategory', '__NEW__')}
                                                                />
                                                                <span className="ml-1 text-slate-600">新規入力</span>
                                                            </label>
                                                        </div>
                                                        {orderItem.newItemCategory?.startsWith('__NEW__') ? (
                                                            <input
                                                                type="text"
                                                                required
                                                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                placeholder="新しいカテゴリー名を入力"
                                                                value={orderItem.newItemCategory?.replace('__NEW__', '') || ''}
                                                                onChange={(e) => handleItemChange(index, 'newItemCategory', '__NEW__' + e.target.value)}
                                                            />
                                                        ) : (
                                                            <select
                                                                required
                                                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                value={orderItem.newItemCategory || ''}
                                                                onChange={(e) => handleItemChange(index, 'newItemCategory', e.target.value)}
                                                            >
                                                                <option value="">選択</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat} value={cat}>
                                                                        {cat}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700">単位</label>
                                                        <input
                                                            type="text"
                                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="個"
                                                            value={orderItem.newItemUnit || ''}
                                                            onChange={(e) => handleItemChange(index, 'newItemUnit', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700">数量</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            required
                                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            value={orderItem.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700">単価</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            required
                                                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            value={orderItem.pricePerUnit}
                                                            onChange={(e) => handleItemChange(index, 'pricePerUnit', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-2">
                                                        <div>
                                                            <span className="text-sm font-medium text-slate-700">小計: </span>
                                                            <span className="text-sm text-slate-900">
                                                                ¥{((orderItem.quantity || 0) * (orderItem.pricePerUnit || 0)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    ※ 発注確定時に自動的に商品一覧に登録されます
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                品目を追加
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="issuer" className="block text-sm font-medium leading-6 text-slate-900">
                                発行者
                            </label>
                            <div className="mt-2 text-sm flex items-center justify-between">
                                <select
                                    id="issuer"
                                    name="issuer"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={issuer}
                                    onChange={(e) => setIssuer(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {issuers.map((i) => (
                                        <option key={i.id} value={i.name}>
                                            {i.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {issuers.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    ※「設定」画面から発行者を登録してください。
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="notes" className="block text-sm font-medium leading-6 text-slate-900">
                                備考
                            </label>
                            <div className="mt-2">
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={3}
                                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="備考欄（任意）"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end pt-6">
                    <Link href="/orders" className="text-sm font-semibold leading-6 text-slate-900 mr-4">
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        発注書を作成
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewOrderContent />
        </Suspense>
    );
}
