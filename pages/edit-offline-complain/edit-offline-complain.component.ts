import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { mapOutline, addCircleOutline, arrowBack, calendarOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, locationOutline, refreshCircleOutline, trashOutline, createOutline } from 'ionicons/icons';

import { Router } from '@angular/router';

import { NavController, ModalController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';

import { NgSelectModule } from '@ng-select/ng-select';

import { Toast } from '@capacitor/toast';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';

import { PorData } from './PorData';
import { JaptSamanItem } from '../officer-dashboard/GetDashboardResponse.model';
import { ImagePreviewOfflineModalComponent } from 'src/app/dialogs/image-preview-offline-modal/image-preview-offline-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatabaseService } from 'src/app/services/DatabaseService.service';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { SignaturePageComponent } from '../signature-page/signature-page.component';
import { NgIf } from '@angular/common';  // 👈 add this
import { first } from 'rxjs';
import { FirebaseError } from 'firebase/app';


@Component({
  selector: 'app-edit-offline-complain',
  templateUrl: './edit-offline-complain.component.html',
  styleUrls: ['./edit-offline-complain.component.scss'],
  standalone: true,
  imports: [IonImg, NgSelectModule, CommonModule, FormsModule, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem, IonList, NgIf],
  providers: [Diagnostic]
})
export class EditOfflineComplainComponent implements OnInit {

  complainer_name: string = "";
  complainer_pad: string = "";

  porDataList: any = null;

  constructor(
    private sqliteService: DatabaseService,
    private langService: LanguageServiceService,
    private sanitizer: DomSanitizer,
    private sharedService: SharedserviceService, private cdRef: ChangeDetectorRef, private modalCtrl: ModalController, private router: Router, private navController: NavController) {
    addIcons({ createOutline, trashOutline, addCircleOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  listOfjaptiSaman: JaptSamanItem[] = []

  listOfDharaNew: any = [];
  listOfWoodPrajati: any = [];
  listOfBeat: any = [];
  listOfCrimType: any = [];

  otherJaptaSamanDetail: string = "";

  localListOfDharaHead: { name: string; id: string, dharaYear: string }[] = [];
  localListOfActualDhara: { name: string; id: string }[] = [];

  clipboardDharas: { id: string; name: string, extraInfo: string }[] = [];
  clipboardCompartment: { name: string }[] = [];

  selectedCrimeBeatCompartment: any = null;
  listOfCompartment: any = [];
  listOfCast: any = [];

  listOfDhara: { dharaYear: string; dharaSection: string }[] = [];
  isAccusedFound: boolean = true;
  accussedName: string = "";
  accussedFatherName: string = "";
  address: string = "";
  selectedAccusedCast: any = null;
  accussed_jati_name: any = "";

  //Major code added by sandeep pansari start 1 Date 9 28 25
  accusedPersons: Array<{
    name: string;
    fathersName: string;
    cast: number;
    address: string;
    signatureImage: string;
    age: string;
    jati_name: string;
    mobile_number: string;
  }> = [];
  //Major code added by sandeep pansari end 1 Date 9 28 25

  apradhi_photo: string = "";
  por_photo: string = "";

  supurd_nama_photo: string = "";
  japti_nama_photo: string = "";
  panch_nama_photo: string = "";

  photos: string[] = [];

  crimePlace: string = "";
  crimeDate: string = "";
  selectedCrimType: any = null;
  current_location_google_addres: string = "";
  lat: string = "";
  lon: string = "";

  selectedCrimeBeat: any = null;
  selectedCrimeBeatName: any = null;

  por_number: any = null;

  witness_first_name: string = "";
  witness_address_first: string = "";

  witness_second_name: string = "";
  witness_address_second: string = "";

  samanTypeMap: Record<string, string> = {
    "1": "ठूंठ",
    "2": "लट्ठा",
    "3": "Other"
  };

  get totalThunthNag(): number {
    return this.listOfThunthDetail.reduce(
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

  get totalKashthGhanMeter(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  removeThunthInfo(index: number) {

    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
    }
  }

  removeKashthaInfo(index: number) {

    if (index > -1 && index < this.listOfKashthaDetail.length) {
      this.listOfKashthaDetail.splice(index, 1);
    }
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

  // getJaptisamanList(samanDetails: string): JaptSamanItem[] {


  //   const listOfSaman: JaptSamanItem[] = JSON.parse(samanDetails)
  //     .filter((item: any) => item.jabti_saman_type !== "3")
  //     .map((item: any, index: number) => {
  //       const prajati = this.listOfWoodPrajati.find(
  //         (p: any) => p.id === Number(item.prajati_type)
  //       );

  //       return {
  //         jabti_saman_type: item.jabti_saman_type,
  //         actual_name_of_saman: this.samanTypeMap[item.jabti_saman_type] ?? "",
  //         saman_table_id: (index + 1).toString(),
  //         prajati_name: prajati ? prajati.name : "",
  //         prajati_type: item.prajati_type,
  //         lambai: item.lambai,
  //         golai: item.golai,
  //         ghan_meter: item.ghan_meter,
  //         nag: item.nag,
  //         dar: item.dar,
  //         total_cost: item.total_cost,
  //         if_other_then_detail: item.if_other_then_detail,
  //         one_golai_less: item.one_golai_less,
  //         form_factor: item.form_factor,
  //         motai: item.motai,
  //         unchai: item.unchai,
  //         kasth_halat: item.kasth_halat,
  //         kasth_halat_name: item.kasth_halat_name
  //       };
  //     });


  //   return listOfSaman;

  // }

  filterItems() {
     ;
    this.listOfKashthaDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '2'
    );

    this.listOfThunthDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '1'
    );

    this.listOfChiranaDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '4'
    );

    this.listOfChattaDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '5'
    );

    this.listOfBalliDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '6'
    );

    this.listOfOtherJaptSamanDetail = this.listOfjaptiSaman.filter(
      item => item.jabti_saman_type === '3'
    );

  }



  get totalChattaNag(): number {
    return this.listOfChattaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
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

  async takePorPhoto() {

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
      this.por_photo = image.dataUrl;
    }

  }

  signatureImage: string | null = null;

  async openSignaturePad() {

    const modal = await this.modalCtrl.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      this.signatureImage = data.signature;
    }

  }

  async takeApradhiPhoto() {

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
      this.apradhi_photo = image.dataUrl;
    }

  }

  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' },
    { id: 4, name: 'बल्ली' },
    { id: 5, name: 'अन्य' }
  ];

  get totalChiranGhanMeter(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
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
      kasth_halat: number
    }[] = [];

  addChattaInfo() {
    this.listOfChattaDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0
    });
  }

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
      kasth_halat: number
    }[] = [];

  addChiranInfo() {
    this.listOfChiranaDetail.push({
      jabti_saman_type: '4', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0
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
      kasth_halat: number
    }[] = [];

  addThunthInfo() {
    this.listOfThunthDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0
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
      kasth_halat: number
    }[] = [];


  addKasthaInfo() {
    this.listOfKashthaDetail.push({
      jabti_saman_type: '2', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0
    });
  }

  showImage(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

  // async showImageAlert(photoBase64: string) {

  //   const modal = await this.modalCtrl.create({
  //     component: ImagePreviewOfflineModalComponent,
  //     cssClass: 'custom-dialog-modal',
  //     componentProps: {
  //       imageUrl: photoBase64
  //     },
  //     backdropDismiss: true,
  //   });

  //   await modal.present();

  // }

  async showImageAlert(photoBase64: string) {

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

  idToUpdate: number = 0;

  async ngOnInit() {

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    if (value) {
      this.complainer_name = value;
      this.japt_karne_wale_adhikari_ka_name = this.complainer_name;
      this.japt_karne_wale_adhikari_ka_pad = this.complainer_pad;
    }


    this.getLoginedOfficerData();

  }

  async cancel() {

    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप सुनिश्चित हैं ?',
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

  //Major code added by sandeep pansari start 1 Date 9 28 25
  addAccusedPerson() {
    this.accusedPersons.push({
      name: '',
      fathersName: '',
      cast: 0,
      address: '',
      signatureImage: '',
      age: '',
      jati_name: '',
      mobile_number: ''
    });
  }

  removeAccusedPerson(index: number) {
    if (this.accusedPersons.length > 1) {
      this.accusedPersons.splice(index, 1);
      // Update single fields with first accused person
      if (this.accusedPersons.length > 0) {
        this.updateSingleFieldsFromFirstAccused();
      }
    }
  }

  accussedAge: string = "";
  accussedMobile: string = "";

  updateSingleFieldsFromFirstAccused() {
    if (this.accusedPersons.length > 0) {
      this.accussedName = this.accusedPersons[0].name;
      this.accussedFatherName = this.accusedPersons[0].fathersName;
      this.accussedAge = this.accusedPersons[0].age;
      this.accussedMobile = this.accusedPersons[0].mobile_number;
      this.accussed_jati_name = this.accusedPersons[0].jati_name;
      this.address = this.accusedPersons[0].address;
      this.selectedAccusedCast = this.accusedPersons[0].cast ? Number(this.accusedPersons[0].cast) : null;
    }
  }
  //Major code added by sandeep pansari end 1 Date 9 28 25

  goBack() {
    this.navController.back();
  }

  isBeatNirikshan: boolean = false;
  onRadioChangeBeatNirikhan(event: any) {
    this.isBeatNirikshan = event.detail.value
  }

  async updateCrimDetail() {

     ;

    let complainer_name_title = "POR जारीकर्ता का नाम";

    if (this.complainer_name === "") {
      this.shortToast(complainer_name_title);
      return;
    }

    await Preferences.set({ key: PreferenceKeys.emp_name, value: this.complainer_name });

    if (await this.sqliteService.checkPorExistsUsingIdAlso(this.por_number, this.idToUpdate)) {
      this.longToast(`${this.por_number} नंबर का POR फॉर्म ऑफलाइन में पहले ही जमा है.`);
      return
    }

    if (this.por_number === "") {
      this.shortToast("POR क्रमांक प्रेषित करिये");
      return;
    }

    if (this.clipboardCompartment.length === 0) {
      this.shortToast("कम्पार्टमेंट नंबर चुने");
      return;
    }

    if (this.isAccusedFound === true) {
      for (let i = 0; i < this.accusedPersons.length; i++) {
        const person = this.accusedPersons[i];

        if (person.name === "") {
          this.shortToast(`अपराधी ${i + 1} का नाम दर्ज करें`);
          return;
        }

        if (person.fathersName === "") {
          this.shortToast(`अपराधी ${i + 1} के पिता का नाम दर्ज करें`);
          return;
        }

        if (person.age === "") {
          this.shortToast(`अपराधी ${i + 1} उम्र दर्ज करें`);
          return;
        }

        if (person.jati_name === "") {
          this.shortToast(`अपराधी ${i + 1} की जाति दर्ज करें`);
          return;
        }

        if (person.address === "") {
          this.shortToast(`अपराधी ${i + 1} का पता दर्ज करें`);
          return;
        }

        if (person.cast === null) {
          this.shortToast(`अपराधी ${i + 1} की जाति वर्ग चुनें`);
          return;
        }

        if (person.signatureImage === null) {
          this.shortToast(`अपराधी ${i + 1} का हस्ताक्षर`);
          return;
        }

      }
    }

    if (this.selectedCrimType === null) {
      this.shortToast("अपराध का प्रकार चुनें");
      return;
    }

    if (this.clipboardDharas.length < 0) {
      this.shortToast("अपराथ की धारा चुने");
      return;
    }

    if (this.witness_first_name === "" && this.witness_second_name === "") {
      this.shortToast("साक्षी का नाम");
      return;
    }

    if (this.witness_address_first === "" && this.witness_address_second === "") {
      this.shortToast("साक्षी का पता");
      return;
    }

    if (this.crimePlace === "") {
      this.shortToast("अपराध की जगह");
      return;
    }

    if (this.isAccusedFound && this.apradhi_photo === "") {
      this.shortToast("अपराधी का फोटो");
      return;
    }

    if (this.japti_nama_photo === "") {
      this.shortToast("जप्ति नामा का फोटो");
      return;
    }

    if (this.panch_nama_photo === "") {
      this.shortToast("पंचनामा का फोटो");
      return;
    }

    if (this.por_photo === "") {
      this.shortToast("POR का फोटो");
      return;
    }



    const samanDetails = [
      ...this.listOfKashthaDetail.map(item => ({
        ...item,
        jabti_saman_type: "2" // Force value for Kashtha
      })),
      ...this.listOfThunthDetail.map(item => ({
        ...item,
        jabti_saman_type: "1" // Force value for Thunth
      })),
      ...this.listOfChiranaDetail.map(item => ({
        ...item,
        jabti_saman_type: "4" // Force value for Chiran
      })),
      ...this.listOfChattaDetail.map(item => ({
        ...item,
        jabti_saman_type: "5" // Force value for Chiran
      })),
      ...this.listOfBalliDetail.map(item => ({
        ...item,
        jabti_saman_type: "6" // Force value for Chiran
      })),
      ...this.listOfOtherJaptSamanDetail.map(item => ({
        ...item,
        jabti_saman_type: "3" // Force value for other 
      })),
    ];

    let comparetment = "";

    if (this.clipboardCompartment.length > 0) {
      comparetment = this.clipboardCompartment
        .map(d => `${d.name}`)
        .join(', ');
    }

    let isAccusedFOUND = "0";
    if (this.isAccusedFound === true) {
      isAccusedFOUND = "1";
    }

    let selectedCAST = "";
    if (this.selectedAccusedCast !== null) {
      selectedCAST = this.selectedAccusedCast;
    }

    const commaSeparatedDharaye = this.clipboardDharas
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

    await this.handleAccusedPersonTransitions();

    ///////// INSERT VAHAN DETAIL ///////////

    await this.sqliteService.deleteVahanDetailByPorId(this.idToUpdate);

    if (this.isVahanFound && this.listOfVahanDetail.length > 0) {

      await this.sqliteService.insertMultipleVahanDetail(this.idToUpdate, this.listOfVahanDetail);

    }

    let signatureName = "";
    if (this.signatureImage === null) {
      signatureName = "";
    } else {
      signatureName = this.signatureImage;
    }

    let isJaptikartaAndSupurdarSameValue = "0";
    if (this.isJaptikartaAndSupurdarSame) {
      isJaptikartaAndSupurdarSameValue = "1";
    }

    let beatNirikshanValue = "0";
    if (this.isBeatNirikshan) {
      beatNirikshanValue = "1";
    } else {
      beatNirikshanValue = "0";
    }

    if (this.isVahanFound && this.listOfVahanDetail.length === 0) {
      this.shortToast("जप्त वाहन की जानकारी प्रविस्ट करिये");
      return;
    }

    let isValidJaptVahanDetail: boolean = true;
    if (this.isVahanFound) {

      for (let i = 0; i < this.listOfVahanDetail.length; i++) {
        const row = this.listOfVahanDetail[i];
         ;

        if (
          !row.vahan_prakar ||
          !row.vahan_kramank ||
          !row.anumanit_mulya ||
          !row.malik_ka_name ||
          !row.malik_k_father_ka_name ||
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
      this.shortToast("जप्त वाहन की सभी जानकारी प्रविस्ट करिये");
      return;
    }

    let returnValue = await this.sqliteService.updatePORData(
      this.crimeDate.toString(),
      this.por_number.toString(),
      comparetment,
      isAccusedFOUND,
      this.accussedName,               // accusedName
      this.accussedFatherName,
      this.address.toString(),
      selectedCAST,
      this.selectedCrimType.toString(),                  // typeOfCrime
      commaSeparatedDharaye,
      this.witness_first_name?.toString().trim() || 'NA',               // name_of_witness_one
      this.witness_second_name?.toString().trim() || 'NA',             // name_of_witness_two
      this.witness_address_first?.toString().trim() || 'NA',      // address_of_witness_one
      this.witness_address_second?.toString().trim() || 'NA',      // address_of_witness_two
      this.crimePlace.toString(),          // placeOfCrime
      JSON.stringify(samanDetails),
      this.otherJaptaSamanDetail?.toString() || 'NA',       // detailsOfSeizedGoods
      this.japti_nama_photo,
      this.supurd_nama_photo,
      this.panch_nama_photo,
      photoCommaList,
      this.idToUpdate,
      this.complainer_name,
      this.apradhi_photo,
      this.por_photo,
      signatureName,
      this.complainer_pad,
      this.chinhaPhoto,
      this.japtinama_anya_vishesh_vivran,
      isJaptikartaAndSupurdarSameValue,
      this.supurddar_ka_name,
      this.supurddar_ka_pita_ka_name,
      this.supurddar_ka_jati,
      this.supurddar_ka_vyavsay,
      this.supurddar_ka_full_address,
      this.supurd_me_lene_ka_dinank,
      this.witness1Sign,
      this.witness2Sign,
      this.signatureImageSupurddar,
      this.japt_karne_wale_adhikari_ka_name,
      this.japt_karne_wale_adhikari_ka_pad,
      beatNirikshanValue,
      this.accussedAge
    );

    if (returnValue) {
      this.longToast("Update successful");
      this.sharedService.setRefresh(true);

      this.goBack();
    } else {
      this.longToast("Problem to update successful");
    }

  }

  selectedDharaHeadYear: any;

  async handleAccusedPersonTransitions() {

    const porDetailId = this.idToUpdate;
    const accusedCount = this.accusedPersons.length;

    try {
      if (!this.isAccusedFound || accusedCount === 0) {

        await this.sqliteService.clearAccusedFieldsInPorDetail(porDetailId);
        await this.sqliteService.deleteAccusedPersonsByPorId(porDetailId);

      } else if (accusedCount === 1) {

        const firstAccused = this.accusedPersons[0];
        await this.sqliteService.updateAccusedFieldsInPorDetail(
          porDetailId,
          firstAccused.name,
          firstAccused.fathersName,
          firstAccused.cast.toString(),
          firstAccused.address,
          firstAccused.age,
          firstAccused.jati_name,
          firstAccused.mobile_number
        );
        await this.sqliteService.deleteAccusedPersonsByPorId(porDetailId);
        await this.sqliteService.insertMultipleAccusedPersons(porDetailId, this.accusedPersons);

      } else if (accusedCount > 1) {
        // Multiple accused: Update por_detail with first accused and insert all into accused_persons
        const firstAccused = this.accusedPersons[0];

        let sign = "";
        if (firstAccused.signatureImage != null) {
          sign = firstAccused.signatureImage;
        }

        await this.sqliteService.updateAccusedFieldsInPorDetail(
          porDetailId,
          firstAccused.name,
          firstAccused.fathersName,
          firstAccused.cast.toString(),
          firstAccused.address,
          firstAccused.age,
          firstAccused.jati_name,
          firstAccused.mobile_number
        );
        await this.sqliteService.deleteAccusedPersonsByPorId(porDetailId);
        await this.sqliteService.insertMultipleAccusedPersons(porDetailId, this.accusedPersons);
      }
    } catch (error) {
      throw error;
    }
  }
  //Major code added by sandeep pansari end 1 Date 9 28 25

  setActualDharayenAccrodingToHeadSelection(selected: any) {

    this.selectedDharaHeadYear = selected.dharaYear;

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

  }

  loginedOfficerDesignationId: string = "0";
  loginedOfficerEmpId: number = 0;
  loginedOfficerCircleId: string = "0";
  loginedOfficerDivisionId: string = "0";
  loginedOfficerSubDivisionId: string = "0";
  loginedOfficerRangId: string = "0";
  loginedOfficerSubRangId: string = "0";
  loginedOfficerBeatId: string = "0";

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

      this.loginedOffierEmpId = userData.emp_id;

      const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
      this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

      if (userData.designation_id === "5") {
        this.isBG = true;
      } else if (userData.designation_id === "6") {
        this.isRA = true;
      }

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

      if (this.loginedOfficerDesignationId === "5") {
        this.selectedCrimeBeat = Number(this.listOfBeat[0].id);
        this.selectedCrimeBeatName = this.listOfBeat[0].name;

        const rawCompartment = this.listOfBeat[0]?.compartment_no?.[0] ?? '';

        this.listOfCompartment = rawCompartment
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
          .map((name: string) => ({ name }));
      }

      if (castMasterType.value) {

        this.listOfCast = JSON.parse(castMasterType.value);

        const firstData = this.porDataList;
        //this.selectedAccusedCast = Number(firstData.accusedCast);

      }

      const rawCompartment = this.listOfBeat[0]?.compartment_no?.[0] ?? '';

      this.listOfCompartment = rawCompartment
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .map((name: string) => ({ name }));


      this.setComingDataIntoHtml();


    }

  }

  isVahanFound: boolean = false;

  async setComingDataIntoHtml() {
    const data = history.state['data'];  // works even after navigation

    if (data) {

      this.porDataList = JSON.parse(data) as PorData;

      const firstData = this.porDataList;
       ;

      if (firstData.is_beat_nirikshan === "0") {

        this.isBeatNirikshan = false;

      } else {

        this.isBeatNirikshan = true;

      }


      this.idToUpdate = firstData.id;

      if (firstData.isAccusedFound === "0") {
        this.isAccusedFound = false;
        this.accusedPersons = [];
      } else {
        this.isAccusedFound = true;

        // Load existing accused persons from database
        const existingAccusedPersons = await this.sqliteService.getAccusedPersonsByPorId(firstData.id);

        if (existingAccusedPersons && existingAccusedPersons.length > 0) {
          this.accusedPersons = existingAccusedPersons.map(person => ({
            name: person.accused_name,
            fathersName: person.accused_fathers_name,
            cast: Number(person.accused_cast),
            address: person.accused_address,
            signatureImage: person.signature_image,
            age: person.age,
            jati_name: person.jati_name,
            mobile_number : person.mobile_number
          }));

          // Set first accused person's data to single fields for backward compatibility
          this.accussedName = this.accusedPersons[0].name;
          this.accussedFatherName = this.accusedPersons[0].fathersName;
          this.address = this.accusedPersons[0].address;
          this.selectedAccusedCast = Number(this.accusedPersons[0].cast);
          this.accussedAge = this.accusedPersons[0].age;
        } else {
          // Fallback to single accused data from por_detail //doubtfull
          this.accussedName = firstData.accusedName;
          this.accussedFatherName = firstData.accusedFathersName;
          this.address = firstData.accusedAddress;
          this.selectedAccusedCast = Number(firstData.accusedCast);
          this.accussedAge = this.accusedPersons[0].age;

          // Create single accused person entry
          if (this.accussedName && this.accussedName.trim() !== '') {
            this.accusedPersons = [{
              name: this.accussedName,
              fathersName: this.accussedFatherName,
              cast: this.selectedAccusedCast?.toString() || '',
              address: this.address,
              signatureImage: '',
              age: '',
              jati_name: '',
              mobile_number : this.accussedMobile
            }];
          }
        }
      }

      //Major code added by sandeep pansari end 1 Date 9 28 25

      this.apradhi_photo = firstData.apradhi_photo;
      this.por_photo = firstData.por_photo;
      this.signatureImage = firstData.complainer_sign;

      this.supurd_nama_photo = firstData.supurd_nama_photo;
      this.japti_nama_photo = firstData.japti_nama_photo;
      this.panch_nama_photo = firstData.panch_nama_photo;

      this.selectedCrimType = Number(firstData.typeOfCrime);
      this.crimeDate = firstData.dateOfCrime;

      this.por_number = firstData.por_number;

      this.clipboardCompartment = firstData.compartment_number.split(',')
        .map((comp: string) => ({ name: comp.trim() }));

      this.clipboardDharas = firstData.crime_dhara.split(",").map((part: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: (x: any) => any): [any, any]; new(): any; }; }; }) => {
        const [extraInfo, name] = part.split(" - ").map(x => x.trim());
        return {
          id: crypto.randomUUID(), // or any unique generator you want
          name,
          extraInfo
        };
      });

      this.lat = firstData.lat;
      this.lon = firstData.lng;
      this.current_location_google_addres = firstData.map_address

      this.witness_first_name = firstData.name_of_witness_one;
      this.witness_address_first = firstData.address_of_witness_one;

      this.witness_second_name = firstData.name_of_witness_two;
      this.witness_address_second = firstData.address_of_witness_two;


      this.crimePlace = firstData.placeOfCrime;

      this.listOfjaptiSaman = JSON.parse(firstData.saman_detail);

      this.filterItems();

      this.otherJaptaSamanDetail = firstData.detailsOfSeizedGoods;

      if (firstData.photo_name_comma_separated && firstData.photo_name_comma_separated.trim() !== '') {

        const photoString = firstData.photo_name_comma_separated;

        if (photoString && photoString.trim() !== "") {
          this.photos = photoString.split(/,(?=data:image)/g);
        }

      }

      if (this.loginedOfficerDesignationId === "6") {

        this.selectedCrimeBeat = Number(firstData.beat_id);

        const beat = this.listOfBeat.find((b: { id: number; }) => b.id === Number(firstData.beat_id));
        this.selectedCrimeBeatName = beat ? beat.name : '';

        const rawCompartment = beat.compartment_no;

        this.listOfCompartment = rawCompartment
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
          .map((name: string) => ({ name }));
      }

      this.complainer_pad = firstData.complainer_pad;
      this.japt_karne_wale_adhikari_ka_name = firstData.complainer_name;
      this.japt_karne_wale_adhikari_ka_pad = firstData.complainer_pad;
      this.chinhaPhoto = firstData.mark_image_ankit_on_japt_saman;
      if (firstData.is_supurddar_and_japtikarta_same === "0") {
        this.isJaptikartaAndSupurdarSame = false;
      }
      this.supurddar_ka_name = firstData.supurdar_ka_name;
      this.supurddar_ka_pita_ka_name = firstData.supurdar_ka_father;
      this.supurddar_ka_jati = firstData.supurdar_ka_jati;
      this.supurddar_ka_vyavsay = firstData.supurdar_ka_vyavsay;
      this.supurddar_ka_full_address = firstData.supurdar_ka_poora_pata;
      this.supurd_me_lene_ka_dinank = firstData.supurdar_me_lene_ka_date;
      this.japtinama_anya_vishesh_vivran = firstData.japtinama_any_vishesh_vivran;

      this.witness1Sign = firstData.sign_of_witness_one;
      this.witness2Sign = firstData.sign_of_witness_two;

      this.listOfVahanDetail = await this.sqliteService.getVahanDetailByPorId(firstData.id);

      if (this.listOfVahanDetail && this.listOfVahanDetail.length > 0) {
        this.isVahanFound = true;
      }

    }
  }

  onSingleAccusedFieldChange() {
    // Update the first accused person in the array
    if (this.accusedPersons.length > 0) {
      this.accusedPersons[0] = {
        name: this.accussedName,
        fathersName: this.accussedFatherName,
        cast: this.selectedAccusedCast?.toString() || '',
        address: this.address,
        signatureImage: '',
        age: this.accussedAge,
        jati_name: this.accussed_jati_name,
        mobile_number: this.accussedMobile
      };
    } else if (this.isAccusedFound) {
      // Create first accused person if array is empty
      this.accusedPersons = [{
        name: this.accussedName,
        fathersName: this.accussedFatherName,
        cast: this.selectedAccusedCast?.toString() || '',
        address: this.address,
        signatureImage: '',
        age: this.accussedAge,
        jati_name: this.accussed_jati_name,
        mobile_number: this.accussedMobile
      }];
    }
  }

  onAccusedPersonChange(index: number) {
    // If it's the first accused person, update the single fields
    if (index === 0) {
      this.updateSingleFieldsFromFirstAccused();
    }
  }

  onRadioChange(event: any) {
    this.isAccusedFound = event.detail.value
  }

  filePath: string = "";

  loginedOffierEmpId: number = 0;
  isBG: boolean = false;
  isRA: boolean = false;

  // async getLoginedOfficerDetail() {
  //   const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

  //   if (value) {
  //     const userData = JSON.parse(value) as Users;
  //     this.loginedOffierEmpId = userData.emp_id;

  //     const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
  //     this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

  //     if (userData.designation_id === "5") {
  //       this.isBG = true;
  //     }

  //   }
  // }


  onSelectBeat(selected: any) {

    this.listOfCompartment = [];

    const selectedId = selected.id ?? selected; // works if you get object or string

    this.selectedCrimeBeatName = selected.name;
    this.selectedCrimeBeat = Number(selected.id);

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


  selectedCompartment(selected: any) {
    const selectedName = selected.name ?? selected;

    // Avoid duplicates
    if (!this.clipboardCompartment.some(d => d.name === selectedName)) {
      this.clipboardCompartment.push({ name: selectedName });
    }
  }

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

  }

  isLoading: boolean = false;
  loadingMessage: string = "";

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  async onSelecteCrimDate() {

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
        this.crimeDate = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  async takeJaptinamaPhoto() {

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
      this.japti_nama_photo = image.dataUrl;
    }

  }

  async takeSupurdNamaPhoto() {

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
      this.supurd_nama_photo = image.dataUrl;
    }

  }

  async showPermissionAlert(msg: string) {
    const modal = await this.modalCtrl.create({
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

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  removePhoto(index: number) {
    this.photos.splice(index, 1);
  }


  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }


  async takePic() {
    if (this.photos.length >= 3) {
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
      this.photos.push(image.dataUrl); // ✅ Safe now
    }
  }

  async takePanchaNamaPhoto() {

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
      this.panch_nama_photo = image.dataUrl;
    }

  }

  removeDhara(id: string) {
    this.clipboardDharas = this.clipboardDharas.filter(d => d.id !== id);
  }

  removeCompartment(name: string) {
    this.clipboardCompartment = this.clipboardCompartment.filter(c => c.name !== name);
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  setJaptKarnewaleAdhikariKaPadVariable() {
    this.japt_karne_wale_adhikari_ka_pad = this.complainer_pad;
  }

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


  async takeChinhaImage() {

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
      this.chinhaPhoto = image.dataUrl;
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

  showWitnessPersonSignPadOrNot(): Boolean {
    if (this.witness_first_name != "") {
      return true;
    }
    return false;
  }

  async openSignaturePadForApradhi(row: any) {
    const modal = await this.modalCtrl.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      row.signatureImage = data.signature;
    }
  }

  witness1Sign: string = "";
  witness2Sign: string = "";

  async openSignaturePadForSakshi(value: Number) {

    const modal = await this.modalCtrl.create({
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

  onRadioChangeOfisJaptikartaAndSupurdarSame(event: any) {
    this.isJaptikartaAndSupurdarSame = event.detail.value
  }

  async onSelecteSupurdMeLeneKaDinank() {

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
        this.supurd_me_lene_ka_dinank = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }

  async openSignaturePadForSupurddar() {

    const modal = await this.modalCtrl.create({
      component: SignaturePageComponent,
      cssClass: 'signature-modal-fullscreen',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed) {
      // You can now show it or upload it
      this.signatureImageSupurddar = data.signature;
    }

  }

  signatureImageSupurddar: string = "";

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
      if_not_yogya_then_reason: string
    }[] = [];

  addOtherJaptSamanDetail() {
     ;
    this.listOfOtherJaptSamanDetail.push({
      jabti_saman_type: '3', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', if_not_yogya_then_reason: ''
    });
  }

  removeOtherJaptiSaman(index: number) {
    if (index > -1 && index < this.listOfOtherJaptSamanDetail.length) {
      this.listOfOtherJaptSamanDetail.splice(index, 1);
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
      kasth_halat: number
    }[] = [];


  addBalliInfo() {
    this.listOfBalliDetail.push({
      jabti_saman_type: '6', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0
    });
  }

  removeBalliInfo(index: number) {
    if (index > -1 && index < this.listOfBalliDetail.length) {
      this.listOfBalliDetail.splice(index, 1);
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

  allowOnlyRangePatternForWarg(event: KeyboardEvent) {
    const allowed = /^[0-9-]$/;   // Only numbers and dash

    if (!allowed.test(event.key)) {
      event.preventDefault();  // BLOCK letters like "r" or "e"
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

  get totalBalligNag(): number {
    return this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
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

  get totalOtherJaptSamanNag(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  onRadioChangeIsVahanFound(event: any) {
    this.isVahanFound = event.detail.value;
  }

  get totalOtherJaptSamanGhanMeter(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    );
  }


}
