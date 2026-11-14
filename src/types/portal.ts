/**
 * Portal, User, Complaint, Inspection, Case, and Audit Log Types
 */

import { ComplianceStatus, CommodityCategory } from './compliance';

export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'CONTROLLER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  jurisdictionId?: string;
  jurisdictionName?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  jurisdictionId?: string;
  jurisdictionName?: string;
}

export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'INSPECTION_ORDERED' | 'RESOLVED' | 'DISMISSED';

export interface CitizenComplaint {
  id: string;
  dossierId?: string;
  barcode?: string;
  productName: string;
  brandName: string;
  vendorName: string;
  vendorAddress: string;
  platformType: 'OFFLINE_STORE' | 'ECOMMERCE_PORTAL';
  category: CommodityCategory;
  violationCategories: string[];
  description: string;
  submittedAt: string;
  complainantName: string;
  complainantPhone?: string;
  status: ComplaintStatus;
  assignedOfficer?: string;
  officerRemarks?: string;
  resolutionDate?: string;
}

export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'NOTICE_ISSUED';

export interface EnforcementInspection {
  id: string;
  inspectionCode: string;
  retailerName: string;
  retailerGSTIN: string;
  address: string;
  jurisdiction: string;
  officerInCharge: string;
  scheduledDate: string;
  status: InspectionStatus;
  packagesSampled: number;
  infractionsFound: number;
  noticeIssued: boolean;
  compoundingFeeLeviedInr?: number;
  notes: string;
}

export type CaseStatus = 'DRAFT' | 'NOTICE_SERVED' | 'COMPOUNDED' | 'PROSECUTION_INITIATED' | 'CLOSED';

export interface EnforcementCase {
  id: string;
  caseDocketNumber: string; // e.g. "LM-DEL-2026-081"
  respondentName: string; // Manufacturer / Packer / Retailer
  respondentType: 'MANUFACTURER' | 'PACKER' | 'IMPORTER' | 'ECOMMERCE_ENTREPRENEUR' | 'RETAILER';
  allegedSection: string; // e.g. "Section 36(1) read with Rule 6(1)"
  investigatingOfficer: string;
  filingDate: string;
  hearingDate?: string;
  status: CaseStatus;
  penaltyAmountInr: number;
  associatedDossierId?: string;
  summary: string;
}

export interface JurisdictionNode {
  id: string;
  code: string;
  name: string;
  state: string;
  level: 'STATE_HEADQUARTERS' | 'DIVISIONAL_ZONE' | 'DISTRICT_OFFICE';
  controllerName: string;
  activeInspectorsCount: number;
  activeCasesCount: number;
  contactEmail: string;
  phone: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  actionType:
    | 'RULE_CREATED'
    | 'RULE_MODIFIED'
    | 'VERDICT_OVERRIDDEN'
    | 'NOTICE_ISSUED'
    | 'INSPECTION_LOGGED'
    | 'CASE_FILED'
    | 'USER_INVITED'
    | 'SYSTEM_CONFIG_UPDATED';
  targetResource: string;
  details: string;
  ipAddress: string;
  hash: string;
}

