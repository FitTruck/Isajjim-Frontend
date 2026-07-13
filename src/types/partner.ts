export type PartnerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PartnerProfileResponse {
  id: number;
  userId: number;
  companyName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  contactPhone: string;
  introduction: string | null;
  businessRegistrationImageUrl: string;
  approvalStatus: PartnerApprovalStatus;
  rejectionReason: string | null;
  createdDate: string;
}

export interface PartnerApplicationRequest {
  companyName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  businessAddress: string;
  contactPhone: string;
  introduction?: string;
  businessRegistrationImageUrl: string;
}
