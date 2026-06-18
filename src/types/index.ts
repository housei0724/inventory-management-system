export type Item = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  unit: string;
  unitPrice: number; // 発注用単価 (材料費)
  estimateUnitPrice?: number; // 見積用M単価 (材料費＋労務費など)
  description?: string;
  updatedAt: string;
};

export type InventoryCheckItem = {
  itemId: string;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  notes?: string;
};

export type InventoryCheck = {
  id: string;
  date: string;
  status: 'draft' | 'completed';
  items: InventoryCheckItem[];
  conductedBy: string; // The ID or Name of the person who conducted the check
  notes?: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
};

export type Requester = {
  id: string;
  name: string;
  department: string;
};

export type Issuer = {
  id: string;
  name: string;
};

export type Project = {
  id: string;
  name: string;
  projectNumber: string;
  status: 'active' | 'completed' | 'on_hold';
  address?: string;
  manager?: string;
  contractAmount?: number;
  budgetMaterialCost?: number;    // 積算材料費
  budgetConstructionCost?: number; // 積算工事費
  budgetOtherCost?: number;       // 積算その他費
};

export type MonthlyBudget = {
  id: string;
  projectId: string;
  yearMonth: string;
  // 計画（積算）
  plannedMaterialCost?: number;
  plannedConstructionCost?: number;
  plannedOtherCost?: number;
  plannedBillingAmount?: number;
  // 実績
  materialCost: number;
  constructionCost: number;
  otherCost: number;
  billingAmount: number;
  notes?: string;
};

export type OrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export type OrderItem = {
  itemId: string;
  quantity: number;
  pricePerUnit?: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  supplierId: string;
  requesterId?: string; // Optional if linked to a project
  projectId?: string;   // Linked to a construction site
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  expectedDate?: string;
  issuer?: string;      // Person who created the order
  notes?: string;
};

export type EstimateItem = {
  type?: 'item' | 'heading'; // 'heading' の場合は見出し行
  itemName?: string; // 見出し行のテキスト、または通常アイテムの一時的な品名上書き
  itemId: string; // 見出し行の場合は空文字列でOK
  dimension?: string;
  quantity: number;
  unit?: string; // 単価表から登録した場合などの単位の上書き
  appliedPrice: number;
};

export type Estimate = {
  id: string;
  addressee: string;
  projectName: string;
  items: EstimateItem[];
  totalAmount: number;
  createdAt: string;
  status?: 'draft' | 'submitted' | 'accepted' | 'rejected';
};

export type PricingSize = {
  sizeName: string; // e.g. 15A
  baseMaterialId?: string;
  baseMaterialCost: number;
  finishMaterialId?: string;
  finishMaterialCost: number;
  auxiliaryMaterialCost: number; // 副資材費（在庫管理外の細々した材料）
  laborCost: number;
  compositePrice: number; // baseMaterialCost + finishMaterialCost + auxiliaryMaterialCost + laborCost
};

export type PricingGroup = {
  id: string;
  materialName: string; // e.g. グラスウール
  finishName: string; // e.g. カラー鉄板
  thickness: string; // e.g. 20mm
  unit: string; // e.g. M
  sizes: PricingSize[];
  createdAt: string;
  updatedAt: string;
};
