export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  usageCount: number;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  customerId?: string;
  isPending?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  pendingAmount: number;
  createdAt: Date;
  transactions: CustomerTransaction[];
}

export interface CustomerTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'payment';
  description: string;
  date: Date;
  saleId?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  shopName: string;
}

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;
