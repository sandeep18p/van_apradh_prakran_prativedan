import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { IonLoading, IonTextarea, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule

import { File as FilePlugin } from '@awesome-cordova-plugins/file/ngx';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';

import { NavController, ModalController } from '@ionic/angular/standalone';
import { AccusedPersonDetail, AccusedPersonForCourtChalanDetail, ComplainDetails, FinalWorkLog, JaptinamaResponseModal, JaptSamanItem, SupportiveDocumentResponseModel, SupurdnamaResponse, VasuliViranDetailRequestModal, WitnessDetail } from '../officer-dashboard/GetDashboardResponse.model';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addCircleOutline, arrowBack, boat, calendarOutline, cameraOutline, cashOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, closeOutline, locationOutline, mapOutline, refreshCircleOutline, trashOutline, personCircleOutline, navigateOutline, compassOutline, pinOutline, documentTextOutline, receiptOutline, trailSignOutline, gridOutline, peopleOutline, helpCircleOutline, peopleCircleOutline, alertCircleOutline, cubeOutline, pencilOutline, clipboardOutline, imagesOutline, checkmarkDoneCircleOutline, imageOutline, carOutline, walletOutline, shieldCheckmarkOutline, chatboxEllipsesOutline, documentAttachOutline, briefcaseOutline, folderOpenOutline, ribbonOutline, downloadOutline, cloudUploadOutline, scaleOutline } from 'ionicons/icons';
import { ApproveRejectComponent } from 'src/app/dialogs/approve-reject/approve-reject.component';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Toast } from '@capacitor/toast';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { AlertController } from '@ionic/angular';
//import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal/image-preview-modal.component';

import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';

import jsPDF from 'jspdf';
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
import { ChallanDetailResponseModal, WorkLogResponseModal } from '../show-ra-work-log/WorkLogResponseModal.modal';
import { GetComplainHistoryResponseModal } from '../complain-life-history/GetComplainHistoryResponse.modal';
import { catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';
import { PdfViewerDialogComponent } from 'src/app/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { PenaltyPickerModalComponent } from 'src/app/dialogs/penalty-picker-modal/penalty-picker-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { JaptVahanDetailInterface, JaptVahanDetailInterfaceOnlyMalikDetail, JaptVahanDetailInterfaceOnlyVahanDetail, SupportiveDocumentsInterface } from './base64responseofsign.modal';
import { GetRAResponseModal } from 'src/app/dialogs/assign-ra-by-ro/GetRAResponse.modal';
import { match } from 'assert';
const mergedVfs = {
  ...vfsRegular,
  ...vfsBold
};

@Component({
  selector: 'app-view-complain-detail',
  templateUrl: './view-complain-detail.page.html',
  styleUrls: ['./view-complain-detail.page.scss'],
  standalone: true,
  providers: [SocialSharing, FilePlugin, DatePipe],
  imports: [IonicModule, CommonModule, FormsModule, TableModule, NgSelectModule]
})
export class ViewComplainDetailPage implements OnInit {

  beat_compartment: any[] = [];
  listOfSDOAndDFO: GetRAResponseModal[] = [];
  selectedSDOIdDFOId: any = null;

  sdoAdesh = "";
  dfoAdesh = "";
  ccfAdesh = "";

  selectedRadioOptionForCourtChallan: boolean = false;

  private androidPermissions = inject(AndroidPermissions);
  private socialSharing = inject(SocialSharing);

  listOfJaptinamaVivran: JaptinamaResponseModal[] = [];

  listOfSupurdnamaVivran: SupurdnamaResponse[] = []



  listOfWitnessForOnlyPOR: any[] = [];
  listOfAccussedForOnlyPOR: any[] = [];

  listOfWitness:
    {
      id: string,
      naam: string;
      pita_ka_naam: string;
      pata: string;
      jaati: string;
      age: string;
      sign: string;
      japtinama_table_id?: string
      supurdnama_table_id?: string
    }[] = [];


  complainer_name: string = "";
  complainer_pad: string = "";

  complainer_sign: string = "";
  apradhi_ki_photo: string = "";
  por_ki_photo: string = "";
  supurd_nama_photo: string = "";
  japti_nama_photo: string = "";
  panch_nama_photo: string = "";
  raji_nama_pic: string = "";
  shesh_vasuli_rashi: string = "";

  focr_date: string = "";
  focr_number: string = "";

  sdo_adesh_kramank: string = "";
  sdo_adesh_dinank: string = "";

  dfo_adesh_kramank: string = "";
  dfo_adesh_dinank: string = "";

  ccf_adesh_kramank: string = "";
  ccf_adesh_dinank: string = "";


  chinhaPhoto: string = "";
  japtinama_anya_vishesh_vivran: string = "";

  photos: string[] = [];
  //imageBaseUrl: string = 'https://416e-149-34-244-177.ngrok-free.app/uploads/';

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  private loadingSafetyTimer: any = null;

  lat: string = "0"; lon: string = "0";
  complain_location_google_addres: string = "";
  accussedName: string = ""; accussedFatherName: string = ""; address: string = "";
  beat_name: string = "";
  accussedCast: string = ""; crimType: string = "";
  crimeDate: string = "";
  crimePlace: string = "";
  seizedGoodDetail: string = "";

  witness_name_first: string = ""; witness_name_second: string = "";
  witness_address_first: string = ""; witness_address_second: string = "";
  witness_sign_first: string = ""; witness_sign_second: string = "";

  por_number: string = "";
  compartment_number: string = "";
  crime_dhara: string = "";

  actual_crime_date: string = "";

  comingComplaintData!: ComplainDetails;
  isSharing = false;

  listOfjaptiSaman: JaptSamanItem[] = []

  listOfVasuliViran: VasuliViranDetailRequestModal[] = [];



  kasthItemsList: any[] = [];
  thuthItemsList: any[] = [];
  chiranItemsList: any[] = [];
  chattaItemsList: any[] = [];
  OtherJaptItemsList: any[] = [];
  balliItemsList: any[] = [];
  baansItemsList: any[] = [];  // बाँस (Bamboo)
  polItemsList: any[] = [];

  /** वन अपराध प्रकरण प्रतिवेदन card only — all rows of each type (includes japtinama-linked). */
  kasthItemsListPrativedan: any[] = [];
  thuthItemsListPrativedan: any[] = [];
  chiranItemsListPrativedan: any[] = [];
  chattaItemsListPrativedan: any[] = [];
  OtherJaptItemsListPrativedan: any[] = [];
  balliItemsListPrativedan: any[] = [];
  baansItemsListPrativedan: any[] = [];
  polItemsListPrativedan: any[] = [];

  japt_saman_total_price: string = "";
  found_vanopaj_total_price = 0;
  actual_loss_total_price: number = 0;
  mahsul_total_price: string = "";
  mavja_total_price: string = "";
  ra_anushansha: string = "";
  agrim_vasuli_money: string = "";
  total_vasuli_rashi_after_adesh: string = "";
  money_rasid_number: string = "";
  money_rasid_date: string = "";
  is_accussed_want_to_abhisandhanit: string = "";
  raninama_photo: string = "";
  accussed_financial_condition: string = "";
  jachkarta_decision: number | null = null;

  isForwardToCCF: boolean = false;
  isAbhisandhanOrForwardToDFO: boolean = true;
  sdoRemarkToAplekhitOrForwardToDFO: string = "";

  constructor(
    private file: FilePlugin,
    private platForm: Platform,
    //private pdfService: GeneratePdfService,
    private alertCtrl: AlertController, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private apiService: ApiServiceService, private modalCtrl: ModalController, private router: Router, private navController: NavController, private languageService: LanguageServiceService, private datePipe: DatePipe) {
    addIcons({ downloadOutline, cloudUploadOutline, addCircleOutline, trashOutline, mapOutline, closeCircle, closeOutline, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, personCircleOutline, navigateOutline, compassOutline, pinOutline, documentTextOutline, receiptOutline, trailSignOutline, gridOutline, peopleOutline, helpCircleOutline, peopleCircleOutline, alertCircleOutline, cubeOutline, pencilOutline, clipboardOutline, imagesOutline, checkmarkDoneCircleOutline, imageOutline, carOutline, cashOutline, walletOutline, shieldCheckmarkOutline, chatboxEllipsesOutline, documentAttachOutline, briefcaseOutline, folderOpenOutline, ribbonOutline, scaleOutline });
  }

  filePath: string = "";

  filterItems() {
    const isWithoutJaptinamaId = (item: any): boolean => {
      const id = item?.japtinama_table_id;
      return id === null || id === undefined || id.toString().trim() === '';
    };

    this.kasthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा' && isWithoutJaptinamaId(item)
    );

    this.thuthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ' && isWithoutJaptinamaId(item)
    );

    this.chiranItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान' && isWithoutJaptinamaId(item)
    );

    this.chattaItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा' && isWithoutJaptinamaId(item)
    );

    this.OtherJaptItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान' && isWithoutJaptinamaId(item)
    );

    this.balliItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली' && isWithoutJaptinamaId(item)
    );

    this.baansItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस' && isWithoutJaptinamaId(item)
    );

    this.polItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल' && isWithoutJaptinamaId(item)
    );
    // 
    console.log(this.baansItemsList, ' baansItemsList');
    console.log(this.polItemsList, ' polItemsList');

    this.totalVahanPrice = this.listOfJaptVahanDetail.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );

  }

  filterItemsForPrativedan() {
    this.kasthItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा'
    );
    this.thuthItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ'
    );
    this.chiranItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान'
    );
    this.chattaItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा'
    );
    this.OtherJaptItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान'
    );
    this.balliItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );
    this.baansItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस'
    );
    this.polItemsListPrativedan = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल'
    );
  }

  getCompartmentNumberForSaman(item: any): string {
    if (this.comingComplaintData?.is_beat_nirikshan === '1') {
      return (item?.compartment_number ?? '').toString().trim() || '--';
    }
    // console.log(" ok  ok ",this.comingComplaintData?.compartment_number)
    return (this.comingComplaintData?.compartment_number ?? '').toString().trim() || '--';
  }

  getCompartmentOptionForSaman(item: any): string {
    if (this.comingComplaintData?.is_beat_nirikshan === '1') {
      return (item?.compartment_option ?? this.comingComplaintData?.compartment_option ?? '').toString().trim() || '--';
    }
    // s console.log(" ok  ok ",this.comingComplaintData?.compartment_option)
    return (this.comingComplaintData?.compartment_option ?? '').toString().trim() || '--';
  }

  /** जप्तिनामा फोटो: backend may send several file names separated by commas; single name has no comma. */
  splitPhotoNamesCommaSeparated(raw: string | null | undefined): string[] {
    if (raw == null || typeof raw !== 'string') {
      return [];
    }
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  get listOfJaptVahanWithoutJaptinama(): JaptVahanDetailInterface[] {
    return (this.listOfJaptVahanDetail || []).filter(
      item => !item?.japtinama_table_id || item.japtinama_table_id.toString().trim() === ''
    );
  }

  totalVahanPrice: number = 0;

  accussed_found_date: string = "";
  japtsuda_saman_supurd_emp_name: string = "";

  isFinalWorkLogAvailable: boolean = false;
  isAccussedFound: boolean = true;

  // Add these properties to your ViewComplainDetailPage class //Addedhtml2
  accusedPersons: AccusedPersonDetail[] = [];
  accusedCount: number = 0;

  witnessDetailList: WitnessDetail[] = [];

  isComingFromCCF = false;
  isComingFromRO = false;
  isComingFromSDO = false;
  isComingFromDFO = false;
  label_for_sdo_final_submission: string = "अपलेखित टिप्पणी लिखें";
  label_for_sdo_on_submit_button_final_submission: string = "अपलेखित ";

  is_japtikarta_and_supurddar_same: boolean = false;
  supurddar_ka_name: string = "";
  supurddar_ka_pita_ka_name: string = "";
  supurdar_ka_jati: string = "";
  supurddar_ka_vyavsay: string = "";
  supurdar_ka_poora_pata: string = "";
  supurd_me_lene_ka_dinank: string = "";

  japtikarta_ka_name: string = "";
  japtikarta_ka_pad: string = "";
  supurddar_sign: string = "";

  is_for_nastibadha: boolean = false;

  async ngOnInit() {

    this.getLoginedOfficerDetail();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {

      this.comingComplaintData = JSON.parse(data) as ComplainDetails;

      this.is_for_nastibadha = nav?.extras?.state?.['is_for_nastibadha'] ?? false;

      this.isComingFromCCF = nav?.extras?.state?.['final_action_by_ccf'] ?? false;

      this.isComingFromRO = nav?.extras?.state?.['final_action_by_ro'] ?? false;
      this.isComingFromSDO = nav?.extras?.state?.['final_action_by_sdo'] ?? false;
      this.isComingFromDFO = nav?.extras?.state?.['final_action_by_dfo'] ?? false;
      // 
      if (this.comingComplaintData.is_accused_found === '1') {
        this.accusedCount = this.comingComplaintData.accused_count || 0;
        this.accusedPersons = this.comingComplaintData.accusedPersons || [];
      } else {
        this.accusedCount = 0;
        this.accusedPersons = [];
      }


      this.getDetailOfComplain();

    }
  }

  getSDOList() {

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSDOList(this.loginedOffierEmpId.toString(),
      this.loginedOfficerDesignationId.toString()).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {

            this.listOfSDOAndDFO = response.data;

            this.cdRef.detectChanges();


          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          //await this.dismissLoading();
          await this.dismissDialog();
          this.showError(error);
          //this.apiService.showServerMessages(error)
        }
      );
  }

  listOfSupportiveDocumentWHichUploadedBySDO: SupportiveDocumentResponseModel[] = [];
  listOfSupportiveDocumentWHichUploadedByDFO: SupportiveDocumentResponseModel[] = [];

  listOfJaptVahanDetail: JaptVahanDetailInterface[] = [];


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


  prativedan_kramank = "";
  prativedan_dinank = "";

  janch_adhikari_ka_name = "";
  past_crim_record_of_accussed = "";


  japt_saman_total_price_edited_by_ro: Number = 0;
  found_vanopaj_total_price_edited_by_ro: Number = 0;
  actual_loss_total_price_edited_by_ro: Number = 0;

  mahsul_total_price_edited_by_ro: Number = 0;
  mavja_total_price_edited_by_ro: Number = 0;
  mavja_mahsul_total_price_edited_by_ro: Number = 0;
  shesh_vasuli_rashi_at_ro_level: Number = 0;

  calcularSheshVasuliRashiAtRoLevel() {
    this.mavja_mahsul_total_price_edited_by_ro = (Number(this.mahsul_total_price_edited_by_ro)
      + Number(this.mavja_total_price_edited_by_ro));

    this.shesh_vasuli_rashi_at_ro_level = (Number(this.mavja_mahsul_total_price_edited_by_ro) - Number(this.totalVasuli));

  }



  getDetailOfComplain() {

    this.showDialog("कृपया प्रतीक्षा करें");
    // 
    this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.loginedOffierEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      (response) => {
        this.dismissDialog();
        // 

        if (response.response.code === 200) {
          console.log(response, 'data from backend response');
          this.beat_compartment = (response as any)?.beat_compartment || [];
          // 
          if (response.complainData && response.complainData.length > 0) {
            this.comingComplaintData = response.complainData[0];

            this.listOfSupurdnamaVivran = response.listOfSupurdnamaVivran;

            if (this.comingComplaintData.complainer_emp_id?.toString() === this.loginedOffierEmpId.toString()) {
              this.showJaptinamaButton = true;
              this.showSupurdanamaButton = true;
            }

            this.focr_date = this.comingComplaintData.focr_date;
            this.focr_number = this.comingComplaintData.focr_number;
            console.log(this.focr_date, ' focr_date');
            console.log(this.focr_number, ' focr_number');
            if (this.comingComplaintData.is_japt_vahan === "1") {
              if (this.comingComplaintData.japt_vahan_detail && this.comingComplaintData.japt_vahan_detail.trim() !== '') {
                try {
                  this.listOfJaptVahanDetail = JSON.parse('[' + this.comingComplaintData.japt_vahan_detail + ']');
                  console.log(' bahan  ', this.listOfJaptVahanDetail);
                  for (let itemIndex = 0; itemIndex < this.listOfJaptVahanDetail.length; itemIndex++) {

                    let japtVahan = this.listOfJaptVahanDetail[itemIndex];

                    this.totalVahanDetailWithNumberFor_VisayTitle =
                      this.totalVahanDetailWithNumberFor_VisayTitle + ' वाहन ' + japtVahan.vahan_prakar + ' , क्रमांक  ' + japtVahan.vahan_kramank;

                  }

                } catch (error) {

                }
              }
            }

            // 

            if (this.comingComplaintData.finalWorkLogDetailByRa != null) {
              if (this.comingComplaintData.finalWorkLogDetailByRa.length > 0) {

                let finalWorkLog = this.comingComplaintData.finalWorkLogDetailByRa[0];

                this.japt_saman_total_price_edited_by_ro = Number(finalWorkLog.japt_saman_total_price);
                this.actual_loss_total_price_edited_by_ro = Number(finalWorkLog.actual_loss_total_price);
                this.found_vanopaj_total_price_edited_by_ro = Number(finalWorkLog.found_vanopaj_total_price);

                this.janch_adhikari_ka_name = finalWorkLog.ra_name;

                this.prativedan_kramank = finalWorkLog.prativedan_kramank;

                this.prativedan_dinank = finalWorkLog.prativedan_dinank;

                this.past_crim_record_of_accussed = finalWorkLog.past_crim_record_of_accussed;

                this.isFinalWorkLogAvailable = true;


                if (this.comingComplaintData.is_accused_found === "1") {
                  this.isAccussedFound = false;
                  this.accussed_found_date = this.comingComplaintData.date_of_crime;
                } else {
                  this.accussed_found_date = finalWorkLog.accussed_found_date_in_case_of_agyat;
                }

                this.japtsuda_saman_supurd_emp_name = finalWorkLog.japt_suda_saman_jinko_diya_gaya;
                this.japt_saman_total_price = finalWorkLog.japt_saman_total_price;
                this.found_vanopaj_total_price = Number(finalWorkLog.found_vanopaj_total_price);
                this.actual_loss_total_price = Number(finalWorkLog.actual_loss_total_price);
                this.mahsul_total_price = finalWorkLog.mahsul_total_price;

                this.mahsul_total_price_edited_by_ro = Number(this.mahsul_total_price);

                this.mavja_total_price = finalWorkLog.mavja_total_price;
                this.mavja_total_price_edited_by_ro = Number(this.mavja_total_price);

                this.mavja_mahsul_total_price_edited_by_ro = Number(this.mahsul_total_price_edited_by_ro) + Number(this.mavja_total_price_edited_by_ro);

                this.ra_anushansha = finalWorkLog.ra_anushansha;

                this.agrim_vasuli_money = Number(finalWorkLog.agrim_vasuli_money).toString();
                this.total_vasuli_rashi_after_adesh = Number(finalWorkLog.total_vasuli_rashi_after_adesh).toString();


                this.money_rasid_number = finalWorkLog.money_rasid_number;
                this.money_rasid_date = finalWorkLog.money_rasid_date;
                this.is_accussed_want_to_abhisandhanit = finalWorkLog.is_accussed_want_to_abhisandhanit;
                this.accussed_financial_condition = finalWorkLog.accussed_financial_condition;
                const jdRaw = finalWorkLog.jachkarta_decision as number | string | null | undefined;
                console.log(jdRaw, ' jdRaw');
                if (jdRaw === null || jdRaw === undefined || jdRaw === '') {
                  this.jachkarta_decision = null;
                } else {
                  const jdNum = typeof jdRaw === 'number' ? jdRaw : Number(jdRaw);
                  this.jachkarta_decision =
                    jdNum === 0 || jdNum === 1 ? jdNum : null;
                }
                this.raji_nama_pic = finalWorkLog.raji_nama_pic;
                this.shesh_vasuli_rashi = finalWorkLog.shesh_vasuli_rashi;
              }
            }



            this.chinhaPhoto = this.comingComplaintData.chinhaPhoto;
            this.japtinama_anya_vishesh_vivran = this.comingComplaintData.japtinama_anya_vishesh_vivran;

            if (this.comingComplaintData.isJaptikartaAndSupurdarSame === "0") {
              this.is_japtikarta_and_supurddar_same = true;
            } else {
              this.is_japtikarta_and_supurddar_same = false;
            }

            this.supurddar_ka_name = this.comingComplaintData.supurddar_ka_name;
            this.supurddar_ka_pita_ka_name = this.comingComplaintData.supurddar_ka_pita_ka_name;
            this.supurdar_ka_jati = this.comingComplaintData.supurdar_ka_jati;
            this.supurddar_ka_vyavsay = this.comingComplaintData.supurddar_ka_vyavsay;
            this.supurdar_ka_poora_pata = this.comingComplaintData.supurdar_ka_poora_pata;
            this.supurd_me_lene_ka_dinank = this.comingComplaintData.supurd_me_lene_ka_dinank;

            this.japtikarta_ka_name = this.comingComplaintData.japtikarta_ka_name;
            this.japtikarta_ka_pad = this.comingComplaintData.japtikarta_ka_pad;
            this.supurddar_sign = this.comingComplaintData.supurddar_sign;

            this.complainer_name = this.comingComplaintData.complainer_name;
            this.complainer_pad = this.comingComplaintData.complainer_pad;

            this.complainer_sign = this.comingComplaintData.complainer_sign;
            this.apradhi_ki_photo = this.comingComplaintData.apradhi_photo;
            this.por_ki_photo = this.comingComplaintData.por_photo;
            this.supurd_nama_photo = this.comingComplaintData.supurd_nama_photo;
            this.japti_nama_photo = this.comingComplaintData.japti_nama_photo;
            this.panch_nama_photo = this.comingComplaintData.panch_nama_photo;

            this.beat_name = this.comingComplaintData.beat_name;

            this.accussedName = this.comingComplaintData.accused_name;
            this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
            this.address = this.comingComplaintData.accused_address;
            this.accussedCast = this.comingComplaintData.cast_name;

            this.crimType = this.comingComplaintData.crime_type;
            this.crimeDate = this.comingComplaintData.date_of_crime;

            this.witness_name_first = this.comingComplaintData.name_of_witness_one;
            this.witness_name_second = this.comingComplaintData.name_of_witness_two;
            this.witness_address_first = this.comingComplaintData.address_of_witness_one;
            this.witness_address_second = this.comingComplaintData.address_of_witness_two;
            this.witness_sign_first = this.comingComplaintData.witness_1_sign;
            this.witness_sign_second = this.comingComplaintData.witness_2_sign;

            this.witnessDetailList.push({
              witnessName: this.witness_name_first,
              address: this.witness_address_first,
              sign: this.witness_sign_first,
              base64: null
            });
            this.witnessDetailList.push({
              witnessName: this.witness_name_second,
              address: this.witness_address_second,
              sign: this.witness_sign_second,
              base64: null
            });


            if (this.comingComplaintData.accused_persons_json && this.comingComplaintData.accused_persons_json.trim() !== '') {
              try {
                const accusedArray = JSON.parse('[' + this.comingComplaintData.accused_persons_json + ']');
                this.accusedCount = accusedArray.length || 0;
                this.accusedPersons = (accusedArray || []).map((a: any) => ({
                  ...a,
                  aadhaar_number: a.aadhaar_number || ''
                }));
              } catch (error) {
                this.accusedCount = 0;
                this.accusedPersons = [];
              }
            } else {
              this.accusedCount = 0;
              this.accusedPersons = [];
            }

            this.por_number = this.comingComplaintData.por_number;
            this.compartment_number = this.comingComplaintData.compartment_number;
            // 
            this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);


            this.actual_crime_date = this.comingComplaintData.actual_crime_date;

            this.crimePlace = this.comingComplaintData.place_of_crime;
            this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
            this.lat = this.comingComplaintData.lat;
            this.lon = this.comingComplaintData.lng;
            this.complain_location_google_addres = this.comingComplaintData.map_address;

            ;
            this.listOfjaptiSaman = this.comingComplaintData.japtSamanList || [];
            // 
            this.filterItems();
            this.filterItemsForPrativedan();

            if (this.comingComplaintData.all_image_name && this.comingComplaintData.all_image_name.trim() !== '') {
              this.photos = this.comingComplaintData.all_image_name
                .split(',')
                .filter(name => name.trim() !== '')
                .map(name => name.trim());
            }


            // 
            this.getWorkLog();

            this.getTotalVanopajRashi();

            this.listOfSupportiveDocumentWHichUploadedBySDO = response.supportiveDocument.filter(item => item.designation_id === '3');
            this.listOfSupportiveDocumentWHichUploadedByDFO = response.supportiveDocument.filter(item => item.designation_id === '2');


            this.listOfJaptinamaVivran = this.comingComplaintData?.listOfJaptinamaVivran || [];



            for (let i = 0; i < this.listOfJaptinamaVivran.length; i++) {

              let japtinamaDetail = this.listOfJaptinamaVivran[i];

              this.filterItemsForJaptinama(japtinamaDetail);

              if (japtinamaDetail.accussed_ids != "") {

                let listOfAccussedPerons: AccusedPersonForCourtChalanDetail[] = [];

                let accusedArray = japtinamaDetail.accussed_ids
                  ? japtinamaDetail.accussed_ids.split(',').map(x => x.trim())
                  : [];


                accusedArray.forEach(id => {
                  let matchedObj = this.accusedPersons.find(person => person.accussed_person_table_id?.toString() === id);


                  if (matchedObj) {

                    let object: AccusedPersonForCourtChalanDetail = {
                      name: matchedObj.name,
                      fathersName: matchedObj.fathersName,
                      age: matchedObj.age || 0,
                      mobile_number: matchedObj.mobile_number,
                      aadhaar_number: matchedObj.aadhaar_number ?? '',
                      cast: matchedObj.cast,
                      jati_name: matchedObj.jati_name,
                      address: matchedObj.address,
                      gir_sthan: '',
                      gir_date: '',
                      gir_time: '',
                      gir_adhikari: '',
                      gir_paya_gaya_saman: '',
                      gir_body_mark: '',
                      id_to_update: '',
                      accussed_person_table_id: "",
                      signatureImage: matchedObj.signatureImage
                    };

                    listOfAccussedPerons.push(object);

                    this.listOfJaptinamaVivran[i].accusedPersonsList = listOfAccussedPerons;
                  }
                });

              }


              if (japtinamaDetail.witness_json != "") {

                let witnessJsonStr = japtinamaDetail.witness_json;

                witnessJsonStr = `[${witnessJsonStr}]`;

                let witnessPersonsList = JSON.parse(witnessJsonStr);
                this.listOfJaptinamaVivran[i].witnessPersonList = witnessPersonsList;

              }

            }



            for (let i = 0; i < this.listOfSupurdnamaVivran.length; i++) {


              let supurdnamaDetail = this.listOfSupurdnamaVivran[i];

              this.filterItemsForSupurdNama(supurdnamaDetail);

              if (supurdnamaDetail.witness_json != "") {

                let witnessJsonStr = supurdnamaDetail.witness_json;

                witnessJsonStr = `[${witnessJsonStr}]`;


                let witnessPersonsList = JSON.parse(witnessJsonStr);

                this.listOfSupurdnamaVivran[i].witnessPersonList = witnessPersonsList.flat();

              }
            }



            this.listOfWitness = this.comingComplaintData.listOfWitness;

            this.listOfWitnessForOnlyPOR = [];
            for (let i = 0; i < this.listOfWitness.length; i++) {

              let isJaptinamaFullBlank = (this.listOfWitness[i].japtinama_table_id === "" || this.listOfWitness[i].japtinama_table_id === "0" || this.listOfWitness[i].japtinama_table_id === null);


              let isSupurdNamaFullBlank = (this.listOfWitness[i].supurdnama_table_id === "" || this.listOfWitness[i].supurdnama_table_id === "0" || this.listOfWitness[i].supurdnama_table_id === null);

              if (isJaptinamaFullBlank && isSupurdNamaFullBlank) {
                this.listOfWitnessForOnlyPOR.push(this.listOfWitness[i]);
              }
            }

            for (let i = 0; i < this.accusedPersons.length; i++) {

              if (this.accusedPersons[i].is_it_por_accussed === "1") {
                this.listOfAccussedForOnlyPOR.push(this.accusedPersons[i]);
              }
            }


          }

          this.getComplainerSignIntoBase64();

        }



      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  supurddarSignBase64: string = "";
  complainerSignBase64: string = "";
  markBase64: string = "";

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

    // Safety: avoid stuck overlay blocking taps on Android WebView
    if (this.loadingSafetyTimer) {
      clearTimeout(this.loadingSafetyTimer);
    }
    this.loadingSafetyTimer = setTimeout(() => {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }, 30000);
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
    if (this.loadingSafetyTimer) {
      clearTimeout(this.loadingSafetyTimer);
      this.loadingSafetyTimer = null;
    }
  }

  loginedOffierEmpId: number = 0;
  loginedOfficerDesignationId: number = 0;

  isBG: boolean = false;
  isRA: boolean = false;
  isRO: boolean = false;
  isSDO: boolean = false;
  isDFO: boolean = false;

  selectedPenaltySection: string = 'none'; // Track selected penalty section for combobox

  penaltySections = [
    { value: 'none', label: 'कृपया कोई एक चयन करें' },
    { value: 'ifa-1927', label: 'भारतीय वन अधिनियम 1927' },
    { value: 'wpa-1972', label: 'वन्य प्राणी (संरक्षण) अधिनियम 1972 यथा संशोधित 2022' },
    { value: 'cg-fp-transport-2001', label: 'छत्तीसगढ़ वनोपज (अर्थिवहन) नियम 2001' },
    { value: 'cg-timber-1984', label: 'छत्तीसगढ़ काष्ठ चिरान (विनियमन) अधिनियम 1984' },
    { value: 'cg-timber-rules-1984', label: 'छत्तीसगढ़ काष्ठ चिरान (विनियमन) नियम 1984' },
    { value: 'cg-fp-trade-1969', label: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) अधिनियम 1969' },
    { value: 'cg-fp-trade-rules-1969', label: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) नियम 1969' },
    { value: 'cg-fp-trade-timber-1973', label: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) काष्ठ नियम 1973' },
    { value: 'cg-grazing-1986', label: 'छत्तीसगढ़ चराई नियम 1986' },
    { value: 'cg-tendu-1964', label: 'छत्तीसगढ़ तन्दुपत्ता (व्यापार विनियमन) अधिनियम 1964' },
    { value: 'cg-tendu-rules-1966', label: 'छत्तीसगढ़ तन्दुपत्ता (व्यापार विनियमन) नियमावली 1966' },
    { value: 'ppd-1984', label: 'लोक संपत्ति क्षति निवारण अधिनियम 1984' }
  ];

  get penaltySectionDisplay(): string {
    // 
    const found = this.penaltySections.find(s => s.value === this.selectedPenaltySection);
    return found?.label ?? 'कृपया कोई एक चयन करें';
  }

  async presentPenaltyPicker() {
    const modal = await this.modalCtrl.create({
      component: PenaltyPickerModalComponent,
      componentProps: {
        selectedValue: this.selectedPenaltySection,
        sections: this.penaltySections
      },
      cssClass: 'custom-dialog-modal',
      backdropDismiss: true
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.selectedValue) {
      this.selectedPenaltySection = data.selectedValue;
      this.cdRef.detectChanges();
    }
  }

  rangName: string = "";
  divisionName: string = "";

  async getLoginedOfficerDetail() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOffierEmpId = userData.emp_id;
      this.loginedOfficerDesignationId = Number(userData.designation_id);

      this.rangName = userData.range_name;
      this.divisionName = userData.division_name;

      // 

      const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
      this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

      if (userData.designation_id === "5") {
        this.isBG = true;
      } else if (userData.designation_id === "6") {
        this.isRA = true;
      } else if (userData.designation_id === "4") {
        this.isRO = true;
      } else if (userData.designation_id === "3") {
        this.isSDO = true;
      } else if (userData.designation_id === "2") {
        this.isDFO = true;
      }

      if (this.isComingFromRO || this.is_for_nastibadha) {
        this.getSDOList();
      }

    }
  }


  isRaAndFinalSubmissionDone(): boolean {
    if (this.comingComplaintData != undefined && (Number(this.comingComplaintData.current_stage) >= 2)) {
      return true;
    }
    return false;
  }

  async showImageAlert(imageUrl: string) {

    // const modal = await this.modalCtrl.create({
    //   component: ImagePreviewModalComponent,
    //   cssClass: 'custom-dialog-modal',
    //   componentProps: {
    //     imageUrl: this.filePath + "/" + imageUrl
    //   },
    //   backdropDismiss: true,
    // });

    // await modal.present();
    const modal = await this.modalCtrl.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: this.filePath + "/" + imageUrl
      },
      backdropDismiss: true,
    });

    await modal.present();

  }

  async showPdf(imageUrl: string) {

    const modal = await this.modalCtrl.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: this.filePath + "/" + imageUrl
      },
      backdropDismiss: true,
    });

    await modal.present();

  }

  onImageError(event: any) {
    //event.target.src = 'assets/img/default_image.png'; // path to your default image
  }

  getFullPathImage(photoName: string): string {
    //
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

  get totalThunthNag(): number {
    return this.thuthItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get mavja_plush_mahsul_total_price(): number {
    return Number(this.mavja_total_price) + Number(this.mahsul_total_price);

  }

  get totalThunthRashi(): number {
    return this.thuthItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalThunthGhanMeter(): number {
    return this.thuthItemsList.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }


  get totalKashthNag(): number {
    return this.kasthItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthRashi(): number {
    return this.kasthItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
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

  get totalBalliRashi(): number {
    return this.balliItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
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

  get totalChiranRashi(): number {
    return this.chiranItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalChattaRashi(): number {
    return this.chattaItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalChiranGhanMeter(): string {
    return this.chiranItemsList
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
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

  get totalThunthNagPrativedan(): number {
    return this.thuthItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalThunthRashiPrativedan(): number {
    return this.thuthItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalThunthGhanMeterPrativedan(): number {
    return this.thuthItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalKashthNagPrativedan(): number {
    return this.kasthItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthRashiPrativedan(): number {
    return this.kasthItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalKashthGhanMeterPrativedan(): string {
    return this.kasthItemsListPrativedan
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalBalliNagPrativedan(): number {
    return this.balliItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliRashiPrativedan(): number {
    return this.balliItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalBaansNagPrativedan(): number {
    return this.baansItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBaansRashiPrativedan(): number {
    return this.baansItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalPolNagPrativedan(): number {
    return this.polItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalPolRashiPrativedan(): number {
    return this.polItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalChiranNagPrativedan(): number {
    return this.chiranItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranRashiPrativedan(): number {
    return this.chiranItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalChiranGhanMeterPrativedan(): string {
    return this.chiranItemsListPrativedan
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChattaNagPrativedan(): number {
    return this.chattaItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChattaRashiPrativedan(): number {
    return this.chattaItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  get totalJaptSamanNagPrativedan(): number {
    return this.OtherJaptItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalJaptSamanGhanMeterPrativedan(): number {
    return this.OtherJaptItemsListPrativedan.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalJaptSamanAnumanitMulyaPrativedan(): number {
    return this.OtherJaptItemsListPrativedan.reduce(
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

  async setSignatureOfWitnessesOfParticularSection(japtinamaDetail: JaptinamaResponseModal) {


    if (!japtinamaDetail.witnessPersonList || japtinamaDetail.witnessPersonList.length === 0) {
      this.generatePDFOfJaptinamaOfParticularSection(japtinamaDetail);
      return;
    }

    const base64RequestsOfWitness = (japtinamaDetail.witnessPersonList || []).map(a => {

      if (!a.sign || a.sign.trim() === '') {
        return of({ ...a, base64: null });
      }

      return this.apiService.getBase64Image(a.sign).pipe(
        map((response: any) => {

          const base64 =
            response?.response?.code === 200
              ? response.response.msg
              : null;

          return { ...a, base64 };

        }),
        catchError(() => {
          return of({ ...a, base64: null });
        })
      );
    });

    forkJoin(base64RequestsOfWitness).subscribe({
      next: (results) => {


        japtinamaDetail.witnessPersonList = results;

        this.generatePDFOfJaptinamaOfParticularSection(japtinamaDetail);
      },
      error: () => {
        this.generatePDFOfJaptinamaOfParticularSection(japtinamaDetail);
      }
    });
  }

  async setSignatureOfWitnesses() {


    if (!this.listOfWitness || this.listOfWitness.length === 0) {
      this.generatePDFOfJaptinama();
      return;
    }

    const base64RequestsOfWitness = this.listOfWitness.map(a => {

      // If no sign → skip API call
      if (!a.sign || a.sign.trim() === '') {

        return of({ ...a, base64: null });
      }

      return this.apiService.getBase64Image(a.sign).pipe(
        map((response: any) => {

          const base64 =
            response?.response?.code === 200
              ? response.response.msg
              : null;

          return { ...a, base64 };

        }),
        catchError(() => {
          // Do NOT call generatePDF here
          return of({ ...a, base64: null });
        })
      );
    });

    forkJoin(base64RequestsOfWitness).subscribe({
      next: (results) => {

        // Preserve full list
        this.listOfWitness = results;

        this.generatePDFOfJaptinama();
      },
      error: () => {
        this.generatePDFOfJaptinama();
      }
    });
  }


  async generatePDFOfParticularSectionOfSupurdnama(supurdnamaDetail: SupurdnamaResponse) {

    ;
    let witnessSection: any;

    const witnessTableBody = [
      [
        { text: 'क्रमांक', bold: true },
        { text: 'साक्षी का नाम', bold: true },
        { text: 'पिता का नाम', bold: true },
        { text: 'उम्र', bold: true },
        { text: 'जाति', bold: true },
        { text: 'पूरा पता', bold: true },
        { text: 'हस्ताक्षर', bold: true }
      ],

      ...(supurdnamaDetail.witnessPersonList || []).map((a: any, index: number) => [
        index + 1,
        a.naam || '',
        a.pita_ka_naam || '',
        a.age || '',
        a.jaati || '',
        a.pata || '',
        (() => {

          const safeImage = this.getSafeImage(a.base64);

          return safeImage
            ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
            : { text: '—', alignment: 'center' };
        })()
      ])
    ];

    witnessSection = {
      stack: [
        {
          text: 'गवाह जिनके समक्ष सामग्री सुपुर्द की गई है -',
          style: 'subheader',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*', 60],
            body: witnessTableBody
          },
          margin: [0, 0, 0, 10]
        }
      ]
    };

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const today = new Date();
    const todaysDate = this.datePipe.transform(today, 'dd-MM-yyyy');

    const balliItems = supurdnamaDetail.balliItemsList;
    const kasthItems = supurdnamaDetail.kasthItemsList;
    const chiranItems = supurdnamaDetail.chiranItemsList;
    const chattaItems = supurdnamaDetail.chattaItemsList;
    const anyaJaptSamanItems = supurdnamaDetail.OtherJaptItemsList;
    const banshItem = supurdnamaDetail.baansItemsList;
    const polItem = supurdnamaDetail.polItemsList;

    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true },
      { text: 'लम्बाई (मी.)', bold: true },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true },
      { text: 'मात्रा (नोशनल टन)', bold: true }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.supurd_me_diya_gya_nag || 0,
        item.ghan_meter || 0
      ]) : [['-', 0, 0, 0]])
    ];

    const polHeader = [
      { text: 'प्रजाति', bold: true },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.supurd_me_diya_gya_nag || 0
      ]) : [['-', 0]])
    ];

    const anyaJaptSamanHeader = [
      { text: 'सामाग्री का विवरण', bold: true },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true },
      { text: 'मात्रा (घन मीटर)', bold: true },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.if_other_then_detail || '',
        item.supurd_me_diya_gya_nag || 0,
        item.ghan_meter || 0,
      ]) : [['-', 0, 0]])
    ];

    const chattaHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या (सुपुर्द में दिया गया)/', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.supurd_me_diya_gya_nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const balliHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.supurd_me_diya_gya_nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const chiranHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.supurd_me_diya_gya_nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const kasthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या (सुपुर्द में दिया गया)', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.supurd_me_diya_gya_nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const contentOfJaptiSaman: any[] = [];

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*'],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.kasthItemsList || []) + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanTypeSupurNama(supurdnamaDetail.kasthItemsList || []) + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.balliItemsList || []) + ',   ' },
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', '*', '*', '*', 'auto'],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.chiranItemsList || []) + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanTypeSupurNama(supurdnamaDetail.chiranItemsList || []) + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*'],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.chattaItemsList || []) + ',   ' },
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (banshItem && banshItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildBansBody(banshItem)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.baansItemsList || []) + ',   ' },
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.polItemsList || []) + ',   ' },
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanTypeSupurNama(supurdnamaDetail.OtherJaptItemsList || []) + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanTypeSupurNama(supurdnamaDetail.OtherJaptItemsList || []) + ',   ' },
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    const supurddarSignBlock = {
      width: 'auto',
      stack: [
        ...(this.supurddarSignBase64 && this.supurddarSignBase64.trim() !== ''
          ? [
            {
              image: this.supurddarSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),

        {
          text: '(' + supurdnamaDetail.SupurdarKaName + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: 'सुपुर्ददार का नाम तथा हस्ताक्षर या बाएं अंगूठे का निशान', alignment: 'center', fontSize: 10 }
      ]
    };

    const japtinamaSignBlock = {
      width: 'auto',
      stack: [
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),

        {
          text: '(' + supurdnamaDetail.SupurdMeDeneWaleAdhikariName + ' , ' + supurdnamaDetail.SupurdMeDeneWaleAdhikariPad + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: (this.comingComplaintData.is_complain_created_by_ra == '1' || this.comingComplaintData.is_complain_created_by_ra === 'true') ? 'सहयाक परिछेत्र वृत्त ' : 'अधिकारी का नाम, पद एवं हस्ताक्षर', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };

    const parts = supurdnamaDetail.SupurdarMeLeneKaDate.split('-'); // [yyyy, MM, dd]
    const formattedSupurdmeLeneKaDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'सुपुर्दनामा', style: 'title' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 5, 0]
            }
          ],
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },


        {
          stack: [
            {
              columns: [
                {
                  width: '*',
                  text: [
                    "मैं ",
                    { text: supurdnamaDetail.SupurdarKaName, bold: true },
                    " पुत्र ",
                    { text: supurdnamaDetail.SupurdarKaFather, bold: true },
                    " जाति ",
                    { text: supurdnamaDetail.SupurdarKaJati, bold: true },
                    " व्यवसाय ",
                    { text: supurdnamaDetail.SupurdarKaVyavsay, bold: true },
                    " पता ",
                    { text: supurdnamaDetail.SupurdarKaPooraPata, bold: true },
                    " का निवासी हूँ |"
                  ],
                  leadingIndent: 40

                }
              ],
              margin: [0, 0, 0, 5]
            },


            {
              columns: [
                {
                  width: '*',
                  text: [
                    "मैंने भारतीय वन अधिनियम, 1927 की धारा 52 के तहत जप्त निम्नानुसार सामाग्री वन अधिकारी श्री ",
                    { text: supurdnamaDetail.SupurdMeDeneWaleAdhikariName, bold: true },
                    " पद ",
                    { text: supurdnamaDetail.SupurdMeDeneWaleAdhikariPad, bold: true },
                    " से आज दिनांक ",
                    { text: formattedSupurdmeLeneKaDate, bold: true },
                    " को, सुपुर्दनामे में प्राप्त की है |"
                  ],
                  leadingIndent: 40
                }
              ],
              margin: [0, 0, 0, 5]
            },

            {
              columns: [
                {
                  text: "मैं इस करारनामे के अनुसार उपरोक्त सामाग्री को अपने प्रभार में लेकर इकरार करता हूँ कि मैं उसकी पूरी सुरक्षा करूँगा तथा वन अधिकारी के आदेश होने पर तत्काल प्रस्तुत करूँगा |"
                }
              ],
              leadingIndent: 40
            }
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },

        { text: '\n', fontSize: 2 },

        { text: 'सुपुर्दनामे में प्राप्त सामाग्री का विवरण :', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },

        contentOfJaptiSaman,

        { text: '\n', fontSize: 2 },

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: todaysDate, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            ...(supurddarSignBlock ? [supurddarSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        },

        { text: '\n', fontSize: 2 },

        { text: 'मेरे द्वारा उपरोक्तानुसार सामाग्री सुपुर्दगी में दी गई -', fontSize: 10 },

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: todaysDate, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            ...(japtinamaSignBlock ? [japtinamaSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        },
        witnessSection,

      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("SUPURDNAMA_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "SUPURDNAMA_" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

      });

    }

  }

  async getSignOfWitnessesForparticularSupurdNama(supurdNama: SupurdnamaResponse) {

    const base64RequestsOfWitness = (supurdNama.witnessPersonList || []).map(a => {

      if (!a.sign || a.sign.trim() === '') {
        return of({ ...a, base64: null });
      }

      return this.apiService.getBase64Image(a.sign).pipe(
        map((response: any) => {

          const base64 =
            response?.response?.code === 200
              ? response.response.msg
              : null;

          return { ...a, base64 };

        }),
        catchError(() => {
          return of({ ...a, base64: null });
        })
      );
    });

    forkJoin(base64RequestsOfWitness).subscribe({
      next: (results) => {


        supurdNama.witnessPersonList = results;

        this.generatePDFOfParticularSectionOfSupurdnama(supurdNama);
      },
      error: () => {
        this.generatePDFOfParticularSectionOfSupurdnama(supurdNama);
      }
    });
  }

  async getSignOfWitnesses() {
    if (this.listOfWitness.length > 0) {
      const base64RequestsOfWitness = this.listOfWitness.map(a =>
        this.apiService.getBase64Image(a.sign).pipe(
          map((response: any) => {

            const base64 =
              response?.response?.code === 200
                ? response.response.msg
                : null;

            // Return the updated person with base64
            return { ...a, base64 };
          }),
          catchError(error => {
            return of({ ...a, base64: null });
          })
        )
      );

      forkJoin(base64RequestsOfWitness).subscribe({
        next: (results) => {

          // Update original accusedPersons array
          this.listOfWitness = results;

          // Now safely continue
          this.generatePDFOfSupurdnama();
        },
        error: (err) => {
          this.generatePDFOfSupurdnama();
        }
      });

    } else {
      this.generatePDFOfSupurdnama();
    }

  }


  async generatePDFOfJaptinamaOfParticularSection(japtinamaDetail: JaptinamaResponseModal) {


    if (!japtinamaDetail.accusedPersonsList || japtinamaDetail.accusedPersonsList.length === 0) {
      this.nextAfterGotAllSignOfAccussedSignOfParticularSection(japtinamaDetail);
      return;
    }

    const base64Requests = (japtinamaDetail.accusedPersonsList || []).map(a => {

      if (!a.signatureImage || a.signatureImage.trim() === '') {

        return of({ ...a, base64: null });
      }

      return this.apiService.getBase64Image(a.signatureImage).pipe(
        map((response: any) => {

          const base64 =
            response?.response?.code === 200
              ? response.response.msg
              : null;

          return { ...a, base64 };

        }),
        catchError(() => {

          return of({ ...a, base64: null });
        })
      );
    });

    forkJoin(base64Requests).subscribe({
      next: (results) => {

        japtinamaDetail.accusedPersonsList = results as any;
        this.nextAfterGotAllSignOfAccussedSignOfParticularSection(japtinamaDetail);
      },
      error: () => {

        this.nextAfterGotAllSignOfAccussedSignOfParticularSection(japtinamaDetail);
      }
    });
  }

  async generatePDFOfJaptinama() {

    if (!this.accusedPersons || this.accusedPersons.length === 0) {
      this.nextAfterGotAllSignOfAccussedSign();
      return;
    }

    const base64Requests = this.accusedPersons.map(a => {

      // If no signature → return immediately
      if (!a.signatureImage || a.signatureImage.trim() === '') {
        return of({ ...a, base64: null });
      }

      // If signature exists → call API
      return this.apiService.getBase64Image(a.signatureImage).pipe(
        map((response: any) => {

          const base64 =
            response?.response?.code === 200
              ? response.response.msg
              : null;

          return { ...a, base64 };

        }),
        catchError(() => {
          // Do NOT call next method here
          return of({ ...a, base64: null });
        })
      );
    });

    forkJoin(base64Requests).subscribe({
      next: (results) => {

        // Preserve full accused list
        this.accusedPersons = results;

        this.nextAfterGotAllSignOfAccussedSign();
      },
      error: () => {

        // Even if something unexpected happens
        this.nextAfterGotAllSignOfAccussedSign();
      }
    });
  }

  private getSafeImage(base64: string | null | undefined): string | null {

    if (!base64) return null;

    const trimmed = base64.trim();
    if (!trimmed) return null;

    // If already data URL
    if (trimmed.startsWith('data:image/')) {

      const parts = trimmed.split(',');

      // Ensure actual base64 exists after comma
      if (parts.length !== 2 || !parts[1] || parts[1].trim() === '') {
        return null;
      }

      return trimmed;
    }

    // If raw base64 — must be long enough to be real image
    if (trimmed.length < 100) {
      return null; // too small to be real image
    }

    // Detect JPEG
    if (trimmed.startsWith('/9j/')) {
      return 'data:image/jpeg;base64,' + trimmed;
    }

    // Otherwise assume PNG
    return 'data:image/png;base64,' + trimmed;
  }

  /** When true, next japtinama pdfMake doc `content` is stored and download is skipped (combined PDF). */
  private _japtinamaPdfCaptureContentOnly = false;
  private _japtinamaPdfCapturedContent: any[] | null = null;

  private async fetchBase64ForCombinedPdf(imageRef: string | undefined | null): Promise<string | null> {
    if (!imageRef || String(imageRef).trim() === '') {
      return null;
    }
    try {
      const response: any = await firstValueFrom(this.apiService.getBase64Image(String(imageRef).trim()));
      if (response?.response?.code === 200) {
        return response.response.msg;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private refreshPORWitnessListFromWitness(): void {
    this.listOfWitnessForOnlyPOR = [];
    const src = this.listOfWitness || [];
    for (let i = 0; i < src.length; i++) {
      const w = src[i];
      const isJaptinamaFullBlank = (w.japtinama_table_id === '' || w.japtinama_table_id === '0' || w.japtinama_table_id === null);
      const isSupurdNamaFullBlank = (w.supurdnama_table_id === '' || w.supurdnama_table_id === '0' || w.supurdnama_table_id === null);
      if (isJaptinamaFullBlank && isSupurdNamaFullBlank) {
        this.listOfWitnessForOnlyPOR.push(w);
      }
    }
  }

  private refreshPORAccusedListFromAccused(): void {
    this.listOfAccussedForOnlyPOR = [];
    for (let i = 0; i < (this.accusedPersons || []).length; i++) {
      if (this.accusedPersons[i].is_it_por_accussed === '1') {
        this.listOfAccussedForOnlyPOR.push(this.accusedPersons[i]);
      }
    }
  }

  private async loadBinaryAssetsForMainJaptinamaCombined(): Promise<void> {
    const chin = this.comingComplaintData?.chinhaPhoto;
    this.markBase64 = (await this.fetchBase64ForCombinedPdf(chin)) || '';
    const cs = this.comingComplaintData?.complainer_sign;
    this.complainerSignBase64 = (await this.fetchBase64ForCombinedPdf(cs)) || '';

    const lw = this.listOfWitness || [];
    const witReq = lw.map((a: any) => {
      if (!a.sign || String(a.sign).trim() === '') {
        return of({ ...a, base64: null });
      }
      return this.apiService.getBase64Image(a.sign).pipe(
        map((response: any) => {
          const base64 = response?.response?.code === 200 ? response.response.msg : null;
          return { ...a, base64 };
        }),
        catchError(() => of({ ...a, base64: null }))
      );
    });
    if (witReq.length) {
      this.listOfWitness = await firstValueFrom(forkJoin(witReq));
    }
    this.refreshPORWitnessListFromWitness();

    const ap = this.accusedPersons || [];
    const accReq = ap.map((a: any) => {
      if (!a.signatureImage || String(a.signatureImage).trim() === '') {
        return of({ ...a, base64: null });
      }
      return this.apiService.getBase64Image(a.signatureImage).pipe(
        map((response: any) => {
          const base64 = response?.response?.code === 200 ? response.response.msg : null;
          return { ...a, base64 };
        }),
        catchError(() => of({ ...a, base64: null }))
      );
    });
    if (accReq.length) {
      this.accusedPersons = await firstValueFrom(forkJoin(accReq));
    }
    this.refreshPORAccusedListFromAccused();
  }

  private async loadBinaryAssetsForExtraJaptinamaCombined(japtinamaDetail: JaptinamaResponseModal): Promise<void> {
    this.markBase64OfHammerMark = (await this.fetchBase64ForCombinedPdf(japtinamaDetail?.hammer_mark_pic)) || '';
    const sig = String((japtinamaDetail as any).japtikarta_sign || (japtinamaDetail as any).complainer_sign || (japtinamaDetail as any).signature || '').trim();
    this.complainerSignBase64 = sig ? ((await this.fetchBase64ForCombinedPdf(sig)) || '') : '';

    const wl = japtinamaDetail.witnessPersonList || [];
    const witReq = wl.map((a: any) => {
      if (!a.sign || String(a.sign).trim() === '') {
        return of({ ...a, base64: null });
      }
      return this.apiService.getBase64Image(a.sign).pipe(
        map((response: any) => {
          const base64 = response?.response?.code === 200 ? response.response.msg : null;
          return { ...a, base64 };
        }),
        catchError(() => of({ ...a, base64: null }))
      );
    });
    if (witReq.length) {
      japtinamaDetail.witnessPersonList = await firstValueFrom(forkJoin(witReq));
    }

    const al = japtinamaDetail.accusedPersonsList || [];
    const accReq = al.map((a: any) => {
      if (!a.signatureImage || String(a.signatureImage).trim() === '') {
        return of({ ...a, base64: null });
      }
      return this.apiService.getBase64Image(a.signatureImage).pipe(
        map((response: any) => {
          const base64 = response?.response?.code === 200 ? response.response.msg : null;
          return { ...a, base64 };
        }),
        catchError(() => of({ ...a, base64: null }))
      );
    });
    if (accReq.length) {
      japtinamaDetail.accusedPersonsList = await firstValueFrom(forkJoin(accReq));
    }
  }

  private getJaptinamaCombinedPdfDocShell(content: any[]): any {
    (pdfMake as any).vfs = mergedVfs;
    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };
    return {
      content,
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        },
        japtinamaCombinedSectionTitle: {
          fontSize: 14,
          bold: true
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };
  }

  async downloadCombinedJaptinamaPdf(): Promise<void> {
    if (!this.comingComplaintData?.por_number) {
      return;
    }
    const savedMarkBase64 = this.markBase64;
    const savedMarkHammer = this.markBase64OfHammerMark;
    const savedComplainerSign = this.complainerSignBase64;
    this.isLoading = true;
    this.loadingMessage = 'PDF तैयार हो रही है...';
    try {
      await this.loadBinaryAssetsForMainJaptinamaCombined();
      this._japtinamaPdfCaptureContentOnly = true;
      this._japtinamaPdfCapturedContent = null;
      await this.nextAfterGotAllSignOfAccussedSign();
      const mainContent = this._japtinamaPdfCapturedContent || [];
      this._japtinamaPdfCapturedContent = null;

      const merged: any[] = [
        { text: 'जप्तिनामा 1', style: 'japtinamaCombinedSectionTitle', alignment: 'center', margin: [0, 0, 0, 8] },
        ...mainContent
      ];

      const extras = this.listOfJaptinamaVivran || [];
      for (let i = 0; i < extras.length; i++) {
        const detail = extras[i];
        await this.loadBinaryAssetsForExtraJaptinamaCombined(detail);
        this._japtinamaPdfCaptureContentOnly = true;
        await this.nextAfterGotAllSignOfAccussedSignOfParticularSection(detail);
        const part = this._japtinamaPdfCapturedContent || [];
        this._japtinamaPdfCapturedContent = null;
        merged.push({ text: '', pageBreak: 'after' });
        merged.push({
          text: `जप्तिनामा ${i + 2}`,
          style: 'japtinamaCombinedSectionTitle',
          alignment: 'center',
          margin: [0, 0, 0, 8]
        });
        merged.push(...part);
      }

      const docDefinition = this.getJaptinamaCombinedPdfDocShell(merged);
      const fileName = 'JAPTINAMA_SABHI_' + this.comingComplaintData.por_number + '.pdf';
      if (this.platForm.is('desktop')) {
        pdfMake.createPdf(docDefinition).download(fileName);
      } else if (this.platForm.is('android')) {
        await this.checkAndRequestStoragePermission();
        pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {
          await this.savePdf(base64Data, fileName);
        });
      }
    } finally {
      this.markBase64 = savedMarkBase64;
      this.markBase64OfHammerMark = savedMarkHammer;
      this.complainerSignBase64 = savedComplainerSign;
      this._japtinamaPdfCaptureContentOnly = false;
      this._japtinamaPdfCapturedContent = null;
      this.isLoading = false;
    }
  }

  async nextAfterGotAllSignOfAccussedSignOfParticularSection(japtinamaDetail: JaptinamaResponseModal) {

    ;

    ;
    let accusedSection: any;
    let accusedSectionWIthSign: any;
    let witnessSection: any;


    const japtikartaKaSignBlock = {
      width: 'auto',
      stack: [
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),
        {
          text: '(' + this.comingComplaintData.complainer_name + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: 'जप्ती करने वाले वन अधिकारी के हस्ताक्षर एवं पूरा नाम', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };


    const witnessTableBody = [
      [
        { text: 'क्रमांक', bold: true, alignment: 'center' },
        { text: 'साक्षी का नाम', bold: true, alignment: 'center' },
        { text: 'पिता का नाम', bold: true, alignment: 'center' },
        { text: 'उम्र', bold: true, alignment: 'center' },
        { text: 'जाति', bold: true, alignment: 'center' },
        { text: 'पूरा पता', bold: true, alignment: 'center' },
        { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
      ],

      ...(japtinamaDetail.witnessPersonList || []).map((a: any, index: number) => [
        { text: index + 1, alignment: 'center' },
        { text: a.naam || '', alignment: 'center' },
        { text: a.pita_ka_naam || '', alignment: 'center' },
        { text: a.age || '', alignment: 'center' },
        { text: a.jaati || '', alignment: 'center' },
        { text: a.pata || '', alignment: 'center' },
        (() => {

          const safeImage = this.getSafeImage(a.base64);

          return safeImage
            ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
            : { text: '—', alignment: 'center' };
        })()
      ])
    ];

    witnessSection = {
      stack: [
        {
          text: '9. साक्षियों का विवरण',
          style: 'subheader',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*', 60],
            body: witnessTableBody
          },
          margin: [0, 0, 0, 10]
        }
      ]
    };

    const markToAnkit = {
      columns: [
        {
          text: '6. चिन्ह जो जप्त सामाग्री पर अंकित किया गया ', bold: true,
          margin: [0, 0, 0, 5],
          width: '*'
        },
        ...(this.markBase64OfHammerMark && this.markBase64OfHammerMark.trim() !== ''
          ? [
            {
              image: this.markBase64OfHammerMark,
              width: 50,
              height: 50,
              alignment: 'right',
              margin: [0, 0, 0, 5]
            }
          ]
          : [
            {
              text: '—',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            }
          ])
      ],
    };

    if (!japtinamaDetail.accusedPersonsList?.length) {



      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: '—', alignment: 'center' }
        ]
      ];

      accusedSection = {
        stack: [
          {
            text: '3. किससे जप्त किया गया (नाम व पूरा पता)',
            style: 'subheader',
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

      const accusedTableBodyForSign = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: '-', alignment: 'center' },
        ]
      ];

      accusedSectionWIthSign = {
        stack: [
          {
            text: '7. जिस व्यक्ति के पास से जप्ती की गई उसके हस्ताक्षर',
            style: 'subheader',
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto'],
              body: accusedTableBodyForSign
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };


    } else {
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],

        ...(japtinamaDetail.accusedPersonsList || []).map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          { text: a.age || '', alignment: 'center' },
          { text: a.cast || '', alignment: 'center' },
          { text: a.jati_name || '', alignment: 'center' },
          { text: a.mobile_number || '', alignment: 'center' },
          { text: a.address || '', alignment: 'center' },
          (() => {

            const safeImage = this.getSafeImage(a.base64);

            return safeImage
              ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
              : { text: '—', alignment: 'center' };
          })()
        ])
      ];

      accusedSection = {
        stack: [
          {
            text: '3. किससे जप्त किया गया (नाम व पूरा पता)',
            style: 'subheader',
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*', 60],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 5]
          }
        ]
      };


      const accusedTableBodyForSign = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],

        ...(japtinamaDetail.accusedPersonsList || []).map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          (() => {

            const safeImage = this.getSafeImage(a.base64);

            return safeImage
              ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
              : { text: '—', alignment: 'center' };
          })()
        ])
      ];

      accusedSectionWIthSign = {
        stack: [
          {
            text: '7. जिस व्यक्ति के पास से जप्ती की गई उसके हस्ताक्षर',
            style: 'subheader',
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 60],
              body: accusedTableBodyForSign
            },
            margin: [0, 0, 0, 5]
          }
        ]
      };


    }

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const banshItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान' && item.japtinama_table_id === japtinamaDetail.japtinnama_table_id);



    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true, alignment: 'center' },
      { text: 'लम्बाई (मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (नोशनल टन)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const polHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const anyaJaptSamanHeader = [
      { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.if_other_then_detail || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const chattaHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const balliHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const chiranHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const kasthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const thuthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    // Build Thuth body
    const buildThuthBody = (items: any[] = []) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];


    const contentOfJaptiSaman: any[] = [];

    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.thuthItemsList || []) + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 50],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.kasthItemsList || []) + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanType(japtinamaDetail.kasthItemsList || []) }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.balliItemsList || []) }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', '*', '*', '*', 'auto', 50],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.chiranItemsList || []) + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanType(japtinamaDetail.chiranItemsList || []) }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', 50],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.chattaItemsList || []) }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }


    if (banshItems && banshItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildBansBody(banshItems)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.baansItemsList) }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', 50],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.polItemsList) }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }


    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.getTotalNagOfSamanType(japtinamaDetail.OtherJaptItemsList || []) + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.getTotalAytanOfSamanType(japtinamaDetail.OtherJaptItemsList || []) }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    // अन्य जप्त सामग्री का विवरण
    if (japtinamaDetail.listOfJaptVahanDetail && japtinamaDetail.listOfJaptVahanDetail.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
            body: buildjaptVahanBody(japtinamaDetail.listOfJaptVahanDetail)
          }
        },
        { text: '\n' }
      );
    }

    const docDefinition: any = {
      content: [

        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'जप्तीनामा', style: 'title' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 5, 0] // Added margin to pull away from edge slightly
            }
          ],
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                '1. दिनांक : ',
                { text: japtinamaDetail.japti_ka_dinak, style: 'section' }
              ],
              fontSize: 10,
            },
          ]
        },

        {
          text: [
            '2. जप्ती का स्थान : ',
            { text: japtinamaDetail.japti_ka_sthaan, bold: true },
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },


        { text: '\n', fontSize: 2 },

        accusedSection,

        { text: '\n', fontSize: 2 },

        { text: '4. जप्तशुदा सामाग्री का पूर्ण विवरण', fontSize: 10, bold: true, margin: [0, 0, 0, 2] },

        { text: '\n', fontSize: 2 },

        contentOfJaptiSaman,

        {
          text: [
            { text: '5. जप्त करने वाले अधिकारी का नाम व पद : ', bold: true },
            { text: `${japtinamaDetail.japtikarta_ka_name} (${japtinamaDetail.japtikarta_ka_pad})`, bold: true },
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },


        { text: '\n', fontSize: 2 },

        ...(markToAnkit ? [markToAnkit] : []),

        { text: '\n', fontSize: 2 },

        accusedSectionWIthSign,

        { text: '\n', fontSize: 2 },

        {
          text: [
            { text: '8. अन्य विशेष विवरण : ', bold: true },
            { text: japtinamaDetail.other_vivran ? `${japtinamaDetail.other_vivran}` : '--', bold: true },
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },


        { text: '\n', fontSize: 2 },

        witnessSection,




        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: this.comingComplaintData.date_of_crime, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            // 👇 only add signBlock if not null
            ...(japtikartaKaSignBlock ? [japtikartaKaSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        }

      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this._japtinamaPdfCaptureContentOnly) {
      this._japtinamaPdfCapturedContent = docDefinition.content;
      this._japtinamaPdfCaptureContentOnly = false;
      return;
    }

    if (this.platForm.is('desktop')) {


      pdfMake.createPdf(docDefinition).download("JAPTINAMA" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "JAPTINAMA" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

      });

    }
  }

  async nextAfterGotAllSignOfAccussedSign() {

    ;
    let accusedSection: any;
    let accusedSectionWIthSign: any;
    let witnessSection: any;


    const japtikartaKaSignBlock = {
      width: 'auto',
      stack: [
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),
        {
          text: '(' + this.comingComplaintData.complainer_name + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: 'जप्ती करने वाले वन अधिकारी के हस्ताक्षर एवं पूरा नाम', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };

    const witnessTableBody = [
      [
        { text: 'क्रमांक', bold: true, alignment: 'center' },
        { text: 'साक्षी का नाम', bold: true, alignment: 'center' },
        { text: 'पिता का नाम', bold: true, alignment: 'center' },
        { text: 'उम्र', bold: true, alignment: 'center' },
        { text: 'जाति', bold: true, alignment: 'center' },
        { text: 'पूरा पता', bold: true, alignment: 'center' },
        { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
      ],

      ...this.listOfWitnessForOnlyPOR.map((a: any, index: number) => [
        { text: index + 1, alignment: 'center' },
        { text: a.naam || '', alignment: 'center' },
        { text: a.pita_ka_naam || '', alignment: 'center' },
        { text: a.age || '', alignment: 'center' },
        { text: a.jaati || '', alignment: 'center' },
        { text: a.pata || '', alignment: 'center' },
        (() => {

          const safeImage = this.getSafeImage(a.base64);

          return safeImage
            ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
            : { text: '—', alignment: 'center' };
        })()
      ])
    ];

    witnessSection = {
      stack: [
        {
          text: '9. साक्षियों का विवरण',
          style: 'subheader',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*', 60],
            body: witnessTableBody
          },
          margin: [0, 0, 0, 10]
        }
      ]
    };

    const markToAnkit = {
      columns: [
        {
          text: '6. चिन्ह जो जप्त सामाग्री पर अंकित किया गया ', bold: true,
          margin: [0, 0, 0, 5],
          width: '*'
        },
        ...(this.markBase64 && this.markBase64.trim() !== ''
          ? [
            {
              image: this.markBase64,
              width: 50,
              height: 50,
              alignment: 'right',
              margin: [0, 0, 0, 5]
            }
          ]
          : [
            {
              text: '—',
              alignment: 'right',
              margin: [0, 0, 0, 5]
            }
          ])
      ],
    };

    if (this.accusedCount === 0) {

      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: '—', alignment: 'center' }
        ]
      ];

      accusedSection = {
        stack: [
          {
            text: '3. किससे जप्त किया गया (नाम व पूरा पता)',
            style: 'subheader',
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

      const accusedTableBodyForSign = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: '-', alignment: 'center' },
        ]
      ];

      accusedSectionWIthSign = {
        stack: [
          {
            text: '7. जिस व्यक्ति के पास से जप्ती की गई उसके हस्ताक्षर',
            style: 'subheader',
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto'],
              body: accusedTableBodyForSign
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };


    } else {
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],

        ...this.listOfAccussedForOnlyPOR.map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          { text: a.age || '', alignment: 'center' },
          { text: a.cast || '', alignment: 'center' },
          { text: a.jati_name || '', alignment: 'center' },
          { text: a.mobile_number || '', alignment: 'center' },
          { text: a.address || '', alignment: 'center' },
          (() => {

            const safeImage = this.getSafeImage(a.base64);

            return safeImage
              ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
              : { text: '—', alignment: 'center' };
          })()
        ])
      ];

      accusedSection = {
        stack: [
          {
            text: '3. किससे जप्त किया गया (नाम व पूरा पता)',
            style: 'subheader',
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*', 60],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 5]
          }
        ]
      };

      const accusedTableBodyForSign = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'हस्ताक्षर', bold: true, alignment: 'center' }
        ],

        ...(this.listOfAccussedForOnlyPOR || []).map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          (() => {

            const safeImage = this.getSafeImage(a.base64);

            return safeImage
              ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
              : { text: '—', alignment: 'center' };
          })()
        ])
      ];

      accusedSectionWIthSign = {
        stack: [
          {
            text: '3. किससे जप्त किया गया (नाम व पूरा पता)',
            style: 'subheader',
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 60],
              body: accusedTableBodyForSign
            },
            margin: [0, 0, 0, 5]
          }
        ]
      };




    }

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली' && item.japtinama_table_id === "");
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा' && item.japtinama_table_id === "");
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ' && item.japtinama_table_id === "");
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान' && item.japtinama_table_id === "");
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा' && item.japtinama_table_id === "");
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान' && item.japtinama_table_id === "");

    const anyaJaptSamanHeader = [
      { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.if_other_then_detail || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const chattaHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const balliHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const chiranHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const kasthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const thuthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      //{ text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    // Build Thuth body
    const buildThuthBody = (items: any[] = []) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
        //,item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];


    const contentOfJaptiSaman: any[] = [];

    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.totalThunthNag + ',   ' },
            //{ text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            //{ text: this.totalThunthGhanMeter + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 50],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalKashthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', '*', '*', '*', 'auto', 50],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChiranNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', 50],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    // अन्य जप्त सामग्री का विवरण
    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
            body: buildjaptVahanBody(this.listOfJaptVahanDetail)
          }
        },
        { text: '\n' }
      );
    }

    const docDefinition: any = {
      content: [

        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'जप्तीनामा', style: 'title' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 5, 0] // Added margin to pull away from edge slightly
            }
          ],
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                '1. दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, style: 'section' }
              ],
              fontSize: 10,
            },
          ]
        },

        {
          text: [
            '2. जप्ती का स्थान : ',
            { text: this.crimePlace, bold: true },
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },

        { text: '\n', fontSize: 2 },


        { text: '\n', fontSize: 2 },

        accusedSection,

        { text: '\n', fontSize: 2 },

        { text: '4. जप्तशुदा सामाग्री का पूर्ण विवरण', fontSize: 10, bold: true, margin: [0, 0, 0, 2] },

        { text: '\n', fontSize: 2 },

        contentOfJaptiSaman,

        { text: '\n', fontSize: 2 },

        {
          text: [
            { text: '5. जप्त करने वाले अधिकारी का नाम व पद : ', fontSize: 10, bold: true, margin: [0, 0, 0, 2] },
            { text: `${this.complainer_name} (${this.complainer_pad})`, bold: true },
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },

        { text: '\n', fontSize: 2 },

        ...(markToAnkit ? [markToAnkit] : []),

        { text: '\n', fontSize: 2 },

        accusedSectionWIthSign,

        { text: '\n', fontSize: 2 },

        {
          text: [
            { text: '8. अन्य विशेष विवरण : ', bold: true },
            { text: this.japtinama_anya_vishesh_vivran ? `${this.japtinama_anya_vishesh_vivran}` : '--', bold: true },
          ],
          font: 'NotoSansDevanagari',
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        witnessSection,

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: this.comingComplaintData.date_of_crime, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            // 👇 only add signBlock if not null
            ...(japtikartaKaSignBlock ? [japtikartaKaSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        }

      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this._japtinamaPdfCaptureContentOnly) {
      this._japtinamaPdfCapturedContent = docDefinition.content;
      this._japtinamaPdfCaptureContentOnly = false;
      return;
    }

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("JAPTINAMA" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "JAPTINAMA" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

      });

    }
  }


  async enterDR_Detail() {

    this.router.navigateByUrl('/submit-dr-detail-page', {
      state: { por_number: this.por_number, complain_id: this.comingComplaintData.complain_id },
      replaceUrl: false
    });

  }

  // async generatePDF() {

  //   const signBlock = {
  //     width: 'auto',
  //     stack: [
  //       // Add image only if base64 is not blank
  //       ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
  //         ? [
  //           {
  //             image: this.complainerSignBase64,
  //             width: 80,
  //             height: 40,
  //             alignment: 'center',
  //             margin: [0, 0, 0, 2]
  //           }
  //         ]
  //         : [
  //           {
  //             text: '',
  //             margin: [0, 40, 0, 0]
  //           }
  //         ]),

  //       {
  //         text: '(' + this.comingComplaintData.complainer_name + ')',
  //         bold: true,
  //         alignment: 'center',
  //         fontSize: 10,
  //         margin: [0, 0, 0, 2]
  //       },
  //       { text: (this.comingComplaintData.is_complain_created_by_ra == '1' || this.comingComplaintData.is_complain_created_by_ra === 'true') ? 'सहयाक परिछेत्र वृत्त ' : 'जारीकर्ता का हस्ताक्षर ', alignment: 'center', fontSize: 10 },
  //       { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }, { text: this.comingComplaintData.is_complain_created_by_ra, bold: true }], alignment: 'center', fontSize: 10 }
  //     ]
  //   };

  //   // Build accused section
  //   let accusedSection: any;

  //   if (this.accusedCount === 0) {

  //     const accusedTableBody = [
  //       [
  //         { text: 'क्रमांक', bold: true, alignment: 'center' },
  //         { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
  //         { text: 'पिता का नाम', bold: true, alignment: 'center' },
  //         { text: 'उम्र', bold: true, alignment: 'center' },
  //         { text: 'जाति वर्ग', bold: true, alignment: 'center' },
  //         { text: 'जाति', bold: true, alignment: 'center' },
  //         { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
  //         { text: 'पता', bold: true, alignment: 'center' }
  //       ],
  //       [
  //         { text: 1, alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' },
  //         { text: 'अज्ञात', alignment: 'center' }]
  //     ];

  //     accusedSection = {
  //       stack: [
  //         {
  //           text: '1.अपराधी का विवरण',
  //           style: 'subheader',
  //           margin: [0, 0, 0, 2]
  //         },
  //         {
  //           table: {
  //             headerRows: 1,
  //             widths: ['auto', '*', '*', 'auto', '*', '*', '*', '*'],
  //             body: accusedTableBody
  //           },
  //           margin: [0, 0, 0, 10]
  //         }
  //       ]
  //     };

  //   } else {
  //     // Table header + rows for multiple accused
  //     const accusedTableBody = [
  //       [
  //         { text: 'क्रमांक', bold: true, alignment: 'center' },
  //         { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
  //         { text: 'पिता का नाम', bold: true, alignment: 'center' },
  //         { text: 'उम्र', bold: true, alignment: 'center' },
  //         { text: 'जाति वर्ग', bold: true, alignment: 'center' },
  //         { text: 'जाति', bold: true, alignment: 'center' },
  //         { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
  //         { text: 'पता', bold: true, alignment: 'center' }

  //       ],
  //       ...this.accusedPersons.map((a: any, index: number) => [
  //         { text: index + 1, alignment: 'center' },
  //         { text: a.name || '', alignment: 'center' },
  //         { text: a.fathersName || '', alignment: 'center' },
  //         { text: a.age || '', alignment: 'center' },
  //         { text: a.cast || '', alignment: 'center' },
  //         { text: a.jati_name || '', alignment: 'center' },
  //         { text: a.mobile_number || '', alignment: 'center' },
  //         { text: a.address || '', alignment: 'center' }
  //       ])
  //     ];

  //     accusedSection = {
  //       stack: [
  //         {
  //           text: '1. अपराधी का विवरण',
  //           style: 'subheader',
  //           margin: [0, 0, 0, 2]
  //         },
  //         {
  //           table: {
  //             headerRows: 1,
  //             widths: ['auto', '*', '*', 'auto', '*', '*', '*', '*'],
  //             body: accusedTableBody
  //           },
  //           margin: [0, 0, 0, 10]
  //         }
  //       ]
  //     };
  //   }




  //   const dharaText = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);
  //   const formattedPartsStackTest: any[] = [];
  //   const groupedData = this.getCrimDharaGroupedSeprated(this.comingComplaintData.crime_dhara);


  //   for (const act in groupedData) {
  //     if (groupedData.hasOwnProperty(act)) {

  //       const sections = groupedData[act];

  //       formattedPartsStackTest.push({
  //         text: [
  //           { text: act + ' - ', bold: false },
  //           { text: sections.join(', '), bold: true }
  //         ],
  //         margin: [0, 0, 0, 5]
  //       });
  //     }
  //   }


  //   // const formattedPartsStack: any[] = [];
  //   // 
  //   // console.log(actParts);
  //   // actParts.forEach((part, index) => {
  //   //   // Regex to separate the number/section (like "26 (1) क") from text
  //   //   const match = part.match(/(.*?)(\d+.*)/); // first text vs the number+rest
  //   //   if (match) {
  //   //     const [, actName, section] = match;
  //   //     formattedPartsStack.push({
  //   //       text: [
  //   //         { text: actName.trim() + ' ', bold: false },
  //   //         { text: section.trim(), bold: true }
  //   //       ],
  //   //       margin: [0, 0, 0, 2]
  //   //     });
  //   //   } else {
  //   //     // fallback: whole part normal
  //   //     formattedPartsStack.push({ text: part, bold: true, margin: [0, 0, 0, 2] });
  //   //   }
  //   // });


  //   (pdfMake as any).vfs = mergedVfs;

  //   (pdfMake as any).fonts = {
  //     NotoSansDevanagari: {
  //       normal: 'NotoSansDevanagari-Regular.ttf',
  //       bold: 'NotoSansDevanagari-Bold.ttf',
  //       italics: 'NotoSansDevanagari-Regular.ttf',
  //       bolditalics: 'NotoSansDevanagari-Regular.ttf'
  //     }
  //   };

  //   const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
  //   const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
  //   const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');
  //   const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
  //   const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
  //   const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

  //   const banshItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस');
  //   const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल');


  //   const anyaJaptSamanHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' },
  //   ];

  //   const buildAnyaJaptSamanBody = (items: any[] = []) => [
  //     anyaJaptSamanHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.if_other_then_detail || '', alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       { text: item.ghan_meter || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];

  //   const banshHeader = [
  //     { text: 'बाँस का प्रकार', bold: true, alignment: 'center' },
  //     { text: 'लम्बाई (मी.)', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'मात्रा (नोशनल टन)', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildBansBody = (items: any[] = []) => [
  //     banshHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.lambai || 0, alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       { text: item.ghan_meter || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];


  //   const polHeader = [
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildPolBody = (items: any[] = []) => [
  //     polHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];


  //   const chattaHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     { text: 'चट्टा संख्या', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildChattaBody = (items: any[] = []) => [
  //     chattaHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];

  //   const chiranHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
  //     { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
  //     { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildChiranBody = (items: any[] = []) => [
  //     chiranHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.lambai || 0, alignment: 'center' },
  //       { text: item.golai || 0, alignment: 'center' },
  //       { text: item.motai || 0, alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       { text: item.ghan_meter || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];

  //   const kasthHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
  //     { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildKasthBody = (items: any[] = []) => [
  //     kasthHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.lambai || 0, alignment: 'center' },
  //       { text: item.golai || 0, alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       { text: item.ghan_meter || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];


  //   const balliHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
  //     { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' },
  //     { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
  //   ];

  //   const buildballiBody = (items: any[] = []) => [
  //     balliHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       { text: item.lambai || 0, alignment: 'center' },
  //       { text: item.golai || 0, alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' },
  //       item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
  //   ];


  //   const thuthHeader = [
  //     // { text: 'सामान का प्रकार', bold: true },
  //     { text: 'प्रजाति', bold: true, alignment: 'center' },
  //     // { text: 'ऊंचाई(मी.)', bold: true },
  //     { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
  //     { text: 'संख्या', bold: true, alignment: 'center' }
  //   ];

  //   // Build Thuth body
  //   const buildThuthBody = (items: any[] = []) => [
  //     thuthHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.prajati_name || '', alignment: 'center' },
  //       // item.unchai || 0,
  //       { text: item.golai || 0, alignment: 'center' },
  //       { text: item.nag || 0, alignment: 'center' }
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
  //   ];

  //   const contentOfJaptiSaman: any[] = [];


  //   // ठूठ का विवरण
  //   if (thuthItems && thuthItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*'],
  //           body: buildThuthBody(thuthItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalThunthNag }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   if (kasthItems && kasthItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', 'auto', 50],
  //           body: buildKasthBody(kasthItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalKashthNag + ',   ' },
  //           { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalKashthGhanMeter }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   if (balliItems && balliItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', 50],
  //           body: buildballiBody(balliItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalBalliNag }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
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
  //           widths: ['auto', '*', '*', '*', '*', 'auto', 50],
  //           body: buildChiranBody(chiranItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalChiranNag + ',   ' },
  //           { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalChiranGhanMeter }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
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
  //           widths: ['auto', '*', 50],
  //           body: buildChattaBody(chattaItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalChattaNag }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   if (banshItem && banshItem.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', 50],
  //           body: buildBansBody(banshItem)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalBaansNag }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   if (polItem && polItem.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', 50],
  //           body: buildPolBody(polItem)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalPolNag }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   // अन्य जप्त सामग्री का विवरण
  //   if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', 50],
  //           body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
  //         }
  //       },
  //       {
  //         text: [
  //           { text: 'कुल संख्या : ', style: 'subheader', bold: true },
  //           { text: this.totalJaptSamanNag + ',   ' },
  //           { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
  //           { text: this.totalJaptSamanGhanMeter }
  //         ]
  //       },
  //       { text: '\n', fontSize: 2 },
  //     );
  //   }

  //   const japtVahanHeader = [
  //     { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
  //     { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
  //     { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
  //     { text: 'मालिक का नाम', bold: true, alignment: 'center' },
  //     { text: 'पिता का नाम', bold: true, alignment: 'center' },
  //     { text: 'पूरा पता', bold: true, alignment: 'center' },
  //     { text: 'तहसील', bold: true, alignment: 'center' },
  //     { text: 'जिला', bold: true, alignment: 'center' },
  //   ];

  //   const buildjaptVahanBody = (items: any[] = []) => [
  //     japtVahanHeader,
  //     ...(items.length > 0 ? items.map(item => [
  //       { text: item.vahan_prakar || '', alignment: 'center' },
  //       { text: item.vahan_kramank || '', alignment: 'center' },
  //       { text: item.anumanit_mulya || '', alignment: 'center' },
  //       { text: item.malik_name || '', alignment: 'center' },
  //       { text: item.pita_ka_name || '', alignment: 'center' },
  //       { text: item.pata || '', alignment: 'center' },
  //       { text: item.tahsil || '', alignment: 'center' },
  //       { text: item.jila || '', alignment: 'center' },
  //     ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
  //   ];

  //   // अन्य जप्त सामग्री का विवरण
  //   if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
  //     contentOfJaptiSaman.push(
  //       { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
  //           body: buildjaptVahanBody(this.listOfJaptVahanDetail)
  //         }
  //       },
  //       { text: '\n', fontSize: 2 }
  //     );
  //   }

  //   // Witness Table Data
  //   const witnessTableData = [
  //     [
  //       { text: 'क्रमांक', bold: true, alignment: 'center' },
  //       { text: 'साक्षी का नाम', bold: true, alignment: 'center' },
  //       { text: 'पिता का नाम', bold: true, alignment: 'center' },
  //       { text: 'उम्र', bold: true, alignment: 'center' },
  //       { text: 'जाति', bold: true, alignment: 'center' },
  //       { text: 'पता', bold: true, alignment: 'center' }
  //     ],
  //     [
  //       { text: '1', alignment: 'center' },
  //       { text: this.comingComplaintData.name_of_witness_one || '-', alignment: 'center' },
  //       { text: '-', alignment: 'center' }, // Father name unavailable
  //       { text: '-', alignment: 'center' }, // Age unavailable
  //       { text: '-', alignment: 'center' }, // Caste unavailable
  //       { text: this.comingComplaintData.address_of_witness_one || '-', alignment: 'center' }
  //     ],
  //     [
  //       { text: '2', alignment: 'center' },
  //       { text: this.comingComplaintData.name_of_witness_two || '-', alignment: 'center' },
  //       { text: '-', alignment: 'center' },
  //       { text: '-', alignment: 'center' },
  //       { text: '-', alignment: 'center' },
  //       { text: this.comingComplaintData.address_of_witness_two || '-', alignment: 'center' }
  //     ]
  //   ];

  //   const docDefinition: any = {
  //     content: [


  //       { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
  //       { text: 'प्राथमिक अपराध प्रतिवेदन', style: 'subTitle' },
  //       { text: 'Preliminary Offence Report', style: 'subTitle' },

  //       ...(this.comingComplaintData.sys_gen_por_number
  //         ? [
  //           {
  //             text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
  //             style: 'subTitle',
  //             bold: true
  //           }
  //         ]
  //         : []),

  //       { text: '\n', fontSize: 2 }, // Reduced spacer

  //       {
  //         columns: [
  //           {
  //             text: (
  //               this.comingComplaintData.focr_number || this.comingComplaintData.focr_date
  //             )
  //               ? [
  //                 'FOCR क्रमांक : ',
  //                 { text: this.comingComplaintData.focr_number || '--', style: 'section' }
  //               ]
  //               : '--',
  //             fontSize: 10
  //           },
  //           {
  //             text: (
  //               this.comingComplaintData.focr_number || this.comingComplaintData.focr_date
  //             )
  //               ? [
  //                 'FOCR दिनांक : ',
  //                 { text: this.comingComplaintData.focr_date || '--', bold: true }
  //               ]
  //               : '--',
  //             alignment: 'right',
  //             fontSize: 10
  //           }
  //         ]
  //       },
  //       {
  //         columns: [
  //           {
  //             text: [
  //               'POR क्रमांक : ',
  //               { text: this.comingComplaintData.por_number, style: 'section' },
  //             ],
  //             fontSize: 10
  //           },
  //           {
  //             text: [
  //               'पंजीयन दिनांक : ',
  //               { text: this.comingComplaintData.date_of_crime, bold: true }
  //             ],
  //             alignment: 'right',
  //             fontSize: 10
  //           }
  //         ],
  //         margin: [0, 0, 0, 2]
  //       },

  //       { text: '\n', fontSize: 2 }, // Reduced spacer

  //       accusedSection,

  //       { text: '\n', fontSize: 2 }, // Reduced spacer

  //       {
  //         table: {
  //           widths: [240, 10, '*'],
  //           body: [
  //             [{ text: '2. अपराध का प्रकार ', bold: false }, { text: ':', bold: true, alignment: 'center' }, { text: this.crimType, bold: true }],
  //             [{ text: '   अधिनियम / नियम एवं धाराएं ', bold: false }, { text: ':', bold: true, alignment: 'center' }, { stack: formattedPartsStackTest }],
  //             [{ text: '3. घटना स्थल ', bold: false }, { text: ':', bold: true, alignment: 'center' },
  //             {
  //               text: (this.comingComplaintData.compartment_number && this.comingComplaintData.compartment_number !== '') ?
  //                 [{ text: 'बीट -' + this.comingComplaintData.beat_name + ', ', bold: true }, { text: 'कक्ष क्रमांक -' + this.comingComplaintData.compartment_number + ',', bold: true }, { text: (this.comingComplaintData.compartment_option ? this.comingComplaintData.compartment_option + '' : ''), bold: true },
  //                 { text: this.comingComplaintData.place_of_crime, bold: true }] :
  //                 [{ text: this.comingComplaintData.place_of_crime, bold: true }]
  //             }],
  //             [{ text: '4. अपराध की तिथि ', bold: false }, { text: ':', bold: true, alignment: 'center' }, { text: this.comingComplaintData.date_of_crime, bold: true }]
  //           ]
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 0, 0, 2]
  //       },

  //       { text: '\n', fontSize: 2 }, // Reduced spacer

  //       { text: '5. जप्तशुदा माल और की गई कार्यवाही का विवरण : ', margin: [0, 0, 0, 2] },

  //       contentOfJaptiSaman,

  //       { text: '6. साक्षियों का विवरण:', margin: [0, 2, 0, 2] },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', 'auto', 'auto', '*'],
  //           body: witnessTableData
  //         },
  //         margin: [0, 0, 0, 5]
  //       },

  //       {
  //         columns: [
  //           {
  //             stack: [
  //               { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
  //               { text: ['दिनांक : ', { text: this.comingComplaintData.date_of_crime, bold: true }], fontSize: 10 }
  //             ],
  //             width: '*'
  //           },
  //           // 👇 only add signBlock if not null
  //           ...(signBlock ? [signBlock] : [])
  //         ],
  //         margin: [0, 2, 0, 0]
  //       },

  //       {
  //         canvas: [
  //           { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //         ],
  //         margin: [0, 2, 0, 2]
  //       },

  //       { text: 'नोट: यह रिपोर्ट अपराध का पता लगने  के 48 घंटे के अंदर वरिष्ठ अधिकारी के पास भेज दी जानी चाहिए |', bold: true, fontSize: 9 }
  //     ],
  //     styles: {
  //       title: {
  //         fontSize: 16,
  //         bold: true,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 1]
  //       },
  //       subTitle: {
  //         fontSize: 12,
  //         alignment: 'center',
  //         bold: true,
  //         margin: [0, 0, 0, 1]
  //       },
  //       subheader: {
  //         fontSize: 11,
  //         bold: true
  //       },
  //       section: {
  //         bold: true,
  //         margin: [0, 2, 0, 1]
  //       }
  //     },
  //     defaultStyle: {
  //       font: 'NotoSansDevanagari',
  //       fontSize: 10
  //     }
  //   };

  //   if (this.platForm.is('desktop')) {

  //     pdfMake.createPdf(docDefinition).download("POR_OF_" + this.comingComplaintData.por_number + '.pdf');

  //   } else if (this.platForm.is('android')) {

  //     await this.checkAndRequestStoragePermission();

  //     pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

  //       const fileName = "POR_OF_" + this.comingComplaintData.por_number + '.pdf';

  //       const fileURI = await this.savePdf(base64Data, fileName);

  //     });

  //   }

  // }


  async generatePDF() {

    // const signBlock = {
    //   width: 'auto',
    //   stack: [
    //     // Add image only if base64 is not blank
    //     ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
    //       ? [
    //         {
    //           image: this.complainerSignBase64,
    //           width: 80,
    //           height: 40,
    //           alignment: 'center',
    //           margin: [0, 0, 0, 2]
    //         }
    //       ]
    //       : [
    //         {
    //           text: '',
    //           margin: [0, 40, 0, 0]
    //         }
    //       ]),

    //     {
    //       text: '' + this.comingComplaintData.complainer_name + '',
    //       bold: true,
    //       alignment: 'center',
    //       fontSize: 10,
    //       margin: [0, 0, 0, 2]
    //     },
    //     { text: 'वन रक्षक के हस्ताक्षर ', alignment: 'center', fontSize: 10 }
    //   ]
    // };

    const signBlock = {
      width: 'auto',
      stack: [
        // Add image only if base64 is not blank
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),

        {
          text: '(' + this.comingComplaintData.complainer_name + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: (this.comingComplaintData.is_complain_created_by_ra == '1' || this.comingComplaintData.is_complain_created_by_ra === 'true') ? 'सहयाक परिछेत्र वृत्त ' : 'जारीकर्ता का हस्ताक्षर ', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };

    // Build accused section
    let accusedSection: any;

    if (this.accusedCount === 0) {

      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' }]
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

    } else {
      // Table header + rows for multiple accused
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }

        ],
        ...this.accusedPersons.map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          { text: a.age || '', alignment: 'center' },
          { text: a.cast || '', alignment: 'center' },
          { text: a.jati_name || '', alignment: 'center' },
          { text: a.mobile_number || '', alignment: 'center' },
          { text: a.address || '', alignment: 'center' }
        ])
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };
    }




    const dharaText = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);
    const formattedPartsStackTest: any[] = [];
    const groupedData = this.getCrimDharaGroupedSeprated(this.comingComplaintData.crime_dhara);


    for (const act in groupedData) {
      if (groupedData.hasOwnProperty(act)) {

        const sections = groupedData[act];

        formattedPartsStackTest.push({
          text: [
            { text: act + ' - ', bold: false },
            { text: sections.join(', '), bold: true }
          ],
          margin: [0, 0, 0, 5]
        });
      }
    }


    // const formattedPartsStack: any[] = [];
    // 
    // console.log(actParts);
    // actParts.forEach((part, index) => {
    //   // Regex to separate the number/section (like "26 (1) क") from text
    //   const match = part.match(/(.*?)(\d+.*)/); // first text vs the number+rest
    //   if (match) {
    //     const [, actName, section] = match;
    //     formattedPartsStack.push({
    //       text: [
    //         { text: actName.trim() + ' ', bold: false },
    //         { text: section.trim(), bold: true }
    //       ],
    //       margin: [0, 0, 0, 2]
    //     });
    //   } else {
    //     // fallback: whole part normal
    //     formattedPartsStack.push({ text: part, bold: true, margin: [0, 0, 0, 2] });
    //   }
    // });


    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

    const banshItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस');
    const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल');


    const anyaJaptSamanHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.if_other_then_detail || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];

    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true, alignment: 'center' },
      { text: 'लम्बाई (मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (नोशनल टन)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const polHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const chattaHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];

    const chiranHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];

    const kasthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const balliHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const thuthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      // { text: 'ऊंचाई(मी.)', bold: true },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    // Build Thuth body
    const buildThuthBody = (items: any[] = []) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        // item.unchai || 0,
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];

    const contentOfJaptiSaman: any[] = [];


    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.totalThunthNag }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', 50],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalKashthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag }
          ]
        },
        { text: '\n', fontSize: 2 },
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
            widths: ['auto', '*', '*', '*', '*', 'auto', 50],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChiranNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 },
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
            widths: ['auto', '*', 50],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    if (banshItem && banshItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildBansBody(banshItem)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBaansNag }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', 50],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalPolNag }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 50],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter }
          ]
        },
        { text: '\n', fontSize: 2 },
      );
    }

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    // अन्य जप्त सामग्री का विवरण
    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
            body: buildjaptVahanBody(this.listOfJaptVahanDetail)
          }
        },
        { text: '\n', fontSize: 2 }
      );
    }

    // Witness Table Data
    const witnessTableData = [
      [
        { text: 'क्रमांक', bold: true, alignment: 'center' },
        { text: 'गवाह का नाम', bold: true, alignment: 'center' },
        { text: 'पिता का नाम', bold: true, alignment: 'center' },
        { text: 'उम्र', bold: true, alignment: 'center' },
        { text: 'जाति', bold: true, alignment: 'center' },
        { text: 'पता', bold: true, alignment: 'center' }
      ],
      [
        { text: '1', alignment: 'center' },
        { text: this.comingComplaintData.name_of_witness_one || '-', alignment: 'center' },
        { text: '-', alignment: 'center' }, // Father name unavailable
        { text: '-', alignment: 'center' }, // Age unavailable
        { text: '-', alignment: 'center' }, // Caste unavailable
        { text: this.comingComplaintData.address_of_witness_one || '-', alignment: 'center' }
      ],
      [
        { text: '2', alignment: 'center' },
        { text: this.comingComplaintData.name_of_witness_two || '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: this.comingComplaintData.address_of_witness_two || '-', alignment: 'center' }
      ]
    ];
    const comingComplaintDataStr = this.comingComplaintData.date_of_crime || '';
    let ComplaintDay = '____', ComplaintMonth = '____', ComplaintYear = '____';

    if (comingComplaintDataStr && comingComplaintDataStr.includes('-')) {
      const parts = comingComplaintDataStr.split(' ')[0].split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        [ComplaintYear, ComplaintMonth, ComplaintDay] = parts;
      } else {
        // DD-MM-YYYY
        [ComplaintDay, ComplaintMonth, ComplaintYear] = parts;
      }
    } else if (comingComplaintDataStr && comingComplaintDataStr.includes('/')) {
      const parts = comingComplaintDataStr.split(' ')[0].split('/');
      if (parts[0].length === 4) {
        [ComplaintYear, ComplaintMonth, ComplaintDay] = parts;
      } else {
        [ComplaintDay, ComplaintMonth, ComplaintYear] = parts;
      }
    }

    const docDefinition: any = {
      content: [

        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'प्राथमिक अपराध सूचना', style: 'subTitle' },
        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),
        // {
        //   columns: [
        //     { text: 'पुस्तक क्र. : _________________', fontSize: 10 },
        //     { text: 'पृष्ठ क्र. : ' + (this.comingComplaintData.pristh_kramank || '_________________'), alignment: 'right', fontSize: 10 }
        //   ],
        //   margin: [0, 5, 0, 5]
        // },
        // { text: 'प्राथमिक अपराध सूचना', style: 'title' },
        { text: '\n', fontSize: 2 },

        {
          text: [
            { text: '1.  रिपोर्ट क्रमांक : ', fontSize: 10 },
            { text: this.comingComplaintData.por_number, bold: true, fontSize: 10 },
            { text: '    दिनांक : ', fontSize: 10 },
            { text: ComplaintDay || '____', bold: true, fontSize: 10 },
            { text: '  माह : ', fontSize: 10 },
            { text: ComplaintMonth || '____', bold: true, fontSize: 10 },
            { text: '  वर्ष 20', fontSize: 10 },
            { text: (ComplaintYear ? ComplaintYear.substring(2) : '____'), bold: true, fontSize: 10 }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '2.  अपराधी का नाम, पिता का नाम, जाति और पता', style: 'section', bold: false, margin: [0, 5, 0, 2] },
        accusedSection,

        {
          text: [
            { text: '3.  अपराध का प्रकार एवं धारा : ', style: 'section', bold: false },
            { text: this.crimType + ', ', bold: true, fontSize: 10 },
            ...(formattedPartsStackTest.length === 1 ? [
              { text: ' ' },
              { text: Array.isArray(formattedPartsStackTest[0].text) ? formattedPartsStackTest[0].text.map((t: any) => t.text).join('') : (formattedPartsStackTest[0].text || ''), bold: true, fontSize: 10 }
            ] : [])
          ],
          margin: [0, 5, 0, 2]
        },
        ...(formattedPartsStackTest.length > 1 ? [
          {
            stack: formattedPartsStackTest.map(p => ({ ...p, margin: [20, 0, 0, 2] })),
            margin: [0, 0, 0, 5]
          }
        ] : []),

        {
          text: [
            { text: '4.  अपराध होने का स्थान : ', style: 'section', bold: false },
            { text: this.comingComplaintData.place_of_crime || '__________________________________________', bold: true, fontSize: 10 }
          ],
          margin: [0, 5, 0, 5]
        },

        {
          text: [
            { text: '5.  अपराध होने की तिथि : ', style: 'section', bold: false },
            { text: this.comingComplaintData.date_of_crime || '__________________________________________', bold: true, fontSize: 10 }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '6.  जप्तशुदा माल और की गई कार्यवाही का विवरण : ', style: 'section', bold: false, margin: [0, 5, 0, 2] },
        contentOfJaptiSaman,

        { text: '7.  गवाहों के नाम : ', style: 'section', bold: false, margin: [0, 5, 0, 2] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*'],
            body: witnessTableData
          },
          margin: [0, 0, 0, 10]
        },

        { text: 'दूसरा भाग परिक्षेत्र सहायक __________________________ प.स. वृत्त को भेजा गया', fontSize: 10, margin: [0, 5, 0, 5] },
        { text: 'तीसरा भाग परिक्षेत्र अधिकारी __________________________ परिक्षेत्र को भेजा गया', fontSize: 10, margin: [0, 5, 0, 5] },

        { text: '\n', fontSize: 5 },

        {
          columns: [
            {
              stack: [
                { text: 'स्थान : ' + (this.comingComplaintData.beat_name || '_________________'), fontSize: 10 },
                { text: '\n', fontSize: 5 },
                { text: 'दिनांक : ' + (this.comingComplaintData.date_of_crime || '_________________'), fontSize: 10 }
              ],
              width: '*'
            },
            {
              stack: [
                ...(signBlock ? [signBlock] : [{ text: 'जारीकर्ता के हस्ताक्षर', fontSize: 10, alignment: 'center' }]),
                { text: '\n', fontSize: 5 },
                // { text: 'परिसर : _________________', fontSize: 10, alignment: 'right' }
              ],
              width: 'auto'
            }
          ],
          margin: [0, 10, 0, 10]
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
          ],
          margin: [0, 10, 0, 5]
        },

        { text: 'नोट: यह रिपोर्ट अपराध का पता लगने के 48 घंटे के अंदर वरिष्ठ अधिकारी के पास भेज दी जानी चाहिए।', bold: true, fontSize: 9, alignment: 'center' }
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: false,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("POR_OF_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "POR_OF_" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

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

  addVasuliDetail() {
    let model: VasuliViranDetailRequestModal = {
      complain_id: this.comingComplaintData.complain_id,
      mavja_rashi: "",
      mahsul_rashi: "",
      total_rashi: "",
      money_rasid_dinank: "",
      money_rasid_kramank: "",
      created_by: this.loginedOffierEmpId.toString(),
      month_year: '',
      dr_number: '',
      is_editable: '1',
      vasuli_table_id: '',
      updated_by: '',
      updated_at: '',
      created_at: ''
    };
    this.listOfVasuliViran.push(model);
  }

  removeVasuliData(index: number) {
    if (index > -1 && index < this.listOfVasuliViran.length) {
      this.listOfVasuliViran.splice(index, 1);
    }
  }

  totalVasulRashiExceptAgrimRashi: number = 0;
  sheshRashiForVasuli: number = 0;


  sheshRashiForVasuliAtROLevelToShow: number = 0;
  sheshRashiForVasuliAtSDOLevelToShow: number = 0;
  sheshRashiForVasuliAtDFOLevelToShow: number = 0;
  sheshRashiForVasuliAtCCFLevelToShow: number = 0;


  totalVasulRashi: number = 0;

  calculateTotalRashi(row: any) {
    row.total_rashi = Number(row.mahsul_rashi) + Number(row.mavja_rashi);

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }

  }

  calculateMahayogTotalRashi(row: any) {

    if (this.listOfVasuliViran.length > 0) {
      this.totalVasulRashi = this.listOfVasuliViran.reduce((sum, item) => {
        return sum + (parseFloat(item.total_rashi) || 0);
      }, 0);
    } else {
      this.totalVasulRashi = 0;
    }

  }

  get ableToEnterVasuliVivran(): boolean {
    let value = false;
    if (this.isRO && (this.comingComplaintData.complain_progress_stage === "6" ||
      this.comingComplaintData.complain_progress_stage === "7")
    ) {
      value = false;
    }
    return value;
  }

  get totalPreshitMatraUsingChallanInGhanMeter(): string {
    // 
    let total = this.challanDetailList.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    );
    return total.toFixed(2);
  }

  get totalPreshitMatraUsingChallanInSankhya(): number {
    return this.challanDetailList.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_sankhya) || 0),
      0
    );
  }

  get totalPreshitMatraUsingChallan(): number {
    return this.challanDetailList.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    );
  }

  get totalVasuli(): number {
    return this.listOfAlreadySubmittedVasuliDetail.reduce(
      (sum, item) => sum + (Number(item.total_rashi) || 0),
      0
    );
  }

  challanDetailList: ChallanDetailResponseModal[] = [];
  workLogList: WorkLogResponseModal[] = [];
  whenAssignJanchkartaDetail: WorkLogResponseModal[] = [];
  porHistoryLogList: GetComplainHistoryResponseModal[] = [];
  listOfAlreadySubmittedVasuliDetail: VasuliViranDetailRequestModal[] = [];



  async generatePdfForPradhikritAdhikari() {

    let accusedSection: any;
    // 
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
          { text: 'उम्र', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],
        [
          1,
          'अज्ञात',
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
              widths: ['auto', '*', '*', 'auto', '*', '*'],
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
          { text: 'उम्र', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],

        ...this.accusedPersons.map((a: any, index: number) => [
          index + 1,
          a.name || '',
          a.fathersName || '',
          a.age || '',
          a.cast || '',
          a.address || ''
        ])
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', '*', '*'],
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
      { text: 'सामाग्री का विवरण', bold: true },
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
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
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

    // 
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      // 
      let totalOtherJaptSaman = "";

      for (let itemIndex = 0; itemIndex < anyaJaptSamanItems.length; itemIndex++) {

        let japtVahan = anyaJaptSamanItems[itemIndex];

        totalOtherJaptSaman =
          totalOtherJaptSaman + ' सामग्री का विवरण : ' + japtVahan.if_other_then_detail + ' , संख्या (नग) : ' + japtVahan.nag + ' , मात्रा (घन मीटर) : ' + japtVahan.ghan_meter + ' , अनुमानित मूल्य : ' + japtVahan.total_cost;

      }

      goswara.push(

        {
          text: [
            { text: 'अन्य जप्त सामान : ' },
            { text: totalOtherJaptSaman, bold: true }
          ],

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
            { text: ['क्रमांक : ', { text: this.comingComplaintData.patra_kramank, bold: true }] },
            { text: [{ text: this.comingComplaintData.range_name, bold: true }, ', दिनांक : ', { text: this.convertDateString(this.comingComplaintData.pratra_dinank), bold: true }], alignment: 'right' },
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
            { text: this.comingComplaintData.sub_division_name }
          ],
          margin: [40, 0, 0, 0] // left, top, right, bottom
        },

        { text: '\n' },

        {
          text: [
            "विषय : ",
            { text: this.comingComplaintData.crime_type, bold: true },
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
            { text: ['6. अपराध का विवरण अधिनियम एवं धारा , जिसके अंतर्गत अपराध हुआ : '] },
            {
              text: [
                { text: this.crime_dhara, bold: true }]
              , alignment: 'right'
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
        { text: this.comingComplaintData.anya_vishesh_vivran, bold: true },

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
                { text: 'पृष्ठ क्रमांक : ' },
                { text: this.comingComplaintData.pristh_kramank, bold: true }
              ]
            },

            { text: [{ text: "दिनांक : " }, { text: this.convertDateString(this.comingComplaintData.pratra_dinank), bold: true }], alignment: 'right' },
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

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("प्राधिकृत_अधिकारी_को_सूचना_PDF" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition);

    }

  }







  async generatePDFOfRAWorkLog() {


    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

    const banshItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस');
    const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल');

    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true, alignment: 'center' },
      { text: 'लम्बाई (मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (नोशनल टन)', bold: true, alignment: 'center' }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];


    const polHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];

    const anyaJaptSamanHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' }
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.if_other_then_detail || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];




    const balliHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];

    const chattaHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }]]) // default row if empty
    ];

    const chiranHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन (घ.मी.)', bold: true, alignment: 'center' }
    ];

    const buildChiranBody = (items: any[]) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const kasthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन (घ.मी.)', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[]) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const thuthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: '1 गोलाई वर्ग कम करने पर', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    const buildThuthBody = (items: any[]) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.one_golai_less || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];



    const contentOfJaptiSaman: any[] = [];

    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.totalThunthNag + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto'],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true }, // note space at end
            { text: this.totalKashthNag + ',   ' }, // added extra spaces after number
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', '*', '*', 40, 'auto'],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true }, // note space at end
            { text: this.totalChiranNag + ',   ' }, // added extra spaces after number
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*'],
            body: buildChattaBody(chattaItems)
          }
        },

        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (banshItem && banshItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildBansBody(banshItem)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBaansNag + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalPolNag + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter + '   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    // अन्य जप्त सामग्री का विवरण
    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', 'auto', 'auto'],
            body: buildjaptVahanBody(this.listOfJaptVahanDetail)
          }
        },
        { text: '\n', fontSize: 2 },
      );
    }


    let finalWorkLogData = this.comingComplaintData.finalWorkLogDetailByRa &&
      this.comingComplaintData.finalWorkLogDetailByRa.length > 0
      ? this.comingComplaintData.finalWorkLogDetailByRa[0]
      : null;


    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    let accusedSection: any;

    if (this.accusedCount === 0) {
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' }
        ]
      ];

      accusedSection = {
        stack: [
          {
            text: '2. मुलजिमों के नाम , वल्दियत व सकूनत (और मालूम हो)',
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

    } else {
      // Table header + rows for multiple accused
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }
        ],
        ...this.accusedPersons.map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          { text: a.age || '', alignment: 'center' },
          { text: a.cast || '', alignment: 'center' },
          { text: a.jati_name || '', alignment: 'center' },
          { text: a.mobile_number || '', alignment: 'center' },
          { text: a.address || '', alignment: 'center' }
        ])
      ];

      accusedSection = {
        stack: [
          {
            text: '2. मुलजिमों के नाम , वल्दियत व सकूनत (और मालूम हो)', bold: true,
            margin: [0, 0, 0, 2]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };
    }

    const tableBody = [
      [
        { text: 'तहकीकात शुरू होने की तारीख और वक्त', bold: true, alignment: 'center' },
        { text: 'मुकाम', bold: true, alignment: 'center' },
        { text: 'तहकीकात करने वाले अधिकारी की कार्यवाही का खुलासा (टीप) हर एक इन्द्राज पर तहकीकात करने वाले ऑफिसर की दस्तखत करके तारीख और तहकीकात बंद करने का वक्त दर्ज करना चाहिए', bold: true, alignment: 'center' },
        { text: 'हुक्म पाने वाले के दस्तखत मय तारीख', bold: true, alignment: 'center' }
      ],
      ...this.whenAssignJanchkartaDetail.map(item => [
        { text: item.work_log_date || '', alignment: 'center' },
        { text: item.address || '', alignment: 'center' },
        { text: item.work_log_text || '', alignment: 'center' },
        { text: '', alignment: 'center' }
      ]),
      ...this.workLogList.map(item => [
        { text: item.work_log_date || '', alignment: 'center' },
        { text: item.address || '', alignment: 'center' },
        { text: item.work_log_text || '', alignment: 'center' },
        { text: '', alignment: 'center' }
      ])
    ];

    ;
    const groupedData = this.getCrimDharaGroupedSeprated(this.comingComplaintData.crime_dhara);

    const parts: string[] = [];

    for (const act in groupedData) {
      if (groupedData.hasOwnProperty(act)) {
        const sections = groupedData[act];

        parts.push(`${act} - ${sections.join(', ')}`);
      }
    }

    const inlineString = parts.join(', ');
    ;

    const finalText = [
      { text: '1. तफसील जुर्म और तफसील माल जो गिरफ्तार हुआ : ' + this.comingComplaintData.crime_type + ', ' + inlineString, bold: false },
    ];

    const formattedPartsStackRA: any[] = [];
    for (const act in groupedData) {
      if (groupedData.hasOwnProperty(act)) {
        const sections = groupedData[act];
        formattedPartsStackRA.push({
          text: [
            { text: act + ' - ', bold: false },
            { text: sections.join(', '), bold: true }
          ],
          margin: [0, 0, 0, 5]
        });
      }
    }

    const docDefinition: any = {
      content: [

        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'कायर्वाही का तख्ता (मुकदमा का रोजनामचा)', style: 'title' },
        //{ text: '(' + (this.comingComplaintData.por_number || '') + ')', style: 'title' },
        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),
        { text: '\n', fontSize: 2 },

        {
          columns: [
            { text: 'POR क्रमांक : ' + (this.comingComplaintData.por_number || ''), alignment: 'left' },
            { text: 'पंजीयन दिनांक  : ' + (this.comingComplaintData.date_of_crime || ''), alignment: 'right' }
          ],
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        finalText,

        { text: '\n', fontSize: 2 },

        contentOfJaptiSaman,

        { text: '\n', fontSize: 2 },

        accusedSection,

        { text: '\n', fontSize: 2 },

        { text: '3. तारीख बकूआ (जुर्म) : ' + this.comingComplaintData.date_of_crime, bold: false },

        { text: '\n', fontSize: 2 },

        { text: '4. पता लगाने वाले आफिसर का नाम : ' + this.comingComplaintData.complainer_name, bold: false },

        { text: '\n', fontSize: 2 },

        { text: '5. पता लगाने की तारीख और वक्त : ' + this.comingComplaintData.actual_crime_date, bold: false },

        { text: '\n', fontSize: 2 },

        { text: '6. इब्तदाई रिपोर्ट का नंबर और उसकी रवानगी की तारीख और वक्त : ' + this.comingComplaintData.por_number },

        { text: '\n', fontSize: 2 },

        { text: '7. इब्तदाई रिपोर्ट की तारीख और वक्त : ' },

        {
          margin: [0, 5, 0, 5],
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: tableBody
          }
        }
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 1]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("कार्यवाही_का_तख्ता_PDF" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = this.comingComplaintData.por_number + '.pdf';

        await this.savePdf(base64Data, fileName);


      });

    }

  }


  async generatePDFOfApradhPrativedanPrakran() {

    let accusedSection: any;

    if (this.accusedCount === 0) {

      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }
        ],
        [
          { text: 1, alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' },
          { text: 'अज्ञात', alignment: 'center' }
        ]
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };

    } else {
      // Table header + rows for multiple accused
      const accusedTableBody = [
        [
          { text: 'क्रमांक', bold: true, alignment: 'center' },
          { text: 'अपराधी का नाम', bold: true, alignment: 'center' },
          { text: 'पिता का नाम', bold: true, alignment: 'center' },
          { text: 'उम्र', bold: true, alignment: 'center' },
          { text: 'जाति वर्ग', bold: true, alignment: 'center' },
          { text: 'जाति', bold: true, alignment: 'center' },
          { text: 'मोबाइल नंबर', bold: true, alignment: 'center' },
          { text: 'पता', bold: true, alignment: 'center' }
        ],
        ...this.accusedPersons.map((a: any, index: number) => [
          { text: index + 1, alignment: 'center' },
          { text: a.name || '', alignment: 'center' },
          { text: a.fathersName || '', alignment: 'center' },
          { text: a.age || '', alignment: 'center' },
          { text: a.cast || '', alignment: 'center' },
          { text: a.jati_name || '', alignment: 'center' },
          { text: a.mobile_number || '', alignment: 'center' },
          { text: a.address || '', alignment: 'center' }
        ])
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
              body: accusedTableBody
            },
            margin: [0, 0, 0, 10]
          }
        ]
      };
    }


    const dharaText = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

    const formattedPartsStackTest: any[] = [];
    const groupedData = this.getCrimDharaGroupedSeprated(this.comingComplaintData.crime_dhara);

    for (const act in groupedData) {
      if (groupedData.hasOwnProperty(act)) {
        const sections = groupedData[act];
        formattedPartsStackTest.push({
          text: [
            { text: act + ' - ', bold: false },
            { text: sections.join(', '), bold: true }
          ],
          margin: [0, 0, 0, 5]
        });
      }
    }

    ;

    const parts: string[] = [];

    for (const act in groupedData) {
      if (groupedData.hasOwnProperty(act)) {
        const sections = groupedData[act];

        parts.push(`${act} - ${sections.join(', ')}`);
      }
    }

    const inlineString = parts.join(', ');
    ;

    const finalText = [
      {
        text: [
          {
            text: '6. अपराध की प्रवृत्ति भारतीय वन अधिनियम की धारा जिसके अंतर्गत दंडनीय है : ',
            bold: true
          },
          {
            text: (this.comingComplaintData.crime_type || '') + ', ' + (inlineString || ''),
            bold: false
          }
        ]
      }
    ];


    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

    const banshItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस');
    const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल');

    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true, alignment: 'center' },
      { text: 'लम्बाई (मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (नोशनल टन)', bold: true, alignment: 'center' },
      { text: 'दर (₹)', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const polHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'दर (₹)', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];


    const anyaJaptSamanHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'सामाग्री का विवरण', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'मात्रा (घन मीटर)', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.if_other_then_detail || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];




    const chattaHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' },
      { text: 'दर', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];

    const chiranHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन (घ.मी.)', bold: true, alignment: 'center' },
      { text: 'दर', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildChiranBody = (items: any[]) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const balliHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'दर', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]]) // default row if empty
    ];

    const kasthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      //{ text: 'हालात', bold: true },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन (घ.मी.)', bold: true, alignment: 'center' },
      { text: 'दर', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' },
      { text: 'परिवहन योग्य', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[]) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        //item.kasth_halat_name || 0,
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' },
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' },
        item.is_yogya_to_parivahan == 0 ? { stack: [{ text: 'नहीं', alignment: 'center' }, { text: '(' + (item.if_not_yogya_then_reason || '') + ')', fontSize: 6, alignment: 'center' }] } : { text: 'हाँ', alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: '-', alignment: 'center' }]])
    ];

    const thuthHeader = [
      // { text: 'सामान का प्रकार', bold: true },
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      // { text: 'ऊंचाई(मी.)', bold: true },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: '1 गोलाई वर्ग कम करने पर', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      //{ text: 'फॉर्म फैक्टर', bold: true },
      { text: 'दर', bold: true, alignment: 'center' },
      { text: 'कुल राशि', bold: true, alignment: 'center' }
    ];

    // Build Thuth body
    const buildThuthBody = (items: any[]) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        // item.unchai || 0,
        { text: item.golai || 0, alignment: 'center' },
        { text: item.one_golai_less || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        //item.form_factor || 0,
        { text: item.dar || 0, alignment: 'center' },
        { text: item.total_cost || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    let finalWorkLogData = this.comingComplaintData.finalWorkLogDetailByRa &&
      this.comingComplaintData.finalWorkLogDetailByRa.length > 0
      ? this.comingComplaintData.finalWorkLogDetailByRa[0]
      : null;

    const contentOfForestProduce: any[] = [];
    const contentOfOtherSaman: any[] = [];
    const contentOfVahan: any[] = [];

    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfForestProduce.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', 60],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.totalThunthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalThunthGhanMeter + ',   ' },
            { text: 'कुल राशि : ', style: 'subheader', bold: true },
            { text: this.totalThunthRashi },
          ]
        },
        { text: '\n' }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfForestProduce.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 40, 'auto', 'auto', 60, 50],
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
      contentOfForestProduce.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 60, 50],
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

    if (chiranItems && chiranItems.length > 0) {
      contentOfForestProduce.push(
        { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 40, 'auto', 'auto', 60, 50],
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

    if (chattaItems && chattaItems.length > 0) {
      contentOfForestProduce.push(
        { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
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

    if (banshItem && banshItem.length > 0) {
      contentOfForestProduce.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', 60, 50],
            body: buildBansBody(banshItem)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBaansNag + ',   ' },
            { text: 'कुल बाँस की राशि : ', style: 'subheader', bold: true },
            { text: this.totalBaansRashi + ',   ' }
          ]
        },
        { text: '\n' }
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfForestProduce.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalPolNag + ',   ' },
            { text: 'कुल फेंसिंग पोल की राशि : ', style: 'subheader', bold: true },
            { text: this.totalPolRashi + ',   ' }
          ]
        },
        { text: '\n' }
      );
    }

    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfOtherSaman.push(
        // { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 50],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter + ',   ' },
            { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanAnumanitMulya },
          ]
        }
      );
    }

    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
      contentOfVahan.push(
        // { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
            body: buildjaptVahanBody(this.listOfJaptVahanDetail)
          }
        }
      );
    }

    const witnessTableBody = [
      [
        { text: 'क्रमांक', bold: true, alignment: 'center' },
        { text: 'साक्षी का नाम', bold: true, alignment: 'center' },
        { text: 'पिता का नाम', bold: true, alignment: 'center' },
        { text: 'उम्र', bold: true, alignment: 'center' },
        { text: 'जाति', bold: true, alignment: 'center' },
        { text: 'पता', bold: true, alignment: 'center' }
      ],
      [
        { text: '1', alignment: 'center' },
        { text: this.comingComplaintData.name_of_witness_one || '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: this.comingComplaintData.address_of_witness_one || '-', alignment: 'center' }
      ],
      [
        { text: '2', alignment: 'center' },
        { text: this.comingComplaintData.name_of_witness_two || '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: '-', alignment: 'center' },
        { text: this.comingComplaintData.address_of_witness_two || '-', alignment: 'center' }
      ]
    ];

    const japtikartaKaSignBlock = {
      width: 'auto',
      stack: [
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),
        {
          text: '(' + this.comingComplaintData.complainer_name + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: 'जप्ती करने वाले वन अधिकारी के हस्ताक्षर एवं नाम', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'वन अपराध प्रकरण प्रतिवेदन', style: 'title' },
        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),
        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 5, 0]
            }
          ],
          margin: [0, 0, 0, 2]
        },

        {
          table: {
            widths: [240, 10, '*'],
            body: [
              [{ text: '1. अपराध दिनांक यदि विदित हो ', bold: true }, { text: ':', bold: true }, { text: this.comingComplaintData.date_of_crime || '', bold: false }],
              [{ text: '2. कर्मचारी का नाम जिसने अपराध पकड़ा हो ', bold: true }, { text: ':', bold: true }, { text: (this.comingComplaintData.complainer_name || '') + ', ' + (this.comingComplaintData.complain_created_by || ''), bold: false }],
              [{ text: '  अपराधी का पता लगाने का दिनांक', bold: true }, { text: ':', bold: true }, {
                text: (this.comingComplaintData.is_accused_found === "0" ? (finalWorkLogData?.accussed_found_date_in_case_of_agyat === "01-01-1900"
                  ? ''
                  : finalWorkLogData?.accussed_found_date_in_case_of_agyat) : this.comingComplaintData.date_of_crime) || '', bold: false
              }],
              [{ text: '3. अपराध  ', bold: true }, { text: ':', bold: true }, {
                stack: [
                  { text: this.comingComplaintData.crime_type || '', bold: false },
                ]
              }],
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        { text: '4.  अपराधी का नाम और पिता का नाम जाति तथा निवास स्थान ', bold: true },

        accusedSection,

        { text: '\n' },

        { text: "5. वनोपज का विवरण एवं गैर वाणिज्यिक दर/बाजार भाव से उसका मूल्य : ", bold: true },
        contentOfForestProduce,

        { text: "अन्य जप्त सामाग्री का विवरण : " },
        contentOfOtherSaman,

        { text: "जप्त वाहन का विवरण : " },
        contentOfVahan,

        { text: '\n' },

        finalText,

        { text: '\n' },

        {
          text: '7. साक्षीगण का नाम तथा पूर्ण पता :',
          font_size: 10,
          style: 'subheader',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*'],
            body: witnessTableBody
          },
          margin: [0, 0, 0, 10]
        },

        { text: '\n' },

        {
          table: {
            widths: [240, 10, '*'],
            body: [

              [{ text: '8. जप्तशुदा माल को जिसके सुपुर्द किया गया ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: finalWorkLogData?.japt_suda_saman_jinko_diya_gaya || '---', bold: false }],
              [{ text: '9. जांच अधिकारी का नाम एवं पद ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: finalWorkLogData?.ra_name || '---', bold: false }],
              [{ text: '10. जांच की अवधि ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: (finalWorkLogData?.start_end_janch_date || '---') + " = " + this.getDayDiff(finalWorkLogData?.start_end_janch_date) + " दिन", bold: false }],
              [{ text: '11. अपराधी के पूर्व अपराध का विवरण (यदि कोई हो ) ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: '---', bold: false }],
              [{ text: '12. अपराधी प्रकरण को अभिसंघानित करने को इक्छुक है अथवा नहीं ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: finalWorkLogData?.is_accussed_want_to_abhisandhanit || '---', bold: false }],
              [{ text: '13. अपराधी की आर्थिक परिस्थिति का विवरण ', bold: true }, { text: ':', bold: true, alignment: 'center' }, { text: finalWorkLogData?.accussed_financial_condition || '---', bold: false }],
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 2]
        },

        {
          text: '',
          pageBreak: 'before' // 👈 moves this content to next page
        },

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
            " वन रक्षक ", { text: this.comingComplaintData.complainer_name + ' ', bold: true }, { text: this.comingComplaintData.complain_created_by, bold: true },
            " द्वारा ", { text: this.comingComplaintData.date_of_crime, bold: true },
            " को किया गया है जिसकी जांच मेरे द्वारा सूक्षमता से की गयी है। अपराधी ", { text: this.comingComplaintData.accused_name, bold: true },
            " ने अपना अपराध स्वीकार करते हुए / नहीं करते हुए विभाग से फैसला चाहा / नहीं चाहा है। अतः मैं प्रकरण को अभिसन्धानित हेतु / प्रकरण की न्यायालय में देने हेतु निम्न सिफारिश करता हूँ।"
          ],
          font: 'NotoSansDevanagari',
          margin: [0, 0, 0, 15],
        },


        //////// RA LOG RELATED START //////////

        {
          text: [
            { text: finalWorkLogData?.ra_anushansha }
          ],
          font: 'NotoSansDevanagari',
          margin: [0, 0, 0, 15],
        },

        {
          text: [
            "जप्त ठूंठ की कुल राशि : ", { text: finalWorkLogData?.japt_saman_total_price, bold: true }
            // { text: this.comingComplaintData.total_japt_saman_costing, bold: true }
          ],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        {
          text: [
            "जप्त वनोपज की कुल राशि : ", { text: finalWorkLogData?.found_vanopaj_total_price, bold: true }
          ],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        {
          text: [
            "वास्तविक हानि की कुल राशि : ", { text: finalWorkLogData?.actual_loss_total_price, bold: true }
          ],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        { text: '\n' },

        {
          text: [
            "वनोपज (महशुल) मूल्य : ", { text: finalWorkLogData?.mahsul_total_price, bold: true }
          ],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        {
          text: ["क्षतिपूर्ति (मावजा) मूल्य : ", { text: finalWorkLogData?.mavja_total_price, bold: true }],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },

        {
          text: ["योग : ", { text: this.totalOfMavjaAndMahsul(finalWorkLogData?.mahsul_total_price, finalWorkLogData?.mavja_total_price), bold: true }],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },
        {
          text: ["अग्रिम वसूली राशि : ", { text: finalWorkLogData?.agrim_vasuli_money || "       ", bold: true }],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },
        {
          text: ["वसूली हेतु शेष राशि : ", { text: ((finalWorkLogData as any)?.res_money || (this.totalOfMavjaAndMahsul(finalWorkLogData?.mahsul_total_price, finalWorkLogData?.mavja_total_price) - (Number(finalWorkLogData?.agrim_vasuli_money) || 0))) || "       ", bold: true }],
          alignment: "right",
          font: 'NotoSansDevanagari',
        },
        { text: '\n' },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: this.comingComplaintData.date_of_crime, bold: true }], fontSize: 10 },
                { text: '\n' },
                { text: 'वनमंडलाधिकारी / उप वनमंडलाधिकारी' },
              ],
              width: '*'
            },
            ...(japtikartaKaSignBlock ? [japtikartaKaSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        },

        { text: '\n' },

        //////// RO LOG RELATED START ////////////
        ...(this.roWorkLog
          ? [

            // 👇 Add this line block before RO LOG starts
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 515, y2: 0, // full width (A4 width minus margins)
                  lineWidth: 1,
                  lineColor: '#000000',
                },
              ],
              margin: [0, 10, 0, 10], // spacing above and below line
            },

            {
              text: [
                "निवेदन है कि मैं परिक्षेत्र सहायक की राय से सहमत हूँ / नहीं हूँ तथा निम्न प्रकरण अभिसन्धानित हेतु न्यायालय में चालान हेतु अनुशंसा करता हूँ |"
              ],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },


            {
              text: [
                { text: "वन परिक्षेत्र अधिकारी की अनुशंसा : ", bold: true },
              ],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },

            {
              text: [{ text: this.roWorkLog?.approve_reject_remark }],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },
            {
              text: [
                "जप्त ठूंठ की कुल राशि : ",
                { text: this.roWorkLog.japt_saman_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "जप्त वनोपज की कुल राशि : ",
                { text: this.roWorkLog?.found_vanopaj_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "वास्तविक हानि की कुल राशि : ",
                { text: this.roWorkLog?.actual_loss_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n' },
            {
              text: [
                "वनोपज (महशुल) मूल्य : ",
                { text: this.roWorkLog?.mahsul_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "क्षतिपूर्ति (मावजा) मूल्य : ",
                { text: this.roWorkLog?.mavja_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "योग : ",
                {
                  text: this.totalOfMavjaAndMahsul(
                    this.roWorkLog?.mahsul_total_price_edited,
                    this.roWorkLog?.mavja_total_price_edited
                  ),
                  bold: true,
                },
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["अग्रिम वसूली राशि : ", { text: finalWorkLogData?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["वसूली हेतु शेष राशि : ", { text: this.roWorkLog?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n\n' },
            {
              text: ['वन परिक्षेत्राधिकारी'],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n\n' },
          ]
          : []), // else nothing added

        { text: 'प्रकरण में वर्णित वनोपज मूल्य इत्यादि चेक कर प्रस्तुत करें ' },

        { text: '\n\n' },

        { text: 'वनमंडलाधिकारी / उप वनमंडलाधिकारी' },

        //////// RO LOG RELATED END ////////////


        //////// SDO LOG RELATED START ////////////
        ...(this.sdoWorkLog
          ? [

            // 👇 Add this line block before RO LOG starts
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 515, y2: 0, // full width (A4 width minus margins)
                  lineWidth: 1,
                  lineColor: '#000000',
                },
              ],
              margin: [0, 10, 0, 10], // spacing above and below line
            },

            {
              text: [
                { text: "उपवनमंडलाधिकारी की अनुशंसा / टिप्पणी : ", bold: true },
              ],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },

            {
              text: [{ text: this.sdoWorkLog?.approve_reject_remark }],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },
            {
              text: [
                "जप्त ठूंठ की कुल राशि : ",
                { text: this.sdoWorkLog.japt_saman_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "जप्त वनोपज की कुल राशि : ",
                { text: this.sdoWorkLog?.found_vanopaj_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "वास्तविक हानि की कुल राशि : ",
                { text: this.sdoWorkLog?.actual_loss_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n' },
            {
              text: [
                "वनोपज (महशुल) मूल्य : ",
                { text: this.sdoWorkLog?.mahsul_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "क्षतिपूर्ति (मावजा) मूल्य : ",
                { text: this.sdoWorkLog?.mavja_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "योग : ",
                {
                  text: this.totalOfMavjaAndMahsul(
                    this.sdoWorkLog?.mahsul_total_price_edited,
                    this.sdoWorkLog?.mavja_total_price_edited
                  ),
                  bold: true,
                },
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["अग्रिम वसूली राशि : ", { text: finalWorkLogData?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["वसूली हेतु शेष राशि : ", { text: this.sdoWorkLog?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n\n' },
            {
              text: ['हस्ताक्षर  _________________'],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n\n' },

          ]
          : []), // else nothing added

        //////// SDO LOG RELATED END ////////////

        //////// DFO LOG RELATED START ////////////
        ...(this.dfoWorkLog
          ? [

            // 👇 Add this line block before RO LOG starts
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 515, y2: 0, // full width (A4 width minus margins)
                  lineWidth: 1,
                  lineColor: '#000000',
                },
              ],
              margin: [0, 10, 0, 10], // spacing above and below line
            },

            {
              text: [
                { text: "वनमंडलाधिकारी की अनुशंसा / टिप्पणी : ", bold: true },
              ],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },

            {
              text: [{ text: this.dfoWorkLog?.approve_reject_remark }],
              font: 'NotoSansDevanagari',
              margin: [0, 0, 0, 15],
            },
            {
              text: [
                "जप्त ठूंठ की कुल राशि : ",
                { text: this.dfoWorkLog.japt_saman_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "जप्त वनोपज की कुल राशि : ",
                { text: this.dfoWorkLog?.found_vanopaj_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "वास्तविक हानि की कुल राशि : ",
                { text: this.dfoWorkLog?.actual_loss_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n' },
            {
              text: [
                "वनोपज (महशुल) मूल्य : ",
                { text: this.dfoWorkLog?.mahsul_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "क्षतिपूर्ति (मावजा) मूल्य : ",
                { text: this.dfoWorkLog?.mavja_total_price_edited || "0", bold: true }
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: [
                "योग : ",
                {
                  text: this.totalOfMavjaAndMahsul(
                    this.dfoWorkLog?.mahsul_total_price_edited,
                    this.dfoWorkLog?.mavja_total_price_edited
                  ),
                  bold: true,
                },
              ],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["अग्रिम वसूली राशि : ", { text: finalWorkLogData?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            {
              text: ["वसूली हेतु शेष राशि : ", { text: this.dfoWorkLog?.agrim_vasuli_money, bold: true }],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
            { text: '\n\n' },
            {
              text: ['हस्ताक्षर  _________________'],
              alignment: "right",
              font: 'NotoSansDevanagari',
            },
          ]
          : []), // else nothing added

        //////// DFO LOG RELATED END ////////////


      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
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


  formatJachkartaDecisionLabel(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '---';
    }
    const n = typeof value === 'number' ? value : Number(value);
    if (n === 0) return 'अभिसन्धानित/अपलेखित';
    if (n === 1) return 'न्यायालय में देने हेतु अनुशंषा';
    return '---';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // invalid date → blank
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getDayDiff(start_end_janch_date?: string): string {
    const dateRange = start_end_janch_date;

    // 1. Split by "से"
    const [startDateStr, endDateStr] = (dateRange?.split(" से ")?.map((s: string) => s.trim())) || ["", ""];

    // 2. Convert dd-MM-yyyy → Date
    function parseDate(str: string): Date {
      const [dd, mm, yyyy] = str.split("-").map(Number);
      return new Date(yyyy, mm - 1, dd); // month is 0-based
    }

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    // 3. Calculate difference in days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  }

  totalOfMavjaAndMahsul(mahsul?: string, mavja?: string): number {
    return (Number(mahsul) || 0) + (Number(mavja) || 0);
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
      .join("\n");
  }


  janch_ki_awadhi = "0";

  isWorkLogExist: boolean = false;
  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");
    // 
    this.apiService.getRAWorkLogList(this.comingComplaintData.complain_id).subscribe(
      (response) => {
        this.dismissDialog();
        // 
        if (response.response.code === 200) {

          this.whenAssignJanchkartaDetail = response.when_assign_janchkarta_adhikari;
          this.workLogList = response.data;
          this.porHistoryLogList = response.por_history;
          this.challanDetailList = response.challan_detail;
          this.listOfAlreadySubmittedVasuliDetail = response.vasuli_detail;


          let totalMajvaMahsul = Number(this.mahsul_total_price) + Number(this.mavja_total_price);

          if (Number(totalMajvaMahsul) > 0) {
            this.totalVasulRashiExceptAgrimRashi = Number(totalMajvaMahsul) - Number(this.agrim_vasuli_money);

            this.sheshRashiForVasuli = Number(totalMajvaMahsul) - Number(this.totalVasuli);
          }


          const lastRecord = this.porHistoryLogList[this.porHistoryLogList.length - 1];
          const pastDate = new Date(lastRecord.complain_created_at);
          const now = new Date();

          const diffMs = now.getTime() - pastDate.getTime();
          this.janch_ki_awadhi =
            (Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1).toString();



          this.getROWorkLog();
          this.getSDOWorkLog();
          this.getDFOWorkLog();
          this.getCCFWorkLog();



          if (this.workLogList.length > 0) {
            this.isWorkLogExist = true;
          }



          // if (this.listOfVasuliViran != null && this.agimVasuliCheckForDate != "") {

          //   const [datePart, timePart, modifier] = this.agimVasuliCheckForDate.split(' ');
          //   const [day, month, year] = datePart.split('-').map(Number);
          //   let [hours, minutes] = timePart.split(':').map(Number);

          //   // Convert to 24-hour format
          //   if (modifier === 'PM' && hours < 12) {
          //     hours += 12;
          //   }
          //   if (modifier === 'AM' && hours === 12) {
          //     hours = 0;
          //   }

          //   const selectedDate = new Date(year, month - 1, day, hours, minutes);

          //   const filteredList = this.listOfVasuliViran.filter((item: VasuliViranDetailRequestModal) => {
          //     const createdDate = new Date(item.created_at);
          //     return createdDate < selectedDate;
          //   });

          //   this.agrim_vasuli_money = filteredList.reduce((sum, item) => {
          //     return sum + Number(item.total_rashi || 0);
          //   }, 0).toString();


          // }




          for (let i = 0; i < this.workLogList.length; i++) {
            let singleValue = this.workLogList[i];

            if (singleValue.work_log_images && singleValue.work_log_images.trim() !== '') {
              let value = [];
              value = singleValue.work_log_images
                .split(',')
                .filter(name => name.trim() !== '')
                .map(name => name.trim());
              singleValue.work_log_images_array = value;
            } else {
              singleValue.work_log_images_array = [];
            }

          }

        }

        this.getComplainerSignIntoBase64();

      },
      (error) => {
        this.dismissDialog();
      }
    );
  }

  showSupurdnamaOrNot(): boolean {
    if (this.comingComplaintData != undefined && this.comingComplaintData.isJaptikartaAndSupurdarSame === "0") {
      return true;
    }
    return false;
  }

  async generatePDFOfSupurdnama() {


    let witnessSection: any;

    const witnessTableBody = [
      [
        { text: 'क्रमांक', bold: true },
        { text: 'साक्षी का नाम', bold: true },
        { text: 'पिता का नाम', bold: true },
        { text: 'उम्र', bold: true },
        { text: 'जाति', bold: true },
        { text: 'पूरा पता', bold: true },
        { text: 'हस्ताक्षर', bold: true }
      ],

      ...this.listOfWitness.map((a: any, index: number) => [
        index + 1,
        a.naam || '',
        a.pita_ka_naam || '',
        a.age || '',
        a.jaati || '',
        a.pata || '',
        (() => {

          const safeImage = this.getSafeImage(a.base64);

          return safeImage
            ? { image: safeImage, width: 60, height: 30, alignment: 'center' }
            : { text: '—', alignment: 'center' };
        })()
      ])
    ];

    witnessSection = {
      stack: [
        {
          text: '6. साक्षी का विवरण',
          style: 'subheader',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto', 'auto', '*', 60],
            body: witnessTableBody
          },
          margin: [0, 0, 0, 10]
        }
      ]
    };

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const today = new Date();
    const todaysDate = this.datePipe.transform(today, 'dd-MM-yyyy');

    const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    const thuthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'ठूंठ');
    const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

    const banshItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बाँस');
    const polItem = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'पोल');

    const banshHeader = [
      { text: 'बाँस का प्रकार', bold: true },
      { text: 'लम्बाई (मी.)', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'मात्रा (नोशनल टन)', bold: true }
    ];

    const buildBansBody = (items: any[] = []) => [
      banshHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.lambai || 0,
        item.nag || 0,
        item.ghan_meter || 0
      ]) : [['-', 0, 0, 0]])
    ];

    const polHeader = [
      { text: 'प्रजाति', bold: true },
      { text: 'संख्या', bold: true }
    ];

    const buildPolBody = (items: any[] = []) => [
      polHeader,
      ...(items.length > 0 ? items.map(item => [
        item.prajati_name || '',
        item.nag || 0
      ]) : [['-', 0]])
    ];

    const anyaJaptSamanHeader = [
      { text: 'सामाग्री का विवरण', bold: true },
      { text: 'संख्या', bold: true },
      { text: 'मात्रा (घन मीटर)', bold: true },
    ];

    const buildAnyaJaptSamanBody = (items: any[] = []) => [
      anyaJaptSamanHeader,
      ...(items.length > 0 ? items.map(item => [
        item.if_other_then_detail || '',
        item.nag || 0,
        item.ghan_meter || 0,
      ]) : [['-', 0, 0]])
    ];

    const chattaHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'चट्टा संख्या', bold: true, alignment: 'center' }
    ];

    const buildChattaBody = (items: any[] = []) => [
      chattaHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const balliHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई वर्ग(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(से.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' }
    ];

    const buildballiBody = (items: any[] = []) => [
      balliHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const chiranHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'चौड़ाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'मोटाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' },
    ];

    const buildChiranBody = (items: any[] = []) => [
      chiranHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.motai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const kasthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'लम्बाई(मी.)', bold: true, alignment: 'center' },
      { text: 'गोलाई(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
      { text: 'आयतन(घ.मी.)', bold: true, alignment: 'center' }
    ];

    const buildKasthBody = (items: any[] = []) => [
      kasthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.lambai || 0, alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
        { text: item.ghan_meter || 0, alignment: 'center' }
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const thuthHeader = [
      { text: 'प्रजाति', bold: true, alignment: 'center' },
      { text: 'गोलाई वर्ग(सें.मी.)', bold: true, alignment: 'center' },
      { text: 'संख्या', bold: true, alignment: 'center' },
    ];

    const buildThuthBody = (items: any[] = []) => [
      thuthHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.prajati_name || '', alignment: 'center' },
        { text: item.golai || 0, alignment: 'center' },
        { text: item.nag || 0, alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    const contentOfJaptiSaman: any[] = [];

    // ठूठ का विवरण
    if (thuthItems && thuthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'ठूठ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildThuthBody(thuthItems)
          }
        },
        {
          text: [
            { text: 'कुल ठूठ संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (kasthItems && kasthItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*'],
            body: buildKasthBody(kasthItems)
          }
        },
        {
          text: [
            { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalKashthNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalKashthGhanMeter + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (balliItems && balliItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildballiBody(balliItems)
          }
        },
        {
          text: [
            { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBalliNag + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*', '*', '*', '*', 'auto'],
            body: buildChiranBody(chiranItems)
          }
        },
        {
          text: [
            { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChiranNag + ',   ' },
            { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalChiranGhanMeter + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
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
            widths: ['auto', '*'],
            body: buildChattaBody(chattaItems)
          }
        },
        {
          text: [
            { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
            { text: this.totalChattaNag + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (banshItem && banshItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'बाँस का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: buildBansBody(banshItem)
          }
        },
        {
          text: [
            { text: 'कुल बाँस संख्या : ', style: 'subheader', bold: true },
            { text: this.totalBaansNag + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    if (polItem && polItem.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'फेंसिंग पोल का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: buildPolBody(polItem)
          }
        },
        {
          text: [
            { text: 'कुल फेंसिंग पोल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalPolNag + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    // अन्य जप्त सामग्री का विवरण
    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*'],
            body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
          }
        },
        {
          text: [
            { text: 'कुल संख्या : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanNag + ',   ' },
            { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
            { text: this.totalJaptSamanGhanMeter + ',   ' }
          ]
        },
        { text: '\n', fontSize: 2 }
      );
    }

    const japtVahanHeader = [
      { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true, alignment: 'center' },
      { text: 'वाहन क्रमांक', bold: true, alignment: 'center' },
      { text: 'अनुमानित मूल्य', bold: true, alignment: 'center' },
      { text: 'मालिक का नाम', bold: true, alignment: 'center' },
      { text: 'पिता का नाम', bold: true, alignment: 'center' },
      { text: 'पूरा पता', bold: true, alignment: 'center' },
      { text: 'तहसील', bold: true, alignment: 'center' },
      { text: 'जिला', bold: true, alignment: 'center' },
    ];

    const buildjaptVahanBody = (items: any[] = []) => [
      japtVahanHeader,
      ...(items.length > 0 ? items.map(item => [
        { text: item.vahan_prakar || '', alignment: 'center' },
        { text: item.vahan_kramank || '', alignment: 'center' },
        { text: item.anumanit_mulya || '', alignment: 'center' },
        { text: item.malik_name || '', alignment: 'center' },
        { text: item.pita_ka_name || '', alignment: 'center' },
        { text: item.pata || '', alignment: 'center' },
        { text: item.tahsil || '', alignment: 'center' },
        { text: item.jila || '', alignment: 'center' },
      ]) : [[{ text: '-', alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }, { text: 0, alignment: 'center' }]])
    ];

    // जप्त वाहन का विवरण
    if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
      contentOfJaptiSaman.push(
        { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
        {
          margin: [0, 0, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', '*', 'auto', 'auto'],
            body: buildjaptVahanBody(this.listOfJaptVahanDetail)
          }
        },
        { text: '\n' }
      );
    }

    const supurddarSignBlock = {
      width: 'auto',
      stack: [
        ...(this.supurddarSignBase64 && this.supurddarSignBase64.trim() !== ''
          ? [
            {
              image: this.supurddarSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),

        {
          text: '(' + this.comingComplaintData.supurddar_ka_name + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: 'सुपुर्ददार के हस्ताक्षर', alignment: 'center', fontSize: 10 }
      ]
    };

    const japtinamaSignBlock = {
      width: 'auto',
      stack: [
        ...(this.complainerSignBase64 && this.complainerSignBase64.trim() !== ''
          ? [
            {
              image: this.complainerSignBase64,
              width: 80,
              height: 40,
              alignment: 'center',
              margin: [0, 0, 0, 2]
            }
          ]
          : [
            {
              text: '',
              margin: [0, 40, 0, 0]
            }
          ]),

        {
          text: '(' + this.comingComplaintData.japtikarta_ka_name + ' , ' + this.comingComplaintData.japtikarta_ka_pad + ')',
          bold: true,
          alignment: 'center',
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        { text: (this.comingComplaintData.is_complain_created_by_ra == '1' || this.comingComplaintData.is_complain_created_by_ra === 'true') ? 'सहयाक परिछेत्र वृत्त ' : 'अधिकारी का नाम, पद एवं हस्ताक्षर', alignment: 'center', fontSize: 10 },
        { text: ['बीट  ', { text: this.comingComplaintData.beat_name, bold: true }], alignment: 'center', fontSize: 10 }
      ]
    };

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'सुपुर्दनामा', style: 'title' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10,
              margin: [0, 0, 5, 0]
            }
          ],
          margin: [0, 0, 0, 2]
        },

        { text: '\n', fontSize: 2 },

        // {
        //   text: [
        //     "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0मैं ", { text: this.comingComplaintData.supurddar_ka_name, bold: true }, " पुत्र ", { text: this.comingComplaintData.supurddar_ka_pita_ka_name, bold: true }, " जाति ", { text: this.comingComplaintData.supurdar_ka_jati, bold: true }, " यवसाय ", { text: this.comingComplaintData.supurddar_ka_vyavsay, bold: true }, " पता  ", { text: this.comingComplaintData.supurdar_ka_poora_pata, bold: true }, " तहसील ", {}, "जिला", {}, " का निवासी हूँ | \n\n",

        //     "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0मैंने भारतीय वन अधिनियम , 1972 की धारा 52 के तहत जप्त निम्नानुसार सामाग्री वन अधिकारी श्री ", { text: this.comingComplaintData.japtikarta_ka_name, bold: true }, " पद ", { text: this.comingComplaintData.japtikarta_ka_pad, bold: true }, " से आज दिनांक ", { text: this.comingComplaintData.supurd_me_lene_ka_dinank, bold: true }, " को, सुपुर्दनामे में प्राप्त की है |\n\n",

        //     "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0मैं इस करारनामे के अनुसार उपरोक्त सामाग्री को अपने प्रभार में लेकर इकरार करता हूँ कि मैं उसकी पूरी सुरक्षा करूँगा तथा वन अधिकारी के आदेश होने पर तत्काल प्रस्तुत करूँगा | \n\n"
        //   ],
        //   font: 'NotoSansDevanagari',
        //   fontSize: 10,
        //   margin: [0, 0, 0, 5],
        // }

        {
          stack: [
            {
              columns: [
                { width: 40, text: '' },   // 👈 THIS IS YOUR SPACE
                {
                  width: '*',
                  text: [
                    "मैं ",
                    { text: this.comingComplaintData.supurddar_ka_name, bold: true },
                    " पुत्र ",
                    { text: this.comingComplaintData.supurddar_ka_pita_ka_name, bold: true },
                    " जाति ",
                    { text: this.comingComplaintData.supurdar_ka_jati, bold: true },
                    " व्यवसाय ",
                    { text: this.comingComplaintData.supurddar_ka_vyavsay, bold: true },
                    " पता ",
                    { text: this.comingComplaintData.supurdar_ka_poora_pata, bold: true },
                    " तहसील जिला का निवासी हूँ |"
                  ]
                }
              ],
              margin: [0, 0, 0, 5]
            },

            {
              columns: [
                { width: 40, text: '' },
                {
                  width: '*',
                  text: [
                    "मैंने भारतीय वन अधिनियम, 1927 की धारा 52 के तहत जप्त निम्नानुसार सामाग्री वन अधिकारी श्री ",
                    { text: this.comingComplaintData.japtikarta_ka_name, bold: true },
                    " पद ",
                    { text: this.comingComplaintData.japtikarta_ka_pad, bold: true },
                    " से आज दिनांक ",
                    { text: this.comingComplaintData.supurd_me_lene_ka_dinank, bold: true },
                    " को, सुपुर्दनामे में प्राप्त की है |"
                  ]
                }
              ],
              margin: [0, 0, 0, 5]
            },

            {
              columns: [
                { width: 40, text: '' },
                {
                  width: '*',
                  text: "मैं इस करारनामे के अनुसार उपरोक्त सामाग्री को अपने प्रभार में लेकर इकरार करता हूँ कि मैं उसकी पूरी सुरक्षा करूँगा तथा वन अधिकारी के आदेश होने पर तत्काल प्रस्तुत करूँगा |"
                }
              ]
            }
          ],
          font: 'NotoSansDevanagari',
          fontSize: 10
        },

        { text: 'सुपुर्दनामे में प्राप्त सामाग्री का विवरण :', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },

        contentOfJaptiSaman,

        { text: '\n', fontSize: 2 },

        witnessSection,

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: todaysDate, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            ...(supurddarSignBlock ? [supurddarSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        },

        { text: '\n', fontSize: 2 },

        { text: 'मेरे द्वारा उपरोक्तानुसार सामाग्री सुपुर्दगी में दी गई -', fontSize: 10 },

        { text: '\n', fontSize: 2 },

        {
          columns: [
            {
              stack: [
                { text: ['स्थान :  ', { text: this.comingComplaintData.beat_name, bold: true }], fontSize: 10 },
                { text: ['दिनांक : ', { text: todaysDate, bold: true }], fontSize: 10 }
              ],
              width: '*'
            },
            ...(japtinamaSignBlock ? [japtinamaSignBlock] : [])
          ],
          margin: [0, 2, 0, 0]
        }

      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 2]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 2]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("SUPURDNAMA_" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = "SUPURDNAMA_" + this.comingComplaintData.por_number + '.pdf';

        const fileURI = await this.savePdf(base64Data, fileName);

      });

    }

  }


  getBase64OfMarkOnJaptiSaman() {
    if (this.comingComplaintData != undefined && this.comingComplaintData.chinhaPhoto != "") {
      this.apiService.getBase64Image(this.comingComplaintData.chinhaPhoto).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.markBase64 = response.response.msg;
          }

          this.setSignatureOfWitnesses();

        },
        (error) => {

          this.setSignatureOfWitnesses();

        }
      );
    } else {
      this.setSignatureOfWitnesses();
    }

  }


  markBase64OfHammerMark: string = "";

  getBase64OfMarkOnJaptinamaOfParticularSection(japtinamaDetail: JaptinamaResponseModal) {
    if (japtinamaDetail.hammer_mark_pic != undefined && japtinamaDetail.hammer_mark_pic != "") {
      this.apiService.getBase64Image(japtinamaDetail.hammer_mark_pic).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.markBase64OfHammerMark = response.response.msg;
          }

          this.setSignatureOfWitnessesOfParticularSection(japtinamaDetail);

        },
        (error) => {

          this.setSignatureOfWitnessesOfParticularSection(japtinamaDetail);

        }
      );
    } else {
      this.setSignatureOfWitnessesOfParticularSection(japtinamaDetail);
    }

  }

  getComplainerSignIntoBase64() {
    if (this.comingComplaintData != undefined && this.comingComplaintData.complainer_sign != "") {
      this.apiService.getBase64Image(this.comingComplaintData.complainer_sign).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.complainerSignBase64 = response.response.msg;
          }

          this.getSupurddarSignIntoBase64();

        },
        (error) => {
        }
      );
    } else {
      this.dismissDialog();
      this.getSupurddarSignIntoBase64();
    }
  }

  getSupurddarSignIntoBase64() {
    if (this.comingComplaintData != undefined && this.comingComplaintData.supurddar_sign != "") {
      this.apiService.getBase64Image(this.comingComplaintData.supurddar_sign).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.supurddarSignBase64 = response.response.msg;
          }

        },
        (error) => {
        }
      );
    } else {
      this.dismissDialog();
    }
  }

  getSupurddarSignIntoBase64OfParticularBlock(supurdNama: SupurdnamaResponse) {
    if (supurdNama.SupurdarKaSign != undefined && supurdNama.SupurdarKaSign != "") {
      this.apiService.getBase64Image(supurdNama.SupurdarKaSign).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.supurddarSignBase64 = response.response.msg;
          }

          this.getSupurddarMeDeneWaleKaSignIntoBase64OfParticularBlock(supurdNama);

        },
        (error) => {
          this.getSupurddarMeDeneWaleKaSignIntoBase64OfParticularBlock(supurdNama);
        }
      );
    } else {
      this.dismissDialog();
      this.getSupurddarMeDeneWaleKaSignIntoBase64OfParticularBlock(supurdNama);
    }
  }

  getSupurddarMeDeneWaleKaSignIntoBase64OfParticularBlock(supurdNama: SupurdnamaResponse) {
    if (supurdNama.SupurdMeDeneWaleAdhikariSign != undefined && supurdNama.SupurdMeDeneWaleAdhikariSign != "") {
      this.apiService.getBase64Image(supurdNama.SupurdMeDeneWaleAdhikariSign).subscribe(
        (response) => {
          this.dismissDialog();
          if (response.response.code === 200) {
            this.complainerSignBase64 = response.response.msg;
          }

          this.getSignOfWitnessesForparticularSupurdNama(supurdNama);

        },
        (error) => {
          this.getSignOfWitnessesForparticularSupurdNama(supurdNama);
        }
      );
    } else {
      this.getSignOfWitnessesForparticularSupurdNama(supurdNama);
      this.dismissDialog();
    }
  }

  // selectedRadioOption: string = "aplekhit";
  selectedRadioOption: string = ""
  sdoOrderUploadResetKey: number = 0;

  onRadioChangeForCourtChallanYesNo(event: any) {

    this.selectedRadioOptionForCourtChallan = event.detail.value;
    if (this.selectedRadioOptionForCourtChallan) {

    }

  }

  onRadioChange(event: any) {

    this.isForwardToCCF = false;
    this.isAbleToSelectAdeshButtonSDOOrDFO = true;

    // Reset SDO order upload + order fields + remark on every toggle
    this.selectedPdfFile = null;
    this.sdo_adesh_kramank = "";
    this.sdo_adesh_dinank = "";
    this.sdoRemarkToAplekhitOrForwardToDFO = "";
    this.sdoOrderUploadResetKey++;
    // console.log('[SDO toggle reset]', {
    //   selectedPdfFile: this.selectedPdfFile,
    //   sdo_adesh_kramank: this.sdo_adesh_kramank,
    //   sdo_adesh_dinank: this.sdo_adesh_dinank,
    //   sdoRemarkToAplekhitOrForwardToDFO: this.sdoRemarkToAplekhitOrForwardToDFO,
    //   sdoOrderUploadResetKey: this.sdoOrderUploadResetKey,
    // });

    this.selectedRadioOption = event.detail.value;
    console.log("Selected:", this.selectedRadioOption);

    switch (this.selectedRadioOption) {

      case "abhisandhan":
        this.isAbhisandhanOrForwardToDFO = true;
        this.label_for_sdo_final_submission = "अभिसन्धान सम्बंधित टिप्पणी लिखें";
        this.label_for_sdo_on_submit_button_final_submission = "SUBMIT";
        if (this.isComingFromSDO) {
          this.shesh_vasuli_rashi_at_sdo_level = this.shesh_vasuli_rashi_at_sdo_level_clone;
        }

        if (this.isComingFromDFO) {
          this.shesh_vasuli_rashi_at_dfo_level = this.shesh_vasuli_rashi_at_dfo_level_clone;
        }

        if (this.isComingFromCCF) {
          this.shesh_vasuli_rashi_at_ccf_level = this.shesh_vasuli_rashi_at_ccf_level_clone;
        }

        break;

      case "aplekhit":
        this.isAbhisandhanOrForwardToDFO = true;
        this.label_for_sdo_final_submission = "अपलेखन सम्बंधित टिप्पणी लिखें";
        this.label_for_sdo_on_submit_button_final_submission = "SUBMIT";
        if (this.isComingFromSDO) {
          this.shesh_vasuli_rashi_at_sdo_level = "0";
        }
        if (this.isComingFromDFO) {
          this.shesh_vasuli_rashi_at_dfo_level = "0";
        }
        if (this.isComingFromCCF) {
          this.shesh_vasuli_rashi_at_ccf_level = 0;
        }
        break;

      case "court_challan":
        this.isAbhisandhanOrForwardToDFO = true;
        this.label_for_sdo_final_submission = "कोर्ट चालान के लिए टिप्पणी लिखें";
        this.label_for_sdo_on_submit_button_final_submission = "कोर्ट चालान";

        if (this.isComingFromSDO) {
          this.shesh_vasuli_rashi_at_sdo_level = this.shesh_vasuli_rashi_at_sdo_level_clone;
        }

        if (this.isComingFromDFO) {
          this.shesh_vasuli_rashi_at_dfo_level = this.shesh_vasuli_rashi_at_dfo_level_clone;
        }

        break;

      case "forward_to_dfo":
        this.isAbhisandhanOrForwardToDFO = false;
        this.label_for_sdo_final_submission = "उपवनमंडलाधिकारी की अनुशंसा / टिप्पणी";
        this.label_for_sdo_on_submit_button_final_submission = "SUBMIT";

        if (this.isComingFromSDO) {
          this.shesh_vasuli_rashi_at_sdo_level = this.shesh_vasuli_rashi_at_sdo_level_clone;
        }

        if (this.isComingFromDFO) {
          this.shesh_vasuli_rashi_at_dfo_level = this.shesh_vasuli_rashi_at_dfo_level_clone;
        }

        break;

      case "forward_to_ccf":
        this.isForwardToCCF = true;
        this.label_for_sdo_final_submission = "वनमंडलाधिकारी की अनुशंसा / टिप्पणी";
        this.label_for_sdo_on_submit_button_final_submission = "SUBMIT";

        if (this.isComingFromSDO) {
          this.shesh_vasuli_rashi_at_sdo_level = this.shesh_vasuli_rashi_at_sdo_level_clone;
        }

        if (this.isComingFromDFO) {
          this.shesh_vasuli_rashi_at_dfo_level = this.shesh_vasuli_rashi_at_dfo_level_clone;
        }

        break;

    }
  }

  submitVasuliData() {

    let isAllDataSubmitted = true;

    for (let i = 0; i < this.listOfVasuliViran.length; i++) {
      let singleValue = this.listOfVasuliViran[i];

      if (singleValue.mahsul_rashi === "") {
        isAllDataSubmitted = false;
        break;
      }

    }

    if (!isAllDataSubmitted) {
      this.showError("कृपया वसूली की पूरी जानकारी भरें");
      return;
    }

    let valusi_data = JSON.stringify(this.listOfVasuliViran);

    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.cdRef.detectChanges();

    this.apiService.submitVasuliVivran(
      this.comingComplaintData.complain_id.toString(),
      valusi_data,
      this.loginedOffierEmpId.toString(),
      this.comingComplaintData.complain_progress_stage.toString()
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.cdRef.detectChanges();
          this.sharedService.setRefresh(true);
          this.goBack();

        } else {
          this.showError(response.response.msg)
        }

      },
      async (error) => {
        //await this.dismissLoading();
        await this.dismissDialog();
        this.showError(error);
      }
    );


  }

  selectedPdfFileDuringSendingToSDOOrDFOByRO: File | null = null;

  ro_remark_during_sending_to_sdo_or_dfo: string = "";

  onFileSelectedDuringSendingToSDOOrDFOByRO(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      this.selectedPdfFileDuringSendingToSDOOrDFOByRO = file;
    } else {
      this.selectedPdfFileDuringSendingToSDOOrDFOByRO = null;
      alert("Please select a valid PDF file");
    }
  }




  selectedPdfFile: File | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      this.selectedPdfFile = file;
    } else {
      this.selectedPdfFile = null;
      alert("Please select a valid PDF file");
    }
  }

  onFileSelectedOfSupportiveDocument(event: any, row: any) {
    // 
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      row.document_file = file;
    } else {
      row.document_file = null;
      alert("Please select a valid PDF file");
    }
  }

  submitBySdo() {

    ;
    //  / 

    console.log('[SDO submit before API]', {
      selectedRadioOption: this.selectedRadioOption,

      selectedPdfFile: this.selectedPdfFile
        ? { name: this.selectedPdfFile.name, type: this.selectedPdfFile.type, size: this.selectedPdfFile.size }
        : null,

      sdo_adesh_kramank: this.sdo_adesh_kramank,
      sdo_adesh_dinank: this.sdo_adesh_dinank,
      sdoRemarkToAplekhitOrForwardToDFO: this.sdoRemarkToAplekhitOrForwardToDFO,

      listOfSupportiveDocumentsSDOSection: (this.listOfSupportiveDocumentsSDOSection || []).map((d: any) => ({
        document_title: d?.document_title,
        document_file: d?.document_file
          ? { name: d.document_file.name, type: d.document_file.type, size: d.document_file.size }
          : null,
      })),
    });

    let isValidDocumentSelectionList: boolean = true;

    if (this.listOfSupportiveDocumentsSDOSection && this.listOfSupportiveDocumentsSDOSection.length > 0) {

      for (let i = 0; i < this.listOfSupportiveDocumentsSDOSection.length; i++) {
        const row = this.listOfSupportiveDocumentsSDOSection[i];

        if (!row.document_title) {
          isValidDocumentSelectionList = false;
          break;
        }

        if (row.document_file === null) {
          isValidDocumentSelectionList = false;
          break;
        }

      }

    }

    if (!isValidDocumentSelectionList) {
      this.showError("प्रकरण से सम्बंधित दस्तावेज की सारी जानकारी प्रेषित करिये");
      return;
    }

    if (this.selectedPdfFile === null) {
      this.showError("कृपया आदेश की प्रति चुने");
      return;
    }

    if (this.selectedRadioOption != 'forward_to_dfo') {
      if (this.sdo_adesh_kramank === "") {
        this.showError("कृपया आदेश क्रमांक प्रेषित करें");
        return;
      }

      if (this.sdo_adesh_dinank === "") {
        this.showError("कृपया आदेश दिनांक प्रेषित करें");
        return;
      }
    }

    if (this.sdoRemarkToAplekhitOrForwardToDFO === "") {
      this.showError(this.label_for_sdo_final_submission);
      return
    }

    if (this.isAbhisandhanOrForwardToDFO) {
      // 
      this.showDialog("कृपया प्रतीक्षा करें.....");
      this.cdRef.detectChanges();

      let selectedOptionByOfficer = "0";

      if (this.selectedRadioOption === "aplekhit") {
        selectedOptionByOfficer = "6";
      } else if (this.selectedRadioOption === "abhisandhan") {
        selectedOptionByOfficer = "9";
      } else if (this.selectedRadioOption === "court_challan") {
        selectedOptionByOfficer = "10";
      }






      this.apiService.aplekhitOrAbhisandhanOrCourtChallan_complain_by_sdo(
        this.japt_saman_total_price_edited_by_sdo.toString(),
        this.found_vanopaj_total_price_edited_by_sdo.toString(),
        this.actual_loss_total_price_edited_by_sdo.toString(),
        this.mahsul_total_price_edited_by_sdo.toString(),
        this.mavja_total_price_edited_by_sdo.toString(),
        this.comingComplaintData.complain_history_table_id.toString(),
        this.comingComplaintData.complain_id.toString(),
        this.loginedOffierEmpId.toString(),
        this.sdoRemarkToAplekhitOrForwardToDFO.toString(),
        this.selectedPdfFile,
        selectedOptionByOfficer,
        this.shesh_vasuli_rashi_at_sdo_level,
        this.sdo_adesh_kramank,
        this.sdo_adesh_dinank,
        this.listOfSupportiveDocumentsSDOSection
      ).subscribe(
        async (response) => {
          // 
          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {

            this.cdRef.detectChanges();
            this.sharedService.setRefresh(true);
            this.goBack();

          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          // 
          await this.dismissDialog();
          this.showError(error);
        }
      );

    } else {

      this.showDialog("कृपया प्रतीक्षा करें.....");
      this.cdRef.detectChanges();

      this.apiService.forward_complain_by_dfo(
        this.japt_saman_total_price_edited_by_sdo.toString(),
        this.found_vanopaj_total_price_edited_by_sdo.toString(),
        this.actual_loss_total_price_edited_by_sdo.toString(),
        this.mahsul_total_price_edited_by_sdo.toString(),
        this.mavja_total_price_edited_by_sdo.toString(),
        this.comingComplaintData.complain_history_table_id.toString(),
        this.comingComplaintData.complain_id.toString(),
        this.loginedOffierEmpId.toString(),
        this.sdoRemarkToAplekhitOrForwardToDFO.toString(),
        this.selectedPdfFile,
        this.shesh_vasuli_rashi_at_sdo_level.toString()
      ).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {

            this.cdRef.detectChanges();
            this.sharedService.setRefresh(true);
            this.goBack();

          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          //await this.dismissLoading();
          await this.dismissDialog();
          this.showError(error);
        }
      );

    }




  }

  submitByCCF() {

    if (this.selectedPdfFile === null) {
      this.showError("कृपया आदेश की प्रति चुने");
      return;
    }

    if (this.ccf_adesh_kramank === "") {
      this.showError("कृपया आदेश क्रमांक प्रेषित करें");
      return;
    }

    if (this.ccf_adesh_dinank === "") {
      this.showError("कृपया आदेश दिनांक प्रेषित करें");
      return;
    }

    if (this.sdoRemarkToAplekhitOrForwardToDFO === "") {
      this.showError(this.label_for_sdo_final_submission);
      return
    }


    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.cdRef.detectChanges();

    let selectedOptionByOfficer = "0";

    if (this.selectedRadioOption === "aplekhit") {
      selectedOptionByOfficer = "23";
    } else if (this.selectedRadioOption === "abhisandhan") {
      selectedOptionByOfficer = "22";
    }

    this.apiService.aplekhitOrAbhisandhancomplain_by_ccf(
      this.japt_saman_total_price_edited_by_ccf.toString(),
      this.found_vanopaj_total_price_edited_by_ccf.toString(),
      this.actual_loss_total_price_edited_by_ccf.toString(),
      this.mahsul_total_price_edited_by_ccf.toString(),
      this.mavja_total_price_edited_by_ccf.toString(),
      this.comingComplaintData.complain_history_table_id.toString(),
      this.comingComplaintData.complain_id.toString(),
      this.loginedOffierEmpId.toString(),
      this.sdoRemarkToAplekhitOrForwardToDFO.toString(),
      this.selectedPdfFile,
      selectedOptionByOfficer,
      this.shesh_vasuli_rashi_at_ccf_level.toString(),
      this.ccf_adesh_kramank,
      this.ccf_adesh_dinank
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.cdRef.detectChanges();
          this.sharedService.setRefresh(true);
          this.goBack();

        } else {
          this.showError(response.response.msg)
        }

      },
      async (error) => {
        await this.dismissDialog();
        this.showError(error);
      }
    );


  }

  submitByDfo() {

    if (this.selectedPdfFile === null) {
      this.showError("कृपया आदेश की प्रति चुने");
      return;
    }

    if (this.isForwardToCCF == false) {
      if (this.dfo_adesh_kramank === "") {
        this.showError("कृपया आदेश क्रमांक प्रेषित करें");
        return;
      }

      if (this.dfo_adesh_dinank === "") {
        this.showError("कृपया आदेश दिनांक प्रेषित करें");
        return;
      }
    }

    if (this.sdoRemarkToAplekhitOrForwardToDFO === "") {
      this.showError(this.label_for_sdo_final_submission);
      return
    }


    if (!this.isForwardToCCF) {

      this.showDialog("कृपया प्रतीक्षा करें.....");
      this.cdRef.detectChanges();

      let selectedOptionByOfficer = "0";

      if (this.selectedRadioOption === "aplekhit") {
        selectedOptionByOfficer = "7";
      } else if (this.selectedRadioOption === "abhisandhan") {
        selectedOptionByOfficer = "11";
      } else if (this.selectedRadioOption === "court_challan") {
        selectedOptionByOfficer = "12";
      }

      this.apiService.aplekhitOrAbhisandhanOrCourtChallan_complain_by_dfo(
        this.japt_saman_total_price_edited_by_dfo.toString(),
        this.found_vanopaj_total_price_edited_by_dfo.toString(),
        this.actual_loss_total_price_edited_by_dfo.toString(),
        this.mahsul_total_price_edited_by_dfo.toString(),
        this.mavja_total_price_edited_by_dfo.toString(),
        this.comingComplaintData.complain_history_table_id.toString(),
        this.comingComplaintData.complain_id.toString(),
        this.loginedOffierEmpId.toString(),
        this.sdoRemarkToAplekhitOrForwardToDFO.toString(),
        this.selectedPdfFile,
        selectedOptionByOfficer,
        this.shesh_vasuli_rashi_at_dfo_level.toString(),
        this.dfo_adesh_kramank,
        this.dfo_adesh_dinank
      ).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {

            this.cdRef.detectChanges();
            this.sharedService.setRefresh(true);
            this.goBack();

          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          //await this.dismissLoading();
          await this.dismissDialog();
          this.showError(error);
        }
      );

    } else {

      this.showDialog("कृपया प्रतीक्षा करें.....");
      this.cdRef.detectChanges();

      this.apiService.forward_complain_to_ccf_by_dfo(
        this.japt_saman_total_price_edited_by_dfo.toString(),
        this.found_vanopaj_total_price_edited_by_dfo.toString(),
        this.actual_loss_total_price_edited_by_dfo.toString(),
        this.mahsul_total_price_edited_by_dfo.toString(),
        this.mavja_total_price_edited_by_dfo.toString(),
        this.comingComplaintData.complain_history_table_id.toString(),
        this.comingComplaintData.complain_id.toString(),
        this.loginedOffierEmpId.toString(),
        this.sdoRemarkToAplekhitOrForwardToDFO.toString(),
        this.selectedPdfFile,
        this.shesh_vasuli_rashi_at_dfo_level.toString()
      ).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {

            this.cdRef.detectChanges();
            this.sharedService.setRefresh(true);
            this.goBack();

          } else {
            this.showError(response.response.msg)
          }

        },
        async (error) => {
          //await this.dismissLoading();
          await this.dismissDialog();
          this.showError(error);
        }
      );

    }

  }

  shouldShowSDOOrDFORemark(designatioId: string): boolean {
    if (this.comingComplaintData != undefined && Number(this.comingComplaintData.complain_progress_stage) >= 4) {

      if (this.porHistoryLogList.length > 0) {

        const result = this.porHistoryLogList
          .filter(item => Number(item.designation_id) === Number(designatioId))
          .sort((a, b) => {
            const dateA = new Date(a.complain_created_at);
            const dateB = new Date(b.complain_created_at);
            return dateB.getTime() - dateA.getTime(); // newest first
          })[0];

        if (result) {

          return true;
        }
      }

    }


    return false;

  }

  removeSupportiveDocSDOSection(index: number) {
    if (index > -1 && index < this.listOfSupportiveDocumentsSDOSection.length) {
      this.listOfSupportiveDocumentsSDOSection.splice(index, 1);
    }
  }

  listOfSupportiveDocumentsSDOSection: SupportiveDocumentsInterface[] = [];

  addSupportiveDocumentsSDOSection() {
    this.listOfSupportiveDocumentsSDOSection.push({
      document_file: null, document_title: '', designation_id: ''
    });
  }

  japt_saman_total_price_edited_by_sdo: string = "";
  found_vanopaj_total_price_edited_by_sdo: string = "";
  actual_loss_total_price_edited_by_sdo: string = "";
  mahsul_total_price_edited_by_sdo: string = "";
  mavja_total_price_edited_by_sdo: string = "";
  agreshan_patra_came_from_ro: string = "";

  mavja_mahsul_total_price_edited_by_sdo: string = "";
  shesh_vasuli_rashi_at_sdo_level = "";
  shesh_vasuli_rashi_at_sdo_level_clone = "";

  isAbleToSelectAdeshButtonSDOOrDFO: boolean = false;

  calcularSheshVasuliRashiAtSdoLevel() {

    this.mavja_mahsul_total_price_edited_by_sdo = (Number(this.mahsul_total_price_edited_by_sdo)
      + Number(this.mavja_total_price_edited_by_sdo)).toString();

    this.shesh_vasuli_rashi_at_sdo_level = (Number(this.mavja_mahsul_total_price_edited_by_sdo) - Number(this.totalVasuli)).toString();

    this.shesh_vasuli_rashi_at_sdo_level_clone = this.shesh_vasuli_rashi_at_sdo_level;

  }

  roWorkLog: any;
  getROWorkLog() {

    if (Number(this.comingComplaintData.complain_progress_stage) >= 4) {
      const roWorkLog = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 4 &&
          (
            item.actual_loss_total_price_edited !== "" ||
            item.mahsul_total_price_edited !== ""
          )
        )
        .sort((a, b) => Number(b.complain_history_table_id) - Number(a.complain_history_table_id))[0];

      this.japt_saman_total_price_edited_by_sdo = roWorkLog.japt_saman_total_price_edited;
      this.found_vanopaj_total_price_edited_by_sdo = roWorkLog.found_vanopaj_total_price_edited;
      this.actual_loss_total_price_edited_by_sdo = roWorkLog.actual_loss_total_price_edited;
      this.mahsul_total_price_edited_by_sdo = roWorkLog.mahsul_total_price_edited;
      this.mavja_total_price_edited_by_sdo = roWorkLog.mavja_total_price_edited;
      this.calcularSheshVasuliRashiAtSdoLevel();

      this.agreshan_patra_came_from_ro = roWorkLog.agreshan_patra;

      this.roWorkLog = roWorkLog;

      let totalMajvaMahsul = (Number(roWorkLog.mahsul_total_price_edited) + Number(roWorkLog.mavja_total_price_edited));

      if (totalMajvaMahsul > 0) {

        this.sheshRashiForVasuliAtROLevelToShow = Number(totalMajvaMahsul) - (Number(this.agrim_vasuli_money) + Number(this.total_vasuli_rashi_after_adesh));

        //this.sheshRashiForVasuli = Number(totalMajvaMahsul) - Number(this.totalVasuli);
      }


      let forAdesh = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 4 &&
          (
            item.action_taken_by_stage_officer_like_sdo_dfo == "6" ||
            item.action_taken_by_stage_officer_like_sdo_dfo == "9"
          )
        )[0];


      if (forAdesh != undefined) {
        if (forAdesh.action_taken_by_stage_officer_like_sdo_dfo == "6") {
          this.sdoAdesh = "अपलेखित";
        } else if (forAdesh.action_taken_by_stage_officer_like_sdo_dfo == "9") {
          this.sdoAdesh = "अभिसन्धानित";
        } else if (forAdesh.action_taken_by_stage_officer_like_sdo_dfo == "5") {
          this.sdoAdesh = "वनमंडलाधिकारी को सम्प्रेषित";
        }

      }


      let forAdeshDfo = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 3 &&
          (
            item.action_taken_by_stage_officer_like_sdo_dfo == "7" ||
            item.action_taken_by_stage_officer_like_sdo_dfo == "11"
          )
        )[0];

      if (forAdeshDfo != undefined) {
        if (forAdeshDfo.action_taken_by_stage_officer_like_sdo_dfo == "7") {
          this.dfoAdesh = "अपलेखित";
        } else if (forAdeshDfo.action_taken_by_stage_officer_like_sdo_dfo == "11") {
          this.dfoAdesh = "अभिसन्धानित";
        }

      }


      //
      let forAdeshCCF = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 2 &&
          (
            item.action_taken_by_stage_officer_like_sdo_dfo == "22" ||
            item.action_taken_by_stage_officer_like_sdo_dfo == "23"
          )
        )[0];


      if (forAdeshCCF != undefined) {
        if (forAdeshCCF.action_taken_by_stage_officer_like_sdo_dfo == "23") {
          this.ccfAdesh = "अपलेखित";
        } else if (forAdeshCCF.action_taken_by_stage_officer_like_sdo_dfo == "22") {
          this.ccfAdesh = "अभिसन्धानित";
        }

      }


    }

  }

  async showPdfViewerDialog(pdfName: string) {
    let pdfUrl = this.filePath + "/" + pdfName;

    this.router.navigateByUrl('/pdf_viewer_component', {
      state: { pdf_url: pdfUrl },
      replaceUrl: false
    });

  }

  japt_saman_total_price_edited_by_dfo: string = "";
  found_vanopaj_total_price_edited_by_dfo: string = "";
  actual_loss_total_price_edited_by_dfo: string = "";
  mahsul_total_price_edited_by_dfo: string = "";
  mavja_total_price_edited_by_dfo: string = "";
  sdo_adesh_ki_prati: string = "";

  mavja_mahsul_total_price_edited_by_dfo: string = "";
  shesh_vasuli_rashi_at_dfo_level = "";

  shesh_vasuli_rashi_at_dfo_level_clone = "";

  calcularSheshVasuliRashiAtDfoLevel() {
    // 
    this.mavja_mahsul_total_price_edited_by_dfo = (Number(this.mahsul_total_price_edited_by_dfo)
      + Number(this.mavja_total_price_edited_by_dfo)).toString();

    this.shesh_vasuli_rashi_at_dfo_level = (Number(this.mavja_mahsul_total_price_edited_by_dfo) - Number(this.totalVasuli)).toString();

    this.shesh_vasuli_rashi_at_dfo_level_clone = this.shesh_vasuli_rashi_at_dfo_level;

  }

  getAdeshText(adeshId: string): string {

    if (adeshId === "6" || adeshId === "7") {
      return "अपलेखित";
    }
    if (adeshId === "9" || adeshId === "11") {
      return "अभिसन्धान";
    }

    return "";
  }

  sdoWorkLog: any;
  getSDOWorkLog() {


    if (Number(this.comingComplaintData.complain_progress_stage) >= 4) {
      const sdoWorkLog = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 3 &&
          (
            item.actual_loss_total_price_edited !== "" ||
            item.mahsul_total_price_edited !== ""
          )
        )
        .sort((a, b) => {
          const dateA = new Date(a.complain_created_at);
          const dateB = new Date(b.complain_created_at);
          return dateB.getTime() - dateA.getTime(); // newest first
        })[0];

      if (sdoWorkLog != undefined) {


        this.japt_saman_total_price_edited_by_dfo = sdoWorkLog?.japt_saman_total_price_edited;
        this.found_vanopaj_total_price_edited_by_dfo = sdoWorkLog?.found_vanopaj_total_price_edited;
        this.actual_loss_total_price_edited_by_dfo = sdoWorkLog?.actual_loss_total_price_edited;
        this.mahsul_total_price_edited_by_dfo = sdoWorkLog?.mahsul_total_price_edited;
        this.mavja_total_price_edited_by_dfo = sdoWorkLog?.mavja_total_price_edited;
        this.sdo_adesh_ki_prati = sdoWorkLog.agreshan_patra;

        this.calcularSheshVasuliRashiAtDfoLevel();


        this.sdoWorkLog = sdoWorkLog;

        let totalMajvaMahsul = (Number(sdoWorkLog.mahsul_total_price_edited) + Number(sdoWorkLog.mavja_total_price_edited));

        if (totalMajvaMahsul > 0) {

          this.sheshRashiForVasuliAtSDOLevelToShow = Number(totalMajvaMahsul) - (Number(this.agrim_vasuli_money) + Number(this.total_vasuli_rashi_after_adesh));

        }



      } else {
        if (Number(this.comingComplaintData.complain_progress_stage) == 20) {
          const sdoWorkLog = this.porHistoryLogList
            .filter(item => Number(item.designation_id) === 4 &&
              (
                item.actual_loss_total_price_edited !== "" ||
                item.mahsul_total_price_edited !== ""
              )
            )
            .sort((a, b) => Number(b.complain_history_table_id) - Number(a.complain_history_table_id))[0];

          this.japt_saman_total_price_edited_by_dfo = sdoWorkLog?.japt_saman_total_price_edited;
          this.found_vanopaj_total_price_edited_by_dfo = sdoWorkLog?.found_vanopaj_total_price_edited;
          this.actual_loss_total_price_edited_by_dfo = sdoWorkLog?.actual_loss_total_price_edited;
          this.mahsul_total_price_edited_by_dfo = sdoWorkLog?.mahsul_total_price_edited;
          this.mavja_total_price_edited_by_dfo = sdoWorkLog?.mavja_total_price_edited;
          this.sdo_adesh_ki_prati = sdoWorkLog.agreshan_patra;

          this.calcularSheshVasuliRashiAtDfoLevel();


          this.sdoWorkLog = sdoWorkLog;

          let totalMajvaMahsul = (Number(sdoWorkLog.mahsul_total_price_edited) + Number(sdoWorkLog.mavja_total_price_edited));

          if (totalMajvaMahsul > 0) {

            this.sheshRashiForVasuliAtSDOLevelToShow = Number(totalMajvaMahsul) - (Number(this.agrim_vasuli_money) + Number(this.total_vasuli_rashi_after_adesh));

          }

        }
      }

    }

  }

  agimVasuliCheckForDate: string = "";

  dfoWorkLog: any;
  dfo_adesh_ki_prati: string = "";


  ccfWorkLog: any;
  japt_saman_total_price_edited_by_ccf: string = "";
  found_vanopaj_total_price_edited_by_ccf: string = "";
  actual_loss_total_price_edited_by_ccf: string = "";
  mahsul_total_price_edited_by_ccf: string = "";
  mavja_total_price_edited_by_ccf: string = "";
  mavja_mahsul_total_price_edited_by_ccf: Number = 0;
  shesh_vasuli_rashi_at_ccf_level: Number = 0;
  shesh_vasuli_rashi_at_ccf_level_clone: Number = 0;
  ccf_adesh_ki_prati: string = "";

  calcularSheshVasuliRashiAtCCFLevel() {

    this.mavja_mahsul_total_price_edited_by_ccf = (Number(this.mahsul_total_price_edited_by_ccf)
      + Number(this.mavja_total_price_edited_by_ccf));

    this.shesh_vasuli_rashi_at_ccf_level = (Number(this.mavja_mahsul_total_price_edited_by_ccf) - Number(this.totalVasuli));

    this.shesh_vasuli_rashi_at_ccf_level_clone = this.shesh_vasuli_rashi_at_ccf_level;

  }

  getDFOWorkLog() {


    if (Number(this.comingComplaintData.complain_progress_stage) >= 4) {
      const dfoWorkLog = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 2 &&
          (
            item.actual_loss_total_price_edited !== "" ||
            item.mahsul_total_price_edited !== ""
          )
        )
        .sort((a, b) => {
          const dateA = new Date(a.complain_created_at);
          const dateB = new Date(b.complain_created_at);
          return dateB.getTime() - dateA.getTime(); // newest first
        })[0];
      if (dfoWorkLog != undefined) {

        this.dfoWorkLog = dfoWorkLog;

        this.japt_saman_total_price_edited_by_ccf = dfoWorkLog?.japt_saman_total_price_edited;
        this.found_vanopaj_total_price_edited_by_ccf = dfoWorkLog?.found_vanopaj_total_price_edited;
        this.actual_loss_total_price_edited_by_ccf = dfoWorkLog?.actual_loss_total_price_edited;
        this.mahsul_total_price_edited_by_ccf = dfoWorkLog?.mahsul_total_price_edited;
        this.mavja_total_price_edited_by_ccf = dfoWorkLog?.mavja_total_price_edited;
        this.dfo_adesh_ki_prati = dfoWorkLog.agreshan_patra;

        this.calcularSheshVasuliRashiAtCCFLevel();

        let totalMajvaMahsul = (Number(dfoWorkLog.mahsul_total_price_edited) + Number(dfoWorkLog.mavja_total_price_edited));

        if (totalMajvaMahsul > 0) {

          this.sheshRashiForVasuliAtDFOLevelToShow = Number(totalMajvaMahsul) - (Number(this.agrim_vasuli_money) + Number(this.total_vasuli_rashi_after_adesh));

        }

      }

    }

  }




  getCCFWorkLog() {


    if (Number(this.comingComplaintData.complain_progress_stage) >= 4) {
      const ccfWorkLog = this.porHistoryLogList
        .filter(item => Number(item.designation_id) === 1 &&
          (
            item.actual_loss_total_price_edited !== "" ||
            item.mahsul_total_price_edited !== ""
          )
        )
        .sort((a, b) => {
          const dateA = new Date(a.complain_created_at);
          const dateB = new Date(b.complain_created_at);
          return dateB.getTime() - dateA.getTime(); // newest first
        })[0];
      if (ccfWorkLog != undefined) {

        this.ccfWorkLog = ccfWorkLog;

        this.ccf_adesh_ki_prati = ccfWorkLog.agreshan_patra;

        let totalMajvaMahsul = (Number(ccfWorkLog.mahsul_total_price_edited) + Number(ccfWorkLog.mavja_total_price_edited));

        if (totalMajvaMahsul > 0) {

          this.sheshRashiForVasuliAtCCFLevelToShow = Number(totalMajvaMahsul) - (Number(this.agrim_vasuli_money) + Number(this.total_vasuli_rashi_after_adesh));

        }

      }

    }

  }







  async nastibadhKeLiyeAnurodh() {

    let msg = "";

    if (this.loginedOfficerDesignationId === 4) {
      msg = "यह पी.ओ.आर. नस्तीबद्ध के लिए उपवनमंडलाधिकारी को भेजा जाना है| क्या आप सुनिश्चित हैं?";
    }

    if (this.loginedOfficerDesignationId === 3) {
      msg = "यह पी.ओ.आर. नस्तीबद्ध के लिए वनमंडलाधिकारी को भेजा जाना है| क्या आप सुनिश्चित हैं?";
    }

    const modal = await this.modalCtrl.create({
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
        if (this.loginedOfficerDesignationId === 4) {
          this.sendReqestToServerForNastibadhaFromROToSDO();
        } else if (this.loginedOfficerDesignationId === 3) {
          this.sendReqestToServerForNastibadhaFromSDOToDFO();
        }
      }
    });

    await modal.present();

  }

  sendReqestToServerForNastibadhaFromSDOToDFO() {
    // 
    let sdoOrDFo = "dfo";
    //let sendTo  = this.dfoWorkLog.created_by_at_history_table;;

    this.showDialog("कृपया प्रतीक्षा करें");
    // 
    this.apiService.requestForNastibadhFromSDOToDFO(this.comingComplaintData.complain_id,
      this.loginedOffierEmpId.toString(),
      this.comingComplaintData.complain_history_table_id.toString(),
      sdoOrDFo).subscribe(
        (response) => {
          this.dismissDialog();
          // 
          if (response.response.code === 200) {
            this.sharedService.setRefresh(true);
            this.goBack();
          } else {
            this.showError(response.response.msg);
          }

        },
        (error) => {
          // 
          this.dismissDialog();
        }
      );

  }

  sendReqestToServerForNastibadhaFromROToSDO() {
    // 

    let sdoOrDFo = "sdo";
    let sendTo = "";

    if (this.sdoWorkLog != undefined) {
      sendTo = this.sdoWorkLog.created_by_at_history_table;
    } else {
      const emp = this.listOfSDOAndDFO.find(x => x.designation_id === "3");
      if (emp) {
        sendTo = emp.emp_id.toString();
      }

    }

    if (sendTo === "") {
      this.showDialog("नस्तीबद्ध हेतु उप वनमंडलाधिकारी को भेजने में समस्या आ रही है ");
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें");
    // 
    this.apiService.requestForNastibadhFromROToSDO(this.comingComplaintData.complain_id,
      this.loginedOffierEmpId.toString(),
      this.comingComplaintData.complain_history_table_id.toString(),
      sdoOrDFo, sendTo).subscribe(
        (response) => {
          this.dismissDialog();
          // 
          if (response.response.code === 200) {
            this.sharedService.setRefresh(true);
            this.goBack();
          } else {
            this.showError(response.response.msg);
          }

        },
        (error) => {
          // 
          this.dismissDialog();
        }
      );

  }


  async onSelecteSDO_AdeshDinank() {

    const modal = await this.modalCtrl.create({
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
        this.sdo_adesh_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

  async onSelecteDFO_AdeshDinank() {

    const modal = await this.modalCtrl.create({
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
        this.dfo_adesh_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

  async onSelecteCCF_AdeshDinank() {

    const modal = await this.modalCtrl.create({
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
        this.ccf_adesh_dinank = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }



  totalVahanDetailWithNumberFor_VisayTitle: string = "";

  isShowPradhikritAdhikariKoSuchnaPDF() {

    if (this.comingComplaintData.is_japt_vahan === "1" && (this.isRO || this.isSDO || this.isDFO)) {
      return true;
    }

    return false;

  }

  isShowMajistretSuchnaPDF() {

    if (this.comingComplaintData.is_japt_vahan === "1" && (this.isSDO || this.isDFO)) {
      return true;
    }

    return false;

  }

  async generatePdfForMajistret() {

    // let accusedSection: any;
    // 
    // (pdfMake as any).vfs = mergedVfs;

    // (pdfMake as any).fonts = {
    //   NotoSansDevanagari: {
    //     normal: 'NotoSansDevanagari-Regular.ttf',
    //     bold: 'NotoSansDevanagari-Bold.ttf',
    //     italics: 'NotoSansDevanagari-Regular.ttf',
    //     bolditalics: 'NotoSansDevanagari-Regular.ttf'
    //   }
    // };

    // if (this.comingComplaintData.accused_count === 0) {

    //   const accusedTableBody = [
    //     [
    //       { text: 'क्रमांक', bold: true },
    //       { text: 'मुजरिम का नाम', bold: true },
    //       { text: 'पिता का नाम', bold: true },
    //       { text: 'जाति', bold: true },
    //       { text: 'पता', bold: true }
    //     ],
    //     [
    //       1,
    //       'अज्ञात',
    //       'अज्ञात',
    //       'अज्ञात',
    //       'अज्ञात'
    //     ]
    //   ];

    //   accusedSection = {
    //     stack: [
    //       {
    //         table: {
    //           headerRows: 1,
    //           widths: ['auto', '*', '*', '*', '*'],
    //           body: accusedTableBody
    //         },
    //         margin: [0, 0, 0, 10]
    //       }
    //     ]
    //   };

    // } else {
    //   const accusedTableBody = [
    //     [
    //       { text: 'क्रमांक', bold: true },
    //       { text: 'मुजरिम का नाम', bold: true },
    //       { text: 'पिता का नाम', bold: true },
    //       { text: 'जाति', bold: true },
    //       { text: 'पता', bold: true }
    //     ],

    //     ...this.accusedPersons.map((a: any, index: number) => [
    //       index + 1,
    //       a.name || '',
    //       a.fathersName || '',
    //       a.cast || '',
    //       a.address || ''
    //     ])
    //   ];

    //   accusedSection = {
    //     stack: [
    //       {
    //         table: {
    //           headerRows: 1,
    //           widths: ['auto', '*', '*', '*', '*'],
    //           body: accusedTableBody
    //         },
    //         margin: [0, 0, 0, 10]
    //       }
    //     ]
    //   };

    // }

    // const accusedSectionBody1 = JSON.parse(JSON.stringify(accusedSection));
    // const accusedSectionBody2 = JSON.parse(JSON.stringify(accusedSection));

    // const balliItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'बल्ली');
    // const kasthItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'लट्ठा');
    // const chiranItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चिरान');
    // const chattaItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'चट्टा');
    // const anyaJaptSamanItems = this.listOfjaptiSaman.filter(item => item.actual_name_of_saman === 'अन्य जप्त सामान');

    // const japtVahanHeader = [
    //   { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
    //   { text: 'वाहन क्रमांक', bold: true },
    //   { text: 'अनुमानित मूल्य', bold: true },
    //   { text: 'मालिक का नाम', bold: true },
    //   { text: 'पिता का नाम', bold: true },
    //   { text: 'पूरा पता', bold: true },
    //   { text: 'तहसील', bold: true },
    //   { text: 'जिला', bold: true },
    // ];

    // const japtVahanHeader2 = [
    //   { text: 'वाहन का प्रकार / मॉडल / विवरण', bold: true },
    //   { text: 'वाहन क्रमांक', bold: true },
    //   { text: 'अनुमानित मूल्य', bold: true },
    //   { text: 'मालिक का नाम', bold: true },
    //   { text: 'पिता का नाम', bold: true },
    //   { text: 'पूरा पता', bold: true },
    //   { text: 'तहसील', bold: true },
    //   { text: 'जिला', bold: true },
    // ];

    // const buildjaptVahanBody = (items: any[] = []) => [
    //   japtVahanHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.vahan_prakar || '',
    //     item.vahan_kramank || '',
    //     item.anumanit_mulya || '',
    //     item.malik_name || '',
    //     item.pita_ka_name || '',
    //     item.pata || '',
    //     item.tahsil || '',
    //     item.jila || '',
    //   ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
    // ];

    // const buildjaptVahanBody2 = (items: any[] = []) => [
    //   japtVahanHeader2,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.vahan_prakar || '',
    //     item.vahan_kramank || '',
    //     item.anumanit_mulya || '',
    //     item.malik_name || '',
    //     item.pita_ka_name || '',
    //     item.pata || '',
    //     item.tahsil || '',
    //     item.jila || '',
    //   ]) : [['-', 0, 0, 0, 0, 0, 0, 0]])
    // ];

    // const anyaJaptSamanHeader = [
    //   { text: 'सामग्री का विवरण', bold: true },
    //   { text: 'संख्या', bold: true },
    //   { text: 'मात्रा (घन मीटर)', bold: true },
    //   { text: 'अनुमानित मूल्य', bold: true },
    // ];

    // const buildAnyaJaptSamanBody = (items: any[] = []) => [
    //   anyaJaptSamanHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.if_other_then_detail || '',
    //     item.nag || 0,
    //     item.ghan_meter || 0,
    //     item.total_cost || 0
    //   ]) : [['-', 0, 0, 0]]) // default row if empty
    // ];

    // const chattaHeader = [
    //   { text: 'प्रजाति का नाम', bold: true },
    //   { text: 'चट्टा संख्या', bold: true },
    //   { text: 'दर', bold: true },
    //   { text: 'कुल राशि', bold: true }
    // ];

    // const buildChattaBody = (items: any[] = []) => [
    //   chattaHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.prajati_name || '',
    //     item.nag || 0,
    //     item.dar || 0,
    //     item.total_cost || 0
    //   ]) : [['-', 0, 0, 0]]) // default row if empty
    // ];

    // const balliHeader = [
    //   { text: 'प्रजाति का नाम', bold: true },
    //   { text: 'लम्बाई वर्ग(मी.)', bold: true },
    //   { text: 'गोलाई वर्ग(से.मी.)', bold: true },
    //   { text: 'संख्या', bold: true },
    //   { text: 'दर', bold: true },
    //   { text: 'कुल राशि', bold: true }
    // ];

    // const buildballiBody = (items: any[] = []) => [
    //   balliHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.prajati_name || '',
    //     item.lambai || 0,
    //     item.golai || 0,
    //     item.nag || 0,
    //     item.dar || 0,
    //     item.total_cost || 0
    //   ]) : [['-', 0, 0, 0, 0, 0]]) // default row if empty
    // ];

    // const chiranHeader = [
    //   { text: 'प्रजाति का नाम', bold: true },
    //   { text: 'लम्बाई(मी.)', bold: true },
    //   { text: 'चौड़ाई(सें.मी.)', bold: true },
    //   { text: 'मोटाई(सें.मी.)', bold: true },
    //   { text: 'संख्या', bold: true },
    //   { text: 'आयतन(घ.मी.)', bold: true },
    //   { text: 'दर', bold: true },
    //   { text: 'कुल राशि', bold: true }
    // ];

    // const buildChiranBody = (items: any[] = []) => [
    //   chiranHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.prajati_name || '',
    //     item.lambai || 0,
    //     item.golai || 0,
    //     item.motai || 0,
    //     item.nag || 0,
    //     item.ghan_meter || 0,
    //     item.dar || 0,
    //     item.total_cost || 0
    //   ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    // ];

    // const kasthHeader = [
    //   { text: 'प्रजाति का नाम', bold: true },
    //   { text: 'हालात', bold: true },
    //   { text: 'लम्बाई(मी.)', bold: true },
    //   { text: 'गोलाई(सें.मी.)', bold: true },
    //   { text: 'संख्या', bold: true },
    //   { text: 'आयतन(घ.मी.)', bold: true },
    //   { text: 'दर', bold: true },
    //   { text: 'कुल राशि', bold: true }
    // ];

    // const buildKasthBody = (items: any[] = []) => [
    //   kasthHeader,
    //   ...(items.length > 0 ? items.map(item => [
    //     item.prajati_name || '',
    //     item.kasth_halat_name || 0,
    //     item.lambai || 0,
    //     item.golai || 0,
    //     item.nag || 0,
    //     item.ghan_meter || 0,
    //     item.dar || 0,
    //     item.total_cost || 0
    //   ]) : [['-', 0, 0, 0, 0, 0, 0, 0]]) // default row if empty
    // ];

    // const contentOfJaptiSaman: any[] = [];

    // if (kasthItems && kasthItems.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'लट्ठा का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
    //         body: buildKasthBody(kasthItems)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल लट्ठा संख्या : ', style: 'subheader', bold: true },
    //         { text: this.totalKashthNag + ',   ' },
    //         { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
    //         { text: this.totalKashthGhanMeter + ',   ' },
    //         { text: 'कुल राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalKashthRashi }
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // if (balliItems && balliItems.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'बल्ली का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*', '*', 60],
    //         body: buildballiBody(balliItems)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल बल्ली संख्या : ', style: 'subheader', bold: true },
    //         { text: this.totalBalliNag + ',   ' },
    //         { text: 'कुल राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalBalliRashi }
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // // चिरान का विवरण
    // if (chiranItems && chiranItems.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'चिरान का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*', '*', 'auto', 'auto', 60],
    //         body: buildChiranBody(chiranItems)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल चिरान संख्या : ', style: 'subheader', bold: true },
    //         { text: this.totalChiranNag + ',   ' },
    //         { text: 'कुल आयतन (घ.मी.) : ', style: 'subheader', bold: true },
    //         { text: this.totalChiranGhanMeter + ',   ' },
    //         { text: 'कुल राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalChiranRashi }
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // // जलाऊ का विवरण
    // if (chattaItems && chattaItems.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'जलाऊ का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*'],
    //         body: buildChattaBody(chattaItems)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल चट्टा संख्या : ', style: 'subheader', bold: true },
    //         { text: this.totalChattaNag + ',   ' },
    //         { text: 'कुल राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalChattaRashi },
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // // अन्य जप्त सामग्री का विवरण
    // if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'अन्य जप्त सामग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*'],
    //         body: buildAnyaJaptSamanBody(anyaJaptSamanItems)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल संख्या : ', style: 'subheader', bold: true },
    //         { text: this.totalOtherJaptSamanNag + ',   ' },
    //         { text: 'कुल आयतन(घ.मी.) : ', style: 'subheader', bold: true },
    //         { text: this.totalOtherJaptSamanGhanMeter + ',   ' },
    //         { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalAnumanitRashi },
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {
    //   contentOfJaptiSaman.push(
    //     { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
    //         body: buildjaptVahanBody(this.listOfJaptVahanDetail)
    //       }
    //     },
    //     {
    //       text: [
    //         { text: 'कुल अनुमानित राशि : ', style: 'subheader', bold: true },
    //         { text: this.totalVahanPrice },
    //       ]
    //     },
    //     { text: '\n' }
    //   );
    // }

    // const docDefinition: any = {
    //   content: [
    //     {
    //       text: [
    //         'प्राधिकृत अधिकारी द्वारा न्यायिक दण्डधिकारी को सम्पत्ति के अधिग्रहण के लिए कार्यवाही प्रारम्भ करने के बारे में धारा 52 (4) के अधीन सूचना'
    //       ],
    //       style: 'title'
    //     },

    //     {
    //       text: "कार्यालय : ______________________________________________________________________"
    //     },

    //     {
    //       columns: [
    //         { text: ['क्रमांक : ', { text: this.comingComplaintData.sdo_patra_kramank, bold: true }], alignment: 'left' },
    //         { text: ['स्थान : __________________'], alignment: 'center' },
    //         { text: ['दिनांक : ', { text: this.convertDateString(this.comingComplaintData.sdo_patra_dinank), bold: true }], alignment: 'right' },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n' },

    //     {
    //       text: "प्रति"
    //     },

    //     { text: '\n' },

    //     {
    //       text: [
    //         "न्यायिक दण्डाधिकारी\n",
    //         "__________________"
    //       ],
    //       margin: [40, 0, 0, 0]
    //     },

    //     { text: '\n' },

    //     {
    //       text: [
    //         "विषय : प्रथम अपराध सूचना क्रमांक ",
    //         { text: this.por_number, bold: true },
    //         { text: " दिनांक " }, { text: this.crimeDate, bold: true },
    //         { text: " में प्रयुक्त वाहन " },
    //         { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
    //         { text: " को राजसात करने की कार्यवाही प्रारम्भ करने की सूचना | " },
    //       ]
    //     },
    //     { text: '\n' },
    //     {
    //       text: [
    //         { text: " निवेदन है कि मैंने " },
    //         { text: this.crime_dhara, bold: true },
    //         { text: " की धारा के अनुसार वन अपराध में प्रयुक्त होने वाली " },
    //         { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
    //         { text: " को राजसात करने की कार्यवाही प्रारम्भ कर दी है , जिसकी सूचना निम्न विवरण में दी जा रही है  : " }
    //       ],

    //       //margin: [40, 0, 0, 0]

    //     },


    //     { text: '\n' },

    //     { text: '1. (अ) उस वस्तु का विवरण जिसको राजसात किया जाना प्रस्तावित है | ' },

    //     { text: '\n' },

    //     contentOfJaptiSaman,

    //     { text: '\n' },

    //     { text: '2. जप्त शुदा वस्तु के मालिक का विवरण : ' },

    //     { text: '\n' },

    //     {
    //       margin: [0, 0, 0, 10],
    //       table: {
    //         headerRows: 1,
    //         widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
    //         body: buildjaptVahanBody2(this.listOfJaptVahanDetail)
    //       }
    //     },

    //     { text: '3. उस व्यक्ति का नाम / पिता का नाम , निवासी जिससे कॉलम (अ) में दर्शाई संपत्ति जप्त की गई : ' },

    //     { text: '\n' },

    //     accusedSectionBody1,

    //     {
    //       columns: [
    //         { text: ['4. जप्ती का दिनांक , समय व स्थान : '] },
    //         {
    //           text: [
    //             { text: this.crimeDate, bold: true }, " , ",
    //             { text: this.crimePlace, bold: true }]
    //           , alignment: 'right'
    //         },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n' },

    //     {
    //       columns: [
    //         { text: ['5. उस अधिकारी का नाम व पद जिसने ऊपर वर्णित वस्तु जप्त की : '] },
    //         {
    //           text: [
    //             { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }]
    //           , alignment: 'right'
    //         },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n' },

    //     {
    //       columns: [
    //         { text: ['6. जप्त शुदा वस्तु का अनुमानित मूल्य : '] },
    //         {
    //           text: [
    //             { text: this.total_anumanit_mulya_vahan_plus_vanoj, bold: true }]
    //           , alignment: 'right'
    //         },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n' },

    //     {
    //       columns: [
    //         { text: ['7. अपराध / अपराधों का विवरणमय धारा व अधिनियम जिनके अंतर्गत अपराध हुआ है : '] },
    //         {
    //           text: [
    //             { text: this.crime_dhara, bold: true }]
    //           , alignment: 'right'
    //         },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n' },
    //     {
    //       columns: [
    //         { text: ['8. सूचना प्रेषण का दिनांक : '] },
    //         {
    //           text: [
    //             { text: this.comingComplaintData.sdo_patra_dinank, bold: true }]
    //           , alignment: 'right'
    //         },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //     { text: '\n\n\n' },

    //     {
    //       columns: [
    //         { text: [{ text: 'प्राधिकृत अधिकारी', bold: true }], alignment: 'right' },
    //       ],
    //       margin: [0, 10, 0, 0]
    //     },

    //   ],
    //   styles: {
    //     title: {
    //       fontSize: 18,
    //       bold: true,
    //       alignment: 'center',
    //       margin: [0, 0, 0, 5]
    //     },
    //     subTitle: {
    //       fontSize: 14,
    //       alignment: 'center',
    //       margin: [0, 0, 0, 10]
    //     },
    //     section: {
    //       bold: true,
    //       margin: [0, 10, 0, 2]
    //     }
    //   },
    //   defaultStyle: {
    //     font: 'NotoSansDevanagari',
    //     fontSize: 12
    //   }

    // }

    // if (this.platForm.is('desktop')) {

    //   pdfMake.createPdf(docDefinition).download("न्यायिक_दण्डाधिकारी_को_सूचना_PDF" + this.comingComplaintData.por_number + '.pdf');

    // } else if (this.platForm.is('android')) {

    //   await this.checkAndRequestStoragePermission();

    //   pdfMake.createPdf(docDefinition);

    // }

    let accusedSection: any;
    // 
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
          { text: 'उम्र', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],
        [
          1,
          'अज्ञात',
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
              widths: ['auto', '*', '*', 'auto', '*', '*'],
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
          { text: 'उम्र', bold: true },
          { text: 'जाति', bold: true },
          { text: 'पता', bold: true }
        ],

        ...this.accusedPersons.map((a: any, index: number) => [
          index + 1,
          a.name || '',
          a.fathersName || '',
          a.age || '',
          a.cast || '',
          a.address || ''
        ])
      ];

      accusedSection = {
        stack: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', '*', '*'],
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
      { text: 'सामाग्री का विवरण', bold: true },
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
        { text: 'अन्य जप्त सामाग्री का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
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

    if (anyaJaptSamanItems && anyaJaptSamanItems.length > 0) {
      // 
      let totalOtherJaptSaman = "";

      for (let itemIndex = 0; itemIndex < anyaJaptSamanItems.length; itemIndex++) {

        let japtVahan = anyaJaptSamanItems[itemIndex];

        totalOtherJaptSaman =
          totalOtherJaptSaman + ' सामग्री का विवरण : ' + japtVahan.if_other_then_detail + ' , संख्या (नग) : ' + japtVahan.nag + ' , मात्रा (घन मीटर) : ' + japtVahan.ghan_meter + ' , अनुमानित मूल्य : ' + japtVahan.total_cost;

      }

      goswara.push(

        {
          text: [
            { text: 'अन्य जप्त सामान : ' },
            { text: totalOtherJaptSaman, bold: true }
          ],

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
            { text: this.comingComplaintData.sub_division_name }
          ],
          style: 'title'
        },

        {
          columns: [
            { text: ['क्रमांक : ', { text: this.comingComplaintData.sdo_patra_kramank, bold: true }], alignment: 'left' },
            { text: [{ text: this.comingComplaintData.sub_division_name }, ', दिनांक : ', { text: this.convertDateString(this.comingComplaintData.sdo_patra_dinank), bold: true }], alignment: 'right' },
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
            { text: this.comingComplaintData.nayayalay_sthan }
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

        },


        { text: '\n' },

        { text: ['1 (अ) उस वस्तु का विवरण जिसको राजसात किया जाना प्रस्तावित है : '] },
        { text: '\n' },
        goswara,

        { text: ['(ब) उन परिस्थितियों का संक्षिप्त विवरण जिसमे वह जप्त की गई : '] },
        { text: '\n' },
        { text: this.comingComplaintData.sdo_sankhipt_vivran, bold: true },

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
                { text: this.comingComplaintData.sdo_patra_dinank, bold: true }
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

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download("न्यायिक_दण्डाधिकारी_को_सूचना_PDF" + this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition);

    }


  }

  getTotalVanopajRashi() {
    // 
    const kashRashi = this.kasthItemsList
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const balliRashi = this.balliItemsList
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const chiranRashi = this.chiranItemsList
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const jalauRashi = this.chattaItemsList
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const totalAnyJaptSamanRashi = this.OtherJaptItemsList
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    let totalVanopajRashi = (kashRashi + chiranRashi + jalauRashi + balliRashi + totalAnyJaptSamanRashi).toFixed(0);

    // 
    this.totalVahanPrice = this.listOfJaptVahanDetail.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );

    this.total_anumanit_mulya_vahan_plus_vanoj = Number(totalVanopajRashi) + this.totalVahanPrice;

  }

  total_anumanit_mulya_vahan_plus_vanoj: number = 0;

  // async generatePdfForPradhikritAdhikari() {

  //   let accusedSection: any;
  //   
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
  //         { text: 'मुजरिम का नाम', bold: true },
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
  //         { text: 'मुजरिम का नाम', bold: true },
  //         { text: 'पिता का नाम', bold: true },
  //         { text: 'जाति', bold: true },
  //         { text: 'पता', bold: true }
  //       ],

  //       ...this.accusedPersons.map((a: any, index: number) => [
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

  //   if (this.listOfJaptVahanDetail && this.listOfJaptVahanDetail.length > 0) {



  //     contentOfJaptiSaman.push(
  //       { text: 'जप्त वाहन का विवरण', style: 'subheader', bold: true, margin: [0, 0, 0, 0] },
  //       {
  //         margin: [0, 0, 0, 10],
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
  //           body: buildjaptVahanBody(this.listOfJaptVahanDetail)
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

  //   const docDefinition: any = {
  //     content: [
  //       {
  //         text: [
  //           'कार्यालय, वन परिक्षेत्र अधिकारी - ',
  //           { text: this.comingComplaintData.range_name }
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
  //         columns: [
  //           { text: ['क्रमांक : ', { text: this.comingComplaintData.patra_kramank, bold: true }] },
  //           { text: ['दिनांक : ', { text: this.convertDateString(this.comingComplaintData.pratra_dinank), bold: true }], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       {
  //         canvas: [
  //           { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }
  //         ],
  //         margin: [0, 10, 0, 10]
  //       },

  //       { text: '\n' },

  //       {
  //         text: "प्रति"
  //       },

  //       { text: '\n' },

  //       {
  //         text: [
  //           "प्राधिकृत अधिकारी एवं\n",
  //           "उपवनमंडलाधिकारी ",
  //           { text: this.comingComplaintData.sub_division_name }
  //         ],
  //         margin: [40, 0, 0, 0] // left, top, right, bottom
  //       },

  //       { text: '\n' },

  //       {
  //         text: [
  //           "विषय : ",
  //           { text: this.comingComplaintData.crime_type, bold: true },
  //           { text: " वन अपराध प्रकरण में लिप्त " }, { text: this.totalVahanDetailWithNumberFor_VisayTitle, bold: true },
  //           { text: " को राजसात करने के सम्बन्ध में प्रस्ताव भेजने बाबत |" }
  //         ]
  //       },

  //       { text: '\n' },

  //       {
  //         text: [

  //           { text: "विषयान्तर्गत निवेदन है कि प्राथमिक अपराध प्रकरण क्रमांक " },

  //           { text: this.por_number, bold: true },

  //           " दिनांक ",

  //           { text: this.crimeDate, bold: true },

  //           " में अवैध परिवहन ",

  //         ],

  //         margin: [40, 0, 0, 0]

  //       },

  //       {
  //         text: [

  //           { text: "कार्य में लिप्त " },

  //           { text: this.totalVahanDetailWithNumberFor_VisayTitle },

  //           " को जप्तशुदा वनोपज एवं अपराध में उपयोग में लाया गया | उक्त वाहन को राजसात करने की प्रस्ताव प्रेषित है |"
  //         ]
  //       },


  //       { text: "\n" },

  //       { text: "प्रकरण से सम्बंधित विवरण निम्नानुसार है :-" },

  //       { text: "\n" },

  //       {
  //         columns: [
  //           { text: ['1. प्राथमिक वन अपराध सुचना क्रमांक एवं दिनांक : '] },
  //           {
  //             text: [
  //               { text: this.por_number, bold: true }, " , ",
  //               { text: this.crimeDate, bold: true }]
  //             , alignment: 'right'
  //           },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: "\n" },

  //       { text: '2. अपराधी का विवरण : ' },

  //       { text: '\n' },

  //       accusedSectionBody1,

  //       { text: '\n' },

  //       { text: '3. जप्तशुदा सामग्री का पूर्ण विवरण : ' },
  //       { text: '\n' },
  //       contentOfJaptiSaman,

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['4. जप्ती का दिनांक , समय व स्थान : '] },
  //           {
  //             text: [
  //               { text: this.crimeDate, bold: true }, " , ",
  //               { text: this.crimePlace, bold: true }]
  //             , alignment: 'right'
  //           },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       { text: '5. उस व्यक्ति का नाम जिससे कॉलम (3) में दर्शाया माल जप्त किया गया : ' },
  //       { text: '\n' },
  //       accusedSectionBody2,

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['6. अपराध का विवरण अधिनियम एवं धारा , जिसके अंतर्गत अपराध हुआ : '] },
  //           {
  //             text: [
  //               { text: this.crime_dhara, bold: true }]
  //             , alignment: 'right'
  //           },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       { text: '7. जप्तशुदा वस्तु (वनोपज के अतिरिक्त) के मालिक का विवरण : ' },
  //       { text: '\n' },
  //       accusedSection,

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['8. जप्त करने वाले अधिकारी का नाम व पद : '] },
  //           {
  //             text: [
  //               { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }]
  //             , alignment: 'right'
  //           },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['9. जप्तशुदा वस्तु जिस स्थान पर तथा जिसके प्रभार में है : '] },
  //           {
  //             text: [
  //               { text: this.japtikarta_ka_name, bold: true }, { text: this.japtikarta_ka_pad, bold: true }]
  //             , alignment: 'right'
  //           },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       { text: '10. यदि जप्त शुदा वस्तु प्राधिकृत अधिकारी के समक्ष लाकर प्रस्तुत नहीं की गई हो तो उसका विवरण : ' },

  //       this.comingComplaintData.other_thing_which_not_present_by_officer,

  //       { text: '\n' },

  //       { text: '11. अन्य विशेष विवरण एवं विवरण : ' },

  //       this.comingComplaintData.anya_vishesh_vivran,

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['अतः जानकारी सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर प्रस्तुत है |'], alignment: 'left' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       {
  //         columns: [
  //           { text: [{ text: this.comingComplaintData.range_name }, { text: " परिक्षेत्र" }], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       {
  //         columns: [
  //           { text: [{ text: "दिनांक : " }, { text: this.convertDateString(this.comingComplaintData.pratra_dinank) }], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       { text: '\n' },

  //       {
  //         text: [
  //           { text: "प्रतिलिपि :- श्रीमान वनमंडलाधिकारी, " },
  //           { text: this.divisionName },
  //           { text: ' , वनमंडल को सूचनार्थ एवं आवश्यक कार्यवाही हेतु सादर सम्प्रेषित है |' },
  //         ]
  //       },

  //       { text: '\n' },

  //       {
  //         columns: [
  //           { text: ['वन परिक्षेत्र अधिकारी'], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //       {
  //         columns: [
  //           { text: [{ text: this.comingComplaintData.range_name }, { text: " परिक्षेत्र" }], alignment: 'right' },
  //         ],
  //         margin: [0, 10, 0, 0]
  //       },

  //     ],
  //     styles: {
  //       title: {
  //         fontSize: 18,
  //         bold: true,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 5]
  //       },
  //       subTitle: {
  //         fontSize: 14,
  //         alignment: 'center',
  //         margin: [0, 0, 0, 10]
  //       },
  //       section: {
  //         bold: true,
  //         margin: [0, 10, 0, 2]
  //       }
  //     },
  //     defaultStyle: {
  //       font: 'NotoSansDevanagari',
  //       fontSize: 12
  //     }

  //   }

  //   if (this.platForm.is('desktop')) {

  //     pdfMake.createPdf(docDefinition).download("प्राधिकृत_अधिकारी_को_सूचना_PDF" + this.comingComplaintData.por_number + '.pdf');

  //   } else if (this.platForm.is('android')) {

  //     await this.checkAndRequestStoragePermission();

  //     pdfMake.createPdf(docDefinition);

  //   }

  // }

  convertDateString(dateStr: string): string {
    if (!dateStr) return '';

    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  get totalOtherJaptSamanNag(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalOtherJaptSamanGhanMeter(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  get totalAnumanitRashi(): number {
    return this.OtherJaptItemsList.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }


  openSupportiveDocument(pdfName: any) {

    let pdfUrl = this.filePath + "/" + pdfName;

    this.router.navigateByUrl('/pdf_viewer_component', {
      state: { pdf_url: pdfUrl },
      replaceUrl: false
    });

  }

  openCourtChallanRelatedPage() {

    const jsonData = JSON.stringify(this.comingComplaintData);

    this.router.navigateByUrl('/court-challan-dastawej-list', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  getCrimDharaGroupedSeprated(input: string): Record<string, string[]> {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);

    const grouped: Record<string, string[]> = {};

    parts.forEach(part => {
      const separatorIndex = part.indexOf(' - ');

      if (separatorIndex !== -1) {
        const act = part.substring(0, separatorIndex).trim();
        const section = part.substring(separatorIndex + 3).trim();

        if (!grouped[act]) {
          grouped[act] = [];
        }

        grouped[act].push(section);
      }
    });

    return grouped;
  }

  async generatePDFOfVasuliVivran() {

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const tableHeader = [
      { text: 'मनी रसीद क्रमांक', bold: true, alignment: 'center' },
      { text: 'मनी रसीद दिनांक', bold: true, alignment: 'center' },
      { text: 'महसूल', bold: true, alignment: 'center' },
      { text: 'मुआवजा', bold: true, alignment: 'center' },
      { text: 'योग', bold: true, alignment: 'center' }
    ];

    const totalMahsul = this.listOfAlreadySubmittedVasuliDetail ? this.listOfAlreadySubmittedVasuliDetail.reduce((sum, item) => sum + (Number(item.mahsul_rashi) || 0), 0) : 0;
    const totalMavja = this.listOfAlreadySubmittedVasuliDetail ? this.listOfAlreadySubmittedVasuliDetail.reduce((sum, item) => sum + (Number(item.mavja_rashi) || 0), 0) : 0;
    const totalYog = this.listOfAlreadySubmittedVasuliDetail ? this.listOfAlreadySubmittedVasuliDetail.reduce((sum, item) => sum + (Number(item.total_rashi) || 0), 0) : 0;

    const tableBody = [
      tableHeader,
      ...(this.listOfAlreadySubmittedVasuliDetail && this.listOfAlreadySubmittedVasuliDetail.length > 0
        ? this.listOfAlreadySubmittedVasuliDetail.map(item => [
          { text: item.money_rasid_kramank || '', alignment: 'center' },
          { text: item.money_rasid_dinank ? (item.money_rasid_dinank.includes('-') && item.money_rasid_dinank.split('-')[0].length === 4 ? this.datePipe.transform(item.money_rasid_dinank, 'dd-MM-yyyy') : item.money_rasid_dinank) : '', alignment: 'center' },
          { text: item.mahsul_rashi || '', alignment: 'center' },
          { text: item.mavja_rashi || '', alignment: 'center' },
          { text: item.total_rashi || '', alignment: 'center' }
        ])
        : [[{ text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }]]),

      // Total Row At The End
      [
        { text: 'कुल योग', bold: true, alignment: 'center', colSpan: 2 },
        {},
        { text: totalMahsul.toString(), bold: true, alignment: 'center' },
        { text: totalMavja.toString(), bold: true, alignment: 'center' },
        { text: totalYog.toString(), bold: true, alignment: 'center' }
      ]
    ];

    const docDefinition: any = {
      content: [
        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'वसूली का विवरण', style: 'subTitle' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 }, // Reduced spacer

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10
            }
          ],
          margin: [0, 0, 0, 2]
        },

        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: tableBody
          },
          margin: [0, 0, 0, 10]
        }
        // ,{
        //   text: [
        //     { text: 'कुल वसूली : ', bold: true, fontSize: 12 },
        //     { text: '₹ ' + (this.totalVasuli || 0), bold: true, fontSize: 12 }
        //   ],
        //   alignment: 'right',
        //   margin: [0, 0, 0, 0]
        // }
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 1]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {
      pdfMake.createPdf(docDefinition).download("वसूली_का_विवरण.pdf");
    } else if (this.platForm.is('android')) {
      await this.checkAndRequestStoragePermission();
      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {
        const fileName = "वसूली_का_विवरण.pdf";
        const fileURI = await this.savePdf(base64Data, fileName);
      });
    }

  }


  async generatePDFOfJaptVanopajParivahanVivran() {

    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const prajatiTotals: any = {
      'लट्ठा': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'चिरान': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'बल्ली': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'फेंसिंग पोल': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'जलाऊ': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'बाँस': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 },
      'अन्य जप्त सामाग्री': { yogya_sankhya: 0, yogya_aytan: 0, parivahit_sankhya: 0, parivahit_aytan: 0 }
    };

    const samanTypeMap: any = {
      "2": "लट्ठा", "4": "चिरान", "6": "बल्ली", "8": "फेंसिंग पोल",
      "5": "जलाऊ", "7": "बाँस", "3": "अन्य जप्त सामाग्री"
    };

    if (this.listOfjaptiSaman && this.listOfjaptiSaman.length > 0) {
      this.listOfjaptiSaman.forEach(item => {
        const name = samanTypeMap[item.jabti_saman_type];
        if (name && item.is_yogya_to_parivahan === "1") {
          prajatiTotals[name].yogya_sankhya += Number(item.nag || 0);
          prajatiTotals[name].yogya_aytan += Number(item.ghan_meter || 0);
        }
      });
    }

    if (this.challanDetailList && this.challanDetailList.length > 0) {
      this.challanDetailList.forEach(item => {
        const name = item.vanopaj_type;
        if (name && prajatiTotals[name]) {
          prajatiTotals[name].parivahit_sankhya += Number(item.total_matra_in_sankhya || 0);
          prajatiTotals[name].parivahit_aytan += Number(item.total_matra_in_ghan_meter || 0);
        }
      });
    }

    const yogyaTableBody: any[] = [
      [
        { text: 'वनोपज', bold: true, alignment: 'center' },
        { text: 'कुल संख्या', bold: true, alignment: 'center' },
        { text: 'कुल आयतन', bold: true, alignment: 'center' }
      ]
    ];

    const sheshTableBody: any[] = [
      [
        { text: 'वनोपज', bold: true, alignment: 'center' },
        { text: 'कुल संख्या', bold: true, alignment: 'center' },
        { text: 'कुल आयतन', bold: true, alignment: 'center' }
      ]
    ];

    let totalYogyaSankhya = 0, totalYogyaAytan = 0;
    let totalSheshSankhya = 0, totalSheshAytan = 0;

    ['लट्ठा', 'चिरान', 'बल्ली', 'फेंसिंग पोल', 'जलाऊ', 'बाँस', 'अन्य जप्त सामाग्री'].forEach(name => {
      const data = prajatiTotals[name];
      if (data.yogya_sankhya > 0 || data.yogya_aytan > 0) {
        const shesh_sankhya = data.yogya_sankhya - data.parivahit_sankhya;
        const shesh_aytan = Math.max(0, data.yogya_aytan - data.parivahit_aytan);

        yogyaTableBody.push([
          { text: name, alignment: 'center' },
          { text: data.yogya_sankhya.toString(), alignment: 'center' },
          { text: data.yogya_aytan.toFixed(2), alignment: 'center' }
        ]);

        sheshTableBody.push([
          { text: name, alignment: 'center' },
          { text: shesh_sankhya.toString(), alignment: 'center' },
          { text: shesh_aytan.toFixed(2), alignment: 'center' }
        ]);

        totalYogyaSankhya += data.yogya_sankhya;
        totalYogyaAytan += data.yogya_aytan;
        totalSheshSankhya += shesh_sankhya;
        totalSheshAytan += shesh_aytan;
      }
    });

    if (yogyaTableBody.length === 1) {
      yogyaTableBody.push([{ text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }]);
      sheshTableBody.push([{ text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }]);
    }

    yogyaTableBody.push([
      { text: 'योग', bold: true, alignment: 'center' },
      { text: totalYogyaSankhya.toString(), bold: true, alignment: 'center' },
      { text: totalYogyaAytan.toFixed(2), bold: true, alignment: 'center' }
    ]);

    sheshTableBody.push([
      { text: 'योग', bold: true, alignment: 'center' },
      { text: totalSheshSankhya.toString(), bold: true, alignment: 'center' },
      { text: totalSheshAytan.toFixed(2), bold: true, alignment: 'center' }
    ]);

    const tableHeader = [
      { text: 'चालान क्रमांक', bold: true, alignment: 'center' },
      { text: 'चालान दिनांक', bold: true, alignment: 'center' },
      { text: 'वनोपज', bold: true, alignment: 'center' },
      { text: 'कुल संख्या', bold: true, alignment: 'center' },
      { text: 'कुल आयतन', bold: true, alignment: 'center' },
      { text: 'काष्ठागार का नाम', bold: true, alignment: 'center' }
    ];

    const tableBody = [
      tableHeader,
      ...(this.challanDetailList && this.challanDetailList.length > 0
        ? this.challanDetailList.map(item => [
          { text: item.challan_kramank || '-', alignment: 'center' },
          { text: item.challan_date ? (item.challan_date.includes('-') && item.challan_date.split('-')[0].length === 4 ? this.datePipe.transform(item.challan_date, 'dd-MM-yyyy') : item.challan_date) : '-', alignment: 'center' },
          { text: item.vanopaj_type || '-', alignment: 'center' },
          { text: item.total_matra_in_sankhya || '0', alignment: 'center' },
          { text: item.total_matra_in_ghan_meter || '0', alignment: 'center' },
          { text: item.depo_name || '-', alignment: 'center' }
        ])
        : [[
          { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' },
          { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' },
          { text: '-', alignment: 'center' }, { text: '-', alignment: 'center' }
        ]]),

      // Total Row At The End
      [
        { text: 'कुल योग', bold: true, alignment: 'center', colSpan: 3 },
        {},
        {},
        { text: (this.totalPreshitMatraUsingChallanInSankhya || 0).toString(), bold: true, alignment: 'center' },
        { text: (this.totalPreshitMatraUsingChallanInGhanMeter || 0).toString(), bold: true, alignment: 'center' },
        { text: '-', alignment: 'center' }
      ]
    ];

    const docDefinition: any = {
      content: [
        { text: 'वन एवं जलवायु परिवर्तन विभाग,छत्तीसगढ़', style: 'title' },
        { text: 'जप्त वनोपज परिवहन का विवरण', style: 'subTitle' },

        ...(this.comingComplaintData.sys_gen_por_number
          ? [
            {
              text: '(' + this.comingComplaintData.sys_gen_por_number + ')',
              style: 'subTitle',
              bold: true
            }
          ]
          : []),

        { text: '\n', fontSize: 2 }, // Reduced spacer

        {
          columns: [
            {
              text: [
                'POR क्रमांक : ',
                { text: this.comingComplaintData.por_number, style: 'section' },
              ],
              fontSize: 10
            },
            {
              text: [
                'पंजीयन दिनांक : ',
                { text: this.comingComplaintData.date_of_crime, bold: true }
              ],
              alignment: 'right',
              fontSize: 10
            }
          ],
          margin: [0, 0, 0, 2]
        },

        {
          columns: [
            {
              width: '48%',
              stack: [
                { text: 'काष्ठागार परिवहन किये जाने योग्य वनोपज', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto'],
                    body: yogyaTableBody
                  }
                }
              ]
            },
            { width: '4%', text: '' }, // Spacer between tables
            {
              width: '48%',
              stack: [
                { text: 'काष्ठागार परिवहन हेतु शेष वनोपज', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto'],
                    body: sheshTableBody
                  }
                }
              ]
            }
          ],
          margin: [0, 10, 0, 10]
        },

        { text: 'काष्ठागार परिवहित वनोपज', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*'],
            body: tableBody
          },
          margin: [0, 0, 0, 10]
        }
        // ,{
        //   text: [
        //     { text: 'कुल वसूली : ', bold: true, fontSize: 12 },
        //     { text: '₹ ' + (this.totalVasuli || 0), bold: true, fontSize: 12 }
        //   ],
        //   alignment: 'right',
        //   margin: [0, 0, 0, 0]
        // }
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 1]
        },
        subTitle: {
          fontSize: 12,
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 1]
        },
        subheader: {
          fontSize: 11,
          bold: true
        },
        section: {
          bold: true,
          margin: [0, 2, 0, 1]
        }
      },
      defaultStyle: {
        font: 'NotoSansDevanagari',
        fontSize: 10
      }
    };

    if (this.platForm.is('desktop')) {
      pdfMake.createPdf(docDefinition).download("जप्त_वनोपज_परिवहन_का_विवरण.pdf");
    } else if (this.platForm.is('android')) {
      await this.checkAndRequestStoragePermission();
      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {
        const fileName = "जप्त_वनोपज_परिवहन_का_विवरण.pdf";
        const fileURI = await this.savePdf(base64Data, fileName);
      });
    }

  }

  assignSDOOrDFOByRO() {
    ;
    if (this.selectedSDOIdDFOId === null) {
      this.showError("कृपया SDO / DFO चुने");
      return;
    }

    if (this.selectedSdoOrDfoDesignationId === "") {
      this.showError("कृपया SDO / DFO चुने");
      return;
    }

    if (this.selectedPdfFileDuringSendingToSDOOrDFOByRO === null) {
      this.showError("कृपया अग्रेषण पत्र चुने");
      return;
    }

    if (this.ro_remark_during_sending_to_sdo_or_dfo === "") {
      this.showError("वन परिक्षेत्र अधिकारी की अनुशंसा / टिप्पणी");
      return;
    }

    this.assignSDOOrDFO(
      this.japt_saman_total_price_edited_by_ro.toString(),
      this.found_vanopaj_total_price_edited_by_ro.toString(),
      this.actual_loss_total_price_edited_by_ro.toString(),
      this.mahsul_total_price_edited_by_ro.toString(),
      this.mavja_total_price_edited_by_ro.toString(),
      this.ro_remark_during_sending_to_sdo_or_dfo,
      this.selectedSDOIdDFOId,
      this.comingComplaintData.complain_id,
      this.comingComplaintData.complain_history_table_id,
      this.selectedPdfFileDuringSendingToSDOOrDFOByRO,
      this.shesh_vasuli_rashi_at_ro_level.toString()
    );

  }

  selectedSdoOrDfoDesignationId = "";

  getSelectedOfficerDesignationId(selectedOfficerId: string) {

    const emp = this.listOfSDOAndDFO.find(x => x.emp_id === Number(selectedOfficerId));

    if (emp) {
      this.selectedSdoOrDfoDesignationId = emp.designation_id;
    }

  }

  assignSDOOrDFO(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    ro_remark: string,
    selectedSDOId: String,
    complain_table_id: string,
    complain_history_table_id: string,
    selectedPdfFile: File,
    shesh_vasuli_rashi: string
  ) {
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.assignSDO(
      japt_saman_total_price.toString(),
      found_vanopaj_total_price.toString(),
      actual_loss_total_price.toString(),
      mahsul_total_price.toString(),
      mavja_total_price.toString(),
      complain_history_table_id.toString(),
      complain_table_id.toString(),
      this.loginedOffierEmpId.toString(),
      selectedSDOId.toString(),
      ro_remark.toString(),
      selectedPdfFile,
      shesh_vasuli_rashi.toString(),
      this.selectedSdoOrDfoDesignationId
    ).subscribe(
      async (response) => {
        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.sharedService.setRefresh(true);
          this.goBack();

        } else {
          this.showError(response.response.msg)
        }

      },
      async (error) => {
        //await this.dismissLoading();
        await this.dismissDialog();
        this.showError(error);
      }
    );
  }

  showJaptinamaButton: boolean = false;
  showSupurdanamaButton: boolean = false;

  submitJaptinamaVivran() {

    console.log(this.comingComplaintData, 'comingComplaintData data from backend');
    const jsonData = JSON.stringify(this.comingComplaintData);
    this.router.navigateByUrl('/add-japtinama-vivran', {
      state: { data: jsonData, beat_compartment: JSON.stringify(this.beat_compartment || []) },
      replaceUrl: false
    });
  }

  submitSupurdnamaVivran() {
    const jsonData = JSON.stringify(this.comingComplaintData);
    this.router.navigateByUrl('/add-supurdnama-vivran', {
      state: { data: jsonData },
      replaceUrl: false
    });
  }

  ionViewWillEnter() {
    if (this.sharedService.getRefresh()) {
      this.getDetailOfComplain();
      this.sharedService.setRefresh(false);
    }
  }



  filterItemsForJaptinama(japtinamaItem: JaptinamaResponseModal) {

    let kasthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा' &&
        item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let thuthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    console.log("ok ok ", thuthItemsList)
    let chiranItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let chattaItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let OtherJaptItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let balliItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let baansItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let polItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल' && item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let listOfJaptVahanDetail = this.listOfJaptVahanDetail.filter(
      item => item.japtinama_table_id === japtinamaItem.japtinnama_table_id
    );

    let totalVahanPrice = this.listOfJaptVahanDetail
      .filter(item => item.japtinama_table_id === japtinamaItem.japtinnama_table_id) // put your id here
      .reduce(
        (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
        0
      );

    japtinamaItem.OtherJaptItemsList = OtherJaptItemsList || [];
    japtinamaItem.kasthItemsList = kasthItemsList || [];
    japtinamaItem.thuthItemsList = thuthItemsList || [];
    japtinamaItem.polItemsList = polItemsList || [];
    japtinamaItem.baansItemsList = baansItemsList || [];
    japtinamaItem.balliItemsList = balliItemsList || [];
    japtinamaItem.chattaItemsList = chattaItemsList || [];
    japtinamaItem.chiranItemsList = chiranItemsList || [];

    japtinamaItem.listOfJaptVahanDetail = listOfJaptVahanDetail || [];

  }




  filterItemsForSupurdNama(japtinamaItem: SupurdnamaResponse) {


    let kasthItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'लट्ठा'
    );

    let thuthItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'ठूंठ'
    );

    let chiranItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'चिरान'
    );

    let chattaItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'चट्टा'
    );

    let OtherJaptItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान'
    );

    let balliItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );

    let baansItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'बाँस'
    );

    let polItemsList = japtinamaItem.japtSamanList.filter(
      item => item.actual_name_of_saman === 'पोल'
    );

    japtinamaItem.OtherJaptItemsList = OtherJaptItemsList || [];
    japtinamaItem.kasthItemsList = kasthItemsList || [];
    japtinamaItem.thuthItemsList = thuthItemsList || [];
    japtinamaItem.polItemsList = polItemsList || [];
    japtinamaItem.baansItemsList = baansItemsList || [];
    japtinamaItem.balliItemsList = balliItemsList || [];
    japtinamaItem.chattaItemsList = chattaItemsList || [];
    japtinamaItem.chiranItemsList = chiranItemsList || [];


  }




  isJaptSamanExist(japtinamaItem: JaptinamaResponseModal): boolean {

    if (japtinamaItem.OtherJaptItemsList!!.length > 0 ||
      japtinamaItem.kasthItemsList!!.length > 0 ||
      japtinamaItem.thuthItemsList!!.length > 0 ||
      japtinamaItem.polItemsList!!.length > 0 ||
      japtinamaItem.baansItemsList!!.length > 0 ||
      japtinamaItem.balliItemsList!!.length > 0 ||
      japtinamaItem.chattaItemsList!!.length > 0 ||
      japtinamaItem.chiranItemsList!!.length > 0
    ) {
      return true;
    }
    return false;
  }

  getTotalNagOfSamanType(listOfSaman: JaptSamanItem[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  getTotalAytanOfSamanType(listOfSaman: JaptSamanItem[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  getTotalAnumanitMulyaOfOtherSaman(listOfSaman: JaptSamanItem[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  getTotalAnumanitMulyaOfVahan(listOfSaman: JaptVahanDetailInterface[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.anumanit_mulya) || 0),
      0
    );
  }




  /////// SUPURDNAMA ////////
  getTotalNagOfSamanTypeSupurNama(listOfSaman: any[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.supurd_me_diya_gya_nag) || 0),
      0
    );
  }

  getTotalAytanOfSamanTypeSupurNama(listOfSaman: any[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }

  getTotalAnumanitMulyaOfOtherSamanSupurNama(listOfSaman: JaptSamanItem[]): Number {
    return listOfSaman.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

}