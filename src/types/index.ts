// Previous types remain the same...

export interface Transaction {
  id: string;
  clientId: string;
  operatorId: string;
  operationType: string;
  currencyOperation: string;
  amount: number;
  netAmount?: number;
  exchangeRate?: number;
  calculatedAmount?: number;
  description?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  date: Date;
  bankId?: string;
  deductions?: {
    iibb: boolean;
    debCred: boolean;
    copter: boolean;
    custom: boolean;
    customValue?: number;
  };
}