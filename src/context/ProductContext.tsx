import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Sale } from '@/types/product';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'usageCount' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  completeSale: (items: CartItem[], customerId?: string, isPending?: boolean) => Sale;
  getMostUsedProducts: (limit?: number) => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'shop_products';

const defaultProducts: Product[] = [
  { id: '1', name: 'Milk 1L', price: 60, stock: 50, usageCount: 120, createdAt: new Date() },
  { id: '2', name: 'Bread Loaf', price: 45, stock: 30, usageCount: 95, createdAt: new Date() },
  { id: '3', name: 'Eggs (12 pack)', price: 90, stock: 25, usageCount: 88, createdAt: new Date() },
  { id: '4', name: 'Butter 250g', price: 55, stock: 20, usageCount: 72, createdAt: new Date() },
  { id: '5', name: 'Cheese Block', price: 150, stock: 15, usageCount: 65, createdAt: new Date() },
  { id: '6', name: 'Orange Juice 1L', price: 80, stock: 40, usageCount: 58, createdAt: new Date() },
  { id: '7', name: 'Yogurt 500g', price: 35, stock: 35, usageCount: 45, createdAt: new Date() },
  { id: '8', name: 'Coffee Powder 500g', price: 250, stock: 18, usageCount: 40, createdAt: new Date() },
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: Product) => ({ ...p, createdAt: new Date(p.createdAt) }));
    }
    return defaultProducts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'usageCount' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      usageCount: 0,
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const completeSale = (items: CartItem[], customerId?: string, isPending?: boolean): Sale => {
    const sale: Sale = {
      id: crypto.randomUUID(),
      items,
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      date: new Date(),
      customerId,
      isPending,
    };

    setProducts(prev =>
      prev.map(p => {
        const cartItem = items.find(item => item.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: p.stock - cartItem.quantity,
            usageCount: p.usageCount + cartItem.quantity,
          };
        }
        return p;
      })
    );

    return sale;
  };

  const getMostUsedProducts = (limit = 8): Product[] => {
    return [...products]
      .filter(p => p.stock > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  };

  const searchProducts = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return products.filter(p => p.stock > 0);
    return products.filter(
      p => p.name.toLowerCase().includes(lowerQuery) && p.stock > 0
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        completeSale,
        getMostUsedProducts,
        searchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
