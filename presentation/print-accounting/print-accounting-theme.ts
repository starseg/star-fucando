import { Bus, Utensils, Award } from "lucide-react";

export function getThemeConfig(tipo: string | undefined) {
  switch (tipo) {
    case "transporte":
      return {
        title: "Relatório de Vale Transporte",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        accentColor: "text-amber-400",
        icon: Bus,
      };
    case "alimentacao":
      return {
        title: "Relatório de Vale Alimentação",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        accentColor: "text-emerald-400",
        icon: Utensils,
      };
    case "assiduidade":
    default:
      return {
        title: "Relatório de Prêmio Assiduidade",
        badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        accentColor: "text-sky-400",
        icon: Award,
      };
  }
}
