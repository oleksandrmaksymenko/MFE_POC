export type Invoice = { id: string; amount: number; paid: boolean };
export type BillingProps = { userId: string };
export type BillingState = { userId: string; invoices: Invoice[]; renderedAt: string };
