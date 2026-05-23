import { ChangeDetectorRef, Component, OnInit, resolveForwardRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInfiniteScroll, IonInfiniteScrollContent, IonCardContent, IonButton, IonRefresher, IonRefresherContent, IonSpinner, IonFab, IonFabButton, IonIcon, IonCard, IonGrid, IonCol, IonRow, IonLoading, IonMenuButton, IonButtons, IonMenu, IonAvatar, IonLabel, IonList, IonMenuToggle, IonItem, IonText, IonSplitPane, IonContent, IonHeader, IonTitle, IonToolbar, IonInput } from '@ionic/angular/standalone';
import { PageModel } from './PageModel';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { addIcons } from 'ionicons';
import { add, addOutline, addSharp, calendarOutline, checkmarkCircleOutline, closeCircleOutline, cloudOfflineOutline, downloadOutline } from 'ionicons/icons';
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
import { ModalController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { Router } from '@angular/router';
import { Toast } from '@capacitor/toast';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { ComplainDetails } from './GetDashboardResponse.model';
import { ApproveRejectComponent } from 'src/app/dialogs/approve-reject/approve-reject.component';
import { AssignRaByRoComponent } from 'src/app/dialogs/assign-ra-by-ro/assign-ra-by-ro.component';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';

import { Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/DatabaseService.service';
import { AssignSDOByRoComponent } from 'src/app/dialogs/assign-sdo-by-ro/assign-sdo-by-ro.component';
//import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal/image-preview-modal.component';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import FileSaver, { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { AssignPORToSelfInCaseOfRAPORRegisterationComponent } from 'src/app/dialogs/assign-porto-self-in-case-of-ra-por-registeration/assign-porto-self-in-case-of-ra-por-registeration.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FOCR_Modal, GetPorCountResponseModal, GetPorPanjiyanRegisterDetail } from './GetPorCountResponse.model';
import { SelectOptionForRaComponent } from 'src/app/dialogs/select-option-for-ra/select-option-for-ra.component';

import * as ExcelJS from 'exceljs';
import { AssignRaForVasuliByRoComponent } from 'src/app/dialogs/assign-ra-by-ro-for-vasuli/assign-ra-by-ro-for-vasuli.component';
import { ReturnToPradhikaritAdhikariComponent } from 'src/app/dialogs/return-to-pradhikrit-adhikari/return-to-pradhikrit-adhikari.component';
import { TotalPORCountResponseModal } from '../officer-dashboard/GetDashboardResponse.model';
import { TableModule } from 'primeng/table'; // Import TableModule

@Component({
  selector: 'app-admin-officer-dashboard',
  templateUrl: './admin-officer-dashboard.page.html',
  styleUrls: ['./admin-officer-dashboard.page.scss'],
  standalone: true,
  providers: [SpeechRecognition],
  imports: [TableModule, IonInfiniteScroll,       // 👈 Add this
    IonInfiniteScrollContent, IonInput, NgSelectModule, IonCardContent, IonButton, IonRefresher, IonRefresherContent, IonSpinner, IonFab, IonFabButton, IonIcon, IonCard, IonGrid, IonCol, IonRow, IonLoading, IonMenuButton, IonButtons, IonMenu, IonAvatar, IonLabel, IonList, IonMenuToggle, IonItem, IonText, IonSplitPane, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ScrollingModule]
})
export class AdminOfficerDashboard implements OnInit {

  @ViewChild('infiniteScroll') infiniteScroll!: IonInfiniteScroll; //

  isPorHScrolling = false;
  private porHScrollTimer: any;

  onPorTableScroll(ev: Event) {
    const el = ev?.target as HTMLElement | null;
    const scrollLeft = el?.scrollLeft ?? 0;

    // Hide all right-side columns while scrolled horizontally
    this.isPorHScrolling = scrollLeft > 0;

    // Stabilize during inertia scrolling
    clearTimeout(this.porHScrollTimer);
    this.porHScrollTimer = setTimeout(() => {
      this.isPorHScrolling = (el?.scrollLeft ?? 0) > 0;
    }, 120);
  }

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  totalComplains: number = 0;
  totalPendingComplains: number = 0;

  totalAplekhitComplains: number = 0;
  totalAbhisandhanComplains: number = 0;
  totalCourtChallanComplains: number = 0;
  totalNastibadhPOR: number = 0;

  totalRejectedComplains: number = 0;
  totalRequestToExtension: number = 0;



  gyatAccussedFromTotalPOR: number = 0;
  agyatAccussedFromTotalPOR: number = 0;

  totalPORBeatNirikshan: number = 0;
  gyatAccussedFromBeatNirikhanPOR: number = 0;
  agyatAccussedFromBeatNirikhanPOR: number = 0;

  totalPORPendingToNastibadh: number = 0;

  totalPendingComplainsAtCCFLevel: number = 0;

  totalPendingPOR_To_Assign_RA: number = 0;
  totalPendingPOR_To_Forward_SDO: number = 0;
  totalPendingPOR_To_Complete_At_RA_Level: number = 0;
  totalPendingPOR_To_Complete_At_SDO_Level: number = 0;
  totalPendingPOR_To_Complete_At_DFO_Level: number = 0;


  total_or_pending_or_accept_or_reject_label: string = "कुल शिकायत";
  isConnected: boolean = false;

  listForTotalComplainDetail: ComplainDetails[] = [];
  localListToFilterComplainDetail: ComplainDetails[] = [];

  ///////// POR COUNT /////////////
  listOfPOR_Count_RangWise: GetPorCountResponseModal[] = [];

  ///////// POR REGISTER DETAIL /////////////
  listOfPOR_Registr_Detail: GetPorPanjiyanRegisterDetail[] = [];

  ///////// POR REGISTER DETAIL /////////////
  listForFOCR_Panji: FOCR_Modal[] = [];
  listForFOCR_Prashman_Punji: FOCR_Modal[] = [];

  porSearchTerm = '';
  startDate: string = '';
  endDate: string = '';
  filteredPorList = [...this.localListToFilterComplainDetail]; // List to bind to *ngFor

  displayedList: any[] = []; // actually rendered in DOM


  pageSize = 20;              // how many items per load
  currentPage = 0;            // current page number
  filteredDataForPagination: any[] = []; // filtered list used for loadMore


  filterPorList() {
    const term = this.porSearchTerm.trim().toLowerCase();

    // Filter the full list
    this.localListToFilterComplainDetail = term === ''
      ? [...this.listForTotalComplainDetail]
      : this.listForTotalComplainDetail.filter(item =>
        item.por_number?.toLowerCase().includes(term)
      );

    // Reset displayed list and pagination
    this.currentPage = 0;
    this.filteredPorList = this.localListToFilterComplainDetail.slice(0, this.pageSize);
    this.currentPage = 1;

    // Re-enable infinite scroll if applicable
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = this.filteredPorList.length >= this.localListToFilterComplainDetail.length;
    }
  }


  constructor(
    private platForm: Platform,
    private sqliteService: DatabaseService,
    private speechRecognition: SpeechRecognition, private platform: Platform,
    private sharedPreference: SharedserviceService, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef, private router: Router, private langService: LanguageServiceService, private networkCheckService: NetworkCheckService, private modalCtrl: ModalController) {
    addIcons({ downloadOutline, cloudOfflineOutline, addOutline, checkmarkCircleOutline, closeCircleOutline, calendarOutline });
  }

  addAllIcon() {
    addIcons({
      addSharp
    });
  }

  pages: PageModel[] = [];
  languageData: any = {};

  ionViewWillEnter() {

    this.loadPorData();

    if (this.sharedPreference.getRefresh()) {
      this.getDashboardDataFromServer();
      this.sharedPreference.setRefresh(false);
    }
  }

  offlineDataCount: number = 0;
  isOfflineDataExist: boolean = false;
  porDataList: {
    accusedName: string;
    accusedFathersName: string;
    accusedCast: string;
    accusedAddress: string;
    typeOfCrime: string;
    placeOfCrime: string;
    dateOfCrime: string;
    detailsOfSeizedGoods: string;
    name_of_witness_one: string;
    name_of_witness_two: string;
    address_of_witness_one: string;
    address_of_witness_two: string;
    createdBy: string;
    circle_id: string;
    division_id: string;
    sub_division_id: string;
    range_id: string;
    sub_rang_id: string;
    beat_id: string;
    compartment_number: string;
    crime_dhara: string;
    por_number: string;
    lat: string;
    lng: string;
    map_address: string;
    photo_name_comma_separated: string;
    japti_nama_photo: string;
    supurd_nama_photo: string;
    panch_nama_photo: string;

  }[] = [];

  filePath: string = '';

  mainServiceURL: string = "";

  isImpersonating: boolean = false;
  canShowLoginAs: boolean = false;

  setMenu() {
    if (this.isRA) {
      this.pages = [
        {
          title: this.getTranslation('janch_awadhi_badhane_hetu_kiye_gaye_awedan'),
          url: 'janch_awadhi_badhane_hetu_kiye_gaye_awedan'
        },
        {
          title: 'PARIVAHAN RELATED REPORT',
          url: 'parivahan-related-report'
        },
        {
          title: this.getTranslation('logout'),
          url: 'logout'
        }
      ];
    } else if (this.isRO) {
      this.pages = [
        {
          title: 'FOCR EXCEL',
          url: 'focr_excel'
        },
        // {
        //   title: 'DOWNLOAD DATA',
        //   url: 'download_data'
        // },
        {
          title: 'DOWNLOAD POR COUNT EXCEL',
          url: 'download_por_count_data'
        },
        {
          title: 'PARIVAHAN RELATED REPORT',
          url: 'parivahan-related-report'
        },
        {
          title: this.getTranslation('logout'),
          url: 'logout'
        }
      ];
    } else if (this.isSDO || this.isDFO || this.isCCF) {
      this.pages = [
        {
          title: 'वन अपराध प्रशमन पंजी',
          url: 'prashman_punji'
        },
        // {
        //   title: 'DOWNLOAD DATA',
        //   url: 'download_data'
        // },
        {
          title: 'DOWNLOAD POR COUNT EXCEL',
          url: 'download_por_count_data'
        },
        {
          title: 'PARIVAHAN RELATED REPORT',
          url: 'parivahan-related-report'
        },
        {
          title: this.getTranslation('logout'),
          url: 'logout'
        }
      ];
    } else if (this.isSUPER_ADMIN) {
      this.pages = [
        // {
        //   title: 'DOWNLOAD DATA',
        //   url: 'download_data'
        // },
        {
          title: this.getTranslation('circle_emp_list'),
          url: 'employee-list'
        },
        {
          title: 'DOWNLOAD POR COUNT RANGE WISE',
          url: 'download_por_count_data'
        },
        {
          title: 'DOWNLOAD POR COUNT DIVISION WISE',
          url: 'download_por_division_wise'
        },
        {
          title: 'PARIVAHAN RELATED REPORT',
          url: 'parivahan-related-report'
        },
        ...(this.canShowLoginAs ? [{
          title: 'LOGIN AS',
          url: 'loginas'
        }] : []),
        {
          title: this.getTranslation('logout'),
          url: 'logout'
        }
      ];
    }
    else {
      this.pages = [
        // {
        //   title: 'DOWNLOAD DATA',
        //   url: 'download_data'
        // },
        // {
        //   title: 'DOWNLOAD POR COUNT EXCEL',
        //   url: 'download_por_count_data'
        // },
        {
          title: 'PARIVAHAN RELATED REPORT',
          url: 'parivahan-related-report'
        },
        {
          title: this.getTranslation('logout'),
          url: 'logout'
        }
      ];
    }
  }

  async ngOnInit() {

    const { value: baseUrl } = await Preferences.get({ key: PreferenceKeys.ngrok_url });

    if (baseUrl) {
      this.mainServiceURL = baseUrl;
    }

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    this.setDefaultDates();

    this.getLoginedOfficerName();
    await this.checkImpersonation();

    this.langService.language$.subscribe(() => {
      this.setMenu();
      this.cdRef.detectChanges();
    });
  }

  private async checkImpersonation() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    this.isImpersonating = !!value;
  }

  async exitLoginAs() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    if (!value) {
      this.isImpersonating = false;
      return;
    }
    const original = JSON.parse(value) as Users;
    await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(original) });
    await Preferences.remove({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    this.isImpersonating = false;
    this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
  }

  setDefaultDates() {
    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYearLocal = new Date(now.getFullYear(), 0, 1);

    this.endDate = this.formatDateLocal(todayLocal);
    this.startDate = this.formatDateLocal(startOfYearLocal);
  }

  openDatePicker(picker: HTMLInputElement) {
    if (picker.showPicker) {
      picker.showPicker();
    } else {
      picker.click();
    }
  }

  private formatDateLocal(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  showOfflineData() {
    this.router.navigateByUrl('/offline-data-list', { replaceUrl: false });
  }

  async loadPorData() {

    await this.sqliteService.initDB(); // Ensure DB is ready

    try {
      this.porDataList = await this.sqliteService.getPorData();
      if (this.porDataList.length > 0) {
        this.offlineDataCount = this.porDataList.length;
        this.isOfflineDataExist = true;
      } else {
        this.offlineDataCount = 0;
        this.isOfflineDataExist = false;
      }
    } catch (error) {
    }
  }

  async onMenuItemClick(page: string) {

    if (page === "logout") {

      if (this.offlineDataCount > 0) {

        this.showError("चूँकि आपके ऑफलाइन में एक बीट का डाटा रखा हुआ है , तो कृपया उसे पहले आप इंटरनेट की उपलब्धता में जमा करें , उसके बाद ही आप लॉगआउट हो सकते हैं |");

      } else {
        const modal = await this.modalCtrl.create({
          component: MessageDialogComponent,
          cssClass: 'custom-dialog-modal',
          componentProps: {
            server_message: 'क्या आप लॉगआउट करना चाहते हैं ?',
            isYesNo: true
          },
          backdropDismiss: false
        });

        modal.onDidDismiss().then(async (result) => {
          if (result.data?.confirmed) {

            const { value } = await Preferences.get({ key: PreferenceKeys.firebase_token });

            if (value) {
              let firebaseToken = value;
              await Preferences.clear();
              await Preferences.set({ key: PreferenceKeys.firebase_token, value: firebaseToken });
            }

            await Preferences.clear();
            this.router.navigateByUrl('/splash-page', { replaceUrl: true });

          }
        });

        await modal.present();

      }

    } else {

      if (page === "employee-list") {

        this.router.navigateByUrl('/employee-list', {
          replaceUrl: false
        });

      } else if (page === "janch_awadhi_badhane_hetu_kiye_gaye_awedan") {

        this.router.navigateByUrl('/janch_awadhi_badhane_hetu_kiye_gaye_awedan', {
          state: { isRA: this.isRA },
          replaceUrl: false
        });

      } else if (page === "focr_excel") {
        this.downloadDataOf_FOCR_Panji();
      } else if (page === "prashman_punji") {
        this.downloadDataOf_PrashmanPunji();
      } else if (page === "download_data") {
        this.downloadExcel();
      } else if (page === "download_por_count_data") {
        this.getPorCountRangWise();
      } else if (page === "download_por_division_wise") {

        this.downloadExcel_POR_Count_Division_Wise();
      } else if (page === "parivahan-related-report") {
        this.router.navigateByUrl('/parivahan-related-report', { replaceUrl: false });
      } else {
        this.router.navigate([page]);
      }

    }

    // } else {
    //   this.longToast(this.getTranslation("no_internet"));
    //   return;
    // }

  }

  loginedOfficerDesignationId: string = "";
  loginedOffierName: string = "";
  loginedOffierEmpId: string = "0";

  loginedOffierCircleId: string = "0";
  loginedOffierDivisionId: string = "0";
  loginedOffierSub_DivisionId: string = "0";
  loginedOffierRangId: string = "0";
  loginedOffierSub_RangId: string = "0";
  loginedOffierBeatId: string = "0";


  loginedOffierDesignationId: string = "0";
  isBG: boolean = false;
  isRO: boolean = false;
  isRA: boolean = false;
  isSDO: boolean = false;
  isDFO: boolean = false;
  isCCF: boolean = false;
  isSUPER_ADMIN: boolean = false;

  onImageError(event: any) {
    event.target.src = 'assets/img/default_image.png'; // path to your default image
  }

  requestToExtendDaysForJanch(item: ComplainDetails) {

    const jsonData = JSON.stringify(item);

    this.router.navigateByUrl('/janch-samay-vridhi-request', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  shouldShowExtendJanchAwedanButton(item: ComplainDetails): Boolean {
    if (item.complain_progress_stage === "2") {
      if (this.isRA || this.isBG) {
        return true;
      }
    }
    return false;
  }

  raiseVasuliRequestButton(item: ComplainDetails): Boolean {
    //
    if (this.isRO) {
      if (item.shesh_vasuli_rashi != "" && item.shesh_vasuli_rashi != "0") {
        return true;
      }

      if (item.complain_progress_stage === "6" ||
        item.complain_progress_stage === "7" ||
        item.complain_progress_stage === "9" ||
        item.complain_progress_stage === "11"
      ) {
        return true;
      }

      return false;
    }

    return false;

  }

  showPradhikritAdhikariSendBackButton(item: ComplainDetails): boolean {

    if (item.complain_progress_stage === "17" || item.complain_progress_stage === "18") {
      return false;
    }

    if (item.current_stage === this.currentUserDesignationId &&
      (Number(item.complain_progress_stage) === 3 ||
        Number(item.complain_progress_stage) === 4 ||
        Number(item.complain_progress_stage) === 5)
    ) {
      return true;
    }

    return false;

  }

  isItInMyLevel(item: ComplainDetails): boolean {
    //
    if (this.isRA && item.complain_progress_stage != "17" && item.complain_progress_stage != "18") {
      return true;
    }

    if (item.current_stage === this.currentUserDesignationId && item.complain_status === "0") {
      return true;
    }

    return false;

  }

  currentUserDesignationId = "0";

  async getLoginedOfficerName() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const userData = JSON.parse(value) as Users;
      this.loginedOffierName = userData.f_name;
      this.loginedOffierEmpId = userData.emp_id.toString();
      this.loginedOffierDesignationId = userData.designation_id;
      this.canShowLoginAs =
        userData.designation_id === "7" &&
        userData.emp_id === 300 &&
        (userData.f_name ?? "").trim().toUpperCase() === "SUPER ADMIN";


      this.loginedOffierCircleId = userData.circle_id;
      this.loginedOffierDivisionId = userData.division_id;
      this.loginedOffierSub_DivisionId = userData.sub_division_id;
      this.loginedOffierRangId = userData.range_id;

      this.currentUserDesignationId = userData.designation_id;

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
      } else if (userData.designation_id === "1") {
        this.isCCF = true;
      } else if (userData.designation_id === "7") {
        this.isSUPER_ADMIN = true;
      }

      this.getDashboardDataFromServer();
      this.setMenu();
    }
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  onImageLoad() {
    this.isLoading = false;
  }

  shouldShowAssignerRemark(item: ComplainDetails): boolean {
    if (this.loginedOffierDesignationId == "6" && item.current_stage == this.loginedOffierDesignationId) {
      return true;
    }

    if (this.loginedOffierDesignationId == "4" && Number(item.complain_progress_stage) > 2) {
      return true;
    }

    if (this.loginedOffierDesignationId == item.current_stage) {
      return true;
    }

    return false;

  }

  getListOfComplainsAfterClickOnBoxes(clickedItem: string) {

    this.localListToFilterComplainDetail = [];
    if (clickedItem === "") {
      this.selectedBox = "";
      // TOTAL COMPLAINS
      this.total_or_pending_or_accept_or_reject_label = "कुल शिकायत";
      this.localListToFilterComplainDetail = this.listForTotalComplainDetail;
    } else if (clickedItem === "2") {
      // PENDING COMPLAIN
      this.selectedBox = "2";
      this.total_or_pending_or_accept_or_reject_label = "कुल लंबित";
      for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
        const item = this.listForTotalComplainDetail[i];
        if (item.complain_status === "0" && item.current_stage == this.loginedOffierDesignationId) {
          this.localListToFilterComplainDetail.push(item);
        }
      }
    } else if (clickedItem === "1") {
      // APPROVE COMPLAIN
      this.selectedBox = "1";
      this.total_or_pending_or_accept_or_reject_label = "कुल अपलेखित";
      for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
        const item = this.listForTotalComplainDetail[i];
        if (item.complain_progress_stage === "6" || item.complain_progress_stage === "7") {
          this.localListToFilterComplainDetail.push(item);
        }
      }
    } else {
      if (clickedItem === "4") {
        this.selectedBox = "4";
        // PENDING COMPLAIN (ASSIGN RA)
        this.total_or_pending_or_accept_or_reject_label = "कुल लंबित POR (Assign RA)";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "1") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      } else if (clickedItem === "5") {
        this.selectedBox = "5";
        // PENDING COMPLAIN (FORWARD TO SDO)
        this.total_or_pending_or_accept_or_reject_label = "कुल लंबित POR (Forward To SDO / AD)";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (this.isRO) {
            if (item.complain_progress_stage === "3" || item.complain_progress_stage === "16") {
              this.localListToFilterComplainDetail.push(item);
            }
          } else {
            if (item.complain_progress_stage === "3") {
              this.localListToFilterComplainDetail.push(item);
            }
          }

        }
      } else if (clickedItem === "6") {
        this.selectedBox = "6";
        // PENDING COMPLAIN AT RA LEVEL TO COMPLET
        this.total_or_pending_or_accept_or_reject_label = "कुल लंबित (RA Level To Complete)";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "2" || item.complain_progress_stage === "8") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      } else if (clickedItem === "7") {
        this.selectedBox = "7";
        // PENDING COMPLAIN AT SDO LEVEL TO COMPLET
        this.total_or_pending_or_accept_or_reject_label = "कुल लंबित (SDO / AD Level To Complete)";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "4" || item.complain_progress_stage === "13") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      }
      else if (clickedItem === "8") {
        this.selectedBox = "8";
        // PENDING COMPLAIN AT SDO LEVEL TO COMPLET
        this.total_or_pending_or_accept_or_reject_label = "कुल लंबित (DFO Level To Complete)";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          //if (this.isDFO) {
          if (item.complain_progress_stage === "5" || item.complain_progress_stage === "19") {
            this.localListToFilterComplainDetail.push(item);
          }
          // } else {
          //   if (item.complain_progress_stage === "5") {
          //     this.localListToFilterComplainDetail.push(item);
          //   }
          // }

        }
      } else if (clickedItem === "9") {
        // APPROVE COMPLAIN
        this.selectedBox = "9";
        this.total_or_pending_or_accept_or_reject_label = "कुल अभिसन्धान/प्रशमन";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "9" || item.complain_progress_stage === "11" || item.complain_progress_stage === "15") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      } else if (clickedItem === "10") {
        this.selectedBox = "10";
        // APPROVE COMPLAIN
        this.total_or_pending_or_accept_or_reject_label = "कुल कोर्ट चालान";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "10" || item.complain_progress_stage === "12") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      } else if (clickedItem === "11") {
        this.selectedBox = "11";
        // APPROVE COMPLAIN
        this.total_or_pending_or_accept_or_reject_label = "नस्तीबध्द POR";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "18" || item.complain_progress_stage === "17") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      } else if (clickedItem === "21") {
        // PENDING COMPLAIN FOR NASTIBADH
        this.selectedBox = "21";
        this.total_or_pending_or_accept_or_reject_label = "Pending For Nastibadh";
        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];
          if (item.complain_progress_stage === "14" || item.complain_progress_stage === "19") {
            this.localListToFilterComplainDetail.push(item);
          }
        }
      }
      // } else if (clickedItem === "11") {
      //   this.total_or_pending_or_accept_or_reject_label = "नस्तीबध्द करने के लिए POR";
      //   for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
      //     const item = this.listForTotalComplainDetail[i];
      //     if (item.complain_progress_stage === "13" || item.complain_progress_stage === "14") {
      //       this.localListToFilterComplainDetail.push(item);
      //     }
      //   }
      // }

    }

    this.initializeList();

  }

  selectedBox: string | null = null;

  initializeList() {
    this.currentPage = 0;
    this.filteredPorList = [];

    this.loadNextPage();

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  // Load next page of data
  async loadNextPage(event?: any) {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    const nextChunk = this.localListToFilterComplainDetail.slice(start, end);

    this.filteredPorList = [...this.filteredPorList, ...nextChunk];
    this.currentPage++;

    // Only check for disabling if this is called from an infinite scroll event
    if (event) {
      event.target.complete();

      if (this.filteredPorList.length >= this.localListToFilterComplainDetail.length) {
        event.target.disabled = true;  // disable scroll only when all data loaded
      }
    }
  }


  addComplaint() {
    this.router.navigateByUrl('/add-complain', { replaceUrl: false });
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

  async showDialog(msg: string) {
    if (this.isLoading) return;
    this.loadingMessage = msg;
    this.isLoading = true;

    // 👇 ensure DOM updates before async code continues
    await new Promise(resolve => setTimeout(resolve, 0));
    this.cdRef.detectChanges();
  }

  async dismissDialog() {
    // 1️⃣ Hide the loading overlay
    this.isLoading = false;

    // 2️⃣ Force Angular to update the DOM
    this.cdRef.detectChanges();

    // 3️⃣ If pull-to-refresh is active, complete it safely
    if (this.refreshEvent != null) {
      try {
        this.refreshEvent.target.complete();
      } catch (e) {
      }
      this.refreshEvent = null; // Clear the reference
    }

    // 4️⃣ Optional: wait one tick to ensure UI fully updates
    await new Promise(resolve => setTimeout(resolve, 0));
  }


  refreshEvent: any;
  async doRefresh(event: any) {
    if (await this.isConnectedToInternet()) {
      this.refreshEvent = event;
      this.getDashboardDataFromServer();
    } else {
      this.refreshEvent.target.complete(); // Stop the loading spinner
    }

  }

  should_show_button_pradhikrit_adhikari_ko_suchna(item: ComplainDetails): Boolean {
    if (this.isRO) {

      if (item.is_japt_vahan === "1" && item.is_vahan_suchana_given_by_ro_to_sdo === "0") {

        return true;
      }

    }

    return false;

  }

  should_show_button_to_sdo_to_generate_order_for_rajsaat(item: ComplainDetails): Boolean {
    if (this.isSDO) {
      if (item.is_japt_vahan === "1" && item.is_vahan_suchana_given_by_ro_to_sdo === "1" &&
        item.is_rajsath_suchana_given_by_sdo_to_majistret === "0"
      ) {
        //
        return true;

      }

    }

    return false;

  }

  pradhikritAhikariKoSuchna(item: ComplainDetails) {
    const jsonData = JSON.stringify(item);

    this.router.navigateByUrl('/pradhikrit-adhikari-ko-suchna-by-ro', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  suchnaToMajistret(item: ComplainDetails) {
    const jsonData = JSON.stringify(item);

    this.router.navigateByUrl('/pradhikrit-adhikari-ko-suchna-by-ro', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  listOfPorCountData: TotalPORCountResponseModal[] = [];

  async getCountWiseDataOfDivision() {

    this.listOfPorCountData = [];

    if (!await this.networkCheckService.getCurrentStatus()) {
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getAdminDashboardData(
      this.mainServiceURL,
      this.loginedOffierEmpId.toString(),
      this.loginedOffierDesignationId,
      this.safeValue(this.selectedCircleId),
      this.safeValue(this.selectedDivisionId),
      this.startDate, this.endDate).subscribe(
        async (response) => {
          this.dismissDialog();

          if (response.response.code === 200) {
            console.log("response.total_por_count    ", response.total_por_count);
            this.listOfPorCountData = response.total_por_count;
            debugger;
            this.swapSurgujaWildlifeDivisions();
            this.fixMissingTotalRows();
            this.setUpMahayog();

          } else {
            await this.dismissDialog();
            this.longToast(response.response.msg)
          }

        },
        async (error) => {
          await this.dismissDialog();
          this.shortToast(error);
        }
      );

  }

  async getDashboardDataFromServer() {

    this.totalComplains = 0;
    this.totalPendingComplains = 0;
    this.totalAplekhitComplains = 0;

    this.totalAbhisandhanComplains = 0;
    this.totalCourtChallanComplains = 0;
    this.totalNastibadhPOR = 0;

    this.totalRejectedComplains = 0;
    this.totalPendingPOR_To_Assign_RA = 0;
    this.totalPendingPOR_To_Forward_SDO = 0;
    this.totalPendingPOR_To_Complete_At_RA_Level = 0;
    this.totalPendingPOR_To_Complete_At_SDO_Level = 0;
    this.totalPendingPOR_To_Complete_At_DFO_Level = 0;


    this.gyatAccussedFromTotalPOR = 0;
    this.agyatAccussedFromTotalPOR = 0;
    this.totalPORBeatNirikshan = 0;
    this.gyatAccussedFromBeatNirikhanPOR = 0;
    this.agyatAccussedFromBeatNirikhanPOR = 0;

    if (!await this.networkCheckService.getCurrentStatus()) {
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");



    this.apiService.getDashboardData(
      this.mainServiceURL,
      this.loginedOffierEmpId.toString(),
      this.loginedOffierDesignationId, this.startDate, this.endDate, '1').subscribe(
        async (response) => {

          if (response.response.code === 200) {


            if (response.complainData && response.complainData.length > 0) {
              response.complainData.forEach(complain => {
                if (complain.accused_persons_json && complain.accused_persons_json.trim() !== '') {
                  try {
                    const accusedArray = JSON.parse('[' + complain.accused_persons_json + ']');
                    complain.accusedPersons = accusedArray || [];
                  } catch (error) {
                    complain.accusedPersons = [];
                  }
                } else {
                  complain.accusedPersons = [];
                }
              });
            }

            this.listForTotalComplainDetail = response.complainData


            for (let item of response.totalComplainData) {

              if (item.whichTypeOfComplain == 1) {
                this.totalComplains = item.totalComplain;
              } else if (item.whichTypeOfComplain == 2) {
                this.totalPendingComplains = item.totalComplain;
              } else if (item.whichTypeOfComplain == 3) {
                this.totalAplekhitComplains = item.totalComplain;
              } else if (item.whichTypeOfComplain == 4) {
                this.totalRejectedComplains = item.totalComplain;
                this.totalPendingPOR_To_Assign_RA = item.totalComplain;
              } else if (item.whichTypeOfComplain == 5) {
                this.totalPendingPOR_To_Forward_SDO = item.totalComplain;
              } else if (item.whichTypeOfComplain == 6) {
                this.totalPendingPOR_To_Complete_At_RA_Level = item.totalComplain;
              } else if (item.whichTypeOfComplain == 7) {
                this.totalPendingPOR_To_Complete_At_SDO_Level = item.totalComplain;
              } else if (item.whichTypeOfComplain == 8) {
                this.totalPendingPOR_To_Complete_At_DFO_Level = item.totalComplain;
              } else if (item.whichTypeOfComplain == 9) {
                this.totalAbhisandhanComplains = item.totalComplain;
              } else if (item.whichTypeOfComplain == 10) {
                this.totalCourtChallanComplains = item.totalComplain;
              } else if (item.whichTypeOfComplain == 11) {
                this.totalNastibadhPOR = item.totalComplain;
              } else if (item.whichTypeOfComplain == 222) {
                this.agyatAccussedFromTotalPOR = item.totalComplain;
              } else if (item.whichTypeOfComplain == 111) {
                this.gyatAccussedFromTotalPOR = item.totalComplain;
              } else if (item.whichTypeOfComplain == 333) {
                this.totalPORBeatNirikshan = item.totalComplain;
              } else if (item.whichTypeOfComplain == 21) {
                debugger;
                this.totalPORPendingToNastibadh = item.totalComplain;
              }

              if (item.whichTypeOfComplain == 22) {
                this.totalPendingComplainsAtCCFLevel = item.totalComplain;
              }

              if (item.whichTypeOfComplain == 20) {
                this.totalRequestToExtension = item.totalComplain;
              }

            }

            for (let item of response.complainData) {

              if (item.is_accused_found === "0") {
                debugger;
                this.agyatAccussedFromTotalPOR = this.agyatAccussedFromTotalPOR + 1;
              } else {
                this.gyatAccussedFromTotalPOR = this.gyatAccussedFromTotalPOR + 1;
              }

              if (item.is_beat_nirikshan === "1") {

                this.totalPORBeatNirikshan = this.totalPORBeatNirikshan + 1;

                if (item.is_accused_found === "1") {
                  this.gyatAccussedFromBeatNirikhanPOR = this.gyatAccussedFromBeatNirikhanPOR + 1;
                } else {
                  this.agyatAccussedFromBeatNirikhanPOR = this.agyatAccussedFromBeatNirikhanPOR + 1;
                }

              }

            }

            debugger;
            this.getCountWiseDataOfDivision();

            this.getListOfComplainsAfterClickOnBoxes('');

            this.getDropDownData();

          } else {
            await this.dismissDialog();
            this.longToast(response.response.msg)
          }

        },
        async (error) => {
          await this.dismissDialog();
          this.shortToast(error);
        }
      );

  }

  async getDropDownData() {
    if (this.loginedOffierDesignationId === "1"
      || this.loginedOffierDesignationId === "2"
      || this.loginedOffierDesignationId === "3"
      || this.loginedOffierDesignationId === "4"
      || this.loginedOffierDesignationId === "7"
    ) {
      //// SUPER ADMIN ////
      if (this.loginedOffierDesignationId === "7") {
        this.getCircle();
      }
      /////////////////


      //// CCF ////
      if (this.loginedOffierDesignationId === "1") {
        this.getDivision();
      }
      /////////////////

      //// DFO ////
      if (this.loginedOffierDesignationId === "2") {
        this.getSubDivision();
      }
      /////////////////


      //// SDO ////
      if (this.loginedOffierDesignationId === "3") {
        this.getRang();
      }
      /////////////////


      //// RO ////
      if (this.loginedOffierDesignationId === "4") {
        this.getSubRang();
      }
      /////////////////
    } else {
      await this.dismissDialog();
    }

  }

  clickedComplainDetail: any;

  showComplainHistory(clickedComplainDetail: ComplainDetails) {

    const jsonData = JSON.stringify(clickedComplainDetail);

    this.router.navigateByUrl('/complain-life-history', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  sendReqestToServerForFinalNastibadha() {

    if (this.isDFO) {
      this.showDialog("कृपया प्रतीक्षा करें");
      //
      this.apiService.requestForFinalNastibadh(
        this.clickedComplainDetail.complain_id,
        this.loginedOffierEmpId.toString(),
        this.clickedComplainDetail.complain_history_table_id.toString(),
        "dfo").subscribe(
          (response) => {
            this.dismissDialog();
            //
            if (response.response.code === 200) {
              //this.sharedPreference.setRefresh(true);
              this.getDashboardDataFromServer();
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

  }

  sendReqestToServerForNastibadhaFromSDOToDFO() {
    //
    let sdoOrDFo = "dfo";

    this.showDialog("कृपया प्रतीक्षा करें");
    //
    this.apiService.requestForNastibadhFromSDOToDFO(this.clickedComplainDetail.complain_id,
      this.loginedOffierEmpId.toString(),
      this.clickedComplainDetail.complain_history_table_id.toString(),
      sdoOrDFo).subscribe(
        (response) => {
          this.dismissDialog();
          //
          if (response.response.code === 200) {
            this.getDashboardDataFromServer();
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

  async backToConcernOfficer(clickedComplainDetail: ComplainDetails) {

    const modal = await this.modalCtrl.create({
      component: ReturnToPradhikaritAdhikariComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        complain_table_id: clickedComplainDetail.complain_id.toString(),
        loginedOffierEmpId: this.loginedOffierEmpId.toString(),
        loginedOffierDesignationId: this.loginedOffierDesignationId.toString(),
        complain_history_table_id: clickedComplainDetail.complain_history_table_id.toString()
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.returnComplainToConcernedOfficer(
          result.data.remark,
          result.data.selected_officer,
          result.data.complain_table_id,
          result.data.complain_history_table_id
        );
      }
    });

    await modal.present();

  }

  returnComplainToConcernedOfficer(
    remark: string,
    selectedEmployee: string,
    complainId: string,
    complain_history_table_id: string) {

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.revertComplain(
      complain_history_table_id.toString(),
      complainId.toString(),
      this.loginedOffierEmpId.toString(),
      selectedEmployee.toString(),
      remark.toString(),
      this.loginedOffierDesignationId.toString()
    ).subscribe(
      async (response) => {

        await this.dismissDialog();

        if (response.response.code === 200) {

          this.getDashboardDataFromServer();

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

  async detailOrAcceptOrReject(clickedComplainDetail: ComplainDetails, detail_or_action: string) {
    let msg = "";



    const jsonData = JSON.stringify(clickedComplainDetail);
    if (detail_or_action === "") {

      this.router.navigateByUrl('/view-complain-detail', {
        state: { data: jsonData },
        replaceUrl: false
      });

      return;

    } else {
      this.clickedComplainDetail = clickedComplainDetail;

      if (this.isRA) {

        if (Number(clickedComplainDetail.complain_progress_stage === "15")) {

          // this.router.navigateByUrl('/submit-vasuli-viran-page', {
          //   state: { data: jsonData },
          //   replaceUrl: false
          // });

          // return;


          let is_apradh_prakran_prativedan_show = true;

          if (Number(clickedComplainDetail.complain_progress_stage) != 2 && Number(clickedComplainDetail.complain_progress_stage) != 6 && Number(clickedComplainDetail.complain_progress_stage) != 7) {
            is_apradh_prakran_prativedan_show = false;
          } else {
            is_apradh_prakran_prativedan_show = true;
          }

          const modal = await this.modalCtrl.create({
            component: SelectOptionForRaComponent,
            cssClass: 'custom-dialog-modal',
            componentProps: {
              show_prakaran_prativendan: is_apradh_prakran_prativedan_show
            },
            backdropDismiss: false,
          });

          modal.onDidDismiss().then((result) => {
            if (result.data?.confirmed) {
              if (result.data?.selectedOption === 1) {
                this.router.navigateByUrl('/ra-work-log-list', {
                  state: { data: jsonData, is_coming_for_log_entry: true },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 2) {
                this.router.navigateByUrl('/submit-van-apradh-prakaran-by-ra', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 3) {
                this.router.navigateByUrl('/submit-vasuli-viran-page', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 4) {
                this.router.navigateByUrl('/submit-parivahan-page', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              }
            }
          });

          await modal.present();

          return;

        } else {
          let is_apradh_prakran_prativedan_show = true;

          if (Number(clickedComplainDetail.complain_progress_stage) != 2 && Number(clickedComplainDetail.complain_progress_stage) != 6 && Number(clickedComplainDetail.complain_progress_stage) != 7) {
            is_apradh_prakran_prativedan_show = false;
          } else {
            is_apradh_prakran_prativedan_show = true;
          }

          const modal = await this.modalCtrl.create({
            component: SelectOptionForRaComponent,
            cssClass: 'custom-dialog-modal',
            componentProps: {
              show_prakaran_prativendan: is_apradh_prakran_prativedan_show
            },
            backdropDismiss: false,
          });

          modal.onDidDismiss().then((result) => {
            if (result.data?.confirmed) {
              if (result.data?.selectedOption === 1) {
                this.router.navigateByUrl('/ra-work-log-list', {
                  state: { data: jsonData, is_coming_for_log_entry: true },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 2) {
                this.router.navigateByUrl('/submit-van-apradh-prakaran-by-ra', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 3) {
                this.router.navigateByUrl('/submit-vasuli-viran-page', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              } else if (result.data?.selectedOption === 4) {
                this.router.navigateByUrl('/submit-parivahan-page', {
                  state: { data: jsonData },
                  replaceUrl: false
                });
              }
            }
          });

          await modal.present();

          return;
        }

      }

      if (this.isSDO && Number(clickedComplainDetail.complain_progress_stage) === 13) {

        msg = "यह पी.ओ.आर. नस्तीबद्ध के लिए वनमंडलाधिकारी को भेजा जाना है| क्या आप सुनिश्चित हैं?";

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
            this.sendReqestToServerForNastibadhaFromSDOToDFO();
          }
        });

        await modal.present();
        return;
      }

      if (this.isDFO && Number(clickedComplainDetail.complain_progress_stage) === 19) {

        let msg = "यह पी.ओ.आर. नस्तीबद्ध किया जा रहा है  | क्या आप सुनिश्चित हैं?";

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
            this.sendReqestToServerForFinalNastibadha();
          }
        });

        await modal.present();
        return;
      }

      if (this.isRO && Number(clickedComplainDetail.complain_progress_stage) === 16) {

        this.router.navigateByUrl('/view-complain-detail', {
          state: { data: jsonData, is_for_nastibadha: true },
          replaceUrl: false
        });
        return;

      }

      if (this.isRO && Number(clickedComplainDetail.complain_progress_stage) === 8) {

        let is_apradh_prakran_prativedan_show = true;

        if (Number(clickedComplainDetail.complain_progress_stage) != 8 && Number(clickedComplainDetail.complain_progress_stage) != 6 && Number(clickedComplainDetail.complain_progress_stage) != 7) {
          is_apradh_prakran_prativedan_show = false;
        } else {
          is_apradh_prakran_prativedan_show = true;
        }

        const modal = await this.modalCtrl.create({
          component: SelectOptionForRaComponent,
          cssClass: 'custom-dialog-modal',
          componentProps: {
            show_prakaran_prativendan: is_apradh_prakran_prativedan_show
          },
          backdropDismiss: false,
        });

        modal.onDidDismiss().then((result) => {
          if (result.data?.confirmed) {
            if (result.data?.selectedOption === 1) {
              this.router.navigateByUrl('/ra-work-log-list', {
                state: { data: jsonData, is_coming_for_log_entry: true },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 2) {
              this.router.navigateByUrl('/submit-van-apradh-prakaran-by-ra', {
                state: { data: jsonData },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 3) {
              this.router.navigateByUrl('/submit-vasuli-viran-page', {
                state: { data: jsonData },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 4) {
              this.router.navigateByUrl('/submit-parivahan-page', {
                state: { data: jsonData },
                replaceUrl: false
              });
            }
          }
        });

        await modal.present();

        return;

      }




      /// if 1 - Assign RA by RO, 2 - log work by RA, 3 - Forward to SDO by RO, 4 - Generate Order by SDO, 
      // 5 - Forward to DFO by RO, 6 - Close complain by DFO

      if (clickedComplainDetail.complain_progress_stage === "1") {

        // if (clickedComplainDetail.is_complain_created_by_ra === "1") {


        //   const modal = await this.modalCtrl.create({
        //     component: AssignPORToSelfInCaseOfRAPORRegisterationComponent,
        //     cssClass: 'custom-dialog-modal',
        //     componentProps: {
        //       ro_name: this.loginedOffierName,
        //       complain_table_id: clickedComplainDetail.complain_id,
        //       complain_history_table_id: clickedComplainDetail.complain_history_table_id,
        //       loginedOffierEmpId: this.loginedOffierEmpId.toString(),
        //       loginedOffierDesignationId: this.loginedOffierDesignationId.toString()
        //     },
        //     backdropDismiss: false,
        //   });

        //   modal.onDidDismiss().then((result) => {
        //     if (result.data?.confirmed) {

        //       this.assignToSelf(
        //         result.data.remark,
        //         this.loginedOffierEmpId,
        //         result.data.complain_table_id,
        //         result.data.complain_history_table_id,
        //         result.data.focr_date,
        //         result.data.focr_number
        //       );
        //     }
        //   });

        //   await modal.present();


        // } else {
        //   const modal = await this.modalCtrl.create({
        //     component: AssignRaByRoComponent,
        //     cssClass: 'custom-dialog-modal',
        //     componentProps: {
        //       ro_name: this.loginedOffierName,
        //       is_complain_created_by_ra: clickedComplainDetail.is_complain_created_by_ra,
        //       complain_table_id: clickedComplainDetail.complain_id,
        //       complain_history_table_id: clickedComplainDetail.complain_history_table_id,
        //       loginedOffierEmpId: this.loginedOffierEmpId.toString(),
        //       loginedOffierDesignationId: this.loginedOffierDesignationId.toString()
        //     },
        //     backdropDismiss: false,
        //   });

        //   modal.onDidDismiss().then((result) => {
        //     if (result.data?.confirmed) {

        //       this.assignRA(result.data.remark, result.data.selected_ra,
        //         result.data.complain_table_id, result.data.complain_history_table_id,
        //         result.data.focr_date, result.data.focr_number
        //       );

        //     }
        //   });

        //   await modal.present();
        // }

        const modal = await this.modalCtrl.create({
          component: AssignRaByRoComponent,
          cssClass: 'custom-dialog-modal',
          componentProps: {
            ro_name: this.loginedOffierName,
            is_complain_created_by_ra: clickedComplainDetail.is_complain_created_by_ra,
            complain_table_id: clickedComplainDetail.complain_id,
            complain_history_table_id: clickedComplainDetail.complain_history_table_id,
            loginedOffierEmpId: this.loginedOffierEmpId.toString(),
            loginedOffierDesignationId: this.loginedOffierDesignationId.toString()
          },
          backdropDismiss: false,
        });

        modal.onDidDismiss().then((result) => {
          if (result.data?.confirmed) {

            this.assignRA(result.data.remark, result.data.selected_ra,
              result.data.complain_table_id, result.data.complain_history_table_id,
              result.data.focr_date, result.data.focr_number
            );

          }
        });

        await modal.present();

      } else if (clickedComplainDetail.complain_progress_stage === "2") {

        const modal = await this.modalCtrl.create({
          component: SelectOptionForRaComponent,
          cssClass: 'custom-dialog-modal',
          componentProps: {
            show_prakaran_prativendan: true
          },
          backdropDismiss: false,
        });

        modal.onDidDismiss().then((result) => {
          if (result.data?.confirmed) {
            if (result.data?.selectedOption === 1) {
              this.router.navigateByUrl('/ra-work-log-list', {
                state: { data: jsonData, is_coming_for_log_entry: true },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 2) {
              this.router.navigateByUrl('/submit-van-apradh-prakaran-by-ra', {
                state: { data: jsonData },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 3) {
              this.router.navigateByUrl('/submit-vasuli-viran-page', {
                state: { data: jsonData },
                replaceUrl: false
              });
            } else if (result.data?.selectedOption === 4) {
              this.router.navigateByUrl('/submit-parivahan-page', {
                state: { data: jsonData },
                replaceUrl: false
              });
            }
          }
        });

        await modal.present();



      } else if (clickedComplainDetail.complain_progress_stage === "3") {

        let finalWorkLogData = clickedComplainDetail.finalWorkLogDetailByRa &&
          this.clickedComplainDetail.finalWorkLogDetailByRa.length > 0
          ? this.clickedComplainDetail.finalWorkLogDetailByRa[0]
          : null;

        const modal = await this.modalCtrl.create({
          component: AssignSDOByRoComponent,
          cssClass: 'custom-dialog-modal',
          componentProps: {
            complain_table_id: clickedComplainDetail.complain_id,
            japt_saman_total_price: finalWorkLogData?.japt_saman_total_price,
            found_vanopaj_total_price: finalWorkLogData?.found_vanopaj_total_price,
            actual_loss_total_price: finalWorkLogData?.actual_loss_total_price,
            mahsul_total_price: finalWorkLogData?.mahsul_total_price,
            mavja_total_price: finalWorkLogData?.mavja_total_price,
            complain_history_table_id: clickedComplainDetail.complain_history_table_id,
            loginedOffierEmpId: this.loginedOffierEmpId.toString(),
            loginedOffierDesignationId: this.loginedOffierDesignationId.toString(),
            shesh_vasuli_rashi: finalWorkLogData?.shesh_vasuli_rashi,
            pahle_ka_vasuli_rashi: finalWorkLogData?.totalPreviouseVasuliRashi,
          },
          backdropDismiss: false,
        });

        modal.onDidDismiss().then((result) => {
          if (result.data?.confirmed) {

            const selectedPdf = result.data.pdf_file;  // ⬅ PDF file is here

            this.assignSDO(
              result.data.japt_saman_total_price,
              result.data.found_vanopaj_total_price,
              result.data.actual_loss_total_price,
              result.data.mahsul_total_price,
              result.data.mavja_total_price,
              result.data.remark,
              result.data.selected_sdo,
              result.data.complain_table_id,
              result.data.complain_history_table_id,
              selectedPdf,
              result.data.shesh_vasuli_rashi
            );

          }
        });

        await modal.present();

      } else if (clickedComplainDetail.complain_progress_stage === "4") {

        this.router.navigateByUrl('/view-complain-detail', {
          state: { data: jsonData, final_action_by_sdo: true },
          replaceUrl: false
        });

        return;
      } else if (clickedComplainDetail.complain_progress_stage === "5") {

        this.router.navigateByUrl('/view-complain-detail', {
          state: { data: jsonData, final_action_by_dfo: true },
          replaceUrl: false
        });

        return;
      } else if (clickedComplainDetail.complain_progress_stage === "8") {

        this.router.navigateByUrl('/ra-work-log-list', {
          state: { data: jsonData, is_coming_for_log_entry: true },
          replaceUrl: false
        });

        return;
      }

    }


  }

  assignToSelf(ro_remark: string, selectedRAId: String,
    complain_table_id: string, complain_history_table_id: string,
    focr_date: string, focr_number: string
  ) {
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.assignSelfOnComplain(
      complain_history_table_id.toString(),
      complain_table_id.toString(),
      this.loginedOffierEmpId.toString(),
      selectedRAId.toString(),
      ro_remark.toString(),
      focr_date.toString(),
      focr_number.toString()
    ).subscribe(
      async (response) => {

        await this.dismissDialog();

        if (response.response.code === 200) {

          this.getDashboardDataFromServer();

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

  assignRA(ro_remark: string, selectedRAId: String,
    complain_table_id: string, complain_history_table_id: string, focr_date: string, focr_number: string
  ) {

    this.showDialog("कृपया प्रतीक्षा करें.....");
    //this.cdRef.detectChanges();

    this.apiService.assignRA(
      complain_history_table_id.toString(),
      complain_table_id.toString(),
      this.loginedOffierEmpId.toString(),
      selectedRAId.toString(),
      ro_remark.toString(),
      focr_date.toString(),
      focr_number.toString()
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          //this.cdRef.detectChanges();

          this.getDashboardDataFromServer();

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

  assignSDO(
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

    //this.cdRef.detectChanges();

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
      shesh_vasuli_rashi.toString(), ""
    ).subscribe(
      async (response) => {
        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          //this.cdRef.detectChanges();

          this.getDashboardDataFromServer();

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


  listenOnWeb() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.showError(transcript);
    };

    recognition.onerror = (event: any) => {
    };

    recognition.start();
  }

  async isConnectedToInternet(): Promise<boolean> {
    return await this.networkCheckService.getCurrentStatus()
  }

  getFullPathImage(photoName: string): string {
    return this.filePath + photoName;
  }


  async showImageAlert(imageUrl: string) {

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

  getColor(days: string, complain_progress_stage: string): string {

    const numDays = Number(days);
    const numComplain_progress_stage = Number(complain_progress_stage);

    if (numComplain_progress_stage === 2 || numComplain_progress_stage === 8) {
      if (numDays > 20) {
        return 'green';
      } else if (numDays > 10 && numDays <= 20) {
        return 'orange';
      } else {
        return 'red';
      }
    } else {
      if (numDays > 20) {
        return 'red';
      } else if (numDays > 10 && numDays <= 20) {
        return 'orange';
      } else {
        return 'green';
      }
    }

  }

  listOfCircle: any = [];
  listOfDivision: any = [];
  listOfSubDivision: any = [];
  listOfRang: any = [];
  listOfSubRang: any = [];
  listOfBit: any = [];
  selectedCircleId: any = null;
  selectedDivisionId: any = null;
  selectedSubDivisionId: any = null;
  selectedRangId: any = null;
  selectedSubRangId: any = null;
  selectedBitId: any = null;


  getCircle() {

    this.listOfCircle = [];
    this.selectedCircleId = null;

    this.listOfDivision = [];
    this.selectedDivisionId = null;

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
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


  getDivision() {

    this.listOfDivision = [];
    this.selectedDivisionId = null;
    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;
    this.listOfRang = [];
    this.selectedRangId = null;
    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getDivision(this.loginedOffierCircleId).subscribe(
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

  getSubDivision() {

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;
    this.listOfRang = [];
    this.selectedRangId = null;
    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSubDivision(this.loginedOffierDivisionId).subscribe(
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

  }


  getRang() {

    this.listOfRang = [];
    this.selectedRangId = null;
    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getRang(this.loginedOffierSub_DivisionId).subscribe(
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
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    //this.showDialog("कृपया प्रतीक्षा करें.....");
    this.apiService.getSubRang(this.loginedOffierRangId).subscribe(
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


  onChangeCircle(selected: any) {

    this.selectedCircleId = selected.id;

    this.listOfDivision = [];
    this.selectedDivisionId = null;

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDivision(this.selectedCircleId).subscribe(
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

  onChangeDivision(selected: any) {

    this.selectedDivisionId = selected.id;

    this.listOfSubDivision = [];
    this.selectedSubDivisionId = null;

    this.listOfRang = [];
    this.selectedRangId = null;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getSubDivision(this.selectedDivisionId).subscribe(
      async (response) => {
        await this.dismissDialog();

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

  onChangeSubDivision(selected: any) {

    this.selectedSubDivisionId = selected.id;

    this.listOfRang = [];
    this.selectedRangId = null;
    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getRang(this.selectedSubDivisionId).subscribe(
      async (response) => {
        await this.dismissDialog();

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


  onChangeRange(selected: any) {
    this.selectedRangId = selected.id;

    this.listOfSubRang = [];
    this.selectedSubRangId = null;
    this.listOfBit = [];
    this.selectedBitId = null;

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

  onChangeSubRange(selected: any) {

    this.selectedSubRangId = selected.id;

    this.listOfBit = [];
    this.selectedBitId = null;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getBeat(this.selectedSubRangId).subscribe(
      async (response) => {
        await this.dismissDialog();

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

  onChangeBit(selected: any) {
    this.selectedBitId = selected.id;
  }

  private safeValue(value: any): string {
    return value != null ? value.toString() : "";
  }

  clearFilter() {
    // Reset POR search
    this.listOfPOR_Count_RangWise = [];
    this.porSearchTerm = '';

    // Reset dropdown selections
    this.selectedCircleId = null;
    this.selectedDivisionId = null;
    this.selectedSubDivisionId = null;
    this.selectedRangId = null;
    this.selectedSubRangId = null;
    this.selectedBitId = null;

    // Reset filtered list
    this.filteredPorList = [];

    // Optionally, reset any other filter-related UI fields
    this.cdRef.detectChanges();

    this.getDashboardDataFromServer();

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

  getComplainStatus(item: any): string {
    if (item.complain_progress_stage === '17') {
      return 'उपवनमंडलाधिकारी द्वारा नस्तीबद्ध';
    } else if (item.complain_progress_stage === '18') {
      return 'वनमंडलाधिकारी द्वारा नस्तीबद्ध';
    } else {
      return 'लंबित';
    }
  }

  getPorCloserRemark(item: any): string {
    if (item.complain_progress_stage === '17' || item.complain_progress_stage === '18') {
      return item.assigner_remark;
    } else {
      return '';
    }
  }

  async getPorCountRangWise() {

    //this.listOfPOR_Count_RangWise = [];
    if (this.listOfPOR_Count_RangWise.length > 0) {
      this.downloadExcel_POR_Count_Rang_Wise();
      return;
    }

    let circle_div_subDiv_rang_id = "";
    if (this.loginedOffierDesignationId === "1") {
      circle_div_subDiv_rang_id = this.loginedOffierCircleId;
    } else if (this.loginedOffierDesignationId === "2") {
      circle_div_subDiv_rang_id = this.loginedOffierDivisionId;
    } else if (this.loginedOffierDesignationId === "3") {
      circle_div_subDiv_rang_id = this.loginedOffierSub_DivisionId;
    } else if (this.loginedOffierDesignationId === "4") {
      circle_div_subDiv_rang_id = this.loginedOffierRangId;
    } else if (this.loginedOffierDesignationId === "7") {
      circle_div_subDiv_rang_id = this.loginedOffierCircleId;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.downloadExcelPorCounts(
      this.loginedOffierEmpId,
      this.loginedOffierDesignationId,
      circle_div_subDiv_rang_id,

    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfPOR_Count_RangWise = response.complainData;
          this.downloadExcel_POR_Count_Rang_Wise();
        }

      },
      async (error) => {

        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );

  }



  async exportExcelOfFOCR_Prashman_Punji() {

    //
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PRASHMAN_PANJI_EXCEL");
    sheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 3 }
    ];
    const dataHeader = [
      ['प्रकरण अनुक्रमांक व वर्ष ',
        'प्राथमिक वन अपराध प्रकरण',
        '',
        'परिक्षेत्र',
        'परिसर',
        'अपराध घटना का दिनांक',
        'अपराधी का नाम, पिता का नाम व पता',
        'वन अपराध',
        'अधिनियम / नियम एवं धारा / नियम',
        'जांचोपरांत प्रकरण प्राप्त होने की तिथि',
        'वन अपराध से सम्बन्ध वनोपज हानि की राशि (रु.)',
        'जाँच का संक्षिप्त विवरण',
        '',
        '',
        'प्रशमन हेतु आदेशित राशि (रु.)',
        '',
        '',
        'अपराधी को प्रशमन के लिये प्रस्तावित प्रतिकर की राशि की सूचना देने बाबत व. म अ./उप व. म अ. के पंजीकृत पत्र क्रमांक एवं दिनांक',
        'परिक्षेत्र अधिकारी को प्रकरण प्रेषण का क्र./दिनांक',
        'वसूली का विवरण',
        '',
        '',
        '',
        '',
        'प्रकरण नस्तीबद्ध करने का दिनांक',
        'अधिकारी के हस्ताक्षर',
        'अन्य विवरण'],
      ['',
        'क्र.',
        'दिनांक',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'पारित आदेश',
        'क्र.',
        'दिनांक',
        'महसूल',
        'मावजा',
        'योग',
        '',
        '',
        'महसूल',
        'मुआवजा',
        'योग',
        'मनीरसीद क्र.एवं दिनांक',
        'लेखा समायोजन का डी.आर.नंबर एवं माह',
        '',
        '',
        ''
      ],
      [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
        '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'
      ]
    ];

    dataHeader.forEach(row => {
      sheet.addRow(row);
    });

    const merges = [

      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },

      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },

      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },

      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },

      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },

      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },

      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },

      { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },

      { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },

      { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },

      { s: { r: 0, c: 11 }, e: { r: 0, c: 13 } },

      { s: { r: 0, c: 14 }, e: { r: 0, c: 16 } },

      { s: { r: 0, c: 17 }, e: { r: 1, c: 17 } },

      { s: { r: 0, c: 18 }, e: { r: 1, c: 18 } },

      { s: { r: 0, c: 19 }, e: { r: 0, c: 23 } },

      { s: { r: 0, c: 24 }, e: { r: 1, c: 24 } },

      { s: { r: 0, c: 25 }, e: { r: 1, c: 25 } },

      { s: { r: 0, c: 26 }, e: { r: 1, c: 26 } },

    ];

    merges.forEach(m => {
      sheet.mergeCells(
        m.s.r + 1,
        m.s.c + 1,
        m.e.r + 1,
        m.e.c + 1
      );
    });

    let indexValue = 1;

    this.listForFOCR_Prashman_Punji.forEach(item => {

      let accRaw = item.accussed_detail || item.complain_table_accussed_detail || "";

      let parts = String(accRaw)
        .split(",")
        .map((x: string) => x.trim())
        .filter((x: string) => x.length > 0);

      let acc =
        parts.length <= 1
          ? parts.join("")
          : parts.map((x: string, i: number) => `${i + 1}. ${x}`).join("\n");

      if (item.japtiSamanDetail != null) {

        let mahsul_rashi = "";
        let mavja_rashi = "";
        let total_rashi_of_mahsul_and_mavja = "";
        let money_rasid_kramank_and_date = "";
        let dr_number_and_month = "";

        if (item.vasuliDetailList != null) {
          dr_number_and_month = item.vasuliDetailList.map(x => x.dr_number_and_month || "").join("\n");
          mahsul_rashi = item.vasuliDetailList.map(x => x.mahsul_rashi || "").join("\n");
          mavja_rashi = item.vasuliDetailList.map(x => x.mavja_rashi || "").join("\n");
          total_rashi_of_mahsul_and_mavja = item.vasuliDetailList.map(x => x.total_rashi || "").join("\n");
          money_rasid_kramank_and_date = item.vasuliDetailList.map(x => x.money_rasid_kramank_and_date || "").join("\n");
        }

        sheet.addRow([
          indexValue,
          item.por_number,
          item.date_of_crime,
          item.rang_name,
          item.beat_name,
          item.date_of_crime,
          acc,
          item.crime_type,
          this.getCrimDharaCommaSeparated(item.crime_dhara),
          item.back_to_ro_office_after_complete_janch,
          item.actual_loss,
          item.action_taken_at_prakran,
          item.adesh_kramank,
          item.adesh_dinank,
          item.vasuli_mahsul,
          item.vasuli_mavja,
          item.total_vasuli,
          '',
          '',
          mahsul_rashi,
          mavja_rashi,
          total_rashi_of_mahsul_and_mavja,
          money_rasid_kramank_and_date,
          dr_number_and_month,
          item.came_at_ro_after_nastibadh,
          '',
          ''
        ]);

      }

      indexValue++;

    });

    this.autoWidth(sheet);

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }),
      `वन अपराध प्रशमन पंजी${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }


  async exportExcelOfFOCR_Panji() {

    //
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("FORC_EXCEL");
    sheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 4 }
    ];
    const dataHeader = [
      ['अ.क्र.',
        'प्राथमिक अपराध सूचना',
        '',
        'परिक्षेत्र सहायक वृत्त',
        'परिसर',
        'पी.ओ.आर. जारी करने वाले\nअधिकारी का नाम व पद',
        'अपराधी का नाम, पिता का नाम व पता',
        'अपराध का प्रकार',
        'धारा',
        'जप्तशुदा वनौपज का विवरण',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'सुपूर्दकार का नाम एवं पद',
        'गवाहों का नाम व पता',
        'परिक्षेत्र में प्रकरण प्राप्त होने का दिनांक',
        'जाँच हेतु प्रकरण का प्रेषण',
        '',
        'जांचोपरांत प्रकरण प्राप्ति की तिथि',
        'प्रकरण उप वन मंडल कार्यालय को भेजने का क्रमांक एवं दिनांक',
        'जप्त वनोपज डिपो भेजने का विवरण',
        '',
        '',
        '',
        '',
        '',
        'व. म अ./उप व. म अ. कार्यालय से प्रकरण प्राप्त होने का दिनांक',
        'प्रकरण में लिया गया निर्णय - प्रशमन/कोर्ट चालान/अपलेखन',
        'प्रशमित प्रकरण में लिया गया निर्णय',
        '',
        '',
        'अपराधी को प्रशमन के लिये प्रस्तावित प्रतिकर की राशि की सूचना देने बाबत व. म अ./उप व. म अ. के पंजीकृत पत्र क्रमांक एवं दिनांक',
        'वसूली हेतु प. स. को प्रकरण भेजने का दिनांक',
        'वसूली उपरांत प्रकरण प्राप्ति दिनांक',
        'वसूली का विवरण',
        '',
        '',
        '',
        '',
        'वन मंडल कार्यालय को भेजने का क्रमांक एवं दिनांक',
        'न्यायालयीन प्रकरण का क्रमांक व चालान दिनांक',
        'अन्य विवरण'],

      ['',
        'क्रमांक',
        'दिनांक',
        '',
        '',
        '',
        '',
        '',
        '',
        'ठूंठ का विवरण',
        '',
        '',
        'लट्ठा का विवरण',
        '',
        '',
        'बल्ली का विवरण',
        '',
        'चिरान का विवरण',
        '',
        '',
        'जलाऊ का विवरण',
        '',
        'अन्य',
        '',
        '',
        '',
        'तिथि',
        'जाँच अधिकारी का नाम व पद',
        '',
        '',
        'चालान क्रमांक',
        'दिनांक',
        'वनोपज',
        'मात्रा(संख्या)',
        'मात्रा(घ.मी.)',
        'डिपो का नाम',
        '',
        '',
        'वसूली आदेशित',
        '',
        '',
        '',
        '',
        '',
        'महसूल',
        'मुआवजा',
        'योग',
        'मनीरसीद क्र.एवं दिनांक',
        'लेखा समायोजन का डी.आर.नंबर एवं माह',
        '',
        '',
        ''],

      ['',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'प्रजाति',
        'गोलाई वर्ग',
        'संख्या',
        'प्रजाति',
        'संख्या',
        'घन मीटर',
        'प्रजाति',
        'संख्या',
        'प्रजाति',
        'संख्या',
        'घन मीटर',
        'प्रजाति',
        'चट्टा संख्या',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'महसूल',
        'मुआवजा',
        'योग',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''],

      [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
        '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
        '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44',
        '45', '46', '47', '48', '49', '50', '51', '52'
      ]


    ];

    // ------------------------------
    // 1) Add Header Rows
    // ------------------------------
    dataHeader.forEach(row => {
      sheet.addRow(row);
    });

    // ------------------------------
    // 2) Apply All Merges
    // ------------------------------
    const merges = [

      { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },

      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } },
      { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } },

      { s: { r: 0, c: 3 }, e: { r: 2, c: 3 } },

      { s: { r: 0, c: 4 }, e: { r: 2, c: 4 } },

      { s: { r: 0, c: 5 }, e: { r: 2, c: 5 } },

      { s: { r: 0, c: 6 }, e: { r: 2, c: 6 } },

      { s: { r: 0, c: 7 }, e: { r: 2, c: 7 } },

      { s: { r: 0, c: 8 }, e: { r: 2, c: 8 } },

      { s: { r: 0, c: 9 }, e: { r: 0, c: 21 } },


      { s: { r: 1, c: 9 }, e: { r: 1, c: 11 } },
      { s: { r: 1, c: 12 }, e: { r: 1, c: 14 } },
      { s: { r: 1, c: 15 }, e: { r: 1, c: 16 } },
      { s: { r: 1, c: 17 }, e: { r: 1, c: 19 } },
      { s: { r: 1, c: 20 }, e: { r: 1, c: 21 } },
      { s: { r: 1, c: 22 }, e: { r: 2, c: 22 } },

      { s: { r: 0, c: 23 }, e: { r: 2, c: 23 } },

      { s: { r: 0, c: 24 }, e: { r: 2, c: 24 } },

      { s: { r: 0, c: 25 }, e: { r: 2, c: 25 } },

      { s: { r: 0, c: 26 }, e: { r: 0, c: 27 } },
      { s: { r: 1, c: 26 }, e: { r: 2, c: 26 } },
      { s: { r: 1, c: 27 }, e: { r: 2, c: 27 } },

      { s: { r: 0, c: 28 }, e: { r: 2, c: 28 } },

      { s: { r: 0, c: 29 }, e: { r: 2, c: 29 } },

      { s: { r: 0, c: 30 }, e: { r: 0, c: 35 } },
      { s: { r: 1, c: 30 }, e: { r: 2, c: 30 } },
      { s: { r: 1, c: 31 }, e: { r: 2, c: 31 } },
      { s: { r: 1, c: 32 }, e: { r: 2, c: 32 } },
      { s: { r: 1, c: 33 }, e: { r: 2, c: 33 } },
      { s: { r: 1, c: 34 }, e: { r: 2, c: 34 } },
      { s: { r: 1, c: 35 }, e: { r: 2, c: 35 } },

      { s: { r: 0, c: 36 }, e: { r: 2, c: 36 } },
      { s: { r: 0, c: 37 }, e: { r: 2, c: 37 } },

      { s: { r: 0, c: 38 }, e: { r: 0, c: 40 } },
      { s: { r: 1, c: 38 }, e: { r: 1, c: 40 } },

      { s: { r: 0, c: 41 }, e: { r: 2, c: 41 } },

      { s: { r: 0, c: 42 }, e: { r: 2, c: 42 } },

      { s: { r: 0, c: 43 }, e: { r: 2, c: 43 } },

      { s: { r: 0, c: 44 }, e: { r: 0, c: 48 } },
      { s: { r: 1, c: 44 }, e: { r: 2, c: 44 } },
      { s: { r: 1, c: 45 }, e: { r: 2, c: 45 } },
      { s: { r: 1, c: 46 }, e: { r: 2, c: 46 } },
      { s: { r: 1, c: 47 }, e: { r: 2, c: 47 } },
      { s: { r: 1, c: 48 }, e: { r: 2, c: 48 } },

      { s: { r: 0, c: 49 }, e: { r: 2, c: 49 } },

      { s: { r: 0, c: 50 }, e: { r: 2, c: 50 } },

      { s: { r: 0, c: 51 }, e: { r: 2, c: 51 } }

      // { s: { r: 0, c: 34 }, e: { r: 0, c: 36 } },
      // { s: { r: 0, c: 45 }, e: { r: 2, c: 45 } },
      // { s: { r: 0, c: 46 }, e: { r: 2, c: 46 } },
      // { s: { r: 0, c: 47 }, e: { r: 2, c: 47 } },














      // { s: { r: 1, c: 40 }, e: { r: 2, c: 40 } },
      // { s: { r: 1, c: 41 }, e: { r: 2, c: 41 } },
      // { s: { r: 1, c: 42 }, e: { r: 2, c: 42 } },
      // { s: { r: 1, c: 43 }, e: { r: 2, c: 43 } },
      // { s: { r: 1, c: 44 }, e: { r: 2, c: 44 } }


    ];

    merges.forEach(m => {
      sheet.mergeCells(
        m.s.r + 1,
        m.s.c + 1,
        m.e.r + 1,
        m.e.c + 1
      );
    });

    let indexValue = 1;

    this.listForFOCR_Panji.forEach(item => {

      // ------------------------------
      // 1️⃣ Accussed formatting (serial only if comma exists)
      // ------------------------------
      let accRaw = item.accussed_detail || item.complain_table_accussed_detail || "";

      let parts = String(accRaw)
        .split(",")
        .map((x: string) => x.trim())
        .filter((x: string) => x.length > 0);

      let acc =
        parts.length <= 1
          ? parts.join("")
          : parts.map((x: string, i: number) => `${i + 1}. ${x}`).join("\n");

      let witnessData = item.witness_detail

      let partsWitness = String(witnessData)
        .split(",")
        .map((x: string) => x.trim())
        .filter((x: string) => x.length > 0);

      let witnessDataToPrint =
        partsWitness.length <= 1
          ? partsWitness.join("")
          : partsWitness.map((x: string, i: number) => `${i + 1}. ${x}`).join("\n");

      if (item.japtiSamanDetail != null) {
        // // ------------------------------
        // // 2️⃣ Group japti saman by type
        // // ------------------------------
        // const thunth = item.japtiSamanDetail.filter(x => x.japtSamanType === 1);
        // const lattha = item.japtiSamanDetail.filter(x => x.japtSamanType === 2);
        // const anya = item.japtiSamanDetail.filter(x => x.japtSamanType === 3);
        // const chiran = item.japtiSamanDetail.filter(x => x.japtSamanType === 4);
        // const chatta = item.japtiSamanDetail.filter(x => x.japtSamanType === 5);
        // const balli = item.japtiSamanDetail.filter(x => x.japtSamanType === 6);

        // // ------------------------------
        // // 3️⃣ calculate max rows
        // // ------------------------------
        // const maxRows = Math.max(
        //   thunth.length,
        //   lattha.length,
        //   balli.length,
        //   chiran.length,
        //   chatta.length,
        //   anya.length
        // );

        // // ------------------------------
        // // 4️⃣ Add rows dynamically
        // // ------------------------------
        // for (let i = 0; i < maxRows; i++) {

        //   sheet.addRow([
        //     i === 0 ? indexValue : "",  // only first row shows index
        //     i === 0 ? item.por_number : "",
        //     i === 0 ? item.date_of_crime : "",
        //     i === 0 ? item.ra_name : "",
        //     i === 0 ? item.beat_name : "",
        //     i === 0 ? item.complain_creator_name_designation : "",
        //     i === 0 ? acc : "",

        //     // ठूंठ
        //     thunth[i]?.prajatiName || "",
        //     thunth[i]?.golai || "",
        //     thunth[i]?.nag || "",

        //     // लट्ठा
        //     lattha[i]?.prajatiName || "",
        //     lattha[i]?.nag || "",
        //     lattha[i]?.ghan_meter || "",

        //     // बल्लि
        //     balli[i]?.prajatiName || "",
        //     balli[i]?.nag || "",

        //     // चिरान
        //     chiran[i]?.prajatiName || "",
        //     chiran[i]?.nag || "",
        //     chiran[i]?.ghan_meter || "",

        //     // जलाऊ/छत्ता
        //     chatta[i]?.prajatiName || "",
        //     chatta[i]?.nag || "",

        //     // अन्य
        //     anya[i]?.if_other_then_detail || "",
        //   ]);
        // }




        const thunth = item.japtiSamanDetail.filter(x => x.japtSamanType === 1);
        const lattha = item.japtiSamanDetail.filter(x => x.japtSamanType === 2);
        const anya = item.japtiSamanDetail.filter(x => x.japtSamanType === 3);
        const chiran = item.japtiSamanDetail.filter(x => x.japtSamanType === 4);
        const chatta = item.japtiSamanDetail.filter(x => x.japtSamanType === 5);
        const balli = item.japtiSamanDetail.filter(x => x.japtSamanType === 6);

        // ------------------------------
        // Each field in its OWN multiline text
        // ------------------------------

        const thunth_prajati = thunth.map(x => x.prajatiName || "").join("\n");
        const thunth_golai = thunth.map(x => x.golai || "").join("\n");
        const thunth_nag = thunth.map(x => x.nag || "").join("\n");

        const lattha_prajati = lattha.map(x => x.prajatiName || "").join("\n");
        const lattha_golai = lattha.map(x => x.nag || "").join("\n");
        const lattha_ghan = lattha.map(x => x.ghan_meter || "").join("\n");

        const balli_prajati = balli.map(x => x.prajatiName || "").join("\n");
        const balli_nag = balli.map(x => x.nag || "").join("\n");

        const chiran_prajati = chiran.map(x => x.prajatiName || "").join("\n");
        const chiran_nag = chiran.map(x => x.nag || "").join("\n");
        const chiran_ghan = chiran.map(x => x.ghan_meter || "").join("\n");

        const chatta_prajati = chatta.map(x => x.prajatiName || "").join("\n");
        const chatta_nag = chatta.map(x => x.nag || "").join("\n");

        const anya_text = anya.map(x => x.if_other_then_detail || "").join("\n");



        ////////// DEPOR DETAIL ///////////////
        //
        let depoChallan = "";
        let challanDate = "";
        let totalMatraInGhanMeter = "";
        let total_matra_in_sankhya = "";
        let vanopaj_type = "";
        let depoName = "";

        if (item.depoDetailList != null) {
          total_matra_in_sankhya = item.depoDetailList.map(x => x.total_matra_in_sankhya || "").join("\n");
          vanopaj_type = item.depoDetailList.map(x => x.vanopaj_type || "").join("\n");
          depoChallan = item.depoDetailList.map(x => x.challan_kramank || "").join("\n");
          challanDate = item.depoDetailList.map(x => x.challan_date || "").join("\n");
          totalMatraInGhanMeter = item.depoDetailList.map(x => x.total_matra_in_ghan_meter || "").join("\n");
          depoName = item.depoDetailList.map(x => x.depo_name || "").join("\n");
        }

        let mahsul_rashi = "";
        let mavja_rashi = "";
        let total_rashi_of_mahsul_and_mavja = "";
        let money_rasid_kramank_and_date = "";
        let dr_number_and_month = "";

        if (item.vasuliDetailList != null) {
          dr_number_and_month = item.vasuliDetailList.map(x => x.dr_number_and_month || "").join("\n");
          mahsul_rashi = item.vasuliDetailList.map(x => x.mahsul_rashi || "").join("\n");
          mavja_rashi = item.vasuliDetailList.map(x => x.mavja_rashi || "").join("\n");
          total_rashi_of_mahsul_and_mavja = item.vasuliDetailList.map(x => x.total_rashi || "").join("\n");
          money_rasid_kramank_and_date = item.vasuliDetailList.map(x => x.money_rasid_kramank_and_date || "").join("\n");
        }

        // ------------------------------
        // Add a SINGLE ROW with multiline cells
        // ------------------------------
        sheet.addRow([
          indexValue,
          item.por_number,
          item.date_of_crime,
          item.ra_name,
          item.beat_name,
          item.complain_creator_name_designation,
          acc,
          item.crime_type,
          item.crime_dhara,
          // ठूंठ (3 columns)
          thunth_prajati,
          thunth_golai,
          thunth_nag,

          // लट्ठा (3 columns)
          lattha_prajati,
          lattha_golai,
          lattha_ghan,

          // बल्लि (2 columns)
          balli_prajati,
          balli_nag,

          // चिरान (3 columns)
          chiran_prajati,
          chiran_nag,
          chiran_ghan,

          // छत्ता (2 columns)
          chatta_prajati,
          chatta_nag,

          // अन्य (1 column)
          anya_text,
          item.supurd_dar_name,
          witnessDataToPrint,
          item.por_reached_at_ro_office,
          item.janch_karta_ko_jab_por_diya_gaya,
          item.janch_karta_name_or_pad,
          item.back_to_ro_office_after_complete_janch,
          item.come_at_sdo_office,
          depoChallan,
          challanDate,
          vanopaj_type,
          total_matra_in_sankhya,
          totalMatraInGhanMeter,
          depoName,
          item.come_at_ro_after_janch_from_sdo_or_dfo,
          item.action_taken_at_prakran,
          item.vasuli_mahsul,
          item.vasuli_mavja,
          item.total_vasuli,
          '',
          item.sent_to_vasuli,
          item.came_after_vasuli,
          mahsul_rashi,
          mavja_rashi,
          total_rashi_of_mahsul_and_mavja,
          money_rasid_kramank_and_date,
          dr_number_and_month,
          item.came_at_ro_after_nastibadh
        ]);

      }


      indexValue++;
    });
    //
    this.autoWidth(sheet);

    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }),
      `FORC_EXCEL_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }

  autoWidth(ws: ExcelJS.Worksheet, minWidth = 8, padding = 2, maxWidth = 50) {
    if (!ws || !ws.columns) return;

    // ⭐ 1) APPLY HEADER STYLE FOR ROWS 0,1,2 (Excel rows 1,2,3)
    for (let r = 1; r <= 4; r++) {
      const row = ws.getRow(r);
      row.eachCell((cell) => {
        cell.font = { bold: true };                  // Bold
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; // Center
      });
    }

    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber > 4) {
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: "center",
            vertical: "top",
            wrapText: true
          };
        });

        row.getCell(7).alignment = {
          horizontal: "left",
          vertical: "top",
          wrapText: true
        };

      }

    });



    // ⭐ 3) AUTO WIDTH LOGIC
    ws.columns.forEach((col) => {
      if (!col) return;
      const column = col as ExcelJS.Column;

      let maxLength = minWidth;

      column.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
        let text = "";
        const value = cell.value;

        if (value == null) {
          text = "";
        } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          text = String(value);
        } else if ((value as any).richText) {
          text = (value as any).richText.map((r: any) => r.text).join("");
        } else if ((value as any).formula && (value as any).result != null) {
          text = String((value as any).result);
        } else if ((value as any).text) {
          text = String((value as any).text);
        } else {
          try {
            text = JSON.stringify(value);
          } catch {
            text = String(value);
          }
        }

        // handle newline — check longest line
        const lines = text.split(/\r\n|\n/);
        lines.forEach(line => {
          if (line.length > maxLength) maxLength = line.length;
        });
      });

      //column.width = Math.min(maxLength + padding, maxWidth);

      column.width = Math.min(Math.ceil((maxLength * 0.6)) + padding, maxWidth);


    });

  }


  async downloadExcel_POR_Count_Rang_Wise() {

    if (this.listOfPOR_Count_RangWise.length > 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        [
          'वृत्त का नाम (Circle)',
          'वन मंडल (Division)',
          'उप वन मंडल (Sub Division)',
          'परिक्षेत्र (Rang)',
          'TOTAL POR'
        ]
      ]);

      const data: any[][] = [];
      let totalPorCount = 0;

      this.listOfPOR_Count_RangWise.forEach(item => {
        const row = [
          item.circle_name,
          item.div_name,
          item.sub_div_name,
          item.rang_name,
          item.por_count
        ];

        data.push(row);
        totalPorCount += Number(item.por_count) || 0;
      });

      // Add data to sheet
      XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

      // Add total row at the end
      const totalRow = [
        '', // Circle
        '', // Division
        '', // Sub Division
        'कुल योग (Total)', // Rang column
        totalPorCount // Total POR
      ];

      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 });

      // Create workbook and save
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'POR_COUNT_LIST');

      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(blob, `POR_COUNT_LIST_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  }


  async downloadExcel_POR_Count_Division_Wise() {

    if (this.listOfPorCountData.length > 0) {
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        [
          'वृत्त का नाम (Circle)',
          'वन मंडल (Division)',
          'कुल POR',
          'कुल ज्ञात POR',
          'कुल अज्ञात POR',
          'कुल नस्तीबद्ध POR',
          'कुल नस्तीबद्ध हेतु शेष'
        ]
      ]);

      const data: any[][] = [];
      let totalPorCount = 0;
      let totalgyatPOR = 0;
      let totalAgyatPOR = 0;
      let totalNastibadhaPorCount = 0;
      let totalSheshNastibadhaPorCount = 0;

      this.listOfPorCountData.forEach(item => {
        const row = [
          item.circleName,
          item.divisionName,
          item.totalPOR,
          item.totalGyatPOR,
          item.totalAGyatPOR,
          item.nastibadhaPOR,
          item.underProcessPOR
        ];

        data.push(row);
        totalPorCount += Number(item.totalPOR) || 0;
        totalgyatPOR += Number(item.totalGyatPOR) || 0;
        totalAgyatPOR += Number(item.totalAGyatPOR) || 0;
        totalNastibadhaPorCount += Number(item.nastibadhaPOR) || 0;
        totalSheshNastibadhaPorCount += Number(item.underProcessPOR) || 0;
      });

      // Add data to sheet
      XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

      // Add total row at the end
      const totalRow = [
        '', // Sub Division
        'महायोग', // Rang column
        totalPorCount, // Total POR
        totalgyatPOR,
        totalAgyatPOR,
        totalNastibadhaPorCount,
        totalSheshNastibadhaPorCount
      ];

      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 });

      // Create workbook and save
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'POR_COUNT_DIVISION_WISE');

      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(blob, `POR_COUNT_DIVISION_WISE${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  }

  async getPrakranPanjiyanRegister() {

    if (this.listOfPOR_Registr_Detail.length > 0) {
      this.downloadPrakranPanjiExcel();
      return;
    }


    let circle_div_subDiv_rang_id = "";
    if (this.loginedOffierDesignationId === "1") {
      circle_div_subDiv_rang_id = this.loginedOffierCircleId;
    } else if (this.loginedOffierDesignationId === "2") {
      circle_div_subDiv_rang_id = this.loginedOffierDivisionId;
    } else if (this.loginedOffierDesignationId === "3") {
      circle_div_subDiv_rang_id = this.loginedOffierSub_DivisionId;
    } else if (this.loginedOffierDesignationId === "4") {
      circle_div_subDiv_rang_id = this.loginedOffierRangId;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.downloadExcelPorRegisterData(
      this.loginedOffierEmpId,
      this.loginedOffierDesignationId,
      circle_div_subDiv_rang_id,

    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfPOR_Registr_Detail = response.register_data;
          this.downloadPrakranPanjiExcel();

        }

      },
      async (error) => {

        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );


  }

  async downloadDataOf_PrashmanPunji() {

    if (this.listForFOCR_Prashman_Punji.length > 0) {
      this.exportExcelOfFOCR_Prashman_Punji();
      return;
    }

    let circle_div_subDiv_rang_id = "";
    if (this.loginedOffierDesignationId === "1") {
      circle_div_subDiv_rang_id = this.loginedOffierCircleId;
    } else if (this.loginedOffierDesignationId === "2") {
      circle_div_subDiv_rang_id = this.loginedOffierDivisionId;
    } else if (this.loginedOffierDesignationId === "3") {
      circle_div_subDiv_rang_id = this.loginedOffierSub_DivisionId;
    } else if (this.loginedOffierDesignationId === "4") {
      circle_div_subDiv_rang_id = this.loginedOffierRangId;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDataFor_FOCR_PrashmanPunji(
      this.loginedOffierEmpId,
      this.loginedOffierDesignationId,
      circle_div_subDiv_rang_id,
      this.startDate, this.endDate

    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {
          this.listForFOCR_Prashman_Punji = response.register_data_focr_modal;

          for (let item of this.listForFOCR_Panji) {
            item.crime_dhara = this.getCrimDharaCommaSeparated(item.crime_dhara);
          }

          this.exportExcelOfFOCR_Prashman_Punji();
        }

      },
      async (error) => {

        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );

  }

  getStageNameAccordingToProgress(item: ComplainDetails): string {
    let progressStage = item.complain_progress_stage;

    if (progressStage === "6" || progressStage === "7" || progressStage === "9" || progressStage === "11" || progressStage === "17" || progressStage === "18") {

      let stageName = "";

      if (progressStage === "6" || progressStage === "7") {
        stageName = "अपलेखित";
      } else if (progressStage === "9" || progressStage === "11") {
        stageName = "अभिसन्धान";
      } else if (progressStage === "17" || progressStage === "18") {
        stageName = "नस्तीबद्ध";
      }

      return stageName;

    }

    return item.stage_name;

  }

  async downloadDataOf_FOCR_Panji() {
    if (this.listForFOCR_Panji.length > 0) {
      this.exportExcelOfFOCR_Panji();
      return;
    }

    let circle_div_subDiv_rang_id = "";
    if (this.loginedOffierDesignationId === "1") {
      circle_div_subDiv_rang_id = this.loginedOffierCircleId;
    } else if (this.loginedOffierDesignationId === "2") {
      circle_div_subDiv_rang_id = this.loginedOffierDivisionId;
    } else if (this.loginedOffierDesignationId === "3") {
      circle_div_subDiv_rang_id = this.loginedOffierSub_DivisionId;
    } else if (this.loginedOffierDesignationId === "4") {
      circle_div_subDiv_rang_id = this.loginedOffierRangId;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDataFor_FOCR_Panji(
      this.loginedOffierEmpId,
      this.loginedOffierDesignationId,
      circle_div_subDiv_rang_id,

    ).subscribe(
      async (response) => {
        await this.dismissDialog();

        if (response.response.code === 200) {
          this.listForFOCR_Panji = response.register_data_focr_modal;

          for (let item of this.listForFOCR_Panji) {
            item.crime_dhara = this.getCrimDharaCommaSeparated(item.crime_dhara);
          }

          this.exportExcelOfFOCR_Panji();
        }

      },
      async (error) => {

        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );

  }

  async downloadPrakranPanjiExcel() {

    if (this.listOfPOR_Registr_Detail.length > 0) {

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        [
          'परिक्षेत्र का प्रकरण पंजीयन क्रमांक व दिनांक',
          'जारी किये गए पी.ओ.आर. क्र. व दिनांक',
          'पी.ओ.आर. जारी करने वाले अधिकारी/कर्मचारी का नाम व पद',
          'परिक्षेत्र कार्यालय में पी.ओ.आर. प्राप्त होने का दिनांक',
          'परिक्षेत्र सहायक वृत्त का नाम',
          'अपराधी का नाम वल्दियत जाति एवं सकूनत',
          'गवाहों का नाम व पता',
          'सुपुर्ददार का नाम व पता',
          'जप्त शूदा वनोपज का विवरण',
          'प्रकरण जाँच हेतु परिक्षेत्र सहायक/प.अ. को दिये जाने का दिनांक',
          'अधिकारी का नाम व पद जिसे जाँच हेतु प्रकरण दिया गया',
          'विवेचना की अवधि में वृद्धि की गई हो तो उसका विवरण',
          'जाँच के पश्चात् प्रकरण कार्यालय में प्राप्त होने का दिनांक',
          'प्रकरण में जप्त वनोपज का चा. क्र. एवं दिनांक तथा डिपो का नाम',
          'प्रकरण उप. व. म. अ. को भेजने का दिनांक',
          'प्रकरण कम्पाउंड पश्चात् प. अ. कार्यालय में प्राप्त होने का दिनांक',
          'प्रकरण के लिए गए निर्णय का विवरण',
          '', '', '',
          'वसूली का विवरण', '', '', '',
          'मनी रसीद क्रमांक व दिनांक',
          'चालान क्रमांक',
          'राशि समायोजन का विवरण',
          '',
          'प्रकरण के पूर्ण कार्यवाही के बाद नस्तीबद्ध करने हेतु भेजने का दिनांक'
        ],
        [
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'माव्जा', 'महसूल', 'अन्य', 'योग', 'माव्जा', 'महसूल', 'अन्य', 'योग',
          '', '', 'डी. आर. नं.', 'माह', ''
        ]
      ]);

      // const mergeCenters = [
      //   { r: 0, c: 16 },
      //   { r: 0, c: 20 },
      //   { r: 0, c: 26 }
      // ];


      (ws as any)['!merges'] = [
        { s: { r: 0, c: 16 }, e: { r: 0, c: 19 } }, // माव्जा-महसूल-अन्य-योग
        { s: { r: 0, c: 20 }, e: { r: 0, c: 23 } }, // माव्जा-महसूल-अन्य-योग
        { s: { r: 0, c: 26 }, e: { r: 0, c: 27 } },  // डी. आर. नं. - माह

        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
        { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
        { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
        { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
        { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
        { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },

        { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
        { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
        { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } },
        { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } },
        { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } },
        { s: { r: 0, c: 15 }, e: { r: 1, c: 15 } },
      ];


      // mergeCenters.forEach(cell => {
      //   const cellRef = XLSX.utils.encode_cell(cell);
      //   if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      //   ws[cellRef].s = {
      //     alignment: { horizontal: 'center', vertical: 'center' },
      //     font: { bold: true }
      //   };
      // });

      // --- Optionally, bold and center first 16 columns ---
      for (let c = 0; c <= 15; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[cellRef]) {
          ws[cellRef].s = ws[cellRef].s || {};
          ws[cellRef].s.font = { bold: true };
          ws[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
        }
      }

      // --- Prepare data rows ---
      const data: any[][] = [];

      let indexValue = 1;
      this.listOfPOR_Registr_Detail.forEach(item => {

        const row = [
          indexValue,
          item.date_to_jari_por,
          item.complain_creator_name_designation,
          item.por_reached_at_ro_office,
          item.ra_name,
          item.accussed_detail,
          item.witness_detail,
          item.supurd_dar_name,
          item.vanopaj_detail,
          item.janch_karta_ko_jab_por_diya_gaya,
          item.janch_karta_name_or_pad,
          item.if_janch_extended_then_detail,
          item.back_to_ro_office_after_complete_janch,
          item.challan_detail,
          item.come_at_sdo_office,
          item.prakran_compound_pashchyat,
          item.prakran_mavja, item.prakran_mahsul, '', item.prakran_total, '', '', '', '',
          item.money_rasid_kramank_or_date,
          item.chalan_kramank,
          '', '',
          item.after_nastibadh_back_at
        ];

        data.push(row);
        indexValue = indexValue + 1;
      });


      XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'FORC_EXCEL');

      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(blob, `FORC_EXCEL_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

  }


  async downloadExcel() {

    if (this.localListToFilterComplainDetail.length > 0) {



      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        [
          'वृत्त का नाम (Circle)',
          'वन मंडल (Division)',
          'उप वन मंडल (Sub Division)',
          'परिक्षेत्र (Rang)',
          'उप परिक्षेत्र (Sub Rang)',
          'बीट (Beat)',
          'POR क्रमांक',
          'अपराध पंजीयन दिनांक',
          'अपराधी का नाम',
          'पिता का नाम',
          'वर्तमान स्थिति',
          'अपराध का प्रकार',
          'अपराध की धारा',
          'POR की स्थिति'
        ]
      ]);

      const data: any[][] = [];

      this.localListToFilterComplainDetail.forEach(item => {
        const row = [
          item.circle_name,
          item.division_name,
          item.sub_division_name,
          item.range_name,
          item.sub_range_name,
          item.beat_name,
          item.por_number,
          item.date_of_crime,
          item.accused_name,
          item.accused_fathers_name,
          item.stage_name,
          item.crime_type,
          this.getCrimDharaCommaSeparated(item.crime_dhara),
          this.getComplainStatus(item)

        ];

        data.push(row);
      });

      XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

      // Save as before
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'POR_LIST');

      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      FileSaver.saveAs(blob, `POR_LIST_${new Date().toISOString().split('T')[0]}.xlsx`);

    }

  }

  async downloadBoxDataExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Summary_Data');

    const headers: string[] = [];
    const values: any[] = [];

    const formatDateDDMMYYYY = (input: any): string => {
      if (!input) return '';
      if (input instanceof Date) {
        const dd = String(input.getDate()).padStart(2, '0');
        const mm = String(input.getMonth() + 1).padStart(2, '0');
        const yyyy = input.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      if (typeof input === 'string') {
        const s = input.trim();
        const ymd = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/); // yyyy-mm-dd or yyyy/mm/dd
        if (ymd) return `${ymd[3]}-${ymd[2]}-${ymd[1]}`;
        const dmy = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/); // dd-mm-yyyy or dd/mm/yyyy
        if (dmy) return `${dmy[1]}-${dmy[2]}-${dmy[3]}`;
      }
      const dt = new Date(input);
      if (!Number.isNaN(dt.getTime())) {
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      return String(input);
    };

    // Define boxes with visibility logic
    const boxes = [
      { label: 'कुल POR', value: this.totalComplains, visible: true },
      { label: 'नामजद प्रकरण', value: this.gyatAccussedFromTotalPOR, visible: true },
      { label: 'अज्ञात प्रकरण', value: this.agyatAccussedFromTotalPOR, visible: true },
      { label: 'बीट निरिक्षण', value: this.totalPORBeatNirikshan, visible: true },
      { label: 'स्वयं स्तर पर कुल लंबित POR', value: this.totalPendingComplains, visible: !this.isBG && !this.isCCF && !this.isSUPER_ADMIN },
      { label: 'मुख्य वन संरक्षक स्तर पर लंबित', value: this.totalPendingComplainsAtCCFLevel, visible: true },
      { label: 'वनमंडलाधिकारी स्तर पर लंबित', value: this.totalPendingComplains, visible: this.isCCF || this.isSUPER_ADMIN },
      { label: 'उपवनमंडलाधिकारी स्तर पर लंबित', value: this.totalPendingPOR_To_Complete_At_SDO_Level, visible: this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'वनमंडलाधिकारी स्तर पर लंबित', value: this.totalPendingPOR_To_Complete_At_DFO_Level, visible: this.isSDO || this.isRO },
      { label: 'जाँच अधिकारी नियुक्ति हेतु लंबित', value: this.totalPendingPOR_To_Assign_RA, visible: this.isSUPER_ADMIN },
      { label: 'जाँच हेतु लंबित', value: this.totalPendingPOR_To_Complete_At_RA_Level, visible: this.isSDO || this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'उपवनमंडलाधिकारी को प्रेषण हेतु लंबित', value: this.totalPendingPOR_To_Forward_SDO, visible: this.isSDO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'अपलेखित', value: this.totalAplekhitComplains, visible: this.isSDO || this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'अभिसन्धान/प्रशमन', value: this.totalAbhisandhanComplains, visible: this.isSDO || this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'कोर्ट चालान', value: this.totalCourtChallanComplains, visible: this.isSDO || this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'नस्तीबध्द', value: this.totalNastibadhPOR, visible: this.isSDO || this.isRO || this.isDFO || this.isCCF || this.isSUPER_ADMIN },
      { label: 'नस्तीबध्द हेतु लंबित', value: this.totalPORPendingToNastibadh, visible: true }
    ];

    // Collect visible headers and values
    boxes.forEach(box => {
      if (box.visible) {
        headers.push(box.label);
        values.push(box.value);
      }
    });

    const totalCols = headers.length;

    // Row 1: Date Range
    const fromDate = formatDateDDMMYYYY(this.startDate);
    const toDate = formatDateDDMMYYYY(this.endDate);
    const dateRow = worksheet.addRow([`Date Range: ${fromDate} to ${toDate}`]);
    worksheet.mergeCells(1, 1, 1, totalCols); // Merge from A1 to the last column
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    dateRow.getCell(1).font = { bold: true, size: 12 };

    // Row 2: Empty
    worksheet.addRow([]);

    // Row 3: Headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });

    // Row 4: Serial numbers (1..N)
    const serialRow = worksheet.addRow(headers.map((_, i) => i + 1));
    serialRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 5: Values
    const valueRow = worksheet.addRow(values);
    valueRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column) {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          // Ignore the merged date row (row 1) and the empty spacer row (row 2)
          // so column widths are driven by header/value cells only.
          const rowIndex = Number((cell as any).row);
          if (rowIndex && rowIndex <= 2) return;
          if ((cell as any).isMerged) return;

          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        // ExcelJS width is "approx characters". Keep it tight: no forced minimum, no extra padding.
        // Add a tiny breathing space so text doesn't touch borders.
        column.width = Math.max(1, maxLength + 0.5);
      }
    });

    // Generate and save
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, `Dashboard_Summary_${this.startDate}_to_${this.endDate}.xlsx`);
    });
  }

  async downloadTableDataExcel() {
    if (this.listOfPorCountData.length === 0) {
      this.shortToast("डाउनलोड करने के लिए कोई डेटा नहीं है");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Table_Data', {
      views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }]
    });

    // Match the on-screen table 1:1 (18 columns; metric order matches dashboard cards).
    const headers = [
      'क्र.',                                            // 1
      'वृत्त का नाम',                                     // 2
      'वन मंडल का नाम',                                   // 3
      'कुल POR',                                         // 4
      'नामजद प्रकरण',                                    // 5
      'अज्ञात प्रकरण',                                   // 6
      'बीट निरीक्षण',                                    // 7
      'जाँच अधिकारी नियुक्ति हेतु लंबित',                  // 8
      'जाँच हेतु लंबित',                                  // 9
      'उपवनमंडलाधिकारी को प्रेषण हेतु लंबित',              // 10
      'उपवनमंडलाधिकारी स्तर पर लंबित',                    // 11
      'वनमंडलाधिकारी स्तर पर लंबित',                      // 12
      'मुख्य वन संरक्षक स्तर पर लंबित',                    // 13
      'अभिसंधानित',                                     // 14
      'अपलेखित',                                        // 15
      'कोर्ट चालान',                                    // 16
      'नस्तीबद्ध हेतु लंबित',                            // 17
      'नस्तीबद्ध'                                       // 18
    ];

    const totalCols = headers.length;

    // Style palette (matches the on-screen p-table colors).
    const HEADER_FILL_ARGB = 'FF1E3A8A'; // deep indigo
    const HEADER_TEXT_ARGB = 'FFFFFFFF';
    const TOTAL_FILL_ARGB = 'FFDBEAFE';  // light blue (per-circle TOTAL row)
    const MAHAYOG_FILL_ARGB = 'FFFEF3C7'; // amber (footer महायोग)
    const ZEBRA_FILL_ARGB = 'FFF8FAFC';   // very light zebra stripe
    const FONT_NAME = 'Noto Sans Devanagari';

    const formatDateDDMMYYYY = (input: any): string => {
      if (!input) return '';
      if (input instanceof Date) {
        const dd = String(input.getDate()).padStart(2, '0');
        const mm = String(input.getMonth() + 1).padStart(2, '0');
        const yyyy = input.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      if (typeof input === 'string') {
        const s = input.trim();
        const ymd = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (ymd) return `${ymd[3]}-${ymd[2]}-${ymd[1]}`;
        const dmy = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (dmy) return `${dmy[1]}-${dmy[2]}-${dmy[3]}`;
      }
      const dt = new Date(input);
      if (!Number.isNaN(dt.getTime())) {
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      return String(input);
    };

    const thinBorder: ExcelJS.Borders = {
      top: { style: 'thin', color: { argb: 'FFB0B7C3' } },
      left: { style: 'thin', color: { argb: 'FFB0B7C3' } },
      bottom: { style: 'thin', color: { argb: 'FFB0B7C3' } },
      right: { style: 'thin', color: { argb: 'FFB0B7C3' } },
      diagonal: { style: undefined } as any
    } as any;

    // ---- Row 1: Date Range banner ----
    const fromDate = formatDateDDMMYYYY(this.startDate);
    const toDate = formatDateDDMMYYYY(this.endDate);
    const dateRow = worksheet.addRow([`रिपोर्ट : ${fromDate} to ${toDate}`]);
    worksheet.mergeCells(1, 1, 1, totalCols);
    dateRow.height = 26;
    dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    dateRow.getCell(1).font = { name: FONT_NAME, bold: true, size: 13, color: { argb: 'FF111827' } };
    dateRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' }
    };
    dateRow.getCell(1).border = thinBorder;

    // ---- Row 2: spacer ----
    worksheet.addRow([]);

    // ---- Row 3: Headers ----
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 44;
    headerRow.eachCell((cell) => {
      cell.font = { name: FONT_NAME, bold: true, size: 11, color: { argb: HEADER_TEXT_ARGB } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: HEADER_FILL_ARGB }
      };
    });

    // ---- Body rows: mirror normal / TOTAL rows of the table ----
    let serial = 0;
    let zebra = false;

    this.listOfPorCountData.forEach(item => {
      const isTotal = this.isTotalRow(item);

      if (isTotal) {
        // Per-circle TOTAL row: merge first 3 cols into "TOTAL"
        const row = worksheet.addRow([
          'TOTAL', '', '',
          item.totalPOR,
          item.totalGyatPOR,
          item.totalAGyatPOR,
          item.totalBeatNirikshan,
          item.roLevelPendingToAssignRA,
          item.raLevel,
          item.roLevelOPendingToForwardSDO,
          item.sdoLevelPending,
          item.dfoLevelPending,
          item.ccfLevelPending,
          item.totalAbhisandhanit,
          item.totalAplekhit,
          item.totalCourtCase,
          item.totalPendingToNastibadh,
          item.nastibadhaPOR
        ]);
        worksheet.mergeCells(row.number, 1, row.number, 3);
        row.height = 24;
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: FONT_NAME, bold: true, size: 11, color: { argb: 'FF1E3A8A' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = thinBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: TOTAL_FILL_ARGB }
          };
        });
      } else {
        serial++;
        const row = worksheet.addRow([
          serial,
          item.circleName,
          item.divisionName,
          item.totalPOR,
          item.totalGyatPOR,
          item.totalAGyatPOR,
          item.totalBeatNirikshan,
          item.roLevelPendingToAssignRA,
          item.raLevel,
          item.roLevelOPendingToForwardSDO,
          item.sdoLevelPending,
          item.dfoLevelPending,
          item.ccfLevelPending,
          item.totalAbhisandhanit,
          item.totalAplekhit,
          item.totalCourtCase,
          item.totalPendingToNastibadh,
          item.nastibadhaPOR
        ]);
        row.height = 22;
        zebra = !zebra;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.font = { name: FONT_NAME, size: 11, color: { argb: 'FF111827' } };
          cell.border = thinBorder;
          // Circle / Division columns: left-aligned with wrap; rest centered.
          if (colNumber === 2 || colNumber === 3) {
            cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          }
          if (zebra) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: ZEBRA_FILL_ARGB }
            };
          }
          // Bold "नस्तीबद्ध हेतु लंबित" (column 17) like the on-screen <strong>.
          if (colNumber === totalCols - 1) {
            cell.font = { name: FONT_NAME, size: 11, bold: true, color: { argb: 'FF111827' } };
          }
        });
      }
    });

    // ---- Footer row: महायोग ----
    const mahayogRow = worksheet.addRow([
      'महायोग', '', '',
      this.mahayogTotalPOR,
      this.mahayogTotalGyatPOR,
      this.mahayogTotalAGyatPOR,
      this.mahayogTotalBeatNirikshan,
      this.mahayogRoLevelPendingToAssignRA,
      this.mahayogRaLevel,
      this.mahayogRoLevelOPendingToForwardSDO,
      this.mahayogSdoLevelPending,
      this.mahayogDfoLevelPending,
      this.mahayogCcfLevelPending,
      this.mahayogTotalAbhisandhanit,
      this.mahayogTotalAplekhit,
      this.mahayogTotalCourtCase,
      this.mahayogTotalPendingToNastibadh,
      this.mahayogNastibadhaPOR
    ]);
    worksheet.mergeCells(mahayogRow.number, 1, mahayogRow.number, 3);
    mahayogRow.height = 28;
    mahayogRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: FONT_NAME, bold: true, size: 12, color: { argb: 'FF92400E' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF92400E' } },
        bottom: { style: 'medium', color: { argb: 'FF92400E' } },
        left: { style: 'thin', color: { argb: 'FFB0B7C3' } },
        right: { style: 'thin', color: { argb: 'FFB0B7C3' } }
      } as any;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: MAHAYOG_FILL_ARGB }
      };
    });

    // ---- Column widths: fixed widths for known long Hindi headers, auto for the rest ----
    // Roughly mirrors the on-screen min-widths so proportions feel similar.
    const fixedWidths: { [col: number]: number } = {
      1: 6,    // क्र.
      2: 24,   // वृत्त का नाम
      3: 30,   // वन मंडल का नाम
      4: 12,   // कुल POR
      5: 16,   // नामजद प्रकरण
      6: 16,   // अज्ञात प्रकरण
      7: 14,   // बीट निरीक्षण
      8: 32,   // जाँच अधिकारी नियुक्ति हेतु लंबित
      9: 18,   // जाँच हेतु लंबित
      10: 34,  // उपवनमंडलाधिकारी को प्रेषण हेतु लंबित
      11: 30,  // उपवनमंडलाधिकारी स्तर पर लंबित
      12: 28,  // वनमंडलाधिकारी स्तर पर लंबित
      13: 30,  // मुख्य वन संरक्षक स्तर पर लंबित
      14: 16,  // अभिसंधानित
      15: 14,  // अपलेखित
      16: 14,  // कोर्ट चालान
      17: 22,  // नस्तीबद्ध हेतु लंबित
      18: 14   // नस्तीबद्ध
    };
    worksheet.columns.forEach((column, idx) => {
      const colNum = idx + 1;
      if (fixedWidths[colNum]) {
        column.width = fixedWidths[colNum];
      } else {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const rowIndex = Number((cell as any).row);
          if (rowIndex && rowIndex <= 2) return;
          if ((cell as any).isMerged) return;
          const len = cell.value ? cell.value.toString().length : 0;
          if (len > maxLength) maxLength = len;
        });
        column.width = Math.min(40, Math.max(8, maxLength * 1.3 + 2));
      }
    });

    // ---- Generate and save ----
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, `Table_Report_${this.startDate}_to_${this.endDate}.xlsx`);
    });
  }

  async filterData() {
    // All hierarchy dropdowns are optional.
    // Keep role-based scoping so the request stays within officer's jurisdiction.

    /// SUPER ADMIN ///
    if (this.loginedOffierDesignationId === "7") {
      // no mandatory selection
    }

    /// CCF ///
    if (this.loginedOffierDesignationId === "1") {
      this.selectedCircleId = this.loginedOffierCircleId;
    }

    /// DFO ///
    if (this.loginedOffierDesignationId === "2") {
      this.selectedDivisionId = this.loginedOffierDivisionId;
    }

    /// SDO ///
    if (this.loginedOffierDesignationId === "3") {
      this.selectedSubDivisionId = this.loginedOffierSub_DivisionId;
    }

    /// RO ///
    if (this.loginedOffierDesignationId === "4") {
      this.selectedRangId = this.loginedOffierRangId;
    }

    if (!await this.networkCheckService.getCurrentStatus()) {
      return;
    }

    this.listOfPorCountData = [];
    this.listForTotalComplainDetail = [];
    this.localListToFilterComplainDetail = [];
    this.filteredPorList = [...this.localListToFilterComplainDetail]; // Reset if input is empty
    this.totalComplains = 0;
    this.totalPendingComplains = 0;
    this.totalAplekhitComplains = 0;

    this.totalAbhisandhanComplains = 0;
    this.totalCourtChallanComplains = 0;
    this.totalNastibadhPOR = 0;

    this.totalRejectedComplains = 0;
    this.totalPendingPOR_To_Assign_RA = 0;
    this.totalPendingPOR_To_Forward_SDO = 0;
    this.totalPendingPOR_To_Complete_At_RA_Level = 0;
    this.totalPendingPOR_To_Complete_At_SDO_Level = 0;
    this.totalPendingPOR_To_Complete_At_DFO_Level = 0;


    this.gyatAccussedFromTotalPOR = 0;
    this.agyatAccussedFromTotalPOR = 0;
    this.totalPORBeatNirikshan = 0;
    this.gyatAccussedFromBeatNirikhanPOR = 0;
    this.agyatAccussedFromBeatNirikhanPOR = 0;


    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getDashboardDataByFilter(
      this.safeValue(this.loginedOffierEmpId),
      this.safeValue(this.loginedOffierDesignationId),
      this.safeValue(this.selectedCircleId),
      this.safeValue(this.selectedDivisionId),
      this.safeValue(this.selectedSubDivisionId),
      this.safeValue(this.selectedRangId),
      this.safeValue(this.selectedSubRangId),
      this.safeValue(this.selectedBitId),
      this.safeValue(this.startDate),
      this.safeValue(this.endDate)
    ).subscribe(
      async (response) => {


        await this.dismissDialog();
        this.cdRef.detectChanges;
        if (response.response.code === 200) {

          //Code chanded by sandeep start 1 (fetching accusedPersons from backend)
          //for each complain I have added accusedPersons array for each complain
          if (response.complainData && response.complainData.length > 0) {
            response.complainData.forEach(complain => {
              if (complain.accused_persons_json && complain.accused_persons_json.trim() !== '') {
                try {
                  // Parse the JSON string to array
                  const accusedArray = JSON.parse('[' + complain.accused_persons_json + ']');
                  complain.accusedPersons = accusedArray || [];
                } catch (error) {
                  complain.accusedPersons = [];
                }
              } else {
                complain.accusedPersons = [];
              }
            });
          }
          //Code chanded by sandeep end 1

          this.listForTotalComplainDetail = response.complainData

          console.log("response.totalComplainData  ", response.totalComplainData);
          for (let item of response.totalComplainData) {
            console.log("item totalComplainData", item);
            if (item.whichTypeOfComplain == 1) {
              this.totalComplains = item.totalComplain;
            } else if (item.whichTypeOfComplain == 2) {
              this.totalPendingComplains = item.totalComplain;
            } else if (item.whichTypeOfComplain == 3) {
              this.totalAplekhitComplains = item.totalComplain;
            } else if (item.whichTypeOfComplain == 4) {
              this.totalRejectedComplains = item.totalComplain;
              this.totalPendingPOR_To_Assign_RA = item.totalComplain;
            } else if (item.whichTypeOfComplain == 5) {
              this.totalPendingPOR_To_Forward_SDO = item.totalComplain;
            } else if (item.whichTypeOfComplain == 6) {
              this.totalPendingPOR_To_Complete_At_RA_Level = item.totalComplain;
            } else if (item.whichTypeOfComplain == 7) {
              this.totalPendingPOR_To_Complete_At_SDO_Level = item.totalComplain;
            } else if (item.whichTypeOfComplain == 8) {
              this.totalPendingPOR_To_Complete_At_DFO_Level = item.totalComplain;
            } else if (item.whichTypeOfComplain == 9) {
              this.totalAbhisandhanComplains = item.totalComplain;
            } else if (item.whichTypeOfComplain == 10) {
              this.totalCourtChallanComplains = item.totalComplain;
            } else if (item.whichTypeOfComplain == 11) {
              this.totalNastibadhPOR = item.totalComplain;
            } else if (item.whichTypeOfComplain == 111) {
              debugger;
              this.gyatAccussedFromTotalPOR = Number(item.totalComplain) || 0;
            } else if (item.whichTypeOfComplain == 222) {
              this.agyatAccussedFromTotalPOR = Number(item.totalComplain) || 0;
            } else if (item.whichTypeOfComplain == 333) {
              this.totalPORBeatNirikshan = Number(item.totalComplain) || 0;
            }

            if (item.whichTypeOfComplain == 21) {
              this.totalPORPendingToNastibadh = item.totalComplain;
            }

            if (item.whichTypeOfComplain == 20) {
              this.totalRequestToExtension = item.totalComplain;
            }

          }

          // for (let item of response.complainData) {

          //   if (item.is_accused_found === "0") {
          //     this.agyatAccussedFromTotalPOR = this.agyatAccussedFromTotalPOR + 1;
          //   } else {
          //     this.gyatAccussedFromTotalPOR = this.gyatAccussedFromTotalPOR + 1;
          //   }

          //   if (item.is_beat_nirikshan === "1") {

          //     this.totalPORBeatNirikshan = this.totalPORBeatNirikshan + 1;

          //     if (item.is_accused_found === "1") {
          //       this.gyatAccussedFromBeatNirikhanPOR = this.gyatAccussedFromBeatNirikhanPOR + 1;
          //     } else {
          //       this.agyatAccussedFromBeatNirikhanPOR = this.agyatAccussedFromBeatNirikhanPOR + 1;
          //     }

          //   }

          // }

          this.getCountWiseDataOfDivision();

          this.getListOfComplainsAfterClickOnBoxes('');

        } else {
          this.gyatAccussedFromTotalPOR = 0;
          this.agyatAccussedFromTotalPOR = 0;
          this.totalPORBeatNirikshan = 0;
          this.gyatAccussedFromBeatNirikhanPOR = 0;
          this.agyatAccussedFromBeatNirikhanPOR = 0;

          this.listForTotalComplainDetail = [];
          this.localListToFilterComplainDetail = [];
          this.filteredPorList = [...this.localListToFilterComplainDetail]; // Reset if input is empty
          this.totalComplains = 0;
          this.totalPendingComplains = 0;
          this.totalAplekhitComplains = 0;

          this.totalAbhisandhanComplains = 0;
          this.totalCourtChallanComplains = 0;
          this.totalNastibadhPOR = 0;

          this.totalRejectedComplains = 0;
          this.totalPendingPOR_To_Assign_RA = 0;
          this.totalPendingPOR_To_Forward_SDO = 0;
          this.totalPendingPOR_To_Complete_At_RA_Level = 0;
          this.totalPendingPOR_To_Complete_At_SDO_Level = 0;
          this.totalPendingPOR_To_Complete_At_DFO_Level = 0;

          this.longToast(response.response.msg)
        }

      },
      async (error) => {
        this.shortToast(error);
      }
    );
  }

  getButtonText(item: any): string {


    if (this.isRA) {
      if (Number(item.complain_progress_stage) > 2 && Number(item.complain_progress_stage) != 17 && Number(item.complain_progress_stage) != 18) {
        return "वसूली / परिवहन की जानकारी";
      } else {
        return item.button_text;
      }
    }

    return item.button_text;

    // if (item.is_complain_created_by_ra === undefined) {
    //   const raValue = 0;
    //   if (raValue === 0) {
    //     return item.button_text;
    //   } else if (item.complain_progress_stage === "1") {
    //     return 'स्वयं को प्रेसित करें';
    //   } else if (Number(item.complain_progress_stage) >= 3) {
    //     return item.button_text;
    //   } else {
    //     return 'कार्य का विवरण';
    //   }
    // } else {
    //   const raValue = Number(item.is_complain_created_by_ra); // convert to number
    //   if (raValue === 0) {
    //     return item.button_text;
    //   } else if (item.complain_progress_stage === "1") {
    //     return 'स्वयं को प्रेसित करें';
    //   } else if (Number(item.complain_progress_stage) >= 3) {
    //     return item.button_text;
    //   } else {
    //     return 'कार्य का विवरण';
    //   }
    // }

  }

  trackById(index: number, item: any): number {
    return item.id || index; // replace 'id' with unique property like complain_id
  }


  getListOfRequestToExtendJanchAwdadhi() {
    this.router.navigateByUrl('/janch_awadhi_badhane_hetu_kiye_gaye_awedan', {
      state: { isRA: this.isRA },
      replaceUrl: false
    });
  }

  getTextForVasuliOrNastibadh(item: ComplainDetails): string {
    if (this.isRO) {
      if (item.shesh_vasuli_rashi != "" && item.shesh_vasuli_rashi != "0") {
        return "वसूली का अनुरोध करें";
      }
      return "नस्तीबद्ध हेतु प्रेषित करें";
    }

    return "";

  }

  async assignAdhikariForVasuli(clickedComplainDetail: ComplainDetails) {

    if (clickedComplainDetail.shesh_vasuli_rashi != "" && clickedComplainDetail.shesh_vasuli_rashi != "0") {
      const modal = await this.modalCtrl.create({
        component: AssignRaForVasuliByRoComponent,
        cssClass: 'custom-dialog-modal',
        componentProps: {
          ro_name: this.loginedOffierName,
          is_complain_created_by_ra: clickedComplainDetail.is_complain_created_by_ra,
          complain_table_id: clickedComplainDetail.complain_id,
          complain_history_table_id: clickedComplainDetail.complain_history_table_id,
          loginedOffierEmpId: this.loginedOffierEmpId.toString(),
          loginedOffierDesignationId: this.loginedOffierDesignationId.toString(),
          shesh_vasuli_rashi: clickedComplainDetail.shesh_vasuli_rashi
        },
        backdropDismiss: false,
      });

      modal.onDidDismiss().then((result) => {
        if (result.data?.confirmed) {

          this.assignRAForVasuli(result.data.remark, result.data.selected_ra,
            result.data.complain_table_id, result.data.complain_history_table_id,
            clickedComplainDetail.shesh_vasuli_rashi
          );

        }
      });

      await modal.present();
    } else if (clickedComplainDetail.complain_progress_stage === "6" ||
      clickedComplainDetail.complain_progress_stage === "7" ||
      clickedComplainDetail.complain_progress_stage === "9" ||
      clickedComplainDetail.complain_progress_stage === "11"
    ) {
      const jsonData = JSON.stringify(clickedComplainDetail);
      this.router.navigateByUrl('/view-complain-detail', {
        state: { data: jsonData, is_for_nastibadha: true },
        replaceUrl: false
      });
      return;
    }

  }

  assignRAForVasuli(ro_remark: string, selectedRAId: String,
    complain_table_id: string, complain_history_table_id: string, shesh_vasuli_rashi: string) {

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.assignRAForVasuli(
      complain_history_table_id.toString(),
      complain_table_id.toString(),
      this.loginedOffierEmpId.toString(),
      selectedRAId.toString(),
      ro_remark.toString(),
      shesh_vasuli_rashi.toString()
    ).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          this.getDashboardDataFromServer();

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

  getActionBackgroundColor(item: ComplainDetails) {
    if (item.complain_progress_stage === '17' ||
      item.complain_progress_stage === '18'
    ) {
      return 'red';
    } else {
      return 'green'; // default
    }
  }

  getListOfComplainsgyatAndAgyat(clickedItem: string) {

    this.selectedBox = clickedItem;

    if (this.listForTotalComplainDetail.length > 0) {

      this.localListToFilterComplainDetail = [];

      if (clickedItem === "111") {

        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];

          if (item.is_accused_found === "1") {

            this.localListToFilterComplainDetail.push(item);
          }

        }

      } else if (clickedItem === "222") {

        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];


          if (item.is_accused_found === "0") {

            this.localListToFilterComplainDetail.push(item);
          }

        }

      } else if (clickedItem === "333") {

        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];

          if (item.is_beat_nirikshan === "1") {
            this.localListToFilterComplainDetail.push(item);
          }

        }

      } else if (clickedItem === "444") {

        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];

          if (item.is_beat_nirikshan === "1" && item.is_accused_found === "1") {
            this.localListToFilterComplainDetail.push(item);
          }

        }

      } else if (clickedItem === "555") {

        for (let i = 0; i < this.listForTotalComplainDetail.length; i++) {
          const item = this.listForTotalComplainDetail[i];


          if (item.is_beat_nirikshan === "1" && item.is_accused_found === "0") {
            this.localListToFilterComplainDetail.push(item);
          }

        }

      }


    }

    this.initializeList();

  }

  isWebPlatform(): boolean {
    return this.platForm.is('desktop');
  }

  isTotalRow(item: any): boolean {
    if (item.circleName === "TOTAL") {
      return true;
    }

    return false;

  }

  /**
   * Swap two specific divisions inside the "Surguja Wildlife" circle so that
   * "DIRECTOR, GGNP, BAIKUNTHPUR" appears before "DD Elephant Reserve".
   * Runs before TOTAL rows are inserted, so totals/serials remain consistent.
   */
  private swapSurgujaWildlifeDivisions(): void {
    const list = this.listOfPorCountData;
    if (!list || list.length === 0) return;

    const idxDir = list.findIndex(x =>
      (x.circleName || '').trim() === 'Surguja Wildlife' &&
      (x.divisionName || '').trim() === 'DIRECTOR, GGNP, BAIKUNTHPUR'
    );
    const idxDD = list.findIndex(x =>
      (x.circleName || '').trim() === 'Surguja Wildlife' &&
      (x.divisionName || '').trim() === 'DD Elephant Reserve'
    );

    if (idxDir > -1 && idxDD > -1 && idxDir > idxDD) {
      const tmp = list[idxDir];
      list[idxDir] = list[idxDD];
      list[idxDD] = tmp;
    }
  }

  fixMissingTotalRows() {
    if (!this.listOfPorCountData || this.listOfPorCountData.length === 0) return;

    // We process the list to ensure every circle group ends with a "TOTAL" row
    let processedList: any[] = [];
    let currentCircleName = "";
    let currentCircleId = "";
    let groupTotalPOR = 0;
    let groupTotalGyatPOR = 0;
    let groupTotalAGyatPOR = 0;
    let groupNastibadhaPOR = 0;
    let groupUnderProcessPOR = 0;

    let groupCcfLevelPending = 0;
    let groupDfoLevelPending = 0;
    let groupSdoLevelPending = 0;
    let groupRoLevelOPendingToForwardSDO = 0;
    let groupRoLevelPendingToAssignRA = 0;
    let groupRaLevel = 0;
    let groupTotalAplekhit = 0;
    let groupTotalAbhisandhanit = 0;
    let groupTotalCourtCase = 0;
    let groupTotalPendingToNastibadh = 0;
    let groupTotalBeatNirikshan = 0;

    for (let i = 0; i < this.listOfPorCountData.length; i++) {
      let item = this.listOfPorCountData[i];

      if (item.circleName === "TOTAL") {
        // If the server already sent a TOTAL row, we just reset our accumulators
        processedList.push(item);
        currentCircleName = "";
        groupTotalPOR = 0;
        groupTotalGyatPOR = 0;
        groupTotalAGyatPOR = 0;
        groupNastibadhaPOR = 0;
        groupUnderProcessPOR = 0;

        groupCcfLevelPending = 0;
        groupDfoLevelPending = 0;
        groupSdoLevelPending = 0;
        groupRoLevelOPendingToForwardSDO = 0;
        groupRoLevelPendingToAssignRA = 0;
        groupRaLevel = 0;
        groupTotalAplekhit = 0;
        groupTotalAbhisandhanit = 0;
        groupTotalCourtCase = 0;
        groupTotalPendingToNastibadh = 0;
        groupTotalBeatNirikshan = 0;

        continue;
      }

      // If circle changes and we were tracking one, insert missing TOTAL row
      if (currentCircleName !== "" && item.circleName !== currentCircleName) {
        processedList.push({
          circleName: "TOTAL",
          divisionName: "",
          totalPOR: groupTotalPOR.toString(),
          totalGyatPOR: groupTotalGyatPOR.toString(),
          totalAGyatPOR: groupTotalAGyatPOR.toString(),
          nastibadhaPOR: groupNastibadhaPOR.toString(),
          underProcessPOR: groupUnderProcessPOR.toString(),

          ccfLevelPending: groupCcfLevelPending.toString(),
          dfoLevelPending: groupDfoLevelPending.toString(),
          sdoLevelPending: groupSdoLevelPending.toString(),
          roLevelOPendingToForwardSDO: groupRoLevelOPendingToForwardSDO.toString(),
          roLevelPendingToAssignRA: groupRoLevelPendingToAssignRA.toString(),
          raLevel: groupRaLevel.toString(),
          totalAplekhit: groupTotalAplekhit.toString(),
          totalAbhisandhanit: groupTotalAbhisandhanit.toString(),
          totalCourtCase: groupTotalCourtCase.toString(),
          totalPendingToNastibadh: groupTotalPendingToNastibadh.toString(),
          totalBeatNirikshan: groupTotalBeatNirikshan.toString(),

          id: 0,
          circleId: currentCircleId,
          divisionId: 0
        });
        groupTotalPOR = 0;
        groupTotalGyatPOR = 0;
        groupTotalAGyatPOR = 0;
        groupNastibadhaPOR = 0;
        groupUnderProcessPOR = 0;

        groupCcfLevelPending = 0;
        groupDfoLevelPending = 0;
        groupSdoLevelPending = 0;
        groupRoLevelOPendingToForwardSDO = 0;
        groupRoLevelPendingToAssignRA = 0;
        groupRaLevel = 0;
        groupTotalAplekhit = 0;
        groupTotalAbhisandhanit = 0;
        groupTotalCourtCase = 0;
        groupTotalPendingToNastibadh = 0;
        groupTotalBeatNirikshan = 0;
      }

      processedList.push(item);
      currentCircleName = item.circleName;
      currentCircleId = item.circleId;
      groupTotalPOR += Number(item.totalPOR || 0);
      groupTotalGyatPOR += Number(item.totalGyatPOR || 0);
      groupTotalAGyatPOR += Number(item.totalAGyatPOR || 0);
      groupNastibadhaPOR += Number(item.nastibadhaPOR || 0);
      groupUnderProcessPOR += Number(item.underProcessPOR || 0);

      groupCcfLevelPending += Number(item.ccfLevelPending || 0);
      groupDfoLevelPending += Number(item.dfoLevelPending || 0);
      groupSdoLevelPending += Number(item.sdoLevelPending || 0);
      groupRoLevelOPendingToForwardSDO += Number(item.roLevelOPendingToForwardSDO || 0);
      groupRoLevelPendingToAssignRA += Number(item.roLevelPendingToAssignRA || 0);
      groupRaLevel += Number(item.raLevel || 0);
      groupTotalAplekhit += Number(item.totalAplekhit || 0);
      groupTotalAbhisandhanit += Number(item.totalAbhisandhanit || 0);
      groupTotalCourtCase += Number(item.totalCourtCase || 0);
      groupTotalPendingToNastibadh += Number(item.totalPendingToNastibadh || 0);
      groupTotalBeatNirikshan += Number(item.totalBeatNirikshan || 0);
    }

    // Final check for the last group
    if (currentCircleName !== "") {
      processedList.push({
        circleName: "TOTAL",
        divisionName: "",
        totalPOR: groupTotalPOR.toString(),
        totalGyatPOR: groupTotalGyatPOR.toString(),
        totalAGyatPOR: groupTotalAGyatPOR.toString(),
        nastibadhaPOR: groupNastibadhaPOR.toString(),
        underProcessPOR: groupUnderProcessPOR.toString(),

        ccfLevelPending: groupCcfLevelPending.toString(),
        dfoLevelPending: groupDfoLevelPending.toString(),
        sdoLevelPending: groupSdoLevelPending.toString(),
        roLevelOPendingToForwardSDO: groupRoLevelOPendingToForwardSDO.toString(),
        roLevelPendingToAssignRA: groupRoLevelPendingToAssignRA.toString(),
        raLevel: groupRaLevel.toString(),
        totalAplekhit: groupTotalAplekhit.toString(),
        totalAbhisandhanit: groupTotalAbhisandhanit.toString(),
        totalCourtCase: groupTotalCourtCase.toString(),
        totalPendingToNastibadh: groupTotalPendingToNastibadh.toString(),
        totalBeatNirikshan: groupTotalBeatNirikshan.toString(),

        id: 0,
        circleId: currentCircleId,
        divisionId: 0
      });
    }

    this.listOfPorCountData = processedList;
  }

  mahayogTotalPOR: number = 0;
  mahayogTotalGyatPOR: number = 0;
  mahayogTotalAGyatPOR: number = 0;
  mahayogNastibadhaPOR: number = 0;
  mahayogUnderProcessPOR: number = 0;

  mahayogCcfLevelPending: number = 0;
  mahayogDfoLevelPending: number = 0;
  mahayogSdoLevelPending: number = 0;
  mahayogRoLevelOPendingToForwardSDO: number = 0;
  mahayogRoLevelPendingToAssignRA: number = 0;
  mahayogRaLevel: number = 0;
  mahayogTotalAplekhit: number = 0;
  mahayogTotalAbhisandhanit: number = 0;
  mahayogTotalCourtCase: number = 0;
  mahayogTotalPendingToNastibadh: number = 0;
  mahayogTotalBeatNirikshan: number = 0;

  setUpMahayog() {

    this.mahayogTotalPOR = 0;
    this.mahayogTotalGyatPOR = 0;
    this.mahayogTotalAGyatPOR = 0;
    this.mahayogNastibadhaPOR = 0;
    this.mahayogUnderProcessPOR = 0;

    this.mahayogCcfLevelPending = 0;
    this.mahayogDfoLevelPending = 0;
    this.mahayogSdoLevelPending = 0;
    this.mahayogRoLevelOPendingToForwardSDO = 0;
    this.mahayogRoLevelPendingToAssignRA = 0;
    this.mahayogRaLevel = 0;
    this.mahayogTotalAplekhit = 0;
    this.mahayogTotalAbhisandhanit = 0;
    this.mahayogTotalCourtCase = 0;
    this.mahayogTotalPendingToNastibadh = 0;
    this.mahayogTotalBeatNirikshan = 0;

    for (let i = 0; i < this.listOfPorCountData.length; i++) {
      const item = this.listOfPorCountData[i];

      if (item.circleName != "TOTAL") {
        this.mahayogTotalPOR = this.mahayogTotalPOR + Number(item.totalPOR);

        this.mahayogTotalGyatPOR = this.mahayogTotalGyatPOR + Number(item.totalGyatPOR);
        this.mahayogTotalAGyatPOR = this.mahayogTotalAGyatPOR + Number(item.totalAGyatPOR);

        this.mahayogNastibadhaPOR = this.mahayogNastibadhaPOR + Number(item.nastibadhaPOR);
        this.mahayogUnderProcessPOR = this.mahayogUnderProcessPOR + Number(item.underProcessPOR);

        this.mahayogCcfLevelPending += Number(item.ccfLevelPending || 0);
        this.mahayogDfoLevelPending += Number(item.dfoLevelPending || 0);
        this.mahayogSdoLevelPending += Number(item.sdoLevelPending || 0);
        this.mahayogRoLevelOPendingToForwardSDO += Number(item.roLevelOPendingToForwardSDO || 0);
        this.mahayogRoLevelPendingToAssignRA += Number(item.roLevelPendingToAssignRA || 0);
        this.mahayogRaLevel += Number(item.raLevel || 0);
        this.mahayogTotalAplekhit += Number(item.totalAplekhit || 0);
        this.mahayogTotalAbhisandhanit += Number(item.totalAbhisandhanit || 0);
        this.mahayogTotalCourtCase += Number(item.totalCourtCase || 0);
        this.mahayogTotalPendingToNastibadh += Number(item.totalPendingToNastibadh || 0);
        this.mahayogTotalBeatNirikshan += Number(item.totalBeatNirikshan || 0);
      }

    }
  }

  onRowClick(item: any, whichClicked: Number): void {
    if (whichClicked === 1) {
      this.router.navigateByUrl('/officer-dashboard-after-click-from-admin-dashaboard', {
        state: {
          "data": item,
          isCCF: true,
          isDFO: false,
          startDate: this.startDate,
          endDate: this.endDate
        },
        replaceUrl: false
      });
    } else {
      this.router.navigateByUrl('/officer-dashboard-after-click-from-admin-dashaboard', {
        state: {
          "data": item,
          isCCF: false,
          isDFO: true,
          startDate: this.startDate,
          endDate: this.endDate
        },
        replaceUrl: false
      });
    }

  }


}