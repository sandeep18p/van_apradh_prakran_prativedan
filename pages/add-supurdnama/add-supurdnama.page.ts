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
import { JaptVahanDetailInterface } from '../view-complain-detail/base64responseofsign.modal';

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
  selector: 'app-add-supurdnama',
  templateUrl: './add-supurdnama.page.html',
  styleUrls: ['./add-supurdnama.page.scss'],
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
export class AddSupurdnamaPage implements OnInit {

  complainer_name: string = "";
  complainer_ka_pad: string = "";

  supurdnamaPhotos: string[] = [];



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
    if_not_yogya_then_reason: string
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
    if_not_yogya_then_reason: string
  }[] = [];


  // ------------- SUPURDNAMA KA VIVRAN ---------------//

  supurd_me_dene_wale_adhikari_name: string = "";
  supurd_me_dene_wale_adhikari_pad: string = "";


  supurdar_ka_name: string = "";
  supurdar_ka_father: string = "";
  supurdar_ka_jati: string = "";
  supurdar_ka_vyavsay: string = "";
  supurdar_ka_poora_pata: string = "";
  supurdar_me_lene_ka_date: string = "";  // Date of seizure


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


  async ngOnInit() {

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    this.getLoginedOfficerData();

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    const { value: valueDesignation } = await Preferences.get({ key: PreferenceKeys.emp_designation });

    if (value && value !== 'undefined') {
      this.complainer_name = value;
      this.supurd_me_dene_wale_adhikari_name = value;
    } else {
      this.complainer_name = '';
      this.supurd_me_dene_wale_adhikari_name = '';
    }

    if (valueDesignation && valueDesignation !== 'undefined') {
      this.complainer_ka_pad = valueDesignation;
      this.supurd_me_dene_wale_adhikari_pad = valueDesignation;
    } else {
      this.complainer_ka_pad = '';
      this.supurd_me_dene_wale_adhikari_pad = '';
    }

    this.handleBackButton();

    await this.sqliteService.initDB(); // Ensure DB is ready

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

      const nav = this.router.getCurrentNavigation();
      const data = nav?.extras?.state?.['data'] || history.state?.data;
      if (data) {

        this.comingComplaintData = JSON.parse(data) as ComplainDetails;

      }


      if (await this.networkCheckService.getCurrentStatus()) {
        this.getMasterData();
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

        if (response.response.code === 200) {

          this.listOfWoodPrajati = response.prajati_name;

          this.getDetailOfComplain();

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

  signatureImageOfAdhikari: string | null = null;
  async openSignaturePadForAdhikari() {


    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: this.supurd_me_dene_wale_adhikari_name
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      // You can now show it or upload it
      this.signatureImageOfAdhikari = data.signature;
    }

  }


  signatureImageOfSupurdar: string | null = null;

  async openSignaturePadForSupurdar() {

    const modal = await this.modalController.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
      componentProps: {
        personName: this.supurdar_ka_name
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      // You can now show it or upload it
      this.signatureImageOfSupurdar = data.signature;
    }

  }

  async openImageViewer(imageSrc: string) {
    if (!imageSrc || imageSrc.trim() === '') return;

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

  async removeSupurdnamaPhoto(index: number) {
    const ok = await this.confirmYesNo("क्या आप सुपुर्दनामा फोटो हटाना चाहते हैं?");
    if (!ok) return;
    this.supurdnamaPhotos.splice(index, 1);
  }

  async takeSupurdnamaPhoto() {

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.openCameraForSupurdNama();
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: () => {
            this.openGalleryForSupurdNama();
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

  async openCameraForSupurdNama() {

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

      this.openImagePreviewModal(image.dataUrl, 'supurdnama', this.supurdnamaPhotos.length);
    }
  }

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  isImagePreviewModalOpen = false;
  previewImageDataUrl: string = '';
  originalImageDataUrl: string = ''; // Store original image for rotation
  previewImageType: 'chinha' | 'supurdnama' | null = null;
  previewImageIndex: number = -1; // For photos array
  imageRotation: number = 0;
  @ViewChild('imagePreview', { static: false }) imagePreviewElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropperContainer', { static: false }) cropperContainerElement!: ElementRef<HTMLDivElement>;
  private cropperInstance: any = null;

  // Image Preview/Edit Modal Methods
  openImagePreviewModal(imageDataUrl: string, type: 'chinha' | 'supurdnama', index: number = -1) {
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

  async openGalleryForSupurdNama() {

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

        this.openImagePreviewModal(image.dataUrl, 'supurdnama', this.supurdnamaPhotos.length);
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

  async onSelectSupurdMeLeneKaDinak() {

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
        this.supurdar_me_lene_ka_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }
  isThunthSelected = false;
  isLatthaSelected = false;
  isBalliSelected = false;
  isChiranSelected = false;
  isJalauSelected = false;
  isBanshSelected = false;
  isFencingPolSelected = false;
  isOtherSelected = false;


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

  removeBalliInfo(index: number) {
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
      is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
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

    if (this.supurd_me_dene_wale_adhikari_name === "") {
      this.showError("सुपुर्द में देने वाले अधिकारी का नाम");
      return;
    }

    if (this.supurd_me_dene_wale_adhikari_pad === "") {
      this.showError("सुपुर्द में देने वाले अधिकारी का पद");
      return;
    }

    if (!isValidWitnessFiled) {
      this.showError("साक्षियों की सम्पूर्ण जानकारी भरें");
      return;
    }

    if (this.supurdar_ka_name === "") {
      this.showError("सुपुर्ददार का नाम");
      return;
    }

    if (this.supurdar_ka_father === "") {
      this.showError("सुपुर्ददार के पिता का नाम");
      return;
    }

    if (this.supurdar_ka_jati === "") {
      this.showError("सुपुर्ददार की जाति");
      return;
    }

    if (this.supurdar_ka_vyavsay === "") {
      this.showError("सुपुर्ददार का व्यवसाय");
      return;
    }

    if (this.supurdar_ka_poora_pata === "") {
      this.showError("सुपुर्ददार का पूरा पता");
      return;
    }

    if (this.supurdar_me_lene_ka_date === "") {
      this.showError("सुपुर्द में लेने का दिनांक");
      return;
    }

    if (this.signatureImageOfSupurdar === "") {
      this.showError("सुपुर्ददार के हस्ताक्षर");
      return;
    }

    if (this.supurdnamaPhotos.length === 0) {
      this.showError("सुपुर्दनामा अपलोड करें");
      return;
    }

    const formData = new FormData();

    formData.append('complain_id', this.comingComplaintData.complain_id);

    formData.append('supurd_me_dene_wale_adhikari_name', this.supurd_me_dene_wale_adhikari_name);
    formData.append('supurd_me_dene_wale_adhikari_pad', this.supurd_me_dene_wale_adhikari_pad);

    if (this.signatureImageOfAdhikari != null) {
      const blobSignaturePhoto = this.dataURLtoBlob(this.signatureImageOfAdhikari);
      formData.append('supurd_me_dene_wale_adhikari_sign', blobSignaturePhoto, `photo_supurd_adhikari_sign.jpg`);
    } else {
      formData.append('supurd_me_dene_wale_adhikari_sign', "");
    }

    formData.append('supurdar_ka_name', this.supurdar_ka_name);
    formData.append('supurdar_ka_father', this.supurdar_ka_father);
    formData.append('supurdar_ka_jati', this.supurdar_ka_jati);
    formData.append('supurdar_ka_vyavsay', this.supurdar_ka_vyavsay);
    formData.append('supurdar_ka_poora_pata', this.supurdar_ka_poora_pata);
    formData.append('supurdar_me_lene_ka_date', this.supurdar_me_lene_ka_date);
    formData.append('supurdar_me_lene_ka_date', this.supurdar_me_lene_ka_date);
    if (this.signatureImageOfSupurdar != null) {
      const blobSignaturePhoto = this.dataURLtoBlob(this.signatureImageOfSupurdar);
      formData.append('supurdar_sign', blobSignaturePhoto, `photo_supurdar_sign.jpg`);
    } else {
      formData.append('supurdar_sign', "");
    }

    const witnessesData: any[] = this.witnesses.map((w) => ({
      Name: String(w.naam).trim(),
      FathersName: w.pita_ka_naam ? String(w.pita_ka_naam).trim() : '',
      Address: w.pata ? String(w.pata).trim() : '',
      Jaati: w.jaati ? String(w.jaati).trim() : '',
      Age: (w.age !== null && w.age !== undefined) ? String(w.age).trim() : '',
      Sign: '' // handled by files
    }));

    formData.append('Witnesses', JSON.stringify(witnessesData));

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

    for (let i = 0; i < this.supurdnamaPhotos.length; i++) {
      const blobJaptinamaPhoto = this.dataURLtoBlob(this.supurdnamaPhotos[i]);
      formData.append('supurdnama_pic', blobJaptinamaPhoto, `photo_supurd_${i + 1}.jpg`);
    }

    formData.append('created_by', this.loginedOfficerEmpId.toString());

    const Saman_Detail = [
      ...this.kasthItemsList.map(item => ({
        ...item,
        jabti_saman_type: "2" // Force value for Kashtha
      })),
      ...this.OtherJaptItemsList.map(item => ({
        ...item,
        jabti_saman_type: "3" // Force value for other 
      })),
      ...this.chiranItemsList.map(item => ({
        ...item,
        jabti_saman_type: "4" // Force value for Chiran
      })),
      ...this.chattaItemsList.map(item => ({
        ...item,
        jabti_saman_type: "5" // Force value for chatta
      })),
      ...this.balliItemsList.map(item => ({
        ...item,
        jabti_saman_type: "6" // Force value for balli
      })),
      ...this.baansItemsList.map(item => ({
        ...item,
        jabti_saman_type: "7" // Force value for bansh
      })),
      ...this.polItemsList.map(item => ({
        ...item,
        jabti_saman_type: "8" // Force value for fencing pol
      }))
    ];

    let isSupurdNagExist = false;
    for (let i = 0; i < Saman_Detail.length; i++) {
      let singleValue = Saman_Detail[i];
      if (singleValue.supurd_me_diya_gya > 0) {
        isSupurdNagExist = true;
        break;
      }
    }

    if (!isSupurdNagExist) {
      this.showError("कृपया सामग्रियों का विवरण प्रेषित करिये, जो सुपुर्द में दी जा रही है");
      return;
    }


    formData.append('Saman_Detail', JSON.stringify(Saman_Detail));

    this.showDialog('कृपया इंतजार करें');

    this.apiService.submitSupurdnamaData(formData).subscribe(
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

    if (this.previewImageType === 'chinha') {
    } else if (this.previewImageType === 'supurdnama') {

      this.supurdnamaPhotos.splice(0, 1);

      if (this.previewImageIndex >= 0 && this.previewImageIndex < this.supurdnamaPhotos.length) {
        this.supurdnamaPhotos[this.previewImageIndex] = croppedDataUrl;
      } else {
        this.supurdnamaPhotos.push(croppedDataUrl);
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

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }




  listOfJaptVahanDetail: JaptVahanDetailInterface[] = [];
  listOfjaptiSaman: JaptSamanItem[] = []

  kasthItemsList: any[] = [];
  chiranItemsList: any[] = [];
  chattaItemsList: any[] = [];
  OtherJaptItemsList: any[] = [];
  balliItemsList: any[] = [];
  baansItemsList: any[] = [];  // बाँस (Bamboo)
  polItemsList: any[] = [];

  filterItems() {



    this.kasthItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा' && Number(item.left_nag || 0) > 0
    );

    this.chiranItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान' && Number(item.left_nag || 0) > 0
    );

    this.chattaItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा' && Number(item.left_nag || 0) > 0
    );

    this.OtherJaptItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान' && Number(item.left_nag || 0) > 0
    );

    this.balliItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली' && Number(item.left_nag || 0) > 0
    );

    this.baansItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस' && Number(item.left_nag || 0) > 0
    );

    this.polItemsList = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल' && Number(item.left_nag || 0) > 0
    );
    // 
    console.log(this.baansItemsList, ' baansItemsList');
    console.log(this.polItemsList, ' polItemsList');

  }

  getDetailOfComplain() {

    this.showDialog("कृपया प्रतीक्षा करें");
    this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          console.log(response, ' response');
          if (response.complainData && response.complainData.length > 0) {
            this.comingComplaintData = response.complainData[0];


            if (this.comingComplaintData.is_japt_vahan === "1") {
              if (this.comingComplaintData.japt_vahan_detail && this.comingComplaintData.japt_vahan_detail.trim() !== '') {
                try {
                  this.listOfJaptVahanDetail = JSON.parse('[' + this.comingComplaintData.japt_vahan_detail + ']');

                } catch (error) {

                }
              }
            }

            this.listOfjaptiSaman = this.comingComplaintData.japtSamanList || [];
            this.filterItems();

          }

        }



      },
      (error) => {
        this.dismissDialog();
      }
    );

  }








  onEnterSupurdMeDiyaGayaInput(row: any, input?: any) {
    const value = Number(row.supurd_me_diya_gya);
    const nag = Number(row.left_nag);

    if (value > nag) {
      row.supurd_me_diya_gya = null;

      // 🔥 force UI update
      input.value = null;
    }
  }


}