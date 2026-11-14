'use client';

import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  Edit3,
  PlusCircle,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { useSentinel } from '@/lib/storage/context';
import { StatutoryRuleDefinition } from '@/types/compliance';

export default function AdminRuleRegistryPage() {
  const { rules, toggleRuleActive, updateRule } = useSentinel();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingRule, setEditingRule] = useState<StatutoryRuleDefinition | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minFontHeightMm, setMinFontHeightMm] = useState(2.0);
  const [validationRegex, setValidationRegex] = useState('');

  const filtered = rules.filter((r) => {
    return (
      r.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ruleCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenEdit = (rule: StatutoryRuleDefinition) => {
    setEditingRule(rule);
    setTitle(rule.title);
    setDescription(rule.description);
    setMinFontHeightMm(rule.minFontHeightMm || 2.0);
    setValidationRegex(rule.validationRegex || '');
  };

  const handleSaveEdit = () => {
    if (!editingRule) return;
    updateRule({
      ...editingRule,
      title,
      description,
      minFontHeightMm: Number(minFontHeightMm),
      validationRegex,
      lastAmendedDate: new Date().toISOString().substring(0, 10),
    });
    setEditingRule(null);
  };

  const columns: Column<StatutoryRuleDefinition>[] = [
    {
      header: 'Statutory Section',
      accessorKey: 'section',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: '#14857D', fontSize: '13px' }}>{item.section}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6B7A7A' }}>
            {item.ruleCode}
          </div>
        </div>
      ),
    },
    {
      header: 'Declaration Title & Statutory Scope',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C2526' }}>{item.title}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A', marginTop: '2px', maxWidth: '420px', lineHeight: 1.4 }}>
            {item.description}
          </div>
        </div>
      ),
    },
    {
      header: 'Min Font Height',
      render: (item) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C2526' }}>
          {item.minFontHeightMm ? `${item.minFontHeightMm} mm` : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Engine Version',
      render: (item) => (
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#6B7A7A' }}>
          <div>v{item.version}</div>
          <div>Amended: {item.lastAmendedDate}</div>
        </div>
      ),
    },
    {
      header: 'Status in Engine',
      render: (item) => (
        <button
          type="button"
          onClick={() => toggleRuleActive(item.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: item.active ? '#EAF5F0' : '#FDF1F1',
            color: item.active ? '#23845B' : '#C44747',
            border: `1px solid ${item.active ? '#B7E1CD' : '#F8C7C7'}`,
          }}
          title="Click to toggle rule activation in deterministic engine"
        >
          {item.active ? (
            <>
              <CheckCircle2 size={12} /> Active
            </>
          ) : (
            <>
              <XCircle size={12} /> Inactive
            </>
          )}
        </button>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleOpenEdit(item)}
        >
          <Edit3 size={13} /> Edit Spec
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Statutory Metrology Rule Registry"
        description="Version-controlled deterministic rule specifications under The Legal Metrology (Packaged Commodities) Rules, 2011. Configures validation patterns, SI metric units, and minimum font heights."
        breadcrumbs={[
          { label: 'Admin Portal', href: '/admin' },
          { label: 'Rule Registry' },
        ]}
      />

      {/* Governance Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #14857D',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <ShieldCheck size={20} color="#14857D" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Deterministic Rule Engine Integrity:</strong> Every rule in this registry maps to statutory clauses
          amended by the Ministry of Consumer Affairs, Food and Public Distribution. Unlike black-box neural networks,
          rule modifications here directly govern deterministic logic across Citizen scans and Officer dockets with full
          traceability.
        </div>
      </div>

      {/* Search and Table */}
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
          placeholder="Search rule registry by section, title, or code..."
          width="340px"
        />
        <span style={{ fontSize: '12px', color: '#6B7A7A' }}>
          <strong>{filtered.length}</strong> statutory rules configured
        </span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={8}
      />

      {/* Edit Rule Specification Modal */}
      {editingRule && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRule(null)}
          title={`Edit Specification: ${editingRule.section}`}
          description={`Act: ${editingRule.actReference}`}
          maxWidth="580px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingRule(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                Save Statutory Rule
              </button>
            </>
          }
        >
          <FormField label="Rule Title" required>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Statutory Rule Description" required>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Minimum Font Height (mm)" required>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={minFontHeightMm}
                onChange={(e) => setMinFontHeightMm(Number(e.target.value))}
                required
              />
            </FormField>

            <FormField label="Validation Regex Pattern">
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                value={validationRegex}
                onChange={(e) => setValidationRegex(e.target.value)}
              />
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  );
}

