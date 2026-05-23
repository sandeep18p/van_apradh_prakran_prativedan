import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';

import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { FormsModule, NgModel } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { addIcons } from 'ionicons';
import { addCircleOutline, arrowBack, boat, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, cubeOutline, documentTextOutline, informationCircleOutline, micCircleOutline, peopleOutline, trashOutline } from 'ionicons/icons';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Preferences } from '@capacitor/preferences';
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
  selector: 'app-giraftari-fard',
  templateUrl: './giraftari-fard-page.component.html',
  styleUrls: ['./giraftari-fard-page.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
  providers: [FilePlugin]
})

export class GiraftariFardComponent implements OnInit {

  private androidPermissions = inject(AndroidPermissions);

  accusedPersonsList: AccusedPersonForCourtChalanDetail[] = [];

  user_id: number = 0;
  loginedOfficerDesignationId: string = "";
  listOfWoodPrajati: any = [];

  isRO: boolean = false;
  isSDO: boolean = false;

  constructor(
    private file: FilePlugin,
    private sharedService: SharedserviceService,
    private platForm: Platform,
    private languageService: LanguageServiceService, private navController: NavController,
    private router: Router, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalController: ModalController
  ) {

    addIcons({ peopleOutline, calendarOutline, addCircleOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, cameraOutline, closeCircle, micCircleOutline, documentTextOutline, informationCircleOutline, cubeOutline })

  }

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  por_number: string = "";

  comingComplaintData!: ComplainDetails;

  patra_kramank: string = "";
  patra_dinank: string = "";
  isReadOnly: boolean = false;

  pristh_kramank: string = "";

  crime_type: string = "";

  totalVahanDetailWithNumberFor_VisayTitle: string = "";

  otherJaptSamanTotalDetail: string = "";

  async ngOnInit() {

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {


      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.por_number = this.comingComplaintData.por_number;

      if (this.comingComplaintData.is_accused_found === '1') {
        //  ;
        let accusedJsonStr = this.comingComplaintData.accused_persons_json;

        accusedJsonStr = `[${accusedJsonStr}]`;

        this.accusedPersonsList = JSON.parse(accusedJsonStr);



      } else {
        this.accusedPersonsList = [];
      }

      this.crime_type = this.comingComplaintData.crime_type;

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

      if (this.loginedOfficerDesignationId === "4") {
        this.isRO = true;
        this.isReadOnly = false;
      }

      if (this.loginedOfficerDesignationId === "3") {
        this.isSDO = true;
        this.isReadOnly = true;
      }

      this.getDetailOfComplain();

    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.patra_dinank = `${yyyy}-${mm}-${dd}`;

  }

  nayayalay_sthan: string = "";
  sdo_sankhipt_vivran: string = "";

  rangName: string = "";
  divisionName: string = "";

  sub_division_name: string = "";
  listOfjaptiSaman: JaptSamanItem[] = []

  listOfJaptVahanDetail: JaptVahanDetailInterface[] = [];

  crimeDate: string = "";
  crimePlace: string = "";
  crime_dhara: string = "";
  crim_type: string = "";

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

            if (this.isSDO) {
              this.roPatraKramank = this.comingComplaintData.patra_kramank;
              this.roPatraDinank = this.comingComplaintData.pratra_dinank;
              this.detail_except_vanopaj_detail = this.comingComplaintData.other_thing_which_not_present_by_officer;
              this.anya_vishesh_vivran_and_prastaw = this.comingComplaintData.anya_vishesh_vivran;
              this.pristh_kramank = this.comingComplaintData.pristh_kramank;
            }







            this.por_number = this.comingComplaintData.por_number;


            this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

            this.sub_division_name = this.comingComplaintData.sub_division_name;

            this.crimePlace = this.comingComplaintData.place_of_crime;

            this.crim_type = this.comingComplaintData.crime_type;

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

            //  ;
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

          if (response.gir_patrak && response.gir_patrak.length) {
            this.showDownloadGirFardPdfButton = true;

            for (let i = 0; i < response.gir_patrak.length; i++) {

              const rowPerson = this.accusedPersonsList[i];

              const girPatrakData = response.gir_patrak.find(item =>
                item.accussed_person_table_id === rowPerson.accussed_person_table_id
              );

              if (girPatrakData) {
                //  ;
                rowPerson.id_to_update = girPatrakData.id_to_update;
                rowPerson.gir_date = girPatrakData.gir_date;
                rowPerson.gir_time = girPatrakData.gir_time;
                rowPerson.gir_sthan = girPatrakData.gir_sthan;
                rowPerson.gir_adhikari = girPatrakData.gir_adhikari_ka_name_and_pad;
                rowPerson.gir_paya_gaya_saman = girPatrakData.gir_time_paya_gaya_saman;
                rowPerson.gir_body_mark = girPatrakData.chonto_ka_vivran;
              }

            }
          } else {
            this.showDownloadGirFardPdfButton = false;
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
    //  ;
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

  async onSelecteFocrDate() {

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
        this.patra_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

  get totalJaptVahanKaAnumanitMulya(): number {
    return this.listOfJaptVahanDetail.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );
  }

  total_anumanit_mulya_vahan_plus_vanoj: number = 0;

  showDownloadGirFardPdfButton: boolean = false;

  finalSubmitToServer() {

    let isValidEntry = true;

    for (let i = 0; i < this.accusedPersonsList.length; i++) {
      const row = this.accusedPersonsList[i];

      if (
        !row.gir_sthan ||
        !row.gir_date ||
        !row.gir_time ||
        !row.gir_adhikari
      ) {
        isValidEntry = false;

        break;
      }
    }
    // 
    if (!isValidEntry) {
      // 
      this.showError("सम्पूर्ण जानकारी प्रेषित करें");
      return;
    }

    this.showDialog('कृपया इंतजार करें');

    let personDetail = JSON.stringify(this.accusedPersonsList);

    //  ;
    this.apiService.submitGirftariPatrakDetail(
      this.comingComplaintData.complain_id,
      personDetail,
      this.user_id.toString()
    ).subscribe(
      (response) => {
        this.dismissDialog();

        if (response.response.code === 200) {
          this.sharedService.setRefresh(true);
          let giraftari_patrak_id = response.response.generated_id;
          //  ;
          const idsArray = giraftari_patrak_id
            .split(",")
            .map(id => id.trim())
            .filter(id => id !== "");

          for (let i = 0; i < this.accusedPersonsList.length; i++) {
            const row = this.accusedPersonsList[i];
            let idToUpdate = idsArray[i];
            row.id_to_update = idToUpdate;
          }

          this.showDownloadGirFardPdfButton = true;
          this.showError(response.response.msg);

        } else {
          this.showDownloadGirFardPdfButton = false;
          this.longToast(response.response.msg);
        }

      },
      (error) => {

        this.dismissDialog();
        this.showDownloadGirFardPdfButton = false;
        this.longToast(error);
      }
    );

  }

  async generatePdfOfSuchanaCameFromROOfficer() {

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

    const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
    const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');


    const japtVahanHeaderOnlyVahanDetail = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
      { text: 'वाहन क्रमांक', bold: true },
      { text: 'अनुमानित मूल्य', bold: true }
    ];

    const buildjaptVahanBodyOnlyVahanDetail = (items: any[] = []) => [
      japtVahanHeaderOnlyVahanDetail,
      ...(items.length > 0 ? items.map(item => [
        item.vahan_prakar || '',
        item.vahan_kramank || '',
        item.anumanit_mulya || '',
      ]) : [['-', 0, 0]])
    ];




    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
      { text: 'वाहन क्रमांक', bold: true },
      { text: 'अनुमानित मूल्य', bold: true },
      { text: 'मालिक का नाम', bold: true },
      { text: 'पिता का नाम', bold: true },
      { text: 'पूरा पता', bold: true },
      { text: 'तहसील', bold: true },
      { text: 'जिला', bold: true },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.vahan_prakar || '',
        item.vahan_kramank || '',
        item.anumanit_mulya || '',
        item.malik_name || '',
        item.pita_ka_name || '',
        item.pata || '',
        item.tahsil || '',
        item.jila || '',
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
    ];

    const anyaJaptSamanHeader = [
      { text: 'सामग्री का विवरण', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'मात्रा (घन मीटर)', bold: true },
      { text: 'अनुमानित मूल्य', bold: true },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.if_other_then_detail || '',
        item.nag || 0,
        item.ghan_meter || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0]]) // default row if empty
    ];

    const chattaHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'चट्टा संख्या', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.nag || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0]]) // default row if empty
    ];

    const balliHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'लम्बाई वर्ग(मी.)', bold: true },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const chiranHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'लम्बाई(मी.)', bold: true },
      { text: 'चौड़ाई(सें.मी.)', bold: true },
      { text: 'मोटाई(सें.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'आयतन(घ.मी.)', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.golai || 0,
        item.motai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const kasthHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'हालात', bold: true },
      { text: 'लम्बाई(मी.)', bold: true },
      { text: 'गोलाई(सें.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'आयतन(घ.मी.)', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.kasth_halat_name || 0,
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const contentOfJaptiSaman: any[] = [];

    let listOfJaptOnlyVahanMaliDetail: JaptVahanDetailInterfaceOnlyMalikDetail[] = [];

    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {

      let listOfJaptOnlyVahanDetail: JaptVahanDetailInterfaceOnlyVahanDetail[] = [];

      for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {
        let value = this.listOfJaptVahanDetail[itemIndex];
        const model: JaptVahanDetailInterfaceOnlyVahanDetail = {
          vahan_table_id: value.vahan_table_id,
          vahan_prakar: value.vahan_prakar,
          vahan_kramank: value.vahan_kramank,
          anumanit_mulya: value.anumanit_mulya
        };

        const modelOnlyMalikVivran: JaptVahanDetailInterfaceOnlyMalikDetail = {
          vahan_table_id: value.vahan_table_id,
          malik_name: value.malik_name,
          pita_ka_name: value.pita_ka_name,
          pata: value.pata,
          tahsil: value.tahsil,
          jila: value.jila
        };

        listOfJaptOnlyVahanDetail.push(model);
        listOfJaptOnlyVahanMaliDetail.push(modelOnlyMalikVivran);

      }

      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildjaptVahanBodyOnlyVahanDetail(listOfJaptOnlyVahanDetail)
          }
        },
        {
          text: [
            { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
            { text: this.totalVahanPrice },
          ]
        },
        { text: '\n' }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalKashthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalKashthRashi }
          ]
        },
        { text: '\n' }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 60],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalBalliRashi }
          ]
        },
        { text: '\n' }
      );
    }

    // चिरान का विवरण
    if (chiranItems && chiranItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChiranNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalChiranRashi }
          ]
        },
        { text: '\n' }
      );
    }

    // जलाऊ का विवरण
    if (chattaItems && chattaItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalChattaRashi },
          ]
        },
        { text: '\n' }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalOtherJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
            { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
            { text: this.totalAnumanitRashi },
          ]
        },
        { text: '\n' }
      );
    }

    let goswara: any[] = [];

    goswara.push(

      {
        text: [
          { text: 'जप्त वाहन : ' },
          { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true }
        ],

      },
      { text: '\n' }

    );

    if (kasthItems && kasthItems.length > 0) {

      goswara.push(

        {
          text: [
            { text: 'जप्त लट्ठा : ' },
            { text: 'कुल संख्या - ', bold: true },
            { text: this.totalKashthNag, bold: true },
            { text: ', कुल आयतन (घ.मी.) - ', bold: true },
            { text: this.totalKashthGhanMeter, bold: true }
          ]
        },

        { text: '\n' }

      );

    }

    if (balliItems && balliItems.length > 0) {

      goswara.push(

        {
          text: [
            { text: 'जप्त बल्ली : ' },
            { text: 'कुल संख्या - ', bold: true },
            { text: this.totalBalliNag, bold: true }
          ]
        },

        { text: '\n' }

      );

    }

    if (chiranItems && chiranItems.length > 0) {

      goswara.push(

        {
          text: [
            { text: 'जप्त चिरान : ' },
            { text: 'कुल संख्या - ', bold: true },
            { text: this.totalChiranNag, bold: true },
            { text: ', कुल आयतन (घ.मी.) - ', bold: true },
            { text: this.totalChiranGhanMeter, bold: true }
          ]
        },

        { text: '\n' }

      );

    }

    if (chattaItems && chattaItems.length > 0) {

      goswara.push(

        {
          text: [
            { text: 'जप्त जलाऊ : ' },
            { text: 'कुल संख्या - ', bold: true },
            { text: this.totalChattaNag, bold: true }
          ]
        },
        { text: '\n' }

      );

    }

    const japtVahanHeader2 = [
      { text: 'मालिक का नाम', bold: true },
      { text: 'पिता का नाम', bold: true },
      { text: 'पूरा पता', bold: true },
      { text: 'तहसील', bold: true },
      { text: 'जिला', bold: true },
    ];

    const buildjaptVahanBody2 = (items: any[] = []) => [
      japtVahanHeader2,
      ...(items.length > 0 ? items.map(item => [
        item.malik_name || '',
        item.pita_ka_name || '',
        item.pata || '',
        item.tahsil || '',
        item.jila || '',
      ]) : [['-', 0, 0, 0, 0]])
    ];

    const docDefinition: any = {
      content: [
        {
          text: [
            'कार्यालय, वन परिक्षेत्र अधिकारी - ',
            { text: this.comingComplaintData.range_name }
          ],
          style: 'title'
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },

        {
          columns: [
            { text: ['क्रमांक : ', { text: this.roPatraKramank, bold: true }] },
            { text: [{ text: this.comingComplaintData.range_name, bold: true }, ', दिनांक : ', { text: this.convertDateString(this.roPatraDinank), bold: true }], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },

        { text: '\n' },

        {
          text: "प्रति, "
        },

        { text: '\n' },

        {
          text: [
            "प्राधिकृत अधिकारी \n",
            "एवं उपवनमंडलाधिकारी ",
            { text: this.sub_division_name }
          ],
          margin: [40, 0, 0, 0] // left, top, right, bottom
        },

        { text: '\n' },

        {
          text: [
            "विषय : ",
            { text: this.crim_type, bold: true },
            { text: " वन अपराध प्रकरण में लिप्त " }, { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
            { text: " को राजसात करने के सम्बन्ध में प्रस्ताव भेजने बाबत |" }
          ]
        },

        { text: '\n' },

        {
          text: [

            { text: "विषयान्तर्गत निवेदन है कि प्राथमिक अपराध प्रकरण क्रमांक " },

            { text: this.por_number, bold: true },

            " दिनांक ",

            { text: this.crimeDate, bold: true },

            " में अवैध परिवहन ",

          ],

          margin: [40, 0, 0, 0]

        },

        {
          text: [

            { text: "कार्य में लिप्त " },

            { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },

            " को जप्तशुदा वनोपज एवं अपराध में उपयोग में लाया गया | उक्त वाहन को राजसात करने का प्रस्ताव प्रेषित है |"
          ]
        },


        { text: "\n" },

        { text: "प्रकरण से सम्बंधित विवरण निम्नानुसार है :-" },

        { text: "\n" },

        {
          columns: [
            {
              text: ['1. प्राथमिक वन अपराध सुचना क्रमांक एवं दिनांक : ',
                { text: this.por_number, bold: true }, " , ",
                { text: this.crimeDate, bold: true }
              ]
            }
          ]
        },

        { text: "\n" },

        { text: '2. अपराधी का नाम , पिता का नाम , निवास स्थान , तहसील ,जिला : ' },

        { text: '\n' },

        accusedSectionBody1,

        { text: '\n' },

        { text: '3. जप्त माल का विवरण तथा उसका अनुमानित मूल्य : ' },
        { text: '\n' },
        contentOfJaptiSaman,


        {
          columns: [
            {
              text: [{ text: 'कुल अनुमानित मूल्य (वाहन + वनोपज) : ', bold: true, fontSize: 15 },
              { text: this.total_anumanit_mulya_vahan_plus_vanoj, bold: true, fontSize: 15 }
              ]
            }
          ]
        },

        { text: '\n' },
        { text: '\n' },

        {
          columns: [
            {
              text: ['4. जप्ती का दिनांक , समय व स्थान : ',
                { text: this.crimeDate, bold: true }, " , ",
                { text: this.crimePlace, bold: true }
              ],
            }
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        { text: '5. उस व्यक्ति का नाम जिससे कॉलम (3) में दर्शाया माल जप्त किया गया : ' },
        { text: '\n' },
        accusedSectionBody2,

        { text: '\n' },

        {
          columns: [
            {
              text: ['6. अपराध का विवरण अधिनियम एवं धारा , जिसके अंतर्गत अपराध हुआ : ',
                { text: this.crime_dhara, bold: true }
              ]
            },
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        { text: '7. जप्तशुदा वस्तु (वनोपज के अतिरित) के मालिक का नाम , पिता का नाम , निवासी तहसील , जिला (यदि वन अपराध से भिन्न हो) : ' },

        { text: '\n' },

        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*'],
            body: buildjaptVahanBody2(listOfJaptOnlyVahanMaliDetail)
          }
        },


        { text: '\n' },

        {
          columns: [
            {
              text: ['8. जप्त करने वाले अधिकारी का नाम व पद : ',
                { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }
              ]
            },
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          columns: [
            {
              text: ['9. जप्तशुदा वस्तु किस स्थान पर तथा किसके प्रभार में है : ',
                { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }
              ]
            },
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        { text: '10. यदि जप्त शुदा वस्तु प्राधिकृत अधिकारी के समक्ष लाकर प्रस्तुत नहीं की गई हो तो उसका विवरण : ' },

        { text: '\n' },

        goswara,

        ,

        { text: '\n' },

        { text: '11. अन्य विशेष विवरण एवं विवरण : ' },
        { text: '\n' },
        { text: this.anya_vishesh_vivran_and_prastaw, bold: true },

        { text: '\n' },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },

        {
          columns: [
            { text: ['अतः जानकारी सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर प्रस्तुत है |'], alignment: 'left' },
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          columns: [
            { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

        {
          columns: [
            { text: [{ text: this.comingComplaintData.range_name }, { text: " परिक्षेत्र" }], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

        {
          columns: [

            {
              text: [
                { text: 'पृ. क्रमांक : ' },
                { text: this.pristh_kramank, bold: true }
              ]
            },

            { text: [{ text: "दिनांक : " }, { text: this.convertDateString(this.patra_dinank), bold: true }], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          text: [
            { text: "प्रतिलिपि :- वनमंडलाधिकारी, ", bold: true },
            { text: this.divisionName, bold: true },
            { text: ' , वनमंडल को सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर सम्प्रेषित है |', bold: true },
          ]
        },

        { text: '\n' },

        {
          columns: [
            { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

        {
          columns: [
            { text: [{ text: this.comingComplaintData.range_name }, { text: " परिक्षेत्र" }], alignment: 'right' },
          ],
          margin: [0, 10, 0, 0]
        },

      ],
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        subTitle: {
          fontSize: 14,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        section: {
          bold: true,
          margin: [0, 10, 0, 2]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 12
      }

    }

    const safePorNumber = (this.comingComplaintData?.por_number || '')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_');
    const fileName = `गिरफ़्तारी_पत्रक_PDF_${safePorNumber}.pdf`;

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download(fileName);

    } else if (this.platForm.is('android')) {

      // sandeeppdfstart
      await this.checkAndRequestStoragePermission();

      const PDF_TIMEOUT_MS = 35000;

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('PDF generation timed out. Please try again.'));
        }, PDF_TIMEOUT_MS);

        pdfMake.createPdf(docDefinition).getDataUrl((dataUrlResult: string) => {
          clearTimeout(timer);
          if (dataUrlResult) {
            resolve(dataUrlResult);
          } else {
            reject(new Error('PDF generation failed.'));
          }
        });
      }).catch(err => {
        this.longToast(err?.message || 'PDF तैयार नहीं हो सका।');
        return;
      });

      if (!dataUrl) return;

      try {
        const base64Payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Payload,
          directory: Directory.Documents,
          recursive: true
        });

        await Share.share({
          title: 'गिरफ़्तारी पत्रक PDF',
          text: 'गिरफ़्तारी पत्रक पीडीएफ',
          url: savedFile.uri,
          dialogTitle: 'Share or Save PDF'
        });
      } catch (err: any) {
        this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
      }
      // sandeeppdfend
    }

  }

  async generatePdfForPradhikritAdhikari() {

    if (this.isRO) {
      if (this.patra_kramank === "") {
        this.showError("पत्र क्रमांक लिखें");
        return;
      }

      let isValidKasthEntry = true;
      let isValidChiranEntry = true;
      let isValidJalauEntry = true;
      let isValidBalliEntry = true;

      for (let i = 0; i < this.listOfKashthaDetail.length; i++) {
        const row = this.listOfKashthaDetail[i];

        if (
          !row.prajati_type ||
          !row.kasth_halat ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost ||
          !row.ghan_meter
        ) {
          isValidKasthEntry = false;

          break;
        }
      }

      if (!isValidKasthEntry) {
        this.showError("लट्ठा की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }


      for (let i = 0; i < this.listOfBalliDetail.length; i++) {
        const row = this.listOfBalliDetail[i];

        if (
          !row.prajati_type ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost
        ) {
          isValidBalliEntry = false;

          break;
        }
      }

      if (!isValidBalliEntry) {
        this.showError("बल्ली की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      for (let i = 0; i < this.listOfChiranaDetail.length; i++) {
        const row = this.listOfChiranaDetail[i];

        if (
          !row.prajati_type ||
          !row.motai ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost ||
          !row.ghan_meter
        ) {
          isValidChiranEntry = false;

          break;
        }
      }

      if (!isValidChiranEntry) {
        this.showError("चिरान की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      for (let i = 0; i < this.listOfChattaDetail.length; i++) {
        const row = this.listOfChattaDetail[i];

        if (
          !row.prajati_type ||
          !row.nag ||
          !row.dar ||
          !row.total_cost
        ) {
          isValidJalauEntry = false;

          break;
        }
      }

      if (!isValidJalauEntry) {
        this.showError("जलाऊ की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      let isValidOtherJaptSamanEntry = true;


      for (let i = 0; i < this.listOfOtherJaptSamanDetail.length; i++) {
        const row = this.listOfOtherJaptSamanDetail[i];

        if (!row.total_cost) {
          isValidOtherJaptSamanEntry = false;
          break;
        }

      }
      if (!isValidOtherJaptSamanEntry) {
        this.showError("अन्य जप्त सामान की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      if (this.anya_vishesh_vivran_and_prastaw === "") {
        this.showError("अन्य विशेष विवरण एवं प्रस्ताव");
        return;
      }

      if (this.pristh_kramank === "") {
        this.showError("पृ. क्रमांक लिखें");
        return;
      }

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

      const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
      const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

      const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
      const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
      const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
      const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
      const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');


      const japtVahanHeaderOnlyVahanDetail = [
        { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
        { text: 'वाहन क्रमांक', bold: true },
        { text: 'अनुमानित मूल्य', bold: true }
      ];

      const buildjaptVahanBodyOnlyVahanDetail = (items: any[] = []) => [
        japtVahanHeaderOnlyVahanDetail,
        ...(items.length > 0 ? items.map(item => [
          item.vahan_prakar || '',
          item.vahan_kramank || '',
          item.anumanit_mulya || '',
        ]) : [['-', 0, 0]])
      ];




      const japtVahanHeader = [
        { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
        { text: 'वाहन क्रमांक', bold: true },
        { text: 'अनुमानित मूल्य', bold: true },
        { text: 'मालिक का नाम', bold: true },
        { text: 'पिता का नाम', bold: true },
        { text: 'पूरा पता', bold: true },
        { text: 'तहसील', bold: true },
        { text: 'जिला', bold: true },
      ];

      const buildjaptVahanBody = (items: any[] = []) => [
        japtVahanHeader,
        ...(items.length > 0 ? items.map(item => [
          item.vahan_prakar || '',
          item.vahan_kramank || '',
          item.anumanit_mulya || '',
          item.malik_name || '',
          item.pita_ka_name || '',
          item.pata || '',
          item.tahsil || '',
          item.jila || '',
        ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
      ];

      const anyaJaptSamanHeader = [
        { text: 'सामग्री का विवरण', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'मात्रा (घन मीटर)', bold: true },
        { text: 'अनुमानित मूल्य', bold: true },
      ];

      const buildAnyaJaptSamanBody = (items: any[] = []) => [
        anyaJaptSamanHeader,
        ...(items.length > 0 ? items.map(item => [
          item.if_other_then_detail || '',
          item.nag || 0,
          item.ghan_meter || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0]]) // default row if empty
      ];

      const chattaHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'चट्टा संख्या', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildChattaBody = (items: any[] = []) => [
        chattaHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.nag || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0]]) // default row if empty
      ];

      const balliHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'लम्बाई वर्ग(मी.)', bold: true },
        { text: 'गोलाई वर्ग(से.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildballiBody = (items: any[] = []) => [
        balliHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.lambai || 0,
          item.golai || 0,
          item.nag || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const chiranHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'लम्बाई(मी.)', bold: true },
        { text: 'चौड़ाई(सें.मी.)', bold: true },
        { text: 'मोटाई(सें.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'आयतन(घ.मी.)', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildChiranBody = (items: any[] = []) => [
        chiranHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.lambai || 0,
          item.golai || 0,
          item.motai || 0,
          item.nag || 0,
          item.ghan_meter || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const kasthHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'हालात', bold: true },
        { text: 'लम्बाई(मी.)', bold: true },
        { text: 'गोलाई(सें.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'आयतन(घ.मी.)', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildKasthBody = (items: any[] = []) => [
        kasthHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.kasth_halat_name || 0,
          item.lambai || 0,
          item.golai || 0,
          item.nag || 0,
          item.ghan_meter || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const contentOfJaptiSaman: any[] = [];
      let listOfJaptOnlyVahanMaliDetail: JaptVahanDetailInterfaceOnlyMalikDetail[] = [];
      if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {

        let listOfJaptOnlyVahanDetail: JaptVahanDetailInterfaceOnlyVahanDetail[] = [];

        for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {
          let value = this.listOfJaptVahanDetail[itemIndex];
          const model: JaptVahanDetailInterfaceOnlyVahanDetail = {
            vahan_table_id: value.vahan_table_id,
            vahan_prakar: value.vahan_prakar,
            vahan_kramank: value.vahan_kramank,
            anumanit_mulya: value.anumanit_mulya
          };

          const modelOnlyMalikVivran: JaptVahanDetailInterfaceOnlyMalikDetail = {
            vahan_table_id: value.vahan_table_id,
            malik_name: value.malik_name,
            pita_ka_name: value.pita_ka_name,
            pata: value.pata,
            tahsil: value.tahsil,
            jila: value.jila
          };

          listOfJaptOnlyVahanDetail.push(model);
          listOfJaptOnlyVahanMaliDetail.push(modelOnlyMalikVivran);

        }

        contentOfJaptiSaman.push(
          { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*'],
              body: buildjaptVahanBodyOnlyVahanDetail(listOfJaptOnlyVahanDetail)
            }
          },
          {
            text: [
              { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
              { text: this.totalVahanPrice },
            ]
          },
          { text: '\n' }
        );
      }

      if (kasthItems && kasthItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
              body: buildKasthBody(kasthItems)
            }
          },
          {
            text: [
              { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
              { text: this.totalKashthNag + ',   ' },
              { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalKashthGhanMeter + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalKashthRashi }
            ]
          },
          { text: '\n' }
        );
      }

      if (balliItems && balliItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 60],
              body: buildballiBody(balliItems)
            }
          },
          {
            text: [
              { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
              { text: this.totalBalliNag + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalBalliRashi }
            ]
          },
          { text: '\n' }
        );
      }

      // चिरान का विवरण
      if (chiranItems && chiranItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
              body: buildChiranBody(chiranItems)
            }
          },
          {
            text: [
              { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
              { text: this.totalChiranNag + ',   ' },
              { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalChiranGhanMeter + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalChiranRashi }
            ]
          },
          { text: '\n' }
        );
      }

      // जलाऊ का विवरण
      if (chattaItems && chattaItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*'],
              body: buildChattaBody(chattaItems)
            }
          },
          {
            text: [
              { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
              { text: this.totalChattaNag + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalChattaRashi },
            ]
          },
          { text: '\n' }
        );
      }

      // अन्य जप्त सामग्री का विवरण
      if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*'],
              body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
            }
          },
          {
            text: [
              { text: 'कुल संख्या : ', style: 'subheader', bold: true },
              { text: this.totalOtherJaptSamanNag + ',   ' },
              { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
              { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
              { text: this.totalAnumanitRashi },
            ]
          },
          { text: '\n' }
        );
      }

      let goswara: any[] = [];

      goswara.push(

        {
          text: [
            { text: 'जप्त वाहन : ' },
            { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true }
          ],

        },
        { text: '\n' }

      );

      if (kasthItems && kasthItems.length > 0) {

        goswara.push(

          {
            text: [
              { text: 'जप्त लट्ठा : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalKashthNag, bold: true },
              { text: ', कुल आयतन (घ.मी.) - ', bold: true },
              { text: this.totalKashthGhanMeter, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (balliItems && balliItems.length > 0) {

        // goswara.push(

        //   { text: 'जप्त बल्ली : ', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        //   {
        //     text: [
        //       { text: 'कुल संख्या - ' },
        //       { text: this.totalBalliNag },
        //     ]
        //   },
        //   { text: '\n' }

        // );

        goswara.push(

          {
            text: [
              { text: 'जप्त बल्ली : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalBalliNag, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (chiranItems && chiranItems.length > 0) {

        goswara.push(

          // { text: 'जप्त चिरान : ', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          // {
          //   text: [
          //     { text: 'कुल संख्या - ' },
          //     { text: this.totalChiranNag },
          //     { text: 'कुल आयतन (घ.मी.) - ' },
          //     { text: this.totalChiranGhanMeter },
          //   ]
          // },
          // { text: '\n' }

          {
            text: [
              { text: 'जप्त चिरान : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalChiranNag, bold: true },
              { text: ', कुल आयतन (घ.मी.) - ', bold: true },
              { text: this.totalChiranGhanMeter, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (chattaItems && chattaItems.length > 0) {

        goswara.push(

          // { text: 'जप्त जलाऊ : ', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          // {
          //   text: [
          //     { text: 'कुल संख्या - ' },
          //     { text: this.totalChattaNag },
          //   ]
          // },

          {
            text: [
              { text: 'जप्त जलाऊ : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalChattaNag, bold: true }
            ]
          },
          { text: '\n' }

        );

      }

      const japtVahanHeader2 = [
        { text: 'मालिक का नाम', bold: true },
        { text: 'पिता का नाम', bold: true },
        { text: 'पूरा पता', bold: true },
        { text: 'तहसील', bold: true },
        { text: 'जिला', bold: true },
      ];

      const buildjaptVahanBody2 = (items: any[] = []) => [
        japtVahanHeader2,
        ...(items.length > 0 ? items.map(item => [
          item.malik_name || '',
          item.pita_ka_name || '',
          item.pata || '',
          item.tahsil || '',
          item.jila || '',
        ]) : [['-', 0, 0, 0, 0]])
      ];

      const docDefinition: any = {
        content: [
          {
            text: [
              'कार्यालय, वन परिक्षेत्र अधिकारी - ',
              { text: this.comingComplaintData.range_name }
            ],
            style: 'title'
          },

          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
            ],
            margin: [0, 10, 0, 10]
          },

          {
            columns: [
              { text: ['क्रमांक : ', { text: this.patra_kramank, bold: true }] },
              { text: [{ text: this.rangName, bold: true }, ', दिनांक : ', { text: this.convertDateString(this.patra_dinank), bold: true }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
            ],
            margin: [0, 10, 0, 10]
          },

          { text: '\n' },

          {
            text: "प्रति, "
          },

          { text: '\n' },

          {
            text: [
              "प्राधिकृत अधिकारी \n",
              "एवं उपवनमंडलाधिकारी ",
              { text: this.sub_division_name }
            ],
            margin: [40, 0, 0, 0] // left, top, right, bottom
          },

          { text: '\n' },

          {
            text: [
              "विषय : ",
              { text: this.crim_type, bold: true },
              { text: " वन अपराध प्रकरण में लिप्त " }, { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
              { text: " को राजसात करने के सम्बन्ध में प्रस्ताव भेजने बाबत |" }
            ]
          },

          { text: '\n' },

          {
            text: [

              { text: "विषयान्तर्गत निवेदन है कि प्राथमिक अपराध प्रकरण क्रमांक " },

              { text: this.por_number, bold: true },

              " दिनांक ",

              { text: this.crimeDate, bold: true },

              " में अवैध परिवहन ",

            ],

            margin: [40, 0, 0, 0]

          },

          {
            text: [

              { text: "कार्य में लिप्त " },

              { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },

              " को जप्तशुदा वनोपज एवं अपराध में उपयोग में लाया गया | उक्त वाहन को राजसात करने का प्रस्ताव प्रेषित है |"
            ]
          },


          { text: "\n" },

          { text: "प्रकरण से सम्बंधित विवरण निम्नानुसार है :-" },

          { text: "\n" },

          {
            columns: [
              {
                text: ['1. प्राथमिक वन अपराध सुचना क्रमांक एवं दिनांक : ',
                  { text: this.por_number, bold: true }, " , ",
                  { text: this.crimeDate, bold: true }
                ]
              }
            ]
          },

          { text: "\n" },

          { text: '2. अपराधी का नाम , पिता का नाम , निवास स्थान , तहसील ,जिला : ' },

          { text: '\n' },

          accusedSectionBody1,

          { text: '\n' },

          { text: '3. जप्त माल का विवरण तथा उसका अनुमानित मूल्य : ' },
          { text: '\n' },
          contentOfJaptiSaman,


          {
            columns: [
              {
                text: [{ text: 'कुल अनुमानित मूल्य (वाहन + वनोपज) : ', bold: true, fontSize: 15 },
                { text: this.total_anumanit_mulya_vahan_plus_vanoj, bold: true, fontSize: 15 }
                ]
              }
            ]
          },

          { text: '\n' },
          { text: '\n' },

          {
            columns: [
              {
                text: ['4. जप्ती का दिनांक , समय व स्थान : ',
                  { text: this.crimeDate, bold: true }, " , ",
                  { text: this.crimePlace, bold: true }
                ],
              }
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          { text: '5. उस व्यक्ति का नाम जिससे कॉलम (3) में दर्शाया माल जप्त किया गया : ' },
          { text: '\n' },
          accusedSectionBody2,

          { text: '\n' },

          {
            columns: [
              {
                text: ['6. अपराध का विवरण अधिनियम एवं धारा , जिसके अंतर्गत अपराध हुआ : ',
                  { text: this.crime_dhara, bold: true }
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          { text: '7. जप्तशुदा वस्तु (वनोपज के अतिरित) के मालिक का नाम , पिता का नाम , निवासी तहसील , जिला (यदि वन अपराध से भिन्न हो) : ' },

          { text: '\n' },

          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*'],
              body: buildjaptVahanBody2(listOfJaptOnlyVahanMaliDetail)
            }
          },


          { text: '\n' },

          {
            columns: [
              {
                text: ['8. जप्त करने वाले अधिकारी का नाम व पद : ',
                  { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            columns: [
              {
                text: ['9. जप्तशुदा वस्तु किस स्थान पर तथा किसके प्रभार में है : ',
                  { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          { text: '10. यदि जप्त शुदा वस्तु प्राधिकृत अधिकारी के समक्ष लाकर प्रस्तुत नहीं की गई हो तो उसका विवरण : ' },

          { text: '\n' },

          goswara,

          ,

          { text: '\n' },

          { text: '11. अन्य विशेष विवरण एवं विवरण : ' },
          { text: '\n' },
          { text: this.anya_vishesh_vivran_and_prastaw, bold: true },

          { text: '\n' },

          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
            ],
            margin: [0, 10, 0, 10]
          },

          {
            columns: [
              { text: ['अतः जानकारी सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर प्रस्तुत है |'], alignment: 'left' },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            columns: [
              { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          {
            columns: [
              { text: [{ text: this.rangName }, { text: " परिक्षेत्र" }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          {
            columns: [

              {
                text: [
                  { text: 'पृ. क्रमांक : ' },
                  { text: this.pristh_kramank, bold: true }
                ]
              },

              { text: [{ text: "दिनांक : " }, { text: this.convertDateString(this.patra_dinank), bold: true }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            text: [
              { text: "प्रतिलिपि :- वनमंडलाधिकारी, ", bold: true },
              { text: this.divisionName, bold: true },
              { text: ' , वनमंडल को सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर सम्प्रेषित है |', bold: true },
            ]
          },

          { text: '\n' },

          {
            columns: [
              { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          {
            columns: [
              { text: [{ text: this.rangName }, { text: " परिक्षेत्र" }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

        ],
        styles: {
          title: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 5]
          },
          subTitle: {
            fontSize: 14,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          section: {
            bold: true,
            margin: [0, 10, 0, 2]
          }
        },
        defaultStyle: {
          font: 'NotoSansDevanagari',
          fontSize: 12
        }

      }

      //  ;
      const safePorNumber = (this.comingComplaintData?.por_number || '')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');
      const fileName = `प्राधिकृत_अधिकारी_को_सूचना_PDF_${safePorNumber}.pdf`;

      if (this.platForm.is('desktop')) {

        pdfMake.createPdf(docDefinition).download(fileName);

      } else if (this.platForm.is('android')) {

        // sandeeppdfstart
        await this.checkAndRequestStoragePermission();

        const PDF_TIMEOUT_MS = 35000;

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('PDF generation timed out. Please try again.'));
          }, PDF_TIMEOUT_MS);

          pdfMake.createPdf(docDefinition).getDataUrl((dataUrlResult: string) => {
            clearTimeout(timer);
            if (dataUrlResult) {
              resolve(dataUrlResult);
            } else {
              reject(new Error('PDF generation failed.'));
            }
          });
        }).catch(err => {
          this.longToast(err?.message || 'PDF तैयार नहीं हो सका।');
          return;
        });

        if (!dataUrl) return;

        try {
          const base64Payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Payload,
            directory: Directory.Documents,
            recursive: true
          });

          await Share.share({
            title: 'प्राधिकृत अधिकारी को सूचना PDF',
            text: 'प्राधिकृत अधिकारी को सूचना पीडीएफ',
            url: savedFile.uri,
            dialogTitle: 'Share or Save PDF'
          });
        } catch (err: any) {
          this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
        }
        // sandeeppdfend
      }
    } else if (this.isSDO) {

      if (this.patra_kramank === "") {
        this.showError("पत्र क्रमांक लिखें");
        return;
      }

      if (this.nayayalay_sthan === "") {
        this.showError("स्थान");
        return;
      }

      if (this.sdo_sankhipt_vivran === "") {
        this.showError("उन परिस्थितियों का संक्षिप्त विवरण जिसमे वह जप्त की गई");
        return;
      }

      let isValidKasthEntry = true;
      let isValidChiranEntry = true;
      let isValidJalauEntry = true;
      let isValidBalliEntry = true;

      for (let i = 0; i < this.listOfKashthaDetail.length; i++) {
        const row = this.listOfKashthaDetail[i];

        if (
          !row.prajati_type ||
          !row.kasth_halat ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost ||
          !row.ghan_meter
        ) {
          isValidKasthEntry = false;

          break;
        }
      }

      if (!isValidKasthEntry) {
        this.showError("लट्ठा की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }


      for (let i = 0; i < this.listOfBalliDetail.length; i++) {
        const row = this.listOfBalliDetail[i];

        if (
          !row.prajati_type ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost
        ) {
          isValidBalliEntry = false;

          break;
        }
      }

      if (!isValidBalliEntry) {
        this.showError("बल्ली की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      for (let i = 0; i < this.listOfChiranaDetail.length; i++) {
        const row = this.listOfChiranaDetail[i];

        if (
          !row.prajati_type ||
          !row.motai ||
          !row.lambai ||
          !row.golai ||
          !row.nag ||
          !row.dar ||
          !row.total_cost ||
          !row.ghan_meter
        ) {
          isValidChiranEntry = false;

          break;
        }
      }

      if (!isValidChiranEntry) {
        this.showError("चिरान की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      for (let i = 0; i < this.listOfChattaDetail.length; i++) {
        const row = this.listOfChattaDetail[i];

        if (
          !row.prajati_type ||
          !row.nag ||
          !row.dar ||
          !row.total_cost
        ) {
          isValidJalauEntry = false;

          break;
        }
      }

      if (!isValidJalauEntry) {
        this.showError("जलाऊ की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

      let isValidOtherJaptSamanEntry = true;


      for (let i = 0; i < this.listOfOtherJaptSamanDetail.length; i++) {
        const row = this.listOfOtherJaptSamanDetail[i];

        if (!row.total_cost) {
          isValidOtherJaptSamanEntry = false;
          break;
        }

      }
      if (!isValidOtherJaptSamanEntry) {
        this.showError("अन्य जप्त सामान की सम्पूर्ण जानकारी प्रेषित करें");
        return;
      }

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

      const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
      const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

      const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
      const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
      const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
      const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
      const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

      const japtVahanHeader = [
        { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
        { text: 'वाहन क्रमांक', bold: true },
        { text: 'अनुमानित मूल्य', bold: true }
      ];

      const japtVahanHeader2 = [
        { text: 'मालिक का नाम', bold: true },
        { text: 'पिता का नाम', bold: true },
        { text: 'पूरा पता', bold: true },
        { text: 'तहसील', bold: true },
        { text: 'जिला', bold: true },
      ];

      const buildjaptVahanBody = (items: any[] = []) => [
        japtVahanHeader,
        ...(items.length > 0 ? items.map(item => [
          item.vahan_prakar || '',
          item.vahan_kramank || '',
          item.anumanit_mulya || ''
        ]) : [['-', 0, 0]])
      ];

      const buildjaptVahanBody2 = (items: any[] = []) => [
        japtVahanHeader2,
        ...(items.length > 0 ? items.map(item => [
          item.malik_name || '',
          item.pita_ka_name || '',
          item.pata || '',
          item.tahsil || '',
          item.jila || '',
        ]) : [['-', 0, 0, 0, 0]])
      ];

      const anyaJaptSamanHeader = [
        { text: 'सामग्री का विवरण', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'मात्रा (घन मीटर)', bold: true },
        { text: 'अनुमानित मूल्य', bold: true },
      ];

      const buildAnyaJaptSamanBody = (items: any[] = []) => [
        anyaJaptSamanHeader,
        ...(items.length > 0 ? items.map(item => [
          item.if_other_then_detail || '',
          item.nag || 0,
          item.ghan_meter || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0]]) // default row if empty
      ];

      const chattaHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'चट्टा संख्या', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildChattaBody = (items: any[] = []) => [
        chattaHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.nag || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0]]) // default row if empty
      ];

      const balliHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'लम्बाई वर्ग(मी.)', bold: true },
        { text: 'गोलाई वर्ग(से.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildballiBody = (items: any[] = []) => [
        balliHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.lambai || 0,
          item.golai || 0,
          item.nag || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const chiranHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'लम्बाई(मी.)', bold: true },
        { text: 'चौड़ाई(सें.मी.)', bold: true },
        { text: 'मोटाई(सें.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'आयतन(घ.मी.)', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildChiranBody = (items: any[] = []) => [
        chiranHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.lambai || 0,
          item.golai || 0,
          item.motai || 0,
          item.nag || 0,
          item.ghan_meter || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const kasthHeader = [
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'हालात', bold: true },
        { text: 'लम्बाई(मी.)', bold: true },
        { text: 'गोलाई(सें.मी.)', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'आयतन(घ.मी.)', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true }
      ];

      const buildKasthBody = (items: any[] = []) => [
        kasthHeader,
        ...(items.length > 0 ? items.map(item => [
          item.prajati_name || '',
          item.kasth_halat_name || 0,
          item.lambai || 0,
          item.golai || 0,
          item.nag || 0,
          item.ghan_meter || 0,
          item.dar || 0,
          item.total_cost || 0
        ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
      ];

      const contentOfJaptiSaman: any[] = [];

      if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*'],
              body: buildjaptVahanBody(this.listOfJaptVahanDetail)
            }
          },
          {
            text: [
              { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
              { text: this.totalVahanPrice },
            ]
          },
          { text: '\n' }
        );
      }

      if (kasthItems && kasthItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
              body: buildKasthBody(kasthItems)
            }
          },
          {
            text: [
              { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
              { text: this.totalKashthNag + ',   ' },
              { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalKashthGhanMeter + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalKashthRashi }
            ]
          },
          { text: '\n' }
        );
      }

      if (balliItems && balliItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 60],
              body: buildballiBody(balliItems)
            }
          },
          {
            text: [
              { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
              { text: this.totalBalliNag + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalBalliRashi }
            ]
          },
          { text: '\n' }
        );
      }

      // चिरान का विवरण
      if (chiranItems && chiranItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
              body: buildChiranBody(chiranItems)
            }
          },
          {
            text: [
              { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
              { text: this.totalChiranNag + ',   ' },
              { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalChiranGhanMeter + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalChiranRashi }
            ]
          },
          { text: '\n' }
        );
      }

      // जलाऊ का विवरण
      if (chattaItems && chattaItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*'],
              body: buildChattaBody(chattaItems)
            }
          },
          {
            text: [
              { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
              { text: this.totalChattaNag + ',   ' },
              { text: 'कुल राशि : ', style: 'subheader', bold: true },
              { text: this.totalChattaRashi },
            ]
          },
          { text: '\n' }
        );
      }

      // अन्य जप्त सामग्री का विवरण
      if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
        contentOfJaptiSaman.push(
          { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*'],
              body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
            }
          },
          {
            text: [
              { text: 'कुल संख्या : ', style: 'subheader', bold: true },
              { text: this.totalOtherJaptSamanNag + ',   ' },
              { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
              { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
              { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
              { text: this.totalAnumanitRashi },
            ]
          },
          { text: '\n' }
        );
      }



      let goswara: any[] = [];

      goswara.push(

        {
          text: [
            { text: 'जप्त वाहन : ' },
            { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true }
          ],

        },
        { text: '\n' }

      );

      if (kasthItems && kasthItems.length > 0) {

        goswara.push(

          {
            text: [
              { text: 'जप्त लट्ठा : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalKashthNag, bold: true },
              { text: ', कुल आयतन (घ.मी.) - ', bold: true },
              { text: this.totalKashthGhanMeter, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (balliItems && balliItems.length > 0) {

        goswara.push(

          {
            text: [
              { text: 'जप्त बल्ली : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalBalliNag, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (chiranItems && chiranItems.length > 0) {

        goswara.push(

          {
            text: [
              { text: 'जप्त चिरान : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalChiranNag, bold: true },
              { text: ', कुल आयतन (घ.मी.) - ', bold: true },
              { text: this.totalChiranGhanMeter, bold: true }
            ]
          },

          { text: '\n' }

        );

      }

      if (chattaItems && chattaItems.length > 0) {

        goswara.push(

          {
            text: [
              { text: 'जप्त जलाऊ : ' },
              { text: 'कुल संख्या - ', bold: true },
              { text: this.totalChattaNag, bold: true }
            ]
          },
          { text: '\n' }

        );

      }

      let listOfJaptOnlyVahanMaliDetail: JaptVahanDetailInterfaceOnlyMalikDetail[] = [];

      let listOfJaptOnlyVahanDetail: JaptVahanDetailInterfaceOnlyVahanDetail[] = [];

      for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {
        let value = this.listOfJaptVahanDetail[itemIndex];
        const model: JaptVahanDetailInterfaceOnlyVahanDetail = {
          vahan_table_id: value.vahan_table_id,
          vahan_prakar: value.vahan_prakar,
          vahan_kramank: value.vahan_kramank,
          anumanit_mulya: value.anumanit_mulya
        };

        const modelOnlyMalikVivran: JaptVahanDetailInterfaceOnlyMalikDetail = {
          vahan_table_id: value.vahan_table_id,
          malik_name: value.malik_name,
          pita_ka_name: value.pita_ka_name,
          pata: value.pata,
          tahsil: value.tahsil,
          jila: value.jila
        };

        listOfJaptOnlyVahanDetail.push(model);
        listOfJaptOnlyVahanMaliDetail.push(modelOnlyMalikVivran);

      }

      const docDefinition: any = {
        content: [

          {
            text: [
              'कार्यालय, उपवन मंडलाधिकारी - ',
              { text: this.sub_division_name }
            ],
            style: 'title'
          },

          {
            columns: [
              { text: ['क्रमांक : ', { text: this.patra_kramank, bold: true }], alignment: 'left' },
              { text: [{ text: this.sub_division_name }, ', दिनांक : ', { text: this.convertDateString(this.patra_dinank), bold: true }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            text: "प्रति,"
          },

          { text: '\n' },

          {
            text: [
              "न्यायिक दण्डाधिकारी\n",
              { text: this.nayayalay_sthan }
            ],
            margin: [40, 0, 0, 0]
          },

          { text: '\n' },

          {
            text: [
              "विषय : प्रथम अपराध सूचना क्रमांक ",
              { text: this.por_number, bold: true },
              { text: " दिनांक " }, { text: this.crimeDate, bold: true },
              { text: " में प्रयुक्त वाहन " },
              { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
              { text: " को राजसात करने की कार्यवाही प्रारम्भ करने की सूचना | " },
            ]
          },
          { text: '\n' },
          {
            text: [
              { text: " निवेदन है कि मैंने " },
              { text: this.crime_dhara, bold: true },
              { text: " की धारा के अनुसार वन अपराध में प्रयुक्त होने वाली " },
              { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
              { text: " को राजसात करने की कार्यवाही प्रारम्भ कर दी है , जिसकी सूचना निम्न विवरण में दी जा रही है  : " }
            ],

            leadingIndent: 40

          },


          { text: '\n' },

          { text: ['1 (अ) उस वस्तु का विवरण जिसको राजसात किया जाना प्रस्तावित है : '] },
          { text: '\n' },
          goswara,

          { text: ['(ब) उन परिस्थितियों का संक्षिप्त विवरण जिसमे वह जप्त की गई : '] },
          { text: '\n' },
          { text: this.sdo_sankhipt_vivran, bold: true },

          { text: '\n' },

          { text: '2. जप्त शुदा वस्तु के मालिक का विवरण : ' },

          { text: '\n' },

          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*'],
              body: buildjaptVahanBody2(listOfJaptOnlyVahanMaliDetail)
            }
          },

          { text: '3. उस व्यक्ति का नाम / पिता का नाम , निवासी जिससे कॉलम (अ) में दर्शाई संपत्ति जप्त की गई : ' },

          { text: '\n' },

          accusedSectionBody1,

          {
            columns: [
              {
                text: ['4. जप्ती का दिनांक , समय व स्थान : ',
                  { text: this.crimeDate, bold: true }, " , ",
                  { text: this.crimePlace, bold: true }]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            columns: [
              {
                text: ['5. उस अधिकारी का नाम व पद जिसने ऊपर वर्णित वस्तु जप्त की : ',
                  { text: this.japtikarta_ka_name, bold: true },
                  { text: this.japtikarta_ka_pad, bold: true }
                ]
              },

            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },

          {
            columns: [
              {
                text: ['6. जप्त शुदा वस्तु का अनुमानित मूल्य : '
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          contentOfJaptiSaman,

          {
            columns: [
              {
                text: [{ text: 'कुल अनुमानित मूल्य (वाहन + वनोपज) : ', bold: true, fontSize: 15 },
                { text: this.total_anumanit_mulya_vahan_plus_vanoj, bold: true, fontSize: 15 }
                ]
              }
            ]
          },


          { text: '\n' },

          {
            columns: [
              {
                text: ['7. अपराध / अपराधों का विवरणमय धारा व अधिनियम जिनके अंतर्गत अपराध हुआ है : ',
                  { text: this.crime_dhara, bold: true }
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n' },
          {
            columns: [
              {
                text: ['8. सूचना प्रेषण का दिनांक : ',
                  { text: this.patra_dinank, bold: true }
                ]
              },
            ],
            margin: [0, 10, 0, 0]
          },

          { text: '\n\n\n' },

          {
            columns: [
              { text: [{ text: 'प्राधिकृत अधिकारी', bold: true }], alignment: 'right' },
            ],
            margin: [0, 10, 0, 0]
          },

        ],
        styles: {
          title: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 5]
          },
          subTitle: {
            fontSize: 14,
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          section: {
            bold: true,
            margin: [0, 10, 0, 2]
          }
        },
        defaultStyle: {
          font: 'NotoSansDevanagari',
          fontSize: 12
        }

      }

      const safePorNumber = (this.comingComplaintData?.por_number || '')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');
      const fileName = `न्यायिक_दण्डाधिकारी_को_सूचना_PDF_${safePorNumber}.pdf`;

      if (this.platForm.is('desktop')) {

        pdfMake.createPdf(docDefinition).download(fileName);

      } else if (this.platForm.is('android')) {

        // sandeeppdfstart
        await this.checkAndRequestStoragePermission();

        const PDF_TIMEOUT_MS = 35000;

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('PDF generation timed out. Please try again.'));
          }, PDF_TIMEOUT_MS);

          pdfMake.createPdf(docDefinition).getDataUrl((dataUrlResult: string) => {
            clearTimeout(timer);
            if (dataUrlResult) {
              resolve(dataUrlResult);
            } else {
              reject(new Error('PDF generation failed.'));
            }
          });
        }).catch(err => {
          this.longToast(err?.message || 'PDF तैयार नहीं हो सका।');
          return;
        });

        if (!dataUrl) return;

        try {
          const base64Payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Payload,
            directory: Directory.Documents,
            recursive: true
          });

          await Share.share({
            title: 'न्यायिक दण्डाधिकारी को सूचना PDF',
            text: 'न्यायिक दण्डाधिकारी को सूचना पीडीएफ',
            url: savedFile.uri,
            dialogTitle: 'Share or Save PDF'
          });
        } catch (err: any) {
          this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
        }
        // sandeeppdfend
      }
    }

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

    const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
    const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');


    const japtVahanHeaderOnlyVahanDetail = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
      { text: 'वाहन क्रमांक', bold: true },
      { text: 'अनुमानित मूल्य', bold: true }
    ];

    const buildjaptVahanBodyOnlyVahanDetail = (items: any[] = []) => [
      japtVahanHeaderOnlyVahanDetail,
      ...(items.length > 0 ? items.map(item => [
        item.vahan_prakar || '',
        item.vahan_kramank || '',
        item.anumanit_mulya || '',
      ]) : [['-', 0, 0]])
    ];




    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
      { text: 'वाहन क्रमांक', bold: true },
      { text: 'अनुमानित मूल्य', bold: true },
      { text: 'मालिक का नाम', bold: true },
      { text: 'पिता का नाम', bold: true },
      { text: 'पूरा पता', bold: true },
      { text: 'तहसील', bold: true },
      { text: 'जिला', bold: true },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.vahan_prakar || '',
        item.vahan_kramank || '',
        item.anumanit_mulya || '',
        item.malik_name || '',
        item.pita_ka_name || '',
        item.pata || '',
        item.tahsil || '',
        item.jila || '',
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
    ];

    const anyaJaptSamanHeader = [
      { text: 'सामग्री का विवरण', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'मात्रा (घन मीटर)', bold: true },
      { text: 'अनुमानित मूल्य', bold: true },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.if_other_then_detail || '',
        item.nag || 0,
        item.ghan_meter || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0]]) // default row if empty
    ];

    const chattaHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'चट्टा संख्या', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.nag || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0]]) // default row if empty
    ];

    const balliHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'लम्बाई वर्ग(मी.)', bold: true },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const chiranHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'लम्बाई(मी.)', bold: true },
      { text: 'चौड़ाई(सें.मी.)', bold: true },
      { text: 'मोटाई(सें.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'आयतन(घ.मी.)', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.golai || 0,
        item.motai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const kasthHeader = [
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'हालात', bold: true },
      { text: 'लम्बाई(मी.)', bold: true },
      { text: 'गोलाई(सें.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'आयतन(घ.मी.)', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशि', bold: true }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.kasth_halat_name || 0,
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    ];

    const contentOfJaptiSaman: any[] = [];

    let listOfJaptOnlyVahanMaliDetail: JaptVahanDetailInterfaceOnlyMalikDetail[] = [];

    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {

      let listOfJaptOnlyVahanDetail: JaptVahanDetailInterfaceOnlyVahanDetail[] = [];

      for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {
        let value = this.listOfJaptVahanDetail[itemIndex];
        const model: JaptVahanDetailInterfaceOnlyVahanDetail = {
          vahan_table_id: value.vahan_table_id,
          vahan_prakar: value.vahan_prakar,
          vahan_kramank: value.vahan_kramank,
          anumanit_mulya: value.anumanit_mulya
        };

        const modelOnlyMalikVivran: JaptVahanDetailInterfaceOnlyMalikDetail = {
          vahan_table_id: value.vahan_table_id,
          malik_name: value.malik_name,
          pita_ka_name: value.pita_ka_name,
          pata: value.pata,
          tahsil: value.tahsil,
          jila: value.jila
        };

        listOfJaptOnlyVahanDetail.push(model);
        listOfJaptOnlyVahanMaliDetail.push(modelOnlyMalikVivran);

      }

      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildjaptVahanBodyOnlyVahanDetail(listOfJaptOnlyVahanDetail)
          }
        },
        {
          text: [
            { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
            { text: this.totalVahanPrice },
          ]
        },
        { text: '\n' }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalKashthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalKashthRashi }
          ]
        },
        { text: '\n' }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 60],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalBalliRashi }
          ]
        },
        { text: '\n' }
      );
    }

    // चिरान का विवरण
    if (chiranItems && chiranItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChiranNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalChiranRashi }
          ]
        },
        { text: '\n' }
      );
    }

    // जलाऊ का विवरण
    if (chattaItems && chattaItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalChattaRashi },
          ]
        },
        { text: '\n' }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalOtherJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
            { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
            { text: this.totalAnumanitRashi },
          ]
        },
        { text: '\n' }
      );
    }

    let goswara: any[] = [];

    if (this.totalVahanDetailWithNumberFor_VisayTitle != "") {
      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त वाहन : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

        //{ text: '\n' }

      );
    }

    if (kasthItems && kasthItems.length > 0) {

      goswara.push(



        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त लट्ठा : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalKashthNag, bold: true },
                    { text: ', कुल आयतन (घ.मी.) - ', bold: true }, { text: this.totalKashthGhanMeter, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },


      );

    }

    if (balliItems && balliItems.length > 0) {

      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त बल्ली : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalBalliNag, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

        //{ text: '\n' }

      );

    }

    if (chiranItems && chiranItems.length > 0) {

      goswara.push(


        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त चिरान : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalChiranNag, bold: true },
                    { text: ', कुल आयतन (घ.मी.) - ', bold: true }, { text: this.totalChiranGhanMeter, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

        //{ text: '\n' }

      );

    }

    if (chattaItems && chattaItems.length > 0) {

      goswara.push(


        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त जलाऊ : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalChattaNag, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

        //{ text: '\n' }

      );

    }

    if (this.baansItemsList && this.baansItemsList.length > 0) {

      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त औद्योगिक बांस : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalOdyogicBanshNag, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

      );

    }

    if (this.baansItemsList && this.baansItemsList.length > 0) {

      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त व्यापारिक बांस : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalVyaprikBanshNag, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

      );

    }

    if (this.polItemsList && this.polItemsList.length > 0) {

      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'जप्त फेंसिंग पोल : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                {
                  text: [
                    { text: 'कुल संख्या - ', bold: true }, { text: this.totalPolNag, bold: true }
                  ], alignment: 'left', margin: [0, 0, 0, 10]
                }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

      );

    }

    if (this.otherJaptSamanTotalDetail != "") {
      goswara.push(

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: 'अन्य जप्त सामान : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: this.otherJaptSamanTotalDetail, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
              ]
            }
          ],
          margin: [0, 5, 0, 0]
        },

        //{ text: '\n' }

      );
    }

    const japtVahanHeader2 = [
      { text: 'मालिक का नाम', bold: true },
      { text: 'पिता का नाम', bold: true },
      { text: 'पूरा पता', bold: true },
      { text: 'तहसील', bold: true },
      { text: 'जिला', bold: true },
    ];

    const buildjaptVahanBody2 = (items: any[] = []) => [
      japtVahanHeader2,
      ...(items.length > 0 ? items.map(item => [
        item.malik_name || '',
        item.pita_ka_name || '',
        item.pata || '',
        item.tahsil || '',
        item.jila || '',
      ]) : [['-', 0, 0, 0, 0]])
    ];

    const contentArray: any[] = [];


    for (let index = 0; index < this.accusedPersonsList.length; index++) {

      const goswaraClone = JSON.parse(JSON.stringify(goswara));

      let accussedModel = this.accusedPersonsList[index];

      let name = accussedModel.name || '--';
      let fatherName = accussedModel.fathersName || '--';

      let age = accussedModel.age || '--';
      let mobile = accussedModel.mobile_number || '--';
      let aadhaar = accussedModel.aadhaar_number || '—';

      let cast = accussedModel.cast || '--';
      let jati = accussedModel.jati_name || '--';

      let address = accussedModel.address || '--';

      let gir_sthan = accussedModel.gir_sthan;
      let gir_date = accussedModel.gir_date
        ? accussedModel.gir_date.split('-').reverse().join('-')
        : '--';
      let gir_time = this.to12Hour(accussedModel.gir_time);

      let gir_adhikari = accussedModel.gir_adhikari;

      let gir_paya_gaya_saman = accussedModel.gir_paya_gaya_saman || '--';

      let gir_body_mark = accussedModel.gir_body_mark || '--';

      let accusedContent = [
        {
          text: [
            'गिरफ्तारी पत्रक',
          ],
          style: 'title'
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },


        {
          text: '1. अभियुक्त का विवरण :', bold: false
        },

        {
          table: {
            widths: ['45%', '35%', '20%'],
            body: [
              [
                { text: 'अभियुक्त का नाम :', margin: [10, 0, 0, 3] },
                { text: name, bold: true, margin: [0, 0, 0, 3] },
                {
                  rowSpan: 8,
                  alignment: 'right',
                  margin: [0, 5, 0, 0],
                  canvas: [
                    { type: 'rect', x: 0, y: 0, w: 90, h: 100 }
                  ]
                }
              ],
              [
                { text: 'पिता का नाम :', margin: [10, 0, 0, 3] },
                { text: fatherName, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'उम्र :', margin: [10, 0, 0, 3] },
                { text: age, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'मोबाइल :', margin: [10, 0, 0, 3] },
                { text: mobile, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'आधार नंबर :', margin: [10, 0, 0, 3] },
                { text: aadhaar, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'जाति वर्ग :', margin: [10, 0, 0, 3] },
                { text: cast, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'जाति :', margin: [10, 0, 0, 3] },
                { text: jati, bold: true, margin: [0, 0, 0, 3] },
                {}
              ],
              [
                { text: 'पता :', margin: [10, 0, 0, 3] },
                { text: address, bold: true, margin: [0, 0, 0, 3] },
                {}
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 0]
        },


        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '2. वन अपराध जिसके सम्बन्ध में गिरफ्तार किया गया : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: this.crime_type, bold: true }, ', ', { text: this.crime_dhara, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '3. अपराध क्रमांक और दिनांक : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: this.por_number, bold: true }, ', ', { text: this.crimeDate, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '4. गिरफ्तारी का स्थान , दिनांक एवं समय : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: gir_sthan, bold: true }, ', ', { text: gir_date, bold: true }, ', ', { text: gir_time, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },


        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '5. गिरफ्तार करने वाले अधिकारी का नाम एवं पद : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: gir_adhikari, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },

        { text: '6. जप्त सामग्री का विवरण : ' },

        goswaraClone,

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '7. गिरफ्तारी के समय अभियुक्त के पास पाया गया सामान : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: gir_paya_gaya_saman, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },

        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: [{ text: '8. गिरफ्तारी के समय गिरफ्तार शुदा व्यक्ति के शरीर पर पाई गई चोटों के निशान आदि का विवरण : ', bold: false }], alignment: 'left', margin: [0, 0, 20, 3] }
              ]
            },
            {
              width: '55%',
              stack: [
                { text: [{ text: gir_body_mark, bold: true }], alignment: 'left', margin: [0, 0, 0, 3] }
              ]
            }
          ],
          margin: [0, 2, 0, 0]
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 2, 0, 3]
        },

        {
          text: [{ text: 'प्रमाणित किया जाता है कि उपरोक्त गिरफ्तार शुदा व्यक्ति को उसकी गिरफ्तारी की सूचना किसी परिवारजन को देने एवं उसके अधिकार से उसे अवगत कराया गया है | ', bold: true }
          ]
        },



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
                { text: 'गिरफ्तार शुदा व्यक्ति का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 5] }
              ]
            },
            {
              width: '33%',
              stack: [
                { text: '\n\n\n\n', alignment: 'center' }, // Empty lines for signature space
                { text: 'गिरफ्तार करने वाले अधिकारी का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 5] },

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

     ;

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("गिरफ़्तारी_पत्रक_PDF" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition);

    }


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

  //   const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
  //   const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

  //   const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
  //   const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
  //   const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
  //   const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
  //   const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');


  //   const japtVahanHeaderOnlyVahanDetail = [
  //     { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
  //     { text: 'वाहन क्रमांक', bold: true },
  //     { text: 'अनुमानित मूल्य', bold: true }
  //   ];

  //   const buildjaptVahanBodyOnlyVahanDetail = (items: any[] = []) => [
  //     japtVahanHeaderOnlyVahanDetail,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.vahan_prakar || '',
  //       item.vahan_kramank || '',
  //       item.anumanit_mulya || '',
  //     ]) : [['-', 0, 0]])
  //   ];




  //   const japtVahanHeader = [
  //     { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
  //     { text: 'वाहन क्रमांक', bold: true },
  //     { text: 'अनुमानित मूल्य', bold: true },
  //     { text: 'मालिक का नाम', bold: true },
  //     { text: 'पिता का नाम', bold: true },
  //     { text: 'पूरा पता', bold: true },
  //     { text: 'तहसील', bold: true },
  //     { text: 'जिला', bold: true },
  //   ];

  //   const buildjaptVahanBody = (items: any[] = []) => [
  //     japtVahanHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.vahan_prakar || '',
  //       item.vahan_kramank || '',
  //       item.anumanit_mulya || '',
  //       item.malik_name || '',
  //       item.pita_ka_name || '',
  //       item.pata || '',
  //       item.tahsil || '',
  //       item.jila || '',
  //     ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
  //   ];

  //   const anyaJaptSamanHeader = [
  //     { text: 'सामग्री का विवरण', bold: true },
  //     { text: 'संख्या', bold: true },
  //     { text: 'मात्रा (घन मीटर)', bold: true },
  //     { text: 'अनुमानित मूल्य', bold: true },
  //   ];

  //   const buildAnyaJaptSamanBody = (items: any[] = []) => [
  //     anyaJaptSamanHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.if_other_then_detail || '',
  //       item.nag || 0,
  //       item.ghan_meter || 0,
  //       item.total_cost || 0
  //     ]) : [['-', 0, 0, 0]]) // default row if empty
  //   ];

  //   const chattaHeader = [
  //     { text: 'प्रजाति का नाम', bold: true },
  //     { text: 'चट्टा संख्या', bold: true },
  //     { text: 'दर', bold: true },
  //     { text: 'कुल राशि', bold: true }
  //   ];

  //   const buildChattaBody = (items: any[] = []) => [
  //     chattaHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.prajati_name || '',
  //       item.nag || 0,
  //       item.dar || 0,
  //       item.total_cost || 0
  //     ]) : [['-', 0, 0, 0]]) // default row if empty
  //   ];

  //   const balliHeader = [
  //     { text: 'प्रजाति का नाम', bold: true },
  //     { text: 'लम्बाई वर्ग(मी.)', bold: true },
  //     { text: 'गोलाई वर्ग(से.मी.)', bold: true },
  //     { text: 'संख्या', bold: true },
  //     { text: 'दर', bold: true },
  //     { text: 'कुल राशि', bold: true }
  //   ];

  //   const buildballiBody = (items: any[] = []) => [
  //     balliHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.prajati_name || '',
  //       item.lambai || 0,
  //       item.golai || 0,
  //       item.nag || 0,
  //       item.dar || 0,
  //       item.total_cost || 0
  //     ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
  //   ];

  //   const chiranHeader = [
  //     { text: 'प्रजाति का नाम', bold: true },
  //     { text: 'लम्बाई(मी.)', bold: true },
  //     { text: 'चौड़ाई(सें.मी.)', bold: true },
  //     { text: 'मोटाई(सें.मी.)', bold: true },
  //     { text: 'संख्या', bold: true },
  //     { text: 'आयतन(घ.मी.)', bold: true },
  //     { text: 'दर', bold: true },
  //     { text: 'कुल राशि', bold: true }
  //   ];

  //   const buildChiranBody = (items: any[] = []) => [
  //     chiranHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.prajati_name || '',
  //       item.lambai || 0,
  //       item.golai || 0,
  //       item.motai || 0,
  //       item.nag || 0,
  //       item.ghan_meter || 0,
  //       item.dar || 0,
  //       item.total_cost || 0
  //     ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
  //   ];

  //   const kasthHeader = [
  //     { text: 'प्रजाति का नाम', bold: true },
  //     { text: 'हालात', bold: true },
  //     { text: 'लम्बाई(मी.)', bold: true },
  //     { text: 'गोलाई(सें.मी.)', bold: true },
  //     { text: 'संख्या', bold: true },
  //     { text: 'आयतन(घ.मी.)', bold: true },
  //     { text: 'दर', bold: true },
  //     { text: 'कुल राशि', bold: true }
  //   ];

  //   const buildKasthBody = (items: any[] = []) => [
  //     kasthHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.prajati_name || '',
  //       item.kasth_halat_name || 0,
  //       item.lambai || 0,
  //       item.golai || 0,
  //       item.nag || 0,
  //       item.ghan_meter || 0,
  //       item.dar || 0,
  //       item.total_cost || 0
  //     ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
  //   ];

  //   const contentOfJaptiSaman: any[] = [];

  //   let listOfJaptOnlyVahanMaliDetail: JaptVahanDetailInterfaceOnlyMalikDetail[] = [];

  //   if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {

  //     let listOfJaptOnlyVahanDetail: JaptVahanDetailInterfaceOnlyVahanDetail[] = [];

  //     for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {
  //       let value = this.listOfJaptVahanDetail[itemIndex];
  //       const model: JaptVahanDetailInterfaceOnlyVahanDetail = {
  //         vahan_table_id: value.vahan_table_id,
  //         vahan_prakar: value.vahan_prakar,
  //         vahan_kramank: value.vahan_kramank,
  //         anumanit_mulya: value.anumanit_mulya
  //       };

  //       const modelOnlyMalikVivran: JaptVahanDetailInterfaceOnlyMalikDetail = {
  //         vahan_table_id: value.vahan_table_id,
  //         malik_name: value.malik_name,
  //         pita_ka_name: value.pita_ka_name,
  //         pata: value.pata,
  //         tahsil: value.tahsil,
  //         jila: value.jila
  //       };

  //       listOfJaptOnlyVahanDetail.push(model);
  //       listOfJaptOnlyVahanMaliDetail.push(modelOnlyMalikVivran);

  //     }

  //     contentOfJaptiSaman.push(
  //       { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*'],
  //           body: buildjaptVahanBodyOnlyVahanDetail(listOfJaptOnlyVahanDetail)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalVahanPrice },
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   if (kasthItems && kasthItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
  //           body: buildKasthBody(kasthItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalKashthNag + ',   ' },
  //           { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalKashthGhanMeter + ',   ' },
  //           { text: 'कुल राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalKashthRashi }
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   if (balliItems && balliItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', '*', 60],
  //           body: buildballiBody(balliItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalBalliNag + ',   ' },
  //           { text: 'कुल राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalBalliRashi }
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   // चिरान का विवरण
  //   if (chiranItems && chiranItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
  //           body: buildChiranBody(chiranItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalChiranNag + ',   ' },
  //           { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalChiranGhanMeter + ',   ' },
  //           { text: 'कुल राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalChiranRashi }
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   // जलाऊ का विवरण
  //   if (chattaItems && chattaItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*'],
  //           body: buildChattaBody(chattaItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalChattaNag + ',   ' },
  //           { text: 'कुल राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalChattaRashi },
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   // अन्य जप्त सामग्री का विवरण
  //   if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*'],
  //           body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalOtherJaptSamanNag + ',   ' },
  //           { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
  //           { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
  //           { text: this.totalAnumanitRashi },
  //         ]
  //       },
  //       { text: '\n' }
  //     );
  //   }

  //   let goswara: any[] = [];

  //   if (this.totalVahanDetailWithNumberFor_VisayTitle != "") {
  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त वाहन : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       //{ text: '\n' }

  //     );
  //   }

  //   if (kasthItems && kasthItems.length > 0) {

  //     goswara.push(



  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त लट्ठा : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalKashthNag, bold: true },
  //                   { text: ', कुल आयतन (घ.मी.) - ', bold: true }, { text: this.totalKashthGhanMeter, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },


  //     );

  //   }

  //   if (balliItems && balliItems.length > 0) {

  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त बल्ली : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalBalliNag, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       //{ text: '\n' }

  //     );

  //   }

  //   if (chiranItems && chiranItems.length > 0) {

  //     goswara.push(


  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त चिरान : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalChiranNag, bold: true },
  //                   { text: ', कुल आयतन (घ.मी.) - ', bold: true }, { text: this.totalChiranGhanMeter, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       //{ text: '\n' }

  //     );

  //   }

  //   if (chattaItems && chattaItems.length > 0) {

  //     goswara.push(


  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त जलाऊ : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalChattaNag, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       //{ text: '\n' }

  //     );

  //   }

  //   if (this.baansItemsList && this.baansItemsList.length > 0) {

  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त औद्योगिक बांस : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalOdyogicBanshNag, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //     );

  //   }

  //   if (this.baansItemsList && this.baansItemsList.length > 0) {

  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त व्यापारिक बांस : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalVyaprikBanshNag, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //     );

  //   }

  //   if (this.polItemsList && this.polItemsList.length > 0) {

  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'जप्त फेंसिंग पोल : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               {
  //                 text: [
  //                   { text: 'कुल संख्या - ', bold: true }, { text: this.totalPolNag, bold: true }
  //                 ], alignment: 'left', margin: [0, 0, 0, 10]
  //               }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //     );

  //   }

  //   if (this.otherJaptSamanTotalDetail != "") {
  //     goswara.push(

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: 'अन्य जप्त सामान : ' }], alignment: 'left', margin: [10, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: this.otherJaptSamanTotalDetail, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       //{ text: '\n' }

  //     );
  //   }

  //   const japtVahanHeader2 = [
  //     { text: 'मालिक का नाम', bold: true },
  //     { text: 'पिता का नाम', bold: true },
  //     { text: 'पूरा पता', bold: true },
  //     { text: 'तहसील', bold: true },
  //     { text: 'जिला', bold: true },
  //   ];

  //   const buildjaptVahanBody2 = (items: any[] = []) => [
  //     japtVahanHeader2,
  //     ...(items.length > 0 ? items.map(item => [
  //       item.malik_name || '',
  //       item.pita_ka_name || '',
  //       item.pata || '',
  //       item.tahsil || '',
  //       item.jila || '',
  //     ]) : [['-', 0, 0, 0, 0]])
  //   ];

  //   const contentArray: any[] = [];


  //   for (let index = 0; index < this.accusedPersonsList.length; index++) {

  //     const goswaraClone = JSON.parse(JSON.stringify(goswara));

  //     let accussedModel = this.accusedPersonsList[index];

  //     let name = accussedModel.name || '--';
  //     let fatherName = accussedModel.fathersName || '--';

  //     let age = accussedModel.age || '--';
  //     let mobile = accussedModel.mobile_number || '--';

  //     let cast = accussedModel.cast || '--';
  //     let jati = accussedModel.jati_name || '--';

  //     let address = accussedModel.address || '--';

  //     let gir_sthan = accussedModel.gir_sthan;
  //     let gir_date = accussedModel.gir_date
  //       ? accussedModel.gir_date.split('-').reverse().join('-')
  //       : '--';
  //     let gir_time = this.to12Hour(accussedModel.gir_time);

  //     let gir_adhikari = accussedModel.gir_adhikari;

  //     let gir_paya_gaya_saman = accussedModel.gir_paya_gaya_saman || '--';

  //     let gir_body_mark = accussedModel.gir_body_mark || '--';

  //     let accusedContent = [
  //       {
  //         text: [
  //           'गिरफ्तारी पत्रक',
  //         ],
  //         style: 'title'
  //       },

  //       {
  //         canvas: [
  //           { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //         ],
  //         margin: [0, 10, 0, 10]
  //       },


  //       {
  //         text: '1. अभियुक्त का विवरण :', bold: false
  //       },

  //       {
  //         table: {
  //           widths: ['45%', '35%', '20%'],
  //           body: [
  //             [
  //               { text: 'अभियुक्त का नाम :', margin: [10, 0, 0, 3] },
  //               { text: name, bold: true, margin: [0, 0, 0, 3] },
  //               {
  //                 rowSpan: 7,
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 0],
  //                 canvas: [
  //                   { type: 'rect', x: 0, y: 0, w: 90, h: 100 }
  //                 ]
  //               }
  //             ],
  //             [
  //               { text: 'पिता का नाम :', margin: [10, 0, 0, 3] },
  //               { text: fatherName, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ],
  //             [
  //               { text: 'उम्र :', margin: [10, 0, 0, 3] },
  //               { text: age, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ],
  //             [
  //               { text: 'मोबाइल :', margin: [10, 0, 0, 3] },
  //               { text: mobile, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ],
  //             [
  //               { text: 'जाति वर्ग :', margin: [10, 0, 0, 3] },
  //               { text: cast, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ],
  //             [
  //               { text: 'जाति :', margin: [10, 0, 0, 3] },
  //               { text: jati, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ],
  //             [
  //               { text: 'पता :', margin: [10, 0, 0, 3] },
  //               { text: address, bold: true, margin: [0, 0, 0, 3] },
  //               {}
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 5, 0, 0]
  //       },


  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '2. वन अपराध जिसके सम्बन्ध में गिरफ्तार किया गया : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: this.crime_type, bold: true }, ', ', { text: this.crime_dhara, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '3. अपराध क्रमांक और दिनांक : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: this.por_number, bold: true }, ', ', { text: this.crimeDate, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '4. गिरफ्तारी का स्थान , दिनांक एवं समय : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: gir_sthan, bold: true }, ', ', { text: gir_date, bold: true }, ', ', { text: gir_time, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },


  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '5. गिरफ्तार करने वाले अधिकारी का नाम एवं पद : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: gir_adhikari, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       { text: '6. जप्त सामग्री का विवरण : ' },

  //       goswaraClone,

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '7. गिरफ्तारी के समय अभियुक्त के पास पाया गया सामान : ', bold: false }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: gir_paya_gaya_saman, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       {
  //         columns: [
  //           {
  //             width: '45%',
  //             stack: [
  //               { text: [{ text: '8. गिरफ्तारी के समय गिरफ्तार शुदा व्यक्ति के शरीर पर पाई गई चोटों के निशान आदि का विवरण : ', bold: false }], alignment: 'left', margin: [0, 0, 20, 10] }
  //             ]
  //           },
  //           {
  //             width: '55%',
  //             stack: [
  //               { text: [{ text: gir_body_mark, bold: true }], alignment: 'left', margin: [0, 0, 0, 10] }
  //             ]
  //           }
  //         ],
  //         margin: [0, 5, 0, 0]
  //       },

  //       {
  //         canvas: [
  //           { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //         ],
  //         margin: [0, 10, 0, 3]
  //       },

  //       {
  //         text: [{ text: 'प्रमाणित किया जाता है कि उपरोक्त गिरफ्तार शुदा व्यक्ति को उसकी गिरफ्तारी की सूचना किसी परिवारजन को देने एवं उसके अधिकार से उसे अवगत कराया गया है | ', bold: true }
  //         ]
  //       },



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
  //               { text: 'गिरफ्तार शुदा व्यक्ति का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 10] }
  //             ]
  //           },
  //           {
  //             width: '33%',
  //             stack: [

  //               { text: 'गिरफ्तार करने वाले अधिकारी का हस्ताक्षर', bold: false, alignment: 'center', margin: [0, 0, 0, 10] },

  //             ]
  //           }
  //         ],
  //         margin: [0, 10, 0, 0]
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

  //   //  ;

  //   const safePorNumber = (this.comingComplaintData?.por_number || '')
  //     .replace(/[\\/:*?"<>|]/g, '_')
  //     .replace(/\s+/g, '_');
  //   const fileName = `फर्द_गिरफ्तारी_PDF_${safePorNumber}.pdf`;

  //   if (this.platForm.is('desktop')) {

  //     pdfMake.createPdf(docDefinition).download(fileName);

  //   } else if (this.platForm.is('android')) {

  //     // sandeeppdfstart
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
  //         title: 'फर्द गिरफ्तारी PDF',
  //         text: 'फर्द गिरफ्तारी पीडीएफ',
  //         url: savedFile.uri,
  //         dialogTitle: 'Share or Save PDF'
  //       });
  //     } catch (err: any) {
  //       this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
  //     }
  //     // sandeeppdfend
  //   }


  // }


  get maxGirDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  validateGirDateOnEntry(accused: any): void {
    const today = new Date().toISOString().split('T')[0];
    if (accused.gir_date && accused.gir_date > today) {
      accused.gir_date = '';
      this.longToast('गिरफ्तारी दिनांक आज या उससे पहले का होना चाहिए।');
    }
  }

  onDateChange(value: string | null | undefined, row: any) {
    if (value) {
      const today = new Date().toISOString().split('T')[0];
      if (value > today) {
        row.gir_date = '';
        this.longToast('गिरफ्तारी दिनांक आज या उससे पहले का होना चाहिए।');
        return;
      }
      row.gir_date = value;
    } else {
      row.gir_date = '--'; // or empty string
    }
  }

  onTimeChange(value: string | null | undefined, row: any) {
    //  ;
    if (value) {
      row.gir_time = value;
    } else {
      row.gir_time = '--'; // or empty string
    }
  }


  to12Hour(time24: string | undefined): string {
    if (!time24) return '--';

    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;

    return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }




}