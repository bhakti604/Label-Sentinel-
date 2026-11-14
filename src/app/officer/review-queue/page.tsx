'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  SearchCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { LoadingState } from '@/components/common/LoadingState';
import { useSentinel } from '@/lib/storage/context';
import { ComplianceStatus, RuleEvaluationResult } from '@/types/compliance';

function OfficerReviewQueueContent() {
  const searchParams = useSearchParams();
  const { scans, resolveReviewQueueItem } = useSentinel();

  // Find all evaluations requiring officer review
  const itemsNeedingReview: {
    dossierId: string;
    productName: string;
    brandName: string;
    barcode: string;
    scannedAt: string;
    evaluation: RuleEvaluationResult;
  }[] = [];

  scans.forEach((scan) => {
    scan.evaluations.forEach((ev) => {
      if (ev.requiresOfficerReview || ev.status === 'NEEDS_REVIEW') {
        itemsNeedingReview.push({
          dossierId: scan.id,
          productName: scan.productName,
          brandName: scan.brandName,
          barcode: scan.barcode,
          scannedAt: scan.scannedAt,
          evaluation: ev,
        });
      }
    });
  });

  const [activeItem, setActiveItem] = useState<{
    dossierId: string;
    productName: string;
    evaluation: RuleEvaluationResult;
  } | null>(null);

  const [decisionVerdict, setDecisionVerdict] = useState<ComplianceStatus>('PASS');
  const [officerNotes, setOfficerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdjudication = (item: {
    dossierId: string;
    productName: string;
    evaluation: RuleEvaluationResult;
  }) => {
    setActiveItem(item);
    setDecisionVerdict('PASS');
    setOfficerNotes(
      `Verified by Legal Metrology Officer. Visual examination confirms statutory compliance with ${item.evaluation.ruleReference}.`
    );
  };

  const handleSaveAdjudication = () => {
    if (!activeItem) return;
    setIsSubmitting(true);

    setTimeout(() => {
      resolveReviewQueueItem(
        activeItem.dossierId,
        activeItem.evaluation.ruleId,
        decisionVerdict,
        officerNotes
      );
      setIsSubmitting(false);
      setActiveItem(null);
    }, 400);
  };

  return (
    <div>
      <PageHeader
        title="Statutory Triage Review Queue"
        description="Mandatory officer adjudication for package declarations flagged with low OCR extraction confidence, ambiguous wording, or smudged print under The Legal Metrology (Packaged Commodities) Rules, 2011."
        breadcrumbs={[
          { label: 'Officer Portal', href: '/officer' },
          { label: 'Review Queue' },
        ]}
        badge={
          <span className="badge badge-needs-review">
            {itemsNeedingReview.length} Pending Adjudication
          </span>
        }
      />

      {/* Compliance Directive Card */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #B7791F',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <AlertTriangle size={20} color="#B7791F" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: '#1C2526' }}>
            Officer Discretion & Statutory Accountability:
          </span>{' '}
          <span style={{ color: '#6B7A7A' }}>
            The deterministic engine intentionally withholds PASS/FAIL verdicts when OCR confidence falls below 72% or when
            packaging stickers obscure statutory print. As the designated enforcement officer, your adjudication overrides the
            automated recommendation and creates an immutable audit trail entry under the Act.
          </span>
        </div>
      </div>

      {/* Queue Items List */}
      {itemsNeedingReview.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EAF5F0',
              color: '#23845B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1C2526', marginBottom: '4px' }}>
            Review Queue is Clear
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7A7A', maxWidth: '420px' }}>
            All ambiguous declarations have been verified by authorized metrology inspectors.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {itemsNeedingReview.map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: '4px solid #B7791F',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#14857D' }}>
                      {item.dossierId}
                    </span>
                    <span style={{ color: '#CDD8D6' }}>•</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#1C2526' }}>
                      {item.productName}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
                    Brand: {item.brandName} • EAN {item.barcode} • Logged: {item.scannedAt}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge status="NEEDS_REVIEW" />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenAdjudication(item)}
                  >
                    <UserCheck size={14} /> Adjudicate Declaration
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#F9FAFA',
                  border: '1px solid #E4EBEA',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                    Statutory Rule Clause
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#14857D', marginTop: '2px' }}>
                    {item.evaluation.ruleReference} — {item.evaluation.ruleTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '4px' }}>
                    {item.evaluation.ruleDescription}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                    Extracted Candidate Text (OCR)
                  </span>
                  <div
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: '#FFFFFF',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #E4EBEA',
                      marginTop: '4px',
                      color: '#1C2526',
                    }}
                  >
                    {item.evaluation.extractedText || '<Empty or Illegible>'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#B7791F', marginTop: '4px', fontWeight: 500 }}>
                    Confidence: {Math.round(item.evaluation.confidence * 100)}% (Sub-threshold)
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', textTransform: 'uppercase' }}>
                    Engine Analysis Note
                  </span>
                  <div style={{ fontSize: '12px', color: '#1C2526', marginTop: '2px', lineHeight: 1.45 }}>
                    {item.evaluation.findingNotes}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjudication Modal */}
      {activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={`Adjudicate ${activeItem.evaluation.ruleReference}`}
          description={`Officer ruling for Dossier ${activeItem.dossierId} (${activeItem.productName})`}
          maxWidth="560px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAdjudication}
                disabled={isSubmitting || !officerNotes.trim()}
              >
                {isSubmitting ? 'Recording Verdict...' : 'Commit Adjudication Verdict'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F6F8F8', borderRadius: '6px', fontSize: '12px' }}>
              <div>
                <strong>Candidate Text:</strong> {activeItem.evaluation.extractedText || 'None'}
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong>Statutory Standard:</strong> {activeItem.evaluation.expectedFormat}
              </div>
            </div>

            <FormField label="Official Metrology Ruling" required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionVerdict('PASS');
                    setOfficerNotes('Verified compliant upon physical sample inspection under Section 15 powers.');
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: decisionVerdict === 'PASS' ? '2px solid #23845B' : '1px solid #E4EBEA',
                    backgroundColor: decisionVerdict === 'PASS' ? '#EAF5F0' : '#FFFFFF',
                    color: decisionVerdict === 'PASS' ? '#23845B' : '#1C2526',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} /> PASS (Compliant)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionVerdict('FAIL');
                    setOfficerNotes('Infraction confirmed. Declaration missing or obscured. Issue Show Cause Notice under Section 36(1).');
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: decisionVerdict === 'FAIL' ? '2px solid #C44747' : '1px solid #E4EBEA',
                    backgroundColor: decisionVerdict === 'FAIL' ? '#FDF1F1' : '#FFFFFF',
                    color: decisionVerdict === 'FAIL' ? '#C44747' : '#1C2526',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <XCircle size={16} /> FAIL (Infraction)
                </button>
              </div>
            </FormField>

            <FormField label="Investigating Officer Official Findings & Remedial Order" required>
              <textarea
                className="form-textarea"
                rows={4}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter statutory inspection notes, physical measurements, or notice directives..."
              />
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function OfficerReviewQueuePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading review queue..." />}>
      <OfficerReviewQueueContent />
    </Suspense>
  );
}

