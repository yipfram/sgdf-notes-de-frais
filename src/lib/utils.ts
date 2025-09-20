import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export function formatAmount(amount: string): string {
  // Convert comma to dot for decimal separator
  return amount.replace(',', '.');
}

export function generateFileName(date: string, branch: string, amount: string): string {
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');
  const formattedAmount = formatAmount(amount);
  return `${formattedDate} - ${branch} - ${formattedAmount}.jpg`;
}

export function downloadFile(file: File, fileName: string): void {
  // Create a new file with the desired name
  const renamedFile = new File([file], fileName, { type: file.type });
  saveAs(renamedFile);
}

export function createMailtoLink(
  date: string,
  branch: string,
  amount: string,
  description: string,
  fileName: string
): string {
  const subject = `Note de frais SGDF - ${branch} - ${formatAmount(amount)}€`;
  const formattedDate = format(new Date(date), 'dd/MM/yyyy');
  
  const body = `Bonjour,

Veuillez trouver ci-joint ma note de frais :

Date : ${formattedDate}
Branche : ${branch}
Montant : ${formatAmount(amount)}€
Description : ${description}
Fichier : ${fileName}

Merci.

Cordialement`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  return `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
}

export function resizeImage(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw resized image
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and create new file
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    };
    
    img.src = URL.createObjectURL(file);
  });
}