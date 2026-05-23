import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import { NavController } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Users } from '../login-officer/OfficerLoginResponse';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Router } from '@angular/router';
import { ComplainDetails } from '../officer-dashboard/GetDashboardResponse.model';
import { Toast } from '@capacitor/toast';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { GetComplainHistoryResponse, GetComplainHistoryResponseModal } from './GetComplainHistoryResponse.modal';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { arrowBack, timeOutline } from 'ionicons/icons';
import { PreviouseExtensionResponse } from '../submit-janch-extend-request/PreviouseExtensionReponse.modal';
import { ExtensionAwedanListResponseModal } from '../show-submited-request-to-extend-janch-awadhi/ExtensionAwedanList.modal';

@Component({
  selector: 'app-complain-life-history',
  templateUrl: './complain-life-history.page.html',
  styleUrls: ['./complain-life-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ComplainLifeHistoryPage implements OnInit {

  constructor(private languageService: LanguageServiceService, private navController: NavController, private apiService: ApiServiceService, private router: Router, private cdRef: ChangeDetectorRef) {
    addIcons({ arrowBack, timeOutline });
  }

  comingComplaintData!: ComplainDetails;

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  listOfHistory: GetComplainHistoryResponseModal[] = [];
  listOfExtension: ExtensionAwedanListResponseModal[] = [];

  async ngOnInit() {

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;

    }

    this.getLoginedOfficerDetail();

  }

  showWorkLog() {

    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/ra-work-log-list', {
      state: { data: jsonData, is_coming_for_log_entry: false },
      replaceUrl: false
    });
  }

  isRA(designation_id: string): boolean {
    if (designation_id === "6") {
      return true;
    }
    return false;
  }

  getComplainCompleteHistory() {

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getOnComplainFullHistory(
      this.loginedOffierEmpId,
      this.comingComplaintData.complain_id
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.listOfHistory = response.data;
          this.listOfExtension = response.extension_history;

        } else {
          this.longToast(response.response.msg)
        }

      },
      async (error) => {
        //await this.dismissLoading();
        this.shortToast(error);
        //this.apiService.showServerMessages(error)
      }
    );

  }

  showShowExtension(): boolean {
    return Number(this.comingComplaintData?.complain_progress_stage) > 1;
  }

  loginedOffierEmpId: number = 0;

  async getLoginedOfficerDetail() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOffierEmpId = userData.emp_id;

      this.getComplainCompleteHistory();

    }
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

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  generatePDF() {

  }

  getAwedanStatus(status: string): string {
    if (status === "0") {
      return "लंबित";
    } else if (status === "1") {
      return "स्वीकृत";
    } else {
      return "अस्वीकृत";
    }

  }

}