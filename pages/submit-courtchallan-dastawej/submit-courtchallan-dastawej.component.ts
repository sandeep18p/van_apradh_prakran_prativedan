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

@Component({
  selector: 'app-submit-courtchallan-dastawej',
  templateUrl: './submit-courtchallan-dastawej.component.html',
  styleUrls: ['./submit-courtchallan-dastawej.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
  providers: [SpeechRecognition]

})

export class CourtChallanDastawejList implements OnInit {

  court_challan_prastut_karne_ka_date: string = "";
  court_case_number: string = "";
  court_prastuti_date: string = "";
  selectedAdeshFile: File | null = null;
  isDateModalOpen = false;

  constructor(private router: Router, private apiService: ApiServiceService, private platform: Platform, private sharedService: SharedserviceService, private modalController: ModalController, private ngZone: NgZone, private cdRef: ChangeDetectorRef, private navController: NavController, private speechRecognition: SpeechRecognition, private languageService: LanguageServiceService) {
    addIcons({ peopleOutline, calendarOutline, addCircleOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, cameraOutline, closeCircle, micCircleOutline })
  }


  async selectCourtChallanDate() {

    const modal = await this.modalController.create({
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
        this.court_challan_prastut_karne_ka_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  comingComplaintData!: ComplainDetails;

  show_court_case_submit_button = true;

  async ngOnInit() {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.court_challan_prastut_karne_ka_date = `${yyyy}-${mm}-${dd}`;

    this.getLoginedOfficerData();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;

      this.court_case_number = this.comingComplaintData.court_case_number ?? "";
      this.court_prastuti_date = this.comingComplaintData.court_prastuti_date ?? "";

      if (this.court_case_number === "") {
        this.show_court_case_submit_button = true;
      } else {
        this.show_court_case_submit_button = false;
      }
    }

    this.handleBackButton();

  }

  openFardGirftari() {

     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/giraftari-fard', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  generateFardGirftariPdf() {

  }

  openGirftariSuchna() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/giraftari-suchna', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  openChallanForm() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/challan-form', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  openRemandForm() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/remad-form', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  openAccussedList() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/apradhiyo-ki-suchi', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  openWitnessList() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/sakshiyo-ki-suchi', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  openCheckList() {
     ;
    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/check-list', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  generateGirftariSuchnaPdf() {

  }

  backButtonHandler: any;
  removeBackButtonListener() {
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
      this.backButtonHandler = null;
    }
  }

  handleBackButton() {
    this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, async () => {
      this.cancel();
    });
  }

  toolbarTitle: string = "";
  por_number: string = "";


  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  goBack() {
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

  async showPermissionAlert(msg: string) {
    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {

      }
    });

    await modal.present();
  }

  accussed_found_date: string = "";

  async selectAccussedFoundDate() {

    const modal = await this.modalController.create({
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
        this.accussed_found_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }
  async cancel() {
    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप इस प्रक्रिया को रद्द करना चाहते हैं ?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {
        this.goBack();
      }
    });

    await modal.present();

  }
  async afterSubmitLog(msg: string, isGoBack: boolean) {

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
        // if (isGoBack) {
        //   this.goBack();
        // }
      }
    });

    await modal.present();
  }

  isLoading: boolean = false;
  loadingMessage: string = ""

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
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

  loginedOfficerEmpId: number = 0;
  loginedOfficerCircleId: string = "0";
  loginedOfficerDivisionId: string = "0";
  loginedOfficerSubDivisionId: string = "0";
  loginedOfficerRangId: string = "0";
  loginedOfficerBeatId: string = "0";

  async getLoginedOfficerData() {

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;
      this.loginedOfficerCircleId = userData.circle_id;
      this.loginedOfficerDivisionId = userData.division_id;
      this.loginedOfficerSubDivisionId = userData.sub_division_id;
      this.loginedOfficerRangId = userData.range_id;
      this.loginedOfficerBeatId = userData.beat_id;

    }

  }

  generatePDF() {

  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  async selectCourtPrastutiDate() {
    if (this.isDateModalOpen) return;
    this.isDateModalOpen = true;

    const modal = await this.modalController.create({
      component: SelectDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      this.isDateModalOpen = false;
      if (result.data?.confirmed) {
        const date = new Date(this.sharedService.getSelectedCrimeDate());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        this.court_prastuti_date = `${yyyy}-${mm}-${dd}`;
      }
    });

    await modal.present();
  }

  async submitCourtCaseNumberDetail() {
    if (!this.court_case_number || !this.court_prastuti_date) {
      await this.showError("कृपया कोर्ट केस नंबर और प्रस्तुति दिनांक दर्ज करें");
      return;
    }

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप कोर्ट केस नंबर विवरण सबमिट करना चाहते हैं?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {
        console.log("Submitting Court Case Detail:", {
          caseNumber: this.court_case_number,
          presentationDate: this.court_prastuti_date
        });
        this.submitOntoServer();
      }
    });

    await modal.present();
  }


  async onAdeshFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        this.selectedAdeshFile = file;
      } else {
        await this.showError("कृपया केवल PDF फाइल चुनें");
        event.target.value = '';
      }
    }
  }

  async submitCourtAdesh() {
    if (!this.selectedAdeshFile) {
      await this.showError("कृपया कोर्ट का आदेश (PDF) चुनें");
      return;
    }

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप कोर्ट का आदेश सबमिट करना चाहते हैं?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {
        this.submitOntoServer();
      }
    });

    await modal.present();

  }

  submitOntoServer() {

    this.showDialog("सबमिट हो रहा है, कृपया प्रतीक्षा करें...");

    const input = this.court_prastuti_date; // "23-03-2026"

    const [dd, mm, yyyy] = input.split('-');

    let formattedCourtPrastutiDate = "";

    if (this.comingComplaintData.is_it_court_case === "1") {
      formattedCourtPrastutiDate = `${yyyy}-${mm}-${dd}`;
    } else {
      formattedCourtPrastutiDate = this.court_prastuti_date;
    }


     ;

    this.apiService.submitCourtCaseOrAdeshDetail(
      this.court_case_number,
      formattedCourtPrastutiDate,
      this.selectedAdeshFile!,
      this.comingComplaintData.complain_id.toString(),
      this.loginedOfficerEmpId.toString()
    ).subscribe(
      async (response) => {
        await this.dismissDialog();

         ;
        // ✅ FIX: Handle response - check if it's a string that needs parsing
        let parsedResponse = response;
        if (typeof response === 'string') {
          try {
            parsedResponse = JSON.parse(response);
          } catch (e) {
            console.error('Error parsing response:', e);
          }
        }

        const responseData = parsedResponse.response || parsedResponse;

        if (responseData && responseData.code === 200) {
          const successMsg = responseData.msg;
          await this.afterSubmitLog(successMsg, true);
          this.sharedService.setRefresh(true);
          this.show_court_case_submit_button = false;
        } else {
          const errorMsg = responseData?.msg;
          this.longToast(errorMsg);
        }

      },
      async (error) => {
         ;
        await this.dismissDialog();
        console.error('Submit error:', error);

        // ✅ FIX: Better error handling
        let errorMsg = 'POR जमा करने में समस्या आ रही है। कृपया पुनः प्रयास करें...';
        if (error?.error?.response?.msg) {
          errorMsg = error.error.response.msg;
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }

        this.longToast(errorMsg);
      }
    );

  }

}