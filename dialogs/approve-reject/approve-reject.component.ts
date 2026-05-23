import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonTextarea, IonGrid, IonText, IonCol, IonRow, IonButton } from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Toast } from '@capacitor/toast';
@Component({
  standalone: true,
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.scss'],
  imports: [IonTextarea, IonGrid, IonText, IonCol, IonRow, IonButton, CommonModule, FormsModule]
})
export class ApproveRejectComponent implements OnInit {

  @Input() remarkLabel!: string;
  @Input() approved_or_reject!: string;

  constructor(private modalCtrl: ModalController) { }

  approveRejectRemark: string = "";

  accept_reject_text: string = "";

  ngOnInit() {
    if (this.approved_or_reject === "1") {
      this.accept_reject_text = "स्वीकृत";
    } else {
      this.accept_reject_text = "अस्वीकृत";
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  submitData() {

    if (this.approveRejectRemark === "" && this.approved_or_reject === "2") {
      this.longToast("कृपया अस्वीकृत टिप्पणी प्रेषित करिये");
      return;
    }

    this.modalCtrl.dismiss({ confirmed: true, remark: this.approveRejectRemark, approved_or_reject: this.approved_or_reject });
  }

}
