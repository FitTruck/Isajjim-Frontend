import api from './axiosInstance';
import {
  BalanceResponse,
  ChargeConfirmRequest,
  ChargeConfirmResponse,
  ChargeReadyResponse,
  CreditTransactionPage,
} from '../types/partnerCredit';

export const chargeReady = async (amount: number): Promise<ChargeReadyResponse> => {
  const res = await api.post('/api/v1/partner-credits/charges/ready', { amount });
  return res.data.data;
};

export const chargeConfirm = async (
  payload: ChargeConfirmRequest,
): Promise<ChargeConfirmResponse> => {
  const res = await api.post('/api/v1/partner-credits/charges/confirm', payload);
  return res.data.data;
};

export const getCreditBalance = async (): Promise<BalanceResponse> => {
  const res = await api.get('/api/v1/partner-credits/balance');
  return res.data.data;
};

export const getCreditTransactions = async (
  page = 0,
  size = 20,
): Promise<CreditTransactionPage> => {
  const res = await api.get('/api/v1/partner-credits/transactions', {
    params: { page, size, sort: 'createdDate,desc' },
  });
  return res.data.data;
};
