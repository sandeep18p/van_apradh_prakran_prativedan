import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AccusedPersonDetail, AccusedPersonDetailForVanApradhPrakran, AccusedPersonForCourtChalanDetail, WitnessResponseModal } from '../officer-dashboard/GetDashboardResponse.model';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { addCircleOutline, arrowBack, book, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, createOutline, eyeOutline, locationOutline, refreshCircleOutline, trashOutline, informationCircleOutline, checkmarkCircle, refreshOutline, imagesOutline, personCircleOutline, peopleOutline, documentTextOutline, close, folderOutline, carOutline, leafOutline, logOutOutline, resizeOutline, cutOutline, constructOutline, flameOutline, cubeOutline } from 'ionicons/icons';

import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

import { Router } from '@angular/router';

import { NavController, ModalController, ActionSheetController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { IonicModule } from '@ionic/angular'; // Import IonicModule
import { TableModule } from 'primeng/table';

import Cropper from 'cropperjs';

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

import { DatabaseService } from 'src/app/services/DatabaseService.service';
import { fonts } from 'pdfmake/build/pdfmake';
import { strict } from 'assert';
import { ComplainDetails, JaptSamanItem, WitnessDetailForPor } from '../officer-dashboard/GetDashboardResponse.model';
import { SignaturePad } from 'angular2-signaturepad';
import { SignaturePageComponent } from '../signature-page/signature-page.component';
import { SelectActualCrimeDateDialogComponent } from 'src/app/dialogs/select-actual-crime-date-dialog/select-actual-crime-date-dialog.component';
import { BalliPriceMasterResponse, BambooPriceMasterResponse, FormFactorResponse, IdAndNameModel, KhadaVrikhaPriceMasterResponse, LatthaKasthPriceMasterResponse } from '../add-complain/GetCastAndCrimTypeMasterResponse';

interface Witness {
  name: string;
  fatherName: string;
  address: string;
  jaati: string;
  age: string;
  signatureImage: string;
  selectedType?: 'sign' | 'thumb';
}

@Component({
  selector: 'app-add-japtinama',
  templateUrl: './add-japtinama.page.html',
  styleUrls: ['./add-japtinama.page.scss'],
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, IonRadioGroup,
    IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
    IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
    IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
    IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
    IonModal, IonChip, IonSegment, IonSegmentButton, TableModule
  ],
  providers: [Diagnostic, DatePipe]
})
export class AddJaptinamaPage implements OnInit {

  complainer_name: string = "";
  complainer_ka_pad: string = "";

  japtinamaPhotos: string[] = [];



  isLoading: boolean = false;
  loadingMessage: string = ""

  listOfBambooPriceMaster: BambooPriceMasterResponse[] = [];
  listOfLattaKasthaPriceMaster: LatthaKasthPriceMasterResponse[] = [];
  listOfBalliPriceMaster: BalliPriceMasterResponse[] = [];
  listOfFormFactorMaster: FormFactorResponse[] = [];
  listOfVrikhaPriceMaster: KhadaVrikhaPriceMasterResponse[] = [];

  // Dropdown value lists
  listOfGolaiValueThunth: IdAndNameModel[] = [];
  listOfLambaiValueBalli: IdAndNameModel[] = [];
  listOfGolaiValueBalli: IdAndNameModel[] = [];
  listOfGolaiForLatthaKasth: IdAndNameModel[] = [];
  listOfLambaiForLatthaKasth: IdAndNameModel[] = [];

  // Wood lists separation
  woodListForJalau: any = [];
  woodListForExceptJalau: any = [];

  // Bansh related
  listOfBanshType = [
    { id: 1, name: 'व्यापारिक' },
    { id: 2, name: 'औद्योगिक' }
  ];
  listOfBanshSizeVyaparik: IdAndNameModel[] = [];
  listOfBanshSizeOdyogic: IdAndNameModel[] = [];
  listOfBanshDetail: {
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
    is_yogya_to_parivahan: string,
    if_not_yogya_then_reason: string,
    compartment_number: string,
    compartment_option: string
  }[] = [];

  // Fencing Pol related
  listOfFencingPolDetail: {
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
    is_yogya_to_parivahan: string,
    if_not_yogya_then_reason: string,
    compartment_number: string,
    compartment_option: string
  }[] = [];


  // ------------- JAPTINAMA KA VIVRAN ---------------//

  japt_karne_wale_adhikari_ka_name: string = "";
  japt_karne_wale_adhikari_ka_pad: string = "";
  japtikarta_adhikari_hastakshar: string = "";
  chinhaPhoto: string = "";
  japtinama_anya_vishesh_vivran: string = "";
  japti_ka_dinak: string = "";  // Date of seizure
  japti_ka_sthaan: string = "";  // Place of seizure

  constructor(private sqliteService: DatabaseService, private networkCheckService: NetworkCheckService, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private diagnostic: Diagnostic, private platform: Platform, private navController: NavController, private apiService: ApiServiceService, private modalController: ModalController, private actionSheetController: ActionSheetController, private router: Router, private languageService: LanguageServiceService, private datePipe: DatePipe) {
    addIcons({ eyeOutline, createOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, addCircleOutline, trashOutline, informationCircleOutline, checkmarkCircle, refreshOutline, imagesOutline, personCircleOutline, peopleOutline, documentTextOutline, close, folderOutline, carOutline, leafOutline, logOutOutline, resizeOutline, cutOutline, constructOutline, flameOutline, cubeOutline });
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

  comingComplaintData!: ComplainDetails;
  beatCompartmentList: Array<{ id?: any; name?: string; compartment_no?: string }> = [];


  async ngOnInit() {

    //this.checkLocationPermissionAndNavigate();

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    this.getLoginedOfficerData();

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    const { value: valueDesignation } = await Preferences.get({ key: PreferenceKeys.emp_designation });

    if (value) {
      this.complainer_name = value;
      this.japt_karne_wale_adhikari_ka_name = value;
    }

    if (valueDesignation) {
      this.complainer_ka_pad = valueDesignation;
      this.japt_karne_wale_adhikari_ka_pad = valueDesignation;
    }

    this.handleBackButton();

    await this.sqliteService.initDB(); // Ensure DB is ready

  }

  retrievIdFromCastList(value: string): string {
    for (let i = 0; this.listOfCast.length; i++) {
      if (this.listOfCast[i].name === value) {
        return this.listOfCast[i].id;
      }
    }
    return "0";
  }

  async handleBackButton() {
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

  setJaptiDinank() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.japti_ka_dinak = `${yyyy}-${mm}-${dd}`;
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
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
      } else if (userData.designation_id === "6") {
        this.isRA = true;
      }
      const castMasterType = await Preferences.get({ key: PreferenceKeys.cast_master });
      if (castMasterType.value) {
        this.listOfCast = JSON.parse(castMasterType.value);
      }

      const nav = this.router.getCurrentNavigation();
      const data = nav?.extras?.state?.['data'] || history.state?.data;
      const beatCompartmentDataStr = nav?.extras?.state?.['beat_compartment'] || history.state?.beat_compartment;
      if (data) {

        this.comingComplaintData = JSON.parse(data) as ComplainDetails;
        this.isBeatNirikshan = this.comingComplaintData?.is_beat_nirikshan === '1';

        if (beatCompartmentDataStr) {
          try {
            this.beatCompartmentList = JSON.parse(beatCompartmentDataStr) || [];
          } catch (e) {
            this.beatCompartmentList = [];
          }
        }

        this.setupCompartmentDropdownOptions();

        
        let accusedJsonStr = this.comingComplaintData.accused_persons_json;

        accusedJsonStr = `[${accusedJsonStr}]`;

        this.accusedPersons = JSON.parse(accusedJsonStr);

        for (let i = 0; i < this.accusedPersons.length; i++) {
          let singleValue = this.accusedPersons[i];
          singleValue.cast = this.retrievIdFromCastList(singleValue.cast);
          singleValue.show_delete_button = false;
        }

        //this.witnesses = this.comingComplaintData.listOfWitness;

      }


      if (await this.networkCheckService.getCurrentStatus()) {
        this.getMasterData();
      } else {

        const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

        if (prajatiName.value) {
          this.listOfWoodPrajati = JSON.parse(prajatiName.value);
        }

      }

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

  goBack() {
    this.navController.back();
  }

  listOfWoodPrajati: any = [];

  getMasterData() {
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getCastAndCrimMaster(this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      async (response) => {

        await this.dismissDialog();

        //this.cdRef.detectChanges;

        if (response.response.code === 200) {

          if (response.bamboo_price_master) {
            this.listOfBambooPriceMaster = response.bamboo_price_master;
          }

          this.listOfWoodPrajati = response.prajati_name;

          
          const parts = this.comingComplaintData.date_of_crime.split('-');
          const year = new Date(+parts[2], +parts[1] - 1, +parts[0]).getFullYear();

          this.setListOfBanshSizeAccordingToYearAndType(year);

          // Prepare wood lists based on show_in field
          this.prepareWoodLists();

          // this.listOfDharaNew = response.dhara_data;
          this.listOfWoodPrajati = response.prajati_name;

          // 
          // Load price masters
          if (response.bamboo_price_master) {
            this.listOfBambooPriceMaster = response.bamboo_price_master;
          }
          if (response.lattha_price_master) {
            this.listOfLattaKasthaPriceMaster = response.lattha_price_master;
          }
          if (response.balli_price_master) {
            this.listOfBalliPriceMaster = response.balli_price_master;
          }
          if (response.form_factor_master) {
            this.listOfFormFactorMaster = response.form_factor_master;
          }
          if (response.khada_vrikha_price_master) {
            this.listOfVrikhaPriceMaster = response.khada_vrikha_price_master;
          }


        }


      },
      async (error) => {
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  prepareWoodLists(): void {
    this.woodListForExceptJalau = [];
    this.woodListForJalau = [];

    for (let i = 0; i < this.listOfWoodPrajati.length; i++) {
      const item = this.listOfWoodPrajati[i];
      const showIn = Number(item.show_in || 0);

      // Except Jalau (show_in === 0 or 1)
      if (showIn === 0 || showIn === 1) {
        this.woodListForExceptJalau.push(item);
      }

      // Jalau (show_in === 0 or 2)
      if (showIn === 0 || showIn === 2) {
        this.woodListForJalau.push(item);
      }
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

  async shortToast(msg: any) {
    // Backward-compatible wrapper: route all "shortToast" usages to the dialog-based error UI.
    // This keeps existing call-sites intact while enforcing `showError` everywhere.
    await this.showError(String(msg ?? ''));
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
        cssClass: 'custom-dialog-modal',
        componentProps: {
          server_message: message,
          isYesNo: true
        },
        backdropDismiss: false
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();
      return data?.confirmed === true;
    } catch {
      return false;
    }
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
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

  async removeJaptinamaPhoto(index: number) {
    const ok = await this.confirmYesNo("क्या आप जप्तीनामा फोटो हटाना चाहते हैं?");
    if (!ok) return;
    this.japtinamaPhotos.splice(index, 1);
  }

  async takeJaptinamaPhoto() {
    if (this.japtinamaPhotos.length >= 3) {
      this.longToast("आप अधिकतम 3 फोटो ले सकते हैं");
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
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForJaptinama();
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
    if (this.japtinamaPhotos.length >= 3) {
      this.longToast("आप अधिकतम 3 फोटो ले सकते हैं");
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
      //   this.shortToast(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
      //   return;
      // }

      this.openImagePreviewModal(image.dataUrl, 'japtinama', this.japtinamaPhotos.length);
    }
  }

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  isImagePreviewModalOpen = false;
  previewImageDataUrl: string = '';
  originalImageDataUrl: string = ''; // Store original image for rotation
  previewImageType: 'chinha' | 'japtinama' | null = null;
  previewImageIndex: number = -1; // For photos array
  imageRotation: number = 0;
  @ViewChild('imagePreview', { static: false }) imagePreviewElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropperContainer', { static: false }) cropperContainerElement!: ElementRef<HTMLDivElement>;
  private cropperInstance: any = null;

  // Image Preview/Edit Modal Methods
  openImagePreviewModal(imageDataUrl: string, type: 'chinha' | 'japtinama', index: number = -1) {
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
    // 
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

  async openGalleryForJaptinama() {
    if (this.japtinamaPhotos.length >= 3) {
      this.longToast("आप अधिकतम 3 फोटो ले सकते हैं");
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 10,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;

        // if (fileSizeInKB > maxSizeKB) {
        //   this.shortToast(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'japtinama', this.japtinamaPhotos.length);
      }
    } catch (error) {
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
      const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
      const fileSizeInBytes = (base64String.length * 3) / 4;
      const fileSizeInKB = fileSizeInBytes / 1024;
      const maxSizeKB = 300;

      // if (fileSizeInKB > maxSizeKB) {
      //   this.showError(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
      //   return;
      // }

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
        const base64String = image.dataUrl.split(',')[1] || image.dataUrl;
        const fileSizeInBytes = (base64String.length * 3) / 4;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const maxSizeKB = 300;
        
        // if (fileSizeInKB > maxSizeKB) {
        //   this.showError(`कृपया, छवि का आकार ${fileSizeInKB.toFixed(2)} KB है। अधिकतम अनुमतित आकार ${maxSizeKB} KB है।`);
        //   return;
        // }

        this.openImagePreviewModal(image.dataUrl, 'chinha');
      }
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
    }
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

  listOfCast: any = [];

  accusedPersons: AccusedPersonForCourtChalanDetail[] = [];

  addAccusedPerson() {
    this.accusedPersons.push({
      name: "",
      fathersName: "",
      age: '',
      mobile_number: '',
      aadhaar_number: '',
      cast: "",
      jati_name: '',
      address: "",
      signatureImage: "",
      base64: "",
      accussed_person_table_id: '',
      show_delete_button: true,
      gir_sthan: '',
      gir_date: '',
      gir_time: '',
      gir_adhikari: '',
      gir_paya_gaya_saman: '',
      gir_body_mark: '',
      id_to_update: '',
      is_checked: true
    });

  }

  async removeAccusedPerson(index: number) {
    const ok = await this.confirmYesNo("क्या आप अभियुक्त की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    this.accusedPersons.splice(index, 1);
    // }
  }

  isThunthSelected = false;
  isLatthaSelected = false;
  isBalliSelected = false;
  isChiranSelected = false;
  isJalauSelected = false;
  isBanshSelected = false;
  isFencingPolSelected = false;
  isOtherSelected = false;

  compartmentNumberOptions: string[] = [];
  compartmentOptionOptions: Array<'RF' | 'PF' | 'OA'> = ['RF', 'PF', 'OA'];
  readonly compartmentNoneOption = 'None';
  isBeatNirikshan = false;

  isBeatNirikshanCase(): boolean {
    return this.isBeatNirikshan;
  }
 
  private getBeatCompartmentRawString(): string {
    const raw = (this.beatCompartmentList?.[0]?.compartment_no ?? '').toString().trim();
    return raw;
  }

  private setupCompartmentDropdownOptions() {
    const rawFromBeatCompartment = this.getBeatCompartmentRawString();
    const rawFromComplain = (this.comingComplaintData?.compartment_number ?? '').toString().trim();
    const raw = (this.isBeatNirikshanCase() ? (rawFromBeatCompartment || rawFromComplain) : rawFromComplain).toString().trim();

    if (this.isBeatNirikshanCase()) {
      this.compartmentNumberOptions = raw
        ? raw.split(',').map(x => x.trim()).filter(Boolean)
        : [];
    } else {
      const base = raw || '';
      this.compartmentNumberOptions = [base, this.compartmentNoneOption]
        .map(x => (x ?? '').toString().trim())
        .filter((v, idx, arr) => v !== '' && arr.indexOf(v) === idx);
    }
  }

  onCompartmentNumberChange(row: any) {
    if (!row) return;
    if (!this.isBeatNirikshanCase() && row.compartment_number === this.compartmentNoneOption) {
      row.compartment_option = '';
    }
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
      kasth_halat: string,
      compartment_number: string,
      compartment_option: string
    }[] = [];

  addThunthInfo() {
    this.listOfThunthDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '',
      compartment_number: '',
      compartment_option: ''
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
      if_not_yogya_then_reason: string,
      compartment_number: string,
      compartment_option: string
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
      if_not_yogya_then_reason: string,
      compartment_number: string,
      compartment_option: string
    }[] = [];


  addKasthaInfo() {
    this.listOfKashthaDetail.push({
      jabti_saman_type: '2', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
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
      if_not_yogya_then_reason: string,
      compartment_number: string,
      compartment_option: string
    }[] = [];

  addBalliInfo() {
    this.listOfBalliDetail.push({
      jabti_saman_type: '6', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
  }

  async removeBalliInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप बल्ली की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfBalliDetail.length) {
      this.listOfBalliDetail.splice(index, 1);
      if (this.listOfBalliDetail.length === 0) {
        this.isBalliSelected = false;
      }
    }
  }

  addChiranInfo() {
    this.listOfChiranaDetail.push({
      jabti_saman_type: '4', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '',
      is_yogya_to_parivahan: '', if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
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
      if_not_yogya_then_reason: string,
      compartment_number: string,
      compartment_option: string
    }[] = [];

  addChattaInfo() {
    this.listOfChattaDetail.push({
      jabti_saman_type: '5', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
  }

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
      if_not_yogya_then_reason: string,
      compartment_number: string,
      compartment_option: string
    }[] = [];

  addOtherJaptSamanDetail() {
    // 
    this.listOfOtherJaptSamanDetail.push({
      jabti_saman_type: '3', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
  }

  async removeOtherJaptiSaman(index: number) {
    const ok = await this.confirmYesNo("क्या आप अन्य जप्त सामग्री की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfOtherJaptSamanDetail.length) {
      this.listOfOtherJaptSamanDetail.splice(index, 1);
      if (this.listOfOtherJaptSamanDetail.length === 0) {
        this.isOtherSelected = false;
      }
    }
  }

  addFencingPolInfo() {
    this.listOfFencingPolDetail.push({
      jabti_saman_type: '8', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
  }

  async removeFencingPolInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप फेंसिंग पोल की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfFencingPolDetail.length) {
      this.listOfFencingPolDetail.splice(index, 1);
      if (this.listOfFencingPolDetail.length === 0) {
        this.isFencingPolSelected = false;
      }
    }
  }

  addBanshInfo() {
    this.listOfBanshDetail.push({
      jabti_saman_type: '7', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: '',
      compartment_number: '',
      compartment_option: ''
    });
  }

  async removeBanshInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप बाँस की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfBanshDetail.length) {
      this.listOfBanshDetail.splice(index, 1);
      if (this.listOfBanshDetail.length === 0) {
        this.isBanshSelected = false;
      }
    }
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

  get totalVyaparikBanshNag(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 1)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
  }

  get totalOdyogicBanshNag(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 2)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
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

  async removeThunthInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप ठूंठ की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
      if (this.listOfThunthDetail.length === 0) {
        this.isThunthSelected = false;
      }
    }
  }

  async removeChattaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप जलाऊ चट्टा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfChattaDetail.length) {
      this.listOfChattaDetail.splice(index, 1);
      if (this.listOfChattaDetail.length === 0) {
        this.isJalauSelected = false;
      }
    }
  }

  async removeChiranInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप चिरान की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfChiranaDetail.length) {
      this.listOfChiranaDetail.splice(index, 1);
      if (this.listOfChiranaDetail.length === 0) {
        this.isChiranSelected = false;
      }
    }
  }

  async removeKashthaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप लट्ठा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;

    if (index > -1 && index < this.listOfKashthaDetail.length) {
      this.listOfKashthaDetail.splice(index, 1);
      if (this.listOfKashthaDetail.length === 0) {
        this.isLatthaSelected = false;
      }
    }
  }

  get totalFencingPolNag(): number {
    return this.listOfFencingPolDetail
      .reduce(
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

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
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

  get totalBalligNag(): number {
    return this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  setListOfLambaiAndGolaiAccordingToYearAndPrajatiSelection(row: any) {


    row.lambai = null;
    row.golai = null;
    row.dar = 0;
    row.total_cost = 0;

    this.listOfLambaiValueBalli = [];
    this.listOfGolaiValueBalli = [];


    const parts = this.comingComplaintData.date_of_crime.split('-');
    const yearOfCrim = new Date(+parts[2], +parts[1] - 1, +parts[0]).getFullYear();

    this.listOfLambaiValueBalli = Array.from(
      new Map(
        this.listOfBalliPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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
            item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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
              item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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
              item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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

    //this.getBalliPriceSingleValue(row);

  }

  calculateNosionalTon(row: any) {
    let lambai = parseFloat(row.lambai) || 0;
    let nag = parseFloat(row.nag) || 0;

    let mult = (lambai * nag);
    let matra = ((mult) / 2400).toFixed(3);
    row.ghan_meter = matra;
  }

  // Material type checkbox handler
  onCheckboxChangeOfJaptiSamanType(event: any, type: string) {
    const checked = event.detail.checked;

    switch (type) {
      case 'thunth':
        this.isThunthSelected = checked;
        if (!checked) {
          this.listOfThunthDetail = [];
        } else if (this.listOfThunthDetail.length === 0) {
          this.addThunthInfo();
        }
        break;

      case 'lattha':
        this.isLatthaSelected = checked;
        if (!checked) {
          this.listOfKashthaDetail = [];
        } else if (this.listOfKashthaDetail.length === 0) {
          this.addKasthaInfo();
        }
        break;

      case 'balli':
        this.isBalliSelected = checked;
        if (!checked) {
          this.listOfBalliDetail = [];
        } else if (this.listOfBalliDetail.length === 0) {
          this.addBalliInfo();
        }
        break;

      case 'chiran':
        this.isChiranSelected = checked;
        if (!checked) {
          this.listOfChiranaDetail = [];
        } else if (this.listOfChiranaDetail.length === 0) {
          this.addChiranInfo();
        }
        break;

      case 'jalau':
        this.isJalauSelected = checked;
        if (!checked) {
          this.listOfChattaDetail = [];
        } else if (this.listOfChattaDetail.length === 0) {
          this.addChattaInfo();
        }
        break;

      case 'bansh':
        this.isBanshSelected = checked;
        if (!checked) {
          this.listOfBanshDetail = [];
        } else if (this.listOfBanshDetail.length === 0) {
          this.addBanshInfo();
        }
        break;

      case 'fencing_pol':
        this.isFencingPolSelected = checked;
        if (!checked) {
          this.listOfFencingPolDetail = [];
        } else if (this.listOfFencingPolDetail.length === 0) {
          this.addFencingPolInfo();
        }
        break;

      case 'other':
        this.isOtherSelected = checked;
        if (!checked) {
          this.listOfOtherJaptSamanDetail = [];
        } else if (this.listOfOtherJaptSamanDetail.length === 0) {
          this.addOtherJaptSamanDetail();
        }
        break;
    }
  }

  get totalKashthNag(): number {
    return this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  calculateGhanMeterKastha(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const lambai = parseFloat(row.lambai) || 0;
    const nag = parseFloat(row.nag) || 0;
    //row.ghan_meter = ((lambai * golai) * nag).toFixed(2);

    row.ghan_meter = ((lambai * (golai * golai)) / 160000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);

    //row.ghan_meter = "0";
  }

  calculateGhanMeter(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const nag = parseFloat(row.nag) || 0;
    row.ghan_meter = (golai * nag).toFixed(2); // 2 decimal places
    row.ghan_meter = "0";
  }

  checkMinMaxForRowLatthaGolai(row: any) {
    // 
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

    // 
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

      } else {
        //
        this.showError("गोलाई " + min + " से.मी. से कम की प्रविष्टि नहीं की जा सकती , कृपया सही गोलाई प्रविष्ट करें ");
        row.golai = "";
      }
    }

    this.calculateGhanMeterKastha(row);
    //this.setPerLatthaPriceAccordingToEnterValues(row);

  }

  checkMinMaxForRowLatthaLambai(row: any) {
    // 
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

    } else {
      // 
      row.lambai = "";
    }

    this.calculateGhanMeterKastha(row);

  }

  setLambaiOrGolaiValidation(row: any) {

    row.lambai = null;
    row.golai = null;
    row.dar = "";
    row.ghan_meter = "";

    this.listOfGolaiForLatthaKasth = [];
    this.listOfLambaiForLatthaKasth = [];

    const parts = this.comingComplaintData.date_of_crime.split('-');
    const yearOfCrim = new Date(+parts[2], +parts[1] - 1, +parts[0]).getFullYear();

    this.listOfGolaiForLatthaKasth = Array.from(
      new Map(
        this.listOfLattaKasthaPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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

    if (this.listOfGolaiForLatthaKasth.length === 0 || this.listOfLambaiForLatthaKasth.length === 0) {
      this.listOfGolaiForLatthaKasth = Array.from(
        new Map(
          this.listOfLattaKasthaPriceMaster
            .filter(item =>
              item.applicable_year === yearOfCrim.toString() &&
              item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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

      this.listOfLambaiForLatthaKasth = Array.from(
        new Map(
          this.listOfLattaKasthaPriceMaster
            .filter(item =>
              item.applicable_year === yearOfCrim.toString() &&
              item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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
    }

  }

  showAccussedPersonSignPadOrNot(): Boolean {
    if (this.accusedPersons.length > 0) {
      let value = this.accusedPersons[0];
      if (value.name != "") {
        return true;
      }
    }
    return false;
  }

  onApradhiSelect(row: AccusedPersonForCourtChalanDetail, isItAngutha: boolean) {
    this.openSignaturePadForApradhi(row, false);
  }

  async openSignaturePadForApradhi(row: AccusedPersonForCourtChalanDetail, isItAngutha: boolean) {
    if (isItAngutha) {
      row.signatureImage = "";
    } else {
      const modal = await this.modalController.create({
        component: SignaturePageComponent,
        cssClass: 'signature-modal-fullscreen',
        componentProps: {
          personName: row.name
        }
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data?.confirmed) {
        row.signatureImage = data.signature;
      }
    }

  }

  witnesses: WitnessResponseModal[] = [
    {
      naam: "", pita_ka_naam: "", pata: "", jaati: "", age: "", sign: "",
      id: ''
    },
    {
      naam: "", pita_ka_naam: "", pata: "", jaati: "", age: "", sign: "",
      id: ''
    }
  ];

  addWitness() {
    this.witnesses.push({
      naam: "",
      pita_ka_naam: "",
      pata: "",
      jaati: "",
      age: "",
      sign: "",
      id: ''
    });
    // Sync to old fields
  }

  async removeWitness(index: number) {
    // ✅ Minimum 2 witnesses mandatory
    if (this.witnesses.length <= 2) return;
    const ok = await this.confirmYesNo("क्या आप साक्षी की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    this.witnesses.splice(index, 1);
  }

  onWitnessSelect(witness: WitnessResponseModal, isItAngutha: boolean) {
    this.openSignaturePadForWitness(witness, isItAngutha);
  }

  async openSignaturePadForWitness(witness: WitnessResponseModal, isItAngutha: boolean) {
    if (isItAngutha) {
      witness.sign = "";
    } else {
      const modal = await this.modalController.create({
        component: SignaturePageComponent,
        cssClass: 'signature-modal-fullscreen',
        componentProps: {
          personName: witness.naam || "साक्षी"
        }
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data?.confirmed) {
        witness.sign = data.signature;
      }
    }

  }

  async openSignaturePadForJaptikarta() {
    const personName = (this.japt_karne_wale_adhikari_ka_name || '').toString();
    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      this.japtikarta_adhikari_hastakshar = data.signature;
    }
  }

  setThunthGolai(row: any) {
    // ;
    
    const parts = this.comingComplaintData.date_of_crime.split('-');
    const year = new Date(+parts[2], +parts[1] - 1, +parts[0]).getFullYear();

    row.golai = null;
    row.one_golai_less = null;
    row.site_quality = null;
    row.nag = "";

    this.listOfGolaiValueThunth = [];
    this.listOfGolaiValueThunth = Array.from(
      new Map(
        this.listOfVrikhaPriceMaster
          .filter(item =>
            item.applicable_year === year.toString() &&
            item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
            item.prajati === row.prajati_type.toString() &&   // 👈 added condition
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

    if (this.listOfGolaiValueThunth.length === 0) {
      this.listOfGolaiValueThunth = Array.from(
        new Map(
          this.listOfVrikhaPriceMaster
            .filter(item =>
              item.applicable_year === year.toString() &&
              item.circle === this.loginedOfficerCircleId.toString() &&   // 👈 added condition
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

  // Set Golai values for Thunth based on price master
  setGolaiValueThunth() {
    const parts = this.comingComplaintData.date_of_crime.split('-');
    const yearOfCrim = new Date(+parts[2], +parts[1] - 1, +parts[0]).getFullYear();

    this.listOfGolaiValueThunth = Array.from(
      new Map(
        this.listOfVrikhaPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId.toString()
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

  submitOnServer() {


        // --- जप्त सामान / ठूंठ validation (aligned with add-complain submitCrimDetail) ---
    let isValidThunthEntry = true;
    let isValidKasthEntry = true;
    let isValidChiranEntry = true;
    let isValidJalauEntry = true;
    let isValidBalliEntry = true;
    let isValidOtherJaptSamanEntry = true;

    for (let i = 0; i < this.listOfOtherJaptSamanDetail.length; i++) {
      const row = this.listOfOtherJaptSamanDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidOtherJaptSamanEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidOtherJaptSamanEntry = false;
        break;
      }

      if (!row.if_other_then_detail || String(row.if_other_then_detail).trim() === "") {
        isValidOtherJaptSamanEntry = false;
        break;
      }


      // if (!row.total_cost) {
      //   isValidOtherJaptSamanEntry = false;
      //   break;
      // }
    }
    if (!isValidOtherJaptSamanEntry) {
      this.showError("अन्य जप्त सामान की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfThunthDetail.length; i++) {
      const row = this.listOfThunthDetail[i];

      if (!row.prajati_type || !row.nag || !row.golai) {
        isValidThunthEntry = false;
        break;
      }
    }
    if (!isValidThunthEntry) {
      this.showError("ठूंठ की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfKashthaDetail.length; i++) {
      const row = this.listOfKashthaDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidKasthEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidKasthEntry = false;
        break;
      }

      if (
        !row.prajati_type ||
        !row.lambai ||
        !row.golai ||
        !row.nag ||
        !row.ghan_meter
      ) {
        isValidKasthEntry = false;
        break;
      }
    }

    if (!isValidKasthEntry) {
      this.showError("लट्ठा की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfBalliDetail.length; i++) {
      const row = this.listOfBalliDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidBalliEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidBalliEntry = false;
        break;
      }

      if (!row.prajati_type || !row.lambai || !row.golai || !row.nag) {
        isValidBalliEntry = false;
        break;
      }
    }

    if (!isValidBalliEntry) {
      this.showError("बल्ली की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfChiranaDetail.length; i++) {
      const row = this.listOfChiranaDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidChiranEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidChiranEntry = false;
        break;
      }

      if (
        !row.prajati_type ||
        !row.motai ||
        !row.lambai ||
        !row.golai ||
        !row.nag ||
        !row.ghan_meter
      ) {
        isValidChiranEntry = false;
        break;
      }
    }

    if (!isValidChiranEntry) {
      this.showError("चिरान की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfChattaDetail.length; i++) {
      const row = this.listOfChattaDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidJalauEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidJalauEntry = false;
        break;
      }

      if (!row.prajati_type || !row.nag) {
        isValidJalauEntry = false;
        break;
      }
    }

    if (!isValidJalauEntry) {
      this.showError("जलाऊ चट्टा की सम्पूर्ण जानकारी भरें");
      return;
    }

    let isValidFencingPolEntry = true;
    for (let i = 0; i < this.listOfFencingPolDetail.length; i++) {
      const row = this.listOfFencingPolDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidFencingPolEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidFencingPolEntry = false;
        break;
      }

      if (!row.prajati_type || !row.nag) {
        isValidFencingPolEntry = false;
        break;
      }
    }

    if (!isValidFencingPolEntry) {
      this.showError("फेंसिंग पोल की सम्पूर्ण जानकारी भरें");
      return;
    }

    let isValidBanshEntry = true;
    for (let i = 0; i < this.listOfBanshDetail.length; i++) {
      const row = this.listOfBanshDetail[i];

      if (!row.is_yogya_to_parivahan) {
        isValidBanshEntry = false;
        break;
      }

      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        isValidBanshEntry = false;
        break;
      }

      if (!row.prajati_type || !row.nag || !row.lambai || !row.ghan_meter) {
        isValidBanshEntry = false;
        break;
      }
    }

    if (!isValidBanshEntry) {
      this.showError("बाँस की सम्पूर्ण जानकारी भरें");
      return;
    }
    // --- end जप्त सामान validation ---


    let isValidJaptVahanDetail: boolean = true;

    for (let i = 0; i < this.listOfVahanDetail.length; i++) {
      const row = this.listOfVahanDetail[i];
      // 

      if (
        !row.vahan_prakar ||
          !row.vahan_kramank 
      ) {
        isValidJaptVahanDetail = false;

        break;
      }
    }


    if (!isValidJaptVahanDetail) {
      this.showError("जप्त वाहन की जानकारी प्रविस्ट करिये");
      return;
    }


    let isValidWitnessFiled = true;
    for (let i = 0; i < this.witnesses.length; i++) {
      const row = this.witnesses[i];
      if (
        !row.naam ||
        !row.pita_ka_naam ||
        !row.pata ||
        !row.age
      ) {
        isValidWitnessFiled = false;
        break;
      }
    }

    if (!isValidWitnessFiled) {
      this.showError("साक्षियों की सम्पूर्ण जानकारी भरें");
      return;
    }

    if (this.japt_karne_wale_adhikari_ka_name === "") {
      this.showError("जप्त करने वाले अधिकारी का नाम");
      return;
    }

    if (this.japt_karne_wale_adhikari_ka_pad === "") {
      this.showError("जप्त करने वाले अधिकारी का पद");
      return;
    }

    if (this.japti_ka_dinak === "") {
      this.showError("जप्ति का दिनांक");
      return;
    }

    if (this.japti_ka_sthaan === "") {
      this.showError("जप्ति का स्थान");
      return;
    }

    if (this.japtinamaPhotos.length === 0) {
      this.showError("जप्तीनामा अपलोड करें");
      return;
    }

    const formData = new FormData();

    const accusedPersonsData: any[] = [];

    var selectedAccussed: any[] = [];

    for (let i = 0; i < this.accusedPersons.length; i++) {
      
      const person = this.accusedPersons[i];
      if (person.accussed_person_table_id === '') {
        let signBlob: Blob;

        if (person.signatureImage && person.signatureImage.trim() !== "") {
          signBlob = this.dataURLtoBlob(person.signatureImage);
        } else {
          // Create an empty placeholder blob
          signBlob = new Blob([], { type: 'image/jpeg' });
        }

        // Append to FormData (always — even if empty)
        formData.append('listOfAccussedSign', signBlob, `photo_${i + 1}.jpg`);

        accusedPersonsData.push({
          Name: person.name || "",
          FathersName: person.fathersName || "",
          Address: person.address || "",
          Cast: person.cast || "",
          Age: person.age || "",
          ActualCast: person.jati_name || "",
          mobile_number: person.mobile_number || "",
          aadhaar_number: (person as any).aadhaar_number || ""
        });

      }

      if (person.accussed_person_table_id != "" && person.is_checked) {
        selectedAccussed.push(person.accussed_person_table_id);
      }

    }

    if (accusedPersonsData.length > 0) {
      formData.append('AccusedPersons', JSON.stringify(accusedPersonsData));
    }

    // if (selectedAccussed.length === 0 && accusedPersonsData.length === 0) {
    //   this.showError("कृपया अपराधी चुने ");
    //   return;
    // }

    if (selectedAccussed.length > 0) {
      formData.append('selected_accussed', selectedAccussed.join(','));
    }

    // ✅ JSON for backend Witnesses
    const witnessesData: any[] = this.witnesses.map((w) => ({
      Name: String(w.naam).trim(),
      FathersName: w.pita_ka_naam ? String(w.pita_ka_naam).trim() : '',
      Address: w.pata ? String(w.pata).trim() : '',
      Jaati: w.jaati ? String(w.jaati).trim() : '',
      Age: (w.age !== null && w.age !== undefined) ? String(w.age).trim() : '',
      Sign: '' // handled by files
    }));

    formData.append('Witnesses', JSON.stringify(witnessesData));

    // ✅ Upload witness signature files to listOfWitnessSign (aligned with witnessesData order)
    for (let i = 0; i < this.witnesses.length; i++) {
      const w = this.witnesses[i];

      if (w.sign && String(w.sign).trim() !== '') {
        formData.append(
          'listOfWitnessSign',
          this.dataURLtoBlob(w.sign),
          `photo_witness_${i + 1}_sign.jpg`
        );
      } else {
        formData.append(
          'listOfWitnessSign',
          new Blob([], { type: 'image/jpeg' }),
          `photo_witness_${i + 1}_sign.jpg`
        );
      }
    }

    formData.append('complain_id', this.comingComplaintData.complain_id);
    formData.append('japti_ka_dinak', this.japti_ka_dinak);
    formData.append('japti_ka_sthaan', this.japti_ka_sthaan);

    if (this.chinhaPhoto && this.chinhaPhoto.trim() !== "") {
      const blobPhoto = this.dataURLtoBlob(this.chinhaPhoto);
      formData.append('ankit_mark_on_japt_saman', blobPhoto, 'photo_mark_image_ankit_on_japt_saman.jpg');
    }

    formData.append('other_vivran', this.japtinama_anya_vishesh_vivran);

    for (let i = 0; i < this.japtinamaPhotos.length; i++) {
      const blobJaptinamaPhoto = this.dataURLtoBlob(this.japtinamaPhotos[i]);
      formData.append('japtinama_photo', blobJaptinamaPhoto, `photo_japtinama_${i + 1}.jpg`);
    }

    formData.append('created_by', this.loginedOfficerEmpId.toString());

    formData.append('japtikarta_ka_name', this.japt_karne_wale_adhikari_ka_name);
    formData.append('japtikarta_ka_pad', this.japt_karne_wale_adhikari_ka_pad);

    if (this.japtikarta_adhikari_hastakshar && this.japtikarta_adhikari_hastakshar.trim() !== '') {
      formData.append(
        'japtikarta_sign',
        this.dataURLtoBlob(this.japtikarta_adhikari_hastakshar),
        'photo_japtikarta_sign.jpg'
      );
    } else {
      formData.append('japtikarta_sign', '');
    }


    const Saman_Detail = [
      ...this.listOfKashthaDetail.map(item => ({
        ...item,
        jabti_saman_type: "2" // Force value for Kashtha
      })),
      ...this.listOfThunthDetail.map(item => ({
        ...item,
        jabti_saman_type: "1" // Force value for Thunth
      })),
      ...this.listOfOtherJaptSamanDetail.map(item => ({
        ...item,
        jabti_saman_type: "3" // Force value for other 
      })),
      ...this.listOfChiranaDetail.map(item => ({
        ...item,
        jabti_saman_type: "4" // Force value for Chiran
      })),
      ...this.listOfChattaDetail.map(item => ({
        ...item,
        jabti_saman_type: "5" // Force value for chatta
      })),
      ...this.listOfBalliDetail.map(item => ({
        ...item,
        jabti_saman_type: "6" // Force value for balli
      })),
      ...this.listOfBanshDetail.map(item => ({
        ...item,
        jabti_saman_type: "7" // Force value for bansh
      })),
      ...this.listOfFencingPolDetail.map(item => ({
        ...item,
        jabti_saman_type: "8" // Force value for fencing pol
      }))
    ];

    
    if (!Saman_Detail?.length) {
      this.showError("कृपया जप्त सामग्रियों का विवरण प्रेषित करिये");
      return;
    }

    formData.append('Saman_Detail', JSON.stringify(Saman_Detail));

    formData.append('japt_vahan_detail', JSON.stringify(this.listOfVahanDetail));

    this.showDialog('कृपया इंतजार करें');

    this.apiService.submitJaptinamaData(formData).subscribe(
      async (response) => {
        await this.dismissDialog();

        
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
          const successMsg = responseData.msg || 'आपका जप्तिनामा का विवरण सफलतापूर्वक जमा किया गया |';
          //await this.afterSubmitComplainSuccessfully(successMsg, true);
          this.sharedService.setRefresh(true);
          this.longToast(successMsg);
          this.goBack();
        } else {
          const errorMsg = responseData?.msg || 'जप्तिनामा का विवरण जमा करने में समस्या आ रही है। कृपया पुनः प्रयास करें...';
          this.longToast(errorMsg);
        }

      },
      async (error) => {
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

  async removeVahanDetail(index: number) {
    const ok = await this.confirmYesNo("क्या आप वाहन का विवरण हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfVahanDetail.length) {
      this.listOfVahanDetail.splice(index, 1);
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

  private isRotating = false; // Flag to prevent rotation loops

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
    //   this.shortToast(`Image size is ${fileSizeInKB.toFixed(2)} KB. Maximum allowed size is ${maxSizeKB} KB. Please crop more.`);
    //   return;
    // }

    if (this.previewImageType === 'chinha') {
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
    }

    // Clean up and close modal
    this.closeImagePreviewModal();
  }

  rejectImage() {
    this.closeImagePreviewModal();
  }

  filePath: string = "";

  getFullPathImage(photoName?: string): string {
    //
    return this.filePath + "/" + photoName;
  }


  isItemSelected(event: any, person: any) {
    person.is_checked = event.detail.checked;
  }

}