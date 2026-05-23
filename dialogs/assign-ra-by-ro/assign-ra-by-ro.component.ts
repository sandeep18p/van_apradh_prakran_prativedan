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
  selector: 'app-assign-ra-by-ro',
  templateUrl: './assign-ra-by-ro.component.html',
  styleUrls: ['./assign-ra-by-ro.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule, DatePipe, CommonModule]
})
export class AssignRaByRoComponent implements OnInit {

  @Input() complain_table_id!: string;
  @Input() complain_history_table_id!: string;
  @Input() loginedOffierEmpId!: string;
  @Input() loginedOffierDesignationId!: string;
  @Input() showAssignedLimit: boolean = true;

  listOfRA: GetRAResponseModal[] = [];
  selectedRAId: any = null;
  ro_remark: string = "";
  isLoading: boolean = false;
  loadingMessage: string = "";
  focr_number: string = "";
  focr_date: string = "";
  assignedLimit: number | null = null;

  constructor(private modalCtrl: ModalController, private apiService: ApiServiceService,
    private cdRef: ChangeDetectorRef, private sharedService: SharedserviceService
  ) {
    addIcons({ chevronDownOutline })
  }

  // setFocrDate() {
  //   const today = new Date();
  //   const yyyy = today.getFullYear();
  //   const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  //   const dd = String(today.getDate()).padStart(2, '0');
  //   this.focr_date = `${yyyy}-${mm}-${dd}`;
  // }

  async ngOnInit() {

    this.getRAList();
    //this.setFocrDate();
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
      this.showError("कृपया जाँचकर्ता अधिकारी चुने");
      return;
    }

    if (this.focr_number === "") {
      this.showError("कृपया FOCR क्रमाँक लिखें");
      return;
    }

    if (this.focr_date === "") {
      this.showError("कृपया FOCR दिनांक चुने");
      return;
    }

    const assignedLimitNum = Number(this.assignedLimit);
    if (this.showAssignedLimit) {
      if (!Number.isInteger(assignedLimitNum) || assignedLimitNum < 1 || assignedLimitNum > 30) {
        this.showError("जांच अवधी 1 से 30 दिनके बीच होना चाहिए");
        return;
      }
    }

    const payload: any = {
      confirmed: true,
      remark: this.ro_remark,
      selected_ra: this.selectedRAId.toString(),
      complain_history_table_id: this.complain_history_table_id.toString(),
      complain_table_id: this.complain_table_id.toString(),
      focr_date: this.focr_date,
      focr_number: this.focr_number
    };

    if (this.showAssignedLimit) {
      payload.assignedLimit = assignedLimitNum;
    }

    this.modalCtrl.dismiss(payload);

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

  async onSelecteFocrDate() {

    const modal = await this.modalCtrl.create({
      component: SelectDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {

        const date = new Date(this.sharedService.getSelectedCrimeDate());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        this.focr_date = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

}
