/**
 * Real OCR Text Parser for Legal Metrology Declarations
 * Extracts candidate statutory declarations from raw OCR string output.
 */

import { CandidateDeclaration } from '@/types/compliance';

export interface ParsedOcrResult {
  declarations: CandidateDeclaration[];
  rawText: string;
  meanConfidence: number;
  detectedFieldsCount: number;
}

export function parseOcrDeclarations(
  rawText: string,
  baseConfidence: number = 0.85,
  sourcePanel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL' = 'FRONT'
): ParsedOcrResult {
  const normalizedBaseConfidence = Math.max(0.1, Math.min(1.0, baseConfidence));
  const text = rawText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Rule 6(1)(a): Manufacturer / Packer / Importer Identity & Address
  let mfgText: string | null = null;
  let mfgConfidence = normalizedBaseConfidence;

  const mfgRegex = /(?:mfg|manufactured|mfd|packed|pkd|marketed|mktd|imported|imp|distributed)\s*(?:by|for)?[:\s]+([^\n\r]+(?:\n[^\n\r]+){0,2})/i;
  const mfgMatch = text.match(mfgRegex);
  if (mfgMatch && mfgMatch[0]) {
    mfgText = mfgMatch[0].trim();
    mfgConfidence = Math.min(0.96, normalizedBaseConfidence + 0.05);
  } else {
    // Look for lines containing address indicators like PIN / Pincode or Industrial Area
    const addressLine = lines.find((l) => /(?:industrial\s+area|plot\s+no|sector|pincode|pin\s*[-:]?\s*\d{6}|\b\d{6}\b)/i.test(l));
    if (addressLine) {
      mfgText = addressLine;
      mfgConfidence = Math.max(0.55, normalizedBaseConfidence - 0.15);
    }
  }

  // 2. Rule 6(1)(b): Generic Commodity Name
  let genericName: string | null = null;
  let genericConfidence = normalizedBaseConfidence;

  const nameRegex = /(?:generic\s+name|product|commodity|item|name\s+of\s+commodity)[:\s]+([^\n\r]+)/i;
  const nameMatch = text.match(nameRegex);
  if (nameMatch && nameMatch[1]) {
    genericName = nameMatch[1].trim();
    genericConfidence = Math.min(0.97, normalizedBaseConfidence + 0.05);
  } else if (lines.length > 0) {
    // If no explicit label, check top 3 prominent text lines for common FMCG names
    const candidateLine = lines.slice(0, 3).find((l) => l.length > 4 && l.length < 50 && !/^(mrp|net|mfg|batch|exp|pkd)/i.test(l));
    if (candidateLine) {
      genericName = candidateLine;
      genericConfidence = Math.max(0.60, normalizedBaseConfidence - 0.1);
    }
  }

  // 3. Rule 6(1)(c): Net Quantity in Standard Metric Units
  let netQtyText: string | null = null;
  let netQtyConfidence = normalizedBaseConfidence;

  // Check for explicit "Net Qty / Net Wt / Net Vol" declarations
  const netQtyRegex = /(?:net\s*(?:wt\.?|weight|qty\.?|quantity|vol\.?|volume|contents?))[:\s]*([0-9]+(?:\.[0-9]+)?\s*(?:g|kg|ml|l|L|mg|m|cm|mm|N|U|units?|gms|kgs|ltr|ltrs|mltr|mltrs|mls|MLTRS)\b)/i;
  const netQtyMatch = text.match(netQtyRegex);
  if (netQtyMatch && netQtyMatch[0]) {
    netQtyText = netQtyMatch[0].trim();
    netQtyConfidence = Math.min(0.98, normalizedBaseConfidence + 0.08);
  } else {
    // Look for standalone numbers with units
    const standaloneMatch = text.match(/\b([0-9]+(?:\.[0-9]+)?\s*(?:g|kg|ml|l|L|mg|gms|kgs|ltrs|mltrs|mls|MLTRS))\b/i);
    if (standaloneMatch && standaloneMatch[0]) {
      netQtyText = `Net Qty: ${standaloneMatch[0]}`;
      netQtyConfidence = Math.max(0.65, normalizedBaseConfidence - 0.1);
    }
  }

  // 4. Rule 6(1)(d): Month & Year of Manufacture / Packing
  let dateText: string | null = null;
  let dateConfidence = normalizedBaseConfidence;

  const dateRegex = /(?:mfg|mfd|pkd|packed|pkg|date\s+of\s+packing|date\s+of\s+mfg|best\s+before)[:\s]*([0-9]{1,2}[/-][0-9]{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[0-9]{2,4})/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch && dateMatch[0]) {
    dateText = dateMatch[0].trim();
    dateConfidence = Math.min(0.94, normalizedBaseConfidence + 0.05);
  } else {
    const rawDateMatch = text.match(/\b(0[1-9]|1[0-2])[/-](20\d{2})\b/);
    if (rawDateMatch && rawDateMatch[0]) {
      dateText = `Mfg: ${rawDateMatch[0]}`;
      dateConfidence = Math.max(0.60, normalizedBaseConfidence - 0.1);
    }
  }

  // 5. Rule 6(1)(e): Maximum Retail Price (MRP) & Tax Clause
  let mrpText: string | null = null;
  let mrpConfidence = normalizedBaseConfidence;

  const mrpRegex = /(?:mrp|maximum\s+retail\s+price)[:\s]*(?:rs\.?|₹|inr)?\s*([0-9]+(?:\.[0-9]{2})?)(?:[^\n\r]*)/i;
  const mrpMatch = text.match(mrpRegex);
  if (mrpMatch && mrpMatch[0]) {
    mrpText = mrpMatch[0].trim();
    // Check if the surrounding text mentions taxes
    if (/(?:incl|inclusive|all\s+taxes)/i.test(text)) {
      if (!/(?:incl|inclusive)/i.test(mrpText)) {
        mrpText += ' (inclusive of all taxes)';
      }
    }
    mrpConfidence = Math.min(0.96, normalizedBaseConfidence + 0.06);
  } else {
    const rupeeMatch = text.match(/(?:₹|rs\.?)\s*([0-9]+(?:\.[0-9]{2})?)/i);
    if (rupeeMatch && rupeeMatch[0]) {
      mrpText = `MRP ${rupeeMatch[0]}`;
      mrpConfidence = Math.max(0.58, normalizedBaseConfidence - 0.15);
    }
  }

  // 6. Rule 6(1)(da): Unit Sale Price (USP)
  let uspText: string | null = null;
  let uspConfidence = normalizedBaseConfidence;

  const uspRegex = /(?:usp|unit\s+sale\s+price)[:\s]*(?:rs\.?|₹|inr)?\s*([0-9]+(?:\.[0-9]+)?\s*(?:\/|per)\s*(?:100\s*)?(?:g|kg|ml|l|L|unit|piece|item|N|m|cm)\b)/i;
  const uspMatch = text.match(uspRegex);
  if (uspMatch && uspMatch[0]) {
    uspText = uspMatch[0].trim();
    uspConfidence = Math.min(0.93, normalizedBaseConfidence + 0.05);
  }

  // 7. Rule 6(1)(f): Consumer Care Contact Details
  let careText: string | null = null;
  let careConfidence = normalizedBaseConfidence;

  const careRegex = /(?:consumer\s+care|customer\s+care|feedback|grievance|helpline|toll\s+free)[:\s]+([^\n\r]+)/i;
  const careMatch = text.match(careRegex);
  if (careMatch && careMatch[0]) {
    careText = careMatch[0].trim();
    careConfidence = Math.min(0.95, normalizedBaseConfidence + 0.05);
  } else {
    // Check for email or toll-free phone number
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/\b(?:1800[- ]?\d{3}[- ]?\d{3,4}|\d{10})\b/);
    if (emailMatch || phoneMatch) {
      careText = `Consumer Care: ${[emailMatch ? emailMatch[0] : null, phoneMatch ? phoneMatch[0] : null].filter(Boolean).join(' | ')}`;
      careConfidence = Math.max(0.68, normalizedBaseConfidence - 0.05);
    }
  }

  // 8. Rule 6(10): Country of Origin
  let originText: string | null = null;
  let originConfidence = normalizedBaseConfidence;

  const originRegex = /(?:country\s+of\s+origin|made\s+in|produced\s+in|product\s+of)[:\s]+([A-Za-z\s]+)/i;
  const originMatch = text.match(originRegex);
  if (originMatch && originMatch[0]) {
    originText = originMatch[0].trim();
    originConfidence = Math.min(0.98, normalizedBaseConfidence + 0.08);
  }

  // Build structured CandidateDeclarations list
  const declarations: CandidateDeclaration[] = [
    {
      ruleId: 'rule-pcr-6-1-a',
      ruleReference: 'Rule 6(1)(a)',
      label: 'Manufacturer / Packer / Importer',
      extractedRawText: mfgText,
      normalizedValue: mfgText,
      ocrConfidence: mfgText ? mfgConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-b',
      ruleReference: 'Rule 6(1)(b)',
      label: 'Generic Commodity Name',
      extractedRawText: genericName,
      normalizedValue: genericName,
      ocrConfidence: genericName ? genericConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-c',
      ruleReference: 'Rule 6(1)(c)',
      label: 'Net Quantity',
      extractedRawText: netQtyText,
      normalizedValue: netQtyText,
      ocrConfidence: netQtyText ? netQtyConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-d',
      ruleReference: 'Rule 6(1)(d)',
      label: 'Month & Year of Manufacture/Packing',
      extractedRawText: dateText,
      normalizedValue: dateText,
      ocrConfidence: dateText ? dateConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-e',
      ruleReference: 'Rule 6(1)(e)',
      label: 'Maximum Retail Price (MRP)',
      extractedRawText: mrpText,
      normalizedValue: mrpText,
      ocrConfidence: mrpText ? mrpConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-da',
      ruleReference: 'Rule 6(1)(da)',
      label: 'Unit Sale Price (USP)',
      extractedRawText: uspText,
      normalizedValue: uspText,
      ocrConfidence: uspText ? uspConfidence : 0.0,
      isMandatory: false,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-1-f',
      ruleReference: 'Rule 6(1)(f)',
      label: 'Consumer Care Details',
      extractedRawText: careText,
      normalizedValue: careText,
      ocrConfidence: careText ? careConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
    {
      ruleId: 'rule-pcr-6-10',
      ruleReference: 'Rule 6(10)',
      label: 'Country of Origin',
      extractedRawText: originText,
      normalizedValue: originText,
      ocrConfidence: originText ? originConfidence : 0.0,
      isMandatory: true,
      sourcePanel,
      isManuallyEdited: false,
    },
  ];

  const detectedFieldsCount = declarations.filter((d) => d.extractedRawText !== null).length;

  return {
    declarations,
    rawText: text,
    meanConfidence: normalizedBaseConfidence,
    detectedFieldsCount,
  };
}

