'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Users,
  Briefcase,
  Mail,
  Phone,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { useSentinel } from '@/lib/storage/context';
import { JurisdictionNode } from '@/types/portal';

export default function AdminJurisdictionsPage() {
  const { jurisdictions, addJurisdiction } = useSentinel();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState<JurisdictionNode['level']>('DISTRICT_OFFICE');
  const [controllerName, setControllerName] = useState('');
  const [activeInspectorsCount, setActiveInspectorsCount] = useState(5);
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = jurisdictions.filter((j) => {
    return (
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.controllerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !state.trim()) return;

    addJurisdiction({
      code: code.toUpperCase(),
      name,
      state,
      level,
      controllerName: controllerName || 'Designated Assistant Controller',
      activeInspectorsCount: Number(activeInspectorsCount) || 1,
      activeCasesCount: 0,
      contactEmail: contactEmail || `controller.${code.toLowerCase()}@nic.in`,
      phone: phone || '+91 11 2338 0000',
    });

    setIsCreateOpen(false);
    setName('');
    setCode('');
    setState('');
    setControllerName('');
    setContactEmail('');
    setPhone('');
  };

  const columns: Column<JurisdictionNode>[] = [
    {
      header: 'Jurisdiction Code',
      accessorKey: 'code',
      render: (item) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#14857D' }}>
          {item.code}
        </span>
      ),
    },
    {
      header: 'Jurisdiction Office Name',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.name}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>State: {item.state}</div>
        </div>
      ),
    },
    {
      header: 'Administrative Level',
      render: (item) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: item.level === 'STATE_HEADQUARTERS' ? '#E7F3F2' : '#F6F8F8',
            color: item.level === 'STATE_HEADQUARTERS' ? '#0F5F59' : '#1C2526',
            border: '1px solid #E4EBEA',
          }}
        >
          {item.level.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Controller / Authority',
      render: (item) => (
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#1C2526' }}>
          {item.controllerName}
        </div>
      ),
    },
    {
      header: 'Active Deployment',
      render: (item) => (
        <div style={{ fontSize: '12px' }}>
          <div><strong>{item.activeInspectorsCount}</strong> Inspectors</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>{item.activeCasesCount} Active Dockets</div>
        </div>
      ),
    },
    {
      header: 'Statutory Contact',
      render: (item) => (
        <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
          <div>{item.contactEmail}</div>
          <div>{item.phone}</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Territorial Legal Metrology Jurisdictions"
        description="Statutory territorial jurisdiction boundaries, state headquarters, and district enforcement zone hierarchy under the Legal Metrology Act, 2009."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Jurisdictions' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusCircle size={15} /> Add Jurisdiction Office
          </button>
        }
      />

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
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by state, district, code, or controller..."
          width="340px"
        />
        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> jurisdiction offices registered
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
      />

      {/* Add Jurisdiction Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Territorial Metrology Jurisdiction"
        description="Configure enforcement boundary and authority under Section 14 of the Legal Metrology Act."
        maxWidth="540px"
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <FormField label="Jurisdiction Code" required>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="DL-NORTH"
                required
              />
            </FormField>

            <FormField label="Office Name" required>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Delhi North District Office"
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="State / Union Territory" required>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Delhi (NCT)"
                required
              />
            </FormField>

            <FormField label="Administrative Hierarchy" required>
              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as JurisdictionNode['level'])}
              >
                <option value="DISTRICT_OFFICE">DISTRICT_OFFICE</option>
                <option value="STATE_HEADQUARTERS">STATE_HEADQUARTERS</option>
                <option value="ZONAL_ENFORCEMENT_UNIT">ZONAL_ENFORCEMENT_UNIT</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <FormField label="Presiding Controller / Assistant Controller" required>
              <input
                type="text"
                className="form-input"
                value={controllerName}
                onChange={(e) => setControllerName(e.target.value)}
                placeholder="e.g. Assistant Controller S. K. Joshi"
                required
              />
            </FormField>

            <FormField label="Active Inspectors">
              <input
                type="number"
                className="form-input"
                value={activeInspectorsCount}
                onChange={(e) => setActiveInspectorsCount(Number(e.target.value))}
                min={1}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Official Contact Email">
              <input
                type="email"
                className="form-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="controller.north@nic.in"
              />
            </FormField>

            <FormField label="Helpline / Contact Phone">
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 11 2338 0000"
              />
            </FormField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={15} /> Enroll Jurisdiction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
