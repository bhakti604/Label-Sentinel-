'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScanLine,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Info,
  RefreshCw,
  Sparkles,
  Lock,
  Trash2,
  Edit3,
  Layers,
  FileText,
  Barcode,
  Eye,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FormField } from '@/components/common/FormField';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LiveCameraScanner } from '@/components/scanner/LiveCameraScanner';
import { useSentinel } from '@/lib/storage/context';
import { evaluatePackageCompliance } from '@/lib/rule-engine/evaluator';
import { runClientOcr, OcrProgressUpdate } from '@/lib/ocr/engine';
import { CandidateDeclaration, CommodityCategory, ComplianceDossier } from '@/types/compliance';

export interface CapturedPanelImage {
  id: string;
  panel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL';
  dataUrl: string;
  capturedAt: string;
}

// Sample scenarios for testing without camera
const SAMPLE_PACKAGING_SCENARIOS = [
  {
    name: 'Sample 1: Compliant FMCG Pack (Organic Honey 500g)',
    brand: 'Himalayan Nectar Ltd.',
    category: 'FOOD_FMCG' as CommodityCategory,
    barcode: '8901050228192',
    rawText: 'Himalayan Nectar Foods Ltd, Plot 9, Dehradun 248001\nPure Multi-Floral Honey\nNet Qty: 500 g\nPkd Date: 09/2026\nMRP Rs. 320.00 (inclusive of all taxes)\nConsumer Helpline: 1800-111-9922 | customercare@himalayan.in\nCountry of Origin: India',
    confidence: 0.96,
  },
  {
    name: 'Sample 2: Infraction Case (Non-Metric "MLTRS" & No Tax Clause)',
    brand: 'VigorFuel Beverage Co.',
    category: 'FOOD_FMCG' as CommodityCategory,
    barcode: '8908821903412',
    rawText: 'Packed by: VigorFuel Bottling, Okhla Phase 3, Delhi 110020\nCaffeinated Energy Beverage\nNet Vol: 250 MLTRS\nMfg: 10/2026\nMRP Rs. 110.00\nFeedback: support@vigorfuel.com\nMade in India',
    confidence: 0.94,
  },
  {
    name: 'Sample 3: Low OCR Clarity (Smudged Date & Font < 1.0mm)',
    brand: 'Chronos Digital Tech',
    category: 'ELECTRONICS' as CommodityCategory,
    barcode: '8907712398401',
    rawText: 'Imp by: Chronos India Tech, Whitefield, Bengaluru 560066\nSmart Fitness Wristwatch\nNet Qty: 1 Unit\nImp: ??/2026\nMRP Rs. 3,999.00 (inclusive of all taxes)\ncare@chronos.in | Tel: [Illegible font < 1.0mm]\nMade in Vietnam',
    confidence: 0.62,
  },
];

export default function CitizenProductScanPage() {
  const router = useRouter();
  const { addScan, rules } = useSentinel();

  // Workflow steps: 1 = Barcode, 2 = Capture Panels, 3 = OCR & Declarations Review, 4 = Review & Evaluate
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Barcode & Product Metadata
  const [barcode, setBarcode] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState('EAN_13');
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState<CommodityCategory>('FOOD_FMCG');

  // Step 2: Captured Package Panel Imagery
  const [activePanelToCapture, setActivePanelToCapture] = useState<'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL'>('FRONT');
  const [capturedImages, setCapturedImages] = useState<CapturedPanelImage[]>([]);

  // Step 3: Real OCR State & Extracted Declarations
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgressUpdate | null>(null);
  const [rawOcrText, setRawOcrText] = useState('');
  const [rawOcrConfidence, setRawOcrConfidence] = useState(0.85);
  const [ocrLanguage, setOcrLanguage] = useState<'eng' | 'mar'>('eng');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [declarations, setDeclarations] = useState<CandidateDeclaration[]>([]);

  // Step 4: Deterministic Evaluation in Progress
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Handle barcode detected from live camera
  const handleBarcodeDetected = (detectedBarcode: string, format: string) => {
    setBarcode(detectedBarcode);
    setBarcodeFormat(format);
  };

  // Handle panel image captured from live camera
  const handleImageCaptured = (dataUrl: string, panel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL') => {
    const newImage: CapturedPanelImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      panel,
      dataUrl,
      capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setCapturedImages((prev) => [...prev, newImage]);

    // Automatically cycle to the next logical panel
    if (panel === 'FRONT') setActivePanelToCapture('BACK');
    else if (panel === 'BACK') setActivePanelToCapture('SIDE');
    else if (panel === 'SIDE') setActivePanelToCapture('ADDITIONAL');
  };

  // Handle local file upload fallback for panels
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, panel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleImageCaptured(reader.result, panel);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove a captured image
  const removeCapturedImage = (id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Run Real OCR using Tesseract.js on captured images
  const handleRunRealOcr = async () => {
    if (capturedImages.length === 0) {
      setOcrError('Please capture or upload at least one package panel image before executing OCR.');
      return;
    }

    setIsOcrProcessing(true);
    setOcrError(null);
    setOcrProgress({ status: 'Starting Tesseract OCR engine...', progress: 5 });

    try {
      // Run OCR on the most relevant captured image (prioritize BACK / SIDE / FRONT)
      const primaryImage =
        capturedImages.find((img) => img.panel === 'BACK') ||
        capturedImages.find((img) => img.panel === 'SIDE') ||
        capturedImages[0];

      const ocrResult = await runClientOcr(
        primaryImage.dataUrl,
        primaryImage.panel,
        (update) => {
          setOcrProgress(update);
        },
        ocrLanguage
      );

      setRawOcrText(ocrResult.text);
      setRawOcrConfidence(ocrResult.confidence);
      setDeclarations(ocrResult.parsed.declarations);

      // If product name or brand is not yet filled, infer from generic name if available
      if (!productName && ocrResult.parsed.declarations[1]?.extractedRawText) {
        setProductName(ocrResult.parsed.declarations[1].extractedRawText);
      }

      setCurrentStep(3); // Proceed to Declaration Review
    } catch (err: unknown) {
      const error = err as Error;
      setOcrError(error.message || 'OCR processing failed.');
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(null);
    }
  };

  // Load a pre-defined sample packaging scenario for testing without live camera
  const handleLoadSampleScenario = async (scenario: typeof SAMPLE_PACKAGING_SCENARIOS[0]) => {
    setProductName(scenario.name.split(':')[1]?.trim() || scenario.name);
    setBrandName(scenario.brand);
    setBarcode(scenario.barcode);
    setCategory(scenario.category);

    setIsOcrProcessing(true);
    setOcrProgress({ status: 'Parsing sample packaging declarations...', progress: 40 });

    try {
      // Synthesize image representation and run parser
      const { parseOcrDeclarations } = await import('@/lib/ocr/parser');
      const parsed = parseOcrDeclarations(scenario.rawText, scenario.confidence, 'FRONT');

      setRawOcrText(scenario.rawText);
      setRawOcrConfidence(scenario.confidence);
      setDeclarations(parsed.declarations);

      // Add dummy canvas dataUrl as image evidence
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#E7F3F2';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#0F5F59';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(scenario.name, 40, 100);
        ctx.font = '14px sans-serif';
        ctx.fillText(`Barcode: ${scenario.barcode}`, 40, 140);
        ctx.fillText(`Brand: ${scenario.brand}`, 40, 170);
      }
      const dataUrl = canvas.toDataURL('image/jpeg');

      setCapturedImages([
        {
          id: `sample-img-${Date.now()}`,
          panel: 'FRONT',
          dataUrl,
          capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setCurrentStep(3); // Proceed to Declaration Review
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(null);
    }
  };

  // Update declaration value manually with explicit tracking
  const handleDeclarationChange = (index: number, newText: string) => {
    setDeclarations((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        extractedRawText: newText.trim() ? newText : null,
        normalizedValue: newText.trim() ? newText : null,
        isManuallyEdited: true,
      };
      return updated;
    });
  };

  // Run Deterministic Compliance Evaluation & Save Dossier
  const handleExecuteDeterministicEvaluation = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      const evaluationResult = evaluatePackageCompliance(
        {
          barcode: barcode || 'GTIN-MANUAL',
          productName: productName || 'Packaged Commodity',
          brandName: brandName || 'Unspecified Brand',
          category,
          declarations,
          isImported: declarations.some((d) => d.ruleId === 'rule-pcr-6-10' && Boolean(d.extractedRawText)),
          isMultiUnitOrBulk: false,
        },
        rules
      );

      const newDossierId = `DOS-2026-${Math.floor(8810 + Math.random() * 1000)}`;
      const newDossier: ComplianceDossier = {
        id: newDossierId,
        barcode: barcode || 'GTIN-UNSPECIFIED',
        productName: productName || 'Packaged Commodity',
        brandName: brandName || 'Unspecified Brand',
        category,
        scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        scannedBy: 'Citizen Access (Verified Scan)',
        jurisdiction: 'Delhi State - Central District',
        imageUrl: capturedImages[0]?.dataUrl || '/placeholder-scan.jpg',
        overallStatus: evaluationResult.overallStatus,
        declarationsCount: evaluationResult.summary,
        evaluations: evaluationResult.evaluations,
      };

      addScan(newDossier);
      setIsEvaluating(false);
      router.push(`/citizen/results/${newDossierId}`);
    }, 500);
  };

  return (
    <div>
      <PageHeader
        title="Live Product Label Scanning & Verification"
        description="Verify pre-packaged commodity labels with live device camera, automated barcode detection, real on-device OCR, and deterministic Legal Metrology evaluation under PCR 2011."
        breadcrumbs={[
          { label: 'Citizen Portal', href: '/citizen' },
          { label: 'Product Scan' },
        ]}
      />

      {/* Progress Step Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep >= 1 ? '#14857D' : '#F6F8F8',
                color: currentStep >= 1 ? '#FFFFFF' : '#6B7A7A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              1
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 1 ? 700 : 500, color: currentStep === 1 ? '#1C2526' : '#6B7A7A' }}>
              Barcode & Product Info
            </span>
          </div>

          <div style={{ width: '32px', height: '1px', backgroundColor: '#E4EBEA' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep >= 2 ? '#14857D' : '#F6F8F8',
                color: currentStep >= 2 ? '#FFFFFF' : '#6B7A7A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              2
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 2 ? 700 : 500, color: currentStep === 2 ? '#1C2526' : '#6B7A7A' }}>
              Capture Package Panels
            </span>
          </div>

          <div style={{ width: '32px', height: '1px', backgroundColor: '#E4EBEA' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep >= 3 ? '#14857D' : '#F6F8F8',
                color: currentStep >= 3 ? '#FFFFFF' : '#6B7A7A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              3
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 3 ? 700 : 500, color: currentStep === 3 ? '#1C2526' : '#6B7A7A' }}>
              Declaration Review & Compliance Dossier
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: '#E7F3F2',
          border: '1px solid #BDE0DC',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#0F5F59',
        }}
      >
        <Lock size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Privacy & Security Verified:</strong> Live camera video and package snapshots are processed 100% locally
          on your device using browser WebAssembly. Imagery is never uploaded to remote servers.
        </span>
      </div>

      {/* STEP 1: BARCODE & PRODUCT DETAILS */}
      {currentStep === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left: Live Camera Viewfinder for Barcode Detection */}
          <div>
            <LiveCameraScanner
              onBarcodeDetected={handleBarcodeDetected}
              mode="BARCODE_ONLY"
            />

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#6B7A7A', textAlign: 'center' }}>
              Hold product barcode in front of camera. Scanning occurs automatically.
            </div>
          </div>

          {/* Right: Detected Barcode & Metadata Form */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Product Identification</h3>
            </div>

            <div className="card-body">
              <FormField label="Extracted / Entered Barcode (GTIN/EAN)" required>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8901030912345"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                  {barcode && (
                    <span
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#EAF5F0',
                        color: '#23845B',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Check size={12} /> {barcodeFormat}
                    </span>
                  )}
                </div>
              </FormField>

              <FormField label="Product Name" required helperText="Brand & commodity name (e.g. Digestive Wheat Biscuits 1kg)">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NutriChoice Digestive Biscuits"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField label="Brand / Marketer" required>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Britannia NutriChoice"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </FormField>

                <FormField label="Commodity Category" required>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommodityCategory)}
                  >
                    <option value="FOOD_FMCG">Food & FMCG</option>
                    <option value="COSMETICS">Cosmetics & Toiletries</option>
                    <option value="ELECTRONICS">Electronics & Hardware</option>
                    <option value="PHARMACEUTICAL_OTC">OTC Pharmaceuticals</option>
                    <option value="HOUSEHOLD_CHEMICALS">Household Chemicals</option>
                    <option value="GENERAL_MERCHANDISE">General Merchandise</option>
                  </select>
                </FormField>
              </div>

              {/* Sample packaging scenario alternatives */}
              <div style={{ borderTop: '1px solid #E4EBEA', paddingTop: '16px', marginTop: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#6B7A7A', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Or Load Sample Packaging Scenario:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SAMPLE_PACKAGING_SCENARIOS.map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSampleScenario(sc)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E4EBEA',
                        backgroundColor: '#F9FAFA',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#1C2526',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{sc.name}</span>
                      <ArrowRight size={13} color="#14857D" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(2)}
                disabled={!barcode && !productName}
              >
                Next: Capture Package Panels <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CAPTURE PACKAGE PANELS */}
      {currentStep === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left: Live Camera Viewfinder for Capturing Panels */}
          <div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
                Select Panel to Capture:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['FRONT', 'BACK', 'SIDE', 'ADDITIONAL'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePanelToCapture(p)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: activePanelToCapture === p ? '1.5px solid #14857D' : '1px solid #E4EBEA',
                      backgroundColor: activePanelToCapture === p ? '#E7F3F2' : '#FFFFFF',
                      color: activePanelToCapture === p ? '#0F5F59' : '#1C2526',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <LiveCameraScanner
              onImageCaptured={handleImageCaptured}
              activePanel={activePanelToCapture}
              mode="CAPTURE_ONLY"
            />

            {/* File Upload Alternative for this panel */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E4EBEA' }}>
              <div style={{ fontSize: '12px', color: '#6B7A7A' }}>
                Have an existing photo of {activePanelToCapture} panel?
              </div>
              <label
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                <Upload size={13} /> Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, activePanelToCapture)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Right: Captured Image Thumbnails & Evidence Strip */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Captured Packaging Evidence</h3>
                <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                  {capturedImages.length} panel photos ready for OCR extraction
                </p>
              </div>
            </div>

            <div className="card-body">
              {capturedImages.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#F9FAFA',
                    borderRadius: '6px',
                    border: '1px dashed #CDD8D6',
                  }}
                >
                  <Camera size={28} color="#8E9C9B" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
                    No Panel Photos Captured Yet
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '4px' }}>
                    Use the live camera capture button or upload images of your packaging panels.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  {capturedImages.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #E4EBEA',
                        backgroundColor: '#F9FAFA',
                      }}
                    >
                      <img
                        src={img.dataUrl}
                        alt={`${img.panel} panel`}
                        style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        style={{
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <span style={{ color: '#14857D' }}>{img.panel}</span>
                        <button
                          type="button"
                          onClick={() => removeCapturedImage(img.id)}
                          style={{ color: '#C44747', padding: '2px', cursor: 'pointer' }}
                          title="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OCR Progress or Error Banner */}
              {isOcrProcessing && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: '6px',
                    backgroundColor: '#E7F3F2',
                    border: '1px solid #BDE0DC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F5F59' }}>
                      {ocrProgress?.status || 'Analyzing packaging text...'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#14857D' }}>
                      {ocrProgress?.progress || 0}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#FFFFFF', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${ocrProgress?.progress || 0}%`,
                        backgroundColor: '#14857D',
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {ocrError && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: '#FDF1F1',
                    border: '1px solid #F8C7C7',
                    color: '#C44747',
                    fontSize: '12px',
                  }}
                >
                  {ocrError}
                </div>
              )}
            </div>

            <div className="card-footer" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="ocr-language-select" style={{ fontSize: '12px', color: '#6B7A7A', fontWeight: 500 }}>
                    OCR Language:
                  </label>
                  <select
                    id="ocr-language-select"
                    className="form-select"
                    value={ocrLanguage}
                    onChange={(e) => setOcrLanguage(e.target.value as 'eng' | 'mar')}
                    style={{ padding: '5px 10px', fontSize: '12px', width: 'auto' }}
                  >
                    <option value="eng">English (eng)</option>
                    <option value="mar">Marathi (mar)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRunRealOcr}
                  disabled={capturedImages.length === 0 || isOcrProcessing}
                >
                  {isOcrProcessing ? (
                    <>
                      <RefreshCw size={14} className="spin" /> Running Tesseract OCR...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Execute OCR Text Extraction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DECLARATION REVIEW & COMPLIANCE DOSSIER EXECUTION */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Banner: Real OCR Evidence Summary */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderLeft: '4px solid #14857D',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#14857D" />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1C2526' }}>
                  OCR Extraction Completed (Mean Confidence: {Math.round(rawOcrConfidence * 100)}%)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7A7A', marginTop: '2px' }}>
                Review and verify candidate declarations below. You may edit or provide missing packaging text before
                running the deterministic Legal Metrology rule engine.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(2)}
              >
                <Camera size={13} /> Capture Additional Panel
              </button>
            </div>
          </div>

          {/* Declarations Review Grid */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Candidate Packaging Declarations</h3>
                <p style={{ fontSize: '12px', color: '#6B7A7A' }}>
                  Statutory fields defined under Rule 6 of The Legal Metrology (Packaged Commodities) Rules, 2011
                </p>
              </div>
              <span className="badge badge-neutral">
                {declarations.filter((d) => d.extractedRawText !== null).length} / {declarations.length} Detected
              </span>
            </div>

            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {declarations.map((dec, idx) => (
                  <div
                    key={dec.ruleId}
                    style={{
                      padding: '16px 20px',
                      borderBottom: idx === declarations.length - 1 ? 'none' : '1px solid #E4EBEA',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#14857D' }}>
                          {dec.ruleReference}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
                          {dec.label}
                        </span>
                        {dec.isMandatory && (
                          <span style={{ fontSize: '10px', color: '#C44747', fontWeight: 600 }}>
                            (MANDATORY)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {dec.isManuallyEdited ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              backgroundColor: '#FEF7EC',
                              color: '#B7791F',
                              border: '1px solid #F7DDB6',
                            }}
                          >
                            Manually Corrected
                          </span>
                        ) : dec.extractedRawText ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              backgroundColor: dec.ocrConfidence >= 0.72 ? '#EAF5F0' : '#FEF7EC',
                              color: dec.ocrConfidence >= 0.72 ? '#23845B' : '#B7791F',
                              border: `1px solid ${dec.ocrConfidence >= 0.72 ? '#B7E1CD' : '#F7DDB6'}`,
                            }}
                          >
                            Extracted: OCR {Math.round(dec.ocrConfidence * 100)}%
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              backgroundColor: '#F6F8F8',
                              color: '#6B7A7A',
                              border: '1px solid #E4EBEA',
                            }}
                          >
                            Not Detected on Label
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={dec.extractedRawText || ''}
                        onChange={(e) => handleDeclarationChange(idx, e.target.value)}
                        placeholder={`Enter or correct ${dec.label.toLowerCase()} declaration...`}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          backgroundColor: dec.isManuallyEdited ? '#FFFFFF' : '#F9FAFA',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="card-footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={14} /> Back to Panel Photos
              </button>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleExecuteDeterministicEvaluation}
                disabled={isEvaluating}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Executing Deterministic Rule Engine...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={16} /> Execute Statutory Compliance Evaluation <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
