import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonGrid, IonText, IonCol, IonRow, IonButton, IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-penalty-picker-modal',
  templateUrl: './penalty-picker-modal.component.html',
  styleUrls: ['./penalty-picker-modal.component.scss'],
  imports: [IonGrid, IonText, IonCol, IonRow, IonButton, IonItem, IonLabel, IonRadio, IonRadioGroup, CommonModule, FormsModule]
})
export class PenaltyPickerModalComponent implements OnInit {
  @Input() selectedValue!: string;
  @Input() sections!: Array<{ value: string; label: string }>;

  selectedSection: string = 'none';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.selectedSection = this.selectedValue || 'none';
  }

  confirm() {
    this.modalCtrl.dismiss({ selectedValue: this.selectedSection });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
