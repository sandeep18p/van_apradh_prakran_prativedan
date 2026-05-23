import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'src/assets/fonts/vfs_fonts_custom'; // ✅ adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class GeneratePdfService {

  constructor() {
    this.setupPdfMakeFont();
  }

  private setupPdfMakeFont() {
    // ✅ Assign custom base64 font to virtual file system
    (pdfMake as any).vfs = vfs;

    // ✅ Register the font under a name
    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Regular.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf',
      }
    };
  }

  public generateHindiReport() {
    const docDefinition = {
      content: [
        { text: 'बकाया जुर्म की अंबल रिपोर्ट', fontSize: 18 }
      ],
      defaultStyle: {
        font: 'NotoSansDevanagari'
      }
    };

    pdfMake.createPdf(docDefinition).download('hindi-report.pdf');
  }
}