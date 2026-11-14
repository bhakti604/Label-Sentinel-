/**
 * Seed Data: Enforcement Cases & Compounding Dossiers
 * Legal Metrology Act, 2009 (Section 36, Section 48)
 */

import { EnforcementCase } from '@/types/portal';

export const DEMO_CASES: EnforcementCase[] = [
  {
    id: 'CASE-2026-0081',
    caseDocketNumber: 'LM-DEL-2026-0081',
    respondentName: 'Aura Botanics Private Limited',
    respondentType: 'MANUFACTURER',
    allegedSection: 'Section 36(1) read with Rule 6(1)(c) and Rule 6(1)(e)',
    investigatingOfficer: 'Senior Inspector P. Deshmukh',
    filingDate: '2026-11-02',
    hearingDate: '2026-11-18',
    status: 'NOTICE_SERVED',
    penaltyAmountInr: 50000,
    associatedDossierId: 'DOS-2026-8802',
    summary:
      'Prosecution initiated for widespread distribution of pre-packaged cosmetics with illegal metric symbols ("MLTRS") and omission of the mandatory "inclusive of all taxes" declaration across North India retail channels.',
  },
  {
    id: 'CASE-2026-0079',
    caseDocketNumber: 'LM-BLR-2026-0079',
    respondentName: 'SoundGrid Tech India Pvt Ltd',
    respondentType: 'IMPORTER',
    allegedSection: 'Section 36(1) read with Rule 6(10) (Country of Origin Omission)',
    investigatingOfficer: 'Inspector M. Patil',
    filingDate: '2026-10-30',
    hearingDate: '2026-11-12',
    status: 'DRAFT',
    penaltyAmountInr: 25000,
    associatedDossierId: 'DOS-2026-8803',
    summary:
      'Show cause notice draft prepared for imported wireless audio accessories found without conspicuous Country of Origin declaration in Bengaluru Urban distribution center.',
  },
  {
    id: 'CASE-2026-0074',
    caseDocketNumber: 'LM-DEL-2026-0074',
    respondentName: 'Krishna Dairy & Groceries',
    respondentType: 'RETAILER',
    allegedSection: 'Section 36(1) (Charging over MRP / Dual Price Sticker)',
    investigatingOfficer: 'Inspector S. Kaushik',
    filingDate: '2026-10-26',
    status: 'COMPOUNDED',
    penaltyAmountInr: 15000,
    summary:
      'Offense compounded under Section 48 upon payment of ₹ 15,000 statutory compounding fee into Government treasury. Offending stock withdrawn from retail shelves.',
  },
  {
    id: 'CASE-2026-0062',
    caseDocketNumber: 'LM-CHD-2026-0062',
    respondentName: 'Apex Beverages & Foods Ltd',
    respondentType: 'PACKER',
    allegedSection: 'Section 36(2) read with Second Schedule (Short Measure in Pre-packed Commodities)',
    investigatingOfficer: 'Controller H. S. Brar',
    filingDate: '2026-09-14',
    hearingDate: '2026-11-25',
    status: 'PROSECUTION_INITIATED',
    penaltyAmountInr: 100000,
    summary:
      'Deficient net weight discovered across 200 sampled packages beyond the maximum permissible error limit prescribed under the Second Schedule. Matter forwarded to Court of Chief Metropolitan Magistrate.',
  },
];

