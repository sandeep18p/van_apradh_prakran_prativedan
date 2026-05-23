import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { GetRAResponseModal } from './GetRAResponse.modal';

import { ModalController } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { finalize } from 'rxjs';
import { VasuliViranDetailRequestModal } from 'src/app/pages/officer-dashboard/GetDashboardResponse.model';

@Component({
  selector: 'app-assign-sdo-by-ro',
  templateUrl: './assign-sdo-by-ro.component.html',
  styleUrls: ['./assign-sdo-by-ro.component.scss'],
  imports: [IonicModule, NgSelectModule, FormsModule]
})
export class AssignSDOByRoComponent implements OnInit {

  @Input() complain_table_id!: string;


  @Input() japt_saman_total_price!: string;
  @Input() found_vanopaj_total_price!: string;
  @Input() actual_loss_total_price!: string;
  @Input() mahsul_total_price!: string;
  @Input() mavja_total_price!: string;
  @Input() shesh_vasuli_rashi!: string;
  @Input() pahle_ka_vasuli_rashi!: string;


  @Input() complain_history_table_id!: string;
  @Input() loginedOffierEmpId!: string;
  @Input() loginedOffierDesignationId!: string;

  listOfRA: GetRAResponseModal[] = [];
  selectedSDOId: any = null;
  ro_remark: string = "";
  isLoading: boolean = false;
  loadingMessage: string = "";

  total_mavja_mahsul_rashi: number = 0;

  totalVasuliRashi: string = "";

  listOfAlreadySubmittedVasuliDetail: VasuliViranDetailRequestModal[] = [];

  constructor(private modalCtrl: ModalController, private apiService: ApiServiceService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({ chevronDownOutline })
  }

  async ngOnInit() {
    this.total_mavja_mahsul_rashi = Number(this.mahsul_total_price) + Number(this.mavja_total_price);
    this.getSDOList();
  }

  getSDOList() {
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSDOList(this.loginedOffierEmpId, this.loginedOffierDesignationId).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.listOfRA = response.data;
          this.selectedSDOId = this.listOfRA[0].emp_id;
          this.cdRef.detectChanges();

        } else {
          this.showError(response.response.msg)
        }

        this.getWorkLog();

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

  clickToAssignSDO() {

    if (this.selectedSDOId === null) {
      this.showError("कृपया SDO / AD चुने");
      return;
    }

    if (this.selectedPdfFile === null) {
      this.showError("कृपया अग्रेषण पत्र चुने");
      return;
    }
    
    this.modalCtrl.dismiss({
      confirmed: true,
      remark: this.ro_remark,
      selected_sdo: this.selectedSDOId.toString(),
      japt_saman_total_price: this.japt_saman_total_price,
      found_vanopaj_total_price: this.found_vanopaj_total_price,
      actual_loss_total_price: this.actual_loss_total_price,
      mahsul_total_price: this.mahsul_total_price,
      mavja_total_price: this.mavja_total_price,
      shesh_vasuli_rashi: this.shesh_vasuli_rashi,
      complain_history_table_id: this.complain_history_table_id.toString(),
      complain_table_id: this.complain_table_id.toString(),
      pdf_file: this.selectedPdfFile
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

  selectedPdfFile: File | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      this.selectedPdfFile = file;
    } else {
      this.selectedPdfFile = null;
      alert("Please select a valid PDF file");
    }
  }

  updateTotalOfMahsulAndMawja() {
    this.total_mavja_mahsul_rashi = Number(this.mahsul_total_price) + Number(this.mavja_total_price);

    this.calculateSheshRashi();

  }

  calculateSheshRashi() {
    
    this.shesh_vasuli_rashi = (this.total_mavja_mahsul_rashi - Number(this.totalVasuliRashi)).toString();
    if (Number(this.shesh_vasuli_rashi) < 0) {
      this.shesh_vasuli_rashi = "0";
    }
  }

  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService
      .getRAWorkLogList(this.complain_table_id)
      .pipe(
        finalize(() => {
          this.dismissDialog();
        })
      )
      .subscribe(
        (response) => {
          if (response.response.code === 200) {
            

            this.listOfAlreadySubmittedVasuliDetail = response.vasuli_detail;

            if (this.listOfAlreadySubmittedVasuliDetail.length > 0) {
              const totalMavjaRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
                (sum, item) => sum + (Number(item.mavja_rashi) || 0),
                0
              );
              const totalMahsulRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
                (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
                0
              );
              this.totalVasuliRashi = (totalMahsulRashi + totalMavjaRashi).toString();
            }

            this.updateTotalOfMahsulAndMawja();

          }
        },
        (error) => {
          console.error(error);
        }
      );

  }

}
