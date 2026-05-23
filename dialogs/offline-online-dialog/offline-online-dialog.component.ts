import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-offline-online-dialog',
  templateUrl: './offline-online-dialog.component.html',
  styleUrls: ['./offline-online-dialog.component.scss'],
  standalone:true,
  imports:[IonicModule, CommonModule, FormsModule]
})
export class OfflineOnlineDialogComponent  implements OnInit {

  constructor(private router: Router, private modalController:ModalController) { }

  ngOnInit() {}

  async yesClick(){
    this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
    this.modalController.dismiss();
  }

  noClick(){
    App.exitApp();
  }

}
