import { PrismaClient } from "@prisma/client";
import { suggestAttendanceBonusType } from "@/domain/attendance-award/value-objects/bonus-type";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed com dados reais...");

  // 1. Limpeza total do banco
  await prisma.transportModal.deleteMany();
  await prisma.transportVoucher.deleteMany();
  await prisma.mealVoucher.deleteMany();
  await prisma.attendanceAward.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.employee.deleteMany();

  console.log("🧹 Banco de dados limpo com sucesso.");

  // Helper para criar data UTC
  const parseDate = (dmy: string) => {
    const [day, month, year] = dmy.split("/").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  // 2. Cadastro dos Colaboradores Reais
  const employeesData = [
    { name: "Adolfo Bisceglia Atolini", department: "Técnico", role: "Técnico", admissionDate: parseDate("21/02/2022") },
    { name: "Alan Junior Soares de Oliveira", department: "Técnico", role: "Técnico", admissionDate: parseDate("01/03/2012") },
    { name: "Ana Carolina Longo de Araujo", department: "Adm", role: "Administrativo", admissionDate: parseDate("01/09/2011") },
    { name: "Ana Leticia Santos de Oliveira", department: "Monitora", role: "Monitora", admissionDate: parseDate("01/07/2021") },
    { name: "Ana Maria Oliveira da Silva", department: "Monitora", role: "Monitora", admissionDate: parseDate("19/03/2024") },
    { name: "Bianca Aparecida da Silva Cardoso", department: "Adm", role: "Administrativo", admissionDate: parseDate("01/08/2012") },
    { name: "Bruna Aparecida da Silva Cardoso", department: "Adm", role: "Administrativo", admissionDate: parseDate("01/07/2019") },
    { name: "Carolaine Aparecida Longo de Araujo", department: "Monitora", role: "Monitora", admissionDate: parseDate("15/07/2017") },
    { name: "Daniel Leonardi dos Santos", department: "Técnico", role: "Técnico", admissionDate: parseDate("25/08/2022") },
    { name: "Hagnes Marques Ferreira", department: "Monitora", role: "Monitora", admissionDate: parseDate("22/06/2026") },
    { name: "Isabel Atollini Gaspar", department: "Monitora", role: "Monitora", admissionDate: parseDate("18/07/2025") },
    { name: "Isaque Atolini Gaspar", department: "Técnico", role: "Técnico", admissionDate: parseDate("04/09/2025") },
    { name: "Janeci Evangelista", department: "Adm", role: "Administrativo", admissionDate: parseDate("03/08/2015") },
    { name: "Julia Cardoso Gelio", department: "Monitora", role: "Monitora", admissionDate: parseDate("15/01/2026") },
    { name: "Lucas Almeida de Souza", department: "TI", role: "Desenvolvedor / TI", admissionDate: parseDate("01/09/2015") },
    { name: "Lucas Miguel Biondi", department: "Operacional", role: "Operacional", admissionDate: parseDate("01/01/2024") },
    { name: "Marcella Poloni Pinto Mesquita", department: "Gestão", role: "Gestão", admissionDate: parseDate("16/08/2010") },
    { name: "Maybi Cristina Costa de Almeida", department: "Geral", role: "Serviços Gerais", admissionDate: parseDate("25/08/2023") },
    { name: "Rafael Nogueira Barbosa Cruz", department: "Técnico", role: "Técnico", admissionDate: parseDate("30/03/2026") },
    { name: "Rosangela Bendita Ferreira Gonçalves", department: "Monitora", role: "Monitora", admissionDate: parseDate("29/08/2025") },
    { name: "Sabrina Azeredo Ostapenko", department: "Monitora", role: "Monitora", admissionDate: parseDate("14/11/2025") },
    { name: "Silmara dos Santos Moraes", department: "Gestão", role: "Gestão", admissionDate: parseDate("01/08/2018") },
    { name: "Victor Lis Bronzo", department: "TI", role: "Desenvolvedor / TI", admissionDate: parseDate("21/03/2025") },
  ];

  const employeeMap = new Map<string, string>();

  for (const emp of employeesData) {
    const created = await prisma.employee.create({ data: emp });
    employeeMap.set(emp.name, created.id);
  }

  console.log(`✅ ${employeeMap.size} colaboradores cadastrados.`);

  // Competência de Referência: Abril / 2026
  const refApril2026 = new Date(Date.UTC(2026, 3, 1)); // Mês 3 (0-indexed) = Abril

  // 3. Seed — Vale Transporte (Abril/2026)
  const transportVouchersData = [
    {
      employeeName: "Ana Leticia Santos de Oliveira",
      inboundValue: 5.0,
      outboundValue: 5.0,
      weekendHolidayValue: 0,
      workingDays: 15,
      weekendHolidayDays: 0,
      nightJokerIndicator: false,
      totalVouchers: 34,
      totalValue: 166.0,
      discountPercentage: null,
      observations: "30 Girassol, com desconto de 3 dias de suspensão e crédito de 2 dias extras (2 Uber + 2 Girassol). Cálculo: R$150,00 + R$36,00 + R$10,00 − R$30,00",
      modals: [
        { name: "Girassol (Ida/Volta - 15 dias)", unitValue: 5.0, quantity: 30, subtotal: 150.0 },
        { name: "Uber Extra (2 dias)", unitValue: 18.0, quantity: 2, subtotal: 36.0 },
        { name: "Girassol Extra (2 dias)", unitValue: 5.0, quantity: 2, subtotal: 10.0 },
      ],
    },
    {
      employeeName: "Victor Lis Bronzo",
      inboundValue: 8.35,
      outboundValue: 8.35,
      weekendHolidayValue: 0,
      workingDays: 21,
      weekendHolidayDays: 0,
      nightJokerIndicator: false,
      totalVouchers: 42,
      totalValue: 350.7,
      discountPercentage: null,
      observations: "42 Viação Atibaia",
      modals: [
        { name: "Viação Atibaia (Ida/Volta)", unitValue: 8.35, quantity: 42, subtotal: 350.7 },
      ],
    },
    {
      employeeName: "Lucas Almeida de Souza",
      inboundValue: 650.0,
      outboundValue: 0,
      weekendHolidayValue: 0,
      workingDays: 21,
      weekendHolidayDays: 0,
      nightJokerIndicator: false,
      totalVouchers: 1,
      totalValue: 650.0,
      discountPercentage: null,
      observations: "Van escolar (valor único mensal)",
      modals: [
        { name: "Van Escolar (Mensal)", unitValue: 650.0, quantity: 1, subtotal: 650.0 },
      ],
    },
    {
      employeeName: "Julia Cardoso Gelio",
      inboundValue: 5.0,
      outboundValue: 5.0,
      weekendHolidayValue: 8.35,
      workingDays: 21,
      weekendHolidayDays: 4,
      nightJokerIndicator: false,
      totalVouchers: 50,
      totalValue: 276.8,
      discountPercentage: null,
      observations: "42 Girassol (R$ 210,00) + 8 Viação (R$ 66,80)",
      modals: [
        { name: "Girassol (Ida/Volta - 21 dias)", unitValue: 5.0, quantity: 42, subtotal: 210.0 },
        { name: "Viação Atibaia (Finais de Semana - 4 dias)", unitValue: 8.35, quantity: 8, subtotal: 66.8 },
      ],
    },
    {
      employeeName: "Lucas Miguel Biondi",
      inboundValue: 5.0,
      outboundValue: 5.0,
      weekendHolidayValue: 0,
      workingDays: 15,
      weekendHolidayDays: 0,
      nightJokerIndicator: false,
      totalVouchers: 48,
      totalValue: 240.0,
      discountPercentage: null,
      observations: "30 Girassol (R$ 150,00) + 18 Girassol referentes a agosto (13 a 31/08, R$ 90,00)",
      modals: [
        { name: "Girassol (Ida/Volta - 15 dias)", unitValue: 5.0, quantity: 30, subtotal: 150.0 },
        { name: "Girassol Retroativo (18 vales)", unitValue: 5.0, quantity: 18, subtotal: 90.0 },
      ],
    },
  ];

  for (const vt of transportVouchersData) {
    const employeeId = employeeMap.get(vt.employeeName);
    if (!employeeId) continue;

    await prisma.transportVoucher.create({
      data: {
        employeeId,
        referenceMonth: refApril2026,
        inboundValue: vt.inboundValue,
        outboundValue: vt.outboundValue,
        weekendHolidayValue: vt.weekendHolidayValue,
        workingDays: vt.workingDays,
        weekendHolidayDays: vt.weekendHolidayDays,
        nightJokerIndicator: vt.nightJokerIndicator,
        totalVouchers: vt.totalVouchers,
        totalValue: vt.totalValue,
        discountPercentage: vt.discountPercentage,
        observations: vt.observations,
        modals: {
          create: vt.modals,
        },
      },
    });
  }

  console.log("✅ Vale Transporte (abril/2026) criado.");

  // 4. Seed — Vale Alimentação (Abril/2026)
  const mealVouchersData = [
    { employeeName: "Alan Junior Soares de Oliveira", unitValue: 30.0, workedDays: 21, voucherCount: 21, totalValue: 630.0, discounts: 0 },
    { employeeName: "Adolfo Bisceglia Atolini", unitValue: 30.0, workedDays: 21, voucherCount: 21, totalValue: 630.0, discounts: 0 },
    { employeeName: "Daniel Leonardi dos Santos", unitValue: 30.0, workedDays: 21, voucherCount: 21, totalValue: 630.0, discounts: 0 },
    { employeeName: "Isaque Atolini Gaspar", unitValue: 22.0, workedDays: 18, voucherCount: 18, totalValue: 396.0, discounts: 0 },
    { employeeName: "Rafael Nogueira Barbosa Cruz", unitValue: 30.0, workedDays: 21, voucherCount: 21, totalValue: 630.0, discounts: 0 },
  ];

  for (const va of mealVouchersData) {
    const employeeId = employeeMap.get(va.employeeName);
    if (!employeeId) continue;

    await prisma.mealVoucher.create({
      data: {
        employeeId,
        referenceMonth: refApril2026,
        unitValue: va.unitValue,
        workedDays: va.workedDays,
        voucherCount: va.voucherCount,
        totalValue: va.totalValue,
        discounts: va.discounts,
      },
    });
  }

  console.log("✅ Vale Alimentação (abril/2026) criado.");

  // 5. Seed — Prêmio de Assiduidade (Abril/2026)
  const attendanceAwardsData = [
    { employeeName: "Adolfo Bisceglia Atolini", bonusValue: 0 },
    { employeeName: "Alan Junior Soares de Oliveira", bonusValue: 0 },
    { employeeName: "Ana Carolina Longo de Araujo", bonusValue: 300.0 },
    { employeeName: "Ana Leticia Santos de Oliveira", bonusValue: 0 },
    { employeeName: "Ana Maria Oliveira da Silva", bonusValue: 300.0 },
    { employeeName: "Bianca Aparecida da Silva Cardoso", bonusValue: 300.0 },
    { employeeName: "Bruna Aparecida da Silva Cardoso", bonusValue: 300.0 },
    { employeeName: "Carolaine Aparecida Longo de Araujo", bonusValue: 600.0 },
    { employeeName: "Daniel Leonardi dos Santos", bonusValue: 0 },
    { employeeName: "Hagnes Marques Ferreira", bonusValue: 0 },
    { employeeName: "Isabel Atollini Gaspar", bonusValue: 150.0 },
    { employeeName: "Isaque Atolini Gaspar", bonusValue: 0 },
    { employeeName: "Janeci Evangelista", bonusValue: 225.0 },
    { employeeName: "Julia Cardoso Gelio", bonusValue: 225.0 },
    { employeeName: "Lucas Almeida de Souza", bonusValue: 0 },
    { employeeName: "Marcella Poloni Pinto Mesquita", bonusValue: 300.0 },
    { employeeName: "Maybi Cristina Costa de Almeida", bonusValue: 225.0 },
    { employeeName: "Rafael Nogueira Barbosa Cruz", bonusValue: 0 },
    { employeeName: "Rosangela Bendita Ferreira Gonçalves", bonusValue: 300.0 },
    { employeeName: "Sabrina Azeredo Ostapenko", bonusValue: 0 },
    { employeeName: "Silmara dos Santos Moraes", bonusValue: 300.0 },
    { employeeName: "Victor Lis Bronzo", bonusValue: 300.0 },
  ];

  for (const award of attendanceAwardsData) {
    const employeeId = employeeMap.get(award.employeeName);
    if (!employeeId) continue;

    await prisma.attendanceAward.create({
      data: {
        employeeId,
        referenceMonth: refApril2026,
        bonusValue: award.bonusValue,
        bonusType: suggestAttendanceBonusType(award.bonusValue),
      },
    });
  }

  console.log("✅ Prêmio de Assiduidade (abril/2026) criado.");

  // 6. Seed — Comissões (Abril/2026)
  const commissionsData = [
    { employeeName: "Adolfo Bisceglia Atolini", commissionValue: 0 },
    { employeeName: "Alan Junior Soares de Oliveira", commissionValue: 0 },
    { employeeName: "Daniel Leonardi dos Santos", commissionValue: 0 },
    { employeeName: "Rafael Nogueira Barbosa Cruz", commissionValue: 0 },
  ];

  for (const commission of commissionsData) {
    const employeeId = employeeMap.get(commission.employeeName);
    if (!employeeId) continue;

    await prisma.commission.create({
      data: {
        employeeId,
        referenceMonth: refApril2026,
        commissionValue: commission.commissionValue,
      },
    });
  }

  console.log("✅ Comissões (abril/2026) criadas.");
  console.log("🎉 Seed com dados reais finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
