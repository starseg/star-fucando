export interface TransportModalCalculatorInput {
  id?: string;
  name: string;
  unitValue: number;
  quantity: number;
}

export interface RecalculatedTransportModal {
  id?: string;
  name: string;
  unitValue: number;
  quantity: number;
  subtotal: number;
}

export interface RecalculateModalsResult {
  recalculated: RecalculatedTransportModal[];
  totalVouchers: number;
  totalValue: number;
  inboundValue: number;
  outboundValue: number;
}

export function recalculateModals(modals: TransportModalCalculatorInput[]): RecalculateModalsResult {
  const recalculated = modals.map((m) => ({
    id: m.id,
    name: m.name,
    unitValue: m.unitValue,
    quantity: m.quantity,
    subtotal: Number((m.quantity * m.unitValue).toFixed(2)),
  }));

  const totalVouchers = recalculated.reduce((sum, m) => sum + m.quantity, 0);
  const totalValue = Number(recalculated.reduce((sum, m) => sum + m.subtotal, 0).toFixed(2));

  let inboundModal = recalculated.find((m) => m.name.toLowerCase().includes("ida"));
  let outboundModal = recalculated.find((m) => m.name.toLowerCase().includes("volta"));

  if (!inboundModal && !outboundModal) {
    inboundModal = recalculated[0];
    outboundModal = recalculated[1];
  } else if (!inboundModal) {
    inboundModal = recalculated.find((m) => m !== outboundModal);
  } else if (!outboundModal) {
    outboundModal = recalculated.find((m) => m !== inboundModal);
  }

  const inboundValue = inboundModal?.unitValue ?? 0;
  const outboundValue = recalculated.length > 1 ? outboundModal?.unitValue ?? 0 : 0;

  return { recalculated, totalVouchers, totalValue, inboundValue, outboundValue };
}
