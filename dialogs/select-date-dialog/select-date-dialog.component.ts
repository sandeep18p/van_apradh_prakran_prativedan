import { OnInit, OnDestroy, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone'
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

@Component({
  standalone: true,
  selector: 'app-select-date-dialog',
  templateUrl: './select-date-dialog.component.html',
  styleUrls: ['./select-date-dialog.component.scss'],
  imports: [
    IonDatetime, FormsModule, IonButton, IonGrid, IonCol, IonRow]
})
export class SelectDateDialogComponent implements OnInit {

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
    this.sharedService.setSelectedCrimDate(this.selectedDate);
    this.modalCtrl.dismiss({ confirmed: true });
  }

}
