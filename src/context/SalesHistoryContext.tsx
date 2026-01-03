import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale } from '@/types/product';

interface SalesHistoryContextType {
  sales: Sale[];
  addSale: (sale: Sale) => void;
  getSalesByDateRange: (start: Date, end: Date) => Sale[];
  getMonthlySalesData: () => MonthlySalesData[];
  getTopProductsByMonth: (year: number, month: number) => ProductSalesData[];
  getTotalSalesByMonth: () => { month: string; total: number; count: number }[];
}

export interface MonthlySalesData {
  month: string;
  year: number;
  monthNum: number;
  total: number;
  count: number;
}

export interface ProductSalesData {
  productName: string;
  quantity: number;
  revenue: number;
}

const SalesHistoryContext = createContext<SalesHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'shop_sales_history';

export function SalesHistoryProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: Sale) => ({ ...s, date: new Date(s.date) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
  };

  const getSalesByDateRange = (start: Date, end: Date): Sale[] => {
    return sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= start && saleDate <= end;
    });
  };

  const getMonthlySalesData = (): MonthlySalesData[] => {
    const monthlyData: Record<string, MonthlySalesData> = {};

    sales.forEach(sale => {
      const date = new Date(sale.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: monthName,
          year: date.getFullYear(),
          monthNum: date.getMonth(),
          total: 0,
          count: 0,
        };
      }

      monthlyData[key].total += sale.total;
      monthlyData[key].count += 1;
    });

    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNum - b.monthNum;
    });
  };

  const getTopProductsByMonth = (year: number, month: number): ProductSalesData[] => {
    const productData: Record<string, ProductSalesData> = {};

    sales
      .filter(s => {
        const date = new Date(s.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .forEach(sale => {
        sale.items.forEach(item => {
          const key = item.product.name;
          if (!productData[key]) {
            productData[key] = {
              productName: item.product.name,
              quantity: 0,
              revenue: 0,
            };
          }
          productData[key].quantity += item.quantity;
          productData[key].revenue += item.product.price * item.quantity;
        });
      });

    return Object.values(productData)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const getTotalSalesByMonth = () => {
    return getMonthlySalesData().map(m => ({
      month: `${m.month} ${m.year}`,
      total: m.total,
      count: m.count,
    }));
  };

  return (
    <SalesHistoryContext.Provider
      value={{
        sales,
        addSale,
        getSalesByDateRange,
        getMonthlySalesData,
        getTopProductsByMonth,
        getTotalSalesByMonth,
      }}
    >
      {children}
    </SalesHistoryContext.Provider>
  );
}

export function useSalesHistory() {
  const context = useContext(SalesHistoryContext);
  if (!context) {
    throw new Error('useSalesHistory must be used within a SalesHistoryProvider');
  }
  return context;
}
