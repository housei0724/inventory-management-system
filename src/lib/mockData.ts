import { Item, Supplier, Requester, Order, Project } from '@/types';

export const MOCK_ITEMS: Item[] = [
    {
        id: '1',
        name: 'コピー用紙 A4',
        sku: 'PPR-A4-001',
        category: '事務用品',
        quantity: 50,
        minStockLevel: 10,
        unit: '束',
        unitPrice: 500,
        description: '一般的なA4コピー用紙です。',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'ボールペン (黒)',
        sku: 'PEN-BLK-001',
        category: '事務用品',
        quantity: 120,
        minStockLevel: 20,
        unit: '本',
        unitPrice: 100,
        description: '事務用ボールペン（黒）です。',
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        name: 'トナーカートリッジ (黒)',
        sku: 'TNR-BLK-001',
        category: '消耗品',
        quantity: 2,
        minStockLevel: 3,
        unit: '個',
        unitPrice: 8000,
        description: 'プリンター用トナーカートリッジ（黒）です。',
        updatedAt: new Date().toISOString(),
    },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: '1',
        name: 'オフィスサプライ株式会社',
        contactName: '山田 太郎',
        email: 'yamada@officesupply.example.com',
        phone: '03-1234-5678',
        address: '東京都千代田区1-1-1',
    },
    {
        id: '2',
        name: 'テックガジェット合同会社',
        contactName: '佐藤 花子',
        email: 'sato@techgadget.example.com',
        phone: '03-9876-5432',
        address: '東京都渋谷区2-2-2',
    },
];

export const MOCK_REQUESTERS: Requester[] = [
    {
        id: '1',
        name: '総務部',
        department: '総務',
    },
    {
        id: '2',
        name: '開発部',
        department: '開発',
    },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        name: '渋谷オフィス改装工事',
        projectNumber: 'PJ-2023-001',
        status: 'active',
        address: '東京都渋谷区...',
        manager: '鈴木 一郎',
    },
    {
        id: '2',
        name: '新宿ビル新築工事',
        projectNumber: 'PJ-2023-002',
        status: 'active',
        address: '東京都新宿区...',
        manager: '田中 次郎',
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: '1',
        orderNumber: 'ORD-2023-001',
        supplierId: '1',
        requesterId: '1',
        items: [
            { itemId: '1', quantity: 10, pricePerUnit: 500 },
        ],
        status: 'received',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    },
    {
        id: '2',
        orderNumber: 'ORD-2023-002',
        supplierId: '2',
        projectId: '1', // Linked to Shibuya project
        items: [
            { itemId: '2', quantity: 50, pricePerUnit: 100 },
        ],
        status: 'ordered',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
];
