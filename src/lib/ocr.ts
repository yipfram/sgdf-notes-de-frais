import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  amounts: string[];
}

export async function performOCR(imageFile: File): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(imageFile, 'fra', {
      logger: (m) => console.log(m),
    });

    const text = data.text;
    const confidence = data.confidence;

    // Extract potential amounts from text
    const amounts = extractAmounts(text);

    return {
      text,
      confidence,
      amounts,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      text: '',
      confidence: 0,
      amounts: [],
    };
  }
}

function extractAmounts(text: string): string[] {
  // Regular expressions to match various amount formats
  const patterns = [
    // European format: 12,34 € or 12.34 €
    /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*[€EUR]/gi,
    // Simple amounts: 12,34 or 12.34
    /\b(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b/g,
    // Integer amounts with currency
    /(\d{1,4})\s*[€EUR]/gi,
    // Integer amounts standalone
    /\b(\d{1,3})\b/g,
  ];

  const amounts: string[] = [];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean the match
        const cleanAmount = match.replace(/[€EUR\s]/gi, '').trim();
        if (cleanAmount && !amounts.includes(cleanAmount)) {
          amounts.push(cleanAmount);
        }
      });
    }
  });

  // Filter out unrealistic amounts (too high or too low)
  return amounts.filter(amount => {
    const num = parseFloat(amount.replace(',', '.'));
    return num >= 0.01 && num <= 10000; // Between 1 cent and 10,000 euros
  }).slice(0, 5); // Limit to first 5 matches
}