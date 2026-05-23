import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLoading, IonTextarea, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule

import { File } from '@awesome-cordova-plugins/file/ngx';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';

import { NavController, ModalController } from '@ionic/angular/standalone';
import { ComplainDetails, JaptSamanItem } from '../officer-dashboard/GetDashboardResponse.model';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { arrowBack, boat, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, locationOutline, mapOutline, refreshCircleOutline } from 'ionicons/icons';
import { ApproveRejectComponent } from 'src/app/dialogs/approve-reject/approve-reject.component';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Toast } from '@capacitor/toast';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { AlertController } from '@ionic/angular';
//import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal/image-preview-modal.component';

import jsPDF from 'jspdf';
import { HttpClient } from '@angular/common/http';
//import { GeneratePdfService } from 'src/app/services/generate-pdf.service';

import pdfMake from 'pdfmake/build/pdfmake';

import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { TableModule } from 'primeng/table'; // Import TableModule
import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom'; // adjust the path if needed
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom'; // adjust the path if needed

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { text } from 'stream/consumers';
import { WorkLogResponseModal } from '../show-ra-work-log/WorkLogResponseModal.modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
//import { ImagePreviewOfflineModalComponent } from 'src/app/dialogs/image-preview-offline-modal/image-preview-offline-modal.component';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { CastModal } from './ModalClasses';

const mergedVfs = {
  ...vfsRegular,
  ...vfsBold
};

@Component({
  selector: 'app-view-one-offline-data-detail',
  templateUrl: './view-one-offline-data-detail.component.html',
  styleUrls: ['./view-one-offline-data-detail.component.scss'],
  standalone: true,
  providers: [SocialSharing, File],
  imports: [IonicModule, CommonModule, FormsModule, TableModule]
})

export class ViewOneOfflineDataDetailComponent implements OnInit {


  //Added by sandeep to support view of multple accused 1 start
  accusedPersons: {
    name: string,
    fathersName: string,
    address: string,
    cast: string,
    signatureImage: string,
    age: string | null,
    jati_name: string
  }[] = [];
  accusedCount: number = 0;
  //Added by sandeep to support view of multple accused 1 end


  listOfCrimType: CastModal[] = [];
  listOfCast: CastModal[] = [];

  listOfDharaNew: any = [];
  listOfWoodPrajati: any = [];

  localListOfDharaHead: { name: string; id: string, dharaYear: string }[] = [];
  localListOfActualDhara: { name: string; id: string }[] = [];

  selectedCrimeBeatCompartment: any = null;
  listOfCompartment: any = [];

  listOfDhara: { dharaYear: string; dharaSection: string }[] = [];


  private androidPermissions = inject(AndroidPermissions);
  private socialSharing = inject(SocialSharing);

  apradhi_ka_photo: string = "";
  por_photo: string = "";
  supurd_nama_photo: string = "";
  japti_nama_photo: string = "";
  panch_nama_photo: string = "";


  photos: string[] = [];
  //imageBaseUrl: string = 'https://416e-149-34-244-177.ngrok-free.app/uploads/';

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  lat: string = "0"; lon: string = "0";
  complain_location_google_addres: string = "";
  accussedName: string = ""; accussedFatherName: string = ""; address: string = "";
  beat_name: string = "";
  accussedCast: string = ""; crimType: string = "";
  crimeDate: string = "";
  crimePlace: string = "";
  seizedGoodDetail: string = "";

  complainer_name: string = "";
  complainer_pad: string = "";
  signatureImage: string = "";
  supurddar_sign: string = "";
  japtikarta_ka_name: string = "";
  japtikarta_ka_pad: string = "";


  // ------------- JAPTINAMA KA VIVRAN ---------------//

  japt_karne_wale_adhikari_ka_name: string = "";
  japt_karne_wale_adhikari_ka_pad: string = "";
  chinhaPhoto: string = "";
  japtinama_anya_vishesh_vivran: string = "";

  // --------------------------------------------------//

  // ----------------- SUPURDNAMA KA VIVRAN---------------//
  isJaptikartaAndSupurdarSame: boolean = true;
  supurddar_ka_name: string = "";
  supurddar_ka_pita_ka_name: string = "";
  supurddar_ka_jati: string = "";
  supurddar_ka_vyavsay: string = "";
  supurddar_ka_full_address: string = "";
  supurd_me_lene_ka_dinank: string = "";
  // --------------------------------------------------//


  witness_name_first: string = ""; witness_name_second: string = "";
  witness_address_first: string = ""; witness_address_second: string = "";

  por_number: string = "";
  compartment_number: string = "";
  crime_dhara: string = "";

  comingComplaintData!: ComplainDetails;
  is_pending = false;
  isSharing = false;



  listOfjaptiSaman: JaptSamanItem[] = []

  chiranItemsList: any[] = [];
  chattaItemsList: any[] = [];
  kasthItemsList: any[] = [];
  thuthItemsList: any[] = [];
  balliItemsList: any[] = [];
  listOfOtherItemsList: any[] = [];

  listOfVahanDetail:
    {
      vahan_prakar: string;
      vahan_kramank: string,
      anumanit_mulya: string,
      malik_ka_name: string,
      malik_k_father_ka_name: string,
      pata: string,
      tahsil: string,
      jila: string
    }[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private file: File,
    private platForm: Platform,
    //private pdfService: GeneratePdfService,
    private http: HttpClient,
    private alertCtrl: AlertController, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalCtrl: ModalController, private router: Router, private navController: NavController, private languageService: LanguageServiceService) {
    addIcons({ mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  filePath: string = "";

  isBG: boolean = false;

  filterItems() {
    ;
    this.kasthItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '2'
    );

    this.thuthItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '1'
    );

    this.chiranItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '4'
    );

    this.chattaItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '5'
    );

    this.balliItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '6'
    );

    this.listOfOtherItemsList = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '3'
    );

  }

  get totalThunthNag(): number {
    return this.thuthItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthNag(): number {
    return this.kasthItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthGhanMeter(): string {
    return this.kasthItemsList
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChiranNag(): number {
    return this.chiranItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranGhanMeter(): string {
    return this.chiranItemsList
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChattaNag(): number {
    return this.chattaItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliNag(): number {
    return this.balliItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  witness1Sign: string = "";
  witness2Sign: string = "";

  async ngOnInit() {

    this.getLoginedOfficerDetail();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
      ;
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;

      //Added by sandeep to support view of multple accused 2 start
      if (this.comingComplaintData.accusedPersons && this.comingComplaintData.accusedPersons.length > 0) {
        this.accusedPersons = this.comingComplaintData.accusedPersons;
        this.accusedCount = this.comingComplaintData.accused_count || this.accusedPersons.length;
        const firstAccused = this.accusedPersons[0];
        this.accussedName = firstAccused.name || "";
        this.accussedFatherName = firstAccused.fathersName || "";
        this.address = firstAccused.address || "";
        let castValue = this.listOfCast.find(m => m.id === Number(firstAccused.cast));
        this.accussedCast = castValue?.name || "";
      } else {
        this.accussedName = this.comingComplaintData.accused_name || "";
        this.accussedFatherName = this.comingComplaintData.accused_fathers_name || "";
        this.address = this.comingComplaintData.accused_address || "";
        let castValue = this.listOfCast.find(m => m.id === Number(this.comingComplaintData.cast_name));
        this.accussedCast = castValue?.name || "";
        //this.accussedCast = this.comingComplaintData.cast_name || "";
        this.accusedCount = 0;
      }
      //Added by sandeep to support view of multple accused 2 end

      this.apradhi_ka_photo = this.comingComplaintData.apradhi_photo;
      this.por_photo = this.comingComplaintData.por_photo;
      this.supurd_nama_photo = this.comingComplaintData.supurd_nama_photo;
      this.japti_nama_photo = this.comingComplaintData.japti_nama_photo;
      this.panch_nama_photo = this.comingComplaintData.panch_nama_photo;

      this.beat_name = this.comingComplaintData.beat_name;
      this.accussedName = this.comingComplaintData.accused_name;
      this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
      this.address = this.comingComplaintData.accused_address;
      this.accussedCast = this.comingComplaintData.cast_name;

      this.crimeDate = this.comingComplaintData.date_of_crime;

      this.witness_name_first = this.comingComplaintData.name_of_witness_one;
      this.witness_name_second = this.comingComplaintData.name_of_witness_two;
      this.witness_address_first = this.comingComplaintData.address_of_witness_one;
      this.witness_address_second = this.comingComplaintData.address_of_witness_two;

      this.por_number = this.comingComplaintData.por_number;
      this.compartment_number = this.comingComplaintData.compartment_number;
      this.crime_dhara = this.comingComplaintData.crime_dhara;

      this.crimePlace = this.comingComplaintData.place_of_crime;
      this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
      this.lat = this.comingComplaintData.lat;
      this.lon = this.comingComplaintData.lng;
      this.complain_location_google_addres = this.comingComplaintData.map_address;

      this.complainer_name = this.comingComplaintData.complainer_name;
      this.complainer_pad = this.comingComplaintData.complainer_pad;
      this.signatureImage = this.comingComplaintData.complainer_sign;

      this.supurddar_sign = this.comingComplaintData.supurddar_sign;
      this.japtikarta_ka_name = this.comingComplaintData.japtikarta_ka_name;
      this.japtikarta_ka_pad = this.comingComplaintData.japtikarta_ka_pad;

      this.listOfjaptiSaman = this.comingComplaintData.japtSamanList

      this.filterItems();

      if (this.comingComplaintData.show_approve_reject_button === "1") {
        this.is_pending = true;
      } else {
        this.is_pending = false;
      }

      this.japt_karne_wale_adhikari_ka_name = this.comingComplaintData.complainer_name;
      this.japt_karne_wale_adhikari_ka_pad = this.comingComplaintData.complainer_pad;
      this.chinhaPhoto = this.comingComplaintData.chinhaPhoto;
      if (this.comingComplaintData.isJaptikartaAndSupurdarSame === "0") {
        this.isJaptikartaAndSupurdarSame = false;
      }
      this.supurddar_ka_name = this.comingComplaintData.supurddar_ka_name;
      this.supurddar_ka_pita_ka_name = this.comingComplaintData.supurddar_ka_pita_ka_name;
      this.supurddar_ka_jati = this.comingComplaintData.supurdar_ka_jati;
      this.supurddar_ka_vyavsay = this.comingComplaintData.supurddar_ka_vyavsay;
      this.supurddar_ka_full_address = this.comingComplaintData.supurdar_ka_poora_pata;
      this.supurd_me_lene_ka_dinank = this.comingComplaintData.supurd_me_lene_ka_dinank;
      this.japtinama_anya_vishesh_vivran = this.comingComplaintData.japtinama_anya_vishesh_vivran;

      this.witness1Sign = this.comingComplaintData.witness_1_sign;
      this.witness2Sign = this.comingComplaintData.witness_2_sign;


      if (this.comingComplaintData.imageUrl && this.comingComplaintData.imageUrl.trim() !== '') {


        const photoString = this.comingComplaintData.imageUrl;

        if (photoString && photoString.trim() !== "") {
          this.photos = photoString.split(/,(?=data:image)/g);
        }


      }

      this.listOfVahanDetail = JSON.parse(this.comingComplaintData.vahan_detail);

    }
  }


  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  goBack() {
    this.navController.back();
  }

  openMap() {

    const lat = this.lat;
    const lng = this.lon;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_system'); // '_system' works in Cordova/Capacitor apps

  }

  async approveOrReject(approveOrReject: string) {

    let msg = "";

    if (approveOrReject === "1") {
      msg = "स्वीकृत टिप्पणी लिखें";
    } else if (approveOrReject === "2") {
      msg = "अस्वीकृत टिप्पणी लिखें";
    }

    const modal = await this.modalCtrl.create({
      component: ApproveRejectComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        remarkLabel: msg,
        approved_or_reject: approveOrReject
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        //this.approveRejectComplain(result.data.remark, result.data.approved_or_reject);
      }
    });

    await modal.present();

  }

  // approveRejectComplain(approvedRejectRemark: string, approved_or_reject: number) {

  //   this.showDialog("कृपया प्रतीक्षा करें.....");

  //   this.apiService.approveRejectComplain(
  //     this.loginedOffierEmpId.toString(),
  //     approved_or_reject,
  //     approvedRejectRemark,
  //     this.comingComplaintData.complain_history_table_id,
  //     this.comingComplaintData.complain_id,
  //   ).subscribe(
  //     async (response) => {

  //       await this.dismissDialog();
  //       this.cdRef.detectChanges;

  //       if (response.response.code === 200) {

  //         this.sharedService.setRefresh(true);

  //         this.goBack();

  //       } else {
  //         this.longToast(response.response.msg)
  //       }

  //     },
  //     async (error) => {
  //       //await this.dismissLoading();
  //       this.shortToast(error);
  //       //this.apiService.showServerMessages(error)
  //     }
  //   );
  // }

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }


  //Code added by sandeep start 1
  getAccusedDisplayText(): string {
    if (this.accusedCount === 0) return 'अज्ञात अपराधी';
    if (this.accusedCount === 1) return '1 अपराधी';
    return `${this.accusedCount} अपराधी`;
  }


  hasMultipleAccused(): boolean {
    return this.accusedCount > 1;
  }


  hasNoAccused(): boolean {
    return this.accusedCount === 0;
  }
  //Code added by sandeep end 1

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

  loginedOffierEmpId: number = 0;

  async getLoginedOfficerDetail() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOffierEmpId = userData.emp_id;
      this.crime_beat_name = userData.beat_name;

      if (userData.designation_id === "5") {
        this.isBG = true;
      }

      const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
      this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

      const crimTypeMaster = await Preferences.get({ key: PreferenceKeys.crimType_master });

      const castMasterType = await Preferences.get({ key: PreferenceKeys.cast_master });

      const dharaData = await Preferences.get({ key: PreferenceKeys.dhara_data });
      const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

      if (dharaData.value) {

        this.listOfDharaNew = JSON.parse(dharaData.value);

        this.localListOfDharaHead = this.listOfDharaNew
          .map((item: { dhara_head: string; id: string, dhara_year: string }) => ({
            name: item.dhara_head,
            id: item.id,
            dharaYear: item.dhara_year
          }));

      }

      if (prajatiName.value) {
        this.listOfWoodPrajati = JSON.parse(prajatiName.value);
      }

      if (crimTypeMaster.value) {
        this.listOfCrimType = JSON.parse(crimTypeMaster.value);
      }

      if (castMasterType.value) {
        this.listOfCast = JSON.parse(castMasterType.value);
      }


      if (this.accussedCast === "0") {
        this.accussedCast = "अज्ञात";
      } else {

        let l = this.listOfCast.find(m => m.id === Number(this.accussedCast));

        if (l) {
          this.accussedCast = l.name;
        }

      }

      this.crimType = this.comingComplaintData.type_of_crime;

      let l = this.listOfCrimType.find(m => m.id === Number(this.crimType));

      if (l) {
        this.crimType = l.name;
      }


    }
  }

  getActualCastName(castId: string): string {
    let l = this.listOfCrimType.find(m => m.id === Number(castId));
    if (l) {
      return l.name;
    }
    return "";
  }

  crime_beat_name: string = "";

  async showImageAlert(photoBase64: string) {
    // const alert = await this.alertCtrl.create({
    //   header: 'Image',
    //   message: `<img src="${imageUrl}" style="width:100%">`,
    //   buttons: ['Close'],
    // });
    // await alert.present();


    const modal = await this.modalCtrl.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: photoBase64
      },
      backdropDismiss: true,
    });

    await modal.present();

  }

  getFullPathImage(photoName: string): string {
    return this.filePath + "/" + photoName;
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 10000) {
      binary += String.fromCharCode(...bytes.slice(i, i + 10000));
    }
    return btoa(binary);
  }



  async generatePDF() {

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const tableBody = [
      [
        { text: 'सामान का प्रकार', bold: true },
        { text: 'प्रजाति का नाम', bold: true },
        { text: 'लम्बाई', bold: true },
        { text: 'गोलाई', bold: true },
        { text: 'संख्या', bold: true },
        { text: 'आयतन (घ.मी.)', bold: true },
        { text: 'दर', bold: true },
        { text: 'कुल राशि', bold: true },
        { text: 'अन्य जानकारी', bold: true }
      ],
      ...this.listOfjaptiSaman.map(item => [
        item.actual_name_of_saman || '',
        item.prajati_name || '',
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0,
        item.if_other_then_detail || ''
      ])
    ];

    const docDefinition: any = {
      content: [


        { text: 'वन विभाग Forest Department', style: 'title' },
        { text: 'Forest Department', style: 'title' },
        { text: 'प्राथमिक अपराध प्रतिवेदन', style: 'subTitle' },
        { text: 'Preliminary Offence Report', style: 'subTitle' },
        { text: this.comingComplaintData.beat_name + ' बीट, छत्तीसगढ़', style: 'subTitle' },
        {
          columns: [
            {
              text: [
                'पुस्तक क्रमांक ',
                { text: this.comingComplaintData.por_number, style: 'section' }
              ]
            },
            {
              text: [
                'तारीख ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right'
            }
          ]
        },

        { text: '\n' },

        { text: '\n' },

        {
          text: [
            '1. मुजरिम का नाम ',
            { text: this.comingComplaintData.accused_name, bold: true },
            ' , पिता का नाम ',
            { text: this.comingComplaintData.accused_fathers_name, bold: true },
            ', जाति ',
            { text: this.comingComplaintData.cast_name, bold: true },
            ' और सकूनत  ___________________'
          ]
        },

        { text: '\n' },

        {
          text: [
            '2. किस्म जुर्म ',
            { text: this.comingComplaintData.crime_dhara, bold: true }
          ]
        },

        { text: '\n' },

        { text: ['3. जगह जहाँ जुर्म हुआ (कक्ष क्रमांक)', { text: this.comingComplaintData.compartment_number, bold: true }] },

        { text: '\n' },

        {
          text: [
            '4. जुर्म की तारीख ',
            { text: this.comingComplaintData.date_of_crime, bold: true }
          ]
        },

        { text: '\n' },

        { text: '5. तफ्सील जप्त शुदा माल का विवरण' },
        {
          margin: [0, 10, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', '*', '*', '*', '*', '*'],
            body: tableBody
          }
        },
        // {
        //   canvas: [
        //     { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
        //   ],
        //   margin: [0, 10, 0, 10]
        // },

        { text: '\n' },

        {
          text: [
            '6. प्रथम नाम गवाहान ',
            { text: this.comingComplaintData.name_of_witness_one, bold: true },
            ' , द्वितीय नाम गवाहान ',
            { text: this.comingComplaintData.name_of_witness_two, bold: true }
          ]
        },

        { text: '\n' },

        { text: 'दूसरा भाग रेंज असिस्टेंट साहब ____________________ सर्किल को भेजा गया ' },

        { text: '\n' },

        { text: 'तीसरा भाग रेंज ऑफिसर साहब________________________________रेंज को भेजा गया' },

        { text: '\n' },

        {
          columns: [
            { text: 'मुकाम  ' },
            { text: 'दस्तखत फारेस्ट गॉर्ड _______________________', alignment: 'right' }
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          columns: [
            { text: 'तारीख  ____________________________' },
            { text: 'नाका _______________________', alignment: 'right' }
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 10]
        },

        { text: '\n' },

        { text: 'नोट: यह रिपोर्ट जुर्म मालूम होने के 48 घंटे के अंदर बमूजिब पैरा 77 (अ) (3) फारेस्ट मैनुअल भाग 1 के अपने आला ऑफिसर के पास भेज दी जानी चाहिए |', bold: true, margin: [0, 10, 0, 0] }
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
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("POR_OF_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "POR_OF_" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

        // await this.androidPermissions.requestPermissions([
        //   this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
        //   this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        // ]);

        // await Filesystem.writeFile({
        //   path: fileName,
        //   data: base64Data,
        //   directory: Directory.Documents,
        //   encoding: 'base64' as any,
        // });

        // const fileInfo = await Filesystem.getUri({
        //   path: fileName,
        //   directory: Directory.Documents,
        // });

        // const filePath = fileInfo.uri;

        // await Share.share({
        //   title: 'PDF Report',
        //   text: 'Please find the PDF attached.',
        //   url: filePath,
        //   dialogTitle: 'Share PDF'
        // });

      });

    }

  }

  async sharePdf(fileUri: string) {
    await Share.share({
      title: 'PDF Report',
      text: 'Please find the attached PDF.',
      url: fileUri,
      dialogTitle: 'Share PDF'
    });
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

  // async savePdfToAndroidDevice(base64Data: string, fileName: string): Promise<string | null> {


  //   const cleanedBase64 = base64Data.replace(/\s/g, '').trim();

  //   try {
  //     // Step 1: Write PDF to External Cache (shareable & permission-safe)
  //     const writeResult = await Filesystem.writeFile({
  //       path: fileName,
  //       data: cleanedBase64,
  //       directory: Directory.ExternalCache,
  //       encoding: 'base64' as any, // ✅ string, not enum
  //     });


  //     // Step 2: Get the URI for the saved file
  //     const fileUriResult = await Filesystem.getUri({
  //       path: fileName,
  //       directory: Directory.ExternalCache,
  //     });

  //     const stat = await Filesystem.stat({
  //       path: fileName,
  //       directory: Directory.ExternalCache,
  //     });


  //     return fileUriResult.uri;
  //   } catch (err) {
  //     return null;
  //   }
  // }

  async savePdf(base64Data: string, fileName: string) {
    fileName = fileName.replace(/\//g, '_');
    const cleanedBase64 = base64Data.replace(/\s/g, '').trim();

    await this.platForm.ready();

    const dir = this.file.externalDataDirectory || this.file.dataDirectory;

    try {
      await this.file.checkDir(dir, 'MyFolder');
    } catch (e) {
      await this.file.createDir(dir, 'MyFolder', false);
    }

    const filePath = dir + 'MyFolder/';

    var blobValue = this.convertBase64ToBlob(cleanedBase64, 'application/pdf');
    await this.file.writeFile(
      filePath,
      fileName,
      blobValue,
      { replace: true }
    );

    const result = await Filesystem.getUri({
      path: fileName,
      directory: Directory.External,
    });

    this.socialSharing.share(
      '📄 Here is your PDF report.',
      'PDF Report',
      filePath + fileName,
      undefined
    );

  }

  convertBase64ToBlob(base64: string, mime: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  async showError(errorMsg: string) {

    try {
      const modal = await this.modalCtrl.create({
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

  isWebPlatform(): boolean {
    return this.platForm.is('desktop');
  }

  getWorkLog() {
    if (this.workLogList.length > 0) {
      this.generatePDFOfRAWorkLog();
    } else {
      this.showDialog("कृपया प्रतीक्षा करें");

      this.apiService.getRAWorkLogList(this.comingComplaintData.complain_id).subscribe(
        (response) => {
          this.dismissDialog();

          if (response.response.code === 200) {
            this.workLogList = response.data
            this.generatePDFOfRAWorkLog();
          }

        },
        (error) => {
          this.dismissDialog();
        }
      );

    }

  }

  workLogList: WorkLogResponseModal[] = [];

  async generatePDFOfRAWorkLog() {

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const tableBody = [
      [
        { text: 'तहकीकात शुरू होने की तारीख और वक्त', bold: true },
        { text: 'मुकाम', bold: true },
        { text: 'तहकीकात करने वाले ऑफिसर का खुलासा (टीप) हर एक इन्द्रराज पर तहकीकात करने वाले ऑफिसर की दस्तखत करके तारीख और तहकीकात बंद करने का वक्त दर्ज करना चाहिए', bold: true },
        { text: 'हुक्म पाने वाले के दस्तखत', bold: true }
      ],
      ...this.workLogList.map(item => [
        item.created_at || '',
        item.address || '',
        item.work_log_text || '',
        ''
      ])
    ];

    const docDefinition: any = {
      content: [


        { text: 'कार्रवाही का तख्ता (मुकदमा का रोजनामचा)', style: 'title' },

        {
          columns: [
            {
              width: 'auto',
              text: 'जिस जुर्म और तफ्तीश माल जो गिरफ्तार हुआ'
            },
            {
              width: '*',
              text: '________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'मुल्जिमों के नाम, वल्दियत व सकुनत (और मालूम हो):'
            },
            {
              width: '*',
              text: '_________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'तारीख बकुवा (जुर्म):'
            },
            {
              width: '*',
              text: '___________________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'पता लगाने वाले ऑफिसर का नाम :'
            },
            {
              width: '*',
              text: '_________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },


        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'पता लगाने तारीख और वक्त :'
            },
            {
              width: '*',
              text: '_________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'इफ्तदाई रिपोर्ट नंबर एवं नंबर और उसकी रवानगी की तारीख और वक्त :'
            },
            {
              width: '*',
              text: '______________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'इफ्तदाई रिपोर्ट की तारीख और वक्त :'
            },
            {
              width: '*',
              text: '________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          margin: [0, 10, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: tableBody
          }
        }
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
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("RA_कार्य_लॉग_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = this.comingComplaintData.por_number + '.pdf';

        await this.savePdf(base64Data, fileName);


      });

    }

  }

  async generatePDFOfApradhPrativedanPrakran() {

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'वन अपराध प्रकरण प्रतिवेदन', style: 'title' },
        { text: '\n' },
        {
          text: [
            "अपराध दिनांक यदि विदित हो :", { text: this.comingComplaintData.date_of_crime, bold: true }
          ]
        },
        { text: '\n' },
        {
          text: [
            "कर्मचारी का नाम जिसने अपराध पकड़ा हो : ", { text: this.comingComplaintData.complain_created_by, bold: true }
          ]
        },
        { text: '\n' },
        {
          text: "अपराधी का पता लगाने का दिनांक : ",
        },
        { text: '\n' },
        {
          text: [
            "अपराध : ", { text: this.comingComplaintData.type_of_crime, bold: true }
          ]
        },
        { text: '\n' },
        {
          text: [
            "अपराधी का नाम और पिता का नाम : ", { text: this.comingComplaintData.accused_name + " , " + this.comingComplaintData.accused_fathers_name, bold: true }
          ]
        },
        { text: '\n' },
        {
          text: [
            "जाति और निवास स्थान : ", { text: this.comingComplaintData.cast_name + " , " + this.comingComplaintData.accused_address, bold: true }

          ],
        },
        { text: '\n' },
        { text: "वनोपज एवं अन्य वस्तुओ का विवरण एवं बाजार भाव से उसका मूल्य : " },
        { text: '\n' },
        {
          text: [
            "अपराध की प्रवृत्ति भारतीय वन अधिनियम की धारा जिसके अंतर्गत दंडनीय है : ", { text: this.comingComplaintData.crime_dhara, bold: true }
          ]
        },
        { text: '\n' },
        {
          text: [
            "साक्षी का नाम तथा पूरा पता : ", { text: "(1.) " + this.comingComplaintData.name_of_witness_one + " , " + this.comingComplaintData.address_of_witness_one + " \n (2.) " + this.comingComplaintData.name_of_witness_two + " , " + this.comingComplaintData.address_of_witness_two, bold: true }
          ]
        },
        { text: '\n' },
        { text: "जपसूदा सामान को जिसके सुपुर्द किया गया : " },
        { text: '\n' },
        {
          text: [
            "जांच अधिकारी का नाम एवं पद : ", { text: this.comingComplaintData.ra_name, bold: true }
          ]
        },
        { text: '\n' },
        { text: "जांच की अवधि : " },
        { text: '\n' },
        { text: "अपराधी के पूर्व अपराध का विवरण (यदि कोई हो ) : " },
        { text: '\n' },
        { text: "अपराधी प्रकरण को अभिसंघानित करने को इक्छुक है अथवा नहीं : " },
        { text: '\n' },
        { text: "अपराधी की आर्थिक परिथिति का विवरण  : " },
        { text: '\n' },

        { text: '', pageBreak: 'before' },

        {
          columns: [
            { width: 'auto', text: "प्रति,", font: 'NotoSansDevanagari' },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          columns: [
            { width: 'auto', text: "परिक्षेत्राधिकारी", font: 'NotoSansDevanagari' },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          text: [
            "निवेदन है कि यह वन अपराध प्रकरण क्रमांक ",
            { text: this.comingComplaintData.por_number, bold: true },
            " दिनांक ", { text: this.comingComplaintData.date_of_crime, bold: true },
            " वन रक्षक ", { text: this.comingComplaintData.complain_created_by, bold: true },
            " द्वारा ", { text: this.comingComplaintData.date_of_crime, bold: true },
            " को किया गया है जिसकी जांच मेरे द्वारा सूक्षमता से की गयी है। अपराधी ", { text: this.comingComplaintData.accused_name, bold: true },
            " ने अपना अपराध स्वीकार करते हुए / नहीं करते हुए विभाग से फैसला चाहा / नहीं चाहा है। अतः मैं प्रकरण को अभिसन्धानित हेतु / प्रकरण की न्यायालय में देने हेतु निम्न सिफारिश करता हूँ।"
          ],
          font: 'NotoSansDevanagari',
          margin: [0, 0, 0, 15],
        },

        {
          text: [
            "वनोपज मूल्य : ",
            { text: this.comingComplaintData.total_japt_saman_costing, bold: true }
          ],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        // {
        //   text: "वनोपज मूल्य : " + this.comingComplaintData.japtSamanList,
        //   alignment: "right",
        //   font: 'NotoSansDevanagari',
        // },
        { text: '\n' },

        {
          text: "क्षतिपूर्ति : _____________",
          alignment: "right",
          font: 'NotoSansDevanagari',
        },
        { text: '\n' },

        {
          text: "योग : _____________",
          alignment: "right",
          font: 'NotoSansDevanagari',
        },
        { text: '\n' },

        {
          text: "हस्ताक्षर: _____________",
          alignment: "right",
          font: 'NotoSansDevanagari',
        }



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
    };


    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("वन_अपराध_प्रकरण_प्रतिवेदन_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "वन_अपराध_प्रकरण_प्रतिवेदन_" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

      });

    }


  }

  showImage(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

}
