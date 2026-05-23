import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonItem, IonText, IonIcon, IonCardContent, IonLoading, IonButton, IonInput, IonRow, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonCol, IonCard, IonLabel, IonButtons, NavController, ModalController } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';

import { TableModule } from 'primeng/table'; // Import TableModule

import { NgSelectModule } from '@ng-select/ng-select';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { addIcons } from 'ionicons';
import { personCircleOutline, informationCircleOutline, businessOutline, locationOutline, mapOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, createOutline } from 'ionicons/icons';
import { SubmitProfileRequestModel } from './SubmitProfilRequestModel';
import { Router } from '@angular/router';
import { GetEmployeeListResponseModal } from '../officer-dashboard/GetEmployeeListResponse.model';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
  standalone: true,
  imports: [IonItem, IonText, IonIcon, IonCardContent, IonLoading, IonButton, IonInput, NgSelectModule, IonRow, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCard, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonCol, IonButtons, TableModule]
})
export class EmployeeListPage implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = ""

  officerInfo: string = "";

  listOfCircle: any = [];
  listOfDivision: any = [];
  listOfSubDivision: any = [];
  listOfRang: any = [];
  listOfSubRang: any = [];
  listOfBit: any = [];

  selectedCircleId: string = "";
  selectedDivisionId: string = "";
  selectedSubDivisionId: string = "";
  selectedRangId: string = "";
  selectedSubRangId: string = "";
  selectedBitId: string = "";

  shouldShowCircle: boolean = true;
  shouldShowDivision: boolean = true;
  shouldShowSubDivision: boolean = true;
  shouldShowRang: boolean = true;
  shouldShowBit: boolean = true;

  constructor(private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef, private languageService: LanguageServiceService, private navController: NavController, private modalController: ModalController) {
    addIcons({ personCircleOutline, informationCircleOutline, businessOutline, locationOutline, mapOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, createOutline });
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
  loginedOfficerDesignationId: string = "";



  async setOfficerInfo() {

     ;
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const userData = JSON.parse(value) as Users;

      this.loginedOfficerId = userData.emp_id;
      this.loginedOfficerDesignationId = userData.designation_id;

      this.officerInfo = userData.f_name + " " + userData.l_name + " (" + userData.designation_name + ")";

      if (userData.designation_id === "1") {

        this.selectedCircleId = userData.circle_id;
        this.shouldShowDivision = false;
        this.shouldShowSubDivision = false;
        this.shouldShowRang = false;
        this.shouldShowBit = false;
        this.getDivision();

      } else if (userData.designation_id === "2") {

        this.selectedDivisionId = userData.division_id;
        this.getSubDivision();

      } else if (userData.designation_id === "3") {

        this.selectedSubDivisionId = userData.sub_division_id;
        this.getRang();

      } else if (userData.designation_id === "4") {

         ;
        this.selectedRangId = userData.range_id;
        this.getSubRang();

      }

      this.getListOfEmployee();


    }

  }

  getTranslation() {
    // ;
    if (this.loginedOfficerDesignationId === "7") {
      return this.languageService.getTranslation('circle_emp_list');
    } else if (this.loginedOfficerDesignationId === "1") {
      return this.languageService.getTranslation('circle_emp_list');
    } else if (this.loginedOfficerDesignationId === "2") {
      return this.languageService.getTranslation('division_emp_list');
    } else if (this.loginedOfficerDesignationId === "4") {
      return this.languageService.getTranslation('range_emp_list');
    } else {
      return '';
    }

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

  onSelectionChangeOfSubRang(event: any) {

    if (!this.shouldShowBit) {
      return;
    }

    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getBeat(this.selectedSubRangId).subscribe(
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



  onSelectionChangeOfRang(event: any) {

    if (!this.shouldShowBit) {
      return;
    }

    this.listOfSubRang = [];
    this.selectedSubRangId = '';

    this.listOfBit = [];
    this.selectedBitId = '';

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getSubRang(this.selectedRangId).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

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


  cancel() {
    this.navController.back();
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

  getDivision() {

    this.listOfDivision = [];
    this.selectedDivisionId = "";
    this.listOfSubDivision = [];
    this.selectedSubDivisionId = "";
    this.listOfRang = [];
    this.selectedRangId = "";
    this.listOfSubRang = [];
    this.selectedSubRangId = "";
    this.listOfBit = [];
    this.selectedBitId = "";
     ;
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getDivision(this.selectedCircleId.toString()).subscribe(
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


  getSubDivision() {

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = "";
    this.listOfRang = [];
    this.selectedRangId = "";
    this.listOfSubRang = [];
    this.selectedSubRangId = "";
    this.listOfBit = [];
    this.selectedBitId = "";

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSubDivision(this.selectedDivisionId).subscribe(
      async (response) => {

        await this.dismissDialog();

        this.cdRef.detectChanges;

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


  getRang() {

    this.listOfRang = [];
    this.selectedRangId = "";
    this.listOfSubRang = [];
    this.selectedSubRangId = "";
    this.listOfBit = [];
    this.selectedBitId = "";

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

  getSubRang() {

    this.listOfSubRang = [];
    this.selectedSubRangId = "";
    this.listOfBit = [];
    this.selectedBitId = "";

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

  listOfEmployee: GetEmployeeListResponseModal[] = [];

  getListOfEmployee() {

     ;
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getEmployeeList(
      this.loginedOfficerDesignationId.toString(),
      this.loginedOfficerId.toString(),
      this.selectedCircleId,
      this.selectedDivisionId,
      this.selectedSubDivisionId,
      this.selectedRangId,
      this.selectedSubRangId,
      this.selectedBitId
    ).subscribe(
      async (response) => {

        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfEmployee = response.data;
          for (let i = 0; i < this.listOfEmployee.length; i++) {
            let value = this.listOfEmployee[i];
            if (value.emp_id != this.loginedOfficerId.toString()) {
              value.is_editable = true;
            } else {
              value.is_editable = false;
            }
          }

        } else {
          this.listOfEmployee = [];
        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  filterList() {
    this.getListOfEmployee();
  }

  clearFilter() {
    this.setOfficerInfo();
  }

  updateEmployee(item: any) {

     ;
    if (item.password === "") {
      this.showError("पासवर्ड प्रेषित करें");
      return;
    }

    if (item.emp_mobile_number === "") {
      this.showError("अधिकारी का मोबाइल नंबर प्रेषित करें");
      return;
    }

    if (item.emp_mobile_number.length != 10) {
      this.showError("अधिकारी का सही मोबाइल नंबर प्रेषित करें");
      return;
    }

    if (item.emp_original_name === "") {
      this.showError("अधिकारी का नाम प्रेषित करें");
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.updateEmployeeData(this.loginedOfficerId.toString(),
      item.emp_id,
      item.emp_mobile_number,
      item.emp_original_name,
      item.password
    ).subscribe(
      async (response) => {

        await this.dismissDialog();

        this.showError(response.response.msg);

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
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

  onUpdateMobile(item: any) {
    item.password = "123456";
  }

  onUpdateEmpName(item: any) {
    item.password = "123456";
  }

}
