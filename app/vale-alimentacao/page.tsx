import { MealVoucherView } from "@/presentation/meal-voucher/meal-voucher-view";

export const metadata = {
  title: "Vale Alimentação | Star Seg",
  description: "Gestão e emissão de recibos de vale alimentação.",
};

export default function ValeAlimentacaoPage() {
  return <MealVoucherView />;
}
