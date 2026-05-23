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
  selector: 'return-to-pradhikrit-adhikari',
  templateUrl: './return-to-pradhikrit-adhikari.component.html',
  styleUrls: ['./return-to-pradhikrit-adhikari.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule, DatePipe]
})
export class ReturnToPradhikaritAdhikariComponent implements OnInit {

  @Input() complain_table_id!: string;
  @Input() loginedOffierEmpId!: string;
  @Input() loginedOffierDesignationId!: string;
  @Input() complain_history_table_id!: string;

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

    this.getListOfEmployee();
    this.cdRef.detectChanges();

  }

  getListOfEmployee() {
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getPradhikaritAdhikariDetail(
      this.loginedOffierEmpId,
      this.loginedOffierDesignationId,
      this.complain_table_id
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges();

        if (response.response.code === 200) {

          this.listOfRA = response.data;

          this.selectedRAId = this.listOfRA[0].emp_id;

          this.cdRef.detectChanges();

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

  clickToOfficer() {
    if (this.selectedRAId === null) {
      this.showError("कृपया प्राधिकृत अधिकारी चुने");
      return;
    }

    this.modalCtrl.dismiss({
      confirmed: true,
      remark: this.ro_remark,
      selected_officer: this.selectedRAId.toString(),
      complain_table_id: this.complain_table_id.toString(),
      complain_history_table_id: this.complain_history_table_id.toString()
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
