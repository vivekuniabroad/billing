import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, CustomerTransaction } from '@/types/product';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'transactions' | 'pendingAmount'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addCredit: (customerId: string, amount: number, description: string, saleId?: string) => void;
  addPayment: (customerId: string, amount: number, description: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getTotalPendingAmount: () => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const STORAGE_KEY = 'shop_customers';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((c: Customer) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        transactions: c.transactions.map((t: CustomerTransaction) => ({
          ...t,
          date: new Date(t.date),
        })),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'transactions' | 'pendingAmount'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      pendingAmount: 0,
      createdAt: new Date(),
      transactions: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addCredit = (customerId: string, amount: number, description: string, saleId?: string) => {
    const transaction: CustomerTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: 'credit',
      description,
      date: new Date(),
      saleId,
    };

    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              pendingAmount: c.pendingAmount + amount,
              transactions: [...c.transactions, transaction],
            }
          : c
      )
    );
  };

  const addPayment = (customerId: string, amount: number, description: string) => {
    const transaction: CustomerTransaction = {
      id: crypto.randomUUID(),
      amount,
      type: 'payment',
      description,
      date: new Date(),
    };

    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              pendingAmount: Math.max(0, c.pendingAmount - amount),
              transactions: [...c.transactions, transaction],
            }
          : c
      )
    );
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  const getTotalPendingAmount = (): number => {
    return customers.reduce((sum, c) => sum + c.pendingAmount, 0);
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCredit,
        addPayment,
        getCustomerById,
        getTotalPendingAmount,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
