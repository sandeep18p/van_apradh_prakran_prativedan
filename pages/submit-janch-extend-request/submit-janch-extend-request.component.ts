import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule, NgModel } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { addCircleOutline, arrowBack, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, micCircleOutline, peopleOutline, trashOutline } from 'ionicons/icons';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { Toast } from '@capacitor/toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { Router } from '@angular/router';
import { AccusedPersonDetail, ComplainDetails, JaptSamanItem } from '../officer-dashboard/GetDashboardResponse.model';

import { TableModule } from 'primeng/table'; // Import TableModule
import { userInfo } from 'os';

@Component({
  selector: 'app-submit-janch-extend-request',
  templateUrl: './submit-janch-extend-request.component.html',
  styleUrls: ['./submit-janch-extend-request.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
})
export class SubmitJanchExtendRequestComponent implements OnInit {

  user_id: number = 0

  constructor(private languageService: LanguageServiceService, private navController: NavController,
    private router: Router, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalController: ModalController
  ) {

    addIcons({ peopleOutline, calendarOutline, addCircleOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, cameraOutline, closeCircle, micCircleOutline })

  }

  totalDaysToExtend: number | null = null;

  validateDays() {
    // Only validate if there's a value
    if (this.totalDaysToExtend == null) return;

    // Prevent 0 and negative numbers
    if (this.totalDaysToExtend < 1) {
      this.totalDaysToExtend = 1;
    }

    // Prevent exceeding 30
    if (this.totalDaysToExtend > 30) {
      this.totalDaysToExtend = 30;
    }
  }

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  toolbarTitle: string = "";
  por_number: string = "";

  comingComplaintData!: ComplainDetails;

  async ngOnInit() {

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;

      this.getOldRequestCountDetail();

    }
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.user_id = userData.emp_id;
    }

  }

  approverName: string = "";
  approverId: string = "";

  getOldRequestCountDetail() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getPreviourExtenstionRequestOfOneComplain(this.comingComplaintData.complain_id).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          let responseModal = response.data[0];

          if (responseModal.pending_request_id != "") {
            this.previousePORExtensionRequestMoreThanThreeTimes("पहले दिया गया आवेदन अभी लंबित स्थिति पे है | कृपया उस आवेदन के स्वीकृत या अस्वीकृत होने के बाद ही आप आवेदन कर पाओगे | ", true);
            return;
          }

          if (Number(responseModal.previous_request_count) >= 3) {
            this.previousePORExtensionRequestMoreThanThreeTimes("जाँच समयवृद्धि हेतु पहले ही 3 बार आवेदन दिया जा चुका है | अधिकतम 3 बार ही आवेदन किया जा सकता है | ", true);
            return;
          }

          this.approverName = responseModal.approver_name;
          this.approverId = responseModal.approver_id;

        }

      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  async previousePORExtensionRequestMoreThanThreeTimes(msg: string, isGoBack: boolean) {

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        if (isGoBack) {
          this.goBack();
        }

      }
    });

    await modal.present();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  goBack() {
    this.navController.back();
  }

  submitOnServer() {

    if (this.totalDaysToExtend === null) {
      this.showError("कृपया जाँच हेतु आवश्यक दिनों की संख्या लिखे |");
      return;
    }

    if (Number(this.totalDaysToExtend) <= 0 || Number(this.totalDaysToExtend) > 30) {
      this.showError("जाँच हेतु आवश्यक दिनों की संख्या 0 दिनों से कम और 30 दिनों से ज्यादा नहीं हो सकती |");
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.submitExtensionRequest(this.comingComplaintData.complain_id,
      this.user_id.toString(), this.approverId, this.totalDaysToExtend.toString()
    ).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          this.previousePORExtensionRequestMoreThanThreeTimes(response.response.msg, true);
        } else {
          this.showError(response.response.msg);
        }

      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  async showError(errorMsg: string) {

    try {
      const modal = await this.modalController.create({
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


  cancel() {
    this.navController.back();
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

}