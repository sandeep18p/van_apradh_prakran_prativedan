import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ComplainDetails, VasuliViranDetailRequestModal } from '../officer-dashboard/GetDashboardResponse.model';
import { Toast } from '@capacitor/toast';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule
import { TableModule } from 'primeng/table'; // Import TableModule
import { NgIf } from '@angular/common';  // 👈 add this
import { CommonModule } from '@angular/common';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, receiptOutline, listOutline, addOutline } from 'ionicons/icons';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { GetComplainHistoryResponseModal } from '../complain-life-history/GetComplainHistoryResponse.modal';
import { SelectActualCrimeDateDialogComponent } from 'src/app/dialogs/select-actual-crime-date-dialog/select-actual-crime-date-dialog.component';

@Component({
  selector: 'app-submit-vasuli-viran-page',
  templateUrl: './submit-vasuli-viran-page.component.html',
  styleUrls: ['./submit-vasuli-viran-page.component.scss'],
  standalone: true,
  imports: [IonicModule, TableModule, NgIf, CommonModule, FormsModule]
})
export class SubmitVasuliViranPageComponent implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  loginedOfficerEmpId: number = 0;
  comingComplaintData!: ComplainDetails;
  toolbarTitle: string = "";
  listOfAlreadySubmittedVasuliDetail: VasuliViranDetailRequestModal[] = [];
  porHistoryLogList: GetComplainHistoryResponseModal[] = [];

  total_adeshit_vasuli_rashi: number = 0;
  total_shesh_bachi_vasuli_rashi: number = 0;
  total_agreem_vasuli_rashi: number = 0;

  isShownButton: boolean = true;
  isShowHeaderOfVasuliRashi: boolean = false;

  constructor(private languageService: LanguageServiceService, private navController: NavController, private modalCtrl: ModalController, private sharedService: SharedserviceService, private platform: Platform, private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef) {

    addIcons({ addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, receiptOutline, listOutline, addOutline });

  }

  ngOnInit() {

    this.getLoginedOfficerData();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
       ;
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;

      this.getWorkLog();

      if (this.comingComplaintData.complain_progress_stage === "15") {
        this.isShowHeaderOfVasuliRashi = true;
      }


    }

  }

  async getLoginedOfficerData() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;
    }

  }

  parseCustomDate(dateStr: string): Date {
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split(':').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  adesh_mavja: number = 0;
  adesh_mahsul: number = 0;
  adesh_mavja_mahsul: number = 0;

  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getRAWorkLogList(this.comingComplaintData.complain_id).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
           ;

          this.listOfAlreadySubmittedVasuliDetail = response.vasuli_detail;
           ;
          this.porHistoryLogList = response.por_history;

          const lastHistoryData = [...this.porHistoryLogList]
            .reverse()
            .find(item => item.shesh_vasuli_rashi != null && item.shesh_vasuli_rashi !== "" && item.shesh_vasuli_rashi !== "0");

          if (this.comingComplaintData.complain_progress_stage != "1"
            && this.comingComplaintData.complain_progress_stage != "2"
            && this.comingComplaintData.complain_progress_stage != "3"
            && this.comingComplaintData.complain_progress_stage != "8"
            && lastHistoryData != null) {

            this.total_adeshit_vasuli_rashi = Number(lastHistoryData.shesh_vasuli_rashi);

            const lastCreatedAtAtHistory = new Date(lastHistoryData.complain_created_at);

            this.adesh_mahsul = Number(lastHistoryData.mahsul_total_price_edited);
            this.adesh_mavja = Number(lastHistoryData.mavja_total_price_edited);
            this.adesh_mavja_mahsul = Number(lastHistoryData.mahsul_total_price_edited) +
              Number(lastHistoryData.mavja_total_price_edited);

          } else {

             ;
            let finalLog = this.comingComplaintData.finalWorkLogDetailByRa[0];

            this.adesh_mahsul = Number(finalLog.mahsul_total_price);
            this.adesh_mavja = Number(finalLog.mavja_total_price);
            this.adesh_mavja_mahsul = Number(finalLog.mahsul_total_price) +
              Number(finalLog.mavja_total_price);

          }





           ;
          this.listOfVasuliViran = [];
        }

      },
      (error) => {
        this.dismissDialog();
      }
    );
  }

  get totalPreviousMahsul(): number {
    return this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
      0
    );
  }

  get totalPreviousMavja(): number {
    return this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mavja_rashi) || 0),
      0
    );
  }

  get totalPreviousMavjaMahsul(): number {
    let mavja = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mavja_rashi) || 0),
      0
    );
    let mahsul = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
      0
    );
    return mavja + mahsul;
  }

  get totalSheshMahsul(): number {

    let previousMahsul = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
      0
    );

    return this.adesh_mahsul - previousMahsul;

  }

  get totalSheshMavja(): number {

    let previousMajva = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mavja_rashi) || 0),
      0
    );

    return this.adesh_mavja - previousMajva;

  }

  get totalSheshMavjaMahsul(): number {

    let mavja = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mavja_rashi) || 0),
      0
    );
    let mahsul = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
      0
    );
    return this.adesh_mavja_mahsul - (mavja + mahsul);
  }



  get totalMavjaAndMahsul(): number {
    let totalMavjaRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mavja_rashi) || 0),
      0
    );
    let totalMahsulRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
      0
    );
    return totalMahsulRashi + totalMavjaRashi;
  }

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
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

  listOfVasuliViran: VasuliViranDetailRequestModal[] = [];

  addVasuliDetail() {
    let model: VasuliViranDetailRequestModal = {
      complain_id: this.comingComplaintData.complain_id,
      mavja_rashi: "",
      mahsul_rashi: "",
      total_rashi: "",
      money_rasid_kramank: "",
      money_rasid_dinank: "",
      created_by: this.loginedOfficerEmpId.toString(),
      month_year: '',
      dr_number: '',
      is_editable: '1',
      vasuli_table_id: '',
      updated_by: '',
      updated_at: '',
      created_at: '',
      bank_chalan_kramank: '',
      bank_chalan_dinank: ''
    };
    this.listOfVasuliViran.push(model);
  }

  totalVasulRashi: number = 0;

  calculateTotalRashi(row: any) {
    row.total_rashi = Number(row.mahsul_rashi) + Number(row.mavja_rashi);

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }

  }

  submitVasuliData() {

    let isAllDataSubmitted = true;

    let totalMavjaInserted = 0;
    let totalMahsulInserted = 0;

    for (let i = 0; i < this.listOfVasuliViran.length; i++) {

      let singleValue = this.listOfVasuliViran[i];

      if (singleValue.bank_chalan_dinank === "" ||
         singleValue.bank_chalan_kramank === "" ||
          singleValue.mahsul_rashi === "" ||
           singleValue.mavja_rashi === "" ||
            singleValue.total_rashi === "" ||
             singleValue.money_rasid_kramank === "" ||
              singleValue.money_rasid_dinank === "") {
        isAllDataSubmitted = false;
        break;
      }

      totalMavjaInserted = totalMavjaInserted + Number(singleValue.mavja_rashi);
      totalMahsulInserted = totalMahsulInserted + Number(singleValue.mahsul_rashi);

    }

    if (!isAllDataSubmitted) {
      this.showError("कृपया वसूली की पूरी जानकारी भरें");
      return;
    }

    // if (Number(totalMahsulInserted) > this.totalSheshMahsul) {
    //   this.showError("कृपया महसूल की राशि सही प्रेषित करें");
    //   return;
    // }

    //  ;

    // if (Number(totalMavjaInserted) > this.totalSheshMavja) {
    //   this.showError("कृपया मावजा की राशि सही प्रेषित करें");
    //   return;
    // }

    let valusi_data = JSON.stringify(this.listOfVasuliViran);

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.cdRef.detectChanges();

    this.apiService.submitVasuliVivran(
      this.comingComplaintData.complain_id.toString(),
      valusi_data,
      this.loginedOfficerEmpId.toString(),
      this.comingComplaintData.complain_progress_stage.toString(),
    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {
          this.listOfVasuliViran = [];
          this.totalVasulRashi = 0;
          this.sharedService.setRefresh(true);
          this.cdRef.detectChanges();

          this.getWorkLog();

          const successMsg =
            response.response?.msg ||
            'वसूली का विवरण सफलतापूर्वक जमा हो गया है।';
          await this.showSuccess(successMsg);
        } else {
          this.showError(response.response.msg);
        }

      },
      async (error) => {
        //await this.dismissLoading();
        await this.dismissDialog();
        this.showError(error);
      }
    );


  }

  async showError(errorMsg: string) {
    await this.showMessageDialog(errorMsg);
  }

  async showSuccess(msg: string) {
    await this.showMessageDialog(msg);
  }

  private async showMessageDialog(msg: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: msg,
          isYesNo: false,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });

      await modal.present();
    } catch (err) {
    }
  }


  removeVasuliData(index: number) {
    if (index > -1 && index < this.listOfVasuliViran.length) {
      this.listOfVasuliViran.splice(index, 1);
    }

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }


  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  getTotal(field: 'mavja_rashi' | 'mahsul_rashi' | 'total_rashi'): number {
    return this.listOfAlreadySubmittedVasuliDetail?.reduce((sum, item) => {
      const val = parseFloat(item[field]) || 0;
      return sum + val;
    }, 0) || 0;
  }

  calculateMahayogTotalRashi(row: any) {

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }

  }

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  async selectDate(item: any) {

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
        item.money_rasid_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }


  async selectBankChalanDate(item: any) {

    const modal = await this.modalCtrl.create({
      component: SelectActualCrimeDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {

        const date = new Date(this.sharedService.getSelectedActualCrimeDate());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        item.bank_chalan_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

}
