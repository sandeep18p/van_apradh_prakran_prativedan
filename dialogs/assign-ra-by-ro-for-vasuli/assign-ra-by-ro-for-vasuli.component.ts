import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { GetRAResponseModal } from './GetRAResponse.modal';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { SelectDateDialogComponent } from '../select-date-dialog/select-date-dialog.component';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

@Component({
  selector: 'app-assign-ra-by-ro-for-vasuli',
  templateUrl: './assign-ra-by-ro-for-vasuli.component.html',
  styleUrls: ['./assign-ra-by-ro-for-vasuli.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule, DatePipe]
})
export class AssignRaForVasuliByRoComponent implements OnInit {

  @Input() complain_table_id!: string;
  @Input() complain_history_table_id!: string;
  @Input() loginedOffierEmpId!: string;
  @Input() loginedOffierDesignationId!: string;
  @Input() shesh_vasuli_rashi!: string;

  listOfRA: GetRAResponseModal[] = [];
  selectedRAId: any = null;
  ro_remark: string = "";
  isLoading: boolean = false;
  loadingMessage: string = "";

  constructor(private modalCtrl: ModalController, private apiService: ApiServiceService,
    private cdRef: ChangeDetectorRef, private sharedService: SharedserviceService
  ) {
    addIcons({ chevronDownOutline })
  }

  async ngOnInit() {

    this.getRAList();
    this.cdRef.detectChanges();

  }

  getRAList() {
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getRAList(this.loginedOffierEmpId, this.loginedOffierDesignationId).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges();

        if (response.response.code === 200) {

          this.listOfRA = response.data;
          this.cdRef.detectChanges();

        } else {
          this.showError(response.response.msg)
        }

      },
      async (error) => {
        //await this.dismissLoading();
        await this.dismissDialog();
        this.showError(error);
        //this.apiService.showServerMessages(error)
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

  clickToAssignRA() {
    if (this.selectedRAId === null) {
      this.showError("कृपया वसूली के लिए अधिकारी चुने");
      return;
    }

    this.modalCtrl.dismiss({
      confirmed: true,
      remark: this.ro_remark,
      selected_ra: this.selectedRAId.toString(),
      complain_history_table_id: this.complain_history_table_id.toString(),
      complain_table_id: this.complain_table_id.toString()
    });

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