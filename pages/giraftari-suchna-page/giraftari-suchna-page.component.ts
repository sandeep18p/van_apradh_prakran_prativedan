import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';

import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule, NgModel } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { addIcons } from 'ionicons';
import { addCircleOutline, arrowBack, boat, businessOutline, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, cubeOutline, documentTextOutline, informationCircleOutline, micCircleOutline, peopleOutline, trashOutline } from 'ionicons/icons';
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
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { Router } from '@angular/router';
import { AccusedPersonDetail, AccusedPersonDetailForChallanRealted, AccusedPersonDetailForVanApradhPrakran, AccusedPersonForCourtChalanDetail, ComplainDetails, GirPatrakResponseModal, JaptSamanItem } from '../officer-dashboard/GetDashboardResponse.model';

import { File as FilePlugin } from '@awesome-cordova-plugins/file/ngx';

import { TableModule } from 'primeng/table'; // Import TableModule
import { userInfo } from 'os';
import { JaptVahanDetailInterface, JaptVahanDetailInterfaceOnlyMalikDetail, JaptVahanDetailInterfaceOnlyVahanDetail } from '../view-complain-detail/base64responseofsign.modal';
import pdfMake from 'pdfmake/build/pdfmake';

import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom'; // adjust the path if needed
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom'; // adjust the path if needed
import { blob, text } from 'stream/consumers';
import { TimeDialogComponent } from 'src/app/dialogs/select-time-dialog/select-time-dialog.component';


const mergedVfs = {
  ...vfsRegular,
  ...vfsBold
};

@Component({
  selector: 'app-giraftari-suchna',
  templateUrl: './giraftari-suchna-page.component.html',
  styleUrls: ['./giraftari-suchna-page.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
  providers: [FilePlugin]
})

export class GiraftariSuchanaComponent implements OnInit {

  nyayik_dandadhikari_sthan: string = "";
  //prastut_hone_ka_dinank: string = "";


  private androidPermissions = inject(AndroidPermissions);

  accusedPersonsList: AccusedPersonForCourtChalanDetail[] = [];

  user_id: number = 0;
  loginedOfficerDesignationId: string = "";
  listOfWoodPrajati: any = [];

  constructor(
    private file: FilePlugin,
    private sharedService: SharedserviceService,
    private platForm: Platform,
    private languageService: LanguageServiceService, private navController: NavController,
    private router: Router, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalController: ModalController
  ) {

    addIcons({ peopleOutline, calendarOutline, addCircleOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, cameraOutline, closeCircle, micCircleOutline, documentTextOutline, informationCircleOutline, cubeOutline, businessOutline })

  }

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  por_number: string = "";

  comingComplaintData!: ComplainDetails;

  totalVahanDetailWithNumberFor_VisayTitle: string = "";

  otherJaptSamanTotalDetail: string = "";

  async ngOnInit() {

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {


      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.por_number = this.comingComplaintData.por_number;

      if (this.comingComplaintData.is_accused_found === '1') {

        let accusedJsonStr = this.comingComplaintData.accused_persons_json;

        accusedJsonStr = `[${accusedJsonStr}]`;

        this.accusedPersonsList = JSON.parse(accusedJsonStr);



      } else {
        this.accusedPersonsList = [];
      }

      this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);
      this.crimeDate = this.comingComplaintData.date_of_crime;

      const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

      if (prajatiName.value) {
        this.listOfWoodPrajati = JSON.parse(prajatiName.value);
      }

    }

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;

      this.user_id = userData.emp_id;
      this.loginedOfficerDesignationId = userData.designation_id;
      this.rangName = userData.range_name;
      this.divisionName = userData.division_name;

      this.getDetailOfComplain();

    }

  }

  sdo_sankhipt_vivran: string = "";

  rangName: string = "";
  divisionName: string = "";

  sub_division_name: string = "";
  listOfjaptiSaman: JaptSamanItem[] = []

  listOfJaptVahanDetail: JaptVahanDetailInterface[] = [];

  crimeDate: string = "";
  crimePlace: string = "";
  crime_dhara: string = "";
  crime_type: string = "";

  japtikarta_ka_name: string = "";
  japtikarta_ka_pad: string = "";

  detail_except_vanopaj_detail: string = "";

  anya_vishesh_vivran_and_prastaw: string = "";

  supurddar_ka_name: string = "";
  supurddar_ka_pita_ka_name: string = "";
  supurdar_ka_jati: string = "";
  supurddar_ka_vyavsay: string = "";
  supurdar_ka_poora_pata: string = "";
  supurd_me_lene_ka_dinank: string = "";

  roPatraKramank: string = "";
  roPatraDinank: string = "";

  getDetailOfComplain() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.user_id.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      (response) => {
        this.dismissDialog();

        if (response.response.code === 200) {

          if (response.complainData && response.complainData.length > 0) {

            this.comingComplaintData = response.complainData[0];

            this.por_number = this.comingComplaintData.por_number;


            this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

            this.sub_division_name = this.comingComplaintData.sub_division_name;

            this.crimePlace = this.comingComplaintData.place_of_crime;

            this.crime_type = this.comingComplaintData.crime_type;

            this.crimeDate = this.comingComplaintData.date_of_crime;

            this.japtikarta_ka_name = this.comingComplaintData.japtikarta_ka_name;
            this.japtikarta_ka_pad = this.comingComplaintData.japtikarta_ka_pad;

            this.supurddar_ka_name = this.comingComplaintData.supurddar_ka_name;
            this.supurddar_ka_pita_ka_name = this.comingComplaintData.supurddar_ka_pita_ka_name;
            this.supurdar_ka_jati = this.comingComplaintData.supurdar_ka_jati;
            this.supurddar_ka_vyavsay = this.comingComplaintData.supurddar_ka_vyavsay;
            this.supurdar_ka_poora_pata = this.comingComplaintData.supurdar_ka_poora_pata;
            this.supurd_me_lene_ka_dinank = this.comingComplaintData.supurd_me_lene_ka_dinank;

            this.japtikarta_ka_name = this.comingComplaintData.japtikarta_ka_name;
            this.japtikarta_ka_pad = this.comingComplaintData.japtikarta_ka_pad;


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

            for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {

              let japtVahan = this.listOfJaptVahanDetail[itemIndex];

              this.totalVahanDetailWithNumberFor_VisayTitle =
                this.totalVahanDetailWithNumberFor_VisayTitle + ' वाहन ' + japtVahan.vahan_prakar + ' , क्रमांक  ' + japtVahan.vahan_kramank;

            }

          }

          this.getTotalVanopajRashi();


           ;
          if (response.gir_patrak && response.gir_patrak.length) {

            for (let i = 0; i < response.gir_patrak.length; i++) {

              const rowPerson = this.accusedPersonsList[i];

              const girPatrakData = response.gir_patrak.find(item =>
                item.accussed_person_table_id === rowPerson.accussed_person_table_id
              );

              if (girPatrakData) {
                //rowPerson.id_to_update = girPatrakData.id_to_update;
                rowPerson.gir_date = girPatrakData.gir_date;
                 ;
                rowPerson.gir_time = this.to12Hour(girPatrakData.gir_time);
                rowPerson.gir_sthan = girPatrakData.gir_sthan;
                rowPerson.gir_adhikari = girPatrakData.gir_adhikari_ka_name_and_pad;
                rowPerson.gir_paya_gaya_saman = girPatrakData.gir_time_paya_gaya_saman;
                rowPerson.gir_body_mark = girPatrakData.chonto_ka_vivran;
              }

            }
          }


           ;
          if (response.gir_suchna_patrak && response.gir_suchna_patrak.length > 0) {
            this.showDownloadGirSuchnaPdfButton = true;

            for (let i = 0; i < response.gir_suchna_patrak.length; i++) {

              const rowPerson = this.accusedPersonsList[i];

              const girPatrakData = response.gir_suchna_patrak.find(item =>
                item.accussed_person_table_id === rowPerson.accussed_person_table_id
              );

              if (girPatrakData) {
                rowPerson.id_to_update = girPatrakData.id_to_update;
                rowPerson.suchna_person_name = girPatrakData.suchna_person_name;
                rowPerson.suchna_pita_pati_name = girPatrakData.suchna_pita_pati_name;
                rowPerson.suchna_person_jati = girPatrakData.suchna_person_jati;
                rowPerson.prastut_hone_ka_dinank = girPatrakData.prastut_hone_ka_dinank;
                rowPerson.suchna_person_pata = girPatrakData.suchna_person_pata;
                this.nyayik_dandadhikari_sthan = girPatrakData.court_place_name;
              }

              // this.id_to_update = girPatrakData.id_to_update;
              // this.prastut_hone_ka_dinank = girPatrakData.prastuti_dinank;
              // this.nyayik_dandadhikari_sthan = girPatrakData.court_place_name;

            }

          } else {
            this.showDownloadGirSuchnaPdfButton = false;
          }


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

  get minPrastutDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  validatePrastutDateOnEntry(accused: AccusedPersonForCourtChalanDetail): void {
    const today = new Date().toISOString().split('T')[0];
    if (accused.prastut_hone_ka_dinank && accused.prastut_hone_ka_dinank < today) {
      accused.prastut_hone_ka_dinank = '';
      this.longToast('न्यायालय में प्रस्तुत करने का दिनांक आज या उसके बाद का होना चाहिए।');
    }
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      saman_table_id: string
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      saman_table_id: string
    }[] = [];

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
      kasth_halat: number,
      saman_table_id: string
    }[] = [];

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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      saman_table_id: string
    }[] = [];

  baansItemsList: any[] = [];  // बाँस (Bamboo)
  polItemsList: any[] = [];

  listOfBalliDetail:
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      saman_table_id: string
    }[] = [];

  listOfOtherJaptSamanDetail:
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      saman_table_id: string
    }[] = [];

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

    //
    this.listOfBalliDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );

    this.listOfBalliDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.baansItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस'
    );

    this.polItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल'
    );


    this.listOfOtherJaptSamanDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान'
    );

  }

  get totalJaptSamanAnumanitMulya(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalJaptSamanGhanMeter(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalJaptSamanNag(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  isWebPlatform(): boolean {
    return this.platForm.is('desktop');
  }

  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' },
    { id: 4, name: 'बल्ली' },
    { id: 5, name: 'अन्य' }
  ];

  calculateTotalBalliRashi(row: any) {
    const nag = parseFloat(row.nag) || 0;
    const dar = parseFloat(row.dar) || 0;

    row.total_cost = (dar * nag).toFixed(2);

    this.getTotalVanopajRashi();
  }

  updateCostKasth(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.getTotalVanopajRashi();

  }
  totalVahanPrice: number = 0;
  getTotalVanopajRashi() {

    const kashRashi = this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const balliRashi = this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const chiranRashi = this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const jalauRashi = this.listOfChattaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const totalAnyJaptSamanRashi = this.listOfOtherJaptSamanDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    this.totalVanopajRashi = (kashRashi + chiranRashi + jalauRashi + balliRashi + totalAnyJaptSamanRashi).toFixed(0);


    this.totalVahanPrice = this.listOfJaptVahanDetail.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );

    this.total_anumanit_mulya_vahan_plus_vanoj = Number(this.totalVanopajRashi) + this.totalVahanPrice;

  }

  updateTotalChattaRashi(item: any) {
    const nag = Number(item.nag) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(nag * dar);

    this.getTotalVanopajRashi();

  }

  totalVanopajRashi: string = '0';

  get totalKashthNag(): number {
    return this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthGhanMeter(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalKashthRashi(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  get totalBalliNag(): number {
    return this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalPolNag(): number {
    let total = this.polItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );

    return total;
  }

  get totalOdyogicBanshNag(): number {

    return this.baansItemsList.reduce(
      (sum, item) => sum + ((item.prajati_type === '1' ? Number(item.nag) : 0) || 0),
      0
    );
  }

  get totalVyaprikBanshNag(): number {

    return this.baansItemsList.reduce(
      (sum, item) => sum + ((item.prajati_type === '2' ? Number(item.nag) : 0) || 0),
      0
    );
  }

  get totalBalliRashi(): string {
    return this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  updateCostChiran(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.getTotalVanopajRashi();

  }

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranGhanMeter(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChiranRashi(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  get totalChattaNag(): number {
    let total = this.listOfChattaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );

    return total;
  }

  get totalChattaRashi(): number {
    return this.listOfChattaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);
  }

  updateAnumanitRashi() {

    this.getTotalVanopajRashi();

  }

  get totalOtherJaptSamanNag(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalOtherJaptSamanGhanMeter(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalAnumanitRashi(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalJaptVahanKaAnumanitMulya(): number {
    return this.listOfJaptVahanDetail.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );
  }

  total_anumanit_mulya_vahan_plus_vanoj: number = 0;

  id_to_update: string = "";

  showDownloadGirSuchnaPdfButton: boolean = false;

  finalSubmitToServer() {

    if (this.nyayik_dandadhikari_sthan === "") {
      this.showError("माननीय न्यायिक दण्डाधिकारी (स्थान)");
      return;
    }

    this.showDialog('कृपया इंतजार करें');

    let personDetail = JSON.stringify(this.accusedPersonsList);

    this.apiService.submitGirftariSuchnaDetail(
      this.comingComplaintData.complain_id,
      this.nyayik_dandadhikari_sthan.toString(),
      this.user_id.toString(),
      personDetail
    ).subscribe(
      (response) => {
        this.dismissDialog();

        if (response.response.code === 200) {
          this.sharedService.setRefresh(true);

          let giraftari_patrak_id = response.response.generated_id;
           ;
          const idsArray = giraftari_patrak_id
            .split(",")
            .map(id => id.trim())
            .filter(id => id !== "");

          for (let i = 0; i < this.accusedPersonsList.length; i++) {
            const row = this.accusedPersonsList[i];
            let idToUpdate = idsArray[i];
            row.id_to_update = idToUpdate;
          }

          this.showDownloadGirSuchnaPdfButton = true;
          this.showError(response.response.msg);

        } else {
          this.showDownloadGirSuchnaPdfButton = false;
          this.longToast(response.response.msg);
        }

      },
      (error) => {

        this.dismissDialog();
        this.showDownloadGirSuchnaPdfButton = false;
        this.longToast(error);
      }
    );

  }

  convertDateString(dateStr: string): string {

    if (!dateStr) return '';

    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }


  async checkAndRequestStoragePermission() {

    const result = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    );

    if (!result.hasPermission) {
      await this.androidPermissions.requestPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      );
    }

  }

  get totalThunthNag(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalThunthRashi(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalThunthGhanMeter(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  async submitOnServer() {

    let msg = "क्या आप सुनिश्चित हैं?";

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {
        this.finalSubmitToServer();
      }
    });

    await modal.present();

  }

  // async generatePdfOfGirPatrak() {

  //   let accusedSection: any;

  //   (pdfMake as any).vfs = mergedVfs;

  //   (pdfMake as any).fonts = {
  //     NotoSansDevanagari: {
  //       normal: 'NotoSansDevanagari-Regular.ttf',
  //       bold: 'NotoSansDevanagari-Bold.ttf',
  //       italics: 'NotoSansDevanagari-Regular.ttf',
  //       bolditalics: 'NotoSansDevanagari-Regular.ttf'
  //     }
  //   };

  //   if (this.comingComplaintData.accused_count === 0) {

  //     const accusedTableBody = [
  //       [
  //         { text: 'क्रमांक', bold: true },
  //         { text: 'अपराधी का नाम', bold: true },
  //         { text: 'पिता का नाम', bold: true },
  //         { text: 'जाति', bold: true },
  //         { text: 'पता', bold: true }
  //       ],
  //       [
  //         1,
  //         'अज्ञात',
  //         'अज्ञात',
  //         'अज्ञात',
  //         'अज्ञात'
  //       ]
  //     ];

  //     accusedSection = {
  //       stack: [
  //         {
  //           table: {
  //             headerRows: 1,
  //             widths: ['auto', '*', '*', '*', '*'],
  //             body: accusedTableBody
  //           },
  //           margin: [0, 0, 0, 10]
  //         }
  //       ]
  //     };

  //   } else {
  //     const accusedTableBody = [
  //       [
  //         { text: 'क्रमांक', bold: true },
  //         { text: 'अपराधी का नाम', bold: true },
  //         { text: 'पिता का नाम', bold: true },
  //         { text: 'जाति', bold: true },
  //         { text: 'पता', bold: true }
  //       ],

  //       ...this.accusedPersonsList.map((a: any, index: number) => [
  //         index + 1,
  //         a.name || '',
  //         a.fathersName || '',
  //         a.cast || '',
  //         a.address || ''
  //       ])
  //     ];

  //     accusedSection = {
  //       stack: [
  //         {
  //           table: {
  //             headerRows: 1,
  //             widths: ['auto', '*', '*', '*', '*'],
  //             body: accusedTableBody
  //           },
  //           margin: [0, 0, 0, 10]
  //         }
  //       ]
  //     };

  //   }



  //   const contentArray: any[] = [];


  //   for (let index = 0; index < this.accusedPersonsList.length; index++) {

  //     let accusedSection: any;

  //     let accussedModel = this.accusedPersonsList[index];

  //     let name = accussedModel.name || '--';
  //     let fatherName = accussedModel.fathersName || '--';

  //     let suchnaPersonName = accussedModel.suchna_person_name || '--';
  //     let suchnaPersonFHName = accussedModel.suchna_pita_pati_name || '--';

  //     let age = accussedModel.age || '--';
  //     let mobile = accussedModel.mobile_number || '--';

  //     let cast = accussedModel.cast || '--';
  //     let jati = accussedModel.jati_name || '--';
  //     let mobile_number = accussedModel.mobile_number || '--';

  //     let address = accussedModel.address || '--';

  //     const accusedTableBody = [
  //       [
  //         { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
  //         { text: 'पिता का नाम', bold: true, alignment: 'center' },
  //         { text: 'उम्र', bold: true, alignment: 'center' },
  //         { text: 'जाति वर्ग', bold: true, alignment: 'center' },
  //         { text: 'जाति', bold: true, alignment: 'center' },
  //         { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
  //         { text: 'पता', bold: true, alignment: 'center' }

  //       ],
  //       [
  //         { text: name || '', alignment: 'center' },
  //         { text: fatherName || '', alignment: 'center' },
  //         { text: age || '', alignment: 'center' },
  //         { text: cast || '', alignment: 'center' },
  //         { text: jati || '', alignment: 'center' },
  //         { text: mobile_number || '', alignment: 'center' },
  //         { text: address || '', alignment: 'center' }
  //       ]
  //     ];

  //     accusedSection = {
  //       stack: [
  //         {
  //           table: {
  //             headerRows: 1,
  //             widths: ['auto', '*', 'auto', '*', '*', '*', '*'],
  //             body: accusedTableBody
  //           },
  //           margin: [0, 0, 0, 10]
  //         }
  //       ]
  //     };

  //     let suchnaPersonPata = accussedModel.suchna_person_pata || '--';
  //     let suchnaPersonJati = accussedModel.suchna_person_jati || '--';
  //     let prastut_hone_ka_dinank = accussedModel.prastut_hone_ka_dinank || '--';

  //     let gir_sthan = accussedModel.gir_sthan;
  //     let gir_date = accussedModel.gir_date
  //       ? accussedModel.gir_date.split('-').reverse().join('-')
  //       : '--';
  //     let gir_time = accussedModel.gir_time;

  //     let accusedContent = [
  //       {
  //         text: [
  //           'गिरफ्तारी सूचना पत्रक',
  //         ],
  //         style: 'title'
  //       },

  //       {
  //         canvas: [
  //           { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //         ],
  //         margin: [0, 10, 0, 10]
  //       },


  //       { text: '\n\n' },

  //       {
  //         text: [
  //           { text: [{ text: ' श्री/श्रीमती/कु. ' }, { text: suchnaPersonName, bold: true }] },
  //           { text: [{ text: ' पिता/पति श्री ' }, { text: suchnaPersonFHName, bold: true }] },
  //           {
  //             text: [
  //               { text: ' जाति ' },
  //               { text: suchnaPersonJati, bold: true },
  //             ]
  //           },
  //           { text: [{ text: ' पता  ' }, { text: suchnaPersonPata, bold: true }] },
  //           { text: ' आपको सूचित किया जाता है कि वन अपराध प्रकरण क्रमांक ' },
  //           { text: this.por_number, bold: true },
  //           { text: ' पंजीयन दिनांक ' },
  //           { text: this.crimeDate, bold: true },
  //           { text: ' में ' },
  //           { text: this.crime_type, bold: true },
  //           { text: ' के प्रकरण में ' },
  //           { text: this.crime_dhara, bold: true },
  //           { text: ' के तहत आरोपी को दिनांक ' },
  //           { text: gir_date, bold: true },
  //           { text: ' समय ' },
  //           { text: gir_time, bold: true },
  //           { text: ' बजे वन एवं जलवायु परिवर्तन विभाग के अधिकारी द्वारा गिरफ्तार किया गया है।' }
  //         ],
  //         alignment: 'justify',
  //         lineHeight: 1.5,
  //         margin: [0, 0, 0, 20],
  //         leadingIndent: 40
  //       },

  //       // Court presentation paragraph
  //       {
  //         text: [
  //           { text: 'अभियुक्त को माननीय न्यायिक दण्डाधिकारी ' },
  //           { text: this.nyayik_dandadhikari_sthan, bold: true },
  //           { text: ' के समक्ष में दिनांक ' },
  //           { text: this.ddMMyyyyFormatDate(prastut_hone_ka_dinank), bold: true },
  //           { text: ' को प्रस्तुत किया जायेगा। अतः उचित कार्यवाही हेतु आपको सूचित किया जा रहा है। अभियुक्तगण का विवरण निम्नानुसार है :-' }
  //         ],
  //         alignment: 'justify',
  //         lineHeight: 1.5,
  //         margin: [0, 0, 0, 30],
  //         leadingIndent: 40
  //       },

  //       accusedSection,

  //       // {
  //       //   canvas: [
  //       //     { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //       //   ],
  //       //   margin: [0, 10, 0, 10]
  //       // },

  //       {
  //         columns: [
  //           {
  //             width: '33%',
  //             stack: [
  //               { text: 'गवाहों के नाम एवं हस्ताक्षर', bold: false, margin: [0, 0, 0, 10] },
  //               { text: '______________________', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '______________________', alignment: 'left', margin: [0, 0, 0, 20] },
  //             ]
  //           },
  //           {
  //             width: '33%',
  //             stack: [
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: 'प्राप्तकर्ता का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '33%',
  //             stack: [
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: '', alignment: 'left', margin: [0, 0, 0, 20] },
  //               { text: 'सूचना देने वाले अधिकारी का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 10] },

  //             ]
  //           }
  //         ],
  //         margin: [0, 20, 0, 0]
  //       }


  //     ]

  //     if (index > 0) {
  //       (accusedContent[0] as any).pageBreak = 'before';
  //     }


  //     contentArray.push(...accusedContent);



  //   }



  //   const docDefinition: any = {
  //     content: contentArray,

  //     defaultStyle: {
  //       font: 'NotoSansDevanagari',
  //       fontSize: 11,      // 🔹 court docs ke liye perfect
  //       lineHeight: 1.2    // 🔥 equal & compact spacing
  //     },

  //     styles: {
  //       title: {
  //         fontSize: 14,    // 18 → bahut bada lagta hai print me
  //         bold: true,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 6]
  //       },

  //       subTitle: {
  //         fontSize: 12,
  //         bold: true,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 8]
  //       },

  //       section: {
  //         bold: true,
  //         margin: [0, 6, 0, 4]
  //       }
  //     },

  //     pageMargins: [40, 30, 40, 30] // 🔹 clean left-right spacing
  //   };

  //   const safePorNumber = (this.comingComplaintData?.por_number || '')
  //     .replace(/[\\/:*?"<>|]/g, '_')
  //     .replace(/\s+/g, '_');
  //   const fileName = `गिरफ्तारी_सूचना_पत्रक_PDF_${safePorNumber}.pdf`;

  //   if (this.platForm.is('desktop')) {

  //     pdfMake.createPdf(docDefinition).download(fileName);

  //   } else if (this.platForm.is('android')) {

  //     await this.checkAndRequestStoragePermission();

  //     const PDF_TIMEOUT_MS = 35000;

  //     const dataUrl = await new Promise<string>((resolve, reject) => {
  //       const timer = setTimeout(() => {
  //         reject(new Error('PDF generation timed out. Please try again.'));
  //       }, PDF_TIMEOUT_MS);

  //       pdfMake.createPdf(docDefinition).getDataUrl((dataUrlResult: string) => {
  //         clearTimeout(timer);
  //         if (dataUrlResult) {
  //           resolve(dataUrlResult);
  //         } else {
  //           reject(new Error('PDF generation failed.'));
  //         }
  //       });
  //     }).catch(err => {
  //       this.longToast(err?.message || 'PDF तैयार नहीं हो सका।');
  //       return;
  //     });

  //     if (!dataUrl) return;

  //     try {
  //       const base64Payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  //       const savedFile = await Filesystem.writeFile({
  //         path: fileName,
  //         data: base64Payload,
  //         directory: Directory.Documents,
  //         recursive: true
  //       });

  //       await Share.share({
  //         title: 'गिरफ्तारी सूचना पत्रक PDF',
  //         text: 'गिरफ्तारी सूचना पत्रक पीडीएफ',
  //         url: savedFile.uri,
  //         dialogTitle: 'Share or Save PDF'
  //       });
  //     } catch (err: any) {
  //       this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
  //     }
  //   }


  // }

  async generatePdfOfGirPatrak() {

    let accusedSection: any;

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    if (this.comingComplaintData.accused_count === 0) {

      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true },
          { text: 'अपराधी का नाम', bold: true },
          { text: 'पिता का नाम', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],
        [
          1,
          'अज्ञात',
          'अज्ञात',
          'अज्ञात',
          'अज्ञात'
        ]
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

    } else {
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true },
          { text: 'अपराधी का नाम', bold: true },
          { text: 'पिता का नाम', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],

        ...this.accusedPersonsList.map((a: any, index: number) => [
          index + 1,
          a.name || '',
          a.fathersName || '',
          a.cast || '',
          a.address || ''
        ])
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

    }



    const contentArray: any[] = [];


    for (let index = 0; index < this.accusedPersonsList.length; index++) {

      let accusedSection: any;

      let accussedModel = this.accusedPersonsList[index];

      let name = accussedModel.name || '--';
      let fatherName = accussedModel.fathersName || '--';

      let suchnaPersonName = accussedModel.suchna_person_name || '--';
      let suchnaPersonFHName = accussedModel.suchna_pita_pati_name || '--';

      let age = accussedModel.age || '--';
      let mobile = accussedModel.mobile_number || '--';

      let cast = accussedModel.cast || '--';
      let jati = accussedModel.jati_name || '--';
      let mobile_number = accussedModel.mobile_number || '--';

      let address = accussedModel.address || '--';

      const accusedTableBody = [
        [
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }

        ],
        [
          { text: name || '', alignment: 'center' },
          { text: fatherName || '', alignment: 'center' },
          { text: age || '', alignment: 'center' },
          { text: cast || '', alignment: 'center' },
          { text: jati || '', alignment: 'center' },
          { text: mobile_number || '', alignment: 'center' },
          { text: address || '', alignment: 'center' }
        ]
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', '*', '*', '*', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

      let suchnaPersonPata = accussedModel.suchna_person_pata || '--';
      let suchnaPersonJati = accussedModel.suchna_person_jati || '--';
      let prastut_hone_ka_dinank = accussedModel.prastut_hone_ka_dinank || '--';

      let gir_sthan = accussedModel.gir_sthan;
      let gir_date = accussedModel.gir_date
        ? accussedModel.gir_date.split('-').reverse().join('-')
        : '--';
      let gir_time = accussedModel.gir_time;

      let accusedContent = [
        {
          text: [
            'गिरफ्तारी सूचना पत्रक',
          ],
          style: 'title'
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },


        { text: '\n\n' },

        {
          text: [
            { text: [{ text: ' श्री/श्रीमती/कु. ' }, { text: suchnaPersonName, bold: true }] },
            { text: [{ text: ' पिता/पति श्री ' }, { text: suchnaPersonFHName, bold: true }] },
            {
              text: [
                { text: ' जाति ' },
                { text: suchnaPersonJati, bold: true },
              ]
            },
            { text: [{ text: ' पता  ' }, { text: suchnaPersonPata, bold: true }] },
            { text: ' आपको सूचित किया जाता है कि वन अपराध प्रकरण क्रमांक ' },
            { text: this.por_number, bold: true },
            { text: ' पंजीयन दिनांक ' },
            { text: this.crimeDate, bold: true },
            { text: ' में ' },
            { text: this.crime_type, bold: true },
            { text: ' के प्रकरण में ' },
            { text: this.crime_dhara, bold: true },
            { text: ' के तहत आरोपी को दिनांक ' },
            { text: gir_date, bold: true },
            { text: ' समय ' },
            { text: gir_time, bold: true },
            { text: ' बजे वन एवं जलवायु परिवर्तन विभाग के अधिकारी द्वारा गिरफ्तार किया गया है।' }
          ],
          alignment: 'justify',
          lineHeight: 1.5,
          margin: [0, 0, 0, 10],
          leadingIndent: 40
        },

        // Court presentation paragraph
        {
          text: [
            { text: 'अभियुक्त को माननीय न्यायिक दण्डाधिकारी ' },
            { text: this.nyayik_dandadhikari_sthan, bold: true },
            { text: ' के समक्ष में दिनांक ' },
            { text: this.ddMMyyyyFormatDate(prastut_hone_ka_dinank), bold: true },
            { text: ' को प्रस्तुत किया जायेगा। अतः उचित कार्यवाही हेतु आपको सूचित किया जा रहा है। अभियुक्तगण का विवरण निम्नानुसार है :-' }
          ],
          alignment: 'justify',
          lineHeight: 1.5,
          margin: [0, 0, 0, 15],
          leadingIndent: 40
        },

        accusedSection,

        // {
        //   canvas: [
        //     { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
        //   ],
        //   margin: [0, 10, 0, 10]
        // },

        {
          columns: [
            {
              width: '33%',
              stack: [
                { text: 'गवाहों के नाम एवं हस्ताक्षर', bold: false, margin: [0, 0, 0, 10] },
                { text: '______________________', alignment: 'left', margin: [0, 0, 0, 10] },
                { text: '______________________', alignment: 'left', margin: [0, 0, 0, 5] },
              ]
            },
            {
              width: '33%',
              stack: [
                { text: '\n\n\n\n', alignment: 'center' }, // Empty lines for signature space
                { text: 'प्राप्तकर्ता का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 5] }
              ]
            },
            {
              width: '33%',
              stack: [
                { text: '\n\n\n\n', alignment: 'center' }, // Empty lines for signature space
                { text: 'सूचना देने वाले अधिकारी का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 5] },

              ]
            }
          ],
          margin: [0, 5, 0, 0]
        }


      ]

      if (index > 0) {
        (accusedContent[0] as any).pageBreak = 'before';
      }


      contentArray.push(...accusedContent);



    }



    const docDefinition: any = {
      content: contentArray,

      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 9,      // 🔹 court docs ke liye perfect
        lineHeight: 1.1    // 🔥 equal & compact spacing
      },

      styles: {
        title: {
          fontSize: 12,    // 18 → bahut bada lagta hai print me
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 6]
        },

        subTitle: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },

        section: {
          bold: true,
          margin: [0, 6, 0, 4]
        }
      },

      pageMargins: [30, 20, 30, 20] // 🔹 clean left-right spacing
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("गिरफ्तारी_सूचना_पत्रक_PDF" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition);

    }


  }

  ddMMyyyyFormatDate(dateStr: string): string {
    if (!dateStr) return '--';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  onDateChange(value: string | null | undefined, row: any) {

    if (value) {
      row.gir_date = value;
    } else {
      row.gir_date = '--'; // or empty string
    }
  }

  onTimeChange(value: string | null | undefined, row: any) {

    if (value) {
      row.gir_time = value;
    } else {
      row.gir_time = '--'; // or empty string
    }
  }


  to12Hour(time24: string | undefined): string {
     ;
    if (!time24) return '--';

    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;

    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }



}