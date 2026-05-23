import { Component, Input, OnInit } from '@angular/core';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, closeCircleOutline, constructOutline, homeOutline, leafOutline } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { NgIf } from '@angular/common';  // 👈 add this

@Component({
  selector: 'app-select-option-for-ra',
  templateUrl: './select-option-for-ra.component.html',
  styleUrls: ['./select-option-for-ra.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, NgIf]
})
export class SelectOptionForRaComponent implements OnInit {

  @Input() show_prakaran_prativendan: boolean = true;;

  constructor(private modalCtrl: ModalController) {
    addIcons({ alertCircleOutline, constructOutline, leafOutline, homeOutline, closeCircleOutline });
  }

  ngOnInit() {
  }


  onOptionSelect(option: any) {
    this.modalCtrl.dismiss({ confirmed: true, selectedOption: option });
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

}
