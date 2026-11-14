'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterDropdown } from '@/components/common/FilterDropdown';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { useSentinel } from '@/lib/storage/context';
import { UserProfile, UserRole } from '@/types/portal';

export default function AdminUsersPage() {
  const { users, addUser, toggleUserStatus } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [jurisdictionName, setJurisdictionName] = useState('Delhi State - Central District');

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.badgeNumber && u.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      role,
      badgeNumber: badgeNumber || `LMO-DEL-${Math.floor(500 + Math.random() * 500)}`,
      jurisdictionName,
      status: 'ACTIVE',
    });

    setIsEnrollModalOpen(false);
    setName('');
    setEmail('');
    setBadgeNumber('');
  };

  const columns: Column<UserProfile>[] = [
    {
      header: 'Officer / User Name',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.name}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>{item.email}</div>
        </div>
      ),
    },
    {
      header: 'System Role',
      render: (item) => {
        let bg = '#E7F3F2';
        let color = '#0F5F59';
        if (item.role === 'ADMIN') {
          bg = '#F6F8F8';
          color = '#1C2526';
        } else if (item.role === 'CONTROLLER') {
          bg = '#FEF7EC';
          color = '#B7791F';
        }

        return (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '3px',
              backgroundColor: bg,
              color,
              border: '1px solid #E4EBEA',
            }}
          >
            {item.role}
          </span>
        );
      },
    },
    {
      header: 'Official Badge / ID',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#14857D' }}>
          {item.badgeNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Assigned Jurisdiction',
      render: (item) => (
        <span style={{ fontSize: '12px', color: '#1C2526' }}>
          {item.jurisdictionName || 'National Access'}
        </span>
      ),
    },
    {
      header: 'Enrollment Date',
      accessorKey: 'createdAt',
      render: (item) => <span style={{ fontSize: '12px' }}>{item.createdAt}</span>,
    },
    {
      header: 'Status',
      render: (item) => (
        <button
          type="button"
          onClick={() => toggleUserStatus(item.id)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
          title="Click to toggle user credential status (Active / Suspended)"
        >
          <StatusBadge status={item.status} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Role-Based Access Control (RBAC)"
        description="Manage identity credentials, state metrology controller appointments, inspector authorizations, and administrative access rights across the platform."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Users & Roles' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsEnrollModalOpen(true)}
          >
            <UserPlus size={15} /> Enroll New Officer
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
            placeholder="Search by name, email, or badge #..."
            width="320px"
          />

          <FilterDropdown
            label="System Role"
            selectedValue={roleFilter}
            onChange={setRoleFilter}
            options={[
              { label: 'All Roles', value: 'ALL' },
              { label: 'CONTROLLER (Senior Authority)', value: 'CONTROLLER' },
              { label: 'OFFICER (Inspector)', value: 'OFFICER' },
              { label: 'ADMIN (Directorate)', value: 'ADMIN' },
              { label: 'CITIZEN', value: 'CITIZEN' },
            ]}
          />
        </div>

        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> active credentials
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={6}
      />

      {/* Enroll Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Legal Metrology Officer"
        description="Grant authorized inspection and adjudication credentials under the Legal Metrology Act."
        maxWidth="520px"
      >
        <form onSubmit={handleEnroll}>
          <FormField label="Full Name with Designation" required>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inspector Rajesh Kumar"
              required
            />
          </FormField>

          <FormField label="Official Government Email" required>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. r.kumar@delhi.gov.in"
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Assigned Role" required>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="OFFICER">OFFICER (Legal Metrology Inspector)</option>
                <option value="CONTROLLER">CONTROLLER (State Authority)</option>
                <option value="ADMIN">ADMIN (National Directorate)</option>
              </select>
            </FormField>

            <FormField label="Official Badge / Warrant Number">
              <input
                type="text"
                className="form-input"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="LMO-DEL-512"
              />
            </FormField>
          </div>

          <FormField label="Assigned Territorial Jurisdiction" required>
            <input
              type="text"
              className="form-input"
              value={jurisdictionName}
              onChange={(e) => setJurisdictionName(e.target.value)}
              placeholder="e.g. Delhi State - Central District"
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={15} /> Enroll Officer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

