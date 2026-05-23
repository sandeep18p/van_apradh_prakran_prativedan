import { OnInit, OnDestroy, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone'
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

@Component({
  standalone: true,
  selector: 'app-select-apradh-prakrana-dialog',
  templateUrl: './select-apradh-prakrana-dialog.component.html',
  styleUrls: ['./select-apradh-prakrana-dialog.component.scss'],
  imports: [
    IonDatetime, FormsModule, IonButton, IonGrid, IonCol, IonRow]
})
export class SelectApradhPrakranaDialogComponent implements OnInit {

  selectedDate: string = '';
  maxDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController, private sharedService: SharedserviceService) { }

  ngOnInit() { }

  closeModel() {
    this.modalCtrl.dismiss();
  }

  onSelectDate() {

    if (!this.selectedDate) {
      const today = new Date();
      this.selectedDate = today.toISOString().split('T')[0];
    }

    this.sharedService.setSelectedApradhPrativedanDate(this.selectedDate);
    this.modalCtrl.dismiss({ confirmed: true });
  }

}
