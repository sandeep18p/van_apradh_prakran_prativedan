import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { Toast } from '@capacitor/toast';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { ExtensionAwedanListResponseModal } from './ExtensionAwedanList.modal';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule
import { TableModule } from 'primeng/table'; // Import TableModule
import { NgIf } from '@angular/common';  // 👈 add this
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { ApproveExtensionReqestByRO } from 'src/app/dialogs/approve-extension-request-by-ro/approve-extension-request-by-ro.component';

@Component({
  selector: 'app-show-submited-request-to-extend-janch-awadhi',
  templateUrl: './show-submited-request-to-extend-janch-awadhi.component.html',
  styleUrls: ['./show-submited-request-to-extend-janch-awadhi.component.scss'],
  imports: [IonicModule, TableModule, NgIf, CommonModule, FormsModule],
  standalone: true
})
export class ShowSubmitedRequestToExtendJanchAwadhiComponent implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  loginedOfficerEmpId: number = 0;

  awedanList: ExtensionAwedanListResponseModal[] = [];

  constructor(
    private platform: Platform,
    private languageService: LanguageServiceService, private navController: NavController, private modalCtrl: ModalController, private sharedService: SharedserviceService, private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef
  ) {
    addIcons({ arrowBack })

  }

  isRA: Boolean = true;

  ngOnInit() {

    this.getLoginedOfficerData();

  }

  async getLoginedOfficerData() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;

      const state = history.state;
      this.isRA = state?.isRA ?? false;

      if (this.isRA) {
        this.getListOfData();
      } else {
        this.getListOfDataWhichIWillApprove();
      }

    }

  }

  async getListOfDataWhichIWillApprove() {

    this.awedanList = [];
    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getExtensionRequestListWhich_I_Will_Approve(this.loginedOfficerEmpId.toString()).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {

          this.awedanList = response.data;

        }

      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  async getListOfData() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getMyExtensionRequestList(this.loginedOfficerEmpId.toString()).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {

          this.awedanList = response.data;

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

  getAwedanStatus(status: string): string {
    if (status === "0") {
      return "लंबित";
    } else if (status === "1") {
      return "स्वीकृत";
    } else {
      return "अस्वीकृत";
    }

  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  goBack() {
    this.navController.back();
  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  async clickToApproveReject(item: ExtensionAwedanListResponseModal) {
    const modal = await this.modalCtrl.create({
      component: ApproveExtensionReqestByRO,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        totalDaysToExtendByRequester: item.days_to_extend,
        requester_name: item.requester_name,
        days_to_extend_by_requester: item.days_to_extend,
        request_table_id: item.request_table_id,
        complain_id: item.complain_id,
        updated_by: this.loginedOfficerEmpId,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.sharedService.setRefresh(true);
        this.getListOfDataWhichIWillApprove();
      }
    });

    await modal.present();
  }

}
