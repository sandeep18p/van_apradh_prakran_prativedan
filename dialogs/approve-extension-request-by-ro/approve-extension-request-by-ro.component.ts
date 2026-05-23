import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  selector: 'app-approve-extension-request-by-ro',
  templateUrl: './approve-extension-request-by-ro.component.html',
  styleUrls: ['./approve-extension-request-by-ro.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule]
})
export class ApproveExtensionReqestByRO implements OnInit {

  @Input() totalDaysGivenByROToExtend!: string;
  @Input() requester_name!: string;
  @Input() days_to_extend_by_requester!: string;
  @Input() request_table_id!: string;
  @Input() complain_id!: string;
  @Input() updated_by!: string;

  isLoading: boolean = false;
  loadingMessage: string = "";

  constructor(private modalCtrl: ModalController, private apiService: ApiServiceService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({ chevronDownOutline })
  }

  async ngOnInit() {

    this.totalDaysGivenByROToExtend = this.days_to_extend_by_requester;
    this.cdRef.detectChanges();

  }

  clickToApproveReject(approveOrReject: Number) {

    if (approveOrReject === 1) {
      if (this.totalDaysGivenByROToExtend === null) {
        this.showError("कृपया जाँच हेतु आवश्यक दिनों की संख्या लिखे |");
        return;
      }

      if (Number(this.totalDaysGivenByROToExtend) <= 0 || Number(this.totalDaysGivenByROToExtend) > 30) {
        this.showError("जाँच हेतु आवश्यक दिनों की संख्या 0 दिनों से कम और 30 दिनों से ज्यादा नहीं हो सकती |");
        return;
      }

      if (Number(this.totalDaysGivenByROToExtend) > Number(this.days_to_extend_by_requester)) {
        this.showError(`जाँच कर्ता अधिकारी ने ${this.days_to_extend_by_requester} दिनों की समयवृद्धि मांगी है, आप इससे ज्यादा दिनों की स्वीकृति नहीं कर सकते।`);
        return;
      }
    }

    if(approveOrReject === 2){
      this.totalDaysGivenByROToExtend = "0";
    }


    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.approveRejectExtensionRequest(this.request_table_id, approveOrReject.toString(),
      this.totalDaysGivenByROToExtend,
      this.updated_by,
      this.complain_id).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges();

          if (response.response.code === 200) {

            this.modalCtrl.dismiss({
              confirmed: true
            });

          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          await this.dismissDialog();
          this.showError(error);
        }
      );
  }

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async showError(errorMsg: string) {

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

}
