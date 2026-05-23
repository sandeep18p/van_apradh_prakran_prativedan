import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { App } from '@capacitor/app';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { Preferences } from '@capacitor/preferences';
import { Users } from '../login-officer/OfficerLoginResponse';

import { Router } from '@angular/router';

import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Toast } from '@capacitor/toast';
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
import { PushNotificationService } from 'src/app/services/push_notification/push-notification.service';

import { ModalController } from '@ionic/angular/standalone';

import { Platform } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { OfflineOnlineDialogComponent } from 'src/app/dialogs/offline-online-dialog/offline-online-dialog.component';
import { Capacitor } from '@capacitor/core';
import { UpdatePasswordDialogComponent } from 'src/app/dialogs/update-password-dialog/update-password-dialog.component';

@Component({
  selector: 'app-splash-page',
  templateUrl: './splash-page.page.html',
  styleUrls: ['./splash-page.page.scss'],
  standalone: true,

  imports: [IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SplashPagePage implements OnInit {

  languageData: any = {};
  isConnected: boolean = false;

  constructor(
    private modalController: ModalController,
    private platform: Platform, private networkCheckService: NetworkCheckService, private apiService: ApiServiceService, private router: Router, private languageService: LanguageServiceService,
    private pushService: PushNotificationService
  ) { }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  async ngOnInit() {

    //await Preferences.set({ key: 'ngrok_url', value: "https://forest.cg.gov.in/FOREST_COMPLAIN/api/ForestComplainMonitoringSystem/" });

    await Preferences.set({ key: 'ngrok_url', value: "https://localhost:7283/api/ForestComplainMonitoringSystem/" });

    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {

      this.goToNextPage();

      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        this.pushService.initPush();
      }

    } else {

      const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });
      if (value) {
        try {
          const modal = await this.modalController.create({
            component: OfflineOnlineDialogComponent,
            cssClass: 'custom-dialog-modal',
            backdropDismiss: false,
          });

          await modal.present();
        } catch (err) {
        }
      } else {
        this.longToast(this.getTranslation("no_internet"));
      }

    }

  }

  async getSampleData() {
    this.apiService.getSampleData().subscribe(
      async (response) => {
        alert(response);
      },
      (error) => {
        alert(error);
        this.shortToast(error);
      }
    )
  }

  async goToNextPage() {

    setTimeout(async () => {

      this.getAppDetails();

    }, 3000);

  }

  async showError(errorMsg: any) {

    let displayMsg = errorMsg;
    if (errorMsg instanceof Error) {
      displayMsg = errorMsg.message;
    } else if (typeof errorMsg === 'string' && errorMsg.startsWith('Error: ')) {
      displayMsg = errorMsg.substring(7);
    }

    try {
      const modal = await this.modalController.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: displayMsg,
          isYesNo: false,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });

      await modal.present();
    } catch (err) {
    }

  }

  async getAppDetails() {

    if (Capacitor.isNativePlatform()) {
      const info = await App.getInfo();
      let version = info.version;


      this.apiService.getAppDetails(version).subscribe(
        async (response) => {
          if (response.response.code === 200) {

            let appDetailData = response.data[0];

            if (this.platform.is('desktop')) {
              if (appDetailData.is_web_app_under_maintainance === "1") {
                this.showError(appDetailData.app_under_maintainance_msg);
              } else {
                const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

                if (value) {
                  const userData = JSON.parse(value) as Users;
                  this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                    userData.designation_id.toString(), userData.password);
                } else {
                  this.router.navigateByUrl('/home', { replaceUrl: true });
                }
              }
            } else {

              if (appDetailData.is_app_under_maintainance === "1") {
                this.showError(appDetailData.app_update_msg);
              } else {


                if (Capacitor.isNativePlatform()) {

                  const info = await App.getInfo();
                  let version = info.version;

                  if (info.version === appDetailData.android_app_version) {
                    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });


                    if (value) {

                      const userData = JSON.parse(value) as Users;

                      this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                        userData.designation_id.toString(), userData.password);


                    } else {
                      this.router.navigateByUrl('/home', { replaceUrl: true });
                    }
                  } else {
                    this.showError("कृपया एप्लीकेशन को अपडेट करिये | ");
                  }

                } else {
                  const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });


                  if (value) {

                    const userData = JSON.parse(value) as Users;

                    this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                      userData.designation_id.toString(), userData.password);


                  } else {
                    this.router.navigateByUrl('/home', { replaceUrl: true });
                  }
                }


              }
            }

          }

        },
        async (error) => {
          debugger;
          this.showError(error);
        }
      );




    } else {
      this.apiService.getAppDetails("").subscribe(
        async (response) => {
          if (response.response.code === 200) {

            let appDetailData = response.data[0];

            if (this.platform.is('desktop')) {
              if (appDetailData.is_web_app_under_maintainance === "1") {
                this.showError(appDetailData.app_under_maintainance_msg);
              } else {
                const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

                if (value) {
                  const userData = JSON.parse(value) as Users;
                  this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                    userData.designation_id.toString(), userData.password);
                } else {
                  this.router.navigateByUrl('/home', { replaceUrl: true });
                }
              }
            } else {

              if (appDetailData.is_app_under_maintainance === "1") {
                this.showError(appDetailData.app_update_msg);
              } else {


                if (Capacitor.isNativePlatform()) {

                  const info = await App.getInfo();
                  let version = info.version;

                  if (info.version === appDetailData.android_app_version) {
                    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });


                    if (value) {

                      const userData = JSON.parse(value) as Users;

                      this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                        userData.designation_id.toString(), userData.password);


                    } else {
                      this.router.navigateByUrl('/home', { replaceUrl: true });
                    }
                  } else {
                    this.showError("कृपया एप्लीकेशन को अपडेट करिये | ");
                  }

                } else {
                  const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });


                  if (value) {

                    const userData = JSON.parse(value) as Users;

                    this.checkUserUniqueDeviceId(userData.emp_id.toString(), userData.unique_device_id,
                      userData.designation_id.toString(), userData.password);


                  } else {
                    this.router.navigateByUrl('/home', { replaceUrl: true });
                  }
                }


              }
            }

          }

        },
        async (error) => {
          debugger;
          this.showError(error);
        }
      );
    }

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

          debugger;
          const password = result.data.newPassword;

          console.log("Received Password:", password);

          this.updatePasswordIntoServer(password);
        }
      });
      await modal.present();

    } catch (err) {
    }

  }


  // async goToLoginIntoServer(password: string) {

  //   const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

  //   if (value) {

  //     const userData = JSON.parse(value) as Users;

  //     this.showDialog("कृपया प्रतीक्षा करें.....");

  //     debugger;
  //     this.apiService.login(userData.user_name, password, "", userData.mobile_number.toString()).subscribe(
  //       async (response) => {

  //         await this.dismissDialog();

  //         if (response.response.code === 200) {

  //           await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(response.data[0]) });
  //           await Preferences.set({ key: PreferenceKeys.crimType_master, value: JSON.stringify(response.crimType) });
  //           await Preferences.set({ key: PreferenceKeys.cast_master, value: JSON.stringify(response.cast) });
  //           await Preferences.set({ key: PreferenceKeys.prajati_name, value: JSON.stringify(response.prajati_name) });
  //           await Preferences.set({ key: PreferenceKeys.dhara_data, value: JSON.stringify(response.dhara_data) });
  //           await Preferences.set({ key: PreferenceKeys.beat_master, value: JSON.stringify(response.beat) });

  //           const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

  //           if (value) {

  //             const userData = JSON.parse(value) as Users;

  //             debugger;

  //             if (userData.designation_id === "7") {
  //               this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
  //             } else {
  //               this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
  //             }

  //           } else {
  //             this.shortToast("Problem to retrive value from preference");
  //           }

  //         } else {

  //           this.showError(response.response.msg);

  //         }

  //       },
  //       async (error) => {
  //         await this.dismissDialog();
  //         this.shortToast(error);
  //       }
  //     );

  //   }

  // }


  async updatePasswordIntoServer(password: string) {

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const userData = JSON.parse(value) as Users;

      this.showDialog("कृपया प्रतीक्षा करें.....");

      this.apiService.updatePasswordByEmployee(userData.emp_id.toString(), password).subscribe(
        async (response) => {

          await this.dismissDialog();

          if (response.response.code === 200) {

            //this.goToLoginIntoServer(password);

            if (userData.designation_id === "7") {
              this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
            } else {
              this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
            }

          } else {

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

  isLoading: boolean = false;
  loadingMessage: string = ""

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
  }

  dismissDialog() {
    this.isLoading = false;
  }

  checkUserUniqueDeviceId(empId: string, unique_device_id: string, designation_id: string, password: string) {
    let uniqueId = "";
    if (unique_device_id !== undefined && unique_device_id !== null && unique_device_id !== '') {
      uniqueId = unique_device_id.toString();
    }
    this.apiService.checkUniqueDeviceId(
      empId,
      uniqueId
    ).subscribe(
      async (response) => {

        if (response.response.code === 200) {

          // if (password === "123456") {
          //   this.updatePassword();
          // } else {
          //   if (designation_id === "7") {
          //     this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
          //   } else {
          //     this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
          //   }
          // }

          if (designation_id === "7") {
            this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
          } else {
            this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
          }

        } else {

          const { value } = await Preferences.get({ key: PreferenceKeys.firebase_token });

          if (value) {
            let firebaseToken = value;
            await Preferences.clear();
            await Preferences.set({ key: PreferenceKeys.firebase_token, value: firebaseToken });
          }

          await Preferences.clear();

          this.showError(response.response.msg)
        }

      },
      async (error) => {
        this.showError(error);
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

}
