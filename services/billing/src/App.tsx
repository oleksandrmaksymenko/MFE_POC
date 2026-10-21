import { useState } from 'react';
import type { BillingState } from './types';

export function App({ userId, invoices: initial, renderedAt }: BillingState) {
  const [invoices, setInvoices] = useState(initial);
  const debt = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);

  const pay = (id: string) =>
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, paid: true } : i)));

  return (
    <section className="card">
      <h2>Billing</h2>
      <p className="meta">
        user <b>{userId}</b> · SSR at {renderedAt}
      </p>
      <ul>
        {invoices.map((i) => (
          <li key={i.id}>
            <span>{i.id}</span>
            <span>${i.amount}</span>
            {i.paid ? (
              <span className="paid">paid</span>
            ) : (
              <button data-testid={`pay-${i.id}`} onClick={() => pay(i.id)}>
                Pay
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="debt" data-testid="debt">
        Debt: ${debt}
      </p>
    </section>
  );
}
