/**
 * Legal Metrology (Packaged Commodities) Rules, 2011 & Compliance Types
 * Domain: Legal Metrology & Regulatory Compliance Technology
 */

export type ComplianceStatus = 'PASS' | 'FAIL' | 'NEEDS_REVIEW' | 'NOT_APPLICABLE';

export type CommodityCategory =
  | 'FOOD_FMCG'
  | 'COSMETICS'
  | 'ELECTRONICS'
  | 'PHARMACEUTICAL_OTC'
  | 'HOUSEHOLD_CHEMICALS'
  | 'APPAREL_TEXTILE'
  | 'GENERAL_MERCHANDISE';

export interface CandidateDeclaration {
  ruleId: string;
  ruleReference: string;
  label: string;
  extractedRawText: string | null;
  normalizedValue: string | null;
  ocrConfidence: number; // 0.0 to 1.0
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  statutoryUnit?: string;
  isMandatory: boolean;
  sourcePanel?: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL' | 'MANUAL';
  isManuallyEdited?: boolean;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleReference: string; // e.g. "Rule 6(1)(a)"
  ruleTitle: string;
  ruleDescription: string;
  status: ComplianceStatus;
  confidence: number;
  extractedText: string | null;
  expectedFormat: string;
  findingNotes: string;
  statutoryReferenceUrl?: string;
  requiresOfficerReview: boolean;
  remedyAction?: string;
}

export interface ComplianceDossier {
  id: string;
  barcode: string;
  productName: string;
  brandName: string;
  category: CommodityCategory;
  batchNumber?: string;
  scannedAt: string;
  scannedBy: string; // e.g., 'Citizen #4092' or 'Inspector Verma'
  jurisdiction: string; // e.g., 'Delhi State - Central District'
  imageUrl: string;
  ocrRawPayload?: string;
  overallStatus: ComplianceStatus;
  declarationsCount: {
    total: number;
    passed: number;
    failed: number;
    needsReview: number;
    notApplicable: number;
  };
  evaluations: RuleEvaluationResult[];
  officerNotes?: string;
  reviewedByOfficer?: string;
  reviewedAt?: string;
  caseDocketId?: string;
}

export interface StatutoryRuleDefinition {
  id: string;
  ruleCode: string; // e.g., "PCR-2011-R06-1A"
  actReference: string; // "Legal Metrology (Packaged Commodities) Rules, 2011"
  section: string; // "Rule 6(1)(a)"
  title: string;
  description: string;
  categoryScope: CommodityCategory[] | 'ALL';
  mandatoryFields: string[];
  validationRegex?: string;
  minFontHeightMm?: number; // Metrology rule specifies minimum declaration font height based on net quantity
  active: boolean;
  version: string;
  lastAmendedDate: string;
}

