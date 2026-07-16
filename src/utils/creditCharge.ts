import { chargeConfirm, getCreditBalance } from '../api/partnerCreditApi';

export interface ChargeSuccessParams {
  paymentKey: string;
  orderId: string;
  amount: string;
}

export type ChargeSuccessResult =
  | { status: 'confirmed'; balance: number; chargedCredit: number }
  | { status: 'already-processed'; balance: number };

export async function handleChargeSuccess(
  params: ChargeSuccessParams,
): Promise<ChargeSuccessResult> {
  try {
    const res = await chargeConfirm({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: Number(params.amount),
    });
    return { status: 'confirmed', balance: res.balance, chargedCredit: res.chargedCredit };
  } catch (e: any) {
    if (e?.response?.data?.code === 'CREDIT-002') {
      const { balance } = await getCreditBalance();
      return { status: 'already-processed', balance };
    }
    throw e;
  }
}
