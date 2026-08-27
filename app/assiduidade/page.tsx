import { AttendanceAwardView } from "@/presentation/attendance-award/attendance-award-view";

export const metadata = {
  title: "Prêmio Assiduidade | Star Seg",
  description: "Gestão e emissão de recibos de premiação de assiduidade.",
};

export default function AssiduidadePage() {
  return <AttendanceAwardView />;
}
