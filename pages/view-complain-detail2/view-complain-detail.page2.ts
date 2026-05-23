import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLoading, IonTextarea, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule

//Code added by sandeep start 1 Date 9/28/25
import { AccusedPersonDetail } from '../officer-dashboard/GetDashboardResponse.model';
//Code added by sandeep end 1 Date 9/28/25

import { File } from '@awesome-cordova-plugins/file/ngx';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';

import { NavController, ModalController } from '@ionic/angular/standalone';
import { ComplainDetails, JaptSamanItem, WitnessDetailForPor } from '../officer-dashboard/GetDashboardResponse.model';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBack, boat, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, compassOutline, cubeOutline, documentTextOutline, gridOutline, helpCircleOutline, locationOutline, mapOutline, navigateOutline, peopleCircleOutline, peopleOutline, personCircleOutline, pencilOutline, pinOutline, receiptOutline, refreshCircleOutline, trailSignOutline } from 'ionicons/icons';
import { ApproveRejectComponent } from 'src/app/dialogs/approve-reject/approve-reject.component';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Toast } from '@capacitor/toast';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { AlertController } from '@ionic/angular';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';

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
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
const mergedVfs = {
  ...vfsRegular,
  ...vfsBold
};

@Component({
  selector: 'app-view-complain-detail2',
  templateUrl: './view-complain-detail.page2.html',
  styleUrls: ['./view-complain-detail.page2.scss'],
  standalone: true,
  providers: [SocialSharing, File],
  imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class ViewComplainDetailPage2 implements OnInit {

  private androidPermissions = inject(AndroidPermissions);
  private socialSharing = inject(SocialSharing);

  //Code added by sandeep start 2 Date 9/28/25
  accusedPersons: AccusedPersonDetail[] = [];
  isAccusedFound: boolean = false;
  //Code added by sandeep end 2 Date 9/28/25

  apradhi_ka_photo: string = "";
  por_photo: string = "";
  japti_nama_photo: string = "";
  panch_nama_photo: string = "";

  photos: string[] = [];
  japtinama_photos: string[] = []; // Array for multiple japtinama photos
  //imageBaseUrl: string = 'https://416e-149-34-244-177.ngrok-free.app/uploads/';

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  lat: string = "0"; lon: string = "0";
  complain_location_google_addres: string = "";
  accussedName: string = ""; accussedFatherName: string = ""; address: string = "";
  beat_name: string = "";
  accussedCast: string = ""; crimType: string = "";
  crimeDate: string = "";
  actualcrimeDate: string = "";
  complainer_name: string = "";
  complainer_ka_pad: string = "";
  complainer_sign: string = "";

  crimePlace: string = "";
  seizedGoodDetail: string = "";

  witness_name_first: string = ""; witness_name_second: string = "";
  witness_address_first: string = ""; witness_address_second: string = "";
  witness_sign_first: string = ""; witness_sign_second: string = "";
  // ✅ New: dynamic witnesses list (preview mode gets base64, normal mode can get filenames)
  witnessesList: WitnessDetailForPor[] = [];

  chinhaPhoto: string = "";
  japtinama_anya_vishesh_vivran: string = "";

  por_number: string = "";
  compartment_number: string = "";
  compartment_option: string = "";
  crime_dhara: string = "";

  comingComplaintData!: ComplainDetails;
  is_pending = false;
  isSharing = false;

  listOfjaptiSaman: JaptSamanItem[] = []


  thuthItemsList: any[] = [];
  kasthItemsList: any[] = [];
  chiranItemsList: any[] = [];
  chattaItemsList: any[] = [];
  ballitemsList: any[] = [];
  banshItemList: any[] = [];
  polItemList: any[] = [];
  listOfOtherItemsList: any[] = [];

  constructor(
    private file: File,
    private platForm: Platform,
    //private pdfService: GeneratePdfService,
    private http: HttpClient,
    private alertCtrl: AlertController, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalCtrl: ModalController, private router: Router, private navController: NavController, private languageService: LanguageServiceService, private networkCheckService: NetworkCheckService) {
    addIcons({ mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, personCircleOutline, navigateOutline, compassOutline, pinOutline, documentTextOutline, receiptOutline, trailSignOutline, gridOutline, peopleOutline, helpCircleOutline, peopleCircleOutline, alertCircleOutline, cubeOutline, pencilOutline });
  }

  filePath: string = "";

  filterItems() {
    this.kasthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा'
    );

    this.thuthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ'
    );

    this.chiranItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान'
    );

    this.chattaItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा'
    );

    this.ballitemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );

    this.listOfOtherItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य स्थल' ||
        item.actual_name_of_saman === 'अन्य' ||
        item.actual_name_of_saman === 'अन्य जप्त सामान'
    );

    this.banshItemList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बांस'
    );

    this.polItemList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल'
    );

  }

  getIsBeatNirikshanTest(): string {
    if (this.comingComplaintData) {
      if (this.comingComplaintData.is_beat_nirikshan === "1") {
        return "हाँ";
      }
      return "नहीं";
    } else {
      return "";
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  japt_karne_wale_adhikari_ka_name: string = "";
  japt_karne_wale_adhikari_ka_pad: string = "";
  japti_ka_dinak: string = "";  // Date of seizure
  japti_ka_dinak_formatted: string = "";  // Formatted date for display
  japti_ka_sthaan: string = "";  // Place of seizure

  isJaptikartaSameAsPorJarikkarta: string = "1";
  japtikarta_sign: string = "";

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

  isPreviewMode: boolean = false;
  async ngOnInit() {

    this.getLoginedOfficerDetail();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {

      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      console.log('=== RAW DATA FROM NAVIGATION ===');
      console.log('Raw data string:', data);
      console.log('Parsed comingComplaintData:', this.comingComplaintData);
      console.log('Photo fields in comingComplaintData:', {
        por_photo: this.comingComplaintData.por_photo,
        apradhi_photo: this.comingComplaintData.apradhi_photo,
        panch_nama_photo: this.comingComplaintData.panch_nama_photo,
        japti_nama_photo: this.comingComplaintData.japti_nama_photo,
        all_image_name: this.comingComplaintData.all_image_name,
        is_accused_found: this.comingComplaintData.is_accused_found
      });

      this.isPreviewMode = this.comingComplaintData.complain_id === '0' &&
        this.comingComplaintData.complain_status === 'draft';
      //Code added by sandeep start 3 Date 9/28/25
      this.isAccusedFound = this.comingComplaintData.is_accused_found === '1';

      // ✅ Handle dynamic witnesses list (from preview/navigation)
      const anyData: any = this.comingComplaintData as any;
      if (Array.isArray(anyData.witnesses) && anyData.witnesses.length > 0) {
        this.witnessesList = anyData.witnesses as WitnessDetailForPor[];
      } else if (anyData.witnesses_json && String(anyData.witnesses_json).trim() !== '') {
        try {
          this.witnessesList = JSON.parse(String(anyData.witnesses_json)) as WitnessDetailForPor[];
        } catch {
          this.witnessesList = [];
        }
      } else {
        this.witnessesList = [];
      }

      // Handle multiple accused persons
      if (this.comingComplaintData.accusedPersons && this.comingComplaintData.accusedPersons.length > 0) {
        this.accusedPersons = this.comingComplaintData.accusedPersons;
      } else if (this.comingComplaintData.accused_persons_json && this.comingComplaintData.accused_persons_json.trim() !== '') {
        try {
          const accusedArray = JSON.parse('[' + this.comingComplaintData.accused_persons_json + ']');
          // Map field names to match AccusedPersonDetail interface
          this.accusedPersons = accusedArray.map((item: any) => ({
            name: item.name || item.Name || '',
            fathersName: item.fathersName || item.FathersName || '',
            address: item.address || item.Address || '',
            cast: item.cast || item.Cast || '',
            age: item.age || item.Age || '',
            jati_name: item.jati_name || item.ActualCast || '',
            mobile_number: item.mobile_number || item.mobile_number || '',
            aadhaar_number: item.aadhaar_number || item.aadhaar_number || '',
            signatureImage: item.signatureImage || '',
            base64: item.base64 || null
          }));
        } catch (error) {
          this.accusedPersons = [];
        }
      }


      this.por_photo = this.comingComplaintData.por_photo;
      this.apradhi_ka_photo = this.comingComplaintData.apradhi_photo;
      this.japti_nama_photo = this.comingComplaintData.japti_nama_photo;
      this.panch_nama_photo = this.comingComplaintData.panch_nama_photo;

      // ============================================
      // CONSOLE LOG: All 6 Photo Sections Check
      // ============================================
      console.log('=== ALL 6 PHOTO SECTIONS CHECK ===');
      console.log('1. जप्तिनामा का फोटो (japti_nama_photo):', this.japti_nama_photo ? 'EXISTS' : 'MISSING', '| Value:', this.japti_nama_photo?.substring(0, 50) || 'empty');
      console.log('3. अपराधी का फोटो (apradhi_ka_photo):', this.apradhi_ka_photo ? 'EXISTS' : 'MISSING', '| Value:', this.apradhi_ka_photo?.substring(0, 50) || 'empty');
      console.log('4. पंच नामा (panch_nama_photo):', this.panch_nama_photo ? 'EXISTS' : 'MISSING', '| Value:', this.panch_nama_photo?.substring(0, 50) || 'empty');
      console.log('5. POR का फोटो (por_photo):', this.por_photo ? 'EXISTS' : 'MISSING', '| Value:', this.por_photo?.substring(0, 50) || 'empty');
      console.log('6. अन्य फोटो (all_image_name):', this.comingComplaintData.all_image_name ? 'EXISTS' : 'MISSING', '| Length:', this.comingComplaintData.all_image_name?.length || 0);
      console.log('is_accused_found:', this.comingComplaintData.is_accused_found);

      // Process japtinama photos - support multiple photos
      if (this.comingComplaintData.japti_nama_photo && this.comingComplaintData.japti_nama_photo.trim() !== '') {
        if (this.isPreviewMode) {
          // In preview mode, check if it's comma-separated base64 images
          const japtinamaString = this.comingComplaintData.japti_nama_photo;
          if (japtinamaString.includes(',') && japtinamaString.includes('data:image')) {
            // Multiple base64 images
            this.japtinama_photos = japtinamaString.split(/,(?=data:image)/g);
            console.log('Japtinama: Multiple photos detected (preview mode):', this.japtinama_photos.length);
          } else {
            // Single image
            this.japtinama_photos = [japtinamaString];
            console.log('Japtinama: Single photo (preview mode)');
          }
        } else {
          // In normal mode, check if it's comma-separated file names
          const japtinamaString = this.comingComplaintData.japti_nama_photo;
          if (japtinamaString.includes(',')) {
            // Multiple file names
            this.japtinama_photos = japtinamaString
              .split(',')
              .filter(name => name.trim() !== '')
              .map(name => this.filePath + name.trim());
            console.log('Japtinama: Multiple photos detected (normal mode):', this.japtinama_photos.length);
          } else {
            // Single file name
            this.japtinama_photos = [this.filePath + japtinamaString.trim()];
            console.log('Japtinama: Single photo (normal mode)');
          }
        }
      } else {
        this.japtinama_photos = [];
        console.log('Japtinama: No photos');
      }

      this.beat_name = this.comingComplaintData.beat_name;
      this.accussedName = this.comingComplaintData.accused_name;
      this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
      this.address = this.comingComplaintData.accused_address;
      this.accussedCast = this.comingComplaintData.cast_name;
      this.crimType = this.comingComplaintData.crime_type;
      this.complainer_name = this.comingComplaintData.complainer_name;
      this.complainer_ka_pad = this.comingComplaintData.complainer_pad;
      this.complainer_sign = this.comingComplaintData.complainer_sign;

      this.witness_sign_first = this.comingComplaintData.witness_1_sign;
      this.witness_sign_second = this.comingComplaintData.witness_2_sign;
      this.chinhaPhoto = this.comingComplaintData.chinhaPhoto;

      this.japtinama_anya_vishesh_vivran = this.comingComplaintData.japtinama_anya_vishesh_vivran;


      this.crimeDate = this.formatDate(this.comingComplaintData.date_of_crime);
      console.log('=== ACTUAL CRIME DATE DEBUG ===');
      console.log('actual_crime_date raw value:', this.comingComplaintData.actual_crime_date);
      console.log('actual_crime_date type:', typeof this.comingComplaintData.actual_crime_date);
      console.log('actual_crime_date is empty?', !this.comingComplaintData.actual_crime_date);

      this.actualcrimeDate = this.formatDate(this.comingComplaintData.actual_crime_date);
      console.log('actualcrimeDate after formatDate:', this.actualcrimeDate);
      this.listOfVahanDetail = JSON.parse(this.comingComplaintData.vahan_detail);

      this.witness_name_first = this.comingComplaintData.name_of_witness_one;
      this.witness_name_second = this.comingComplaintData.name_of_witness_two;
      this.witness_address_first = this.comingComplaintData.address_of_witness_one;
      this.witness_address_second = this.comingComplaintData.address_of_witness_two;
      this.witness_sign_first = this.comingComplaintData.witness_1_sign;
      this.witness_sign_second = this.comingComplaintData.witness_2_sign;

      // ✅ Fallback: if no witnessesList provided, build it from legacy 2-witness fields
      if (!this.witnessesList || this.witnessesList.length === 0) {
        const w1: WitnessDetailForPor = {
          name: this.witness_name_first || '',
          fatherName: '',
          address: this.witness_address_first || '',
          jaati: '',
          age: '',
          signatureImage: this.witness_sign_first || ''
        };
        const w2: WitnessDetailForPor = {
          name: this.witness_name_second || '',
          fatherName: '',
          address: this.witness_address_second || '',
          jaati: '',
          age: '',
          signatureImage: this.witness_sign_second || ''
        };
        this.witnessesList = [w1, w2].filter(w => !!w.name && String(w.name).trim() !== '' && String(w.name).trim() !== 'NA');
      }

      this.japt_karne_wale_adhikari_ka_name = this.comingComplaintData.japtikarta_ka_name;
      this.japt_karne_wale_adhikari_ka_pad = this.comingComplaintData.japtikarta_ka_pad;

      const anyData2: any = this.comingComplaintData as any;
      this.isJaptikartaSameAsPorJarikkarta = String(anyData2.isJaptikartaSameAsPorJarikkarta ?? '1');
      this.japtikarta_sign = String(anyData2.japtikarta_sign ?? anyData2.japtikarta_sign_base64 ?? '');

      // If same person and sign was not passed explicitly, default to POR sign
      if (this.isJaptikartaSameAsPorJarikkarta === '1' && (!this.japtikarta_sign || this.japtikarta_sign.trim() === '')) {
        this.japtikarta_sign = String((this.comingComplaintData as any)?.complainer_sign ?? '');
      }

      // ✅ DEBUG: JAPTI KA DINAK & STHAAN
      console.log('=== JAPTI KA DINAK & STHAAN DEBUG ===');
      console.log('japti_ka_dinak (raw from API):', this.comingComplaintData.japti_ka_dinak);
      console.log('japti_ka_dinak type:', typeof this.comingComplaintData.japti_ka_dinak);
      console.log('japti_ka_sthaan (raw from API):', this.comingComplaintData.japti_ka_sthaan);
      console.log('japti_ka_sthaan type:', typeof this.comingComplaintData.japti_ka_sthaan);

      this.japti_ka_dinak = this.comingComplaintData.japti_ka_dinak || "";
      this.japti_ka_dinak_formatted = this.formatDate(this.comingComplaintData.japti_ka_dinak || "");
      this.japti_ka_sthaan = this.comingComplaintData.japti_ka_sthaan || "";

      console.log('japti_ka_dinak (after assignment):', this.japti_ka_dinak);
      console.log('japti_ka_dinak_formatted:', this.japti_ka_dinak_formatted);
      console.log('japti_ka_sthaan (after assignment):', this.japti_ka_sthaan);
      console.log('=== END JAPTI KA DINAK & STHAAN DEBUG ===');

      this.por_number = this.comingComplaintData.por_number;
      this.compartment_number = this.comingComplaintData.compartment_number;
      this.compartment_option = this.comingComplaintData.compartment_option || '';
      ;
      this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

      this.crimePlace = this.comingComplaintData.place_of_crime;
      this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
      this.lat = this.comingComplaintData.lat;
      this.lon = this.comingComplaintData.lng;
      this.complain_location_google_addres = this.comingComplaintData.map_address;

      this.listOfjaptiSaman = this.comingComplaintData.japtSamanList
      console.log('listOfjaptiSaman', this.listOfjaptiSaman);
      this.filterItems();

      if (this.comingComplaintData.show_approve_reject_button === "1") {
        this.is_pending = true;
      } else {
        this.is_pending = false;
      }

      // if (this.comingComplaintData.all_image_name && this.comingComplaintData.all_image_name.trim() !== '') {
      //   this.photos = this.comingComplaintData.all_image_name
      //     .split(',')
      //     .filter(name => name.trim() !== '')
      //     .map(name => this.filePath + name.trim());
      // }

      // ============================================
      // CONSOLE LOG: Photos array processing (अन्य फोटो)
      // ============================================
      if (this.comingComplaintData.all_image_name && this.comingComplaintData.all_image_name.trim() !== '') {
        console.log('=== PROCESSING PHOTOS ARRAY (अन्य फोटो) ===');
        console.log('all_image_name (raw):', this.comingComplaintData.all_image_name.substring(0, 100) + '...');
        console.log('all_image_name length:', this.comingComplaintData.all_image_name.length);
        console.log('isPreviewMode:', this.isPreviewMode);

        if (this.isPreviewMode) {
          // In preview mode, images are base64 data URLs
          const photoString = this.comingComplaintData.all_image_name;

          if (photoString && photoString.trim() !== "") {
            this.photos = photoString.split(/,(?=data:image)/g);
            console.log('Preview mode - photos array count:', this.photos.length);
            console.log('Preview mode - first photo preview:', this.photos[0]?.substring(0, 50) + '...');
          }
        } else {
          // In normal mode, images are file names that need file path
          console.log('Normal mode - filePath:', this.filePath);
          this.photos = this.comingComplaintData.all_image_name
            .split(',')
            .filter(name => name.trim() !== '')
            .map(name => this.filePath + name.trim());
          console.log('Normal mode - photos array count:', this.photos.length);
          console.log('Normal mode - first photo full path:', this.photos[0]);
        }
      } else {
        console.log('=== NO PHOTOS DATA (अन्य फोटो) ===');
        console.log('all_image_name is empty or null');
        this.photos = [];
      }

      // if (this.comingComplaintData.imageUrl && this.comingComplaintData.imageUrl.trim() !== '') {



      //   const photoString = this.comingComplaintData.imageUrl;

      //   if (photoString && photoString.trim() !== "") {
      //     this.photos = photoString.split(/,(?=data:image)/g);
      //   }

      //   // this.photos = this.comingComplaintData.imageUrl
      //   //   .split(',')
      //   //   .filter(name => name.trim() !== '')
      //   //   .map(name => this.filePath + name.trim());
      // }

    }
  }

  saveAndGoBack() {
    // Navigate back to add-complain page
    this.navController.back();
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

  isBG: boolean = false;

  async getLoginedOfficerDetail() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOffierEmpId = userData.emp_id;

      const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
      this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

      if (userData.designation_id === "5") {
        this.isBG = true;
      }

    }
  }

  onImageError(event: any) {
    // Handle image error - you can set a placeholder or hide the image
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }

  async showImageAlert(imageUrl: string) {
    // Add null/empty check
    if (!imageUrl || imageUrl.trim() === '') {
      return;
    }

    // Use the same logic as getFullPathImage() for consistency
    // This ensures preview mode (base64) and normal mode (file paths) work correctly
    const finalImageUrl = this.getFullPathImage(imageUrl);

    const modal = await this.modalCtrl.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: finalImageUrl
      },
      backdropDismiss: true,
    });

    await modal.present();
  }

  // getFullPathImage(photoName: string): string {
  //   return this.filePath + "/" + photoName;
  // }

  // Modify the getFullPathImage method (around line 349):
  getFullPathImage(photoName: string): string {
    // Add null/empty check
    if (!photoName || photoName.trim() === '') {
      return '';
    }

    if (this.isPreviewMode) {
      // In preview mode, photoName is already a base64 data URL
      return photoName;
    } else {
      // In normal mode, add file path to photo name
      return this.filePath + "/" + photoName;
    }
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 10000) {
      binary += String.fromCharCode(...bytes.slice(i, i + 10000));
    }
    return btoa(binary);
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

  get totalBalliNag(): number {
    return this.ballitemsList.reduce(
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

  get totalPolNag(): number {
    return this.polItemList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalOdyogicBanshNag(): number {
    return this.banshItemList
      .filter(item => Number(item.prajati_type) === 2)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
  }

  get totalVyaparikBanshNag(): number {
    return this.banshItemList
      .filter(item => Number(item.prajati_type) === 1)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
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

    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');

    const kasthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'हालात', bold: true },
      { text: 'लम्बाई (से.मी.)', bold: true },
      { text: 'गोलाई (से.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'घन मीटर', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशी', bold: true }
    ];

    const buildKasthBody = (items: any[]) => [
      kasthHeader,
      ...items.map(item => [
        // item.actual_name_of_saman || '',
        item.prajati_name || '',
        item.kasth_halat || 0,
        item.lambai || 0,
        item.golai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ])
    ];

    const thuthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति का नाम', bold: true },
      { text: 'ऊंचाई (मीटर)', bold: true },
      { text: 'गोलाई (से.मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'घन मीटर', bold: true },
      { text: 'दर', bold: true },
      { text: 'कुल राशी', bold: true }
    ];

    // Build Thuth body
    const buildThuthBody = (items: any[]) => [
      thuthHeader,
      ...items.map(item => [
        // item.actual_name_of_saman || '',
        item.prajati_name || '',
        item.golai || 0,
        item.nag || 0,
        item.ghan_meter || 0,
        item.dar || 0,
        item.total_cost || 0
      ])
    ];

    // const tableBody = [
    //   [
    //     { text: 'सामान का प्रकार', bold: true },
    //     { text: 'प्रजाति का नाम', bold: true },
    //     { text: 'लम्बाई', bold: true },
    //     { text: 'गोलाई', bold: true },
    //     { text: 'नग', bold: true },
    //     { text: 'घन मीटर', bold: true },
    //     { text: 'दर', bold: true },
    //     { text: 'कुल राशी', bold: true },
    //     { text: 'अन्य जानकारी', bold: true }
    //   ],
    //   ...this.listOfjaptiSaman.map(item => [
    //     item.actual_name_of_saman || '',
    //     item.prajati_name || '',
    //     item.lambai || 0,
    //     item.golai || 0,
    //     item.nag || 0,
    //     item.ghan_meter || 0,
    //     item.dar || 0,
    //     item.total_cost || 0,
    //     item.if_other_then_detail || ''
    //   ])
    // ];

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
            { text: this.comingComplaintData.accused_name === "" ? "अज्ञात" : this.comingComplaintData.accused_name, bold: true },
            ' , पिता का नाम ',
            { text: this.comingComplaintData.accused_fathers_name === "" ? "अज्ञात" : this.comingComplaintData.accused_fathers_name, bold: true },
            ', जाति ',
            { text: this.comingComplaintData.cast_name === "" ? "अज्ञात" : this.comingComplaintData.cast_name, bold: true },
            ' और सकूनत  ', { text: this.comingComplaintData.accused_address === "" ? "अज्ञात" : this.comingComplaintData.accused_address, bold: true },
          ]
        },

        { text: '\n' },

        {
          text: [
            '2. किस्म जुर्म :',
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
        // {
        //   margin: [0, 10, 0, 10],
        //   table: {
        //     headerRows: 1,
        //     widths: ['auto', 'auto', '*', '*', '*', '*', '*', '*', '*'],
        //     body: tableBody
        //   }
        // },

        { text: '\n' },

        // ✅ Insert Kasth & Thuth tables here
        ...(kasthItems.length > 0 ? [
          { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', '*', '*'],
              body: buildKasthBody(kasthItems)
            }
          }
        ] : []),

        ...(thuthItems.length > 0 ? [
          { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
          {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', '*', '*', '*'],
              body: buildThuthBody(thuthItems)
            }
          }
        ] : []),


        { text: '\n' },

        {
          text: [
            '6. प्रथम गवाहान का नाम और पता ',
            { text: this.comingComplaintData.name_of_witness_one + ' (' + this.comingComplaintData.address_of_witness_one + ')', bold: true },
            ' , द्वितीय गवाहान का नाम और पता ',
            { text: this.comingComplaintData.name_of_witness_two + ' (' + this.comingComplaintData.address_of_witness_two + ')', bold: true }
          ]
        },

        { text: '\n' },

        { text: 'दूसरा भाग रेंज असिस्टेंट साहब ____________________ सर्किल को भेजा गया ' },

        { text: '\n' },

        { text: 'तीसरा भाग रेंज ऑफिसर साहब________________________________रेंज को भेजा गया' },

        { text: '\n' },

        {
          columns: [
            { text: ['मुकाम  ', { text: this.comingComplaintData.beat_name, bold: true }] },
            { text: 'दस्तखत फारेस्ट गॉर्ड _______________________', alignment: 'right' }
          ],
          margin: [0, 10, 0, 0]
        },

        { text: '\n' },

        {
          columns: [
            { text: ['तारीख  ', { text: this.comingComplaintData.date_of_crime, bold: true }] },
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
            "अपराध : ", { text: this.comingComplaintData.crime_type, bold: true }
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

  getCrimDharaCommaSeparated(input: string): string {
    if (!input) return "";

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

    // Rebuild into string with newlines instead of commas
    return Object.entries(grouped)
      .map(([act, sections]) => `${act} - ${sections.join(", ")}`)
      .join("\n");
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

  async submitOnlineFromPreview() {
    if (!this.comingComplaintData) return;

    const isOnline = await this.networkCheckService.getCurrentStatus();
    if (!isOnline) {
      this.longToast('इंटरनेट कनेक्शन उपलब्ध नहीं है। कृपया इंटरनेट चालू करें।');
      return;
    }

    const d: any = this.comingComplaintData;
    const formData = new FormData();

    // ── Accused ──
    formData.append('is_accused_found', d.is_accused_found || '0');

    if (d.is_accused_found === '1') {
      let accusedPersonsData: any[] = [];
      try {
        accusedPersonsData = d._accused_persons_for_api ? JSON.parse(d._accused_persons_for_api) : [];
      } catch { accusedPersonsData = []; }

      const accusedList = d.accusedPersons || [];
      for (let i = 0; i < accusedList.length; i++) {
        const person = accusedList[i];
        let signBlob: Blob;
        if (person.signatureImage && person.signatureImage.trim() !== '' && person.signatureImage.startsWith('data:')) {
          signBlob = this.dataURLtoBlob(person.signatureImage);
        } else {
          signBlob = new Blob([], { type: 'image/jpeg' });
        }
        formData.append('listOfAccussedSign', signBlob, `photo_${i + 1}.jpg`);
      }

      formData.append('accusedName', accusedList.length > 0 ? (accusedList[0].name || '') : '');
      formData.append('accusedFathersName', accusedList.length > 0 ? (accusedList[0].fathersName || '') : '');
      formData.append('accusedCast', d._accused_cast_id || '');
      formData.append('accusedAddress', accusedList.length > 0 ? (accusedList[0].address || '') : '');
      formData.append('AccusedPersons', d._accused_persons_for_api || JSON.stringify([]));
    } else {
      formData.append('accusedName', '');
      formData.append('accusedFathersName', '');
      formData.append('accusedCast', '');
      formData.append('accusedAddress', '');
      formData.append('AccusedPersons', JSON.stringify([]));
    }

    // ── Complainer sign ──
    if (d.complainer_sign && d.complainer_sign.trim() !== '' && d.complainer_sign.startsWith('data:')) {
      formData.append('complainer_sign', this.dataURLtoBlob(d.complainer_sign), 'photo_complainer_sign.jpg');
    } else {
      formData.append('complainer_sign', '');
    }

    // ── Vahan ──
    const isJaptVahan = d.is_japt_vahan || '0';
    formData.append('is_japt_vahan', isJaptVahan);
    if (isJaptVahan === '1') {
      formData.append('japt_vahan_detail', d.vahan_detail || JSON.stringify([]));
    } else {
      formData.append('japt_vahan_detail', '');
    }

    // ── Crime meta ──
    formData.append('typeOfCrime', d._type_of_crime_id || '');
    formData.append('placeOfCrime', d.place_of_crime || '');
    formData.append('dateOfCrime', d.date_of_crime || '');
    formData.append('actualCrimeDate', (() => {
      const v = d.actual_crime_date;
      if (!v || String(v).trim() === '' || String(v).includes('NaN')) return '';
      return String(v);
    })());
    formData.append('detailsOfSeizedGoods', d._details_of_seized_goods || d.details_of_seized_goods || 'NA');
    formData.append('createdBy', d._created_by || this.loginedOffierEmpId.toString());

    // ── Location ──
    formData.append('lat', d.lat || '0');
    formData.append('lng', d.lng || '0');
    formData.append('map_address', d.map_address || '');

    // ── Organisation IDs ──
    formData.append('circle_id', d._circle_id || '0');
    formData.append('division_id', d._division_id || '0');
    formData.append('sub_division_id', d._sub_division_id || '0');
    formData.append('range_id', d._range_id || '0');
    formData.append('sub_rang_id', d._sub_rang_id || '0');
    formData.append('beat_id', d._beat_id || '0');

    // ── Witnesses ──
    const validWitnesses = (this.witnessesList || []).filter(
      w => w?.name && String(w.name).trim() !== ''
    );

    const witnessesData: any[] = validWitnesses.map(w => ({
      Name: String(w.name).trim(),
      FathersName: w.fatherName ? String(w.fatherName).trim() : '',
      Address: w.address ? String(w.address).trim() : '',
      Jaati: w.jaati ? String(w.jaati).trim() : '',
      Age: (w.age !== null && w.age !== undefined) ? String(w.age).trim() : '',
      Sign: ''
    }));
    formData.append('Witnesses', JSON.stringify(witnessesData));

    for (let i = 0; i < validWitnesses.length; i++) {
      const w = validWitnesses[i];
      if (w.signatureImage && String(w.signatureImage).trim() !== '' && w.signatureImage.startsWith('data:')) {
        formData.append('listOfWitnessSign', this.dataURLtoBlob(w.signatureImage), `photo_witness_${i + 1}_sign.jpg`);
      } else {
        formData.append('listOfWitnessSign', new Blob([], { type: 'image/jpeg' }), `photo_witness_${i + 1}_sign.jpg`);
      }
    }

    const w1 = validWitnesses[0];
    const w2 = validWitnesses[1];
    formData.append('name_of_witness_one', w1?.name ? String(w1.name).trim() : 'NA');
    formData.append('address_of_witness_one', w1?.address ? String(w1.address).trim() : 'NA');
    formData.append('name_of_witness_two', w2?.name ? String(w2.name).trim() : 'NA');
    formData.append('address_of_witness_two', w2?.address ? String(w2.address).trim() : 'NA');

    if (w1?.signatureImage && String(w1.signatureImage).trim() !== '' && w1.signatureImage.startsWith('data:')) {
      formData.append('first_witness_sign', this.dataURLtoBlob(w1.signatureImage), 'photo_first_witness_sign.jpg');
    }
    if (w2?.signatureImage && String(w2.signatureImage).trim() !== '' && w2.signatureImage.startsWith('data:')) {
      formData.append('second_witness_sign', this.dataURLtoBlob(w2.signatureImage), 'photo_second_witness_sign.jpg');
    }

    // ── Compartment ──
    formData.append('compartment_number', d.compartment_number || '0');

    // ── Crime dhara ──
    formData.append('complainer_name', d.complainer_name || '');
    if (!d.crime_dhara || String(d.crime_dhara).trim() === "") {
      this.shortToast("अपराध धारा चुनें या दर्ज करें");
      return;
    }
    formData.append('crime_dhara', d.crime_dhara || '');
    formData.append('compartment_option', d.compartment_option || '');
    formData.append('por_number', d.por_number || '');

    // ── Saman Detail ──
    formData.append('Saman_Detail', d._saman_detail_for_api || JSON.stringify([]));

    // ── Photos (base64 → blob) ──
    // Other photos (listOfFile)
    if (d.all_image_name && d.all_image_name.trim() !== '') {
      const otherPhotos = d.all_image_name.split(/,(?=data:image)/g);
      for (let i = 0; i < otherPhotos.length; i++) {
        if (otherPhotos[i] && otherPhotos[i].startsWith('data:')) {
          formData.append('listOfFile', this.dataURLtoBlob(otherPhotos[i]), `photo_${i + 1}.jpg`);
        }
      }
    }

    // Japtinama photos
    if (d.japti_nama_photo && d.japti_nama_photo.trim() !== '') {
      const japtiPhotos = d.japti_nama_photo.split(/,(?=data:image)/g);
      for (let i = 0; i < japtiPhotos.length; i++) {
        if (japtiPhotos[i] && japtiPhotos[i].startsWith('data:')) {
          formData.append('japtinama_photo', this.dataURLtoBlob(japtiPhotos[i]), `photo_japtinama_${i + 1}.jpg`);
        }
      }
    }

    formData.append('japtikarta_ka_name', d.japtikarta_ka_name || '');
    formData.append('japtikarta_ka_pad', d.japtikarta_ka_pad || '');

    // NEW: japtikarta sign
    const jSign = String((d as any).japtikarta_sign || (d as any).japtikarta_sign_base64 || '').trim();
    if (jSign && jSign.startsWith('data:')) {
      formData.append('japtikarta_sign', this.dataURLtoBlob(jSign), 'photo_japtikarta_sign.jpg');
    } else {
      formData.append('japtikarta_sign', '');
    }

    // POR photo
    if (d.por_photo && d.por_photo.trim() !== '' && d.por_photo.startsWith('data:')) {
      formData.append('por_pic', this.dataURLtoBlob(d.por_photo), 'photo_por_photo.jpg');
    }

    // Apradhi photo
    if (d.apradhi_photo && d.apradhi_photo.trim() !== '' && d.apradhi_photo.startsWith('data:')) {
      formData.append('apradhi_pic', this.dataURLtoBlob(d.apradhi_photo), 'photo_apradhi_photo.jpg');
    }

    // Panchnama photo
    if (d.panch_nama_photo && d.panch_nama_photo.trim() !== '' && d.panch_nama_photo.startsWith('data:')) {
      formData.append('panchnama_photo', this.dataURLtoBlob(d.panch_nama_photo), 'photo_panchnama.jpg');
    }

    formData.append('complainer_pad', d.complainer_pad || '');
    formData.append('vishesh_vivran_on_japtanama', d.japtinama_anya_vishesh_vivran || '');
    formData.append('japti_ka_dinak', d.japti_ka_dinak || '');
    formData.append('japti_ka_sthaan', d.japti_ka_sthaan || '');

    formData.append('is_beat_nirikshan', d.is_beat_nirikshan || '0');

    // Hammer mark (chinha) photo
    if (d.chinhaPhoto && d.chinhaPhoto.trim() !== '' && d.chinhaPhoto.startsWith('data:')) {
      formData.append('ankit_mark_on_japt_saman', this.dataURLtoBlob(d.chinhaPhoto), 'photo_mark_image_ankit_on_japt_saman.jpg');
    }

    // ── Call API ──
    this.showDialog('POR जमा किया जा रहा है कृपया इंतजार करें');
    this.apiService.submitCrimData(formData).subscribe(
      async (response) => {
        this.dismissDialog();

        let parsedResponse = response;
        if (typeof response === 'string') {
          try { parsedResponse = JSON.parse(response); } catch { }
        }

        const responseData = (parsedResponse as any).response || parsedResponse;

        if (responseData && responseData.code === 200) {
          const successMsg = responseData.msg || 'आपका POR सफलतापूर्वक जमा किया गया |';
          this.sharedService.setRefresh(true);
          await this.showSuccessAndGoBack(successMsg);
        } else {
          const errorMsg = responseData?.msg || 'POR जमा करने में समस्या आ रही है। कृपया पुनः प्रयास करें...';
          this.longToast(errorMsg);
        }
      },
      async (error) => {
        this.dismissDialog();
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

  async showSuccessAndGoBack(msg: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: MessageDialogComponent,
        cssClass: 'custom-dialog-modal',
        componentProps: {
          server_message: msg || 'आपका POR सफलतापूर्वक जमा किया गया |',
          isYesNo: false,
        },
        backdropDismiss: false,
      });

      modal.onDidDismiss().then(() => {
        this.navController.navigateRoot('/officer-dashboard');
      });

      await modal.present();
    } catch { }
  }

}