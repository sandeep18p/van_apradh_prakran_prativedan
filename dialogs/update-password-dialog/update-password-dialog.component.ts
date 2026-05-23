import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonTitle, IonContent, IonGrid, IonText, IonCol, IonRow, IonButton, IonHeader, IonToolbar, IonIcon, IonInput, IonItem } from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  standalone: true,
  selector: 'app-update-password-dialog',
  templateUrl: './update-password-dialog.component.html',
  styleUrls: ['./update-password-dialog.component.scss'],
  imports: [IonTitle, IonContent, IonGrid, IonText, IonCol, IonRow, IonButton, CommonModule, FormsModule, IonHeader, IonToolbar, IonIcon, IonInput, IonItem]
})
export class UpdatePasswordDialogComponent implements OnInit {

  password1: string = '';
  password2: string = '';

  showPassword1: boolean = false;
  showPassword2: boolean = false;

  // isFormValid() {
  //   return (
  //     this.password1.length >= 6 &&
  //     this.password1 === this.password2
  //   );
  // }

  submit() {

    
    if (this.password1 === "") {
      this.showError("नया पासवर्ड प्रविष्ट करें");
      return;
    }

    if (this.password1 === "123456") {
      this.showError("नया पासवर्ड 123456 ना प्रविष्ट करें");
      return;
    }

    if (this.password1.length < 6) {
      this.showError("नया पासवर्ड 6 अक्षरों से अधिक होना चाहिए।");
      return;
    }

    
    if (this.password2 === "") {
      this.showError("नया पासवर्ड पुष्टि प्रविष्ट करें");
      return;
    }
if (this.password1 != this.password2) {
      this.showError("नया पासवर्ड और नया पासवर्ड पुष्टि दोनों समान होना चाहिए।");
      return;
    }
    if (this.password2 === "123456") {
      this.showError("नया पासवर्ड 123456 ना प्रविष्ट करें");
      return;
    }

    if (this.password2.length < 6) {
      this.showError("नया पासवर्ड पुष्टि 6 अक्षरों से अधिक होना चाहिए।");
      return;
    }

    

    this.modalCtrl.dismiss({
      confirmed: true,
      newPassword: this.password1
    });

  }

  async showError(errorMsg: string) {

    console.log(errorMsg);

    try {
      const modal = await this.modalCtrl.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: errorMsg,
          isYesNo: false,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });

      await modal.present();
    } catch (err) {
    }

  }

  async ngOnInit() {
  }

  constructor(private modalCtrl: ModalController) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  yesClick() {
    this.modalCtrl.dismiss({ confirmed: true });
  }

  noClick() {
    this.modalCtrl.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss({ confirmed: false });
  }
}
