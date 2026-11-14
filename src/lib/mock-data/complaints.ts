/**
 * Seed Data: Citizen Legal Metrology Complaints
 */

import { CitizenComplaint } from '@/types/portal';

export const DEMO_COMPLAINTS: CitizenComplaint[] = [
  {
    id: 'CMP-2026-1044',
    dossierId: 'DOS-2026-8802',
    barcode: '8906001249821',
    productName: 'Herbal Glow Organic Face Wash (150 ml)',
    brandName: 'Aura Botanics Ltd.',
    vendorName: 'SuperMart Hypermarket, Connaught Place',
    vendorAddress: 'Block B, Radial Road 2, Connaught Place, New Delhi 110001',
    platformType: 'OFFLINE_STORE',
    category: 'COSMETICS',
    violationCategories: ['NON_METRIC_UNIT', 'MISSING_ALL_TAXES_CLAUSE'],
    description:
      'The package uses illegal abbreviation "150 MLTRS" instead of standard "150 ml". Also, the printed MRP lacks the statutory phrase "(inclusive of all taxes)". The store cashier charged extra GST on top of the displayed MRP.',
    submittedAt: '2026-11-03 12:05:00',
    complainantName: 'Sunita Sharma',
    complainantPhone: '+91 98110 44211',
    status: 'INSPECTION_ORDERED',
    assignedOfficer: 'Inspector V. Anand (South Delhi Zone)',
    officerRemarks: 'Notice issued under Rule 6(1)(c) & 6(1)(e). Retail premises inspection scheduled.',
  },
  {
    id: 'CMP-2026-1043',
    dossierId: 'DOS-2026-8803',
    barcode: '8901234567890',
    productName: 'ProBass Wireless Earbuds with ANC',
    brandName: 'SoundGrid Audio',
    vendorName: 'MegaTech Retail Online on QuickCart.in',
    vendorAddress: 'Fulfillment Center 4, Electronic City, Bengaluru 560100',
    platformType: 'ECOMMERCE_PORTAL',
    category: 'ELECTRONICS',
    violationCategories: ['OBSCURED_COUNTRY_OF_ORIGIN', 'ILLEGIBLE_FONT_SIZE'],
    description:
      'Received package with warehouse sticker pasted directly over the Country of Origin marking. Consumer care helpline phone number font is microscopic and completely unreadable without magnifying glass.',
    submittedAt: '2026-11-02 18:22:15',
    complainantName: 'Karthik Raman',
    complainantPhone: '+91 98450 11982',
    status: 'UNDER_REVIEW',
    assignedOfficer: 'Inspector M. Patil (Bengaluru Urban)',
    officerRemarks: 'Summons issued to marketplace seller for original label verification.',
  },
  {
    id: 'CMP-2026-1042',
    barcode: '8902099304918',
    productName: 'FarmFresh Pure Desi Ghee (1 L)',
    brandName: 'GauKripa Agro Industries',
    vendorName: 'Krishna Dairy & Groceries',
    vendorAddress: 'Shop 12, Main Market, Lajpat Nagar, Delhi 110024',
    platformType: 'OFFLINE_STORE',
    category: 'FOOD_FMCG',
    violationCategories: ['OVERPRICING_BEYOND_MRP', 'SMUDGED_MANUFACTURE_DATE'],
    description:
      'The shopkeeper pasted a handwritten paper sticker of Rs. 750 over the printed MRP of Rs. 680. When questioned, he claimed wholesale price hike.',
    submittedAt: '2026-11-01 10:14:33',
    complainantName: 'Arun Mehra',
    complainantPhone: '+91 99100 88712',
    status: 'RESOLVED',
    assignedOfficer: 'Inspector S. Kaushik (Central Zone)',
    officerRemarks:
      'Compounding fee of ₹ 15,000 imposed under Section 36(1) for dual pricing sticker. Offending stock withdrawn.',
    resolutionDate: '2026-11-02 17:00:00',
  },
  {
    id: 'CMP-2026-1041',
    barcode: '8903332198001',
    productName: 'OptiClean Detergent Powder 2 kg',
    brandName: 'OptiHome Essentials',
    vendorName: 'BlinkBazaar E-Commerce Hub',
    vendorAddress: 'Warehouse 9, Sector 18, Gurugram 122015',
    platformType: 'ECOMMERCE_PORTAL',
    category: 'HOUSEHOLD_CHEMICALS',
    violationCategories: ['MISSING_UNIT_SALE_PRICE'],
    description: 'Packaged quantity is 2 kg, but no Unit Sale Price (USP per kg or g) is declared anywhere on the e-commerce listing or the physical packet.',
    submittedAt: '2026-10-31 15:45:10',
    complainantName: 'Priya Nambiar',
    status: 'SUBMITTED',
  },
];

