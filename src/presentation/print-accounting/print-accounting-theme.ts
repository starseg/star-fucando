import { Bus, Utensils, Award, HandCoins } from "lucide-react";

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
      return {
        title: "Relatório de Prêmio Assiduidade",
        badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        accentColor: "text-sky-400",
        icon: Award,
      };
    case "comissao":
    default:
      return {
        title: "Relatório de Comissões",
        badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        accentColor: "text-violet-400",
        icon: HandCoins,
      };
  }
}
