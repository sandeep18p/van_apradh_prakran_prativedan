import { ChangeDetectorRef, Component, input, Input, OnInit } from '@angular/core';

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
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-assign-porto-self-in-case-of-ra-por-registeration',
  templateUrl: './assign-porto-self-in-case-of-ra-por-registeration.component.html',
  styleUrls: ['./assign-porto-self-in-case-of-ra-por-registeration.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule, DatePipe]
})
export class AssignPORToSelfInCaseOfRAPORRegisterationComponent implements OnInit {

  @Input() ro_name!: string;
  @Input() complain_table_id!: string;
  @Input() complain_history_table_id!: string;
  @Input() loginedOffierEmpId!: string;
  @Input() loginedOffierDesignationId!: string;
  focr_number: string = "";
  focr_date: string = "";

  ro_remark: string = "";

  constructor(private modalCtrl: ModalController, private apiService: ApiServiceService,
    private cdRef: ChangeDetectorRef, private sharedService: SharedserviceService) { }

  setFocrDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.focr_date = `${yyyy}-${mm}-${dd}`;
  }

  ngOnInit() {
    this.setFocrDate();
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

  clickToAssignSelf() {

    if (this.focr_number === "") {
      this.showError("कृपया FOCR क्रमाँक लिखें");
      return;
    }

    this.modalCtrl.dismiss({
      confirmed: true,
      remark: this.ro_remark,
      complain_history_table_id: this.complain_history_table_id.toString(),
      complain_table_id: this.complain_table_id.toString(),
      focr_date: this.focr_date,
      focr_number: this.focr_number
    });

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
