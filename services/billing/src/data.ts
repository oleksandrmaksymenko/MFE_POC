import type { BillingProps, BillingState } from './types';

export async function loadData({ userId }: BillingProps): Promise<BillingState> {
  await new Promise((r) => setTimeout(r, 50));
  return {
    userId,
    renderedAt: new Date().toISOString(),
    invoices: [
      { id: 'INV-001', amount: 120, paid: true },
      { id: 'INV-002', amount: 75, paid: false },
      { id: 'INV-003', amount: 310, paid: false },
    ],
  };
}
