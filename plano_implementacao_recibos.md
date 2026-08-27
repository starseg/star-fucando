# Plano de Implementação: Sistema de Geração de Recibos

## 1. Modelagem do Banco de Dados (Prisma Schema)

Abaixo está a proposta do `schema.prisma` detalhando as tabelas necessárias e seus relacionamentos:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Neon PostgreSQL
}

generator client {
  provider = "prisma-client-js"
}

model Employee {
  id               String             @id @default(uuid())
  name             String
  admissionDate    DateTime?
  department       String?
  role             String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  transportVoucher TransportVoucher[]
  mealVoucher      MealVoucher[]
  attendanceAward  AttendanceAward[]
}

model TransportVoucher {
  id                  String   @id @default(uuid())
  employeeId          String
  employee            Employee @relation(fields: [employeeId], references: [id])
  referenceMonth      DateTime // Ex: 2023-10-01
  
  // Valores
  inboundValue        Decimal  @db.Decimal(10, 2)
  outboundValue       Decimal  @db.Decimal(10, 2)
  weekendHolidayValue Decimal? @db.Decimal(10, 2)
  
  // Quantidades
  workingDays         Int
  weekendHolidayDays  Int      @default(0)
  
  // Indicadores
  nightJokerIndicator Boolean  @default(false)
  
  // Totais e Ajustes
  totalVouchers       Int
  totalValue          Decimal  @db.Decimal(10, 2)
  discountPercentage  Decimal? @db.Decimal(5, 2) // Ex: 6 para 6%
  observations        String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  modals              TransportModal[]
}

model TransportModal {
  id                 String           @id @default(uuid())
  transportVoucherId String
  transportVoucher   TransportVoucher @relation(fields: [transportVoucherId], references: [id], onDelete: Cascade)
  name               String           // Ex: Girassol, Uber, Van
  unitValue          Decimal          @db.Decimal(10, 2)
  quantity           Int
  subtotal           Decimal          @db.Decimal(10, 2)
}

model MealVoucher {
  id             String   @id @default(uuid())
  employeeId     String
  employee       Employee @relation(fields: [employeeId], references: [id])
  referenceMonth DateTime
  
  unitValue      Decimal  @db.Decimal(10, 2)
  workedDays     Int
  voucherCount   Int
  totalValue     Decimal  @db.Decimal(10, 2)
  discounts      Decimal? @db.Decimal(10, 2)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model AttendanceAward {
  id             String   @id @default(uuid())
  employeeId     String
  employee       Employee @relation(fields: [employeeId], references: [id])
  referenceMonth DateTime
  
  bonusValue     Decimal  @db.Decimal(10, 2) // Valor da bonificação
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## 2. Estrutura do Seed de Dados (`prisma/seed.ts`)

O script de população inicial deverá conter:
1. **Limpeza inicial:** Remoção de dados antigos (em ordem inversa às restrições de chave estrangeira).
2. **Criação de Colaboradores:** Um array de colaboradores fictícios (Nome, Departamento, Data de admissão, Cargo).
3. **Criação de Benefícios (Lote):** 
   - Lançamentos de **Vale Transporte**, incluindo pelo menos 2 registros na tabela relacionada `TransportModal` por funcionário para testar o relacionamento e cálculo de totais.
   - Lançamentos de **Vale Alimentação** com valores unitários preenchidos e totais calculados no seed.
   - Lançamentos de **Prêmio Assiduidade** com valores aleatórios entre 0 e um teto (ex: 500,00).

## 3. Endpoints / Server Actions

A arquitetura utilizará Next.js Server Actions para facilitar o desenvolvimento:
- **Colaboradores:** `getEmployees`, `createEmployee`, `updateEmployee`, `deleteEmployee`
- **Vale Transporte:** `getTransportVouchers(month, year)`, `upsertTransportVoucher` (que cuidará da inserção/atualização atômica do V.T. e seus modais), `deleteTransportVoucher`
- **Vale Alimentação:** `getMealVouchers(month, year)`, `upsertMealVoucher`, `deleteMealVoucher`
- **Prêmio de Assiduidade:** `getAttendanceAwards(month, year)`, `upsertAttendanceAward`, `deleteAttendanceAward`

## 4. Componentes de UI e Telas (shadcn/ui)

1. **Layout e Navegação:** Sidebar base com links para (Colaboradores, Vale Transporte, Vale Alimentação, Assiduidade).
2. **Tabelas de Dados:** Utilização de `DataTable` (TanStack Table base do shadcn) com suporte a paginação, filtragem por mês de referência e seleção múltipla (`Checkbox` na primeira coluna).
3. **Formulários:** `react-hook-form` + `zod` para validação:
   - Formulário de Vale Transporte requer um Field Array para adicionar/remover dinamicamente Modais. Terá lógica observando as alterações dos modais para calcular "Quantidade de Vales" e "Valor Total" automaticamente, mas deixando os campos destravados para ajuste manual.
4. **Modais:** Telas de CRUD podem abrir em `Dialog` ou `Sheet` para preservar o contexto do usuário na listagem.

## 5. Solução para Geração de PDF

Em vez de bibliotecas pesadas de geração no backend, utilizaremos **HTML + CSS para impressão**, garantindo alta customização e facilidade de manutenção.

- **Fluxo:** O usuário seleciona os registros na tabela e clica em "Imprimir Recibos".
- **Rota:** É aberta uma nova aba `/imprimir?tipo=transporte&ids=1,2,3...`
- **Renderização:** A página busca os dados e renderiza os recibos visualmente no HTML.
- **CSS de Impressão:**
```css
@media print {
  body {
    -webkit-print-color-adjust: exact;
  }
  .receipt-page {
    page-break-after: always; /* Garante 1 funcionário por página */
    page-break-inside: avoid;
  }
  .no-print {
    display: none;
  }
}
```
*Assim que a tela é montada (useEffect), o sistema aciona `window.print()`.*

## 6. Passos de Implementação (Faseamento)

- **Fase 1: Infraestrutura (1-2 Dias)**
  - Setup Next.js, shadcn/ui, Tailwind CSS.
  - Setup do Prisma e Conexão com banco Neon.
  - Criação do Prisma Schema, migração inicial e script de Seed.
- **Fase 2: Gestão Base (1 Dia)**
  - Construção do layout principal (Sidebar).
  - CRUD de Colaboradores (Formulário e Tabela).
- **Fase 3: Funcionalidades de Benefícios (2-3 Dias)**
  - Tabela, filtros de mês e CRUD (com Field Array de modais) para **Vale Transporte**.
  - Tabela e CRUD de **Vale Alimentação**.
  - Tabela e CRUD de **Prêmio de Assiduidade**.
- **Fase 4: Módulo de Recibos e Impressão (1-2 Dias)**
  - Criação da página visual de recibos (templates HTML/CSS).
  - Lógica de multiseleção (checkboxes) nas tabelas para disparar a aba de impressão em lote.
- **Fase 5: Testes, Ajustes de UX e Homologação (1 Dia)**
  - Testes de cálculos automáticos (se totais batem).
  - Revisão visual dos recibos gerados em PDF (margens e quebras de página).
