import { roundMoney } from "@/lib/number";

export function toPlainMoney(value: unknown): number {
  return roundMoney(Number(value));
}

export function toNullablePlainMoney(value: unknown): number | null {
  return value == null ? null : toPlainMoney(value);
}
