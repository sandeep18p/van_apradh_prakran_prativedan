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
import { addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { SelecMonthYearDialogComponent } from 'src/app/dialogs/select-month-year-dialog/select-month-year-dialog.component';

@Component({
  selector: 'app-submit-dr-entry-page',
  templateUrl: './submit-dr-entry-page.component.html',
  styleUrls: ['./submit-dr-entry-page.component.scss'],
  standalone: true,
  imports: [IonicModule, TableModule, NgIf, CommonModule, FormsModule]
})
export class SubmitDrEntryPageComponent implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  loginedOfficerEmpId: number = 0;

  por_number: string = "";
  complain_id: string = "";

  toolbarTitle: string = "";

  isSubmitAvailable: boolean = false;

  constructor(private languageService: LanguageServiceService, private navController: NavController, private modalCtrl: ModalController, private sharedService: SharedserviceService, private platform: Platform, private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef) {

    addIcons({ addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline });

  }

  ngOnInit() {

    this.getLoginedOfficerData();

    const stateData = history.state;

    this.por_number = stateData.por_number;
    this.complain_id = stateData.complain_id;

    this.toolbarTitle = this.por_number;

    this.getWorkLog();


  }

  async getLoginedOfficerData() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;
    }

  }


  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getRAWorkLogList(this.complain_id).subscribe(
      (response) => {
         ;
        this.dismissDialog();
        if (response.response.code === 200) {
          this.listOfVasuliViran = response.vasuli_detail;
           ;
          for (let i = 0; i < this.listOfVasuliViran.length; i++) {
            let singleValue = this.listOfVasuliViran[i];
            if (singleValue.is_editable === "1") {
              this.isSubmitAvailable = true;
              break;
            } else {
              this.isSubmitAvailable = false;
            }
          }

          this.calculateTotalRashi();

        }

      },
      (error) => {
        this.dismissDialog();
      }
    );

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

  totalVasulRashi: number = 0;

  submitDRDetail() {

    let listOfVasuliViranToSendDR: VasuliViranDetailRequestModal[] = [];
    let isThereAnyDataPendingToEnterDR = false;
    let isAllDataFilled = true;

    for (let i = 0; i < this.listOfVasuliViran.length; i++) {

      let singleValue = this.listOfVasuliViran[i];

      singleValue.updated_by = this.loginedOfficerEmpId.toString();

      if (singleValue.is_editable === "1") {

        isAllDataFilled = false;

        if ((singleValue.dr_number != "" && singleValue.month_year === "")
          || (singleValue.dr_number === "" && singleValue.month_year != "")) {
          isThereAnyDataPendingToEnterDR = true;
          break;
        }

        if (singleValue.dr_number != "" && singleValue.month_year != "") {
          listOfVasuliViranToSendDR.push(singleValue);
        }

      }

    }

    if (listOfVasuliViranToSendDR.length === 0) {
      this.showError("कृपया कोई DR नंबर और Month - Year प्रेषित करें");
      return;
    }

    if (isAllDataFilled) {
      this.showError("सभी जानकारी पहले ही भरी जा चुकी है");
      return;
    }

    if (isThereAnyDataPendingToEnterDR) {
      this.showError("कृपया DR नंबर और माह-वर्ष प्रेषित करें");
      return;
    }

    let valusi_data = JSON.stringify(listOfVasuliViranToSendDR);
     ;
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.cdRef.detectChanges();

    this.apiService.submitDrInfo(
      valusi_data
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {
           ;
          this.cdRef.detectChanges();
          this.sharedService.setRefresh(true);
          this.getWorkLog()

        } else {
          this.showError(response.response.msg)
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

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }


  async selectMonthYear(item: any) {

    if (item.is_editable === '0') {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: SelecMonthYearDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
         ;
        item.month_year = this.sharedService.getSelectedCrimeDate();
      }

    });

    await modal.present();

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

  calculateTotalRashi() {

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }

  }

}
