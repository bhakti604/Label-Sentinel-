'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  SearchCheck,
  ClipboardList,
  Inbox,
  Briefcase,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { ComplianceDossier } from '@/types/compliance';

export default function OfficerDashboardPage() {
  const router = useRouter();
  const { scans, complaints, inspections, cases } = useSentinel();

  // Metrics
  const reviewQueueItems = scans.filter((s) => s.overallStatus === 'NEEDS_REVIEW');
  const openInspections = inspections.filter((i) => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS');
  const activeComplaints = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');
  const activeCases = cases.filter((c) => c.status === 'NOTICE_SERVED' || c.status === 'PROSECUTION_INITIATED');

  const reviewColumns: Column<ComplianceDossier>[] = [
    {
      header: 'Dossier ID',
      accessorKey: 'id',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14857D' }}>
          {item.id}
        </span>
      ),
    },
    {
      header: 'Commodity Under Review',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.productName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
            Brand: {item.brandName} • EAN {item.barcode}
          </div>
        </div>
      ),
    },
    {
      header: 'Uncertain Statutory Clauses',
      render: (item) => {
        const reviewRules = item.evaluations.filter((e) => e.requiresOfficerReview);
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {reviewRules.map((r, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: '#FEF7EC',
                  color: '#B7791F',
                  border: '1px solid #F7DDB6',
                }}
              >
                {r.ruleReference}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Date Logged',
      accessorKey: 'scannedAt',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.scannedAt}</span>,
    },
    {
      header: 'Status',
      render: (item) => <StatusBadge status={item.overallStatus} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (item) => (
        <Link
          href={`/officer/review-queue?dossierId=${item.id}`}
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          Adjudicate <ArrowRight size={13} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Enforcement & Surveillance Dashboard"
        description="Legal Metrology Officer workstation for market surveillance, adjudication of ambiguous packaging OCR declarations, complaint investigations, and Section 36 prosecution dossiers."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/officer/review-queue" className="btn btn-primary">
              <SearchCheck size={16} /> Review Queue ({reviewQueueItems.length})
            </Link>
            <Link href="/officer/inspections" className="btn btn-secondary">
              <ClipboardList size={16} /> Schedule Inspection
            </Link>
          </div>
        }
      />

      {/* Enforcement Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <SummaryCard
          title="Review Queue (Triage)"
          value={reviewQueueItems.length}
          subtext="Ambiguous OCR / low font size"
          icon={SearchCheck}
          accentColor="#B7791F"
          trend={{ value: `${reviewQueueItems.length} pending`, isNeutral: true }}
          onClick={() => router.push('/officer/review-queue')}
        />
        <SummaryCard
          title="Active Complaints"
          value={activeComplaints.length}
          subtext="Awaiting preliminary inquiry"
          icon={Inbox}
          accentColor="#14857D"
          onClick={() => router.push('/officer/complaints')}
        />
        <SummaryCard
          title="Pending Inspections"
          value={openInspections.length}
          subtext="Scheduled market visits"
          icon={ClipboardList}
          accentColor="#0F5F59"
          onClick={() => router.push('/officer/inspections')}
        />
        <SummaryCard
          title="Active Court / Compounding Cases"
          value={activeCases.length}
          subtext="Section 36 proceedings"
          icon={Briefcase}
          accentColor="#C44747"
          onClick={() => router.push('/officer/cases')}
        />
      </div>

      {/* Urgent Review Queue Table */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1C2526' }}>
              Pending Human Officer Review Queue
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
              Statutory mandate: AI cannot legally fail or pass ambiguous labels without officer sign-off
            </p>
          </div>
          <Link
            href="/officer/review-queue"
            style={{ fontSize: '13px', fontWeight: 600, color: '#14857D', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Open Full Review Queue <ArrowRight size={14} />
          </Link>
        </div>

        <DataTable
          data={reviewQueueItems}
          columns={reviewColumns}
          keyExtractor={(item) => item.id}
          pageSize={5}
          emptyTitle="Review queue is clear"
          emptySubtitle="All ambiguous label scans have been adjudicated by authorized officers."
        />
      </div>

      {/* Quick Action Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Recent Inspections Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Market Surveillance Inspections</h3>
              <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                On-site retail premises checks under Legal Metrology Act
              </p>
            </div>
            <Link
              href="/officer/inspections"
              style={{ fontSize: '12px', fontWeight: 600, color: '#14857D' }}
            >
              View All
            </Link>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {inspections.slice(0, 3).map((insp, idx) => (
              <div
                key={insp.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: idx === 2 ? 'none' : '1px solid #E4EBEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1C2526' }}>
                    {insp.retailerName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7A7A', marginTop: '2px' }}>
                    {insp.inspectionCode} • {insp.scheduledDate}
                  </div>
                </div>
                <StatusBadge status={insp.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Legal Cases Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Section 36 Enforcement Dockets</h3>
              <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                Compounding notices and prosecution files
              </p>
            </div>
            <Link
              href="/officer/cases"
              style={{ fontSize: '12px', fontWeight: 600, color: '#14857D' }}
            >
              View All
            </Link>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {cases.slice(0, 3).map((cs, idx) => (
              <div
                key={cs.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: idx === 2 ? 'none' : '1px solid #E4EBEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1C2526' }}>
                    {cs.caseDocketNumber} — {cs.respondentName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7A7A', marginTop: '2px' }}>
                    {cs.allegedSection}
                  </div>
                </div>
                <StatusBadge status={cs.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

