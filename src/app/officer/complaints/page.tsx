'use client';

import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Building2,
  FileWarning,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { useSentinel } from '@/lib/storage/context';
import { CitizenComplaint, ComplaintStatus } from '@/types/portal';

export default function OfficerComplaintInboxPage() {
  const { complaints, updateComplaintStatus, addInspection } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);

  const [actionStatus, setActionStatus] = useState<ComplaintStatus>('UNDER_REVIEW');
  const [officerRemarks, setOfficerRemarks] = useState('');

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAction = (c: CitizenComplaint) => {
    setSelectedComplaint(c);
    setActionStatus(c.status);
    setOfficerRemarks(c.officerRemarks || '');
  };

  const handleSaveAction = () => {
    if (!selectedComplaint) return;
    updateComplaintStatus(selectedComplaint.id, actionStatus, officerRemarks);

    // If marked INSPECTION_ORDERED, automatically create an inspection order!
    if (actionStatus === 'INSPECTION_ORDERED' && selectedComplaint.status !== 'INSPECTION_ORDERED') {
      addInspection({
        inspectionCode: `DEL-INSP-${Date.now().toString().slice(-4)}`,
        retailerName: selectedComplaint.vendorName,
        retailerGSTIN: '07AAACS1429B1Z8',
        address: selectedComplaint.vendorAddress,
        jurisdiction: 'Delhi State - Central District',
        officerInCharge: 'Inspector Vikram Anand',
        scheduledDate: '2026-11-06 10:30',
        status: 'SCHEDULED',
        packagesSampled: 30,
        infractionsFound: 0,
        noticeIssued: true,
        notes: `Triggered by complaint ${selectedComplaint.id} regarding ${selectedComplaint.productName}`,
      });
    }

    setSelectedComplaint(null);
  };

  const columns: Column<CitizenComplaint>[] = [
    {
      header: 'Complaint ID',
      accessorKey: 'id',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14857D' }}>
          {item.id}
        </span>
      ),
    },
    {
      header: 'Product / Violation',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.productName}</div>
          <div style={{ fontSize: '11px', color: '#B7791F', fontWeight: 600 }}>
            {item.violationCategories.join(', ').replace(/_/g, ' ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Respondent Retailer',
      render: (item) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#1C2526' }}>{item.vendorName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>{item.vendorAddress}</div>
        </div>
      ),
    },
    {
      header: 'Complainant',
      render: (item) => (
        <div style={{ fontSize: '12px' }}>
          <div>{item.complainantName}</div>
          <div style={{ color: '#6B7A7A', fontSize: '11px' }}>{item.complainantPhone || 'Web submission'}</div>
        </div>
      ),
    },
    {
      header: 'Filing Date',
      accessorKey: 'submittedAt',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.submittedAt}</span>,
    },
    {
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (item) => (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => handleOpenAction(item)}
        >
          Review & Triage
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Consumer Metrology Complaint Inbox"
        description="Legal Metrology grievance triage queue. Review consumer reports, order physical market surveillance inspections, and initiate Section 36 proceedings."
        breadcrumbs={[
          { label: 'Officer Portal', href: '/officer' },
          { label: 'Complaint Inbox' },
        ]}
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
            placeholder="Search complaints by product, retailer, or citizen..."
            width="320px"
          />

          <FilterDropdown
            label="Complaint Status"
            selectedValue={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'SUBMITTED (New)', value: 'SUBMITTED' },
              { label: 'UNDER REVIEW', value: 'UNDER_REVIEW' },
              { label: 'INSPECTION ORDERED', value: 'INSPECTION_ORDERED' },
              { label: 'RESOLVED', value: 'RESOLVED' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> complaints in queue
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={6}
      />

      {/* Review Complaint Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Grievance Dossier: ${selectedComplaint.id}`}
          description={`Complainant: ${selectedComplaint.complainantName} | Target: ${selectedComplaint.vendorName}`}
          maxWidth="600px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedComplaint(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAction}
              >
                Commit Enforcement Action
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#F9FAFA', borderRadius: '6px', border: '1px solid #E4EBEA' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#14857D', marginBottom: '4px' }}>
                Alleged Infraction Details
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
                {selectedComplaint.productName} ({selectedComplaint.brandName})
              </div>
              <div style={{ fontSize: '12px', color: '#1C2526', marginTop: '6px', lineHeight: 1.5 }}>
                {selectedComplaint.description}
              </div>
            </div>

            <FormField label="Enforcement Action Decision" required>
              <select
                className="form-select"
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value as ComplaintStatus)}
              >
                <option value="SUBMITTED">SUBMITTED (Hold in triage)</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Preliminary inquiry assigned)</option>
                <option value="INSPECTION_ORDERED">INSPECTION ORDERED (Dispatch Inspector for retail check)</option>
                <option value="RESOLVED">RESOLVED (Compounded or rectified)</option>
                <option value="DISMISSED">DISMISSED (Lack of statutory ground)</option>
              </select>
            </FormField>

            <FormField label="Officer Statutory Remarks & Legal Order" required>
              <textarea
                className="form-textarea"
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="Enter inquiry directives, notice numbers, or compounding references..."
              />
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}

