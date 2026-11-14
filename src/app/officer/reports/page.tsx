'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  PieChart,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { useSentinel } from '@/lib/storage/context';

export default function OfficerReportsPage() {
  const { scans, inspections, cases, complaints, showNotification } = useSentinel();

  const totalEvaluations = scans.length;
  const passedEvaluations = scans.filter((s) => s.overallStatus === 'PASS').length;
  const failedEvaluations = scans.filter((s) => s.overallStatus === 'FAIL').length;
  const needsReviewEvaluations = scans.filter((s) => s.overallStatus === 'NEEDS_REVIEW').length;

  const totalPenaltiesCollected = cases
    .filter((c) => c.status === 'COMPOUNDED')
    .reduce((acc, curr) => acc + curr.penaltyAmountInr, 0);

  const handleExportReport = () => {
    window.print();
    showNotification('info', 'Report Ready', 'Statutory compliance surveillance report compiled.');
  };

  const handleExportCSV = () => {
    const failedScans = scans.filter((s) => s.overallStatus === 'FAIL');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Dossier ID,Barcode,Product,Brand,Category,Status,Violations Count,Date']
        .concat(
          failedScans.map(
            (s) =>
              `"${s.id}","${s.barcode}","${s.productName}","${s.brandName}","${s.category}","${s.overallStatus}","${s.declarationsCount.failed}","${s.scannedAt}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `legal_metrology_infractions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('success', 'Infractions CSV Exported', 'Non-compliant product records downloaded.');
  };

  return (
    <div>
      <PageHeader
        title="Statutory Metrology Compliance Reports"
        description="Regional market surveillance analytics, infraction frequency distributions, and Section 36/48 compounding metrics under The Legal Metrology (Packaged Commodities) Rules, 2011."
        breadcrumbs={[
          { label: 'Officer Portal', href: '/officer' },
          { label: 'Compliance Reports' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleExportReport}>
              <Printer size={15} /> Print Summary Report
            </button>
            <button type="button" className="btn btn-primary" onClick={handleExportCSV}>
              <Download size={15} /> Export Infractions (CSV)
            </button>
          </div>
        }
      />

      {/* High Level Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <SummaryCard
          title="Total Packages Audited"
          value={totalEvaluations}
          subtext="Session evaluation dossiers"
          icon={FileCheck2}
          accentColor="#14857D"
        />
        <SummaryCard
          title="Overall Compliance Rate"
          value={`${Math.round((passedEvaluations / Math.max(1, totalEvaluations)) * 100)}%`}
          subtext={`${passedEvaluations} of ${totalEvaluations} conform fully`}
          icon={ShieldCheck}
          accentColor="#23845B"
          trend={{ value: 'Statutory Benchmark: 95%', isPositive: true }}
        />
        <SummaryCard
          title="Infractions Detected"
          value={failedEvaluations}
          subtext="Statutory violations flagged"
          icon={AlertTriangle}
          accentColor="#C44747"
        />
        <SummaryCard
          title="Compounding Realized"
          value={`₹ ${totalPenaltiesCollected.toLocaleString('en-IN')}`}
          subtext="Section 48 treasury receipts"
          icon={TrendingUp}
          accentColor="#0F5F59"
        />
      </div>

      {/* Infraction Categorization Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Frequent Statutory Infractions Distribution</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Rule 6(1)(c): Non-standard Metric Abbreviations (e.g. &quot;MLTRS&quot;, &quot;gms&quot;)</span>
                  <span style={{ fontWeight: 600, color: '#C44747' }}>38%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F6F8F8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '38%', backgroundColor: '#C44747', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Rule 6(1)(e): Omission of &quot;inclusive of all taxes&quot; on MRP</span>
                  <span style={{ fontWeight: 600, color: '#B7791F' }}>26%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F6F8F8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '26%', backgroundColor: '#B7791F', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Rule 6(1)(da): Missing Unit Sale Price (USP) for Packages ≥ 1kg/1L</span>
                  <span style={{ fontWeight: 600, color: '#14857D' }}>19%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F6F8F8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '19%', backgroundColor: '#14857D', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Rule 6(10): Obscured or Missing Country of Origin (Imported Items)</span>
                  <span style={{ fontWeight: 600, color: '#0F5F59' }}>12%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F6F8F8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '12%', backgroundColor: '#0F5F59', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500 }}>Rule 6(1)(f): Illegible Consumer Care Phone or Grievance Officer</span>
                  <span style={{ fontWeight: 600, color: '#6B7A7A' }}>5%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F6F8F8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '5%', backgroundColor: '#6B7A7A', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Enforcement Actions Summary</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F9FAFA',
                  border: '1px solid #E4EBEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Market Surveillance Inspections</div>
                  <div style={{ fontSize: '11px', color: '#6B7A7A' }}>Completed premises checks</div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#14857D' }}>
                  {inspections.length}
                </span>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F9FAFA',
                  border: '1px solid #E4EBEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Citizen Complaints Processed</div>
                  <div style={{ fontSize: '11px', color: '#6B7A7A' }}>Verified consumer grievances</div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F5F59' }}>
                  {complaints.length}
                </span>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F9FAFA',
                  border: '1px solid #E4EBEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Active Prosecution Dossiers</div>
                  <div style={{ fontSize: '11px', color: '#6B7A7A' }}>Section 36 court proceedings</div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#C44747' }}>
                  {cases.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

