'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Supplier, Requester, Order, Project, MonthlyBudget, Issuer, InventoryCheck, Estimate, PricingGroup } from '@/types';
import { db } from '@/lib/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';

interface AppContextType {
    items: Item[];
    suppliers: Supplier[];
    requesters: Requester[];
    projects: Project[];
    orders: Order[];
    monthlyBudgets: MonthlyBudget[];
    issuers: Issuer[];
    inventoryChecks: InventoryCheck[];
    addItem: (item: Omit<Item, 'id'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
    addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
    updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;
    addProject: (project: Omit<Project, 'id'>) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
    updateRequester: (id: string, updates: Partial<Requester>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    deleteItems: (ids: string[]) => Promise<void>;
    addMonthlyBudget: (budget: Omit<MonthlyBudget, 'id'>) => Promise<void>;
    updateMonthlyBudget: (id: string, updates: Partial<MonthlyBudget>) => Promise<void>;
    deleteMonthlyBudget: (id: string) => Promise<void>;
    addIssuer: (issuer: Omit<Issuer, 'id'>) => Promise<void>;
    updateIssuer: (id: string, updates: Partial<Issuer>) => Promise<void>;
    deleteIssuer: (id: string) => Promise<void>;
    addInventoryCheck: (check: Omit<InventoryCheck, 'id'>) => Promise<string>;
    updateInventoryCheck: (id: string, updates: Partial<InventoryCheck>) => Promise<void>;
    deleteInventoryCheck: (id: string) => Promise<void>;
    completeInventoryCheck: (id: string, items: { itemId: string, actualQuantity: number }[]) => Promise<void>;
    estimates: Estimate[];
    addEstimate: (estimate: Omit<Estimate, 'id'>) => Promise<string>;
    updateEstimate: (id: string, updates: Partial<Estimate>) => Promise<void>;
    deleteEstimate: (id: string) => Promise<void>;
    pricingGroups: PricingGroup[];
    addPricingGroup: (group: Omit<PricingGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updatePricingGroup: (id: string, updates: Partial<PricingGroup>) => Promise<void>;
    deletePricingGroup: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Item[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [requesters, setRequesters] = useState<Requester[]>([
        { id: '1', name: '総務部', department: '総務' },
        { id: '2', name: '開発部', department: '開発' },
    ]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [inventoryChecks, setInventoryChecks] = useState<InventoryCheck[]>([]);
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [pricingGroups, setPricingGroups] = useState<PricingGroup[]>([]);

    useEffect(() => {
        // Helper function to handle Firebase errors
        const handleFirebaseError = (error: Error, collectionName: string) => {
            // Use console.warn to prevent errors from showing in Next.js dev overlay
            if (error.message.includes('permission-denied')) {
                console.warn(`Firebase: ${collectionName} コレクションへのアクセス権限がありません。Firebaseコンソールでセキュリティルールを確認してください。`);
            } else {
                console.warn(`Firebase ${collectionName} warning:`, error.message);
            }
        };

        // Items Listener
        const qItems = query(collection(db, 'items'), orderBy('updatedAt', 'desc'));
        const unsubscribeItems = onSnapshot(
            qItems,
            (snapshot) => {
                const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
                setItems(itemsData);
            },
            (error) => handleFirebaseError(error, 'items')
        );

        // Suppliers Listener
        const unsubscribeSuppliers = onSnapshot(
            collection(db, 'suppliers'),
            (snapshot) => {
                const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
                setSuppliers(suppliersData);
            },
            (error) => handleFirebaseError(error, 'suppliers')
        );

        // Projects Listener
        const unsubscribeProjects = onSnapshot(
            collection(db, 'projects'),
            (snapshot) => {
                const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
            },
            (error) => handleFirebaseError(error, 'projects')
        );

        // Orders Listener
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribeOrders = onSnapshot(
            qOrders,
            (snapshot) => {
                const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                setOrders(ordersData);
            },
            (error) => handleFirebaseError(error, 'orders')
        );

        // Monthly Budgets Listener
        const unsubscribeMonthlyBudgets = onSnapshot(
            collection(db, 'monthlyBudgets'),
            (snapshot) => {
                const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonthlyBudget));
                setMonthlyBudgets(budgetsData);
            },
            (error) => handleFirebaseError(error, 'monthlyBudgets')
        );

        // Issuers Listener
        const unsubscribeIssuers = onSnapshot(
            collection(db, 'issuers'),
            (snapshot) => {
                const issuersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issuer));
                setIssuers(issuersData);
            },
            (error) => handleFirebaseError(error, 'issuers')
        );

        // Inventory Checks Listener
        const qInventoryChecks = query(collection(db, 'inventoryChecks'), orderBy('createdAt', 'desc'));
        const unsubscribeInventoryChecks = onSnapshot(
            qInventoryChecks,
            (snapshot) => {
                const inventoryChecksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryCheck));
                setInventoryChecks(inventoryChecksData);
            },
            (error) => handleFirebaseError(error, 'inventoryChecks')
        );

        // Estimates Listener
        const qEstimates = query(collection(db, 'estimates'), orderBy('createdAt', 'desc'));
        const unsubscribeEstimates = onSnapshot(
            qEstimates,
            (snapshot) => {
                const estimatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
                setEstimates(estimatesData);
            },
            (error) => handleFirebaseError(error, 'estimates')
        );

        // PricingGroups Listener
        const qPricingGroups = query(collection(db, 'pricingGroups'), orderBy('createdAt', 'desc'));
        const unsubscribePricingGroups = onSnapshot(
            qPricingGroups,
            (snapshot) => {
                const pricingGroupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PricingGroup));
                setPricingGroups(pricingGroupsData);
            },
            (error) => handleFirebaseError(error, 'pricingGroups')
        );

        return () => {
            unsubscribeItems();
            unsubscribeSuppliers();
            unsubscribeProjects();
            unsubscribeOrders();
            unsubscribeMonthlyBudgets();
            unsubscribeIssuers();
            unsubscribeInventoryChecks();
            unsubscribeEstimates();
            unsubscribePricingGroups();
        };
    }, []);

    const addItem = async (item: Omit<Item, 'id'>) => {
        await addDoc(collection(db, 'items'), {
            ...item,
            updatedAt: new Date().toISOString()
        });
    };

    const updateItem = async (id: string, updates: Partial<Item>) => {
        const itemRef = doc(db, 'items', id);
        await updateDoc(itemRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    };

    const addOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
        const orderData = {
            ...order,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        // onSnapshot が非同期で反映される前にページ遷移すると新規発注が見つからないため
        // 楽観的に即座にローカルステートへ追加する
        setOrders(prev => [{ id: docRef.id, ...orderData } as Order, ...prev]);
        return docRef.id;
    };

    const updateOrder = async (id: string, updates: Partial<Order>) => {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, updates);
    };

    const deleteOrder = async (id: string) => {
        const orderRef = doc(db, 'orders', id);
        await deleteDoc(orderRef);
    };

    const addProject = async (project: Omit<Project, 'id'>) => {
        await addDoc(collection(db, 'projects'), project);
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        const projectRef = doc(db, 'projects', id);
        await updateDoc(projectRef, updates);
    };

    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        await addDoc(collection(db, 'suppliers'), supplier);
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        const supplierRef = doc(db, 'suppliers', id);
        await updateDoc(supplierRef, updates);
    };

    const updateRequester = async (id: string, updates: Partial<Requester>) => {
        // Requesters are currently stored in local state, not Firestore
        setRequesters(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteItem = async (id: string) => {
        const itemRef = doc(db, 'items', id);
        await deleteDoc(itemRef);
    };

    const deleteItems = async (ids: string[]) => {
        const deletePromises = ids.map(id => {
            const itemRef = doc(db, 'items', id);
            return deleteDoc(itemRef);
        });
        await Promise.all(deletePromises);
    };

    const addMonthlyBudget = async (budget: Omit<MonthlyBudget, 'id'>) => {
        await addDoc(collection(db, 'monthlyBudgets'), budget);
    };

    const updateMonthlyBudget = async (id: string, updates: Partial<MonthlyBudget>) => {
        const budgetRef = doc(db, 'monthlyBudgets', id);
        await updateDoc(budgetRef, updates);
    };

    const deleteMonthlyBudget = async (id: string) => {
        const budgetRef = doc(db, 'monthlyBudgets', id);
        await deleteDoc(budgetRef);
    };

    const addIssuer = async (issuer: Omit<Issuer, 'id'>) => {
        await addDoc(collection(db, 'issuers'), issuer);
    };

    const updateIssuer = async (id: string, updates: Partial<Issuer>) => {
        const issuerRef = doc(db, 'issuers', id);
        await updateDoc(issuerRef, updates);
    };

    const deleteIssuer = async (id: string) => {
        const issuerRef = doc(db, 'issuers', id);
        await deleteDoc(issuerRef);
    };

    const addInventoryCheck = async (check: Omit<InventoryCheck, 'id'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'inventoryChecks'), {
            ...check,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    };

    const updateInventoryCheck = async (id: string, updates: Partial<InventoryCheck>) => {
        const checkRef = doc(db, 'inventoryChecks', id);
        await updateDoc(checkRef, updates);
    };

    const deleteInventoryCheck = async (id: string) => {
        const checkRef = doc(db, 'inventoryChecks', id);
        await deleteDoc(checkRef);
    };

    const completeInventoryCheck = async (id: string, itemsToUpdate: { itemId: string, actualQuantity: number }[]) => {
        // First update the inventory check status to completed
        const checkRef = doc(db, 'inventoryChecks', id);
        await updateDoc(checkRef, {
            status: 'completed'
        });

        // Then update all corresponding item quantities
        const updatePromises = itemsToUpdate.map(async (update) => {
            const itemRef = doc(db, 'items', update.itemId);
            await updateDoc(itemRef, {
                quantity: update.actualQuantity,
                updatedAt: new Date().toISOString()
            });
        });

        await Promise.all(updatePromises);
    };

    const addEstimate = async (estimate: Omit<Estimate, 'id'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'estimates'), {
            ...estimate,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    };

    const updateEstimate = async (id: string, updates: Partial<Estimate>) => {
        const estimateRef = doc(db, 'estimates', id);
        await updateDoc(estimateRef, updates);
    };

    const deleteEstimate = async (id: string) => {
        const estimateRef = doc(db, 'estimates', id);
        await deleteDoc(estimateRef);
    };

    const addPricingGroup = async (group: Omit<PricingGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'pricingGroups'), {
            ...group,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return docRef.id;
    };

    const updatePricingGroup = async (id: string, updates: Partial<PricingGroup>) => {
        const groupRef = doc(db, 'pricingGroups', id);
        await updateDoc(groupRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    };

    const deletePricingGroup = async (id: string) => {
        const groupRef = doc(db, 'pricingGroups', id);
        await deleteDoc(groupRef);
    };

    return (
        <AppContext.Provider
            value={{
                items,
                suppliers,
                requesters,
                projects,
                orders,
                monthlyBudgets,
                issuers,
                addItem,
                updateItem,
                addOrder,
                updateOrder,
                deleteOrder,
                addProject,
                updateProject,
                addSupplier,
                updateSupplier,
                updateRequester,
                deleteItem,
                deleteItems,
                addMonthlyBudget,
                updateMonthlyBudget,
                deleteMonthlyBudget,
                addIssuer,
                updateIssuer,
                deleteIssuer,
                inventoryChecks,
                addInventoryCheck,
                updateInventoryCheck,
                deleteInventoryCheck,
                completeInventoryCheck,
                estimates,
                addEstimate,
                updateEstimate,
                deleteEstimate,
                pricingGroups,
                addPricingGroup,
                updatePricingGroup,
                deletePricingGroup,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
