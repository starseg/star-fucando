export interface Employee {
  id: string;
  name: string;
  pix: string | null;
  department: string | null;
  role: string | null;
  admissionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
