'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Download,
  ScanLine,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { ComplianceDossier } from '@/types/compliance';

export default function CitizenScanHistoryPage() {
  const router = useRouter();
  const { scans, showNotification } = useSentinel();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = scans.filter((s) => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.barcode.includes(searchQuery) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Dossier ID,Barcode,Product,Brand,Category,Status,Scanned At']
        .concat(
          filtered.map(
            (s) =>
              `"${s.id}","${s.barcode}","${s.productName}","${s.brandName}","${s.category}","${s.overallStatus}","${s.scannedAt}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `legal_metrology_scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('success', 'Export Completed', 'Scan ledger downloaded as CSV.');
  };

  const columns: Column<ComplianceDossier>[] = [
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
      header: 'Commodity Details',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.productName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
            {item.brandName} • EAN {item.barcode}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.category.replace('_', ' ')}</span>,
    },
    {
      header: 'Scanned Timestamp',
      accessorKey: 'scannedAt',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.scannedAt}</span>,
    },
    {
      header: 'Statutory Verdict',
      render: (item) => <StatusBadge status={item.overallStatus} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/citizen/results/${item.id}`);
          }}
          className="btn btn-secondary btn-sm"
        >
          View Dossier <ArrowRight size={13} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Package Scan History Ledger"
        description="Comprehensive audit log of all pre-packaged commodity evaluations performed in this session."
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Scan History' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={15} /> Export Ledger (CSV)
            </button>
            <Link href="/citizen/scan" className="btn btn-primary">
              <ScanLine size={15} /> New Scan
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search history by name, barcode, or ID..."
            width="320px"
          />

          <FilterDropdown
            label="Filter by Status"
            selectedValue={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'PASS (Compliant)', value: 'PASS' },
              { label: 'FAIL (Infraction)', value: 'FAIL' },
              { label: 'NEEDS_REVIEW (Uncertain)', value: 'NEEDS_REVIEW' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> records in ledger
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
        onRowClick={(item) => router.push(`/citizen/results/${item.id}`)}
      />
    </div>
  );
}

