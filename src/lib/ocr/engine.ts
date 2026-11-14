/**
 * Real In-Browser OCR Engine using Tesseract.js
 * Executes 100% client-side via WebAssembly with progress tracking and error handling.
 */

import Tesseract from 'tesseract.js';
import { parseOcrDeclarations, ParsedOcrResult } from './parser';

export interface OcrProgressUpdate {
  status: string;
  progress: number; // 0 to 100
}

export async function runClientOcr(
  imageSource: string | File | Blob,
  sourcePanel: 'FRONT' | 'BACK' | 'SIDE' | 'ADDITIONAL' = 'FRONT',
  onProgress?: (update: OcrProgressUpdate) => void,
  language: string = 'eng'
): Promise<{
  text: string;
  confidence: number;
  parsed: ParsedOcrResult;
}> {
  try {
    const result = await Tesseract.recognize(imageSource, language, {
      logger: (message: { status?: string; progress?: number }) => {
        if (onProgress && message) {
          const status = message.status || 'processing';
          const progress = typeof message.progress === 'number' ? Math.round(message.progress * 100) : 0;
          onProgress({ status, progress });
        }
      },
    });

    const rawText = result.data.text || '';
    const rawConfidence = (result.data.confidence || 0) / 100; // normalized to 0.0 - 1.0

    const parsed = parseOcrDeclarations(rawText, rawConfidence, sourcePanel);

    return {
      text: rawText,
      confidence: rawConfidence,
      parsed,
    };
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`OCR Processing Failed: ${err.message || 'Unable to recognize text from image'}`);
  }
}

