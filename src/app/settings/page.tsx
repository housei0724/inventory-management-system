'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Trash, Pencil } from 'lucide-react';

export default function SettingsPage() {
    const { issuers, addIssuer, updateIssuer, deleteIssuer } = useApp();
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await addIssuer({ name: newName.trim() });
        setNewName('');
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        await updateIssuer(id, { name: editName.trim() });
        setEditingId(null);
        setEditName('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('この発行者を削除してもよろしいですか？')) {
            await deleteIssuer(id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">設定</h2>

            <div className="rounded-lg bg-white p-6 shadow space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">発行者の管理</h3>
                <p className="text-sm text-slate-600 mb-4">
                    新規発注画面で選択できる「発行者（担当者）」を管理します。
                </p>

                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="新しい発行者の名前"
                        className="block w-full max-w-sm rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                        disabled={!newName.trim()}
                    >
                        <Plus className="h-4 w-4" /> 追加
                    </button>
                </form>

                <div className="mt-4">
                    {issuers.length === 0 ? (
                        <p className="text-sm text-slate-500">発行者が登録されていません。上のフォームから追加してください。</p>
                    ) : (
                        <ul className="divide-y divide-slate-200 border rounded-md">
                            {issuers.map((issuer) => (
                                <li key={issuer.id} className="flex items-center justify-between p-3 flex-wrap gap-2 hover:bg-slate-50">
                                    {editingId === issuer.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="block w-full max-w-sm rounded-md border-0 py-1 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            <button
                                                onClick={() => handleUpdate(issuer.id)}
                                                className="text-sm rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-500 font-semibold"
                                                disabled={!editName.trim()}
                                            >
                                                保存
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); setEditName(''); }}
                                                className="text-sm rounded-md bg-white px-3 py-1.5 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 font-semibold"
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium text-slate-900">{issuer.name}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setEditingId(issuer.id); setEditName(issuer.name); }}
                                                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" /> 編集
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(issuer.id)}
                                                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-red-50"
                                                >
                                                    <Trash className="h-3.5 w-3.5" /> 削除
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
