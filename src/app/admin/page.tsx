'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Scale,
  MapPin,
  FileCheck2,
  Activity,
  ArrowRight,
  Server,
  Lock,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useSentinel } from '@/lib/storage/context';
import { AuditLogEntry } from '@/types/portal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { users, rules, jurisdictions, auditLogs } = useSentinel();

  const activeRulesCount = rules.filter((r) => r.active).length;

  const auditColumns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.timestamp}</span>,
    },
    {
      header: 'Actor / Identity',
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
      header: 'Target Resource & Details',
      render: (item) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1C2526' }}>
            {item.targetResource}
          </div>
          <div style={{ fontSize: '11px', color: '#6B7A7A', marginTop: '2px' }}>
            {item.details}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="National Metrology Directorate Administration"
        description="System administration and regulatory governance console. Manage statutory rule definitions, user role-based access, jurisdiction nodes, and immutable compliance audit trails."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/admin/rules" className="btn btn-primary">
              <Scale size={16} /> Rule Registry
            </Link>
            <Link href="/admin/users" className="btn btn-secondary">
              <Users size={16} /> User Management
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
          title="Active Statutory Rules"
          value={`${activeRulesCount} / ${rules.length}`}
          subtext="Packaged Commodities Rules, 2011"
          icon={Scale}
          accentColor="#14857D"
          onClick={() => router.push('/admin/rules')}
        />
        <SummaryCard
          title="Enrolled Officers & Users"
          value={users.length}
          subtext="State Controllers & Inspectors"
          icon={Users}
          accentColor="#0F5F59"
          onClick={() => router.push('/admin/users')}
        />
        <SummaryCard
          title="Metrology Jurisdictions"
          value={jurisdictions.length}
          subtext="State & District Zones"
          icon={MapPin}
          accentColor="#23845B"
          onClick={() => router.push('/admin/jurisdictions')}
        />
        <SummaryCard
          title="Immutable Audit Records"
          value={auditLogs.length}
          subtext="SHA-256 anchored events"
          icon={ShieldAlert}
          accentColor="#1C2526"
          onClick={() => router.push('/admin/audit-logs')}
        />
      </div>

      {/* Architecture & Governance Health Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Server size={20} color="#14857D" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Deterministic Rule Engine Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>Active Engine Version</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>PCR-2024.1.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>Statutory Standard</span>
              <span style={{ fontWeight: 600 }}>Legal Metrology Act, 2009</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>AI Verdict Isolation</span>
              <span style={{ color: '#23845B', fontWeight: 600 }}>100% Deterministic (Zero AI Verdicts)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7A7A' }}>OCR Review Triage Threshold</span>
              <span style={{ fontWeight: 600 }}>&lt; 72% Confidence</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Lock size={20} color="#0F5F59" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Role-Based Access Control (RBAC)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>Citizen Portal</span>
              <span style={{ fontWeight: 600 }}>Public Consumer Access</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>Officer Portal</span>
              <span style={{ fontWeight: 600 }}>Enforcement & Adjudication</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E4EBEA' }}>
              <span style={{ color: '#6B7A7A' }}>Admin Portal</span>
              <span style={{ fontWeight: 600 }}>National Directorate Controls</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7A7A' }}>Manufacturer Portal</span>
              <span style={{ color: '#8E9C9B', fontStyle: 'italic' }}>Excluded by Specification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Immutable Audit Stream */}
      <div>
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
              Live System & Regulatory Audit Trail
            </h2>
            <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
              Real-time tamper-evident stream of statutory modifications, adjudications, and user events
            </p>
          </div>
          <Link
            href="/admin/audit-logs"
            style={{ fontSize: '13px', fontWeight: 600, color: '#14857D', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Open Full Audit Registry <ArrowRight size={14} />
          </Link>
        </div>

        <DataTable
          data={auditLogs.slice(0, 5)}
          columns={auditColumns}
          keyExtractor={(item) => item.id}
          pageSize={5}
        />
      </div>
    </div>
  );
}

