import { OnInit, OnDestroy, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone'
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

@Component({
  standalone: true,
  selector: 'app-select-time-dialog',
  templateUrl: './select-time-dialog.component.html',
  styleUrls: ['./select-time-dialog.component.scss'],
  imports: [
    IonDatetime, FormsModule, IonButton, IonGrid, IonCol, IonRow]
})
export class TimeDialogComponent implements OnInit {

  selectedTime: string = '';
  maxDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController, private sharedService: SharedserviceService) { }

  ngOnInit() { }

  closeModel() {
    this.modalCtrl.dismiss();
  }

  onSelectTime() {
    
    this.sharedService.setSelectedCrimDate(this.selectedTime);
    this.modalCtrl.dismiss({ confirmed: true });
  }

}
