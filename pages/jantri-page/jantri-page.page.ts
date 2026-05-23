import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AccusedPersonDetail, AccusedPersonDetailForVanApradhPrakran } from '../officer-dashboard/GetDashboardResponse.model';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { addCircleOutline, arrowBack, book, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, createOutline, eyeOutline, locationOutline, refreshCircleOutline, trashOutline, informationCircleOutline, checkmarkCircle, refreshOutline, imagesOutline, personCircleOutline, peopleOutline, documentTextOutline, close, folderOutline, carOutline } from 'ionicons/icons';

import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

import { Router } from '@angular/router';

import { NavController, ModalController, ActionSheetController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { Platform } from '@ionic/angular';

import { NgSelectModule } from '@ng-select/ng-select';

import { IonicModule } from '@ionic/angular'; // Import IonicModule

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


@Component({
  selector: 'app-jantri-page',
  templateUrl: './jantri-page.page.html',
  styleUrls: ['./jantri-page.page.scss'],
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, IonRadioGroup,
    IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
    IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
    IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
    IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
    IonModal, IonChip

  ],
  providers: [Diagnostic, DatePipe]
})
export class JantriPage implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = ""

  listOfWoodPrajati: any = [];

  current_location_google_addres: string = "Getting your location, please wait....";

  isThunthSelected = false;
  isLatthaSelected = false;
  isBalliSelected = false;
  isChiranSelected = false;
  isJalauSelected = false;
  isBanshSelected = false;
  isFencingPolSelected = false;
  isOtherSelected = false;

  // Price master lists
  listOfBambooPriceMaster: BambooPriceMasterResponse[] = [];
  listOfLattaKasthaPriceMaster: LatthaKasthPriceMasterResponse[] = [];
  listOfBalliPriceMaster: BalliPriceMasterResponse[] = [];
  listOfBalliVolumnMaster: BalliPriceMasterResponse[] = [];
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

  constructor(private sqliteService: DatabaseService, private networkCheckService: NetworkCheckService, private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private diagnostic: Diagnostic, private platform: Platform, private navController: NavController, private apiService: ApiServiceService, private modalController: ModalController, private actionSheetController: ActionSheetController, private router: Router, private languageService: LanguageServiceService, private datePipe: DatePipe) {
    addIcons({ eyeOutline, createOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline, addCircleOutline, trashOutline, informationCircleOutline, checkmarkCircle, refreshOutline, imagesOutline, personCircleOutline, peopleOutline, documentTextOutline, close, folderOutline, carOutline });
  }

  async ngOnInit() {

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
    }

    this.getMasterData();

    //this.handleBackButton();

  }

  async handleBackButton() {
    // this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, async () => {
    //   this.cancel();
    // });

    // const { value } = await Preferences.get({ key: PreferenceKeys.emp_designation });
    // if (value) {
    // }
    this.cancel();

  }

  ionViewWillLeave() {
    this.removeBackButtonListener();
  }

  // Helper method to convert value to string (for use in templates)
  toString(value: any): string {
    return String(value ?? '');
  }

  // Helper method to get dhara display value (handles both dhara and adhara properties)
  getDharaDisplayValue(item: any): string {
    return (item?.dhara || (item as any)?.adhara || '').toString();
  }

  backButtonHandler: any;
  removeBackButtonListener() {
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
      this.backButtonHandler = null;
    }
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


      } else {
        this.showPermissionAlert("Location permission not granted");
      }
    } catch (error) {
      this.isGettingLocation = false;
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

  goBack() {
    this.navController.back();
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


  async cancel() {

    // const modal = await this.modalController.create({
    //   component: MessageDialogComponent,
    //   cssClass: 'custom-dialog-modal',
    //   componentProps: {
    //     server_message: 'क्या आप इस प्रक्रिया को रद्द करना चाहते हैं ?',
    //     isYesNo: true
    //   },
    //   backdropDismiss: false
    // });

    // modal.onDidDismiss().then(async (result) => {
    //   if (result.data?.confirmed) {
    //     this.goBack();
    //   }
    // });

    // await modal.present();

    this.goBack();
  }

  async shortToast(msg: any) {
    // Backward-compatible wrapper: route all "shortToast" usages to the dialog-based error UI.
    // This keeps existing call-sites intact while enforcing `showError` everywhere.
    await this.showError(String(msg ?? ''));
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


  selectedDhara: string = "";
  //selectedComparatment: string = "0";

  clipboardDharas: { id: string; name: string, extraInfo: string }[] = [];

  clipboardCompartment: { name: string }[] = [];

  selectedCompartmentValue: string | null = null;
  selectedDharaValue: number | null = null;

  // Getter to check if "अन्य" is selected in clipboardCompartment
  get hasNoneCompartment(): boolean {
    return this.clipboardCompartment.some(c => c.name === 'अन्य स्थल');
  }

  selectedDharaHeadYear: any;


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


  get mahayogtotalNag(): number {
    let totalBalligNage = this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
    let totalChirangNage = this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
    let totalLattagNage = this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );

    let total = totalBalligNage + totalChirangNage + totalLattagNage;
    return total;

  }

  get mahayogtotalGhanmeter(): number {
    const totalBallig = this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);

    const totalChiran = this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);

    const totalLattah = this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0);

    const total = totalBallig + totalChiran + totalLattah;

    return parseFloat(total.toFixed(3)); // keeps 3 decimal places as number
  }


  get totalBalligNag(): number {
    return this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliGhanMeter(): string {
    return (this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3)).toString(); // always 3 digits after decimal
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
    const golai = parseFloat(row.golai) || 0;
    const lambai = parseFloat(row.lambai) || 0;
    const nag = parseFloat(row.nag) || 0;
    //row.ghan_meter = ((lambai * golai) * nag).toFixed(2);

    row.ghan_meter = ((lambai * (golai * golai)) / 160000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);

    //row.ghan_meter = "0";
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

  removeThunthInfo(index: number) {

    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
    }
  }

  removeChattaInfo(index: number) {

    if (index > -1 && index < this.listOfChattaDetail.length) {
      this.listOfChattaDetail.splice(index, 1);
    }
  }

  removeChiranInfo(index: number) {

    if (index > -1 && index < this.listOfChiranaDetail.length) {
      this.listOfChiranaDetail.splice(index, 1);
    }
  }

  removeKashthaInfo(index: number) {

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
    //  ;
    this.listOfOtherJaptSamanDetail.push({
      jabti_saman_type: '3', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
    });
  }

  removeOtherJaptiSaman(index: number) {
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

  removeBalliInfo(index: number) {
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

  removeVahanDetail(index: number) {
    if (index > -1 && index < this.listOfVahanDetail.length) {
      this.listOfVahanDetail.splice(index, 1);
    }
  }

  // Material type checkbox handler
  onCheckboxChangeOfJaptiSamanType(event: any, type: string) {
    const checked = event.detail.checked;

    switch (type) {
      case 'thunth':
        this.listOfThunthDetail = [];
        this.isThunthSelected = checked;
        if (checked) {
          // Add one default form when checked
          this.addThunthInfo();
        }
        break;
      // break;

      case 'lattha':
        this.listOfKashthaDetail = [];
        this.isLatthaSelected = checked;
        break;

      case 'balli':
        this.listOfBalliDetail = [];
        this.isBalliSelected = checked;
        break;

      case 'chiran':
        this.listOfChiranaDetail = [];
        this.isChiranSelected = checked;
        break;

      case 'jalau':
        this.listOfChattaDetail = [];
        this.isJalauSelected = checked;
        break;

      case 'bansh':
        this.listOfBanshDetail = [];
        this.isBanshSelected = checked;
        break;

      case 'fencing_pol':
        this.listOfFencingPolDetail = [];
        this.isFencingPolSelected = checked;
        break;

      case 'other':
        this.listOfOtherJaptSamanDetail = [];
        this.isOtherSelected = checked;
        break;
    }
  }


  // Bansh methods
  addBanshInfo() {
    this.listOfBanshDetail.push({
      jabti_saman_type: '7', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: ''
    });
  }

  removeBanshInfo(index: number) {
    if (index > -1 && index < this.listOfBanshDetail.length) {
      this.listOfBanshDetail.splice(index, 1);
    }
  }

  resetAllBanshEntry(row: any) {
    row.lambai = null;
    row.nag = null;
    row.ghan_meter = "";



  }

  setBanshList(prajati_type: number): IdAndNameModel[] {
    if (prajati_type === 1) {
      return this.listOfBanshSizeVyaparik;
    } else {
      return this.listOfBanshSizeOdyogic;
    }
  }

  calculateNosionalTon(row: any) {
    let lambai = parseFloat(row.lambai) || 0;
    let nag = parseFloat(row.nag) || 0;

    let mult = (lambai * nag);
    let matra = ((mult) / 2400).toFixed(3);
    row.ghan_meter = matra;
  }

  setListOfBanshSizeAccordingToYearAndType() {


    this.listOfBanshSizeVyaparik = Array.from(
      new Map(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.bambu_type === "1" && item.circle === "2")
          .map((item, index) => [
            item.size,
            {
              id: index + 1,
              name: item.size
            }
          ])
      ).values()
    );


    const uniqueVyaparik = [
      ...new Set(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.bambu_type === "1" && item.circle === "2"
          )
          .map(item => item.size?.trim())
      )
    ];

    this.listOfLambaiValueBalli = uniqueVyaparik.map((value, index) => ({
      id: index + 1,   // numeric id (required by your model)
      name: value      // actual display value
    }));

    //return this.listOfBanshSizeVyaparik;


    this.listOfBanshSizeOdyogic = Array.from(
      new Map(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.bambu_type === "2" && item.circle === "2")
          .map((item, index) => [
            item.size,
            {
              id: index + 1,
              name: item.size
            }
          ])
      ).values()
    );


    const uniqueOdyo = [
      ...new Set(
        this.listOfBambooPriceMaster
          .filter(item =>
            item.bambu_type === "2" && item.circle === "2"
          )
          .map(item => item.size?.trim())
      )
    ];

    this.listOfBanshSizeOdyogic = uniqueOdyo.map((value, index) => ({
      id: index + 1,   // numeric id (required by your model)
      name: value      // actual display value
    }));

  }

  get totalVyaparikBanshNag(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 1)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
  }

  get totalVyaparikBanshMatra(): string {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 1)
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalOdyogicBanshMatra(): string {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 2)
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalOdyogicBanshNag(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 2)
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
  }

  // Fencing Pol methods
  addFencingPolInfo() {
    this.listOfFencingPolDetail.push({
      jabti_saman_type: '8', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: '', is_yogya_to_parivahan: '',
      if_not_yogya_then_reason: ''
    });
  }

  removeFencingPolInfo(index: number) {
    if (index > -1 && index < this.listOfFencingPolDetail.length) {
      this.listOfFencingPolDetail.splice(index, 1);
    }
  }

  get totalFencingPolNag(): number {
    return this.listOfFencingPolDetail
      .reduce(
        (sum, item) => sum + (Number(item.nag) || 0),
        0
      );
  }
  private getBanshPrajatiName(prajatiId: any): string {
    if (!prajatiId) return '';
    const prajati = this.listOfBanshType.find((p: any) => p.id === prajatiId);
    return prajati ? prajati.name : '';
  }

  checkMinMaxForRowLatthaGolai(row: any) {
    //  ;
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

    //  ;
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
        // ;
        this.showError("गोलाई " + min + " से.मी. से कम की प्रविष्टि नहीं की जा सकती , कृपया सही गोलाई प्रविष्ट करें ");
        row.golai = "";
      }
    }

    this.calculateGhanMeterKastha(row);
    //this.setPerLatthaPriceAccordingToEnterValues(row);

  }

  checkMinMaxForRowLatthaLambai(row: any) {
    //  ;
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
      //  ;
      row.lambai = "";
    }

    this.calculateGhanMeterKastha(row);
    //this.setPerLatthaPriceAccordingToEnterValues(row);

  }







  getMasterData() {
     ;
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getCastAndCrimMaster(this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      async (response) => {

         ;
        await this.dismissDialog();

        if (response.response.code === 200) {
          //added

          console.log("response working", response);
          console.log("dhara data new", response);

          // this.listOfDharaNew = response.dhara_data;
          this.listOfWoodPrajati = response.prajati_name;

          if (response.bamboo_price_master) {
            this.listOfBambooPriceMaster = response.bamboo_price_master;
          }
          if (response.lattha_price_master) {
            this.listOfLattaKasthaPriceMaster = response.lattha_price_master;
          }
          if (response.balli_price_master) {
             ;
            this.listOfBalliPriceMaster = response.balli_price_master;
            this.listOfBalliVolumnMaster = response.balli_volumn_master;
          }
          if (response.form_factor_master) {
            this.listOfFormFactorMaster = response.form_factor_master;
          }
          if (response.khada_vrikha_price_master) {
            this.listOfVrikhaPriceMaster = response.khada_vrikha_price_master;
          }

           ;
          this.setListOfBanshSizeAccordingToYearAndType();

          this.prepareWoodLists();

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }



  setListOfLambaiAndGolaiAccordingToYearAndPrajatiSelection(row: any) {


     ;
    row.lambai = null;
    row.golai = null;
    row.dar = 0;
    row.total_cost = 0;

    this.listOfLambaiValueBalli = [];
    this.listOfGolaiValueBalli = [];


    this.listOfLambaiValueBalli = Array.from(
      new Map(
        this.listOfBalliVolumnMaster
          .filter(item =>
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
        this.listOfBalliVolumnMaster
          .filter(item =>
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

    const uniqueLenght = [
      ...new Set(
        this.listOfBalliVolumnMaster
          .filter(item =>
            item.prajati === row.prajati_type?.toString()
          )
          .map(item => item.length?.trim())
      )
    ];

    this.listOfLambaiValueBalli = uniqueLenght.map((value, index) => ({
      id: index + 1,   // numeric id (required by your model)
      name: value      // actual display value
    }));


    const uniqueGolai = [
      ...new Set(
        this.listOfBalliVolumnMaster
          .filter(item =>
            item.prajati === row.prajati_type?.toString()
          )
          .map(item => item.girh_class?.trim())
      )
    ];

    this.listOfGolaiValueBalli = uniqueGolai.map((value, index) => ({
      id: index + 1,   // numeric id (required by your model)
      name: value      // actual display value
    }));

  }

  calculateTotalBalliRashi(row: any) {

     ;
    const nag = parseFloat(row.nag) || 0;
    const volumn = parseFloat(row.volumn) || 0;

    row.ghan_meter = (nag * volumn).toFixed(3);

  }


  // Prepare wood lists based on show_in field
  prepareWoodLists(): void {
     ;
    this.woodListForExceptJalau = [];
    this.woodListForJalau = [];

    const prajatiSet = new Set(
      this.listOfBalliVolumnMaster.map(x => Number(x.prajati))
    );

     ;
    for (let i = 0; i < this.listOfWoodPrajati.length; i++) {
      const item = this.listOfWoodPrajati[i];

      if (prajatiSet.has(Number(item.id))) {
        this.woodListForExceptJalau.push(item);
      }
    }

  }


  getBalliPriceSingleValue(row: any) {

    if (!this.listOfBalliVolumnMaster?.length) return;

    const rowPrajati = String(row.prajati_type);
    const rowGolai = String(row.golai);
    const rowLambai = String(row.lambai);

    const baseFilter = (item: any) =>
      String(item.length).trim() === rowLambai.trim() &&
      String(item.girh_class).trim() === rowGolai.trim();

    let singleRow: any = null;

    // Case 1: Exact prajati match
    if (rowPrajati !== '0') {
      singleRow = this.listOfBalliVolumnMaster.find(item =>
        baseFilter(item) &&
        String(item.prajati) === rowPrajati
      );
    }

    // Case 2: Fallback prajati = 0
    if (!singleRow) {
      singleRow = this.listOfBalliVolumnMaster.find(item =>
        baseFilter(item) &&
        String(item.prajati) === '0'
      );
    }

    row.volumn = singleRow?.volumn ?? null;

    this.calculateTotalBalliRashi(row);
  }


}