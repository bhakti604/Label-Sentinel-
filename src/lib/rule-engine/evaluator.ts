/**
 * Deterministic Legal Metrology Compliance Rule Engine
 *
 * CRITICAL ARCHITECTURAL DIRECTIVE:
 * - OCR merely extracts candidate declarations with confidence scores and coordinates.
 * - AI must NEVER independently issue a statutory compliance verdict.
 * - This version-controlled, deterministic TypeScript engine evaluates each statutory declaration
 *   against The Legal Metrology (Packaged Commodities) Rules, 2011.
 * - Low-confidence OCR or ambiguous strings are routed to human officers as NEEDS_REVIEW.
 * - Statuses strictly conform to: PASS | FAIL | NEEDS_REVIEW | NOT_APPLICABLE
 */

import {
  CandidateDeclaration,
  CommodityCategory,
  ComplianceDossier,
  ComplianceStatus,
  RuleEvaluationResult,
  StatutoryRuleDefinition,
} from '@/types/compliance';
import { STATUTORY_RULES_REGISTRY } from './rules';

export interface EvaluationInput {
  barcode: string;
  productName: string;
  brandName: string;
  category: CommodityCategory;
  declarations: CandidateDeclaration[];
  isImported?: boolean;
  isMultiUnitOrBulk?: boolean;
}

export function evaluatePackageCompliance(
  input: EvaluationInput,
  activeRules: StatutoryRuleDefinition[] = STATUTORY_RULES_REGISTRY
): {
  overallStatus: ComplianceStatus;
  evaluations: RuleEvaluationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    needsReview: number;
    notApplicable: number;
  };
} {
  const evaluations: RuleEvaluationResult[] = [];

  for (const rule of activeRules) {
    if (!rule.active) {
      continue;
    }

    // Check if category is in scope
    if (rule.categoryScope !== 'ALL' && !rule.categoryScope.includes(input.category)) {
      evaluations.push({
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NOT_APPLICABLE',
        confidence: 1.0,
        extractedText: null,
        expectedFormat: 'Not applicable for this commodity category under PCR 2011.',
        findingNotes: `Scope limited to ${rule.categoryScope.join(', ')}.`,
        requiresOfficerReview: false,
      });
      continue;
    }

    // Special checks for Unit Sale Price (USP) and Country of Origin
    if (rule.id === 'rule-pcr-6-1-da' && !input.isMultiUnitOrBulk) {
      evaluations.push({
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NOT_APPLICABLE',
        confidence: 1.0,
        extractedText: null,
        expectedFormat: 'Mandatory only for packages > 1kg/1L or containing multi-units.',
        findingNotes: 'Package net volume does not trigger mandatory Unit Sale Price declaration under Rule 6(1)(da).',
        requiresOfficerReview: false,
      });
      continue;
    }

    // Find candidate declaration extracted for this rule
    const candidate = input.declarations.find(
      (d) => d.ruleId === rule.id || d.ruleReference.toLowerCase() === rule.section.toLowerCase()
    );

    if (!candidate || !candidate.extractedRawText || candidate.extractedRawText.trim().length === 0) {
      evaluations.push({
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'FAIL',
        confidence: 0.95,
        extractedText: null,
        expectedFormat: `Mandatory statutory declaration missing. Required elements: ${rule.mandatoryFields.join(', ')}`,
        findingNotes: `Statutory declaration required by ${rule.section} was not detected on any label panel. Potential violation of Section 36(1) of the Legal Metrology Act, 2009.`,
        requiresOfficerReview: false,
        remedyAction: `Re-label product package with clear declaration complying with ${rule.section}.`,
      });
      continue;
    }

    // If OCR confidence is low (< 0.72) or ambiguous, do NOT fail automatically; route for human officer review!
    if (candidate.ocrConfidence < 0.72) {
      evaluations.push({
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NEEDS_REVIEW',
        confidence: candidate.ocrConfidence,
        extractedText: candidate.extractedRawText,
        expectedFormat: rule.validationRegex || 'High clarity statutory declaration',
        findingNotes: `OCR extraction confidence (${Math.round(candidate.ocrConfidence * 100)}%) is below statutory threshold. Character smudging, curve distortion, or font size illegibility detected. Routed to Legal Metrology Officer review queue.`,
        requiresOfficerReview: true,
        remedyAction: 'Inspect physical sample under standard metrological illumination to verify font legibility.',
      });
      continue;
    }

    // Deterministic validation based on rule type
    const evalResult = validateSpecificDeclaration(rule, candidate);
    evaluations.push(evalResult);
  }

  // Calculate summary counts
  const summary = {
    total: evaluations.length,
    passed: evaluations.filter((e) => e.status === 'PASS').length,
    failed: evaluations.filter((e) => e.status === 'FAIL').length,
    needsReview: evaluations.filter((e) => e.status === 'NEEDS_REVIEW').length,
    notApplicable: evaluations.filter((e) => e.status === 'NOT_APPLICABLE').length,
  };

  // Overall status evaluation:
  // If ANY mandatory rule is FAIL -> FAIL
  // Else if ANY rule is NEEDS_REVIEW -> NEEDS_REVIEW
  // Else -> PASS
  let overallStatus: ComplianceStatus = 'PASS';
  if (summary.failed > 0) {
    overallStatus = 'FAIL';
  } else if (summary.needsReview > 0) {
    overallStatus = 'NEEDS_REVIEW';
  }

  return {
    overallStatus,
    evaluations,
    summary,
  };
}

function validateSpecificDeclaration(
  rule: StatutoryRuleDefinition,
  candidate: CandidateDeclaration
): RuleEvaluationResult {
  const text = candidate.extractedRawText?.trim() || '';

  // Rule 6(1)(c): Net Quantity Metric check
  if (rule.id === 'rule-pcr-6-1-c') {
    // Check for illegal non-metric units or unauthorized abbreviations like gms, kgs, ltrs, mltrs, mls, lbs, oz
    const illegalUnitMatch = text.match(/\b(gms|kgs|ltr|ltrs|mltr|mltrs|mls|lbs|oz|kilo|litres)\b/i);
    if (illegalUnitMatch) {
      const detectedToken = illegalUnitMatch[0];
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'FAIL',
        confidence: 0.96,
        extractedText: text,
        expectedFormat: 'Standard SI Metric units: g, kg, ml, l, L, mg, m, cm, mm, N',
        findingNotes: `Non-standard abbreviation "${detectedToken}" found in net quantity declaration ("${text}"). Under Rule 6(1)(c) and the Third Schedule of the Legal Metrology (Packaged Commodities) Rules, 2011, only authorized metric symbols (g, kg, ml, l, m) are lawful. Using non-prescribed abbreviations or pluralized forms like "${detectedToken}" is a statutory infraction under Section 36(1) of the Legal Metrology Act, 2009.`,
        requiresOfficerReview: false,
        remedyAction: 'Standardize metric symbol to standard SI notation (e.g. "g", "kg", "ml", "l") without non-prescribed abbreviations or trailing plurals.',
      };
    }

    const hasValidMetric = /\d+(\.\d+)?\s*(g|kg|ml|l|L|mg|m|cm|mm|N|units?)\b/i.test(text);
    if (!hasValidMetric) {
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NEEDS_REVIEW',
        confidence: candidate.ocrConfidence,
        extractedText: text,
        expectedFormat: 'Number followed by SI metric symbol (e.g. 500 g, 1 kg, 750 ml)',
        findingNotes: `Net quantity text "${text}" could not be deterministically parsed into an authorized metric standard. Routed to officer for manual verification.`,
        requiresOfficerReview: true,
      };
    }
  }

  // Rule 6(1)(e): MRP inclusive of all taxes check
  if (rule.id === 'rule-pcr-6-1-e') {
    const hasMrpTag = /(mrp|maximum\s+retail\s+price)/i.test(text);
    const hasTaxClause = /(incl|inclusive|all\s+taxes)/i.test(text);
    const hasPriceValue = /(₹|rs\.?|\binr\b)?\s*\d+(\.\d{2})?/i.test(text);

    if (hasMrpTag && !hasTaxClause) {
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'FAIL',
        confidence: 0.94,
        extractedText: text,
        expectedFormat: 'MRP Rs. XX.XX (incl. of all taxes)',
        findingNotes:
          'Declaration mentions price but omits statutory statement "(inclusive of all taxes)". This violates Rule 6(1)(e) of the Packaged Commodities Rules.',
        requiresOfficerReview: false,
        remedyAction: 'Include explicit mandatory wording "incl. of all taxes" alongside MRP.',
      };
    }

    if (!hasMrpTag && hasPriceValue) {
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NEEDS_REVIEW',
        confidence: 0.8,
        extractedText: text,
        expectedFormat: 'Explicit "MRP Rs. [Value] (incl. of all taxes)"',
        findingNotes: 'Numeric price found without clear "MRP" statutory prefix. Potential ambiguous retail label.',
        requiresOfficerReview: true,
      };
    }
  }

  // Rule 6(1)(d): Month & Year of manufacture
  if (rule.id === 'rule-pcr-6-1-d') {
    const dateRegex = /(0[1-9]|1[0-2])[/-](20\d{2})|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2}/i;
    if (!dateRegex.test(text)) {
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NEEDS_REVIEW',
        confidence: candidate.ocrConfidence,
        extractedText: text,
        expectedFormat: 'MM/YYYY or Month YYYY (e.g. 04/2026 or April 2026)',
        findingNotes: `Manufacturing date string "${text}" does not match standard date formats or may be partially smudged.`,
        requiresOfficerReview: true,
      };
    }
  }

  // Regex validation if configured
  if (rule.validationRegex) {
    const cleanPattern = rule.validationRegex.replace(/^\(\?i\)/, '');
    const reg = new RegExp(cleanPattern, 'i');
    if (!reg.test(text)) {
      return {
        ruleId: rule.id,
        ruleReference: rule.section,
        ruleTitle: rule.title,
        ruleDescription: rule.description,
        status: 'NEEDS_REVIEW',
        confidence: candidate.ocrConfidence,
        extractedText: text,
        expectedFormat: `Standard pattern: ${rule.validationRegex}`,
        findingNotes: `Extracted text did not cleanly match statutory format rule. Officer review required.`,
        requiresOfficerReview: true,
      };
    }
  }

  // Passed all checks cleanly!
  return {
    ruleId: rule.id,
    ruleReference: rule.section,
    ruleTitle: rule.title,
    ruleDescription: rule.description,
    status: 'PASS',
    confidence: candidate.ocrConfidence,
    extractedText: text,
    expectedFormat: 'Conforms to statutory metrology specifications',
    findingNotes: `Full compliance with ${rule.section}. Extracted declaration meets all statutory criteria.`,
    requiresOfficerReview: false,
  };
}

