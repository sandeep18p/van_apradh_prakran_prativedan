import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonGrid, IonText, IonCol, IonRow, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, helpCircleOutline, closeOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-beat-inspection-dialog',
  templateUrl: './beat-inspection-dialog.component.html',
  styleUrls: ['./beat-inspection-dialog.component.scss'],
  imports: [IonGrid, IonText, IonCol, IonRow, IonButton, IonIcon, CommonModule, FormsModule]
})
export class BeatInspectionDialogComponent {
  
  constructor(private modalCtrl: ModalController) {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, helpCircleOutline, closeOutline });
  }

  onYesClick() {
    this.modalCtrl.dismiss({ isBeatInspection: true });
  }

  onNoClick() {
    this.modalCtrl.dismiss({ isBeatInspection: false });
  }

  dismiss() {
    this.modalCtrl.dismiss({ isBeatInspection: null });
  }
}
