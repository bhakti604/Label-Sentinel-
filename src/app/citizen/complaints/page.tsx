'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileWarning,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { FormField } from '@/components/common/FormField';
import { LoadingState } from '@/components/common/LoadingState';
import { useSentinel } from '@/lib/storage/context';
import { CitizenComplaint } from '@/types/portal';
import { CommodityCategory } from '@/types/compliance';

function CitizenComplaintsContent() {
  const searchParams = useSearchParams();
  const { complaints, addComplaint } = useSentinel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [platformType, setPlatformType] = useState<'OFFLINE_STORE' | 'ECOMMERCE_PORTAL'>('OFFLINE_STORE');
  const [category, setCategory] = useState<CommodityCategory>('FOOD_FMCG');
  const [violationCategory, setViolationCategory] = useState('OVERPRICING_BEYOND_MRP');
  const [description, setDescription] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const qBarcode = searchParams.get('barcode');
    const qProduct = searchParams.get('productName');
    if (qBarcode) setBarcode(qBarcode);
    if (qProduct) setProductName(qProduct);
    if (qBarcode || qProduct) setIsModalOpen(true);
  }, [searchParams]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!productName.trim()) errs.productName = 'Product name is required';
    if (!vendorName.trim()) errs.vendorName = 'Vendor / retailer name is required';
    if (!vendorAddress.trim()) errs.vendorAddress = 'Vendor address or marketplace URL is required';
    if (!description.trim() || description.length < 15) {
      errs.description = 'Please provide at least 15 characters describing the infraction';
    }
    if (!complainantName.trim()) errs.complainantName = 'Complainant name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addComplaint({
      productName,
      brandName: brandName || 'Unspecified Brand',
      barcode: barcode || undefined,
      vendorName,
      vendorAddress,
      platformType,
      category,
      violationCategories: [violationCategory],
      description,
      complainantName,
      complainantPhone: complainantPhone || undefined,
    });

    setIsModalOpen(false);
    // Reset form
    setProductName('');
    setBrandName('');
    setBarcode('');
    setVendorName('');
    setVendorAddress('');
    setDescription('');
    setComplainantName('');
    setComplainantPhone('');
    setErrors({});
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
      header: 'Vendor / Retailer',
      render: (item) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#1C2526' }}>{item.vendorName}</div>
          <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
            {item.platformType === 'OFFLINE_STORE' ? 'Physical Store' : 'E-Commerce Platform'}
          </div>
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
      header: 'Officer Remarks',
      render: (item) => (
        <div style={{ fontSize: '12px', color: '#1C2526', maxWidth: '300px' }}>
          {item.officerRemarks || <span style={{ color: '#8E9C9B' }}>Pending initial triage by district officer</span>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Consumer Metrology Grievance Filing"
        description="Lodge formal complaints regarding over-charging above MRP, misleading packaging, non-metric unit declarations, or omitted manufacturer details under Section 36(1)."
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Complaints' },
        ]}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={16} /> File New Complaint
          </button>
        }
      />

      {/* Information Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #14857D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <ShieldCheck size={22} color="#14857D" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
            <strong>Direct Legal Redressal:</strong> Grievances registered here are routed directly to the enforcement
            inbox of the respective Legal Metrology Inspector. Verified offenses trigger on-site market surveillance
            inspections and compounding proceedings.
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <DataTable
        data={complaints}
        columns={columns}
        keyExtractor={(item) => item.id}
        pageSize={6}
        emptyTitle="No complaints filed yet"
        emptySubtitle="You have not submitted any consumer compliance grievances in this session."
      />

      {/* New Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Statutory Metrology Complaint"
        description="Provide package and vendor details to submit an enforcement report to the Legal Metrology Department."
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Product Name" required error={errors.productName}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pure Desi Ghee 1L"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </FormField>

            <FormField label="Brand / Marketer">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. GauKripa Agro"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Barcode (GTIN/EAN) if known">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8902099304918"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </FormField>

            <FormField label="Commodity Category" required>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CommodityCategory)}
              >
                <option value="FOOD_FMCG">Food & FMCG</option>
                <option value="COSMETICS">Cosmetics</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="HOUSEHOLD_CHEMICALS">Household Chemicals</option>
                <option value="GENERAL_MERCHANDISE">General Merchandise</option>
              </select>
            </FormField>
          </div>

          <div style={{ borderTop: '1px solid #E4EBEA', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Vendor / Store Name" required error={errors.vendorName}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SuperMart CP or QuickCart Seller"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </FormField>

              <FormField label="Channel Type" required>
                <select
                  className="form-select"
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value as 'OFFLINE_STORE' | 'ECOMMERCE_PORTAL')}
                >
                  <option value="OFFLINE_STORE">Physical Offline Store</option>
                  <option value="ECOMMERCE_PORTAL">Online E-Commerce Platform</option>
                </select>
              </FormField>
            </div>

            <FormField label="Vendor Physical Address or Listing URL" required error={errors.vendorAddress}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shop 12, Main Market, Lajpat Nagar, New Delhi"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
              />
            </FormField>
          </div>

          <div style={{ borderTop: '1px solid #E4EBEA', paddingTop: '16px', marginTop: '4px' }}>
            <FormField label="Alleged Statutory Infraction Type" required>
              <select
                className="form-select"
                value={violationCategory}
                onChange={(e) => setViolationCategory(e.target.value)}
              >
                <option value="OVERPRICING_BEYOND_MRP">Charging above printed MRP / Dual Price Sticker</option>
                <option value="NON_METRIC_UNIT">Non-standard metric unit (e.g. gms, kgs, ltrs)</option>
                <option value="MISSING_ALL_TAXES_CLAUSE">MRP omits &quot;inclusive of all taxes&quot; clause</option>
                <option value="MISSING_UNIT_SALE_PRICE">Missing Unit Sale Price (USP) on package ≥ 1kg/1L</option>
                <option value="OBSCURED_COUNTRY_OF_ORIGIN">Obscured or missing Country of Origin</option>
                <option value="ILLEGIBLE_FONT_SIZE">Illegible font height / Smudged manufacturing date</option>
              </select>
            </FormField>

            <FormField label="Infraction Description & Facts" required error={errors.description}>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe how the violation occurred (e.g., sticker pasted over MRP, retailer demanded additional cash, or missing label details)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
          </div>

          <div style={{ borderTop: '1px solid #E4EBEA', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Your Full Name" required error={errors.complainantName}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sunita Sharma"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                />
              </FormField>

              <FormField label="Contact Mobile Number (Optional)">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +91 98110 44211"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FileWarning size={15} /> Submit Enforcement Complaint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CitizenComplaintsPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading complaints ledger..." />}>
      <CitizenComplaintsContent />
    </Suspense>
  );
}

