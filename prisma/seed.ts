import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed de dados...");

  // 1. Limpeza inicial
  await prisma.transportModal.deleteMany();
  await prisma.transportVoucher.deleteMany();
  await prisma.mealVoucher.deleteMany();
  await prisma.attendanceAward.deleteMany();
  await prisma.employee.deleteMany();

  console.log("🧹 Dados antigos removidos com sucesso.");

  // 2. Criação de Colaboradores
  const employeesData = [
    {
      name: "Lucas Silva de Oliveira",
      department: "Tecnologia da Informação",
      role: "Desenvolvedor Full Stack",
      admissionDate: new Date("2022-03-15T00:00:00.000Z"),
    },
    {
      name: "Mariana Souza Santos",
      department: "Recursos Humanos",
      role: "Analista de RH",
      admissionDate: new Date("2021-08-01T00:00:00.000Z"),
    },
    {
      name: "Carlos Eduardo Ferreira",
      department: "Operações e Logística",
      role: "Supervisor Operacional",
      admissionDate: new Date("2020-01-10T00:00:00.000Z"),
    },
    {
      name: "Beatriz Mendes Lima",
      department: "Financeiro",
      role: "Assistente Financeiro",
      admissionDate: new Date("2023-05-20T00:00:00.000Z"),
    },
    {
      name: "Rodrigo Costa Alencar",
      department: "Vendas e Comercial",
      role: "Executivo de Contas",
      admissionDate: new Date("2022-11-03T00:00:00.000Z"),
    },
  ];

  const createdEmployees = [];
  for (const emp of employeesData) {
    const created = await prisma.employee.create({
      data: emp,
    });
    createdEmployees.push(created);
  }

  console.log(`✅ ${createdEmployees.length} colaboradores criados.`);

  // Mês de referência atual e mês anterior
  const now = new Date();
  const currentReferenceMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  // 3. Criação de Benefícios em Lote
  for (const employee of createdEmployees) {
    // 3.1 Vale Transporte
    const workingDays = 22;
    const inboundRate = 4.8;
    const outboundRate = 4.8;
    const busTotal = workingDays * (inboundRate + outboundRate); // 211.20
    const vanTotal = 150.0;
    const totalVoucherValue = busTotal + vanTotal;
    const totalCount = workingDays * 2 + 10;

    await prisma.transportVoucher.create({
      data: {
        employeeId: employee.id,
        referenceMonth: currentReferenceMonth,
        inboundValue: inboundRate,
        outboundValue: outboundRate,
        weekendHolidayValue: 0,
        workingDays: workingDays,
        weekendHolidayDays: 0,
        nightJokerIndicator: false,
        totalVouchers: totalCount,
        totalValue: totalVoucherValue,
        discountPercentage: 6.0,
        observations: "Linha padrão + Integração Van Comunitária",
        modals: {
          create: [
            {
              name: "Ônibus Urbano (Ida/Volta)",
              unitValue: 4.8,
              quantity: workingDays * 2,
              subtotal: busTotal,
            },
            {
              name: "Van Complementar",
              unitValue: 15.0,
              quantity: 10,
              subtotal: vanTotal,
            },
          ],
        },
      },
    });

    // 3.2 Vale Alimentação
    const mealUnitValue = 32.5;
    const mealDays = 22;
    const mealTotal = mealUnitValue * mealDays; // 715.00
    const mealDiscounts = 35.75; // 5% de coparticipação

    await prisma.mealVoucher.create({
      data: {
        employeeId: employee.id,
        referenceMonth: currentReferenceMonth,
        unitValue: mealUnitValue,
        workedDays: mealDays,
        voucherCount: mealDays,
        totalValue: mealTotal,
        discounts: mealDiscounts,
      },
    });

    // 3.3 Prêmio de Assiduidade
    const bonusValue = Math.floor(Math.random() * 3 + 2) * 100; // 200, 300 ou 400

    await prisma.attendanceAward.create({
      data: {
        employeeId: employee.id,
        referenceMonth: currentReferenceMonth,
        bonusValue: bonusValue,
      },
    });
  }

  console.log("✅ Vale Transporte, Vale Alimentação e Prêmio de Assiduidade gerados com sucesso!");
  console.log("🎉 Seed finalizado com sucesso.");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
