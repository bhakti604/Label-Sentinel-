'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Lock,
  Download,
  Calendar,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { AuditLogEntry } from '@/types/portal';

export default function AdminAuditLogsPage() {
  const { auditLogs, showNotification } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Actor Email,Actor Role,Action Type,Target Resource,Details,IP Address,Hash']
        .concat(
          filtered.map(
            (l) =>
              `"${l.timestamp}","${l.actorEmail}","${l.actorRole}","${l.actionType}","${l.targetResource}","${l.details}","${l.ipAddress}","${l.hash}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('success', 'Audit Ledger Exported', 'Cryptographically verified audit trail downloaded.');
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.timestamp}</span>,
    },
    {
      header: 'Actor & Identity',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526', fontSize: '13px' }}>{item.actorEmail}</div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#14857D', textTransform: 'uppercase' }}>
            {item.actorRole}
          </span>
        </div>
      ),
    },
    {
      header: 'Action Event',
      render: (item) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: '#F6F8F8',
            border: '1px solid #E4EBEA',
            color: '#1C2526',
          }}
        >
          {item.actionType.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Target Resource',
      render: (item) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#14857D' }}>
          {item.targetResource}
        </span>
      ),
    },
    {
      header: 'Audit Findings & Narrative',
      render: (item) => (
        <div style={{ fontSize: '12px', color: '#1C2526', maxWidth: '340px', lineHeight: 1.45 }}>
          {item.details}
        </div>
      ),
    },
    {
      header: 'Cryptographic Hash',
      render: (item) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#6B7A7A',
            letterSpacing: '0.04em',
          }}
          title={item.hash}
        >
          {item.hash.substring(0, 12)}...
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Immutable Metrology Audit Ledger"
        description="Tamper-evident audit trail capturing all regulatory events: rule changes, officer review adjudications, inspection logging, and case compounding."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <button type="button" className="btn btn-secondary" onClick={handleExportAudit}>
            <Download size={15} /> Export Audit Ledger
          </button>
        }
      />

      {/* Security Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #1C2526',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Lock size={20} color="#1C2526" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Statutory Integrity Protocol:</strong> Audit log entries are generated chronologically with immutable
          action markers and SHA hashes. Any manual modification or override of automated verdicts is logged with the
          originating officer identity and IP address for judicial admissibility in Section 36 proceedings.
        </div>
      </div>

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
            placeholder="Search audit trail by actor, resource, or text..."
            width="340px"
          />

          <FilterDropdown
            label="Event Type"
            selectedValue={actionFilter}
            onChange={setActionFilter}
            options={[
              { label: 'All Event Types', value: 'ALL' },
              { label: 'RULE MODIFIED', value: 'RULE_MODIFIED' },
              { label: 'VERDICT OVERRIDDEN', value: 'VERDICT_OVERRIDDEN' },
              { label: 'INSPECTION LOGGED', value: 'INSPECTION_LOGGED' },
              { label: 'NOTICE ISSUED', value: 'NOTICE_ISSUED' },
              { label: 'CASE FILED', value: 'CASE_FILED' },
              { label: 'USER INVITED', value: 'USER_INVITED' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> logged audit records
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
      />
    </div>
  );
}

