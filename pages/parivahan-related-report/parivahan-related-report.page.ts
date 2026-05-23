import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonLabel, IonButtons, IonMenuButton, IonSpinner } from '@ionic/angular/standalone';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { addIcons } from 'ionicons';
import { filterOutline, downloadOutline, cloudOfflineOutline } from 'ionicons/icons';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-parivahan-related-report',
  templateUrl: './parivahan-related-report.page.html',
  styleUrls: ['./parivahan-related-report.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonLabel, IonButtons, IonMenuButton, IonSpinner, CommonModule, FormsModule, NgSelectModule]
})
export class ParivahanRelatedReportPage implements OnInit {

  isLoading: boolean = false;
  circles: any[] = [];
  selectedCircleId: number | null = null;
  fromDate: string = '';
  toDate: string = '';

  reportData: any = null;
  processedRows: any[] = [];
  totals: any = {};

  constructor(private apiService: ApiServiceService) {
    addIcons({ filterOutline, downloadOutline, cloudOfflineOutline });
  }

  ngOnInit() {
    this.setDefaultDates();
    this.getCircle();
  }

  setDefaultDates() {
    const now = new Date();
    this.toDate = now.toISOString().split('T')[0];
    const prevMonth = new Date();
    prevMonth.setMonth(now.getMonth() - 1);
    this.fromDate = prevMonth.toISOString().split('T')[0];
  }

  listOfCircle: any = [];

  getCircle() {

    this.selectedCircleId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getCircles().subscribe(
      async (response) => {

        debugger;
        if (response.response.code === 200) {

          this.listOfCircle = response.data;

        }

      },
      async (error) => {
      }
    );

  }

  fetchReport() {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both From and To dates');
      return;
    }

    this.isLoading = true;
    this.apiService.getParivahanRelatedReport(this.selectedCircleId || 0, this.fromDate, this.toDate).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const parsedRes = typeof res === 'string' ? JSON.parse(res) : res;
        this.reportData = parsedRes;
        debugger;
        this.processData();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('Failed to fetch report');
      }
    });
  }

  getEmptyCategory() {
    return { timber: 0, poles: 0, firewood: 0, other: 0 };
  }

  processData() {
    const circlesMap = new Map<string, any>();

    const getRow = (circleName: string) => {
      if (!circlesMap.has(circleName)) {
        circlesMap.set(circleName, {
          circleName,
          opening: this.getEmptyCategory(),
          seized: this.getEmptyCategory(),
          depo: this.getEmptyCategory(),
          closing: this.getEmptyCategory()
        });
      }
      return circlesMap.get(circleName);
    };

    const mapCategory = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower === 'kastha' || lower.includes('timber') || lower.includes('काष्ठ')) return 'timber';
      if (lower === 'balli' || lower.includes('pole') || lower.includes('बल्ली')) return 'poles';
      if (lower === 'jalau chatta' || lower.includes('firewood') || lower.includes('जलाऊ')) return 'firewood';
      return 'other';
    };

    // Process Opening Balance
    (this.reportData.openingBalance || []).forEach((item: any) => {
      const row = getRow(item.circleName);
      const cat = mapCategory(item.saman_type_group);
      row.opening[cat] = cat === 'timber' ? Number(item.shesh_ghan_meter) : Number(item.shesh_nag);
    });

    // Process Monthly Seized
    (this.reportData.monthlySeized || []).forEach((item: any) => {
      const row = getRow(item.circleName);
      const cat = mapCategory(item.saman_type_group);
      row.seized[cat] = cat === 'timber' ? Number(item.total_ghan_meter_japt) : Number(item.total_nag_japt);
    });

    // Process Monthly Sent to Depo
    (this.reportData.monthlySentToDepo || []).forEach((item: any) => {
      const row = getRow(item.circleName);
      const cat = mapCategory(item.saman_type_group);
      row.depo[cat] = cat === 'timber' ? Number(item.total_ghan_meter_japt) : Number(item.total_nag_japt);
    });

    // Process Final Remaining
    (this.reportData.finalRemaining || []).forEach((item: any) => {
      const row = getRow(item.circleName);
      const cat = mapCategory(item.saman_type_group);
      row.closing[cat] = cat === 'timber' ? Number(item.shesh_ghan_meter) : Number(item.shesh_nag);
    });

    this.processedRows = Array.from(circlesMap.values()).sort((a, b) => a.circleName.localeCompare(b.circleName));
    this.calculateTotals();
  }

  calculateTotals() {
    const t = {
      opening: this.getEmptyCategory(),
      seized: this.getEmptyCategory(),
      depo: this.getEmptyCategory(),
      closing: this.getEmptyCategory()
    };

    this.processedRows.forEach(row => {
      ['opening', 'seized', 'depo', 'closing'].forEach(section => {
        ['timber', 'poles', 'firewood', 'other'].forEach(cat => {
          (t as any)[section][cat] += (row as any)[section][cat];
        });
      });
    });
    this.totals = t;
  }

  async downloadExcel() {
    // Current export is simple, can be improved to match table layout
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    // Header Row 1
    sheet.addRow(['', 'माह के प्रारम्भ में परिवहन हेतु शेष', '', '', '', 'माह में जप्त POR वनोपज', '', '', '', 'माह में डिपो में परिवहनित', '', '', '', 'महान्त में परिवहन हेतु शेष', '', '', '']);
    sheet.mergeCells('B1:E1');
    sheet.mergeCells('F1:I1');
    sheet.mergeCells('J1:M1');
    sheet.mergeCells('N1:Q1');

    // Header Row 2
    sheet.addRow(['Circle', 'काष्ठ (m³)', 'बल्ली (संख्या)', 'जलाऊ (संख्या)', 'अन्य (संख्या)', 'काष्ठ (m³)', 'बल्ली (संख्या)', 'जलाऊ (संख्या)', 'अन्य (संख्या)', 'काष्ठ (m³)', 'बल्ली (संख्या)', 'जलाऊ (संख्या)', 'अन्य (संख्या)', 'काष्ठ (m³)', 'बल्ली (संख्या)', 'जलाऊ (संख्या)', 'अन्य (संख्या)']);

    this.processedRows.forEach(r => {
      sheet.addRow([
        r.circleName,
        r.opening.timber, r.opening.poles, r.opening.firewood, r.opening.other,
        r.seized.timber, r.seized.poles, r.seized.firewood, r.seized.other,
        r.depo.timber, r.depo.poles, r.depo.firewood, r.depo.other,
        r.closing.timber, r.closing.poles, r.closing.firewood, r.closing.other
      ]);
    });

    // Totals Row
    sheet.addRow([
      'योग ->',
      this.totals.opening.timber, this.totals.opening.poles, this.totals.opening.firewood, this.totals.opening.other,
      this.totals.seized.timber, this.totals.seized.poles, this.totals.seized.firewood, this.totals.seized.other,
      this.totals.depo.timber, this.totals.depo.poles, this.totals.depo.firewood, this.totals.depo.other,
      this.totals.closing.timber, this.totals.closing.poles, this.totals.closing.firewood, this.totals.closing.other
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Parivahan_Report_${this.fromDate}_to_${this.toDate}.xlsx`);
  }

}
