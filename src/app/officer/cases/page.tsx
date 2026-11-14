'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  PlusCircle,
  Scale,
  Calendar,
  AlertTriangle,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { useSentinel } from '@/lib/storage/context';
import { CaseStatus, EnforcementCase } from '@/types/portal';

export default function OfficerCasesPage() {
  const { cases, addCase, updateCaseStatus } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCaseForStatus, setActiveCaseForStatus] = useState<EnforcementCase | null>(null);

  // New Case form
  const [respondentName, setRespondentName] = useState('');
  const [respondentType, setRespondentType] = useState<EnforcementCase['respondentType']>('MANUFACTURER');
  const [allegedSection, setAllegedSection] = useState('Section 36(1) read with Rule 6(1)');
  const [penaltyAmountInr, setPenaltyAmountInr] = useState(25000);
  const [hearingDate, setHearingDate] = useState('2026-11-20');
  const [summary, setSummary] = useState('');

  // Update Case form
  const [updatedStatus, setUpdatedStatus] = useState<CaseStatus>('COMPOUNDED');
  const [updatedPenalty, setUpdatedPenalty] = useState(25000);

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.respondentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseDocketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.allegedSection.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentName.trim()) return;

    addCase({
      caseDocketNumber: `LM-DEL-2026-00${85 + cases.length}`,
      respondentName,
      respondentType,
      allegedSection,
      investigatingOfficer: 'Inspector Vikram Anand',
      filingDate: new Date().toISOString().substring(0, 10),
      hearingDate: hearingDate || undefined,
      status: 'NOTICE_SERVED',
      penaltyAmountInr: Number(penaltyAmountInr) || 0,
      summary,
    });

    setIsCreateOpen(false);
    setRespondentName('');
    setSummary('');
  };

  const handleUpdate = () => {
    if (!activeCaseForStatus) return;
    updateCaseStatus(activeCaseForStatus.id, updatedStatus, updatedPenalty);
    setActiveCaseForStatus(null);
  };

  const columns: Column<EnforcementCase>[] = [
    {
      header: 'Docket Number',
      accessorKey: 'caseDocketNumber',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14857D' }}>
          {item.caseDocketNumber}
        </span>
      ),
    },
    {
      header: 'Respondent / Entity',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.respondentName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
            Classification: {item.respondentType}
          </div>
        </div>
      ),
    },
    {
      header: 'Alleged Statutory Section',
      render: (item) => (
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#C44747' }}>
          {item.allegedSection}
        </span>
      ),
    },
    {
      header: 'Compounding / Penalty',
      render: (item) => (
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
          ₹ {item.penaltyAmountInr.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Filing / Hearing Date',
      render: (item) => (
        <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
          <div>Filed: {item.filingDate}</div>
          {item.hearingDate && <div>Hearing: {item.hearingDate}</div>}
        </div>
      ),
    },
    {
      header: 'Docket Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setActiveCaseForStatus(item);
            setUpdatedStatus(item.status);
            setUpdatedPenalty(item.penaltyAmountInr);
          }}
        >
          Update Case
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Section 36 Enforcement Cases & Compounding Dossiers"
        description="Formal judicial dossiers under The Legal Metrology Act, 2009. Manage Show Cause notices, compounding under Section 48, and criminal complaints filed before Chief Metropolitan Magistrates."
        breadcrumbs={[
          { label: 'Officer Portal', href: '/officer' },
          { label: 'Cases & Compounding' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircle size={15} /> File Legal Metrology Docket
          </button>
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
            placeholder="Search by respondent, docket #, or section..."
            width="320px"
          />

          <FilterDropdown
            label="Case Status"
            selectedValue={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'NOTICE SERVED', value: 'NOTICE_SERVED' },
              { label: 'COMPOUNDED (Settled)', value: 'COMPOUNDED' },
              { label: 'PROSECUTION INITIATED', value: 'PROSECUTION_INITIATED' },
              { label: 'DRAFT', value: 'DRAFT' },
              { label: 'CLOSED', value: 'CLOSED' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> statutory dockets
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={6}
      />

      {/* New Case Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Enforcement Docket"
        description="Initiate Section 36 proceedings under The Legal Metrology Act, 2009."
        maxWidth="580px"
      >
        <form onSubmit={handleCreate}>
          <FormField label="Respondent Company / Person Name" required>
            <input
              type="text"
              className="form-input"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="e.g. Apex Consumer Packaged Goods Ltd."
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Respondent Classification" required>
              <select
                className="form-select"
                value={respondentType}
                onChange={(e) => setRespondentType(e.target.value as EnforcementCase['respondentType'])}
              >
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="PACKER">Pre-Packer</option>
                <option value="IMPORTER">Importer</option>
                <option value="ECOMMERCE_ENTREPRENEUR">E-Commerce Seller</option>
                <option value="RETAILER">Retail Store</option>
              </select>
            </FormField>

            <FormField label="Alleged Statutory Section" required>
              <input
                type="text"
                className="form-input"
                value={allegedSection}
                onChange={(e) => setAllegedSection(e.target.value)}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Proposed Compounding Fee (₹)" required>
              <input
                type="number"
                className="form-input"
                value={penaltyAmountInr}
                onChange={(e) => setPenaltyAmountInr(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Hearing / Show Cause Return Date">
              <input
                type="date"
                className="form-input"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Prosecution Facts & Statutory Grounds Summary" required>
            <textarea
              className="form-textarea"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary of infractions discovered during sample analysis or market surveillance..."
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Briefcase size={15} /> Register Legal Docket
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Case Modal */}
      {activeCaseForStatus && (
        <Modal
          isOpen={true}
          onClose={() => setActiveCaseForStatus(null)}
          title={`Update Docket: ${activeCaseForStatus.caseDocketNumber}`}
          description={`Respondent: ${activeCaseForStatus.respondentName}`}
          maxWidth="480px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveCaseForStatus(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdate}
              >
                Commit Case Update
              </button>
            </>
          }
        >
          <FormField label="Docket Enforcement Status" required>
            <select
              className="form-select"
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value as CaseStatus)}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="NOTICE_SERVED">NOTICE SERVED</option>
              <option value="COMPOUNDED">COMPOUNDED (Section 48 Fee Paid)</option>
              <option value="PROSECUTION_INITIATED">PROSECUTION INITIATED (Court Trial)</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </FormField>

          <FormField label="Compounding Fee Levied (₹)">
            <input
              type="number"
              className="form-input"
              value={updatedPenalty}
              onChange={(e) => setUpdatedPenalty(Number(e.target.value))}
            />
          </FormField>
        </Modal>
      )}
    </div>
  );
}

