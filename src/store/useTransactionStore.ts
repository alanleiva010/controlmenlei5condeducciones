import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '../types';
import { useCajaStore } from './useCajaStore';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getTransactionsByDate: (startDate: Date, endDate: Date) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
        };

        const updateCajaBalance = useCajaStore.getState().updateBalance;
        const updateBankBalance = useCajaStore.getState().updateBankBalance;
        const amount = transaction.amount;
        const calculatedAmount = transaction.calculatedAmount;
        const netAmount = transaction.netAmount;
        const bankId = transaction.bankId;

        switch (transaction.currencyOperation) {
          case 'ARS_IN':
            updateCajaBalance('ARS', netAmount || amount);
            if (bankId) {
              updateBankBalance(bankId, 'ARS', netAmount || amount); // Banco aumenta
            }
            break;
          case 'ARS_OUT':
            updateCajaBalance('ARS', -(netAmount || amount));
            if (bankId) {
              updateBankBalance(bankId, 'ARS', -(netAmount || amount)); // Banco disminuye
            }
            break;
          case 'USDT_BUY':
            updateCajaBalance('ARS', -(netAmount || amount));
            if (bankId) {
              updateBankBalance(bankId, 'ARS', -(netAmount || amount));
            }
            if (calculatedAmount) {
              updateCajaBalance('USDT', calculatedAmount);
            }
            break;
          case 'USDT_SELL':
            updateCajaBalance('USDT', -amount);
            if (calculatedAmount) {
              updateCajaBalance('ARS', netAmount || calculatedAmount);
              if (bankId) {
                updateBankBalance(bankId, 'ARS', netAmount || calculatedAmount);
              }
            }
            break;
          case 'USDT_IN':
            updateCajaBalance('USDT', amount);
            break;
          case 'USDT_OUT':
            updateCajaBalance('USDT', -amount);
            break;
          case 'USD_IN':
            updateCajaBalance('USD', amount);
            break;
          case 'USD_OUT':
            updateCajaBalance('USD', -amount);
            break;
          case 'USD_BUY':
            updateCajaBalance('ARS', -(netAmount || amount));
            if (bankId) {
              updateBankBalance(bankId, 'ARS', -(netAmount || amount));
            }
            if (calculatedAmount) {
              updateCajaBalance('USD', calculatedAmount);
            }
            break;
          case 'USD_SELL':
            updateCajaBalance('USD', -amount);
            if (calculatedAmount) {
              updateCajaBalance('ARS', netAmount || calculatedAmount);
              if (bankId) {
                updateBankBalance(bankId, 'ARS', netAmount || calculatedAmount);
              }
            }
            break;
        }

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      getTransactionsByDate: (startDate: Date, endDate: Date) => {
        return get().transactions.filter(
          (transaction) =>
            transaction.date >= startDate && transaction.date <= endDate
        );
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);