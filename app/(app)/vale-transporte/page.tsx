import { TransportVoucherView } from "@/presentation/transport-voucher/transport-voucher-view";

export const metadata = {
  title: "Vale Transporte | Star Seg",
  description: "Gestão e emissão de recibos de vale transporte.",
};

export default function ValeTransportePage() {
  return <TransportVoucherView />;
}
