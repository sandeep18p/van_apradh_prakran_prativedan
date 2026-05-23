import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonItem, IonText, IonIcon, IonCardContent, IonLoading, IonButton, IonInput, IonRow, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonCol, IonCard, IonLabel } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse'; 
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';

import { NgSelectModule } from '@ng-select/ng-select';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { addIcons } from 'ionicons';
import { personCircleOutline, informationCircleOutline, businessOutline, locationOutline, mapOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { SubmitProfileRequestModel } from './SubmitProfilRequestModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-setup',
  templateUrl: './profile-setup.page.html',
  styleUrls: ['./profile-setup.page.scss'],
  standalone: true,
  imports: [IonItem, IonText, IonIcon, IonCardContent, IonLoading, IonButton, IonInput, NgSelectModule, IonRow, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCard, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonCol]
})
export class ProfileSetupPage implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = ""

  officerInfo: string = "";

  listOfCircle: any = [];
  listOfDivision: any = [];
  listOfSubDivision: any = [];
  listOfRang: any = [];
  listOfBit: any = [];

  selectedCircleId: string = "";
  selectedDivisionId: string = "";
  selectedSubDivisionId: string = "";
  selectedRangId: string = "";
  selectedBitId: string = "";

  shouldShowCircle: boolean = true;
  shouldShowDivision: boolean = true;
  shouldShowSubDivision: boolean = true;
  shouldShowRang: boolean = true;
  shouldShowBit: boolean = true;

  constructor(private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef, private languageService: LanguageServiceService) {
    addIcons({ personCircleOutline, informationCircleOutline, businessOutline, locationOutline, mapOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.setOfficerInfo();
  }

  addAllIcon() {
    addIcons({
      personCircleOutline
    });
  }

  loginedOfficerId: number = 0;

  async setOfficerInfo() {

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const userData = JSON.parse(value) as Users;

      this.loginedOfficerId = userData.emp_id

      this.officerInfo = userData.f_name + " " + userData.l_name + " (" + userData.designation_name + ")";

      if (userData.designation_id === "1") {
        this.shouldShowDivision = false;
        this.shouldShowSubDivision = false;
        this.shouldShowRang = false;
        this.shouldShowBit = false;
      } else if (userData.designation_id === "2") {
        this.shouldShowSubDivision = false;
        this.shouldShowRang = false;
        this.shouldShowBit = false;
      } else if (userData.designation_id === "3") {
        this.shouldShowRang = false;
        this.shouldShowBit = false;
      } else if (userData.designation_id === "4") {
        this.shouldShowBit = false;
      }


    }

    this.getCircleFromServer();

  }

  getCircleFromServer() {

    this.showDialog("कृपया प्रतीक्षा करें.....");

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

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  onSelectionChangeOfCircle(event: any) {

    if (!this.shouldShowDivision) {
      return;
    }

    this.listOfDivision = [];
    this.selectedDivisionId = '';
     this.listOfSubDivision = [];
    this.selectedSubDivisionId = '';
    this.listOfRang = [];
    this.selectedRangId = '';
    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDivision(this.selectedCircleId).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

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

  onSelectionChangeOfDivision(event: any) {

    if (!this.shouldShowSubDivision) {
      return;
    }

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = '';

    this.listOfRang = [];
    this.selectedRangId = '';
    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getSubDivision(this.selectedDivisionId).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

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

    // if (!this.shouldShowRang) {
    //   return;
    // }

    // this.listOfRang = [];
    // this.selectedRangId = '';
    // this.listOfBit = [];
    // this.selectedBitId = '';

    // this.showDialog("कृपया प्रतीक्षा करें.....");

    // this.apiService.getRang(this.selectedDivisionId).subscribe(
    //   async (response) => {

    //     await this.dismissDialog();

    //     //this.cdRef.detectChanges;

    //     if (response.response.code === 200) {

    //       this.listOfRang = response.data;

    //     }

    //   },
    //   async (error) => {
    //     this.cdRef.detectChanges;
    //     await this.dismissDialog();
    //     this.shortToast(error);
    //   }
    // );

  }

  onSelectionChangeOfSubDivision(event: any) {

    if (!this.shouldShowRang) {
      return;
    }

    this.listOfRang = [];
    this.selectedRangId = '';
    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getRang(this.selectedSubDivisionId).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

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

  onSelectionChangeOfRang(event: any) {

    if (!this.shouldShowBit) {
      return;
    }

    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getBeat(this.selectedRangId).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

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


  cancel() {
    App.exitApp();
  }


  submitProfileDetail() {

    if (this.shouldShowCircle && this.selectedCircleId === "") {
      this.shortToast("वृत्त का नाम चुनें");
      return;
    }

    if (this.shouldShowDivision && this.selectedDivisionId === "") {
      this.shortToast("वनमण्डल का नाम चुनें");
      return;
    }

    if (this.shouldShowSubDivision && this.selectedSubDivisionId === "") {
      this.shortToast("उप वनमण्डल का नाम चुनें");
      return;
    }

    if (this.shouldShowRang && this.selectedRangId === "") {
      this.shortToast("परिक्षेत्र का नाम चुनें");
      return;
    }

    if (this.shouldShowBit && this.selectedBitId === "") {
      this.shortToast("बिट का नाम चुनें");
      return;
    }

    const submitProfileData: SubmitProfileRequestModel = {
      empId: this.loginedOfficerId.toString(),           // e.g., 'EMP123'
      circleId: this.selectedCircleId,     // e.g., 'CIR001'
      divisionId: this.selectedDivisionId, // e.g., 'DIV001'
      subDivisionId: this.selectedSubDivisionId,// e.g., 'SUBDIV002'
      rangId: this.selectedRangId,        // e.g., 'RANG005'
      beatId: this.selectedBitId          // e.g., 'BEAT009'
    };

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.submitProfilData(submitProfileData).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.shortToast(response.response.msg);

          // After successfully verified, we need to update is_self_verified value from 0 to 1 //
          const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });
          if (value) {
            const userData = JSON.parse(value) as Users;
            userData.is_self_verified = 1;
            await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(userData) });

            this.router.navigateByUrl('/splash-page', { replaceUrl: true });

          }

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
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


}
