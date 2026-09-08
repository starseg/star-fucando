export interface Commission {
  id: string;
  employeeId: string;
  referenceMonth: Date;
  startDate?: Date | null;
  endDate?: Date | null;
  commissionValue: number;
}
