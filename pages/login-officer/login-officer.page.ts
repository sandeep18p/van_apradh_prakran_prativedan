import { Component, OnInit, ChangeDetectorRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonLoading, IonGrid, IonRow, IonLabel, IonButton, IonText, IonContent, IonHeader, IonTitle, IonToolbar, IonCol } from '@ionic/angular/standalone';

import { ModalController } from '@ionic/angular/standalone';
import { Toast } from '@capacitor/toast';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { Preferences } from '@capacitor/preferences';
import { Users } from './OfficerLoginResponse';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { AlertController, Platform } from '@ionic/angular';
import { UpdatePasswordDialogComponent } from 'src/app/dialogs/update-password-dialog/update-password-dialog.component';
import { boat } from 'ionicons/icons';
import { GetUserNameListResponseModel } from '../profile-setup/GetMasterResponse';




@Component({
  selector: 'app-login-officer',
  templateUrl: './login-officer.page.html',
  styleUrls: ['./login-officer.page.scss'],
  standalone: true,
  imports: [IonCol, IonInput, IonLoading, IonGrid, IonRow, IonLabel, IonButton, IonText, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, NgSelectModule]
})
export class LoginOfficerPage implements OnInit {

  constructor(private platform: Platform, private alert: AlertController, private modalController: ModalController, private router: Router, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService) { }

  async ngOnInit() {

    const { value } = await Preferences.get({ key: PreferenceKeys.firebase_token });
    if (value) {
      this.firebaseToken = value;
    }

    this.getCircle();

  }

  isNotValidPassword: boolean = false;
  isNotValidLogin: boolean = false;
  isNotValidMobile: boolean = false;
  isNotValidUserName: boolean = false;

  isLoading: boolean = false;
  loadingMessage: string = ""

  error_msg_from_server_if_not_login: string = "";

  error_password_msg: string = ""
  error_mobile_msg: string = "";
  error_user_msg: string = "";

  enterUserName: string = "";
  enterMobileNumber: string = "";
  enterPassword: string = "";

  showMobileNumberBox: boolean = false;

  mobileLength: number = 0;

  checkLength() {
    this.mobileLength = this.enterMobileNumber.length;
  }

  clickToLogin() {

    if (this.selectedDesignation === null) {
      this.showError("कृपया पद चुनें");
      return;
    }



    if (this.selectedUsername == null) {
      this.isNotValidUserName = true;
      this.error_user_msg = "कृपया यूजरनाम प्रविष्ट करें";
      this.shortToast("कृपया यूजरनाम प्रविष्ट करें");
      return;
    }

    if (this.enterPassword == "") {
      this.isNotValidPassword = true;
      this.isNotValidUserName = false;
      this.error_password_msg = "कृपया पासवर्ड प्रविष्ट करें";
      this.shortToast("कृपया पासवर्ड प्रविष्ट करें");
      return;
    }

    if (this.enterMobileNumber == "" && this.showMobileNumberBox) {
      this.isNotValidMobile = true;
      this.isNotValidUserName = false;
      this.isNotValidPassword = false;
      this.error_mobile_msg = "कृपया रजिस्टर्ड मोबाइल नंबर प्रविष्ट करें";
      this.shortToast("कृपया रजिस्टर्ड मोबाइल नंबर प्रविष्ट करें");
      return;
    }

    if (this.mobileLength != 10 && this.showMobileNumberBox) {
      this.isNotValidMobile = true;
      this.isNotValidUserName = false;
      this.isNotValidPassword = false;
      this.error_mobile_msg = "कृपया सही मोबाइल नंबर प्रविष्ट करें";
      this.shortToast("कृपया सही मोबाइल नंबर प्रविष्ट करें");
      return;
    }

    this.isNotValidUserName = false;
    this.isNotValidPassword = false;
    this.isNotValidMobile = false;

    this.goToLoginIntoServer();

  }

  firebaseToken: string = "";

  goToLoginIntoServer() {

    this.isNotValidLogin = false;
    this.error_msg_from_server_if_not_login = "";

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.login(this.selectedUsername, this.enterPassword, this.firebaseToken, this.enterMobileNumber).subscribe(
      async (response) => {
        this.cdRef.detectChanges;

        await this.dismissDialog();

        if (response.response.code === 200) {

          await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(response.data[0]) });

          await Preferences.set({ key: PreferenceKeys.crimType_master, value: JSON.stringify(response.crimType) });
          await Preferences.set({ key: PreferenceKeys.cast_master, value: JSON.stringify(response.cast) });
          await Preferences.set({ key: PreferenceKeys.prajati_name, value: JSON.stringify(response.prajati_name) });
          await Preferences.set({ key: PreferenceKeys.dhara_data, value: JSON.stringify(response.dhara_data) });
          await Preferences.set({ key: PreferenceKeys.beat_master, value: JSON.stringify(response.beat) });

          const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

          if (value) {

            const userData = JSON.parse(value) as Users;


            if (userData.password === "123456") {
              this.updatePassword();
            } else {
              if (userData.designation_id === "7") {
                this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
              } else {
                this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
              }
            }

          } else {
            this.shortToast("Problem to retrive value from preference");
          }

        } else {

          this.cdRef.detectChanges;
          this.isNotValidLogin = true;
          this.showError(response.response.msg);

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  async updatePassword() {

    try {
      const modal = await this.modalController.create({
        component: UpdatePasswordDialogComponent,
        cssClass: 'center-dialog',
        backdropDismiss: false,
      });

      modal.onDidDismiss().then(async (result) => {
        if (result.data?.confirmed) {


          const password = result.data.newPassword;

          console.log("Received Password:", password);

          this.updatePasswordIntoServer(password);
        }
      });
      await modal.present();

    } catch (err) {
    }

  }

  async updatePasswordIntoServer(password: string) {

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const userData = JSON.parse(value) as Users;

      this.showDialog("कृपया प्रतीक्षा करें.....");

      this.apiService.updatePasswordByEmployee(userData.emp_id.toString(), password).subscribe(
        async (response) => {
          this.cdRef.detectChanges;

          await this.dismissDialog();

          if (response.response.code === 200) {

            debugger;
            userData.password = password;

            await Preferences.set({
              key: PreferenceKeys.loginedOfficerData,
              value: JSON.stringify(userData)
            });


            if (userData.designation_id === "7") {
              this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
            } else {
              this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
            }

          } else {

            this.cdRef.detectChanges;
            this.isNotValidLogin = true;
            this.showError(response.response.msg);

          }

        },
        async (error) => {
          await this.dismissDialog();
          this.shortToast(error);
        }
      );

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

  listOfDesignation = [
    {
      "id": "7", "name": "APCCF"
    },
    {
      "id": "1", "name": "CCF"
    },
    {
      "id": "2", "name": "DFO"
    },
    {
      "id": "3", "name": "SDO"
    },
    {
      "id": "4", "name": "RO"
    },
    {
      "id": "5", "name": "RA"
    },
    {
      "id": "6", "name": "BFO"
    },
    {
      "id": "8", "name": "Special Duty"
    },
  ];

  selectedDesignation: string | null = null;

  onSelectionDesignation() {
    if (this.selectedDesignation === "7") {
      this.showMobileNumberBox = false;
    } else {
      this.showMobileNumberBox = true;
    }

    this.showDropDownAccordingToDesignation();

  }

  listOfCircle: any = [];
  listOfDivision: any = [];
  listOfSubDivision: any = [];
  listOfRang: any = [];
  listOfSubRang: any = [];
  listOfBit: any = [];

  selectedCircleId: any = null;
  selectedDivisionId: any = null;
  selectedSubDivisionId: any = null;
  selectedRangId: any = null;
  selectedSubRangId: any = null;
  selectedBitId: any = null;

  onChangeCircle(selected: any) {

    this.listofUserName = [];
    this.selectedCircleId = selected.id;

    if (!this.showDivision) {
      this.getUserNameList();
      return;
    }

    this.listOfDivision = [];
    this.selectedDivisionId = null;

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDivision(this.selectedCircleId).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfDivision = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  onChangeDivision(selected: any) {
    this.listofUserName = [];
    this.selectedDivisionId = selected.id;

    if (!this.showSubDivision) {
      this.getUserNameList();
      return;
    }

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getSubDivision(this.selectedDivisionId).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfSubDivision = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  onChangeSubDivision(selected: any) {
    this.listofUserName = [];
    this.selectedSubDivisionId = selected.id;

    if (!this.showRang) {
      this.getUserNameList();
      return;
    }

    this.listOfRang = [];
    this.selectedRangId = null;
    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getRang(this.selectedSubDivisionId).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfRang = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  onChangeRange(selected: any) {
    this.selectedRangId = selected.id;
    this.listofUserName = [];
    if (!this.showSubRang) {
      this.getUserNameList();
      return;
    }

    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSubRang(this.selectedRangId).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfSubRang = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  onChangeSubRange(selected: any) {
    this.listofUserName = [];
    this.selectedSubRangId = selected.id;

    if (!this.showBeat) {
      this.getUserNameList();
      return;
    }

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getBeat(this.selectedSubRangId).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfBit = response.data;

        }

      },
      async (error) => {

        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  onChangeBit(selected: any) {
    this.listofUserName = [];
    this.selectedBitId = selected.id;

    this.getUserNameList();

  }

  getCircle() {

    this.listofUserName = [];
    this.listOfCircle = [];
    this.selectedCircleId = null;

    this.listOfDivision = [];
    this.selectedDivisionId = null;

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getCircles().subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.listOfCircle = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );

  }

  showCircle = false; showDivision = false;
  showSubDivision = false; showRang = false;
  showSubRang = false; showBeat = false;

  showDropDownAccordingToDesignation() {
    this.listofUserName = [];
    this.selectedUsername = null;

    this.showCircle = false; this.showDivision = false;
    this.showSubDivision = false; this.showRang = false;
    this.showSubRang = false; this.showBeat = false;
    if (this.selectedDesignation === "6"
    ) {
      this.showCircle = true;
      this.showDivision = true;
      this.showSubDivision = true;
      this.showRang = true;
      this.showSubRang = true;
      this.showBeat = true;
    } else if (this.selectedDesignation === "5" || this.selectedDesignation === "8"
    ) {
      this.showCircle = true;
      this.showDivision = true;
      this.showSubDivision = true;
      this.showRang = true;
      this.showSubRang = true;
    } else if (this.selectedDesignation === "4"
    ) {
      this.showCircle = true;
      this.showDivision = true;
      this.showSubDivision = true;
      this.showRang = true;
    } else if (this.selectedDesignation === "3"
    ) {
      this.showCircle = true;
      this.showDivision = true;
      this.showSubDivision = true;
    } else if (this.selectedDesignation === "2"
    ) {
      this.showCircle = true;
      this.showDivision = true;
    } else if (this.selectedDesignation === "1"
    ) {
      this.showCircle = true;
    } else if (this.selectedDesignation === "7") {
      this.getUserNameList();
    }

  }

  listofUserName: GetUserNameListResponseModel[] = [];

  selectedUsername: any = null;

  getUserNameList() {
    this.selectedUsername = null;
    this.listofUserName = [];
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getUserNameList(this.selectedDesignation || "",
      this.selectedCircleId || "", this.selectedDivisionId || "",
      this.selectedSubDivisionId || "", this.selectedRangId || "", this.selectedSubRangId || "", this.selectedBitId || ""
    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listofUserName = response.data;

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

}
