import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function formatCurrency(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`;
}

async function consolidateDuplicates() {
  const vouchers = await prisma.transportVoucher.findMany({
    include: { modals: true, employee: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, typeof vouchers>();
  for (const v of vouchers) {
    const key = `${v.employeeId}|${v.referenceMonth.toISOString()}`;
    const arr = groups.get(key) ?? [];
    arr.push(v);
    groups.set(key, arr);
  }

  const duplicateGroups = [...groups.values()].filter((arr) => arr.length > 1);

  if (duplicateGroups.length === 0) {
    console.log("Nenhuma duplicata de (employeeId, referenceMonth) encontrada.");
    return;
  }

  console.log(`\n=== Consolidando ${duplicateGroups.length} grupo(s) duplicado(s) ===`);

  for (const group of duplicateGroups) {
    const [keep, ...rest] = group; // ordenado por createdAt asc, o primeiro é o mais antigo
    console.log(
      `Colaborador ${keep.employee.name} (${keep.referenceMonth.toISOString().slice(0, 10)}): ` +
        `mantendo voucher ${keep.id}, mesclando e removendo ${rest.map((r) => r.id).join(", ")}`
    );

    for (const dup of rest) {
      for (const m of dup.modals) {
        await prisma.transportModal.update({
          where: { id: m.id },
          data: { transportVoucherId: keep.id },
        });
      }
      await prisma.transportVoucher.delete({ where: { id: dup.id } });
    }
  }
}

async function main() {
  await consolidateDuplicates();

  const vouchers = await prisma.transportVoucher.findMany({
    include: { modals: true, employee: { select: { name: true } } },
  });

  type Correction = {
    voucherId: string;
    employeeName: string;
    oldTotalVouchers: number;
    newTotalVouchers: number;
    oldTotalValue: number;
    newTotalValue: number;
    modalUpdates: { id: string; oldSubtotal: number; newSubtotal: number }[];
  };

  const corrections: Correction[] = [];
  let alreadyCorrect = 0;

  console.log("\n=== Relatório de divergências ===");

  for (const v of vouchers) {
    const modalUpdates: Correction["modalUpdates"] = [];
    let newTotalVouchers = 0;
    let newTotalValueRaw = 0;

    for (const m of v.modals) {
      const quantity = Number(m.quantity);
      const unitValue = Number(m.unitValue);
      const oldSubtotal = Number(m.subtotal);
      const newSubtotal = round2(quantity * unitValue);

      newTotalVouchers += quantity;
      newTotalValueRaw += newSubtotal;

      if (oldSubtotal !== newSubtotal) {
        modalUpdates.push({ id: m.id, oldSubtotal, newSubtotal });
      }
    }

    const newTotalValue = round2(newTotalValueRaw);
    const oldTotalVouchers = Number(v.totalVouchers);
    const oldTotalValue = Number(v.totalValue);

    const hasDivergence =
      oldTotalVouchers !== newTotalVouchers ||
      oldTotalValue !== newTotalValue ||
      modalUpdates.length > 0;

    if (hasDivergence) {
      console.log(
        `Voucher ${v.id} (colaborador ${v.employee.name}): ` +
          `totalVouchers ${oldTotalVouchers}->${newTotalVouchers}, ` +
          `totalValue ${formatCurrency(oldTotalValue)}->${formatCurrency(newTotalValue)}`
      );

      corrections.push({
        voucherId: v.id,
        employeeName: v.employee.name,
        oldTotalVouchers,
        newTotalVouchers,
        oldTotalValue,
        newTotalValue,
        modalUpdates,
      });
    } else {
      alreadyCorrect++;
    }
  }

  console.log(`\n=== Aplicando ${corrections.length} correção(ões) ===`);

  for (const c of corrections) {
    await prisma.$transaction(async (tx) => {
      for (const m of c.modalUpdates) {
        await tx.transportModal.update({
          where: { id: m.id },
          data: { subtotal: m.newSubtotal },
        });
      }
      await tx.transportVoucher.update({
        where: { id: c.voucherId },
        data: {
          totalVouchers: c.newTotalVouchers,
          totalValue: c.newTotalValue,
        },
      });
    });
    console.log(`Corrigido: voucher ${c.voucherId} (${c.employeeName})`);
  }

  console.log("\n=== Resumo ===");
  console.log(`Vouchers corrigidos: ${corrections.length}`);
  console.log(`Vouchers já corretos: ${alreadyCorrect}`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar o script de reparo:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
