'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ScanLine,
  FileCheck2,
  FileWarning,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { ComplianceDossier } from '@/types/compliance';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { scans, complaints } = useSentinel();

  const totalScans = scans.length;
  const compliantScans = scans.filter((s) => s.overallStatus === 'PASS').length;
  const flaggedScans = scans.filter((s) => s.overallStatus === 'FAIL' || s.overallStatus === 'NEEDS_REVIEW').length;
  const filedComplaints = complaints.length;

  const recentScansColumns: Column<ComplianceDossier>[] = [
    {
      header: 'Product / Commodity',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.productName}</div>
          <div style={{ fontSize: '12px', color: '#6B7A7A' }}>
            {item.brandName} • {item.barcode}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      render: (item) => (
        <span style={{ fontSize: '12px', color: '#6B7A7A', fontWeight: 500 }}>
          {item.category.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Scanned At',
      accessorKey: 'scannedAt',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.scannedAt}</span>,
    },
    {
      header: 'Compliance Verdict',
      render: (item) => <StatusBadge status={item.overallStatus} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <Link
          href={`/citizen/results/${item.id}`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          View Dossier <ArrowRight size={13} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Citizen Compliance Dashboard"
        description="Verify pre-packaged commodity labels, detect deceptive packaging, and exercise consumer rights under The Legal Metrology (Packaged Commodities) Rules, 2011."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/citizen/scan" className="btn btn-primary">
              <ScanLine size={16} /> Scan Product Label
            </Link>
            <Link href="/citizen/complaints" className="btn btn-secondary">
              <FileWarning size={16} /> File Complaint
            </Link>
          </div>
        }
      />

      {/* Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <SummaryCard
          title="Total Scans"
          value={totalScans}
          subtext="Verified in session"
          icon={ScanLine}
          accentColor="#14857D"
          onClick={() => router.push('/citizen/history')}
        />
        <SummaryCard
          title="Fully Compliant (PASS)"
          value={compliantScans}
          subtext="Conforming to PCR 2011"
          icon={CheckCircle2}
          accentColor="#23845B"
          trend={{ value: `${Math.round((compliantScans / Math.max(1, totalScans)) * 100)}% compliant`, isPositive: true }}
          onClick={() => router.push('/citizen/results')}
        />
        <SummaryCard
          title="Flagged / Review"
          value={flaggedScans}
          subtext="Violations or smudged font"
          icon={AlertTriangle}
          accentColor="#B7791F"
          trend={{ value: `${flaggedScans} anomalies`, isNeutral: true }}
          onClick={() => router.push('/citizen/results')}
        />
        <SummaryCard
          title="Complaints Lodged"
          value={filedComplaints}
          subtext="Routed to Officer review"
          icon={FileWarning}
          accentColor="#0F5F59"
          onClick={() => router.push('/citizen/complaints')}
        />
      </div>

      {/* Quick Access Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#E7F3F2',
                color: '#14857D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ScanLine size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>OCR Product Label Extractor</h3>
              <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                Capture packaging declarations & test rule compliance
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#1C2526', lineHeight: 1.5, marginBottom: '16px' }}>
            Upload or photograph mandatory label panels. The deterministic engine verifies MRP taxes, metric quantities,
            and consumer care declarations.
          </p>
          <Link href="/citizen/scan" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            Launch Scanner <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FEF7EC',
                color: '#B7791F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileWarning size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Consumer Complaint Redressal</h3>
              <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                Report dual pricing, non-standard units, or missing origin
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#1C2526', lineHeight: 1.5, marginBottom: '16px' }}>
            Encountered over-charging above MRP or illegible packaging? Submit an enforcement complaint directly to the
            district Legal Metrology Officer.
          </p>
          <Link href="/citizen/complaints" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            File Metrology Complaint <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#EAF5F0',
                color: '#23845B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Know More AI Assistant</h3>
              <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                Informational metrology guidance & consumer laws
              </p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#1C2526', lineHeight: 1.5, marginBottom: '16px' }}>
            Get instant statutory clarifications on font sizes, Unit Sale Price requirements, and consumer rights.
            (Separated from legal compliance verdicts).
          </p>
          <Link href="/citizen/know-more" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            Ask Know More AI <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Product Scans</h2>
            <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
              Deterministic statutory rule evaluations for pre-packaged commodities
            </p>
          </div>
          <Link
            href="/citizen/history"
            style={{ fontSize: '13px', fontWeight: 600, color: '#14857D', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View Full Scan History <ArrowRight size={14} />
          </Link>
        </div>

        <DataTable
          data={scans.slice(0, 5)}
          columns={recentScansColumns}
          keyExtractor={(item) => item.id}
          pageSize={5}
        />
      </div>

      {/* Statutory Rights Information Box */}
      <div
        className="card"
        style={{
          padding: '20px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #14857D',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <ShieldCheck size={24} color="#14857D" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1C2526' }}>
              Statutory Consumer Protections under Legal Metrology Act, 2009
            </h4>
            <p style={{ fontSize: '13px', color: '#6B7A7A', marginTop: '4px', lineHeight: 1.5 }}>
              Under Rule 6 of The Legal Metrology (Packaged Commodities) Rules, 2011, every pre-packaged commodity sold in India
              or on e-commerce platforms must mandatorily declare: (1) Name & address of manufacturer/packer/importer, (2) Generic name,
              (3) Net quantity in standard SI metric units (never plural like "gms" or "ltrs"), (4) Month & Year of manufacture,
              (5) Maximum Retail Price inclusive of all taxes, (6) Unit Sale Price for items ≥ 1kg/1L, and (7) Consumer Care grievance contact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

