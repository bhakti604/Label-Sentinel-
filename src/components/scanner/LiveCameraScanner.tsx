'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Flashlight,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface LiveCameraScannerProps {
  onBarcodeDetected?: (barcode: string, format: string) => void;
  onImageCaptured?: (dataUrl: string, panelLabel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL') => void;
  activePanel?: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL';
  mode?: 'BARCODE_AND_CAPTURE' | 'CAPTURE_ONLY' | 'BARCODE_ONLY';
}

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({
  onBarcodeDetected,
  onImageCaptured,
  activePanel = 'FRONT',
  mode = 'BARCODE_AND_CAPTURE',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [scannedFormat, setScannedFormat] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Audio feedback helper (synthesized Web Audio API beep)
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy might prevent beep; ignore gracefully
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch {
        // Ignored
      }
      zxingControlsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignored
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setTorchOn(false);
  }, []);

  // Enumerate cameras
  const enumerateVideoDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch {
      // Ignored
    }
  };

  // Start the camera using getUserMedia
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser or device. Please upload an image file instead.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      await enumerateVideoDevices();

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities ? (track.getCapabilities() as { torch?: boolean }) : {};
        setHasTorch(Boolean(capabilities && capabilities.torch));
      }

      // If barcode mode enabled, start ZXing scanning
      if (mode !== 'CAPTURE_ONLY' && videoRef.current) {
        startZxingBarcodeDetection(videoRef.current);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar to scan product labels.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on this system. You can manually enter details or upload package pictures.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application. Please close other camera apps and retry.');
      } else {
        setCameraError(`Unable to start camera: ${error.message || 'Unknown error'}`);
      }
      setIsCameraActive(false);
    }
  };

  // Start ZXing real barcode scanning from video stream
  const startZxingBarcodeDetection = async (videoElement: HTMLVideoElement) => {
    try {
      if (!zxingReaderRef.current) {
        zxingReaderRef.current = new BrowserMultiFormatReader();
      }

      const reader = zxingReaderRef.current;
      const controls = await reader.decodeFromVideoElement(videoElement, (result, error) => {
        if (result) {
          const text = result.getText();
          const format = result.getBarcodeFormat().toString();

          setScannedBarcode(text);
          setScannedFormat(format);
          playBeep();

          if (onBarcodeDetected) {
            onBarcodeDetected(text, format);
          }

          // Pause continuous scan once detected to avoid duplicate firing
          if (zxingControlsRef.current) {
            try {
              zxingControlsRef.current.stop();
            } catch {
              // Ignored
            }
          }
        }
      });

      zxingControlsRef.current = controls;
    } catch {
      // Reader initialization error; camera continues for capture
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as MediaTrackConstraintSet],
        });
        setTorchOn(nextState);
      } catch {
        // Torch not supported on this platform
      }
    }
  };

  // Switch between front and rear cameras
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setSelectedCameraId('');
    setTimeout(() => {
      startCamera();
    }, 150);
  };

  // Capture image frame at full native resolution
  const captureFrame = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        if (onImageCaptured) {
          onImageCaptured(dataUrl, activePanel);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4EBEA',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(28, 37, 38, 0.05)',
      }}
    >
      {/* Viewfinder Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#F9FAFA',
          borderBottom: '1px solid #E4EBEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isCameraActive ? '#23845B' : '#8E9C9B',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C2526' }}>
            {isCameraActive ? 'Live Camera Active' : 'Live Camera Viewfinder'}
          </span>
          {isCameraActive && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: '#EAF5F0',
                color: '#23845B',
              }}
            >
              {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
            </span>
          )}
        </div>

        {/* Viewfinder Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hasTorch && isCameraActive && (
            <button
              type="button"
              onClick={toggleTorch}
              className="btn btn-secondary btn-sm"
              title="Toggle Torch / Flashlight"
            >
              <Flashlight size={14} color={torchOn ? '#B7791F' : '#6B7A7A'} />
            </button>
          )}

          {availableCameras.length > 1 && isCameraActive && (
            <button
              type="button"
              onClick={switchCamera}
              className="btn btn-secondary btn-sm"
              title="Switch Front / Rear Camera"
            >
              <SwitchCamera size={14} />
            </button>
          )}

          {isCameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="btn btn-secondary btn-sm"
            >
              <CameraOff size={14} /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="btn btn-primary btn-sm"
            >
              <Camera size={14} /> Start Camera
            </button>
          )}
        </div>
      </div>

      {/* Main Viewfinder Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '360px',
          backgroundColor: '#1C2526',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '480px',
            objectFit: 'contain',
            display: isCameraActive ? 'block' : 'none',
          }}
        />

        {/* Targeting Reticle Overlay for Live Camera */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Reticle Frame */}
            <div
              style={{
                width: '75%',
                maxWidth: '420px',
                height: '55%',
                maxHeight: '260px',
                border: '2px solid rgba(20, 133, 125, 0.85)',
                borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                position: 'relative',
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #14857D', borderLeft: '4px solid #14857D' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #14857D', borderRight: '4px solid #14857D' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #14857D', borderLeft: '4px solid #14857D' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #14857D', borderRight: '4px solid #14857D' }} />

              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(28, 37, 38, 0.75)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Targeting: {activePanel} Panel
              </div>
            </div>
          </div>
        )}

        {/* Inactive or Error State */}
        {!isCameraActive && (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '420px',
            }}
          >
            {cameraError ? (
              <>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(196, 71, 71, 0.2)',
                    color: '#C44747',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <AlertCircle size={26} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                  Camera Notice
                </h4>
                <p style={{ fontSize: '12px', color: '#CDD8D6', lineHeight: 1.5, marginBottom: '16px' }}>
                  {cameraError}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={startCamera}
                >
                  <RefreshCw size={13} /> Try Reconnecting Camera
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(20, 133, 125, 0.2)',
                    color: '#14857D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Camera size={28} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  Live Camera Scanner Ready
                </h4>
                <p style={{ fontSize: '12px', color: '#CDD8D6', lineHeight: 1.5, marginBottom: '20px' }}>
                  Click below to activate your device camera for real-time barcode scanning and package panel capture.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startCamera}
                >
                  <Camera size={16} /> Enable Device Camera
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Barcode Extraction Status Banner (when barcode detected) */}
      {scannedBarcode && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#EAF5F0',
            borderTop: '1px solid #B7E1CD',
            borderBottom: '1px solid #B7E1CD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#23845B" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#23845B' }}>
                Barcode Detected: <span style={{ fontFamily: 'var(--font-mono)' }}>{scannedBarcode}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6B7A7A' }}>
                Format: {scannedFormat || 'EAN/GTIN'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setScannedBarcode(null);
              setScannedFormat(null);
              if (videoRef.current) {
                startZxingBarcodeDetection(videoRef.current);
              }
            }}
          >
            Rescan Barcode
          </button>
        </div>
      )}

      {/* Camera Capture Footer Controls */}
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B7A7A' }}>
          <Lock size={12} color="#14857D" />
          <span>Local In-Browser Processing (No server image uploads)</span>
        </div>

        {isCameraActive && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={captureFrame}
            disabled={isCapturing}
            style={{ padding: '8px 20px', fontWeight: 600 }}
          >
            <Camera size={16} /> Capture {activePanel} Panel Photo
          </button>
        )}
      </div>
    </div>
  );
};

