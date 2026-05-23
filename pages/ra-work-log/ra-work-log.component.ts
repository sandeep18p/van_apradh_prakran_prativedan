import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule, NgModel } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';

import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  arrowBack,
  calendarOutline,
  cameraOutline,
  carOutline,
  checkmarkCircleOutline,
  closeCircle,
  closeCircleOutline,
  constructOutline,
  cubeOutline,
  cutOutline,
  documentTextOutline,
  flameOutline,
  helpCircleOutline,
  imagesOutline,
  leafOutline,
  locateOutline,
  logOutOutline,
  micCircleOutline,
  peopleOutline,
  personCircleOutline,
  refreshCircleOutline,
  resizeOutline,
  trashOutline,
  close
} from 'ionicons/icons';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular/standalone';
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
import { JaptVahanDetailInterface } from '../view-complain-detail/base64responseofsign.modal';

import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
import { WorkLogResponseModal } from '../show-ra-work-log/WorkLogResponseModal.modal';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { SignaturePageComponent } from '../signature-page/signature-page.component';



@Component({
  selector: 'app-ra-work-log',
  templateUrl: './ra-work-log.component.html',
  styleUrls: ['./ra-work-log.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
  providers: [SpeechRecognition, DatePipe, Diagnostic]

})

export class RaWorkLogComponent implements OnInit {

  accusedPersons: AccusedPersonDetail[] = [];
  accusedCount: number = 0;
  accussedName: string = ""; accussedFatherName: string = ""; accussedAddress: string = "";
  seizedGoodDetail: string = "";

  address: string = "";

  crime_dhara: string = "";
  crimType: string = "";

  japtsuda_saman_supurd_emp_name: string = "";
  isAccusedWantToAbhisandhanit: boolean = false;
  accussedFinancialCondition: string = ""

  isBG: boolean = false;
  isRA: boolean = false;

  listOfWoodPrajati: any = [];

  raAnunshanahText: string = '';

  ra_name: string = '';
  ra_pad: string = '';

  workLogText: string = '';
  accussedCast: string = "";
  isListening = false;

  isLoading: boolean = false;
  loadingMessage: string = ""

  spoken: string[] = [];
  photos: string[] = [];

  comingComplaintData!: ComplainDetails;

  isAccussedFound: boolean = false;

  /** True when case is beat nirikshan; shows compartment_number & compartment_option columns in japt saman tables */
  isBeatNirikshan: boolean = false;

  isItFinalSubmission: boolean = false;

  /** Assignment info (जाँच हेतु प्रेषित करने वाले अधिकारी) - shown before कार्य विवरण एवं अभिलेख */
  whenAssignJanchkartaDetail: WorkLogResponseModal[] = [];
  /** Existing work logs - shown before the new entry form */
  existingWorkLogList: WorkLogResponseModal[] = [];
  /** Base path for work log images (from ngrok_url) */
  workLogImageBasePath: string = '';
  /** Index of newly submitted work log entry to scroll to after success dialog OK */
  private pendingScrollWorkLogIndex: number | null = null;

  onRadioChange(event: any) {
    this.isItFinalSubmission = event.detail.value
  }

  constructor(private router: Router, private apiService: ApiServiceService, private platform: Platform, private sharedService: SharedserviceService, private modalController: ModalController, private actionSheetController: ActionSheetController, private ngZone: NgZone, private cdRef: ChangeDetectorRef, private navController: NavController, private speechRecognition: SpeechRecognition, private languageService: LanguageServiceService, private datePipe: DatePipe, private diagnostic: Diagnostic, private networkCheckService: NetworkCheckService) {
    addIcons({
      peopleOutline,
      calendarOutline,
      addCircleOutline,
      trashOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      arrowBack,
      cameraOutline,
      closeCircle,
      micCircleOutline,
      refreshCircleOutline,
      imagesOutline,
      close,
      personCircleOutline,
      alertCircleOutline,
      helpCircleOutline,
      leafOutline,
      logOutOutline,
      resizeOutline,
      cutOutline,
      flameOutline,
      constructOutline,
      cubeOutline,
      carOutline,
      locateOutline,
      documentTextOutline,
    })
  }

  OtherJaptItemsList: any[] = [];
  balliItemsList: any[] = [];
  baansItemsList: any[] = [];  // बाँस (Bamboo)
  polItemsList: any[] = [];

  filterItems() {

    this.listOfKashthaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा'
    );

    this.listOfKashthaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfKashthaDetail.forEach(row => {
      row.kasth_halat = Number(row.kasth_halat);
    });

    this.listOfChiranaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान'
    );

    this.listOfChiranaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfThunthDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ'
    );

    this.listOfThunthDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfChattaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा'
    );

    this.listOfChattaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.OtherJaptItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान'
    );

    this.balliItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );

    this.baansItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस'
    );

    ;
    this.baansItemsList = this.listOfjaptiSaman
      .filter(item => item.actual_name_of_saman === 'बाँस')
      .map(item => ({
        ...item,
        prajati_name:
          item.prajati_type.toString() === '1'
            ? 'व्यापारिक'
            : item.prajati_type.toString() === '2'
              ? 'औद्योगिक'
              : '--'
      }));

    this.polItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल'
    );

    this.balliItemsList.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });



    this.updateTotalThunthRashi();
    this.getTotalVanopajRashi();

  }

  get totalBalliNag(): number {
    return this.balliItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliRashi(): number {
    return this.balliItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalJaptSamanNag(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalJaptSamanGhanMeter(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalJaptSamanAnumanitMulya(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }


  get totalThunthNag(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get hasAnyJaptSaman(): boolean {
    return (
      (this.listOfThunthDetail && this.listOfThunthDetail.length > 0) ||
      (this.listOfKashthaDetail && this.listOfKashthaDetail.length > 0) ||
      (this.balliItemsList && this.balliItemsList.length > 0) ||
      (this.listOfChiranaDetail && this.listOfChiranaDetail.length > 0) ||
      (this.listOfChattaDetail && this.listOfChattaDetail.length > 0) ||
      (this.baansItemsList && this.baansItemsList.length > 0) ||
      (this.polItemsList && this.polItemsList.length > 0) ||
      (this.OtherJaptItemsList && this.OtherJaptItemsList.length > 0)
    );
  }

  get totalThunthGhanMeter(): number {
    return parseFloat(this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    ).toFixed(3));
  }

  get totalKashthNag(): number {
    return this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthGhanMeter(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChiranGhanMeter(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalKashthRashi(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  totalVanopajRashi: string = '0';

  getTotalVanopajRashi() {
    const kashRashi = this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const chiranRashi = this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    this.totalVanopajRashi = (kashRashi + chiranRashi).toFixed(0);

  }

  get totalChiranRashi(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  samanTypeMap: Record<string, string> = {
    "1": "ठूंठ",
    "2": "लट्ठा",
    "3": "Other",
    "4": "चिरान",
    "5": "चट्टा"
  };

  // getJaptisamanList(samanDetails: JaptSamanItem[]) {

  //   this.listOfjaptiSaman = samanDetails.filter(item => item.jabti_saman_type !== "3")
  //     .map((item, index) => {
  //       const prajati = this.listOfWoodPrajati.find(
  //         (p: any) => p.id === Number(item.prajati_type)
  //       );


  //       return {
  //         jabti_saman_type: item.jabti_saman_type,
  //         actual_name_of_saman: this.samanTypeMap[item.jabti_saman_type] ?? "",
  //         saman_table_id: item.saman_table_id,
  //         prajati_name: prajati?.name ?? "",
  //         prajati_type: item.prajati_type,
  //         lambai: item.lambai,
  //         golai: item.golai,
  //         ghan_meter: item.ghan_meter,
  //         nag: item.nag,
  //         dar: item.dar,
  //         total_cost: item.total_cost,
  //         if_other_then_detail: item.if_other_then_detail,
  //         motai: item.motai,
  //         unchai: item.unchai,
  //         kasth_halat: item.kasth_halat,
  //         kasth_halat_name: item.kasth_halat_name
  //       } as JaptSamanItem;
  //     });

  //   this.filterItems();

  // }

  date_of_crime: string = "";
  complainer_name: string = "";

  listOfJaptVahanDetail: JaptVahanDetailInterface[] = [];

  filePath: string = "";

  async ngOnInit() {

    this.checkLocationPermissionAndNavigate();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.workLogDate = `${yyyy}-${mm}-${dd}`;

    this.getLoginedOfficerData();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    if (value) {
      this.ra_name = value;
    }
    const { value: valuePad } = await Preferences.get({ key: PreferenceKeys.emp_designation });
    if (valuePad) {
      this.ra_pad = valuePad;
      if (this.loginedOfficerDesignationId === "5") {
        this.ra_pad = "BFO";
      } else if (this.loginedOfficerDesignationId === "6") {
        this.ra_pad = "RA";
      }
    }

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    if (data) {

      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;

      this.date_of_crime = this.comingComplaintData.date_of_crime;
      this.complainer_name = this.comingComplaintData.complainer_name;
      this.por_number = this.comingComplaintData.por_number;

      this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
      this.crimType = this.comingComplaintData.crime_type;
      //this.crime_dhara = this.comingComplaintData.crime_dhara;

      this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);
      console.log(this.comingComplaintData.is_beat_nirikshan, "isBeatNirikshan")
      this.isBeatNirikshan = this.comingComplaintData.is_beat_nirikshan === '1';


      console.log(this.isBeatNirikshan, "isBeatNirikshan")

      if (this.comingComplaintData.is_accused_found === "1") {
        this.isAccussedFound = true;
      }

      const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

      if (prajatiName.value) {
        this.listOfWoodPrajati = JSON.parse(prajatiName.value);
      }

      this.listOfjaptiSaman = this.comingComplaintData.japtSamanList;

      this.filterItems();

      if (this.comingComplaintData.is_accused_found === '1') {
        this.accusedCount = this.comingComplaintData.accused_count || 0;
        this.accusedPersons = this.comingComplaintData.accusedPersons || [];
        console.log(this.accusedPersons, "accusedPersons 123")

        if (this.accusedCount === 0) {
          this.accusedCount = 1;
        }

      } else {
        this.accusedCount = 0;
        this.accusedPersons = [];
      }


      this.accussedName = this.comingComplaintData.accused_name;
      this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
      this.accussedAddress = this.comingComplaintData.accused_address;
      this.accussedCast = this.comingComplaintData.cast_name;
      ;
      if (this.comingComplaintData.actual_crime_date === "" || this.comingComplaintData.actual_crime_date === "1900-01-01") {
        this.actualCrimeDate = "00-00-0000";
      } else {
        this.actualCrimeDate = this.comingComplaintData.actual_crime_date;
      }
    }

    this.getDetailOfComplain();

    this.handleBackButton();

  }



  getDetailOfComplain() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      (response) => {
        this.dismissDialog();
        // console.log(response.response, " data from backend")
        if (response.response.code === 200) {
          console.log(response, ' response');

          if (response.complainData && response.complainData.length > 0) {
            console.log(response.complainData, " data from backend")
            this.comingComplaintData = response.complainData[0];

            this.isBeatNirikshan = this.comingComplaintData.is_beat_nirikshan === '1';
            this.listOfjaptiSaman = this.comingComplaintData.japtSamanList || [];
            this.filterItems();

            if (this.comingComplaintData.is_japt_vahan === "1") {
              if (this.comingComplaintData.japt_vahan_detail && this.comingComplaintData.japt_vahan_detail.trim() !== '') {
                try {
                  this.listOfJaptVahanDetail = JSON.parse('[' + this.comingComplaintData.japt_vahan_detail + ']');


                } catch (error) {

                }
              }
            }

            this.loadPreviousWorkLogs();
          }

        }



      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  /** Load assignment + existing work logs (same data as show-ra-work-log) to show before the new entry form */
  loadPreviousWorkLogs(): Promise<void> {
    if (!this.comingComplaintData?.complain_id) {
      return Promise.resolve();
    }
    this.initWorkLogImageBasePath();
    return new Promise((resolve) => {
      this.apiService.getRAWorkLogList(this.comingComplaintData.complain_id).subscribe(
        (response: any) => {
          if (response?.response?.code === 200) {
            this.whenAssignJanchkartaDetail = response.when_assign_janchkarta_adhikari || [];
            this.existingWorkLogList = response.data || [];

            ;

            const lastItem = this.existingWorkLogList.length > 0
              ? this.existingWorkLogList[this.existingWorkLogList.length - 1]
              : null;

            this.previousJanchkartaSign = lastItem?.janch_karta_ka_sign || "";

            this.existingWorkLogList.forEach((item: WorkLogResponseModal) => {
              if (item.work_log_images && item.work_log_images.trim() !== '') {
                item.work_log_images_array = item.work_log_images
                  .split(',')
                  .filter((name: string) => name.trim() !== '')
                  .map((name: string) => name.trim());
              } else {
                item.work_log_images_array = [];
              }
            });
            this.cdRef.detectChanges();
          }
          resolve();
        },
        () => resolve()
      );
    });
  }

  async initWorkLogImageBasePath() {
    const { value } = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.workLogImageBasePath = value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';
  }

  getFullPathWorkLogImage(photoName: string): string {
    return this.workLogImageBasePath ? this.workLogImageBasePath + '/' + photoName : photoName;
  }

  async showWorkLogImageAlert(imageUrl: string) {
    const modal = await this.modalController.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: { imageUrl: this.getFullPathWorkLogImage(imageUrl) },
      backdropDismiss: true,
    });
    await modal.present();
  }

  toolbarTitle: string = "";
  por_number: string = "";

  listOfjaptiSaman: JaptSamanItem[] = []

  actualCrimeDate: string = "";

  calculateGhanMeterChiran(row: any) {
    const lambai = parseFloat(row.lambai) || 0;
    const chodai = parseFloat(row.golai) || 0;
    const motai = parseFloat(row.motai) || 0;
    const nag = parseFloat(row.nag) || 0;
    //row.ghan_meter = ((lambai * golai) * nag).toFixed(2);


    row.ghan_meter = ((lambai * chodai * motai) / 10000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);


    //row.ghan_meter = "0";
  }


  calculateGhanMeterKastha(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const lambai = parseFloat(row.lambai) || 0;
    const nag = parseFloat(row.nag) || 0;
    //row.ghan_meter = ((lambai * golai) * nag).toFixed(2);


    row.ghan_meter = ((lambai * (golai * golai)) / 160000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);


    this.updateCostKasth(row);

    //row.ghan_meter = "0";
  }

  async startListeningNew() {

    if (!(await this.checkAndRequestPermissionForMic())) {
      this.showPermissionAlert("माइक्रोफ़ोन अनुमति आवश्यक है। कृपया सेटिंग्स से अनुमति दें।");
      return;
    }

    if (!this.isListening) {
      this.isListening = true;
      this.listenLoop();
    } else {
      this.stopListening();
    }

  }

  private listenLoop() {
    if (!this.isListening) return;
    this.speechRecognition.startListening({
      language: 'hi-IN',
      showPopup: false,
      matches: 1
    }).subscribe(
      (matches) => {
        const spoken = matches[0];
        this.ngZone.run(() => {
          this.workLogText += (this.workLogText ? ' ' : '') + spoken;
        });
        if (this.isListening) setTimeout(() => this.listenLoop(), 300);
      },
      (error) => {
        if (this.isListening) setTimeout(() => this.listenLoop(), 800);
      },
      () => {
        if (this.isListening) setTimeout(() => this.listenLoop(), 800);
      }
    );
  }

  stopListening() {
    this.isListening = false;
    this.speechRecognition.stopListening();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  goBack() {
    this.navController.back();
  }

  removePhoto(index: number) {
    this.photos.splice(index, 1);
  }

  async takePic() {
    if (this.photos.length >= 20) {
      this.longToast("आप 20 फोटो ही ले सकते हैं");
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForPic();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForPic();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async openCameraForPic() {
    if (this.photos.length >= 20) {
      this.longToast("आप 20 फोटो ही ले सकते हैं");
      return;
    }

    const permission = await Camera.checkPermissions();
    if (permission.camera !== 'granted') {
      const result = await Camera.requestPermissions();
      if (result.camera !== 'granted') {
        this.showPermissionAlert("Camera permission not granted");
        return;
      }
    }

    const image = await Camera.getPhoto({
      quality: 10,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (image.dataUrl) {
      this.photos.push(image.dataUrl);
    }
  }

  async openGalleryForPic() {
    if (this.photos.length >= 20) {
      this.longToast("आप 20 फोटो ही ले सकते हैं");
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        this.photos.push(image.dataUrl);
      }
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
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


  workLogDate: string = "";

  async onSelectDate() {

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
        this.workLogDate = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  async selectActualCrimDate() {

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
        this.actualCrimeDate = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  get actualCrimeDateText(): string {
    if (
      !this.actualCrimeDate ||
      this.actualCrimeDate === '00-00-0000' ||
      this.actualCrimeDate === '1900-01-01'
    ) {
      return 'तिथि चुनें';
    }
    return this.datePipe.transform(this.actualCrimeDate, 'dd-MM-yyyy') ?? 'तिथि चुनें';
  }

  // async ionViewDidEnter() {
  //   await this.platform.ready();
  //   this.checkAndRequestPermissionForMic();
  // }

  async checkAndRequestPermissionForMic(): Promise<boolean> {
    const hasPermission = await this.speechRecognition.hasPermission();

    if (!hasPermission) {
      try {
        await this.speechRecognition.requestPermission();
        return true; // ✅ return true AFTER success
      } catch (err) {
        return false;
      }
    }

    return true; // Already has permission
  }

  async cancel() {
    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप इस क्रिया को रद्द करना चाहते हैं ?',
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

  async submitWorkLog() {

    ;
    let name_title = "जांचकर्ता अधिकारी का नाम";

    if (this.ra_name === "") {
      this.shortToast(name_title);
      return;
    }

    if (this.ra_pad === "") {
      this.shortToast("जांच अधिकारी का पद");
      return;
    }

    await Preferences.set({ key: PreferenceKeys.emp_name, value: this.ra_name });
    await Preferences.set({ key: PreferenceKeys.emp_designation, value: this.ra_pad });

    let isFinalSubmit = "0";

    if (this.workLogText === "") {
      this.showError("कृपया अपने कार्य का लॉग लिखें");
      return;
    }

    if (this.address === "") {
      this.showError("पता  (मुकाम) लिखें");
      return;
    }



    if (this.isItFinalSubmission) {

      if (this.japtsuda_saman_supurd_emp_name === "") {
        this.showError("जप्त सामान सुपुर्द किए गए अधिकारी का नाम");
        return;
      }

      isFinalSubmit = "1";

      if (this.listOfThunthDetail.length > 0) {

        const isAllTotalCostFilled = this.listOfThunthDetail.every(
          item => String(item.total_cost ?? "").trim() !== ""
        );

        if (!isAllTotalCostFilled) {
          this.showError("जप्ती सामान की दर प्रेषित करिये");
          return;
        }

        const isAllOneLessGolaiFilled = this.listOfThunthDetail.every(
          item => String(item.one_golai_less ?? "").trim() !== ""
        );

        if (!isAllOneLessGolaiFilled) {
          this.showError("सभी 1 गोलाई वर्ग कम करने पर (सेंटी मीटर) प्रेषित करिये");
          return;
        }

        const isAllGolaiFilled = this.listOfThunthDetail.every(
          item => String(item.one_golai_less ?? "").trim() !== ""
        );

        if (!isAllGolaiFilled) {
          this.showError("सभी गोलाई वर्ग (सेंटी मीटर) प्रेषित करिये");
          return;
        }

      }

      if (this.listOfKashthaDetail.length > 0) {

        const isAllTotalCostFilled = this.listOfKashthaDetail.every(
          item => String(item.total_cost ?? "").trim() !== ""
        );

        const isAllTotalGhanmeterFilled = this.listOfKashthaDetail.every(
          item => String(item.ghan_meter ?? "").trim() !== ""
        );

        if (!isAllTotalCostFilled || !isAllTotalGhanmeterFilled) {
          this.showError("सभी जप्ती सामान की लम्बाई (मीटर), गोलाई (सेंटी मीटर), संख्या, दर प्रेषित करिये");
          return;
        }

      }

      if (this.listOfChiranaDetail.length > 0) {

        const isAllTotalCostFilled = this.listOfChiranaDetail.every(
          item => String(item.total_cost ?? "").trim() !== ""
        );

        const isAllTotalGhanmeterFilled = this.listOfChiranaDetail.every(
          item => String(item.ghan_meter ?? "").trim() !== ""
        );

        if (!isAllTotalCostFilled || !isAllTotalGhanmeterFilled) {
          this.showError("सभी जप्ती सामान की लम्बाई (मीटर), चौड़ाई (सेंटी मीटर), मोटाई (सेंटी मीटर), संख्या, दर प्रेषित करिये");
          return;
        }

      }

    }

    if (this.listOfChallanDetail.length > 0) {

      let isAllDataEntered = true;

      for (let i = 0; i < this.listOfChallanDetail.length; i++) {
        let value = this.listOfChallanDetail[i];

        if (value.challan_kramank === "") {
          isAllDataEntered = false;
        }

        if (value.challan_date === "") {
          isAllDataEntered = false;
        }

        if (value.total_matra_in_ghan_meter === "") {
          isAllDataEntered = false;
        }

        if (value.depo_name === "") {
          isAllDataEntered = false;
        }

      }

      if (!isAllDataEntered) {
        this.showError("चालान की सभी जानकारी प्रेषित करिये");
        return;
      }

    }

    const formData = new FormData();

    let isWantToAbhisandhanit = "0";
    if (this.isAccusedWantToAbhisandhanit) {
      isWantToAbhisandhanit = "1";
    }

    if (this.signatureImageJanchKarta != null) {
      const blobSignaturePhoto = this.dataURLtoBlob(this.signatureImageJanchKarta);
      formData.append('janchkarta_sign', blobSignaturePhoto, `photo_janchkarta_sign.jpg`);
    } else {
      formData.append('janchkarta_sign', "");
    }

    formData.append('previous_janchkarta_sign', this.previousJanchkartaSign);

    formData.append('google_address', this.current_location_google_addres);
    formData.append('lat', this.lat.toString());
    formData.append('lng', this.lon.toString());

    formData.append('japtsuda_saman_supurd_emp_name', this.japtsuda_saman_supurd_emp_name);
    formData.append('accussed_found_date_in_case_of_agyat', this.accussed_found_date);
    formData.append('is_accussed_want_to_abhisandhanit', isWantToAbhisandhanit.toString());
    formData.append('accussed_financial_condition', this.accussedFinancialCondition.toString());
    formData.append('emp_id', this.loginedOfficerEmpId.toString());
    formData.append('work_log_text', this.workLogText.toString());
    formData.append('work_log_date', this.workLogDate.toString());
    if (this.actualCrimeDate === "00-00-0000") {
      formData.append('actual_crime_date', "");
    } else {
      formData.append('actual_crime_date', this.actualCrimeDate);
    }
    //formData.append('actual_crime_date', this.actualCrimeDate.toString());
    formData.append('address', this.address);
    formData.append('complain_id', this.comingComplaintData.complain_id);
    formData.append('is_final_submit', isFinalSubmit);

    const mergedList = [...this.listOfThunthDetail, ...this.listOfKashthaDetail, ...this.listOfChiranaDetail];

    formData.append('japti_saman_data', JSON.stringify(mergedList));
    formData.append('challan_detail', JSON.stringify(this.listOfChallanDetail));
    formData.append('complain_history_table_id', this.comingComplaintData.complain_history_table_id);

    formData.append('ra_name', this.ra_name);

    formData.append('janch_karta_ka_pad', this.ra_pad);

    formData.append('tafsil_jurm_or_tafil_maal_jo_giraftar_hua', this.tafsil_jurm_or_tafil_maal_jo_giraftar_hua.toString());
    formData.append('japt_saman_total_price', this.totalThunthRashi.toString());
    formData.append('found_vanopaj_total_price', this.totalVanopajRashi.toString());
    formData.append('actual_loss_total_price', this.totalCostOfVastawikHani.toString());
    formData.append('mahsul_total_price', this.totalCostOfMahsul.toString());
    formData.append('mavja_total_price', this.totalCostOfMuwavja.toString());
    formData.append('ra_anushansha', this.raAnunshanahText.toString());
    formData.append('agrim_vasuli_money', this.agrimVasuliRashi.toString());
    formData.append('money_rasid_number', this.moneyReceiptNumber.toString());
    formData.append('money_rasid_date', this.moneyReceiptDate.toString());

    for (let i = 0; i < this.photos.length; i++) {
      const blob = this.dataURLtoBlob(this.photos[i]);
      formData.append('listOfFile', blob, `photo_${i + 1}.jpg`);
    }

    this.showDialog('जमा किया जा रहा है कृपया इंतजार करें');
    this.apiService.submitWorkLog(formData).subscribe(
      (response) => {
        this.dismissDialog();
        console.log(response, 'response')
        if (response.response.code === 200) {
          // Reload previous work logs so the newly submitted entry appears in the list
          this.loadPreviousWorkLogs().then(() => {
            if (this.existingWorkLogList.length > 0) {
              this.pendingScrollWorkLogIndex = this.existingWorkLogList.length - 1;
            }

            // Stay on the same page; just show success dialog
            this.afterSubmitLog(response.response.msg, false);

            // Clear current form fields (optional, keeps user on same page)
            this.workLogText = '';
            this.address = '';
            this.photos = [];

            this.sharedService.setRefresh(true);
          });
        } else {
          this.longToast(response.response.msg);
        }

      },
      (error) => {
        this.dismissDialog();
        this.longToast(error);
      }
    );

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
        if (isGoBack) {
          this.goBack();
        } else if (this.pendingScrollWorkLogIndex !== null) {
          this.scrollToWorkLogEntry(this.pendingScrollWorkLogIndex);
          this.pendingScrollWorkLogIndex = null;
        }
      }
    });

    await modal.present();
  }

  scrollToWorkLogEntry(index: number) {
    this.ngZone.run(() => {
      setTimeout(() => {
        const el = document.getElementById(`worklog-entry-${index}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
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
  loginedOfficerDesignationId: string = "0";
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
      this.loginedOfficerDesignationId = userData.designation_id;
      this.loginedOfficerCircleId = userData.circle_id;
      this.loginedOfficerDivisionId = userData.division_id;
      this.loginedOfficerSubDivisionId = userData.sub_division_id;
      this.loginedOfficerRangId = userData.range_id;
      this.loginedOfficerBeatId = userData.beat_id;

      if (userData.designation_id === "5") {
        this.isBG = true;
      } else if (userData.designation_id === "6") {
        this.isRA = true;
      }

    }

  }

  generatePDF() {

  }

  async selectWorkLogDate() {

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
        this.workLogDate = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  updateTotal(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.updateTotalThunthRashi();
    this.getTotalVanopajRashi();
    //this.updateTotalCostOfThunthAndKasth();

  }

  tafsil_jurm_or_tafil_maal_jo_giraftar_hua: string = "";

  totalThunthRashi: number = 0;
  totalChattaRashi: number = 0;
  totalThunthGhanmeter: number = 0;

  removeChattaInfo(index: number) {
    if (index > -1 && index < this.listOfChattaDetail.length) {
      this.listOfChattaDetail.splice(index, 1);
    }
  }

  updateTotalChattaRashi(item: any) {
    const nag = Number(item.nag) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(nag * dar);

    this.totalChattaRashi = this.listOfChattaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

  }

  updateTotalThunthRashi() {
    this.totalThunthRashi = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    this.totalThunthGhanmeter = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.ghan_meter) || 0;
      return sum + cost;
    }, 0);

  }



  totalCostOfThunth: number = 0;
  totalCostOfKasth: number = 0;
  totalCostOfChiran: number = 0;
  totalCostOfThunthAndKasth: number = 0;

  updateTotalCostOfThunth() {
    // reset first
    this.totalCostOfThunth = 0;

    // japti saman
    this.totalCostOfThunthAndKasth = this.listOfjaptiSaman.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    // thunth
    this.totalCostOfThunth = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    // kastha
    this.totalCostOfKasth = this.listOfKashthaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    this.totalCostOfChiran = this.listOfChiranaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);


    this.getTotalVanopajRashi();

  }

  totalCostOfFoundVanopaj: number = 0;

  // updateTotalCostOfFoundVanopaj() {
  //   this.updateVastawikHaniRashi();
  // }

  async onSelecteMoneyReceiptDate() {

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
        this.moneyReceiptDate = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  moneyReceiptDate: string = "";
  moneyReceiptNumber: string = "";
  agrimVasuliRashi: number = 0;
  totalCostOfMuwavja: number = 0;
  totalCostOfMahsul: number = 0;

  totalCostOfVastawikHani: number = 0;

  updateVastawikHaniRashi() {
    this.totalCostOfVastawikHani = this.totalCostOfThunthAndKasth - this.totalCostOfFoundVanopaj;
  }

  updateCostThunth(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = ghan_meter * dar;

    this.updateTotalCostOfThunth();
    this.getTotalVanopajRashi();

  }

  updateCostKasth(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.updateTotalCostOfThunth();
    this.getTotalVanopajRashi();

  }

  updateCostChiran(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.updateTotalCostOfThunth();

  }

  listOfChattaDetail:
    {
      jabti_saman_type: string;
      prajati_type: number,
      lambai: string,
      golai: string,
      ghan_meter: string,
      nag: string,
      dar: string,
      total_cost: string,
      if_other_then_detail: string,
      motai: string,
      unchai: string,
      kasth_halat: number
    }[] = [];

  addChattaInfo() {
    this.listOfChattaDetail.push({
      jabti_saman_type: '5', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0
    });
  }

  get totalChattaNag(): number {
    return this.listOfChattaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' },
    { id: 4, name: 'बल्ली' },
    { id: 5, name: 'अन्य' }
  ];


  listOfThunthDetail:
    {
      jabti_saman_type: string;
      prajati_type: number,
      lambai: string,
      golai: string,
      ghan_meter: string,
      nag: string,
      dar: string,
      total_cost: string,
      if_other_then_detail: string,
      one_golai_less: string,
      form_factor: string,
      motai: string,
      unchai: string,
      kasth_halat: number
    }[] = [];

  addThunthInfo() {
    this.listOfThunthDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', one_golai_less: '', form_factor: '', motai: '', unchai: '', kasth_halat: 0
    });
  }

  listOfKashthaDetail:
    {
      jabti_saman_type: string;
      prajati_type: number,
      lambai: string,
      golai: string,
      ghan_meter: string,
      nag: string,
      dar: string,
      total_cost: string,
      if_other_then_detail: string,
      motai: string,
      unchai: string,
      kasth_halat: number
    }[] = [];

  listOfChiranaDetail:
    {
      jabti_saman_type: string;
      prajati_type: number,
      lambai: string,
      golai: string, // (यही चौड़ाई है)
      ghan_meter: string,
      nag: string,
      dar: string,
      total_cost: string,
      if_other_then_detail: string,
      motai: string,
      unchai: string,
      kasth_halat: number
    }[] = [];

  addChiranInfo() {
    this.listOfChiranaDetail.push({
      jabti_saman_type: '4', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0
    });
  }

  addKasthaInfo() {
    this.listOfKashthaDetail.push({
      jabti_saman_type: '2', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0
    });
  }


  removeThunthInfo(index: number) {
    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
    }
  }

  removeKashthaInfo(index: number) {
    if (index > -1 && index < this.listOfKashthaDetail.length) {
      this.listOfKashthaDetail.splice(index, 1);
    }
  }

  removeChiranInfo(index: number) {
    if (index > -1 && index < this.listOfChiranaDetail.length) {
      this.listOfChiranaDetail.splice(index, 1);
    }
  }

  calculateGhanMeter(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const nag = parseFloat(row.nag) || 0;
    //row.ghan_meter = (golai * nag).toFixed(2); // 2 decimal places
    //row.ghan_meter = "0";

    const form_factor = parseFloat(row.form_factor);

    row.ghan_meter = (nag * form_factor).toFixed(2);

    this.updateCostThunth(row);
    this.getTotalVanopajRashi();

  }

  listOfChallanDetail:
    {
      challan_kramank: string;
      challan_date: string,
      total_matra_in_ghan_meter: string,
      depo_name: string
    }[] = [];

  totalGhanMeterWhichSentToDEOP: number = 0;

  removeChallan(index: number) {
    if (index > -1 && index < this.listOfChallanDetail.length) {
      this.listOfChallanDetail.splice(index, 1);
    }
  }

  addChallanDetail() {
    this.listOfChallanDetail.push({
      challan_kramank: '', challan_date: '', total_matra_in_ghan_meter: '', depo_name: ''
    });
  }

  async selectWorkChallanDate(item: any) {

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
        item.challan_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  calculateTotalGhanMeterToSentDep() {
    this.totalGhanMeterWhichSentToDEOP = this.listOfChallanDetail.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    );
  }

  getCrimDharaCommaSeparated(input: string): string {
    const parts = input.split(",").map(s => s.trim());

    // If only one entry, return directly
    if (parts.length === 1) {
      return input.trim();
    }

    // Group by Act
    const grouped: Record<string, string[]> = {};
    for (const part of parts) {
      const [act, section] = part.split(" - ").map(s => s.trim());
      if (!grouped[act]) grouped[act] = [];
      grouped[act].push(section);
    }

    // Rebuild into string
    return Object.entries(grouped)
      .map(([act, sections]) => `${act} - ${sections.join(", ")}`)
      .join(", ");
  }

  handleBackButton() {
    this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, async () => {
      this.cancel();
    });
  }

  ionViewWillLeave() {
    this.removeBackButtonListener();
  }

  backButtonHandler: any;
  removeBackButtonListener() {
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
      this.backButtonHandler = null;
    }
  }

  get totalBaansNag(): number {
    return this.baansItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBaansRashi(): number {
    return this.baansItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalPolNag(): number {
    return this.polItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalPolRashi(): number {
    return this.polItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  clearActualCrimeDate(event: Event) {
    this.actualCrimeDate = "00-00-0000";
  }

  async checkLocationPermissionAndNavigate() {
    await this.platform.ready();
    this.isGettingLocation = true;

    try {
      // Step 1: Check if GPS is enabled
      const isGpsEnabled = await this.diagnostic.isLocationEnabled();

      if (!isGpsEnabled) {
        await this.diagnostic.switchToLocationSettings();
        return;
      }

      // Step 2: Request location permissions
      const permStatus = await Geolocation.requestPermissions();

      if (permStatus.location === 'granted') {

        this.getCurrentLocation();

      } else {
        this.showPermissionAlert("Location permission not granted");
      }
    } catch (error) {
      this.isGettingLocation = false;
    }
  }

  // async checkLocationPermissionAndNavigate() {
  //   await this.platform.ready();
  //   this.isGettingLocation = true;

  //   try {
  //     // Step 1: Check if GPS is enabled
  //     const isGpsEnabled = await this.diagnostic.isLocationEnabled();

  //     if (!isGpsEnabled) {
  //       await this.diagnostic.switchToLocationSettings();
  //       return;
  //     }

  //     // Step 2: Request location permissions
  //     const permStatus = await Geolocation.requestPermissions();

  //     if (permStatus.location === 'granted') {

  //       this.getCurrentLocation();

  //     } else {
  //       this.showPermissionAlert("Location permission not granted");
  //     }
  //   } catch (error) {
  //     this.isGettingLocation = false;
  //   }
  // }

  isGettingLocation = false;

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds
        maximumAge: 0
      });
      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;
      this.isGettingLocation = false;
      if (await this.networkCheckService.getCurrentStatus()) {
        this.getGoogleAddress(this.lat, this.lon);
      }

    } catch (error) {

      // Optional: fallback to last known location
      try {
        const lastKnown = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000 // 1 minute old acceptable
        });
        this.lat = lastKnown.coords.latitude;
        this.lon = lastKnown.coords.longitude;
      } catch (fallbackError) {
      }
    }
  }

  getGoogleAddress(lat: number, lon: number) {

    this.apiService.getGoogleAddress(lat, lon).subscribe(
      (response) => {
        if (response != null) {
          this.current_location_google_addres = response.display_name.toString()
        } else {
          //this.longToast('Problem to initialize application');
        }
      },
      (error) => {

      }
    );

  }

  current_location_google_addres: string = "Getting your location, please wait....";

  lat: number = 0.0;
  lon: number = 0.0;

  previousJanchkartaSign: string = "";

  signatureImageJanchKarta: string | null = null;

  async openSignaturePadJanchKarta() {

    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: this.ra_name
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      this.signatureImageJanchKarta = data.signature;
    }

  }

  getFullPathImage(photoName: string): string {
    return this.filePath + "/" + photoName;
  }

}