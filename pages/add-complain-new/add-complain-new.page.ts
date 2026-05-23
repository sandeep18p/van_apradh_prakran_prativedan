import { AfterViewInit, ChangeDetectorRef, Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AccusedPersonDetail, AccusedPersonDetailForVanApradhPrakran } from '../officer-dashboard/GetDashboardResponse.model';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { addCircleOutline, arrowBack, arrowBackOutline, arrowForwardOutline, book, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, createOutline, eyeOutline, locationOutline, refreshCircleOutline, trashOutline, informationCircleOutline, chevronDown, chevronUp, imagesOutline, checkmarkCircle, refreshOutline, peopleOutline, personCircleOutline, documentTextOutline, close, folderOutline, leafOutline, logOutOutline, resizeOutline, cutOutline, constructOutline, flameOutline, cubeOutline } from 'ionicons/icons';

import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

import { Router } from '@angular/router';

import { NavController, ModalController, ActionSheetController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { DharaDataNew } from './GetCastAndCrimTypeMasterResponse';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { IonicModule } from '@ionic/angular'; // Import IonicModule
import { TableModule } from 'primeng/table';


import { Keyboard } from '@capacitor/keyboard';
import { ViewChild, ElementRef } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
import { GetCastAndCrimTypeMasterResponseModal, BalliPriceMasterResponse, BambooPriceMasterResponse, FormFactorResponse, IdAndNameModel, KhadaVrikhaPriceMasterResponse, LatthaKasthPriceMasterResponse } from './GetCastAndCrimTypeMasterResponse';
import { DatabaseService } from 'src/app/services/DatabaseService.service';
import { fonts } from 'pdfmake/build/pdfmake';
import { strict } from 'assert';
import { ComplainDetails, JaptSamanItem, WitnessDetailForPor } from '../officer-dashboard/GetDashboardResponse.model';
import { SignaturePad } from 'angular2-signaturepad';
import { SignaturePageComponent } from '../signature-page/signature-page.component';
import { stringify } from 'querystring';


//AddedHTML
// Add this interface after line 41 
//Code Added by sandeep start 2 interface for accused person
interface AccusedPerson {
  name: string;
  fatherName: string;
  address: string;
  selectedCast: any;
  signatureImage: any;
  age: any;
  jati_name: string;
  mobile_number: string;
  aadhaar_number: string;
  selectedType?: 'sign' | 'thumb';
}
//Code Added by sandeep end 2 interface for accused person

// sandeepdonedone start - Witness interface
interface Witness {
  name: string;
  fatherName: string;
  address: string;
  jaati: string;
  age: string;
  signatureImage: string;
  selectedType?: 'sign' | 'thumb';
}
// sandeepdonedone end - Witness interface

@Component({
  selector: 'app-add-complain-new',
  templateUrl: './add-complain-new.page.html',
  styleUrls: ['./add-complain-new.page.scss'],
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, IonRadioGroup,
    IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
    IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
    IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
    IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
    IonModal, IonChip, IonSegment, IonSegmentButton, TableModule
  ],
  providers: [Diagnostic]
})
export class AddComplainNewPage implements OnInit {

  private readonly MAX_JAPTINAMA_PHOTOS = 3;
  private readonly MAX_OTHER_PHOTOS = 20;

  complainer_name: string = "";
  complainer_ka_pad: string = "";

  apradhiPhoto: string = "";
  japtinamaPhotos: string[] = [];
  panchanamaPhoto: string = "";
  porPhoto: string = "";

  //sandeep start 1 jan 26 1
  selectedCompartmentOption: 'RF' | 'PF' | 'OA' | null = null;
  private readonly compartmentOptionKey = 'compartment_option';

  selectedDharaNewIds = new Set<string>();
  selectedDharaNewItems: any[] = []; // store selected objects if you need to submit later

  // Flattened array for multi-select dropdown (property, not getter to avoid performance issues)
  flattenedDharaForSelect: any[] = [];

  // Selected items array for display chips (property, not getter to avoid performance issues)
  selectedDharaItemsArray: any[] = [];

  // Selected items grouped by adhiniyam for display (property, not getter to avoid performance issues)
  selectedDharaGroupedByAdhiniyam: { adhiniyam: string; items: any[] }[] = [];

  // Selected IDs array for ng-select binding (property, not getter to avoid performance issues)
  selectedDharaIdsArray: string[] = [];

  // info modal
  isDharaInfoOpen = false;
  dharaInfoTitle = '';
  dharaInfoDescription = '';
  dharaInfoAdhiniyam = '';
  //sandeep end 1 jan 26


  photos: string[] = [];

  @ViewChild('japtinamaFileInput') japtinamaFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('otherFilesInput') otherFilesInput!: ElementRef<HTMLInputElement>;

  private pendingImageQueue: { type: 'japtinama' | 'photos'; dataUrl: string }[] = [];
  private isQueueProcessing = false;

  async onJaptinamaFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    if (files.length === 0) return;

    const remaining = Math.max(0, this.MAX_JAPTINAMA_PHOTOS - this.japtinamaPhotos.length);
    if (remaining <= 0) {
      this.longToast(`आप अधिकतम ${this.MAX_JAPTINAMA_PHOTOS} फोटो ले सकते हैं`);
      return;
    }

    const selected = files.slice(0, remaining);
    const dataUrls: string[] = [];
    for (const file of selected) {
      dataUrls.push(await this.readFileAsDataUrl(file));
    }

    this.enqueueImages('japtinama', dataUrls);
  }

  async onOtherFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    if (files.length === 0) return;

    const remaining = Math.max(0, this.MAX_OTHER_PHOTOS - this.photos.length);
    if (remaining <= 0) {
      this.longToast(`आप अधिकतम ${this.MAX_OTHER_PHOTOS} फोटो ले सकते हैं`);
      return;
    }

    const selected = files.slice(0, remaining);
    const dataUrls: string[] = [];
    for (const file of selected) {
      dataUrls.push(await this.readFileAsDataUrl(file));
    }

    this.enqueueImages('photos', dataUrls);
  }

  private enqueueImages(type: 'japtinama' | 'photos', dataUrls: string[]) {
    for (const dataUrl of dataUrls) {
      this.pendingImageQueue.push({ type, dataUrl });
    }
    this.processNextQueuedImage();
  }

  private processNextQueuedImage() {
    if (this.isQueueProcessing) return;
    if (this.isImagePreviewModalOpen) return;

    const next = this.pendingImageQueue.shift();
    if (!next) return;

    this.isQueueProcessing = true;
    this.openImagePreviewModal(next.dataUrl, next.type, -1);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsDataURL(file);
    });
  }
  listOfDharaDataNew: DharaDataNew[] = [];
  dharaNewGroups: { adhiniyam: string; items: DharaDataNew[] }[] = [];


  isLoading: boolean = false;
  loadingMessage: string = ""

  current_location_google_addres: string = "Getting your location, please wait....";

  locationAtGhatnaSthal: 'yes' | 'no' | null = 'yes';
  manualLocationAddress: string = '';
  manualLat: string = '';
  manualLon: string = '';

  //ADDEDHTML Add this after line 72
  //Code Added by sandeep start 3 interface for accused person
  accusedPersons: AccusedPerson[] = [
    {
      name: "",
      fatherName: "",
      address: "",
      selectedCast: null,
      signatureImage: null,
      age: null,
      jati_name: "",
      mobile_number: "",
      aadhaar_number: ""
    }
  ];
  //Code Added by sandeep end 3 interface for accused person

  por_number: string = "";

  lat: number = 0.0;
  lon: number = 0.0;

  accussedName: string = "";
  accussedFatherName: string = "";
  address: string = "";
  selectedAccusedCast: any = null;


  selectedCrimType: any = null;

  selectedCrimeBeat: any = null;
  selectedCrimeBeatName: any = null;

  crimePlace: string = "";
  crimeDate: string = "";
  actualCrimeDate: string = "";

  // sandeepdonedone start - Dynamic witnesses array
  witnesses: Witness[] = [
    { name: "", fatherName: "", address: "", jaati: "", age: "", signatureImage: "" },
    { name: "", fatherName: "", address: "", jaati: "", age: "", signatureImage: "" }
  ];
  // sandeepdonedone end - Dynamic witnesses array

  // Keep for backward compatibility (will be synced from witnesses[])
  witness_first_name: string = "";
  witness_address_first: string = "";
  witness_second_name: string = "";
  witness_address_second: string = "";

  seizedGoodDetail: string = "";

  listOfBeat: any = [];
  listOfCrimType: any = [];
  listOfCast: any = [];

  listOfDharaNew: any = [];
  listOfWoodPrajati: any = [];
  woodListForJalau: any = [];
  woodListForExceptJalau: any = [];
  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' },
    { id: 4, name: 'बल्ली' },
    { id: 5, name: 'अन्य' }
  ];

  listOfBambooPriceMaster: BambooPriceMasterResponse[] = [];
  listOfLattaKasthaPriceMaster: LatthaKasthPriceMasterResponse[] = [];
  listOfBalliPriceMaster: BalliPriceMasterResponse[] = [];
  listOfFormFactorMaster: FormFactorResponse[] = [];
  listOfVrikhaPriceMaster: KhadaVrikhaPriceMasterResponse[] = [];

  listOfGolaiValueThunth: IdAndNameModel[] = [];
  listOfLambaiValueBalli: IdAndNameModel[] = [];
  listOfGolaiValueBalli: IdAndNameModel[] = [];
  listOfGolaiForLatthaKasth: IdAndNameModel[] = [];
  listOfLambaiForLatthaKasth: IdAndNameModel[] = [];
  listOfBanshSizeVyaparik: IdAndNameModel[] = [];
  listOfBanshSizeOdyogic: IdAndNameModel[] = [];
  listOfBanshType: IdAndNameModel[] = [
    { id: 1, name: 'व्यापारिक' },
    { id: 2, name: 'औद्योगिक' }
  ];

  localListOfDharaHead: { name: string; id: string, dharaYear: string }[] = [];
  localListOfActualDhara: { name: string; id: string }[] = [];

  selectedCrimeBeatCompartment: any = null;
  listOfCompartment: any = [];
  isCompartmentDropdownOpen: boolean = false;
  selectedCompartmentNames: string[] = [];
  pendingCompartmentOption: string | null = null;
  isDharaDropdownOpen: boolean = false;

  listOfDhara: { dharaYear: string; dharaSection: string }[] = [];

  isAccusedFound: boolean = true;


  // ------------- JAPTINAMA KA VIVRAN ---------------//

  japt_karne_wale_adhikari_ka_name: string = "";
  japt_karne_wale_adhikari_ka_pad: string = "";
  isJaptikartaSameAsPorJarikkarta: boolean = true;
  japtikarta_sign: string = "";
  chinhaPhoto: string = "";
  japtinama_anya_vishesh_vivran: string = "";
  japti_ka_dinak: string = "";
  japti_ka_sthaan: string = "";

  currentStep: number = 1;

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  nextStep() {
    if (this.currentStep < 3) {
      if (this.currentStep === 1) {
        this.refreshSeizedGoodsSummaryCache();
      }
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(500);
    }
  }

  // Image preview/edit modal properties
  isImagePreviewModalOpen = false;
  previewImageDataUrl: string = '';
  originalImageDataUrl: string = ''; // Store original image for rotation
  previewImageType: 'apradhi' | 'chinha' | 'japtinama' | 'panchanama' | 'por' | 'photos' | null = null;
  previewImageIndex: number = -1; // For photos array
  imageRotation: number = 0;
  private isRotating = false; // Flag to prevent rotation loops
  private cropperInstance: any = null;
  @ViewChild('imagePreview', { static: false }) imagePreviewElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropperContainer', { static: false }) cropperContainerElement!: ElementRef<HTMLDivElement>;

  // --------------------------------------------------//

  // VAHAN DETAIL  //
  isVahanFound: boolean = false;

  constructor(private sqliteService: DatabaseService, private networkCheckService: NetworkCheckService, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private diagnostic: Diagnostic, private platform: Platform, private navController: NavController, private apiService: ApiServiceService, private modalController: ModalController, private actionSheetController: ActionSheetController, private router: Router, private languageService: LanguageServiceService) {
    addIcons({ eyeOutline, createOutline, closeCircle, cameraOutline, arrowBack, arrowBackOutline, arrowForwardOutline, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, addCircleOutline, trashOutline, informationCircleOutline, chevronDown, chevronUp, imagesOutline, checkmarkCircle, refreshOutline, peopleOutline, personCircleOutline, documentTextOutline, close, folderOutline, leafOutline, logOutOutline, resizeOutline, cutOutline, constructOutline, flameOutline, cubeOutline });
  }

  async ngOnInit() {

    this.checkLocationPermissionAndNavigate();

    this.onLocationAtGhatnaSthalChange('yes');

    this.setCrimDate();

    await this.getLoginedOfficerData();

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    const { value: opt } = await Preferences.get({ key: this.compartmentOptionKey });
    this.selectedCompartmentOption = (opt as any) || null;
    const { value: pad } = await Preferences.get({ key: PreferenceKeys.emp_designation });


    if (value) {
      this.complainer_name = value;
      this.japt_karne_wale_adhikari_ka_name = this.complainer_name;
    }

    // For RA/BFO, pad is derived from logged-in officer (single source of truth)
    if (pad && !(this.isRA || this.isBG)) {
      this.complainer_ka_pad = pad;
      this.japt_karne_wale_adhikari_ka_pad = this.complainer_ka_pad;
    }

    this.isJaptikartaSameAsPorJarikkarta = true;
    this.japtikarta_sign = "";

    this.handleBackButton();

    await this.sqliteService.initDB(); // Ensure DB is ready

  }

  async handleBackButton() {
    this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, async () => {
      this.cancel();
    });

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_designation });
    if (value && !(this.isRA || this.isBG)) {
      this.complainer_ka_pad = value;
      this.japt_karne_wale_adhikari_ka_pad = value;
    }

  }

  ionViewWillLeave() {
    this.removeBackButtonListener();
  }


  //sandeep start 1 jan 26 2
  private async resetCascade(from: 'compartment' | 'option' | 'crimeType') {
    // When compartment changes → option must reset (and stored preference cleared)
    if (from === 'compartment') {
      this.selectedCompartmentOption = null;
      await Preferences.set({ key: this.compartmentOptionKey, value: '' });
    }

    // When compartment OR option changes → crime type must reset
    if (from === 'compartment' || from === 'option') {
      this.selectedCrimType = null;
    }

    // Anything above dhara changes → dhara must reset
    this.clearDharaNewSelection(); // NEW checkbox-based dhara
    this.clipboardDharas = [];     // OLD dhara selection (fallback / offline)
    this.selectedDharaValue = null;

    // Reset grouped UI + info modal
    this.dharaNewGroups = [];
    this.flattenedDharaForSelect = [];
    this.selectedDharaItemsArray = [];
    this.selectedDharaGroupedByAdhiniyam = [];
    this.selectedDharaIdsArray = [];
    this.isDharaInfoOpen = false;
    this.dharaInfoTitle = '';
    this.dharaInfoDescription = '';
    this.dharaInfoAdhiniyam = '';
  }

  async onCompartmentOptionChange(event: any) {
    const value = event.detail.value;
    await Preferences.set({ key: this.compartmentOptionKey, value });
    this.selectedCompartmentOption = value as 'RF' | 'PF' | 'OA' | null;

    await this.resetCascade('option');

    // Use setTimeout to defer buildDharaNewGroups and avoid blocking UI
    setTimeout(() => {
      this.buildDharaNewGroups();
    }, 0);
  }

  // buildDharaNewGroups() {
  //   const forestType = (this.selectedCompartmentOption ?? '').trim(); // RF/PF/OA
  //   const crimeType = this.selectedCrimType != null ? String(this.selectedCrimType).trim() : ''; // selectedCrimType is id

  //   if (!forestType || !crimeType || !Array.isArray(this.listOfDharaDataNew)) {
  //     this.dharaNewGroups = [];
  //     return;
  //   }

  //   console.log(forestType, "forestType",crimeType, "crimeType");
  //   console.log("list of dhara data new ",this.listOfDharaDataNew);
  //   const filtered = this.listOfDharaDataNew.filter((x) =>
  //     ((String(x?.forest_type).trim() === forestType) || (x?.forest_type== '')) &&
  //     String(x?.crime_type ?? '').trim() === crimeType
  //   );
  //   console.log("filtered ",filtered);

  //   const map = new Map<string, DharaDataNew[]>();
  //   console.log(filtered, "filtered",this.selectedCrimType, " ",this.selectedCompartmentOption);
  //   console.log("index map", this.selectedCrimType);
  //   for (const item of filtered) {
  //     const key = String(item?.adhiniyam ?? 'Unknown').trim();
  //     if (!map.has(key)) map.set(key, []);
  //     map.get(key)!.push(item);
  //   }

  //   this.dharaNewGroups = Array.from(map.entries()).map(([adhiniyam, items]) => ({ adhiniyam, items }));
  // }

  buildDharaNewGroups() {
    const crimeType = this.selectedCrimType != null ? String(this.selectedCrimType).trim() : '';

    if (!crimeType || !Array.isArray(this.listOfDharaDataNew)) {
      this.dharaNewGroups = [];
      this.flattenedDharaForSelect = [];
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      return;
    }

    // Get all unique options from selected compartments
    const selectedOptions = new Set<string>();
    this.clipboardCompartment.forEach(comp => {
      if (comp.option) {
        selectedOptions.add(comp.option);
      }
    });

    const hasRF = selectedOptions.has('RF');
    const hasPF = selectedOptions.has('PF');
    const hasOA = selectedOptions.has('OA');

    // Determine filtering logic based on selected options
    let shouldShowAll = false;
    let allowedForestTypes: string[] = [];

    if (hasRF && (hasPF || hasOA)) {
      // RF AND (PF OR OA) selected → Show ALL adhiniyam and dhara
      shouldShowAll = true;
    } else if (hasRF && !hasPF && !hasOA) {
      // Only RF selected → Show RF and '' (empty)
      allowedForestTypes = ['RF', ''];
    } else if (hasPF && !hasRF) {
      // Only PF selected → Show PF, OA, and '' (empty)
      allowedForestTypes = ['PF', 'OA', ''];
    } else if (hasOA && !hasRF) {
      // Only OA selected → Show PF, OA, and '' (empty)
      allowedForestTypes = ['PF', 'OA', ''];
    } else if (hasPF && hasOA && !hasRF) {
      // PF and OA (without RF) → Show PF, OA, and '' (empty)
      allowedForestTypes = ['PF', 'OA', ''];
    } else {
      // No compartments selected or no options selected → Show only empty forest_type
      allowedForestTypes = [''];
    }

    // Filter based on crime type and forest type logic
    const filteredRaw = this.listOfDharaDataNew.filter((x: any) => {
      const itemForestType = String(x?.forest_type ?? '').trim();
      const itemCrimeType = String(x?.crime_type ?? '').trim();

      // Always filter by crime type
      if (itemCrimeType !== crimeType) {
        return false;
      }

      // If shouldShowAll is true, include all forest types
      if (shouldShowAll) {
        return true;
      }

      // Otherwise, filter by allowed forest types
      return allowedForestTypes.includes(itemForestType);
    });

    // ✅ Deduplicate same adhiniyam+dhara
    const filtered = Array.from(
      new Map(
        filteredRaw.map((x: any) => {
          const key = `${String(x?.adhiniyam ?? '').trim()}||${String(x?.dhara ?? '').trim()}`;
          return [key, x];
        })
      ).values()
    );

    const map = new Map<string, any[]>();
    for (const item of filtered) {
      const key = String(item?.adhiniyam ?? 'Unknown').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    this.dharaNewGroups = Array.from(map.entries()).map(([adhiniyam, items]) => ({ adhiniyam, items }));

    // Update flattened array after building groups - create new array to trigger change detection once
    const newFlattenedArray: any[] = [];
    this.dharaNewGroups.forEach(group => {
      group.items.forEach(item => {
        newFlattenedArray.push({
          ...item,
          displayLabel: `${group.adhiniyam} - ${(item as any).dhara || (item as any).adhara || ''}`,
          adhiniyamLabel: group.adhiniyam
        });
      });
    });

    // Assign new array reference (triggers change detection once instead of multiple times)
    this.flattenedDharaForSelect = newFlattenedArray;

    // Only update selected items if there are any selections, otherwise clear it
    if (this.selectedDharaNewIds.size > 0) {
      this.updateSelectedDharaItemsArray();
      this.updateSelectedDharaIdsArray();
    } else {
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      this.selectedDharaIdsArray = [];
    }
  }

  // Build dhara groups when only crime type is selected (no compartment option selected)
  buildDharaNewGroupsForCrimeTypeOnly() {
    const crimeType = this.selectedCrimType != null ? String(this.selectedCrimType).trim() : '';

    if (!crimeType || !Array.isArray(this.listOfDharaDataNew)) {
      this.dharaNewGroups = [];
      this.flattenedDharaForSelect = [];
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      this.selectedDharaIdsArray = [];
      return;
    }

    // Filter where itemForestType === '' (empty) and itemCrimeType matches selected crime type
    const filteredRaw = this.listOfDharaDataNew.filter((x: any) => {
      const itemForestType = String(x?.forest_type ?? '').trim();
      const itemCrimeType = String(x?.crime_type ?? '').trim();

      // Only match items with empty forest_type and matching crime_type
      return itemForestType === '' && itemCrimeType === crimeType;
    });

    // Deduplicate same adhiniyam+dhara
    const filtered = Array.from(
      new Map(
        filteredRaw.map((x: any) => {
          const key = `${String(x?.adhiniyam ?? '').trim()}||${String(x?.dhara ?? '').trim()}`;
          return [key, x];
        })
      ).values()
    );

    const map = new Map<string, any[]>();
    for (const item of filtered) {
      const key = String(item?.adhiniyam ?? 'Unknown').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    this.dharaNewGroups = Array.from(map.entries()).map(([adhiniyam, items]) => ({ adhiniyam, items }));

    // Update flattened array
    const newFlattenedArray: any[] = [];
    this.dharaNewGroups.forEach(group => {
      group.items.forEach(item => {
        newFlattenedArray.push({
          ...item,
          displayLabel: `${group.adhiniyam} - ${(item as any).dhara || (item as any).adhara || ''}`,
          adhiniyamLabel: group.adhiniyam
        });
      });
    });

    this.flattenedDharaForSelect = newFlattenedArray;

    // Update selected items if any
    if (this.selectedDharaNewIds.size > 0) {
      this.updateSelectedDharaItemsArray();
      this.updateSelectedDharaIdsArray();
    } else {
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      this.selectedDharaIdsArray = [];
    }
  }

  get filteredDharaNewGroups(): { adhiniyam: string; items: any[] }[] {
    const forestType = (this.selectedCompartmentOption ?? '').trim();
    const crimeType = this.selectedCrimType != null ? String(this.selectedCrimType).trim() : '';

    if (!forestType || !crimeType || !Array.isArray(this.listOfDharaDataNew)) return [];

    const filtered = this.listOfDharaDataNew.filter((x: any) =>
      String(x?.forest_type ?? '').trim() === forestType &&
      String(x?.crime_type ?? '').trim() === crimeType
    );

    const map = new Map<string, any[]>();
    for (const item of filtered) {
      const key = String(item?.adhiniyam ?? 'Unknown').trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    // optional: stable sort
    return Array.from(map.entries()).map(([adhiniyam, items]) => ({ adhiniyam, items }));
  }

  onDharaNewToggle(item: any, checked: boolean) {
    const id = String(item?.id ?? '');
    if (!id) return;

    if (checked) {
      this.selectedDharaNewIds.add(id);
    } else {
      this.selectedDharaNewIds.delete(id);
    }

    // keep selected objects list (optional)
    this.selectedDharaNewItems = this.listOfDharaDataNew.filter((x: any) =>
      this.selectedDharaNewIds.has(String(x?.id ?? ''))
    );

    // Update both arrays
    this.updateSelectedDharaItemsArray();
    this.updateSelectedDharaIdsArray();
  }

  // Helper method to convert value to string (for use in templates)
  toString(value: any): string {
    return String(value ?? '');
  }

  // Helper method to check if item is selected (for use in templates)
  isItemSelected(item: any): boolean {
    return this.selectedDharaNewIds.has(this.toString(item?.id));
  }

  // Helper method to get dhara display value (handles both dhara and adhara properties)
  getDharaDisplayValue(item: any): string {
    return (item?.dhara || (item as any)?.adhara || '').toString();
  }

  // Update selected items grouped by adhiniyam for display
  private updateSelectedDharaGroupedByAdhiniyam() {
    if (!this.selectedDharaItemsArray || this.selectedDharaItemsArray.length === 0) {
      this.selectedDharaGroupedByAdhiniyam = [];
      return;
    }

    const groupedMap = new Map<string, any[]>();

    this.selectedDharaItemsArray.forEach(item => {
      const adhiniyam = String(item?.adhiniyam ?? item?.adhiniyamLabel ?? 'Unknown').trim();
      if (!groupedMap.has(adhiniyam)) {
        groupedMap.set(adhiniyam, []);
      }
      groupedMap.get(adhiniyam)!.push(item);
    });

    this.selectedDharaGroupedByAdhiniyam = Array.from(groupedMap.entries()).map(([adhiniyam, items]) => ({
      adhiniyam,
      items
    }));
  }

  // Update selected items array for display (chips) - called manually to avoid performance issues
  private updateSelectedDharaItemsArray() {
    if (!this.flattenedDharaForSelect || this.flattenedDharaForSelect.length === 0) {
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      return;
    }

    // Create new array reference to trigger change detection once
    this.selectedDharaItemsArray = this.flattenedDharaForSelect.filter(item =>
      item && item.id && this.selectedDharaNewIds.has(String(item.id))
    );

    // Update grouped array
    this.updateSelectedDharaGroupedByAdhiniyam();
  }

  // Update selected IDs array - called manually to avoid performance issues
  private updateSelectedDharaIdsArray() {
    this.selectedDharaIdsArray = Array.from(this.selectedDharaNewIds);
  }

  // Handle when ng-select changes (called from template)
  onDharaIdsArrayChange(selectedIds: string[]) {
    this.onDharaMultiSelectChange(selectedIds || []);
    this.updateSelectedDharaIdsArray();
  }

  // Handle multi-select change from ng-select (receives array of IDs)
  onDharaMultiSelectChange(selectedIds: string[]) {
    this.selectedDharaNewIds.clear();
    this.selectedDharaNewItems = [];

    if (selectedIds && selectedIds.length > 0) {
      selectedIds.forEach(id => {
        const idStr = String(id ?? '');
        if (idStr) {
          this.selectedDharaNewIds.add(idStr);
          // Find the original item from listOfDharaDataNew
          const originalItem = this.listOfDharaDataNew.find((x: any) => String(x?.id ?? '') === idStr);
          if (originalItem) {
            this.selectedDharaNewItems.push(originalItem);
          }
        }
      });
    }

    // Update both arrays
    this.updateSelectedDharaItemsArray();
    this.updateSelectedDharaIdsArray();
  }

  openDharaInfo(item: any, groupAdhiniyam?: string) {
    // Get adhiniyam from parameter (from group), item, or adhiniyamLabel (added during flattening)
    this.dharaInfoAdhiniyam = String(groupAdhiniyam ?? item?.adhiniyam ?? item?.adhiniyamLabel ?? '').trim();

    // Get dhara (can be dhara or adhara)
    this.dharaInfoTitle = String(item?.dhara ?? item?.adhara ?? '').trim();

    // Get description (note: it's 'discription' not 'description' in the interface)
    this.dharaInfoDescription = String(item?.discription ?? item?.description ?? 'No description available').trim();

    // Debug logging - check browser console to see what data is being passed
    console.log('openDharaInfo - Item data:', {
      item,
      groupAdhiniyam,
      itemAdhiniyam: item?.adhiniyam,
      itemAdhiniyamLabel: item?.adhiniyamLabel,
      itemDhara: item?.dhara,
      itemAdhara: item?.adhara,
      itemDiscription: item?.discription,
      itemDescription: item?.description,
      finalAdhiniyam: this.dharaInfoAdhiniyam,
      finalTitle: this.dharaInfoTitle,
      finalDescription: this.dharaInfoDescription
    });

    this.isDharaInfoOpen = true;
  }

  closeDharaInfo() {
    this.isDharaInfoOpen = false;
  }
  clearDharaNewSelection() {
    this.selectedDharaNewIds.clear();
    this.selectedDharaNewItems = [];
    this.selectedDharaItemsArray = [];
    this.selectedDharaGroupedByAdhiniyam = [];
    this.selectedDharaIdsArray = [];
  }
  onCrimTypeChange() {
    


    if (this.clipboardCompartment.length === 0) {
      // Revert to previous crime type
      // this.selectedCrimType = this.previousSelectedCrimType;
      this.showError("कृपया पहले कम से कम एक कक्ष क्रमांक चुनें और उसके लिए RF/PF/OA विकल्प चुनें");
      return;
    }
    const compartmentsWithoutOptions = this.clipboardCompartment.filter(c => c.option === null);

    if (compartmentsWithoutOptions.length > 0) {
      // Revert to previous crime type
      // this.selectedCrimType = this.previousSelectedCrimType;

      // Show error message
      this.showError("कृपया सभी चुने गए कक्ष क्रमांक के लिए RF/PF/OA विकल्प चुनें");

      return; // Don't proceed with the change
    }
    // Use setTimeout to defer and avoid blocking UI
    // setTimeout(() => {
    // Always use buildDharaNewGroups which checks clipboardCompartment for options
    this.resetCascade('crimeType');
    if (this.selectedCrimType) {
      this.buildDharaNewGroups();
    }
    // }, 0);
  }
  //sandeep end 1 jan 26 2

  backButtonHandler: any;
  removeBackButtonListener() {
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
      this.backButtonHandler = null;
    }
  }

  isBeatNirikshan: boolean = true;
  // async onRadioChangeBeatNirikhan(event: any) {
  //   this.isBeatNirikshan = event.detail.value
  //   console.log(this.isBeatNirikshan, "open");
  //   this.clipboardCompartment = [];
  //   //this.selectedCompartmentValue = "";
  //   await this.resetCascade('compartment');
  // }

  onRadioChange(event: any) {
    this.isAccusedFound = event.detail.value
  }

  onRadioChangeIsVahanFound(event: any) {
    this.isVahanFound = event.detail.value
  }

  setCrimDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.crimeDate = `${yyyy}-${mm}-${dd}`;

    // Set golai list if price masters are loaded
    if (this.listOfVrikhaPriceMaster && this.listOfVrikhaPriceMaster.length > 0) {
      this.setListOfGolaiAccordingToYearAccordingToKhadaVrikha(yyyy);
    }
    if (this.listOfBambooPriceMaster && this.listOfBambooPriceMaster.length > 0) {
      this.setListOfBanshSizeAccordingToYearAndType(yyyy);
    }
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

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


  //ADDEDHTML Add these methods after the constructor
  //Code Added by sandeep start 4 method for accused person
  addAccusedPerson() {
    this.accusedPersons.push({
      name: "",
      fatherName: "",
      address: "",
      selectedCast: null,
      signatureImage: null,
      age: "",
      jati_name: "",
      mobile_number: "",
      aadhaar_number: ""
    });
  }

  //ADDEDHTML
  async removeAccusedPerson(index: number) {
    if (this.accusedPersons.length > 1) {
      const ok = await this.confirmYesNo("क्या आप अभियुक्त की प्रविष्टि हटाना चाहते हैं?");
      if (!ok) return;
      this.accusedPersons.splice(index, 1);
    }
  }
  //Code Added by sandeep end 4 method for accused person
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

  isGettingLocation = false;

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

  onLocationAtGhatnaSthalChange(value: 'yes' | 'no' | null): void {
    this.manualLat = '';
    this.manualLon = '';
    this.manualLocationAddress = '';

    if (value === 'yes' || value === 'no') {
      this.locationAtGhatnaSthal = value;
    }

    if (value === 'yes') {
      this.isGettingLocation = true;
      this.checkLocationPermissionAndNavigate();
    }
  }

  onManualLatInput(): void {
    const v = parseFloat(this.manualLat);
    if (!isNaN(v) && v < 0) this.manualLat = '0';
  }

  onManualLonInput(): void {
    const v = parseFloat(this.manualLon);
    if (!isNaN(v) && v < 0) this.manualLon = '0';
  }

  getMapAddress(): string {
    if (this.locationAtGhatnaSthal === 'yes') {
      return this.current_location_google_addres?.toString() ?? '';
    }
    if (this.locationAtGhatnaSthal === 'no') {
      return String(this.manualLocationAddress ?? '').trim();
    }
    return '';
  }

  getLat(): string {
    if (this.locationAtGhatnaSthal === 'yes') return this.lat.toString();
    if (this.locationAtGhatnaSthal === 'no') return String(this.manualLat ?? '').trim();
    return '';
  }

  getLon(): string {
    if (this.locationAtGhatnaSthal === 'yes') return this.lon.toString();
    if (this.locationAtGhatnaSthal === 'no') return String(this.manualLon ?? '').trim();
    return '';
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

  goBack() {
    this.navController.back();
  }

  async onSelecteCrimDate() {

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
        this.crimeDate = `${yyyy}-${mm}-${dd}`;

        // Set golai list if price masters are loaded
        if (this.listOfVrikhaPriceMaster && this.listOfVrikhaPriceMaster.length > 0) {
          this.setListOfGolaiAccordingToYearAccordingToKhadaVrikha(yyyy);
        }
        if (this.listOfBambooPriceMaster && this.listOfBambooPriceMaster.length > 0) {
          this.setListOfBanshSizeAccordingToYearAndType(yyyy);
        }

      }

    });

    await modal.present();

  }

  async onSelectActualCrimeDate() {
    const modal = await this.modalController.create({
      component: SelectDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        const selectedDateString = this.sharedService.getSelectedCrimeDate();

        // Validate the date string is not empty
        if (!selectedDateString || selectedDateString.trim() === '') {
          this.actualCrimeDate = "";
          return;
        }

        const date = new Date(selectedDateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
          this.actualCrimeDate = "";
          return;
        }

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        this.actualCrimeDate = `${yyyy}-${mm}-${dd}`;
      }
    });

    await modal.present();
  }

  clearActualCrimeDate(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.actualCrimeDate = "";
  }

  async onSelectJaptiKaDinak() {

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
        this.japti_ka_dinak = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  async validateForm(): Promise<boolean> {

    let complainer_name_title = "POR जारीकर्ता का नाम";

    if (this.complainer_name === "") {
      this.showError(complainer_name_title);
      return false;
    }

    if (this.complainer_ka_pad === "") {
      this.showError("जारीकर्ता का पद");
      return false;
    }



    await Preferences.set({ key: PreferenceKeys.emp_name, value: this.complainer_name });
    await Preferences.set({ key: PreferenceKeys.emp_designation, value: this.complainer_ka_pad });

    if (this.isAccusedFound === true) {
      for (let i = 0; i < this.accusedPersons.length; i++) {
        const person = this.accusedPersons[i];

        if (person.name === "") {
          this.showError(`अपराधी ${i + 1} का नाम दर्ज करें`);
          return false;
        }

        if (person.fatherName === "") {
          this.showError(`अपराधी ${i + 1} के पिता का नाम दर्ज करें`);
          return false;
        }

        if (person.address === "") {
          this.showError(`अपराधी ${i + 1} का पता दर्ज करें`);
          return false;
        }

        if (person.selectedCast === null) {
          this.showError(`अपराधी ${i + 1} की जाति वर्ग चुनें`);
          return false;
        }

        // if (person.signatureImage === null) {
        //   this.showError(`अपराधी ${i + 1} का हस्ताक्षर`);
        //   return false;
        // }

      }
    }

    if (this.por_number === "") {
      this.showError("POR क्रमांक प्रेषित करिये");
      return false;
    }

    if (this.listOfCompartment.length > 0 && this.clipboardCompartment.length === 0) {
      this.showError("कक्ष क्रमांक चुने");
      return false;
    }

    if (this.selectedCrimeBeat === "") {
      this.showError("अपराध बीट का नाम चुने");
      return false;
    }

    if (this.selectedCrimType === null) {
      this.showError("अपराध का प्रकार चुनें");
      return false;
    }

    if (this.clipboardDharas.length < 0) {
      this.showError("अपराथ की धारा चुने");
      return false;
    }

    // sandeepdonedone start - Updated witness validation using witnesses array
    const validWitnesses = (this.witnesses || []).filter(
      (w) => w?.name && String(w.name).trim() !== ''
    );
    if (validWitnesses.length === 0) {
      this.showError("साक्षी का नाम");
      return false;
    }

    const hasAddress = validWitnesses.some(w => w.address && String(w.address).trim() !== '');
    if (!hasAddress) {
      this.showError("साक्षी का पता");
      return false;
    }

    for (let i = 0; i < validWitnesses.length; i++) {
      const w = validWitnesses[i];
      // if (w.address && String(w.address).trim() !== '' && (!w.signatureImage || String(w.signatureImage).trim() === '')) {
      //   this.showError(`साक्षी ${i + 1} का हस्ताक्षर`);
      //   return false;
      // }
    }
    // sandeepdonedone end - Updated witness validation

    if (this.crimePlace === "") {
      this.showError("घटना स्थल");
      return false;
    }

    if (this.isAccusedFound && this.apradhiPhoto === "") {
      this.showError("अपराधी का फोटो");
      return false;
    }

    if (this.japtinamaPhotos.length === 0) {
      this.showError("जप्ति नामा का फोटो");
      return false;
    }

    if (this.panchanamaPhoto === "") {
      this.showError("जप्ति पंचनामा का फोटो");
      return false;
    }

    if (this.porPhoto === "") {
      this.showError("POR पर्त अपलोड करें");
      return false;
    }

    return true;

  }

  async previewForm() {

    // ✅ DEBUG: Check preview data before creating object
    console.log('=== PREVIEW FORM - JAPTI KA DINAK & STHAAN ===');
    console.log('japti_ka_dinak value:', this.japti_ka_dinak);
    console.log('japti_ka_dinak type:', typeof this.japti_ka_dinak);
    console.log('japti_ka_sthaan value:', this.japti_ka_sthaan);
    console.log('japti_ka_sthaan type:', typeof this.japti_ka_sthaan);
    console.log('=== END PREVIEW FORM DEBUG ===');

    let crimeDhara = '';

    // Check if selectedDharaNewItems has items
    if (this.selectedDharaNewItems && this.selectedDharaNewItems.length > 0) {
      const mappedDhara = this.selectedDharaNewItems
        .map((x: any) => `${String(x?.adhiniyam ?? '').trim()} - ${String(x?.dhara ?? '').trim()}`)
        .filter(s => s !== '-' && s.trim() !== '')
        .join(', ');

      if (mappedDhara && mappedDhara.trim() !== '') {
        crimeDhara = mappedDhara;
      }
    }
    
    let valueOfValidate = await this.validateForm();
    if (!valueOfValidate) {
      return; // Stop if validation fails
    }

    let isAccusedFOUND = "0";
    if (this.isAccusedFound === true) {
      isAccusedFOUND = "1";
    }

    //code added by sandeep start 1 Date 9/28/25
    // Prepare accused persons array for preview
    const accusedPersonsForPreview: AccusedPersonDetailForVanApradhPrakran[] = [];;
    if (this.isAccusedFound && this.accusedPersons.length > 0) {
      this.accusedPersons.forEach(person => {
        if (person.name.trim() !== "" || person.fatherName.trim() !== "" || person.address.trim() !== "") {
          accusedPersonsForPreview.push({
            name: person.name,
            fathersName: person.fatherName,
            address: person.address,
            cast: this.getCastName(person.selectedCast),
            signatureImage: person.signatureImage,
            base64: "",
            accussed_person_table_id: '',
            age: person.age,
            jati_name: person.jati_name,
            mobile_number: person.mobile_number,
            aadhaar_number: person.aadhaar_number,
            show_delete_button: true
          });
        }
      });
    }
    //code added by sandeep end 1 Date 9/28/25

    // sandeepdonedone start - Prepare witnesses for preview
    const witnessesForPreview: WitnessDetailForPor[] = [];
    if (this.witnesses && this.witnesses.length > 0) {
      this.witnesses.forEach(witness => {
        if (witness.name && witness.name.trim() !== "") {
          witnessesForPreview.push({
            name: witness.name || '',
            fatherName: witness.fatherName || '',
            address: witness.address || '',
            jaati: witness.jaati || '',
            age: witness.age || '',
            signatureImage: witness.signatureImage || '' // base64 signature
          });
        }
      });
    }
    // sandeepdonedone end

    let signatureName = "";
    if (this.signatureImage === null) {
      signatureName = "";
    } else {
      signatureName = this.signatureImage;
    }

    // NOTE: We intentionally allow extra preview-only fields (like witnesses/witnesses_json)
    // even if ComplainDetails interface doesn't include them yet.
    const complainDetails: any = {
      is_accused_found: isAccusedFOUND,
      complain_id: '0',
      complain_history_table_id: '0',
      complain_status: 'draft',
      complain_status_text: 'Draft',
      current_stage: '0',
      stage_name: 'Draft',
      complain_progress_stage: '0',
      button_text: 'Preview',
      show_approve_reject_button: '0',
      complain_created_by: this.complainer_name,
      ra_name: '',
      transferd_to: '',
      beat_name: this.selectedCrimeBeatName || '',
      lat: this.getLat(),
      lng: this.getLon(),
      map_address: this.getMapAddress(),
      accused_name: this.isAccusedFound ? this.accussedName : 'अज्ञात',
      accused_fathers_name: this.isAccusedFound ? this.accussedFatherName : 'अज्ञात',
      accused_address: this.isAccusedFound ? this.address : 'अज्ञात',
      cast_name: this.isAccusedFound ? this.getCastName(this.selectedAccusedCast) : 'अज्ञात',
      crime_type: this.getCrimeTypeName(this.selectedCrimType),
      type_of_crime: this.getCrimeTypeName(this.selectedCrimType),
      place_of_crime: this.crimePlace,
      date_of_crime: this.crimeDate,
      crime_dhara: crimeDhara,
      compartment_option: this.selectedCompartmentOption || '', // Changed from this.getCompartmentString()
      por_number: this.por_number,
      compartment_number: this.getCompartmentNumberWithOption(),
      // sandeepdonedone start - Updated to use witnesses array
      name_of_witness_one: (this.witnesses?.[0]?.name ? String(this.witnesses[0].name).trim() : '') || 'NA',
      name_of_witness_two: (this.witnesses?.[1]?.name ? String(this.witnesses[1].name).trim() : '') || 'NA',
      address_of_witness_one: (this.witnesses?.[0]?.address ? String(this.witnesses[0].address).trim() : '') || 'NA',
      address_of_witness_two: (this.witnesses?.[1]?.address ? String(this.witnesses[1].address).trim() : '') || 'NA',
      // sandeepdonedone end
      details_of_seized_goods: this.seizedGoodDetail || 'NA',
      total_japt_saman_costing: this.calculateTotalCosting(),
      all_image_name: this.photos.join(','),
      japti_nama_photo: this.japtinamaPhotos.join(','),
      panch_nama_photo: this.panchanamaPhoto,
      japtSamanList: this.getJaptSamanList(),
      Saman_Detail: this.getSamanDetailForPreview(),
      accusedPersons: accusedPersonsForPreview,
      accused_count: accusedPersonsForPreview.length,
      accused_persons_json: JSON.stringify(accusedPersonsForPreview),
      // sandeepdonedone start - Add witnesses data for preview
      witnesses: witnessesForPreview,
      witnesses_json: JSON.stringify(witnessesForPreview),
      // sandeepdonedone end
      imageUrl: '',
      left_days_to_resolve_por: '0',
      complainer_name: this.complainer_name,
      finalWorkLogDetailByRa: [],
      assigner_remark: "",
      circle_name: "",
      division_name: "",
      sub_division_name: "",
      range_name: "",
      sub_range_name: "",
      is_complain_created_by_ra: "",
      apradhi_photo: this.apradhiPhoto,
      por_photo: this.porPhoto,
      complainer_sign: signatureName,
      complainer_pad: this.complainer_ka_pad,
      // sandeepdonedone start - Updated to use witnesses array
      witness_1_sign: (this.witnesses?.[0]?.signatureImage ? String(this.witnesses[0].signatureImage).trim() : '') || this.witness1Sign,
      witness_2_sign: (this.witnesses?.[1]?.signatureImage ? String(this.witnesses[1].signatureImage).trim() : '') || this.witness2Sign,
      // sandeepdonedone end
      chinhaPhoto: this.chinhaPhoto,
      japtinama_anya_vishesh_vivran: this.japtinama_anya_vishesh_vivran,
      japtikarta_ka_name: this.japt_karne_wale_adhikari_ka_name,
      japtikarta_ka_pad: this.japt_karne_wale_adhikari_ka_pad,
      isJaptikartaSameAsPorJarikkarta: this.isJaptikartaSameAsPorJarikkarta ? '1' : '0',
      japtikarta_sign: this.isJaptikartaSameAsPorJarikkarta ? (signatureName || '') : (this.japtikarta_sign || ''),
      japti_ka_dinak: this.japti_ka_dinak || "",
      japti_ka_sthaan: this.japti_ka_sthaan || "",
      shesh_vasuli_rashi: "",
      is_japt_vahan: this.isVahanFound ? '1' : '0',
      is_vahan_suchana_given_by_ro_to_sdo: '',
      is_rajsath_suchana_given_by_sdo_to_majistret: '',
      patra_kramank: '',
      pratra_dinank: '',
      anya_vishesh_vivran: '',
      other_thing_which_not_present_by_officer: '',
      sdo_patra_kramank: '',
      sdo_patra_dinank: '',
      pristh_kramank: '',
      nayayalay_sthan: '',
      sdo_sankhipt_vivran: '',
      sys_gen_por_number: '',
      actual_crime_date: this.actualCrimeDate || '',
      vahan_detail: JSON.stringify(this.listOfVahanDetail),
      is_beat_nirikshan: this.isBeatNirikshan ? '1' : '0',
      transferd_by: '',
      focr_number: '',
      focr_date: '',
      beat_id: '',
      listOfWitness: [],
      // IDs needed by submit API when submitting from view-complain-detail3
      _beat_id: this.selectedCrimeBeat?.toString() || '',
      _circle_id: this.loginedOfficerCircleId?.toString() || '0',
      _division_id: this.loginedOfficerDivisionId?.toString() || '0',
      _sub_division_id: this.loginedOfficerSubDivisionId?.toString() || '0',
      _range_id: this.loginedOfficerRangId?.toString() || '0',
      _sub_rang_id: this.loginedOfficerSubRangId?.toString() || '0',
      _created_by: this.loginedOfficerEmpId?.toString() || '0',
      _type_of_crime_id: this.selectedCrimType?.toString() || '',
      _accused_cast_id: (this.isAccusedFound && this.accusedPersons.length > 0) ? (this.accusedPersons[0].selectedCast || '') : '',
      _accused_persons_for_api: this.isAccusedFound && this.accusedPersons.length > 0
        ? JSON.stringify(this.accusedPersons.map(p => ({
          Name: p.name || '',
          FathersName: p.fatherName || '',
          Address: p.address || '',
          Cast: p.selectedCast || '',
          Age: p.age || '',
          ActualCast: p.jati_name || '',
          mobile_number: p.mobile_number || '',
          aadhaar_number: p.aadhaar_number || ''
        })))
        : JSON.stringify([]),
      _saman_detail_for_api: JSON.stringify(this.getSamanDetailForPreview()),
      _details_of_seized_goods: this.otherJaptaSamanDetail?.toString() || 'NA'
    };


    const jsonData = JSON.stringify(complainDetails);

    this.router.navigateByUrl('/view-complain-detail3', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }


  async submitCrimDetail() {
    
    let complainer_name_title = "POR जारीकर्ता का नाम";

    if (this.complainer_name === "") {
      this.showError(complainer_name_title);
      return;
    }

    await Preferences.set({ key: PreferenceKeys.emp_name, value: this.complainer_name });
    await Preferences.set({ key: PreferenceKeys.emp_designation, value: this.complainer_ka_pad });

    if (this.isAccusedFound === true) {
      for (let i = 0; i < this.accusedPersons.length; i++) {
        const person = this.accusedPersons[i];

        if (person.name === "" || String(person.name).trim() === "") {
          this.showError(`अपराधी ${i + 1} का नाम दर्ज करें`);
          return;
        }

        if (person.fatherName === "" || String(person.fatherName).trim() === "") {
          this.showError(`अपराधी ${i + 1} के पिता का नाम दर्ज करें`);
          return;
        }

        if (person.age === "" || String(person.age).trim() === "") {
          this.showError(`अपराधी ${i + 1} उम्र दर्ज करें`);
          return;
        }

        if (person.jati_name === "" || String(person.jati_name).trim() === "") {
          this.showError(`अपराधी ${i + 1} की जाति दर्ज करें`);
          return;
        }

        if (person.address === "" || String(person.address).trim() === "") {
          this.showError(`अपराधी ${i + 1} का पता दर्ज करें`);
          return;
        }

        if (person.selectedCast === null) {
          this.showError(`अपराधी ${i + 1} की जाति वर्ग चुनें`);
          return;
        }

        // if (person.signatureImage === null) {
        //   this.showError(`अपराधी ${i + 1} का हस्ताक्षर`);
        //   return;
        // }

      }
    }

    if (this.por_number === "") {
      this.showError("POR क्रमांक प्रेषित करिये");
      return;
    }

    if (this.listOfCompartment.length > 0 && this.clipboardCompartment.length === 0) {
      this.showError("कक्ष क्रमांक चुने");
      return;
    }

    if (this.selectedCrimeBeat === "") {
      this.showError("अपराध बीट का नाम चुने");
      return;
    }

    if (this.selectedCrimType === null) {
      this.showError("अपराध का प्रकार चुनें");
      return;
    }

    if (this.clipboardDharas.length < 0) {
      this.showError("अपराथ की धारा चुने");
      return;
    }

    // sandeepdonedone start - Updated witness validation using witnesses array
    const validWitnesses = (this.witnesses || []).filter(
      (w) => w?.name && String(w.name).trim() !== ''
    );
    if (validWitnesses.length === 0) {
      this.showError("साक्षी का नाम");
      return;
    }

    const hasAddress = validWitnesses.some(w => w.address && String(w.address).trim() !== '');
    if (!hasAddress) {
      this.showError("साक्षी का पता");
      return;
    }
    // sandeepdonedone end - Updated witness validation

    // ✅ Validate actual crime date
    if (!this.actualCrimeDate || this.actualCrimeDate.trim() === '' || this.actualCrimeDate.includes('NaN')) {
      this.showError("अपराध की तिथि चुनें");
      return;
    }

    const seizedErr = this.validateCompartmentWiseSeizedGoodsForSubmit();
    if (seizedErr) {
      this.showError(seizedErr);
      return;
    }

    if (!this.getSamanDetailForPreview().length) {
      this.showError("कृपया जप्त सामग्रियों का विवरण प्रेषित करिये");
      return;
    }

    if (this.isVahanFound && this.listOfVahanDetail.length === 0) {
      this.showError("जप्त वाहन की जानकारी प्रविस्ट करिये");
      return;
    }

    for (let i = 0; i < (this.witnesses || []).length; i++) {
      const w = this.witnesses[i];


      if (!w?.name || String(w.name).trim() === "") {
        this.shortToast(`साक्षी ${i + 1} का नाम दर्ज करें`);
        return;
      }
      if (!w?.fatherName || String(w.fatherName).trim() === "") {
        this.shortToast(`साक्षी ${i + 1} के पिता का नाम दर्ज करें`);
        return;
      }
      if (!w?.address || String(w.address).trim() === "") {
        this.shortToast(`साक्षी ${i + 1} का पूर्ण पता दर्ज करें`);
        return;
      }
      if (!w?.jaati || String(w.jaati).trim() === "") {
        this.shortToast(`साक्षी ${i + 1} की जाति दर्ज करें`);
        return;
      }
      if (w?.age === null || w?.age === undefined || String(w.age).trim() === "") {
        this.shortToast(`साक्षी ${i + 1} की आयु दर्ज करें`);
        return;
      }

    }

    let isValidJaptVahanDetail: boolean = true;
    if (this.isVahanFound) {

      for (let i = 0; i < this.listOfVahanDetail.length; i++) {
        const row = this.listOfVahanDetail[i];
        

        if (
          !row.vahan_prakar ||
          !row.vahan_kramank ||
          !row.anumanit_mulya
        ) {
          isValidJaptVahanDetail = false;

          break;
        }
      }

    }

    if (!isValidJaptVahanDetail) {
      this.showError("जप्त वाहन की सभी जानकारी प्रविस्ट करिये");
      return;
    }


    if (this.crimePlace === "") {
      this.showError("घटना स्थल");
      return;
    }

    if (this.japt_karne_wale_adhikari_ka_name === "") {
      this.showError("जप्ती करने वाले अधिकारी का नाम लिखें");
      return;
    }

    if (this.japt_karne_wale_adhikari_ka_pad === "") {
      this.showError("जप्ती करने वाले अधिकारी का पद लिखें");
      return;
    }

    if (this.chinhaPhoto === "") {
      this.showError("चिन्ह जो जप्त सामग्री पर अंकित किया गया (HAMMER MARK) की फोटो लीजिये");
      return;
    }

    // sandeepdonedone start - Updated witness signature validation
    for (let i = 0; i < validWitnesses.length; i++) {
      const w = validWitnesses[i];
      // if (w.address && String(w.address).trim() !== '' && (!w.signatureImage || String(w.signatureImage).trim() === '')) {
      //   this.showError(`साक्षी ${i + 1} का हस्ताक्षर`);
      //   return;
      // }
    }
    // sandeepdonedone end - Updated witness signature validation

    if (this.japtinamaPhotos.length === 0) {
      this.showError("जप्ति नामा का फोटो");
      return;
    }

    if (this.isAccusedFound && this.apradhiPhoto === "") {
      this.showError("अपराधी का फोटो");
      return;
    }

    if (this.panchanamaPhoto === "") {
      this.showError("जप्ति पंचनामा का फोटो");
      return;
    }

    if (this.locationAtGhatnaSthal === null) {
      this.showError('कृपया बताएं: क्या लोकेशन घटना स्थल पर है?');
      return;
    }
    if (this.locationAtGhatnaSthal === 'no') {
      if (!String(this.manualLat ?? '').trim() || !String(this.manualLon ?? '').trim()) {
        this.showError('अक्षांश और देशांतर (मैनुअल) भरें');
        return;
      }
      if (!String(this.manualLocationAddress ?? '').trim()) {
        this.showError('घटना स्थल का पता (मैनुअल) भरें');
        return;
      }
    }

    if (this.porPhoto === "") {
      this.showError("POR पर्त अपलोड करें");
      return;
    }


    if (this.signatureImage === null) {
      this.showError("POR जारीकर्ता का हस्ताक्षर");
      return;
    }

    if (this.isJaptikartaSameAsPorJarikkarta) {
      this.japtikarta_sign = this.signatureImage || '';
    } else if (!this.japtikarta_sign || String(this.japtikarta_sign).trim() === '') {
      this.showError("जप्त करने वाले अधिकारी का हस्ताक्षर");
      return;
    }

    if (await this.networkCheckService.getCurrentStatus()) {
      this.previewForm();
    } else {

    }

  }




  validateBalliGolai(row: any) {

    const value = row.golai;

    // allow only pattern: number-number
    const pattern = /^[0-9]{1,3}-[0-9]{1,3}$/;

    // if invalid format → remove last character
    if (value && !pattern.test(value)) {
      // allow partial input while typing
      const partial = /^[0-9-]*$/;

      if (!partial.test(value)) {
        row.golai = value.slice(0, -1); // remove invalid character
      }
    }
  }

  validateBalliLambai(row: any) {

    const value = row.lambai;

    // allow only pattern: number-number
    const pattern = /^[0-9]{1,3}-[0-9]{1,3}$/;

    // if invalid format → remove last character
    if (value && !pattern.test(value)) {
      // allow partial input while typing
      const partial = /^[0-9-]*$/;

      if (!partial.test(value)) {
        row.lambai = value.slice(0, -1); // remove invalid character
      }
    }
  }

  validateGolai(row: any) {

    const value = row.golai;

    // allow only pattern: number-number
    const pattern = /^[0-9]{1,3}-[0-9]{1,3}$/;

    // if invalid format → remove last character
    if (value && !pattern.test(value)) {
      // allow partial input while typing
      const partial = /^[0-9-]*$/;

      if (!partial.test(value)) {
        row.golai = value.slice(0, -1); // remove invalid character
      }
    }
  }

  allowOnlyRangePatternForWarg(event: KeyboardEvent) {
    const allowed = /^[0-9-]$/;   // Only numbers and dash

    if (!allowed.test(event.key)) {
      event.preventDefault();  // BLOCK letters like "r" or "e"
    }
  }

  filterPorNumber(event: any) {
    const value = event.target.value;
    // Remove any characters that are not numbers or forward slash
    const filteredValue = value.replace(/[^0-9/]/g, '');
    if (value !== filteredValue) {
      this.por_number = filteredValue;
      // Update the input value
      event.target.value = filteredValue;
    }
  }

  async submitDataIntoOffline() {


    let comparetment = "";

    if (this.clipboardCompartment.length > 0) {
      comparetment = this.clipboardCompartment
        .map(d => `${d.name}${d.option ? ` (${d.option})` : ''}`)
        .join(', ');
    }

    const commaSeparated = this.clipboardDharas
      .map(d => `${d.extraInfo} - ${d.name}`)
      .join(', ');

    let photoCommaList = "";
    for (let i = 0; i < this.photos.length; i++) {
      if (i === 0) {
        photoCommaList += this.photos[i];
      } else {
        photoCommaList += "," + this.photos[i];
      }
    }

    let isAccusedFOUND = "0";
    if (this.isAccusedFound === true) {
      isAccusedFOUND = "1";
    }

    let accusedName = "";
    let accusedFatherName = "";
    let accusedAddress = "";
    let selectedCAST = "";

    if (this.isAccusedFound && this.accusedPersons.length > 0) {
      const firstAccused = this.accusedPersons[0];
      accusedName = firstAccused.name;
      accusedFatherName = firstAccused.fatherName;
      accusedAddress = firstAccused.address;
      if (firstAccused.selectedCast !== null) {
        selectedCAST = firstAccused.selectedCast;
      }
    }

    const seizedErrOffline = this.validateCompartmentWiseSeizedGoodsForSubmit();
    if (seizedErrOffline) {
      this.showError(seizedErrOffline);
      return;
    }

    const Saman_Detail = this.getSamanDetailForPreview();

    if (!Saman_Detail?.length) {
      this.showError("कृपया जप्त सामग्रियों का विवरण प्रेषित करिये");
      return;
    }

    if (this.selectedAccusedCast !== null) {
      selectedCAST = this.selectedAccusedCast;
    }

    let signatureName = "";
    if (this.signatureImage === null) {
      signatureName = "";
    } else {
      signatureName = this.signatureImage;
    }

    let beatNirikshanValue = "0";
    if (this.isBeatNirikshan) {
      beatNirikshanValue = "1";
    } else {
      beatNirikshanValue = "0";
    }

    if (this.isVahanFound && this.listOfVahanDetail.length === 0) {
      this.showError("जप्त वाहन की जानकारी प्रविस्ट करिये");
      return;
    }

    let isValidJaptVahanDetail: boolean = true;
    if (this.isVahanFound) {

      for (let i = 0; i < this.listOfVahanDetail.length; i++) {
        const row = this.listOfVahanDetail[i];
        

        if (
          !row.vahan_prakar ||
          !row.vahan_kramank ||
          !row.anumanit_mulya ||
          !row.pata ||
          !row.tahsil ||
          !row.jila
        ) {
          isValidJaptVahanDetail = false;

          break;
        }
      }

    }

    if (!isValidJaptVahanDetail) {
      this.showError("जप्त वाहन की सभी जानकारी प्रविस्ट करिये");
      return;
    }

    await this.sqliteService.insertPorData(
      this.complainer_name,
      isAccusedFOUND,
      "",
      "",
      "",
      "",

      this.selectedCrimType.toString(),                  // typeOfCrime

      this.crimePlace.toString(),          // placeOfCrime
      this.crimeDate,             // dateOfCrime
      this.otherJaptaSamanDetail?.toString() || 'NA',       // detailsOfSeizedGoods

      // sandeepdonedone start - Updated to use witnesses array
      (this.witnesses?.[0]?.name ? String(this.witnesses[0].name).trim() : '') || 'NA',               // name_of_witness_one
      (this.witnesses?.[1]?.name ? String(this.witnesses[1].name).trim() : '') || 'NA',             // name_of_witness_two
      (this.witnesses?.[0]?.address ? String(this.witnesses[0].address).trim() : '') || 'NA',      // address_of_witness_one
      (this.witnesses?.[1]?.address ? String(this.witnesses[1].address).trim() : '') || 'NA',      // address_of_witness_two
      // sandeepdonedone end

      this.loginedOfficerEmpId.toString(),              // createdBy

      this.loginedOfficerCircleId.toString(),               // circle_id
      this.loginedOfficerDivisionId.toString(),                  // division_id
      this.loginedOfficerSubDivisionId.toString(),              // sub_division_id
      this.loginedOfficerRangId.toString(),                // range_id
      this.loginedOfficerSubRangId.toString(),            // sub_rang_id
      this.selectedCrimeBeat.toString(),                 // beat_id

      comparetment,                // compartment_number
      commaSeparated,          // crime_dhara

      this.por_number.toString(),                 // por_number
      this.getLat(),                              // lat
      this.getLon(),                              // lng
      this.getMapAddress(),                       // map_address
      photoCommaList,   // photo_name_comma_separated,
      JSON.stringify(Saman_Detail),
      this.japtinamaPhotos.join(','),
      this.panchanamaPhoto,
      this.apradhiPhoto,
      this.porPhoto,
      signatureName,
      this.complainer_ka_pad,
      this.chinhaPhoto,
      this.japtinama_anya_vishesh_vivran,
      // sandeepdonedone start - Updated to use witnesses array
      (this.witnesses?.[0]?.signatureImage ? String(this.witnesses[0].signatureImage).trim() : '') || this.witness1Sign,
      (this.witnesses?.[1]?.signatureImage ? String(this.witnesses[1].signatureImage).trim() : '') || this.witness2Sign,
      // sandeepdonedone end
      this.japt_karne_wale_adhikari_ka_name,
      this.japt_karne_wale_adhikari_ka_pad,
      beatNirikshanValue
    );

    const porId = await this.sqliteService.getPorIdByPorNumber(this.por_number);

    if (porId && this.isAccusedFound && this.accusedPersons.length > 0) {

      for (let i = 0; i < this.accusedPersons.length; i++) {
        const person = this.accusedPersons[i];
        if (person.name.trim() !== "" || person.fatherName.trim() !== "" || person.address.trim() !== "") {
          let personCast = "";
          if (person.selectedCast !== null) {
            personCast = person.selectedCast;
          }

          await this.sqliteService.insertAccusedPerson(
            porId,
            person.name,
            person.fatherName,
            personCast,
            person.address,
            person.signatureImage,
            person.age,
            person.jati_name,
            person.mobile_number
          );

        }
      }

    }


    ///////// INSERT VAHAN DETAIL ///////////

    if (porId && this.isVahanFound && this.listOfVahanDetail.length > 0) {

      await this.sqliteService.deleteVahanDetailByPorId(porId);

      await this.sqliteService.insertMultipleVahanDetail(porId, this.listOfVahanDetail);

    }

    this.goBack();

  }

  async afterSubmitComplainSuccessfully(msg: string, isGoBack: boolean) {
    try {
      const modal = await this.modalController.create({
        component: MessageDialogComponent,
        cssClass: 'custom-dialog-modal',
        componentProps: {
          server_message: msg || 'आपका POR सफलतापूर्वक जमा किया गया |',
          isYesNo: false,
        },
        backdropDismiss: false,
      });

      modal.onDidDismiss().then((result) => {
        if (result.data?.confirmed || result.role === 'backdrop') {
          if (isGoBack) {
            this.goBack();
          }
        }
      });

      await modal.present();
    } catch (error) {
      console.error('Error showing success modal:', error);
      // Fallback to toast if modal fails
      this.longToast(msg || 'आपका POR सफलतापूर्वक जमा किया गया |');
      if (isGoBack) {
        setTimeout(() => {
          this.goBack();
        }, 2000);
      }
    }
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

  loginedOfficerEmpId: number = 0;
  loginedOfficerCircleId: string = "0";
  loginedOfficerDesignationId: string = "0";
  loginedOfficerDivisionId: string = "0";
  loginedOfficerSubDivisionId: string = "0";
  loginedOfficerRangId: string = "0";
  loginedOfficerSubRangId: string = "0";
  loginedOfficerBeatId: string = "0";

  isBG: boolean = false;
  isRA: boolean = false;

  private async syncPadFromLoginOfficer(userData: Users) {
    // Pad should follow the logged-in officer for RA (6) and BFO (5).
    const designationId = String(userData?.designation_id ?? '');
    const pad =
      designationId === '6' ? 'RA' :
        designationId === '5' ? 'BFO' :
          String((userData as any)?.designation_name ?? '');

    if (pad) {
      this.complainer_ka_pad = pad;
      this.japt_karne_wale_adhikari_ka_pad = pad;
      await Preferences.set({ key: PreferenceKeys.emp_designation, value: pad });
    }
  }

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
      this.loginedOfficerSubRangId = userData.sub_rang_id;
      this.loginedOfficerBeatId = userData.beat_id;

      if (userData.designation_id === "5") {
        this.isBG = true;
        this.complainer_ka_pad = "BFO";
      } else if (userData.designation_id === "6") {
        this.isRA = true;
        this.complainer_ka_pad = "RA";
      }

      this.japt_karne_wale_adhikari_ka_pad = this.complainer_ka_pad;


      if (await this.networkCheckService.getCurrentStatus()) {
        this.getMasterData();
      } else {

        const crimTypeMaster = await Preferences.get({ key: PreferenceKeys.crimType_master });

        const beatMaster = await Preferences.get({ key: PreferenceKeys.beat_master });
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

        if (beatMaster.value) {
          this.listOfBeat = JSON.parse(beatMaster.value);
        }

        if (castMasterType.value) {
          this.listOfCast = JSON.parse(castMasterType.value);
        }
        
        if (this.loginedOfficerDesignationId === "5") {

          this.selectedCrimeBeat = this.listOfBeat[0].id;
          this.selectedCrimeBeatName = this.listOfBeat[0].name;

          const rawCompartment = this.listOfBeat[0]?.compartment_no?.[0] ?? '';

          this.listOfCompartment = rawCompartment
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
            .map((name: string) => ({ name }));

          console.log(this.listOfCompartment, 'this.listOfCompartment');
        }

      }


      // this.selectedCrimeBeat = this.listOfBeat[0].id;
      // this.selectedCrimeBeatName = this.listOfBeat[0].name;


    }

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

  getMasterData() {
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getCastAndCrimMaster(this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

        if (response.response.code === 200) {
          //added

          console.log("response working", response);
          this.listOfCast = response.cast_data;
          console.log("dhara data new", response);
          this.listOfCrimType = response.crim_type_data;
          console.log("list of crim type", this.listOfCrimType);
          this.listOfBeat = response.beat_name

          console.log('dhara_data_new:', response.dhara_data_new);


          this.listOfDharaNew = response.dhara_data;


          this.listOfDharaDataNew = response.dhara_data_new ?? [];
          // this.buildDharaNewGroups();        

          // this.listOfDharaNew = response.dhara_data;
          this.listOfWoodPrajati = response.prajati_name;
          this.prepareWoodLists();

          // Load price masters
          this.listOfFormFactorMaster = response.form_factor_master ?? [];
          this.listOfBalliPriceMaster = response.balli_price_master ?? [];
          this.listOfLattaKasthaPriceMaster = response.lattha_price_master ?? [];
          this.listOfBambooPriceMaster = response.bamboo_price_master ?? [];
          this.listOfVrikhaPriceMaster = response.khada_vrikha_price_master ?? [];

          const year = new Date(this.crimeDate).getFullYear();
          this.setListOfGolaiAccordingToYearAccordingToKhadaVrikha(year);
          this.setListOfBanshSizeAccordingToYearAndType(year);

          
          if (this.loginedOfficerDesignationId === "5") {
            this.selectedCrimeBeat = this.listOfBeat[0].id;
            this.selectedCrimeBeatName = this.listOfBeat[0].name;

            const rawCompartment = this.listOfBeat[0]?.compartment_no?.[0] ?? '';

            this.listOfCompartment = rawCompartment
              .split(',')
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0)
              .map((name: string) => ({ name }));

          }



        }

        this.localListOfDharaHead = this.listOfDharaNew
          .map((item: { dhara_head: string; id: string, dhara_year: string }) => ({
            name: item.dhara_head,
            id: item.id,
            dharaYear: item.dhara_year
          }));


        //this.setActualDharayenAccrodingToHeadSelection(this.localListOfDharaHead[0]);


      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.showError(error);
      }
    );
  }

  prepareWoodLists(): void {
    this.woodListForExceptJalau = [];
    this.woodListForJalau = [];

    for (let i = 0; i < this.listOfWoodPrajati.length; i++) {
      const item = this.listOfWoodPrajati[i];
      const showIn = Number(item.show_in);

      // Except Jalau
      if (showIn === 0 || showIn === 1) {
        this.woodListForExceptJalau.push(item);
      }

      // Jalau
      if (showIn === 0 || showIn === 2) {
        this.woodListForJalau.push(item);
      }
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

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  async openImageViewer(imageSrc: string) {
    if (!imageSrc || imageSrc.trim() === '') return;

    // In this page most images are stored as base64 data URLs after approval.
    // If in future a normal URL/filename is passed, we just use it as-is.
    const finalUrl = imageSrc;

    const modal = await this.modalController.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: finalUrl,
      },
      backdropDismiss: true,
    });

    await modal.present();
  }

  clearSinglePhoto(
    type: 'chinha' | 'japtinama' | 'por' | 'apradhi' | 'panchanama',
    ev?: Event
  ) {
    if (ev) ev.stopPropagation();

    switch (type) {
      case 'chinha':
        this.chinhaPhoto = '';
        break;
      case 'japtinama':
        // For japtinama, we need index to remove specific photo
        // This function is for single photo clear, so we'll clear all if called
        this.japtinamaPhotos = [];
        break;
      case 'por':
        this.porPhoto = '';
        break;
      case 'apradhi':
        this.apradhiPhoto = '';
        break;
      case 'panchanama':
        this.panchanamaPhoto = '';
        break;
    }
  }

  async removePhoto(index: number, ev?: Event) {
    if (ev) ev.stopPropagation();
    const ok = await this.confirmYesNo("क्या आप फोटो हटाना चाहते हैं?");
    if (!ok) return;
    this.photos.splice(index, 1);
  }

  async removeJaptinamaPhoto(index: number, ev?: Event) {
    if (ev) ev.stopPropagation();
    const ok = await this.confirmYesNo("क्या आप जप्तीनामा फोटो हटाना चाहते हैं?");
    if (!ok) return;
    this.japtinamaPhotos.splice(index, 1);
  }

  async takePic() {
    if (this.photos.length >= this.MAX_OTHER_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_OTHER_PHOTOS} फोटो ले सकते हैं`);
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
          text: 'Gallery (Multiple)',
          icon: 'images-outline',
          handler: () => {
            this.otherFilesInput?.nativeElement?.click();
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
    if (this.photos.length >= this.MAX_OTHER_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_OTHER_PHOTOS} फोटो ले सकते हैं`);
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
      this.openImagePreviewModal(image.dataUrl, 'photos', this.photos.length);
    }
  }

  async openGalleryForPic() {
    if (this.photos.length >= this.MAX_OTHER_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_OTHER_PHOTOS} फोटो ले सकते हैं`);
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB.`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'photos', this.photos.length);
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }


  async takeApradhiPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForApradhi();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForApradhi();
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

  async openCameraForApradhi() {
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
      this.openImagePreviewModal(image.dataUrl, 'apradhi');
    }
  }

  async openGalleryForApradhi() {
    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB.`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'apradhi');
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }

  async takeChinhaImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForChinha();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForChinha();
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

  async openCameraForChinha() {
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
      this.openImagePreviewModal(image.dataUrl, 'chinha');
    }
  }

  async openGalleryForChinha() {
    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB.`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'chinha');
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }


  async takeJaptinamaPhoto() {
    if (this.japtinamaPhotos.length >= this.MAX_JAPTINAMA_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_JAPTINAMA_PHOTOS} फोटो ले सकते हैं`);
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForJaptinama();
          }
        },
        {
          text: 'Gallery (Multiple)',
          icon: 'images-outline',
          handler: () => {
            this.japtinamaFileInput?.nativeElement?.click();
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

  async openCameraForJaptinama() {
    if (this.japtinamaPhotos.length >= this.MAX_JAPTINAMA_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_JAPTINAMA_PHOTOS} फोटो ले सकते हैं`);
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
      const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
      const fileSizeInBytes = (base64String.length * 3) / 4;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const maxSizeKB = 300;

      // if (fileSizeInKB > maxSizeKB) {
      //   this.showError(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
      //   return;
      // }

      this.openImagePreviewModal(image.dataUrl, 'japtinama', this.japtinamaPhotos.length);
    }
  }

  async openGalleryForJaptinama() {
    if (this.japtinamaPhotos.length >= this.MAX_JAPTINAMA_PHOTOS) {
      this.longToast(`आप अधिकतम ${this.MAX_JAPTINAMA_PHOTOS} फोटो ले सकते हैं`);
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'japtinama', this.japtinamaPhotos.length);
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }

  async takePanchaNamaPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForPanchaNama();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForPanchaNama();
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

  async openCameraForPanchaNama() {
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
      this.openImagePreviewModal(image.dataUrl, 'panchanama');
    }
  }

  async openGalleryForPanchaNama() {
    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB.`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'panchanama');
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }


  async takePorPhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForPor();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForPor();
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

  async openCameraForPor() {
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
      this.openImagePreviewModal(image.dataUrl, 'por');
    }
  }

  async openGalleryForPor() {
    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        // Calculate file size from base64 DataUrl
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        // Base64 encoding increases size by ~33%, so we calculate: (length * 3) / 4
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB.`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'por');
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Error selecting image from gallery:', error);
    }
  }

  // Image Preview/Edit Modal Methods
  openImagePreviewModal(imageDataUrl: string, type: 'apradhi' | 'chinha' | 'japtinama' | 'panchanama' | 'por' | 'photos', index: number = -1) {
    this.originalImageDataUrl = imageDataUrl; // Store original
    this.previewImageDataUrl = imageDataUrl;
    this.previewImageType = type;
    this.previewImageIndex = index;
    this.imageRotation = 0; // Reset rotation
    this.isImagePreviewModalOpen = true;

    // Initialize cropper after view updates - wait longer for modal to render
    setTimeout(() => {
      this.initializeCropper();
    }, 300); // Increased from 100 to 300ms
  }

  async initializeCropper() {
    if (!this.imagePreviewElement?.nativeElement) {
      // Retry if element not ready
      setTimeout(() => this.initializeCropper(), 100);
      return;
    }

    const img = this.imagePreviewElement.nativeElement;

    // Wait for image to load
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve) => {
        const onLoad = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          resolve(true);
        };
        const onError = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          resolve(false);
        };
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onError);

        // Timeout after 5 seconds
        setTimeout(() => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          resolve(false);
        }, 5000);
      });
    }

    // Dynamically import cropperjs
    const Cropper = (await import('cropperjs')).default;

    // Destroy existing cropper instance
    if (this.cropperInstance) {
      try {
        this.cropperInstance.destroy();
      } catch (e) {
        console.warn('Error destroying cropper:', e);
      }
      this.cropperInstance = null;
    }

    // Ensure image is visible and properly sized
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.height = 'auto';

    // Create new cropper instance
    try {
      this.cropperInstance = new Cropper(img, {
        aspectRatio: undefined, // Free aspect ratio
        viewMode: 1,
        dragMode: 'crop',
        autoCropArea: 0.8,
        restore: false,
        guides: true,
        center: true,
        highlight: true, // Change to true to make crop box more visible
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        responsive: true,
        zoomable: true, // Enable zoom
        scalable: true, // Enable scale
        rotatable: false, // We handle rotation separately
        ready: () => {
          // Cropper is ready - ensure it's centered and crop box is visible
          if (this.cropperInstance) {
            try {
              this.cropperInstance.center();
              // Ensure crop box is visible
              const cropBoxData = this.cropperInstance.getCropBoxData();
              if (cropBoxData) {
                this.cropperInstance.setCropBoxData(cropBoxData);
              }
            } catch (e) {
              console.warn('Error centering cropper:', e);
            }
          }
          console.log('Cropper initialized successfully');
        }
      } as any);
    } catch (error) {
      console.error('Error initializing cropper:', error);
    }
  }

  rotateImage() {
    if (!this.cropperInstance || !this.imagePreviewElement?.nativeElement || this.isRotating) return;

    this.isRotating = true;
    this.imageRotation = (this.imageRotation + 90) % 360;
    this.applyRotation();
  }

  applyRotation() {
    if (!this.cropperInstance || !this.imagePreviewElement?.nativeElement) {
      this.isRotating = false;
      return;
    }

    // Always rotate from the original image
    const originalImage = new Image();

    originalImage.crossOrigin = 'anonymous';

    originalImage.onload = () => {
      try {
        // Create a canvas to rotate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          this.isRotating = false;
          return;
        }

        // Adjust canvas size based on rotation
        if (this.imageRotation === 90 || this.imageRotation === 270) {
          canvas.width = originalImage.height;
          canvas.height = originalImage.width;
        } else {
          canvas.width = originalImage.width;
          canvas.height = originalImage.height;
        }

        // Set background to white for better quality
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rotate the image
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((this.imageRotation * Math.PI) / 180);
        ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);

        // Update the image source with rotated image
        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        // Update previewImageDataUrl to the rotated version
        this.previewImageDataUrl = rotatedDataUrl;

        // Update the image src directly first
        this.imagePreviewElement.nativeElement.src = rotatedDataUrl;

        // Wait a bit for image to load, then replace in cropper
        setTimeout(() => {
          if (this.cropperInstance && this.imagePreviewElement?.nativeElement) {
            // Replace the image in cropper without triggering events
            this.cropperInstance.replace(rotatedDataUrl, false);

            // Reset crop box after rotation
            setTimeout(() => {
              if (this.cropperInstance) {
                this.cropperInstance.reset();
                this.isRotating = false;
              }
            }, 150);
          } else {
            this.isRotating = false;
          }
        }, 50);
      } catch (error) {
        console.error('Error applying rotation:', error);
        this.isRotating = false;
      }
    };

    originalImage.onerror = () => {
      console.error('Error loading image for rotation');
      this.isRotating = false;
    };

    // Always use the original image for rotation
    originalImage.src = this.originalImageDataUrl;
  }

  approveImage() {
    if (!this.cropperInstance) {
      this.rejectImage();
      return;
    }

    // Get cropped canvas (rotation is already applied to the image in cropper)
    const canvas = this.cropperInstance.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      maxWidth: 1920,
      maxHeight: 1920,
    });

    if (!canvas) {
      this.rejectImage();
      return;
    }

    // Convert to data URL (rotation is already applied since we rotated the source image)
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Check file size
    const base64String = croppedDataUrl.split(',')[1] || croppedDataUrl;
    const fileSizeInBytes = (base64String.length * 3) / 4;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const maxSizeKB = 300;

    // if (fileSizeInKB > maxSizeKB) {
    //   this.showError(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB. Please crop more.`);
    //   return;
    // }

    // Assign to appropriate property
    if (this.previewImageType === 'apradhi') {
      this.apradhiPhoto = croppedDataUrl;
    } else if (this.previewImageType === 'chinha') {
      this.chinhaPhoto = croppedDataUrl;
    } else if (this.previewImageType === 'japtinama') {
      if (this.previewImageIndex >= 0 && this.previewImageIndex < this.japtinamaPhotos.length) {
        // Replace existing photo
        this.japtinamaPhotos[this.previewImageIndex] = croppedDataUrl;
      } else {
        // Add new photo - check limit
        if (this.japtinamaPhotos.length >= 3) {
          this.longToast("आप अधिकतम 3 फोटो ले सकते हैं");
          this.closeImagePreviewModal();
          return;
        }
        this.japtinamaPhotos.push(croppedDataUrl);
      }
    } else if (this.previewImageType === 'panchanama') {
      this.panchanamaPhoto = croppedDataUrl;
    } else if (this.previewImageType === 'por') {
      this.porPhoto = croppedDataUrl;
    } else if (this.previewImageType === 'photos') {
      if (this.previewImageIndex >= 0 && this.previewImageIndex < this.photos.length) {
        this.photos[this.previewImageIndex] = croppedDataUrl;
      } else {
        if (this.photos.length >= this.MAX_OTHER_PHOTOS) {
          this.longToast(`आप अधिकतम ${this.MAX_OTHER_PHOTOS} फोटो ले सकते हैं`);
          this.closeImagePreviewModal();
          return;
        }
        this.photos.push(croppedDataUrl);
      }
    }

    // Clean up and close modal
    this.closeImagePreviewModal();
  }

  rejectImage() {
    this.closeImagePreviewModal();
  }

  closeImagePreviewModal() {
    if (this.cropperInstance) {
      this.cropperInstance.destroy();
      this.cropperInstance = null;
    }
    this.isImagePreviewModalOpen = false;
    this.previewImageDataUrl = '';
    this.originalImageDataUrl = '';
    this.previewImageType = null;
    this.previewImageIndex = -1;
    this.imageRotation = 0;
    this.isRotating = false; // Reset rotation flag

    // Continue multi-select queue (if any)
    this.isQueueProcessing = false;
    setTimeout(() => this.processNextQueuedImage(), 0);
  }


  selectedDhara: string = "";
  //selectedComparatment: string = "0";

  getSelectedCrimDhara(): string {
    const crime = this.listOfCrimType.find((c: { id: any; }) => c.id == this.selectedCrimType);
    if (crime != null) {
      this.selectedDhara = crime.dhara;
    }
    return crime ? "अपराध धारा :" + crime.dhara : '';
  }

  // getSelectedBeatCompartment(): string {
  //   const crime = this.listOfBeat.find((c: { id: any; }) => c.id == this.selectedCrimeBeat);
  //   if (crime != null) {
  //     this.selectedComparatment = crime.compartment_no;
  //   }
  //   return crime ? "अपराध कपरमेन्ट क्रमांक :" + crime.compartment_no : '';
  // }

  async removeRow(index: number) {
    const ok = await this.confirmYesNo("क्या आप धारा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    this.listOfDhara.splice(index, 1);
  }

  addRowInDharaList() {
    this.listOfDhara.push({ dharaYear: '', dharaSection: '' });
  }

  clipboardDharas: { id: string; name: string, extraInfo: string }[] = [];

  clipboardCompartment: { name: string; option: 'RF' | 'PF' | 'OA' | null }[] = [];

  selectedDharayen(selected: any) {

    const selectedId = selected.id ?? selected; // works if you get object or string

    const selectedItem = this.localListOfActualDhara.find(d => d.id === selectedId);
    if (selectedItem) {

      const newDhara = {
        id: selectedItem.id,
        name: selectedItem.name, // extra text
        extraInfo: this.selectedDharaHeadYear
      };

      // Avoid duplicates
      if (!this.clipboardDharas.some(d => d.id === selectedItem.id)) {
        this.clipboardDharas.push(newDhara);
      }
    }

    
    this.selectedDharaValue = null;

  }

  async onSelectBeat(selected: any) {

    this.listOfCompartment = [];
    this.clipboardCompartment = [];
    this.compartmentWiseSeizedGoods = [];
    this.selectedCompartmentValue = null;
    await this.resetCascade('compartment');

    const selectedId = selected.id ?? selected; // works if you get object or string

    this.selectedCrimeBeatName = selected.name;
    this.selectedCrimeBeat = selected.id;

    const selectedItem = this.listOfBeat.find((item: { id: any; }) => item.id === selectedId);
    
    if (selectedItem) {
      const rawCompartment = selectedItem?.compartment_no?.[0] ?? '';

      this.listOfCompartment = rawCompartment
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .map((name: string) => ({ name }));

    }

  }

  selectedCompartmentValue: string | null = null;
  selectedDharaValue: number | null = null;

  async selectedCompartment(selected: any) {
    // Legacy method - now uses checkbox toggle
    const selectedName = selected.name ?? selected;
    await this.onCompartmentToggle({ name: selectedName }, true);
  }

  async removeDhara(id: string) {
    const ok = await this.confirmYesNo("क्या आप धारा हटाना चाहते हैं?");
    if (!ok) return;
    this.clipboardDharas = this.clipboardDharas.filter(d => d.id !== id);
    this.selectedDharaValue = null;
  }

  async removeCompartment(name: string) {
    const ok = await this.confirmYesNo("क्या आप कम्पार्टमेंट हटाना चाहते हैं?");
    if (!ok) return;
    // Remove from compartment-wise seized goods
    this.compartmentWiseSeizedGoods = this.compartmentWiseSeizedGoods.filter(c => c.compartment_number !== name);
    this.clipboardCompartment = this.clipboardCompartment.filter(c => c.name !== name);
    this.selectedCompartmentValue = null;

    // Update selectedCompartmentNames array
    this.selectedCompartmentNames = this.clipboardCompartment.map(c => c.name);

    // selectedCompartmentValue changed => everything below must reset (even if some compartments remain)
    await this.resetCascade('compartment');

    // Rebuild dhara groups if crime type is selected
    setTimeout(() => {
      if (this.selectedCrimType) {
        this.buildDharaNewGroups();
      }
    }, 0);
  }

  // Check if compartment is selected (only if it has an option)
  isCompartmentSelected(compartment: any): boolean {
    const compartmentName = compartment?.name ?? compartment;
    const comp = this.clipboardCompartment.find(c => c.name === compartmentName);
    // Only return true if compartment exists AND has an option selected
    return comp !== undefined && comp.option !== null;
  }

  // Check if compartment is pending option selection
  isCompartmentPendingOption(compartment: any): boolean {
    const compartmentName = compartment?.name ?? compartment;
    return this.pendingCompartmentOption === compartmentName;
  }

  // Get selected option for a compartment
  getCompartmentOption(compartmentName: string): 'RF' | 'PF' | 'OA' | null {
    const compartment = this.clipboardCompartment.find(c => c.name === compartmentName);
    return compartment?.option ?? null;
  }

  // Toggle compartment dropdown
  toggleCompartmentDropdown() {
    this.isCompartmentDropdownOpen = !this.isCompartmentDropdownOpen;
  }

  // Toggle dhara dropdown
  toggleDharaDropdown() {
    this.isDharaDropdownOpen = !this.isDharaDropdownOpen;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Handle compartment dropdown
    if (!target.closest('.custom-dropdown-trigger') && !target.closest('.custom-dropdown-content')) {
      this.isCompartmentDropdownOpen = false;
      // Clear pending compartment option when dropdown closes without selection
      if (this.pendingCompartmentOption) {
        this.pendingCompartmentOption = null;
      }
    }

    // Handle dhara dropdown
    if (!target.closest('.dhara-dropdown-trigger') && !target.closest('.dhara-dropdown-content')) {
      this.isDharaDropdownOpen = false;
    }
  }

  // Toggle compartment selection - Modified to require option selection
  async onCompartmentToggle(compartment: any, checked: boolean) {
    const compartmentName = compartment?.name ?? compartment;

    if (checked) {
      // Check if compartment already exists with an option
      const existing = this.clipboardCompartment.find(c => c.name === compartmentName);

      if (existing && existing.option) {
        // Already selected with option, allow toggle off
        return;
      }

      // Set as pending - show RF/PF/OA options
      // Don't add to clipboardCompartment yet - wait for option selection
      this.pendingCompartmentOption = compartmentName;

    } else {
      // Allow unchecking (removing compartment)
      this.clipboardCompartment = this.clipboardCompartment.filter(c => c.name !== compartmentName);
      this.pendingCompartmentOption = null;
      // Remove from compartment-wise seized goods
      this.compartmentWiseSeizedGoods = this.compartmentWiseSeizedGoods.filter(c => c.compartment_number !== compartmentName);
      // Reset cascade when compartment is removed
      await this.resetCascade('compartment');
      // Update selectedCompartmentNames array
      this.selectedCompartmentNames = this.clipboardCompartment.map(c => c.name);

      // Rebuild dhara groups if crime type is selected
      setTimeout(() => {
        if (this.selectedCrimType) {
          this.buildDharaNewGroups();
        }
      }, 0);
    }
  }

  // Handle RF/PF/OA option change for a specific compartment
  async onCompartmentOptionChangeForCompartment(compartmentName: string, option: 'RF' | 'PF' | 'OA') {
    // Find or create compartment entry
    let compartment = this.clipboardCompartment.find(c => c.name === compartmentName);

    if (!compartment) {
      // Add compartment with the selected option
      this.clipboardCompartment.push({ name: compartmentName, option: option });
    } else {
      // Update existing compartment option
      compartment.option = option;
    }

    // Clear pending state
    this.pendingCompartmentOption = null;

    // Update selectedCompartmentNames array
    this.selectedCompartmentNames = this.clipboardCompartment.map(c => c.name);

    // Initialize compartment-wise seized goods data
    this.initializeCompartmentWiseData();

    // Reset cascade when option changes
    await this.resetCascade('option');
    // Rebuild dhara groups based on new compartment options
    setTimeout(() => {
      if (this.selectedCrimType) {
        this.buildDharaNewGroups();
      }
    }, 0);
  }

  // Compartment-wise seized goods data structure
  compartmentWiseSeizedGoods: {
    compartment_number: string;
    compartment_option: string;
    isSelected: boolean;
    selectedTypes: {
      thunth: boolean;
      kashtha: boolean;
      balli: boolean;
      chiran: boolean;
      chatta: boolean;
      bansh: boolean;
      fencing_pol: boolean;
      other: boolean;
    };
    thunthDetail: any[];
    kashthaDetail: any[];
    balliDetail: any[];
    chiranaDetail: any[];
    chattaDetail: any[];
    banshDetail: any[];
    fencingPolDetail: any[];
    otherJaptSamanDetail: any[];
  }[] = [];

  cachedThunthFlat: any[] = [];
  cachedKashthaFlat: any[] = [];
  cachedBalliFlat: any[] = [];
  cachedChiranFlat: any[] = [];
  cachedChattaFlat: any[] = [];
  cachedBanshFlat: any[] = [];
  cachedFencingPolFlat: any[] = [];
  cachedOtherJaptSamanFlat: any[] = [];
  cachedTotalThunthNag = 0;
  cachedTotalKashthNag = 0;
  cachedTotalKashthGhanMeter = '0.0000';
  cachedTotalBalliNag = 0;
  cachedTotalChiranNag = 0;
  cachedTotalChiranGhanMeter = '0.0000';
  cachedTotalChattaNag = 0;
  cachedTotalVyaparikBanshNag = 0;
  cachedTotalOdyogicBanshNag = 0;
  cachedTotalFencingPolNag = 0;
  cachedTotalOtherJaptSamanNag = 0;
  cachedTotalOtherJaptSamanGhanMeter = '0.0000';

  refreshSeizedGoodsSummaryCache() {
    this.cachedThunthFlat = this.getAllThunthFlat();
    this.cachedKashthaFlat = this.getAllKashthaFlat();
    this.cachedBalliFlat = this.getAllBalliFlat();
    this.cachedChiranFlat = this.getAllChiranFlat();
    this.cachedChattaFlat = this.getAllChattaFlat();
    this.cachedBanshFlat = this.getAllBanshFlat();
    this.cachedFencingPolFlat = this.getAllFencingPolFlat();
    this.cachedOtherJaptSamanFlat = this.getAllOtherJaptSamanFlat();
    this.cachedTotalThunthNag = this.getTotalAllThunthNag();
    this.cachedTotalKashthNag = this.getTotalAllKashthNag();
    this.cachedTotalKashthGhanMeter = this.getTotalAllKashthGhanMeter();
    this.cachedTotalBalliNag = this.getTotalAllBalliNag();
    this.cachedTotalChiranNag = this.getTotalAllChiranNag();
    this.cachedTotalChiranGhanMeter = this.getTotalAllChiranGhanMeter();
    this.cachedTotalChattaNag = this.getTotalAllChattaNag();
    this.cachedTotalVyaparikBanshNag = this.getTotalAllVyaparikBanshNag();
    this.cachedTotalOdyogicBanshNag = this.getTotalAllOdyogicBanshNag();
    this.cachedTotalFencingPolNag = this.getTotalAllFencingPolNag();
    this.cachedTotalOtherJaptSamanNag = this.getTotalAllOtherJaptSamanNag();
    this.cachedTotalOtherJaptSamanGhanMeter = this.getTotalAllOtherJaptSamanGhanMeter();
  }

  // Initialize compartment-wise data when compartments are selected
  initializeCompartmentWiseData() {
    // Remove compartments that are no longer selected
    this.compartmentWiseSeizedGoods = this.compartmentWiseSeizedGoods.filter(c =>
      this.clipboardCompartment.some(comp => comp.name === c.compartment_number)
    );

    // Add new compartments or update existing ones
    this.clipboardCompartment.forEach(comp => {
      const existing = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === comp.name);
      if (!existing) {
        this.compartmentWiseSeizedGoods.push({
          compartment_number: comp.name,
          compartment_option: comp.option || '',
          isSelected: false,
          selectedTypes: {
            thunth: false,
            kashtha: false,
            balli: false,
            chiran: false,
            chatta: false,
            bansh: false,
            fencing_pol: false,
            other: false
          },
          thunthDetail: [],
          kashthaDetail: [],
          balliDetail: [],
          chiranaDetail: [],
          chattaDetail: [],
          banshDetail: [],
          fencingPolDetail: [],
          otherJaptSamanDetail: []
        });
      } else {
        // Update option if changed
        existing.compartment_option = comp.option || '';
        // Update compartment_option in all existing items
        [...existing.thunthDetail, ...existing.kashthaDetail, ...existing.balliDetail,
        ...existing.chiranaDetail, ...existing.chattaDetail, ...existing.banshDetail,
        ...existing.fencingPolDetail, ...existing.otherJaptSamanDetail].forEach(item => {
          item.compartment_option = comp.option || '';
        });
      }
    });
  }

  // Toggle compartment selection for seized goods entry
  onCompartmentForSeizedToggle(compartment: any, checked: boolean) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartment.name
    );
    if (compData) {
      compData.isSelected = checked;
    }
  }

  // Toggle seized type checkbox for a compartment
  onSeizedTypeToggle(compartmentNumber: string, type: string, checked: boolean) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      (compData.selectedTypes as any)[type] = checked;
    }
  }

  // Add seized item methods for specific compartment
  addThunthInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.thunthDetail.push({
        jabti_saman_type: '1',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addKasthaInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.kashthaDetail.push({
        jabti_saman_type: '2',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addBalliInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.balliDetail.push({
        jabti_saman_type: '6',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addChiranInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.chiranaDetail.push({
        jabti_saman_type: '4',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addChattaInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.chattaDetail.push({
        jabti_saman_type: '5',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addOtherJaptSamanDetailForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.otherJaptSamanDetail.push({
        jabti_saman_type: '3',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addBanshInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.banshDetail.push({
        jabti_saman_type: '7',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  addFencingPolInfoForCompartment(compartmentNumber: string) {
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData) {
      compData.fencingPolDetail.push({
        jabti_saman_type: '8',
        prajati_type: 0,
        lambai: '',
        golai: '',
        ghan_meter: '',
        nag: '',
        dar: '',
        total_cost: '',
        if_other_then_detail: '',
        motai: '',
        unchai: '',
        kasth_halat: '',
        is_yogya_to_parivahan: '',
        if_not_yogya_then_reason: '',
        compartment_number: compartmentNumber,
        compartment_option: compData.compartment_option
      });
    }
  }

  // Remove methods for compartment-wise
  async removeThunthInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप ठूंठ की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.thunthDetail.length) {
      compData.thunthDetail.splice(index, 1);
    }
  }

  async removeKasthaInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप लट्ठा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.kashthaDetail.length) {
      compData.kashthaDetail.splice(index, 1);
    }
  }

  async removeBalliInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप बल्ली की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.balliDetail.length) {
      compData.balliDetail.splice(index, 1);
    }
  }

  async removeChiranInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप चिरान की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.chiranaDetail.length) {
      compData.chiranaDetail.splice(index, 1);
    }
  }

  async removeChattaInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप जलाऊ चट्टा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.chattaDetail.length) {
      compData.chattaDetail.splice(index, 1);
    }
  }

  async removeOtherJaptSamanDetailForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप अन्य जप्त सामग्री की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.otherJaptSamanDetail.length) {
      compData.otherJaptSamanDetail.splice(index, 1);
    }
  }

  async removeBanshInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप बाँस की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.banshDetail.length) {
      compData.banshDetail.splice(index, 1);
    }
  }

  async removeFencingPolInfoForCompartment(compartmentNumber: string, index: number) {
    const ok = await this.confirmYesNo("क्या आप फेंसिंग पोल की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    const compData = this.compartmentWiseSeizedGoods.find(c =>
      c.compartment_number === compartmentNumber
    );
    if (compData && index >= 0 && index < compData.fencingPolDetail.length) {
      compData.fencingPolDetail.splice(index, 1);
    }
  }

  // Calculate totals for compartment-wise data
  getTotalThunthNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.thunthDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalKashthNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.kashthaDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalKashthGhanMeterForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.kashthaDetail.reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);
  }

  getTotalBalliNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.balliDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalChiranNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.chiranaDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalChiranGhanMeterForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.chiranaDetail.reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);
  }

  getTotalChattaNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.chattaDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalOtherJaptSamanNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.otherJaptSamanDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalOtherJaptSamanGhanMeterForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.otherJaptSamanDetail.reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);
  }

  getTotalBanshNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.banshDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalVyaparikBanshNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.banshDetail
      .filter(item => Number(item.prajati_type) === 1)
      .reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalOdyogicBanshNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.banshDetail
      .filter(item => Number(item.prajati_type) === 2)
      .reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalFencingPolNagForCompartment(compartmentNumber: string): number {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentNumber);
    if (!compData) return 0;
    return compData.fencingPolDetail.reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  // Helper method to check if compartment is selected for seized goods entry
  isCompartmentSelectedForSeized(compartmentName: string): boolean {
    const compData = this.compartmentWiseSeizedGoods.find(c => c.compartment_number === compartmentName);
    return compData ? compData.isSelected : false;
  }

  selectedDharaHeadYear: any;

  setActualDharayenAccrodingToHeadSelection(selected: any) {

    this.selectedDharaHeadYear = selected.name;

    this.localListOfActualDhara = [];

    const selectedId = selected.id ?? selected; // works if you get object or string

    const selectedItem = this.listOfDharaNew.find((item: { id: any; }) => item.id === selectedId);

    if (selectedItem) {
      this.localListOfActualDhara = selectedItem.dhara_comma_separated[0]
        .split(',')
        .map((d: string, index: number) => ({
          id: (index + 1).toString(),
          name: d.trim()
        }));
    }

    this.selectedDharaValue = null;

  }

  get totalThunthNag(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChattaNag(): number {
    return this.listOfChattaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
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

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalKashthNag(): number {
    return this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalligNag(): number {
    return this.listOfBalliDetail.reduce(
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

  calculateGhanMeterKastha(row: any) {
    const crimeYear = new Date(this.crimeDate).getFullYear();
    const prajatiType = String(row.prajati_type);
    const enteredLength = Number(row.lambai);
    const enteredGirth = Number(row.golai);
    const circleId = String(this.loginedOfficerCircleId);

    const baseFilter = (item: any) =>
      item.circle === circleId &&
      item.applicable_year === crimeYear.toString() &&
      this.isValueInRange(enteredLength, item.length) &&
      this.isValueInRange(enteredGirth, item.girh_class);

    let singleRow: any = null;

    if (prajatiType !== '0') {
      singleRow = this.listOfLattaKasthaPriceMaster.find(item =>
        baseFilter(item) && item.prajati === prajatiType
      );
    }

    if (!singleRow) {
      singleRow = this.listOfLattaKasthaPriceMaster.find(item =>
        baseFilter(item) && item.prajati === '0'
      );
    }

    if (singleRow === undefined) {
      return;
    }

    const golai = parseFloat(row.golai) || 0;
    const lambai = parseFloat(row.lambai) || 0;
    const nag = parseFloat(row.nag) || 0;

    row.ghan_meter = ((lambai * (golai * golai)) / 160000) * nag;
    row.ghan_meter = row.ghan_meter.toFixed(3);
  }

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

  calculateGhanMeter(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const nag = parseFloat(row.nag) || 0;
    row.ghan_meter = (golai * nag).toFixed(2); // 2 decimal places
    row.ghan_meter = "0";
  }

  isValueInRange(value: number, range: string): boolean {
    if (!value || !range) return false;

    // "0-1", "1-2", "41-50"
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      // min inclusive, max exclusive
      return value >= min && value < max;
    }

    // "ABOVE 180"
    if (range.toUpperCase().includes('ABOVE')) {
      const min = Number(range.replace(/\D/g, ''));
      return value >= min;
    }

    return false;
  }

  setListOfGolaiAccordingToYearAccordingToKhadaVrikha(yearOfCrim: number) {
    this.listOfGolaiValueThunth = Array.from(
      new Map(
        this.listOfVrikhaPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&
            item.price != "0"
          )
          .map((item, index) => [
            item.girh_class,
            {
              id: index + 1,
              name: item.girh_class
            }
          ])
      ).values()
    );

    console.log('Golai Thunth from VrikhaPriceMaster for year', yearOfCrim, this.listOfGolaiValueThunth);

    if (this.listOfGolaiValueThunth.length === 0) {
      this.setListOfGolaiAccordingToYear(yearOfCrim);
    }
  }

  /**
   * For Thunth: filter golai list based on selected prajati + year + circle,
   * with fallback to prajati "0" when no direct match is found.
   */
  setGolaiForThunthByPrajati(row: any) {
    // Clear existing options
    
    this.listOfGolaiValueThunth = [];

    if (!this.crimeDate || !this.listOfVrikhaPriceMaster || this.listOfVrikhaPriceMaster.length === 0) {
      return;
    }

    const year = new Date(this.crimeDate).getFullYear();
    const expectedYear = year.toString();
    const expectedPrajati = row?.prajati_type?.toString() ?? '';
    const expectedCircle = this.loginedOfficerCircleId?.toString() ?? '';

    // First, try to get entries for the selected prajati
    const filteredByPrajati = this.listOfVrikhaPriceMaster.filter(item =>
      item.applicable_year === expectedYear &&
      item.circle === expectedCircle &&
      item.prajati === expectedPrajati &&
      item.price != "0"
    );

    this.listOfGolaiValueThunth = Array.from(
      new Map(
        filteredByPrajati.map((item, index) => [
          item.girh_class,
          {
            id: index + 1,
            name: item.girh_class
          }
        ])
      ).values()
    );

    // If no data for that prajati, fallback to prajati "0"
    if (this.listOfGolaiValueThunth.length === 0) {
      const fallbackList = this.listOfVrikhaPriceMaster.filter(item =>
        item.applicable_year === expectedYear &&
        item.circle === expectedCircle &&
        item.prajati === "0" &&
        item.price != "0"
      );

      this.listOfGolaiValueThunth = Array.from(
        new Map(
          fallbackList.map((item, index) => [
            item.girh_class,
            {
              id: index + 1,
              name: item.girh_class
            }
          ])
        ).values()
      );
    }
  }

  setListOfGolaiAccordingToYear(yearOfCrim: number) {
    this.listOfGolaiValueThunth = Array.from(
      new Map(
        this.listOfFormFactorMaster
          .filter(item => item.applicable_year === yearOfCrim.toString())
          .map((item, index) => [
            item.girh_class,
            {
              id: index + 1,
              name: item.girh_class
            }
          ])
      ).values()
    );

    console.log('Golai Thunth from FormFactorMaster for year', yearOfCrim, this.listOfGolaiValueThunth);
  }

  checkMinMaxForRowLatthaGolai(row: any) {
    let min = 0;
    let max = 0;
    if (!this.listOfGolaiForLatthaKasth || this.listOfGolaiForLatthaKasth.length === 0) {
      min = 0;
      max = 0;
      return;
    }

    const first = this.listOfGolaiForLatthaKasth[0].name;
    if (first.toUpperCase().includes('ABOVE')) {
      min = Number(first.replace(/\D/g, ''));
    } else {
      const [minStart] = first.split('-').map(Number);
      min = minStart;
    }

    // Last element → max
    const last = this.listOfGolaiForLatthaKasth[this.listOfGolaiForLatthaKasth.length - 1].name;
    if (last.toUpperCase().includes('ABOVE')) {
      max = 500; // fixed upper limit
    } else {
      const [, maxEnd] = last.split('-').map(Number);
      max = maxEnd;
    }

    if (row.golai != null) {
      if (row.golai >= min && row.golai <= max) {
        // Valid
      } else {
        this.showError("गोलाई " + min + " से.मी. से कम की प्रविष्टि नहीं की जा सकती , कृपया सही गोलाई प्रविष्ट करें ");
        row.golai = "";
      }
    }

    this.calculateGhanMeterKastha(row);
  }

  checkMinMaxForRowLatthaLambai(row: any) {
    let min = 0;
    let max = 0;
    if (!this.listOfLambaiForLatthaKasth || this.listOfLambaiForLatthaKasth.length === 0) {
      min = 0;
      max = 0;
      return;
    }

    const first = this.listOfLambaiForLatthaKasth[0].name;
    if (first.toUpperCase().includes('ABOVE')) {
      min = Number(first.replace(/\D/g, ''));
    } else {
      const [minStart] = first.split('-').map(Number);
      min = minStart;
    }

    // Last element → max
    const last = this.listOfLambaiForLatthaKasth[this.listOfLambaiForLatthaKasth.length - 1].name;
    if (last.toUpperCase().includes('ABOVE')) {
      max = 500; // fixed upper limit
    } else {
      const [, maxEnd] = last.split('-').map(Number);
      max = maxEnd;
    }

    if (row.lambai >= min && row.lambai <= max) {
      // Valid
    } else {
      row.lambai = "";
    }

    this.calculateGhanMeterKastha(row);
  }

  setLambaiOrGolaiValidation(row: any) {
    row.lambai = null;
    row.golai = null;
    this.listOfGolaiForLatthaKasth = [];
    this.listOfLambaiForLatthaKasth = [];

    const crimeYear = new Date(this.crimeDate).getFullYear();

    this.listOfGolaiForLatthaKasth = Array.from(
      new Map(
        this.listOfLattaKasthaPriceMaster
          .filter(item =>
            item.applicable_year === crimeYear.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&
            item.prajati === row.prajati_type.toString()
          )
          .map((item, index) => [
            item.girh_class,
            {
              id: index + 1,
              name: item.girh_class
            }
          ])
      ).values()
    );

    this.listOfLambaiForLatthaKasth = Array.from(
      new Map(
        this.listOfLattaKasthaPriceMaster
          .filter(item =>
            item.applicable_year === crimeYear.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&
            item.prajati === row.prajati_type.toString()
          )
          .map((item, index) => [
            item.length,
            {
              id: index + 1,
              name: item.length
            }
          ])
      ).values()
    );
  }

  setListOfLambaiAndGolaiAccordingToYearAndPrajatiSelection(row: any) {
    row.lambai = null;
    row.golai = null;

    this.listOfLambaiValueBalli = [];
    this.listOfGolaiValueBalli = [];

    const yearOfCrim = new Date(this.crimeDate).getFullYear();

    this.listOfLambaiValueBalli = Array.from(
      new Map(
        this.listOfBalliPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&
            item.prajati === row.prajati_type.toString()
          )
          .map((item, index) => [
            item.length,
            {
              id: index + 1,
              name: item.length
            }
          ])
      ).values()
    );

    this.listOfGolaiValueBalli = Array.from(
      new Map(
        this.listOfBalliPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&
            item.prajati === row.prajati_type.toString()
          )
          .map((item, index) => [
            item.girh_class,
            {
              id: index + 1,
              name: item.girh_class
            }
          ])
      ).values()
    );

    if (this.listOfLambaiValueBalli.length === 0 ||
      this.listOfGolaiValueBalli.length === 0
    ) {
      this.listOfLambaiValueBalli = Array.from(
        new Map(
          this.listOfBalliPriceMaster
            .filter(item =>
              item.applicable_year === yearOfCrim.toString() &&
              item.circle === this.loginedOfficerCircleId.toString() &&
              item.prajati === "0"
            )
            .map((item, index) => [
              item.length,
              {
                id: index + 1,
                name: item.length
              }
            ])
        ).values()
      );

      this.listOfGolaiValueBalli = Array.from(
        new Map(
          this.listOfBalliPriceMaster
            .filter(item =>
              item.applicable_year === yearOfCrim.toString() &&
              item.circle === this.loginedOfficerCircleId.toString() &&
              item.prajati === "0"
            )
            .map((item, index) => [
              item.girh_class,
              {
                id: index + 1,
                name: item.girh_class
              }
            ])
        ).values()
      );
    }
  }

  setListOfBanshSizeAccordingToYearAndType(yearOfCrim: number) {
    this.listOfBanshSizeVyaparik = Array.from(
      new Map(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.bambu_type === "1" &&
            item.circle === this.loginedOfficerCircleId.toString())
          .map((item, index) => [
            item.size,
            {
              id: index + 1,
              name: item.size
            }
          ])
      ).values()
    );

    this.listOfBanshSizeOdyogic = Array.from(
      new Map(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.bambu_type === "2" &&
            item.circle === this.loginedOfficerCircleId.toString())
          .map((item, index) => [
            item.size,
            {
              id: index + 1,
              name: item.size
            }
          ])
      ).values()
    );
  }

  setBanshList(prajati_type: number): IdAndNameModel[] {
    if (prajati_type === 1) {
      return this.listOfBanshSizeVyaparik;
    } else {
      return this.listOfBanshSizeOdyogic;
    }
  }

  resetAllBanshEntry(row: any) {
    row.lambai = null;
    row.nag = null;
    row.ghan_meter = "";
  }

  calculateNosionalTon(row: any) {
    let lambai = parseFloat(row.lambai) || 0;
    let nag = parseFloat(row.nag) || 0;

    let mult = (lambai * nag);
    let matra = ((mult) / 2400).toFixed(3);
    row.ghan_meter = matra;
  }

  async removeThunthInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप ठूंठ की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
    }
  }

  async removeChattaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप जलाऊ चट्टा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfChattaDetail.length) {
      this.listOfChattaDetail.splice(index, 1);
    }
  }

  async removeChiranInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप चिरान की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfChiranaDetail.length) {
      this.listOfChiranaDetail.splice(index, 1);
    }
  }

  async removeKashthaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप लट्ठा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfKashthaDetail.length) {
      this.listOfKashthaDetail.splice(index, 1);
    }
  }

  otherJaptaSamanDetail: string = "";



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
      kasth_halat: string,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string
    }[] = [];

  addOtherJaptSamanDetail() {
    
    this.listOfOtherJaptSamanDetail.push({
      jabti_saman_type: '3', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
    });
  }

  async removeOtherJaptiSaman(index: number) {
    const ok = await this.confirmYesNo("क्या आप अन्य जप्त सामग्री की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfOtherJaptSamanDetail.length) {
      this.listOfOtherJaptSamanDetail.splice(index, 1);
    }
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
      kasth_halat: string,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string
    }[] = [];

  addChattaInfo() {
    this.listOfChattaDetail.push({
      jabti_saman_type: '5', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: ''
    });
  }

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
      motai: string,
      unchai: string,
      kasth_halat: string
    }[] = [];

  addThunthInfo() {
    this.listOfThunthDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: ''
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
      kasth_halat: string,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string
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
      kasth_halat: string,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string
    }[] = [];


  addKasthaInfo() {
    this.listOfKashthaDetail.push({
      jabti_saman_type: '2', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: ''
    });
  }

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
      kasth_halat: string,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string
    }[] = [];

  addBalliInfo() {
    this.listOfBalliDetail.push({
      jabti_saman_type: '6', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
    });
  }

  async removeBalliInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप बल्ली की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfBalliDetail.length) {
      this.listOfBalliDetail.splice(index, 1);
    }
  }

  addChiranInfo() {
    this.listOfChiranaDetail.push({
      jabti_saman_type: '4', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '',
      is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
    });
  }









  private getCastName(castId: any): string {
    if (!castId) return 'अज्ञात';
    const cast = this.listOfCast.find((c: any) => c.id === castId);
    return cast ? cast.name : 'अज्ञात';
  }

  private getCrimeTypeName(crimeTypeId: any): string {
    if (!crimeTypeId) return 'अज्ञात';
    const crimeType = this.listOfCrimType.find((c: any) => c.id === crimeTypeId);
    return crimeType ? crimeType.name : 'अज्ञात';
  }

  private getCrimeDharaString(): string {
    if (this.clipboardDharas.length === 0) return 'अज्ञात';
    return this.clipboardDharas
      .map(d => `${d.extraInfo} - ${d.name}`)
      .join(', ');
  }

  private getCompartmentString(): string {
    if (this.clipboardCompartment.length === 0) return '0';
    return this.clipboardCompartment
      .map(c => c.name)
      .join(', ');
  }

  private getCompartmentNumberWithOption(): string {
    if (this.clipboardCompartment.length === 0) return '0';
    return this.clipboardCompartment
      .map(c => {
        if (c.option) {
          return `${c.name} - ${c.option}`;
        }
        return c.name; // Fallback if option is not selected
      })
      .join(', ');
  }

  private calculateTotalCosting(): string {
    let totalCost = 0;

    // Calculate cost from Kashtha items
    this.listOfKashthaDetail.forEach(item => {
      const cost = parseFloat(item.total_cost) || 0;
      totalCost += cost;
    });

    // Calculate cost from Thunth items
    this.listOfThunthDetail.forEach(item => {
      const cost = parseFloat(item.total_cost) || 0;
      totalCost += cost;
    });

    return totalCost.toString();
  }

  private getJaptSamanList(): (JaptSamanItem & { can_delete: boolean, compartment_number: string })[] {
    const japtSamanList: (JaptSamanItem & { can_delete: boolean, compartment_number: string })[] = [];

    // Add Chiran items
    // Add Kashtha items
    this.listOfChiranaDetail.forEach(item => {
      if (item.prajati_type && item.lambai && item.golai && item.motai && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '4',
          actual_name_of_saman: 'चिरान',
          saman_table_id: '0',
          prajati_name: this.getPrajatiName(item.prajati_type),
          prajati_type: item.prajati_type,
          lambai: item.lambai,
          golai: item.golai,
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: '',
          one_golai_less: '',
          form_factor: '',
          motai: item.motai,
          unchai: item.unchai,
          kasth_halat: 0,
          kasth_halat_name: '',
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason,
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''

        });
      }
    });

    // Add Kashtha items
    this.listOfKashthaDetail.forEach(item => {
      if (item.prajati_type && item.lambai && item.golai && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '2',
          actual_name_of_saman: 'लट्ठा',
          saman_table_id: '0',
          prajati_name: this.getPrajatiName(item.prajati_type),
          prajati_type: item.prajati_type,
          lambai: item.lambai,
          golai: item.golai,
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: '',
          one_golai_less: '',
          form_factor: '',
          motai: '',
          unchai: item.unchai,
          kasth_halat: Number(item.kasth_halat),
          kasth_halat_name: this.getKasthHalatName(item.kasth_halat),
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason,
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''
        });
      }
    });

    // Add Kashtha items
    this.listOfBalliDetail.forEach(item => {
      if (item.prajati_type && item.lambai && item.golai && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '6',
          actual_name_of_saman: 'बल्ली',
          saman_table_id: '0',
          prajati_name: this.getPrajatiName(item.prajati_type),
          prajati_type: item.prajati_type,
          lambai: item.lambai,
          golai: item.golai,
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: '',
          one_golai_less: '',
          form_factor: '',
          motai: '',
          unchai: item.unchai,
          kasth_halat: Number(item.kasth_halat),
          kasth_halat_name: this.getKasthHalatName(item.kasth_halat),
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason,
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''
        });
      }
    });


    // Add Thunth items
    this.listOfThunthDetail.forEach(item => {
      if (item.prajati_type && item.golai && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '1',
          actual_name_of_saman: 'ठूंठ',
          saman_table_id: '0',
          prajati_name: this.getPrajatiName(item.prajati_type),
          prajati_type: item.prajati_type,
          lambai: '0',
          golai: item.golai,
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: '',
          one_golai_less: '',
          form_factor: '',
          motai: '',
          unchai: item.unchai,
          kasth_halat: 0,
          kasth_halat_name: '',
          is_yogya_to_parivahan: '',
          if_not_yogya_then_reason: '',
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''
        });
      }
    });

    // Add Thunth items
    this.listOfChattaDetail.forEach(item => {
      if (item.prajati_type && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '5',
          actual_name_of_saman: 'चट्टा',
          saman_table_id: '0',
          prajati_name: this.getPrajatiName(item.prajati_type),
          prajati_type: item.prajati_type,
          lambai: '0',
          golai: item.golai,
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: '',
          one_golai_less: '',
          form_factor: '',
          motai: '',
          unchai: item.unchai,
          kasth_halat: 0,
          kasth_halat_name: '',
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason,
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''
        });
      }
    });

    this.listOfOtherJaptSamanDetail.forEach(item => {
      if (item.prajati_type && item.nag) {
        japtSamanList.push({
          jabti_saman_type: '3',
          actual_name_of_saman: 'अन्य',
          saman_table_id: '0',
          prajati_name: '',
          prajati_type: 0,
          lambai: '0',
          golai: '',
          ghan_meter: item.ghan_meter || '0',
          nag: item.nag,
          dar: item.dar || '0',
          total_cost: item.total_cost || '0',
          if_other_then_detail: item.if_other_then_detail,
          one_golai_less: '',
          form_factor: '',
          motai: '',
          unchai: item.unchai,
          kasth_halat: 0,
          kasth_halat_name: '',
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason,
          is_janch_karta_entry: true,
          site_quality: 0,
          is_dar_editable: false,
          can_delete: true,
          compartment_number: ''
        });
      }
    });

    // Add other items if any
    // if (this.otherJaptaSamanDetail && this.otherJaptaSamanDetail.trim() !== '') {
    //   japtSamanList.push({
    //     jabti_saman_type: '3',
    //     actual_name_of_saman: 'अन्य',
    //     saman_table_id: '0',
    //     prajati_name: '',
    //     prajati_type: 0,
    //     lambai: '',
    //     golai: '',
    //     ghan_meter: '',
    //     nag: '',
    //     dar: '',
    //     total_cost: '0',
    //     if_other_then_detail: this.otherJaptaSamanDetail,
    //     one_golai_less: '',
    //     form_factor: '',
    //     motai: '',
    //     unchai: '',
    //     kasth_halat: 0,
    //     kasth_halat_name: '',
    //     is_yogya_to_parivahan: '',
    //     if_not_yogya_then_reason: ''
    //   });
    // }

    return japtSamanList;
  }

  private hasPrajatiType(v: any): boolean {
    return v !== null && v !== undefined && v !== '' && Number(v) !== 0;
  }

  private isNonEmptyField(v: any): boolean {
    return v !== null && v !== undefined && String(v).trim() !== '';
  }

  private validateParivahanRow(row: any): boolean {
    const y = row?.is_yogya_to_parivahan;
    if (y === undefined || y === null || y === '') {
      return false;
    }
    if (y === '0') {
      return String(row.if_not_yogya_then_reason ?? '').trim() !== '';
    }
    return true;
  }

  /**
   * Validates seized goods for compartments the user selected for जप्त सामान entry.
   * Returns Hindi error message or null if OK.
   */
  private validateCompartmentWiseSeizedGoodsForSubmit(): string | null {
    const comps = this.compartmentWiseSeizedGoods.filter(c => c.isSelected);

    for (const comp of comps) {
      const label = `कक्ष ${comp.compartment_number}${comp.compartment_option ? ` (${comp.compartment_option})` : ''
        }`;

      if (comp.selectedTypes.thunth) {
        if (!comp.thunthDetail?.length) {
          return `${label}: ठूंठ के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.thunthDetail) {
          if (
            !this.hasPrajatiType(row.prajati_type) ||
            !this.isNonEmptyField(row.nag) ||
            !this.isNonEmptyField(row.golai)
          ) {
            return `${label}: ठूंठ की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.kashtha) {
        if (!comp.kashthaDetail?.length) {
          return `${label}: लट्ठा के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.kashthaDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: लट्ठा — वनोपज डिपो परिवहन / कारण भरें`;
          }


          if (
            !this.hasPrajatiType(row.prajati_type) ||
            !this.isNonEmptyField(row.lambai) ||
            !this.isNonEmptyField(row.golai) ||
            !this.isNonEmptyField(row.nag) ||
            !this.isNonEmptyField(row.ghan_meter)
          ) {
            return `${label}: लट्ठा की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.balli) {
        if (!comp.balliDetail?.length) {
          return `${label}: बल्ली के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.balliDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: बल्ली — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (
            !this.hasPrajatiType(row.prajati_type) ||
            !this.isNonEmptyField(row.lambai) ||
            !this.isNonEmptyField(row.golai) ||
            !this.isNonEmptyField(row.nag)
          ) {
            return `${label}: बल्ली की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.chiran) {
        if (!comp.chiranaDetail?.length) {
          return `${label}: चिरान के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.chiranaDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: चिरान — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (
            !this.hasPrajatiType(row.prajati_type) ||
            !this.isNonEmptyField(row.motai) ||
            !this.isNonEmptyField(row.lambai) ||
            !this.isNonEmptyField(row.golai) ||
            !this.isNonEmptyField(row.nag) ||
            !this.isNonEmptyField(row.ghan_meter)
          ) {
            return `${label}: चिरान की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.chatta) {
        if (!comp.chattaDetail?.length) {
          return `${label}: जलाऊ के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.chattaDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: जलाऊ — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (!this.hasPrajatiType(row.prajati_type) || !this.isNonEmptyField(row.nag)) {
            return `${label}: जलाऊ की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.bansh) {
        if (!comp.banshDetail?.length) {
          return `${label}: बाँस के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.banshDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: बाँस — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (
            !this.hasPrajatiType(row.prajati_type) ||
            !this.isNonEmptyField(row.lambai) ||
            !this.isNonEmptyField(row.nag) || !this.isNonEmptyField(row.ghan_meter)
          ) {
            return `${label}: बाँस की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.fencing_pol) {
        if (!comp.fencingPolDetail?.length) {
          return `${label}: फेंसिंग पोल के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.fencingPolDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: फेंसिंग पोल — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (!this.hasPrajatiType(row.prajati_type) || !this.isNonEmptyField(row.nag)) {
            return `${label}: फेंसिंग पोल की सम्पूर्ण जानकारी भरें`;
          }
        }
      }

      if (comp.selectedTypes.other) {
        if (!comp.otherJaptSamanDetail?.length) {
          return `${label}: अन्य जप्त सामान के लिए कम से कम एक पंक्ति जोड़ें`;
        }
        for (const row of comp.otherJaptSamanDetail) {
          if (!this.validateParivahanRow(row)) {
            return `${label}: अन्य जप्त सामान — वनोपज डिपो परिवहन / कारण भरें`;
          }
          if (!this.isNonEmptyField(row.if_other_then_detail)) {
            return `${label}: अन्य जप्त सामान की सम्पूर्ण जानकारी भरें`;
          }
        }
      }
    }

    return null;
  }

  /** अन्य जप्त सामान: empty / whitespace → "0" for API / DB safety */
  private normalizeOtherJaptTotalCostForApi(value: string | number | null | undefined): string {
    const s = value == null ? '' : String(value).trim();
    return s === '' ? '0' : s;
  }

  private getSamanDetailForPreview(): any[] {
    const Saman_Detail: any[] = [];

    // Collect all seized items from compartment-wise data
    this.compartmentWiseSeizedGoods.forEach(compData => {
      // Add Thunth items for this compartment
      compData.thunthDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "1",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Kashtha items for this compartment
      compData.kashthaDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "2",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Balli items for this compartment
      compData.balliDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "6",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Chiran items for this compartment
      compData.chiranaDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "4",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Chatta items for this compartment
      compData.chattaDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "5",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Bansh items for this compartment
      compData.banshDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getBanshPrajatiName(item.prajati_type),
          jabti_saman_type: "7",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Fencing Pol items for this compartment
      compData.fencingPolDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "8",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });

      // Add Other Japt Saman items for this compartment
      compData.otherJaptSamanDetail.forEach(item => {
        Saman_Detail.push({
          ...item,
          total_cost: this.normalizeOtherJaptTotalCostForApi(item.total_cost),
          prajati_name: this.getPrajatiName(item.prajati_type),
          jabti_saman_type: "3",
          compartment_number: compData.compartment_number,
          compartment_option: compData.compartment_option
        });
      });
    });

    return Saman_Detail;
  }

  private getPrajatiName(prajatiId: any): string {
    if (!prajatiId) return '';
    const prajati = this.listOfWoodPrajati.find((p: any) => p.id === prajatiId);
    return prajati ? prajati.name : '';
  }

  private getBanshPrajatiName(prajatiId: any): string {
    if (!prajatiId) return '';
    const prajati = this.listOfBanshType.find((p: any) => p.id === prajatiId);
    return prajati ? prajati.name : '';
  }

  private getKasthHalatName(halatId: any): string {
    if (!halatId) return '';
    const halat = this.kasthHalatList.find((p: any) => p.id === halatId);
    return halat ? halat.name : '';
  }

  getAllThunthFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.thunthDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllKashthaFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.kashthaDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllBalliFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.balliDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllChiranFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.chiranaDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllChattaFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.chattaDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllBanshFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.banshDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getBanshPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllFencingPolFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.fencingPolDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option, prajati_name: this.getPrajatiName(item.prajati_type) });
      });
    });
    return result;
  }

  getAllOtherJaptSamanFlat(): any[] {
    const result: any[] = [];
    this.compartmentWiseSeizedGoods.forEach(comp => {
      comp.otherJaptSamanDetail.forEach(item => {
        result.push({ ...item, compartment_number: comp.compartment_number, compartment_option: comp.compartment_option });
      });
    });
    return result;
  }

  getTotalAllThunthNag(): number {
    return this.getAllThunthFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllKashthNag(): number {
    return this.getAllKashthaFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllKashthGhanMeter(): string {
    return this.getAllKashthaFlat().reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0).toFixed(4);
  }

  getTotalAllBalliNag(): number {
    return this.getAllBalliFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllChiranNag(): number {
    return this.getAllChiranFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllChiranGhanMeter(): string {
    return this.getAllChiranFlat().reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0).toFixed(4);
  }

  getTotalAllChattaNag(): number {
    return this.getAllChattaFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllVyaparikBanshNag(): number {
    return this.getAllBanshFlat().filter(item => item.prajati_name?.includes('व्यापारिक') || item.prajati_type === 1).reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllOdyogicBanshNag(): number {
    return this.getAllBanshFlat().filter(item => item.prajati_name?.includes('औद्योगिक') || item.prajati_type === 2).reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllFencingPolNag(): number {
    return this.getAllFencingPolFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllOtherJaptSamanNag(): number {
    return this.getAllOtherJaptSamanFlat().reduce((sum, item) => sum + (Number(item.nag) || 0), 0);
  }

  getTotalAllOtherJaptSamanGhanMeter(): string {
    return this.getAllOtherJaptSamanFlat().reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0).toFixed(4);
  }

  signatureImage: string | null = null;

  async openSignaturePad() {

    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: this.complainer_name
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      // You can now show it or upload it
      this.signatureImage = data.signature;
      if (this.isJaptikartaSameAsPorJarikkarta) {
        this.japtikarta_sign = this.signatureImage || '';
      }
    }

  }

  onToggleJaptikartaSameAsPorJarikkarta(event: any) {
    const checked = !!(event?.detail?.checked);
    this.isJaptikartaSameAsPorJarikkarta = checked;
    if (checked) {
      this.japt_karne_wale_adhikari_ka_name = this.complainer_name;
      this.japt_karne_wale_adhikari_ka_pad = this.complainer_ka_pad;
      this.japtikarta_sign = this.signatureImage || '';
    } else {
      this.japt_karne_wale_adhikari_ka_name = '';
      this.japt_karne_wale_adhikari_ka_pad = '';
      this.japtikarta_sign = '';
    }
  }

  async openSignaturePadForJaptikarta() {
    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: this.japt_karne_wale_adhikari_ka_name || 'जप्तिकर्ता'
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      this.japtikarta_sign = data.signature;
    }
  }

  async openSignaturePadForApradhi(row: AccusedPerson) {
    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: row.name || 'अपराधी'
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      row.signatureImage = data.signature;
      row.selectedType = 'sign';
    }
  }

  witness1Sign: string = "";
  witness2Sign: string = "";

  async openSignaturePadForSakshi(value: Number) {

    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      if (value === 1) {
        this.witness1Sign = data.signature;
      } else if (value === 2) {
        this.witness2Sign = data.signature;
      }
    }

  }

  // sandeepdonedone start - Witness management methods
  addWitness() {
    this.witnesses.push({
      name: "",
      fatherName: "",
      address: "",
      jaati: "",
      age: "",
      signatureImage: ""
    });
  }

  async removeWitness(index: number) {
    // Minimum 2 witnesses mandatory
    if (this.witnesses.length > 2) {
      const ok = await this.confirmYesNo("क्या आप साक्षी की प्रविष्टि हटाना चाहते हैं?");
      if (!ok) return;
      this.witnesses.splice(index, 1);
    }
  }

  onWitnessSelect(witness: Witness, isItAngutha: boolean) {
    witness.selectedType = isItAngutha ? 'thumb' : 'sign';
    this.openSignaturePadForWitness(witness, isItAngutha);
  }

  async openSignaturePadForWitness(witness: Witness, isItAngutha: boolean) {
    if (isItAngutha) {
      witness.signatureImage = "";
    } else {
      const modal = await this.modalController.create({
        component: SignaturePageComponent,
        cssClass: 'signature-modal-fullscreen',
        componentProps: {
          personName: witness.name || "साक्षी"
        }
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data?.confirmed) {
        witness.signatureImage = data.signature;
      }
    }
  }
  // sandeepdonedone end - Witness management methods

  showAccussedPersonSignPadOrNot(): Boolean {
    if (this.accusedPersons.length > 0) {
      let value = this.accusedPersons[0];
      if (value.name != "") {
        return true;
      }
    }
    return false;
  }

  showWitnessPersonSignPadOrNot(): Boolean {
    const validWitnesses = (this.witnesses || []).filter(
      (w) => w?.name && String(w.name).trim() !== ''
    );
    return validWitnesses.length > 0;
  }

  setJaptKarnewaleAdhikariKaKaNameVariable() {
    this.japt_karne_wale_adhikari_ka_name = this.complainer_name;
  }

  setJaptKarnewaleAdhikariKaPadVariable() {
    this.japt_karne_wale_adhikari_ka_pad = this.complainer_ka_pad;
  }

  async showError(errorMsg: string) {

    console.log(errorMsg);

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

  private async confirmYesNo(message: string): Promise<boolean> {
    try {
      const modal = await this.modalController.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: message,
          isYesNo: true,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();
      return data?.confirmed === true;
    } catch {
      return false;
    }
  }

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

  addJaptVahanDetail() {
    this.listOfVahanDetail.push({
      vahan_prakar: '', vahan_kramank: '', anumanit_mulya: '', malik_ka_name: '', malik_k_father_ka_name: '', pata: '', tahsil: '', jila: ''
    });
  }

  async removeVahanDetail(index: number) {
    if (index > -1 && index < this.listOfVahanDetail.length) {
      const ok = await this.confirmYesNo("क्या आप वाहन का विवरण हटाना चाहते हैं?");
      if (!ok) return;
      this.listOfVahanDetail.splice(index, 1);
    }
  }

}