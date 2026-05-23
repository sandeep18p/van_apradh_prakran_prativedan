import { OnInit, Component } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone'
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

@Component({
  standalone: true,
  selector: 'app-select-month-year-dialog',
  templateUrl: './select-month-year-dialog.component.html',
  styleUrls: ['./select-month-year-dialog.component.scss'],
  imports: [IonDatetime, FormsModule, IonButton, IonGrid, IonCol, IonRow]
})
export class SelecMonthYearDialogComponent implements OnInit {

  selectedMonthYear: string = '';          // "11-2025"
  selectedMonthYearISO: string = '';       // "2025-11-01T00:00:00.000Z" → what ionic needs
  minDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController, private sharedService: SharedserviceService) { }

  ngOnInit() {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear();

    this.selectedMonthYear = `${month}-${year}`;  // for your app
    this.selectedMonthYearISO = `${year}-${month}-01T00:00:00.000Z`;  // for ionic
  }

  closeModel() {
    this.modalCtrl.dismiss();
  }

  onDateChange(event: any) {
    const iso = event.detail.value;       // full ISO from ion-datetime
    const date = new Date(iso);

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    this.selectedMonthYear = `${month}-${year}`; // you store this
    this.selectedMonthYearISO = iso;             // ionic uses this
  }

  onSelectDate() {
    // If user did NOT change anything, selectedMonthYear already contains initial value
    console.log("Final Selected:", this.selectedMonthYear);

    this.sharedService.setSelectedCrimDate(this.selectedMonthYear);
    this.modalCtrl.dismiss({ confirmed: true });
  }

}
