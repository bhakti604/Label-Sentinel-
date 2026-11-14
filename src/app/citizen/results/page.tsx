'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  FileWarning,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { ComplianceDossier, ComplianceStatus } from '@/types/compliance';

export default function CitizenComplianceResultsPage() {
  const { scans } = useSentinel();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.barcode.includes(searchQuery) ||
      scan.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || scan.overallStatus === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || scan.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
      header: 'Product / Commodity',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.productName}</div>
          <div style={{ fontSize: '12px', color: '#6B7A7A' }}>
            {item.brandName} • EAN: {item.barcode}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (item) => (
        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          {item.category.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Declarations Evaluated',
      render: (item) => (
        <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
          <span style={{ color: '#23845B' }}>{item.declarationsCount.passed} Pass</span>
          <span style={{ color: '#CDD8D6' }}>•</span>
          <span style={{ color: '#C44747' }}>{item.declarationsCount.failed} Fail</span>
          {item.declarationsCount.needsReview > 0 && (
            <>
              <span style={{ color: '#CDD8D6' }}>•</span>
              <span style={{ color: '#B7791F' }}>{item.declarationsCount.needsReview} Review</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Statutory Verdict',
      render: (item) => <StatusBadge status={item.overallStatus} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {item.overallStatus === 'FAIL' && (
            <Link
              href={`/citizen/complaints?dossierId=${item.id}&barcode=${item.barcode}`}
              className="btn btn-sm"
              style={{
                backgroundColor: '#FEF7EC',
                color: '#B7791F',
                border: '1px solid #F7DDB6',
                textDecoration: 'none',
              }}
              title="File consumer complaint for statutory infraction"
            >
              <FileWarning size={13} /> Complain
            </Link>
          )}
          <Link
            href={`/citizen/results/${item.id}`}
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            Inspection Report <ArrowRight size={13} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Statutory Compliance Results"
        description="Official deterministic rule evaluation dossiers conforming to The Legal Metrology (Packaged Commodities) Rules, 2011."
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Compliance Results' },
        ]}
        actions={
          <Link href="/citizen/scan" className="btn btn-primary">
            <FileCheck2 size={16} /> Scan Another Product
          </Link>
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
            placeholder="Search by product, brand, EAN, or ID..."
            width="320px"
          />

          <FilterDropdown
            label="Verdict"
            selectedValue={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Verdicts', value: 'ALL' },
              { label: 'PASS (Compliant)', value: 'PASS' },
              { label: 'FAIL (Statutory Infraction)', value: 'FAIL' },
              { label: 'NEEDS_REVIEW (Uncertain OCR)', value: 'NEEDS_REVIEW' },
              { label: 'NOT_APPLICABLE', value: 'NOT_APPLICABLE' },
            ]}
          />

          <FilterDropdown
            label="Category"
            selectedValue={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'All Categories', value: 'ALL' },
              { label: 'Food & FMCG', value: 'FOOD_FMCG' },
              { label: 'Cosmetics', value: 'COSMETICS' },
              { label: 'Electronics', value: 'ELECTRONICS' },
              { label: 'OTC Pharma', value: 'PHARMACEUTICAL_OTC' },
              { label: 'Household Chemicals', value: 'HOUSEHOLD_CHEMICALS' },
            ]}
          />
        </div>

        <div style={{ fontSize: '12px', color: '#6B7A7A' }}>
          Showing <strong>{filteredScans.length}</strong> evaluated packages
        </div>
      </div>

      {/* Results Table */}
      <DataTable
        data={filteredScans}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
        emptyTitle="No compliance dossiers found"
        emptySubtitle="Try adjusting search terms or filters, or execute a new label scan."
      />
    </div>
  );
}

