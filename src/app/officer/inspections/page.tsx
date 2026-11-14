'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  PlusCircle,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
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
import { EnforcementInspection, InspectionStatus } from '@/types/portal';

export default function OfficerInspectionsPage() {
  const { inspections, addInspection, updateInspectionStatus } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeInspectionForStatus, setActiveInspectionForStatus] = useState<EnforcementInspection | null>(null);

  // Form states
  const [retailerName, setRetailerName] = useState('');
  const [retailerGSTIN, setRetailerGSTIN] = useState('');
  const [address, setAddress] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Delhi State - Central District');
  const [scheduledDate, setScheduledDate] = useState('2026-11-05 11:00');
  const [notes, setNotes] = useState('');

  // Status modal state
  const [newStatus, setNewStatus] = useState<InspectionStatus>('COMPLETED');
  const [statusNotes, setStatusNotes] = useState('');

  const filtered = inspections.filter((i) => {
    const matchesSearch =
      i.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.retailerGSTIN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.inspectionCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerName.trim()) return;

    addInspection({
      inspectionCode: `DEL-INSP-${Date.now().toString().slice(-4)}`,
      retailerName,
      retailerGSTIN: retailerGSTIN || '07AAAAA0000A1Z5',
      address,
      jurisdiction,
      officerInCharge: 'Inspector Vikram Anand',
      scheduledDate,
      status: 'SCHEDULED',
      packagesSampled: 25,
      infractionsFound: 0,
      noticeIssued: false,
      notes,
    });

    setIsCreateOpen(false);
    setRetailerName('');
    setRetailerGSTIN('');
    setAddress('');
    setNotes('');
  };

  const handleUpdateStatus = () => {
    if (!activeInspectionForStatus) return;
    updateInspectionStatus(activeInspectionForStatus.id, newStatus, statusNotes);
    setActiveInspectionForStatus(null);
  };

  const columns: Column<EnforcementInspection>[] = [
    {
      header: 'Inspection Code',
      accessorKey: 'inspectionCode',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14857D' }}>
          {item.inspectionCode}
        </span>
      ),
    },
    {
      header: 'Retailer / Premises',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.retailerName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
            GSTIN: {item.retailerGSTIN} • {item.jurisdiction}
          </div>
        </div>
      ),
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.scheduledDate}</span>,
    },
    {
      header: 'Packages Sampled / Infractions',
      render: (item) => (
        <div style={{ fontSize: '12px' }}>
          <span style={{ fontWeight: 600 }}>{item.packagesSampled} sampled</span>
          {item.infractionsFound > 0 ? (
            <span style={{ color: '#C44747', fontWeight: 600, marginLeft: '6px' }}>
              ({item.infractionsFound} infractions)
            </span>
          ) : (
            <span style={{ color: '#23845B', marginLeft: '6px' }}>(0 infractions)</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
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
            setActiveInspectionForStatus(item);
            setNewStatus(item.status);
            setStatusNotes(item.notes);
          }}
        >
          Update Status
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Market Surveillance Inspections"
        description="Schedule and execute field surveillance visits under Section 15 of The Legal Metrology Act, 2009 for verification of packaged commodity declarations."
        breadcrumbs={[
          { label: 'Officer Portal', href: '/officer' },
          { label: 'Inspections' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircle size={15} /> Schedule New Inspection
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
            placeholder="Search by retailer, code, or GSTIN..."
            width="320px"
          />

          <FilterDropdown
            label="Inspection Status"
            selectedValue={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'SCHEDULED', value: 'SCHEDULED' },
              { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
              { label: 'COMPLETED', value: 'COMPLETED' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> inspections recorded
        </span>
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={6}
      />

      {/* Schedule Inspection Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Market Surveillance Inspection"
        description="Issue official inspection order under Section 15 powers of the Legal Metrology Act."
        maxWidth="560px"
      >
        <form onSubmit={handleCreate}>
          <FormField label="Retailer / Establishment Name" required>
            <input
              type="text"
              className="form-input"
              value={retailerName}
              onChange={(e) => setRetailerName(e.target.value)}
              placeholder="e.g. Metro SuperMart Ltd, Connaught Place"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="GSTIN / Commercial Reg Number">
              <input
                type="text"
                className="form-input"
                value={retailerGSTIN}
                onChange={(e) => setRetailerGSTIN(e.target.value)}
                placeholder="07AAACS1429B1Z8"
              />
            </FormField>

            <FormField label="Inspection Date & Time" required>
              <input
                type="text"
                className="form-input"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Premises Physical Address" required>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full shop / warehouse address"
              required
            />
          </FormField>

          <FormField label="Enforcement Directives / Trigger Notes">
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Triggered by citizen grievance or periodic routine compliance drive..."
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
              <ClipboardList size={15} /> Issue Inspection Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      {activeInspectionForStatus && (
        <Modal
          isOpen={true}
          onClose={() => setActiveInspectionForStatus(null)}
          title={`Update Inspection: ${activeInspectionForStatus.inspectionCode}`}
          description={`Premises: ${activeInspectionForStatus.retailerName}`}
          maxWidth="480px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveInspectionForStatus(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
              >
                Save Inspection Record
              </button>
            </>
          }
        >
          <FormField label="Inspection Status" required>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as InspectionStatus)}
            >
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </FormField>

          <FormField label="Field Officer Findings & Notes">
            <textarea
              className="form-textarea"
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </FormField>
        </Modal>
      )}
    </div>
  );
}

