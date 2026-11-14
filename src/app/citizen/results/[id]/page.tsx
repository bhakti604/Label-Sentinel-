'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowLeft,
  FileWarning,
  Printer,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Scale,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useSentinel } from '@/lib/storage/context';

export default function CitizenDossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { scans } = useSentinel();

  const dossierId = params?.id as string;
  const dossier = scans.find((s) => s.id === dossierId);

  if (!dossier) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1C2526', marginBottom: '8px' }}>
          Compliance Dossier Not Found
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7A7A', marginBottom: '16px' }}>
          No records match ID {dossierId}. It may have been archived or is from an expired session.
        </p>
        <Link href="/citizen/results" className="btn btn-primary">
          <ArrowLeft size={14} /> Back to Compliance Results
        </Link>
      </div>
    );
  }

  const isFailed = dossier.overallStatus === 'FAIL';
  const isNeedsReview = dossier.overallStatus === 'NEEDS_REVIEW';

  return (
    <div>
      <PageHeader
        title={`Compliance Dossier: ${dossier.id}`}
        description={`Statutory verification record under The Legal Metrology (Packaged Commodities) Rules, 2011.`}
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Compliance Results', href: '/citizen/results' },
          { label: dossier.id },
        ]}
        badge={<StatusBadge status={dossier.overallStatus} />}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              <Printer size={15} /> Print Report
            </button>
            {isFailed && (
              <Link
                href={`/citizen/complaints?dossierId=${dossier.id}&barcode=${dossier.barcode}&productName=${encodeURIComponent(dossier.productName)}`}
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <FileWarning size={15} /> File Enforcement Complaint
              </Link>
            )}
          </div>
        }
      />

      {/* Product Summary Header Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            borderBottom: '1px solid #E4EBEA',
            paddingBottom: '20px',
            marginBottom: '20px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
              Product Name
            </span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2526', marginTop: '2px' }}>
              {dossier.productName}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
              Brand: {dossier.brandName}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
              Barcode (EAN/GTIN)
            </span>
            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {dossier.barcode}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
              Category: {dossier.category.replace('_', ' ')}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
              Jurisdiction & Date
            </span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526', marginTop: '2px' }}>
              {dossier.jurisdiction}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
              {dossier.scannedAt}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
              Evaluator Authority
            </span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#14857D', marginTop: '2px' }}>
              Deterministic Rule Engine
            </div>
            <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
              Version PCR-2024.1.0
            </div>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          style={{
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: isFailed ? '#FDF1F1' : isNeedsReview ? '#FEF7EC' : '#EAF5F0',
            border: `1px solid ${isFailed ? '#F8C7C7' : isNeedsReview ? '#F7DDB6' : '#B7E1CD'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          {isFailed ? (
            <XCircle size={22} color="#C44747" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : isNeedsReview ? (
            <AlertTriangle size={22} color="#B7791F" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={22} color="#23845B" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isFailed ? '#C44747' : isNeedsReview ? '#B7791F' : '#23845B',
              }}
            >
              {isFailed
                ? 'Statutory Non-Compliance Detected (FAIL)'
                : isNeedsReview
                ? 'Remanded for Legal Metrology Officer Verification (NEEDS_REVIEW)'
                : 'Verified Compliant with Packaged Commodities Rules (PASS)'}
            </h4>
            <p style={{ fontSize: '12px', color: '#1C2526', marginTop: '4px', lineHeight: 1.5 }}>
              {isFailed
                ? 'One or more mandatory statutory declarations violate The Legal Metrology (Packaged Commodities) Rules, 2011. Offenses may attract Section 36(1) compounding penalties or formal prosecution dossiers.'
                : isNeedsReview
                ? 'Certain declarations exhibited low OCR extraction confidence, smudged print, or obscured panels. In accordance with platform compliance rules, automated AI cannot issue a verdict and the finding is queued for human officer inspection.'
                : 'All applicable declarations under Rule 6(1) (Manufacturer details, generic name, SI metric net quantity, month/year, MRP with taxes, and consumer care) meet statutory criteria.'}
            </p>
          </div>
        </div>

        {/* Official Officer Adjudication Notice */}
        {dossier.reviewedByOfficer && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '6px',
              backgroundColor: '#F0F9F8',
              border: '1px solid #B7E1CD',
              borderLeft: '4px solid #14857D',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#14857D" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F5F59' }}>
                  Official Legal Metrology Officer Adjudication Completed
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#6B7A7A' }}>
                {dossier.reviewedAt}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#1C2526', lineHeight: 1.5 }}>
              <strong>Adjudicating Authority:</strong> {dossier.reviewedByOfficer}
            </div>
            {dossier.officerNotes && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#1C2526',
                  marginTop: '6px',
                  fontStyle: 'italic',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #E4EBEA',
                }}
              >
                &ldquo;{dossier.officerNotes}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Declarations Breakdown */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Statutory Rule Evaluation Ledger</h3>
            <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
              Rule-by-rule deterministic findings from the Packaged Commodities Rules, 2011
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#23845B' }}>{dossier.declarationsCount.passed} Passed</span>
            <span style={{ color: '#C44747' }}>{dossier.declarationsCount.failed} Failed</span>
            {dossier.declarationsCount.needsReview > 0 && (
              <span style={{ color: '#B7791F' }}>{dossier.declarationsCount.needsReview} Under Review</span>
            )}
          </div>
        </div>

        <div style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFA', borderBottom: '1px solid #E4EBEA' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                  Statutory Rule
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                  Extracted Raw Declaration
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                  Verdict
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                  Statutory Finding & Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {dossier.evaluations.map((ev, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: idx === dossier.evaluations.length - 1 ? 'none' : '1px solid #E4EBEA',
                    backgroundColor: ev.status === 'FAIL' ? '#FFFAFA' : undefined,
                  }}
                >
                  <td style={{ padding: '14px 16px', verticalAlign: 'top', width: '220px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1C2526' }}>
                      {ev.ruleReference}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7A7A', marginTop: '2px' }}>
                      {ev.ruleTitle}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', verticalAlign: 'top', width: '280px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: '#F9FAFA',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        border: '1px solid #E4EBEA',
                        color: ev.extractedText ? '#1C2526' : '#8E9C9B',
                      }}
                    >
                      {ev.extractedText || 'None detected on packaging'}
                    </div>
                    {ev.confidence !== undefined && (
                      <div style={{ fontSize: '10px', color: '#6B7A7A', marginTop: '4px' }}>
                        Confidence: {Math.round(ev.confidence * 100)}%
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', verticalAlign: 'top', width: '130px' }}>
                    <StatusBadge status={ev.status} size="sm" />
                  </td>

                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '12px', color: '#1C2526', lineHeight: 1.45 }}>
                      {ev.findingNotes}
                    </div>
                    {ev.remedyAction && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '11px',
                          color: '#C44747',
                          fontWeight: 500,
                        }}
                      >
                        <strong>Mandated Remedial Action:</strong> {ev.remedyAction}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ask Know More AI contextual link */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={20} color="#14857D" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
              Have questions about this commodity&apos;s statutory requirements?
            </div>
            <div style={{ fontSize: '12px', color: '#6B7A7A' }}>
              Ask the Know More AI Assistant for relevant statutory clauses, maximum permissible errors, or consumer rights.
            </div>
          </div>
        </div>
        <Link
          href={`/citizen/know-more?topic=${encodeURIComponent(dossier.productName)}`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          Ask Know More AI
        </Link>
      </div>
    </div>
  );
}

