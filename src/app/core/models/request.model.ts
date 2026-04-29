import { EquipmentCategory } from './equipment.model';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface EquipmentRequest {
  id: string;
  employeeId: string;
  category: EquipmentCategory;
  description: string;
  justification: string;
  status: RequestStatus;
  requestDate: string;
  responseDate?: string;
  adminNote?: string;
  assignedEquipmentId?: string;
}
