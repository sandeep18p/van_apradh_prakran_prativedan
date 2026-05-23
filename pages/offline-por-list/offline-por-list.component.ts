import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, resolveForwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardContent, IonButton, IonRefresher, IonRefresherContent, IonSpinner, IonFab, IonFabButton, IonIcon, IonCard, IonGrid, IonCol, IonRow, IonLoading, IonMenuButton, IonButtons, IonMenu, IonAvatar, IonLabel, IonList, IonMenuToggle, IonItem, IonText, IonSplitPane, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { addIcons } from 'ionicons';
import { add, addOutline, addSharp, arrowBack, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { NetworkCheckService } from 'src/app/services/network_services/network-check.service';
import { ModalController, NavController } from '@ionic/angular/standalone';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { Router } from '@angular/router';
import { Toast } from '@capacitor/toast';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { ApproveRejectComponent } from 'src/app/dialogs/approve-reject/approve-reject.component';
import { AssignRaByRoComponent } from 'src/app/dialogs/assign-ra-by-ro/assign-ra-by-ro.component';

import { Platform } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/DatabaseService.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { first } from 'rxjs';
import { ComplainDetails, JaptSamanItem } from '../officer-dashboard/GetDashboardResponse.model';
//import { ImagePreviewOfflineModalComponent } from 'src/app/dialogs/image-preview-offline-modal/image-preview-offline-modal.component';

import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';



@Component({
  selector: 'app-offline-por-list',
  templateUrl: './offline-por-list.component.html',
  styleUrls: ['./offline-por-list.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonButton, IonRefresher, IonRefresherContent, IonSpinner, IonFab, IonFabButton, IonIcon, IonCard, IonGrid, IonCol, IonRow, IonLoading, IonMenuButton, IonButtons, IonMenu, IonAvatar, IonLabel, IonList, IonMenuToggle, IonItem, IonText, IonSplitPane, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})

export class OfflinePorListComponent implements OnInit {

  fullphotosBase64: string[] = [];

  isLoading: boolean = false;
  loadingMessage: string = ""

  offlineDataCount: number = 0;
  isOfflineDataExist: boolean = false;
  porDataList: {
    id: number,
    isAccusedFound: string,
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
    full_photo_name_comma_separated: string;
    saman_detail: string,
    panch_nama_photo: string,
    japti_nama_photo: string,
    supurd_nama_photo: string,
    complainer_name: string,
    apradhi_photo: string,
    por_photo: string,
    complainer_sign: string,
    complainer_pad: string,
    sign_of_witness_one: string,
    sign_of_witness_two: string,
    mark_image_ankit_on_japt_saman: string,
    is_supurddar_and_japtikarta_same: string,
    supurdar_ka_name: string,
    supurdar_ka_father: string,
    supurdar_ka_jati: string,
    supurdar_ka_vyavsay: string,
    supurdar_ka_poora_pata: string,
    supurdar_me_lene_ka_date: string,
    japtinama_any_vishesh_vivran: string,
    supurddar_sign: string,
    japtikarta_ka_name: string,
    japtikarta_ka_pad: string,
    is_beat_nirikshan: string

  }[] = [];


  // Add accused persons mapping //ADDEDHTML
  //Code Added by sandeep start 1 method for accused person mapping
  accusedPersonsMap: {
    [porId: number]: {
      id: number,
      por_detail_id: number,
      accused_name: string,
      accused_fathers_name: string,
      accused_cast: string,
      accused_address: string,
      signature_image: string,
      age: string,
      jati_name: string,
      mobile_number: string
    }[]
  } = {};
  //Code Added by sandeep end 1 method for accused person mapping
  constructor(
    private router: Router,
    private sharedService: SharedserviceService, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef, private modalCtrl: ModalController, private networkCheckService: NetworkCheckService, private sanitizer: DomSanitizer, private navController: NavController, private langService: LanguageServiceService, private sqliteService: DatabaseService) {
    addIcons({ arrowBack, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    //this.loadPorData(false);
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  private firstTimeLoaded = false;

  ionViewWillEnter() {

    if (!this.firstTimeLoaded) {
      this.firstTimeLoaded = true;
      this.loadPorData(false);
      return
    }

    if (this.sharedService.getRefresh()) {
      this.loadPorData(false);
      this.sharedService.setRefresh(false);
    }

  }

  async loadPorData(shouldGoToUpload: boolean) {

    await this.sqliteService.initDB(); // Ensure DB is ready

    try {

      this.porDataList = await this.sqliteService.getPorData();


      for (let i = 0; i < this.porDataList.length; i++) {

        const porItem = this.porDataList[i];

        const accusedPersons = await this.sqliteService.getAccusedPersonsByPorId(porItem.id);

        this.accusedPersonsMap[porItem.id] = accusedPersons;

      }

      if (this.porDataList.length > 0) {
        this.offlineDataCount = this.porDataList.length;
        this.isOfflineDataExist = true;

        for (let i = 0; i < this.porDataList.length; i++) {
          const photoString = this.porDataList[i].full_photo_name_comma_separated;

          if (photoString && photoString.trim() !== "") {
            const firstPhoto = photoString.split(/,(?=data:image)/g);
            this.porDataList[i].full_photo_name_comma_separated = firstPhoto[0] || "";
          } else {
            this.porDataList[i].full_photo_name_comma_separated = "";
          }
        }
        if (shouldGoToUpload) {
          this.submitCrimDetail(0);
        }

      } else {
        this.offlineDataCount = 0;
        this.isOfflineDataExist = false;
        this.cdRef.detectChanges();
        this.goBack();
      }
    } catch (error) {
    }

    this.getLoginedOfficerDetail();
  }

  //ADDEDHTML 
  getAccusedPersons(porId: number) {
    return this.accusedPersonsMap[porId] || [];
  }

  //ADDEDHTML 
  getAccusedCount(porId: number): number {
    return this.getAccusedPersons(porId).length;
  }
  //ADDEDHTML 
  getAccusedDisplayText(porId: number): string {
    const count = this.getAccusedCount(porId);
    if (count === 0) return 'अज्ञात अपराधी';
    if (count === 1) return '1 अपराधी';
    return `${count} अपराधी`;
  }

  //Code Added by sandeep end 3 replaced loadPorData to new loadPorData and added some functions too

  goBack() {
    this.navController.back();
  }

  showImage(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

  async submitCrimDetail(index: number) {
    if (await this.networkCheckService.getCurrentStatus()) {
      if (this.porDataList.length > 0) {

        let singleData = this.porDataList[index];

        const formData = new FormData();

        // Text fields
        formData.append('is_accused_found', singleData.isAccusedFound);
        formData.append('accusedName', singleData.accusedName);
        formData.append('accusedFathersName', singleData.accusedFathersName);
        formData.append('accusedCast', singleData.accusedCast.toString());
        formData.append('accusedAddress', singleData.accusedAddress.toString());
        formData.append('typeOfCrime', singleData.typeOfCrime.toString());
        formData.append('placeOfCrime', singleData.placeOfCrime.toString());
        formData.append('dateOfCrime', singleData.dateOfCrime);
        formData.append('detailsOfSeizedGoods', singleData.detailsOfSeizedGoods?.toString() || 'NA');

        formData.append('name_of_witness_one', singleData.name_of_witness_one?.toString().trim() || 'NA');
        formData.append('name_of_witness_two', singleData.name_of_witness_two?.toString().trim() || 'NA');

        formData.append('address_of_witness_one', singleData.address_of_witness_one?.toString() || 'NA');
        formData.append('address_of_witness_two', singleData.address_of_witness_two?.toString() || 'NA');


        formData.append('createdBy', singleData.createdBy.toString());

        formData.append('circle_id', singleData.circle_id.toString());
        formData.append('division_id', singleData.division_id.toString());
        formData.append('sub_division_id', singleData.sub_division_id.toString());
        formData.append('range_id', singleData.range_id.toString());
        formData.append('sub_rang_id', singleData.sub_rang_id.toString());
        formData.append('beat_id', singleData.beat_id.toString());
        formData.append('compartment_number', singleData.compartment_number.toString());

        formData.append('crime_dhara', singleData.crime_dhara);

        formData.append('por_number', singleData.por_number);

        formData.append('lat', singleData.lat);
        formData.append('lng', singleData.lng);

        formData.append('map_address', singleData.map_address);

        const photoString = singleData.full_photo_name_comma_separated;

        if (photoString && photoString.trim() !== "") {
          this.fullphotosBase64 = photoString.split(/,(?=data:image)/g);
        }

        if (this.fullphotosBase64.length > 0) {
          // Image files from photos[] array
          for (let i = 0; i < this.fullphotosBase64.length; i++) {
            const blob = this.dataURLtoBlob(this.fullphotosBase64[i]);
            formData.append('listOfFile', blob, `photo_${i + 1}.jpg`);
          }
        }

        const blobJaptinamaPhoto = this.dataURLtoBlob(singleData.japti_nama_photo);
        formData.append('japtinama_photo', blobJaptinamaPhoto, `photo_japtinama.jpg`);

        if (singleData.supurd_nama_photo && singleData.supurd_nama_photo.trim() !== "") {
          const blobSupurdnamaPhoto = this.dataURLtoBlob(singleData.supurd_nama_photo);
          formData.append('supurnama_photo', blobSupurdnamaPhoto, 'photo_supurdnama.jpg');
        }


        if (singleData.complainer_sign != null) {
          const blobSignaturePhoto = this.dataURLtoBlob(singleData.complainer_sign);
          formData.append('complainer_sign', blobSignaturePhoto, `photo_complainer_sign.jpg`);
        } else {
          formData.append('complainer_sign', "");
        }

        const blobPanchNamaPhoto = this.dataURLtoBlob(singleData.panch_nama_photo);
        formData.append('panchnama_photo', blobPanchNamaPhoto, `photo_panchnama.jpg`);


        formData.append('Saman_Detail', singleData.saman_detail);

        const data: any = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        this.showDialog('शिकायत जमा किया जा रहा है कृपया इंतजार करें');
        this.apiService.submitCrimData(formData).subscribe(
          async (response) => {

            this.dismissDialog();

            if (response.response.code === 200) {
              this.sharedService.setRefresh(true);
              const deleted = await this.sqliteService.deletePorDetailByPorNumber(singleData.por_number);
              if (deleted) {
                this.loadPorData(true);
              }

            } else {
              this.longToast(response.response.msg);
            }

          },
          (error) => {
            this.dismissDialog();
            this.longToast(error);
          }
        );
      } else {
        this.loadPorData(true);
      }


    } else {
      this.showError("इंटरनेट उपलब्ध नहीं है |");
    }
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

  cancel() {
    this.goBack();
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

  // helper maps
  samanTypeMap: Record<string, string> = {
    "1": "ठूंठ",
    "2": "लट्ठा",
    "3": "Other",
    "4": "चिरान",
    "5": "चट्टा",
    "6": "बल्ली",
  };

  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' },
    { id: 4, name: 'बल्ली' },
    { id: 5, name: 'अन्य' }
  ];

  getJaptisamanList(samanDetails: string): (JaptSamanItem & { can_delete: boolean, compartment_number:string })[] {


    const listOfSaman: (JaptSamanItem & { can_delete: boolean, compartment_number:string })[] = JSON.parse(samanDetails)
      .map((item: any, index: number) => {
        const prajati = this.listOfWoodPrajati.find(
          (p: any) => p.id === Number(item.prajati_type)
        );

        const kasthHalat = this.kasthHalatList.find(
          (p: any) => p.id === Number(item.kasth_halat)
        );

        return {
          jabti_saman_type: item.jabti_saman_type,
          actual_name_of_saman: this.samanTypeMap[item.jabti_saman_type] ?? "",
          saman_table_id: (index + 1).toString(),
          prajati_name: prajati ? prajati.name : "",
          prajati_type: item.prajati_type,
          lambai: item.lambai,
          golai: item.golai,
          ghan_meter: item.ghan_meter,
          nag: item.nag,
          dar: item.dar,
          total_cost: item.total_cost,
          if_other_then_detail: item.if_other_then_detail,
          one_golai_less: '',
          form_factor: '',
          motai: item.motai,
          unchai: item.unchai,
          kasth_halat: item.kasth_halat,
          kasth_halat_name: kasthHalat ? kasthHalat.name : "",
        };
      });

    return listOfSaman;

  }

  async viewDetail(clickedIndex: number) {

    const porItem = this.porDataList[clickedIndex];

    // Get accused persons for this POR
    // In the viewDetail method, transform the data:
    //Added by sandeep to support view of multple accused 1 start
    const accusedPersons = this.getAccusedPersons(porItem.id).map(person => ({
      name: person.accused_name,
      fathersName: person.accused_fathers_name,
      address: person.accused_address,
      cast: person.accused_cast,
      signatureImage: person.signature_image,
      base64: "",
      accussed_person_table_id: "",
      age: person.age,
      jati_name: person.jati_name,
      mobile_number: person.mobile_number,
      show_delete_button: true
    }));
     ;
    let vahanDetail = await this.sqliteService.getVahanDetailByPorId(porItem.id);

    //Added by sandeep to support view of multple accused 1 end
    const complainDetails: ComplainDetails = {
      is_accused_found: porItem.isAccusedFound,
      total_japt_saman_costing: "",
      ra_name: "",
      complain_created_by: "",
      beat_name: "", // No equivalent in porDataList, set empty or fetch elsewhere
      complain_id: porItem.id.toString(),
      transferd_to: "",
      complain_history_table_id: "",
      complain_status: "",
      complain_status_text: "",
      current_stage: "",
      stage_name: "",
      accused_name: porItem.accusedName,
      accused_fathers_name: porItem.accusedFathersName,
      cast_name: porItem.accusedCast,
      crime_type: "", // Not present in porDataList
      accused_address: porItem.accusedAddress,
      type_of_crime: porItem.typeOfCrime,
      place_of_crime: porItem.placeOfCrime,
      date_of_crime: porItem.dateOfCrime,
      details_of_seized_goods: porItem.detailsOfSeizedGoods,
      show_approve_reject_button: "",
      imageUrl: porItem.photo_name_comma_separated,
      lat: porItem.lat,
      lng: porItem.lng,
      map_address: porItem.map_address,
      all_image_name: porItem.full_photo_name_comma_separated,
      name_of_witness_one: porItem.name_of_witness_one,
      name_of_witness_two: porItem.name_of_witness_two,
      address_of_witness_one: porItem.address_of_witness_one,
      address_of_witness_two: porItem.address_of_witness_two,
      button_text: "",
      complain_progress_stage: "",
      por_number: porItem.por_number,
      compartment_number: porItem.compartment_number,
      crime_dhara: porItem.crime_dhara,
      left_days_to_resolve_por: "",
      japtSamanList: this.getJaptisamanList(porItem.saman_detail),
      japti_nama_photo: porItem.japti_nama_photo,
      supurd_nama_photo: porItem.supurd_nama_photo,
      panch_nama_photo: porItem.panch_nama_photo,
      complainer_name: porItem.complainer_name,
      finalWorkLogDetailByRa: [],
      // Populate if you have saman_detail parsing
      //Added by sandeep to support view of multple accused 2 start
      accusedPersons: accusedPersons,
      accused_count: accusedPersons.length,
      assigner_remark: "",
      circle_name: "",
      division_name: "",
      sub_division_name: "",
      range_name: "",
      sub_range_name: "",
      is_complain_created_by_ra: "",
      apradhi_photo: porItem.apradhi_photo,
      por_photo: porItem.por_photo,
      complainer_sign: porItem.complainer_sign,
      complainer_pad: porItem.complainer_pad,
      witness_1_sign: porItem.sign_of_witness_one,
      witness_2_sign: porItem.sign_of_witness_two,
      chinhaPhoto: porItem.mark_image_ankit_on_japt_saman,
      isJaptikartaAndSupurdarSame: porItem.is_supurddar_and_japtikarta_same,
      supurddar_ka_name: porItem.supurdar_ka_name,
      supurddar_ka_pita_ka_name: porItem.supurdar_ka_father,
      supurdar_ka_jati: porItem.supurdar_ka_jati,
      supurddar_ka_vyavsay: porItem.supurdar_ka_vyavsay,
      supurdar_ka_poora_pata: porItem.supurdar_ka_poora_pata,
      supurd_me_lene_ka_dinank: porItem.supurdar_me_lene_ka_date,
      japtinama_anya_vishesh_vivran: porItem.japtinama_any_vishesh_vivran,
      supurddar_sign: porItem.supurddar_sign,
      japtikarta_ka_name: porItem.japtikarta_ka_name,
      japtikarta_ka_pad: porItem.japtikarta_ka_pad,
      shesh_vasuli_rashi: "",
      is_japt_vahan: "",
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
      actual_crime_date: '',
      vahan_detail: JSON.stringify(vahanDetail),
      is_beat_nirikshan: '',
      compartment_option: '',
      focr_number: '',
      focr_date: '',
      transferd_by: '',
      beat_id: '',
      listOfWitness: []
    };

    var jsonData = JSON.stringify(complainDetails);

    this.router.navigateByUrl('/view-one-offline-data-detail', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  async editData(index: number) {


    let singleData = this.porDataList[index];

    const jsonData = JSON.stringify(singleData);

    this.router.navigateByUrl('/edit-offline-complain-detail', {
      state: { data: jsonData },
      replaceUrl: false
    });

  }

  async submitToOnline(index: number) {

    if (await this.networkCheckService.getCurrentStatus()) {
      if (this.porDataList.length > 0) {

        let singleData = this.porDataList[index];

        const formData = new FormData();

        // Text fields
        formData.append('is_accused_found', singleData.isAccusedFound);

        formData.append('typeOfCrime', singleData.typeOfCrime.toString());
        formData.append('placeOfCrime', singleData.placeOfCrime.toString());
        formData.append('dateOfCrime', singleData.dateOfCrime);
        formData.append('detailsOfSeizedGoods', singleData.detailsOfSeizedGoods?.toString() || 'NA');

        formData.append('name_of_witness_one', singleData.name_of_witness_one?.toString().trim() || 'NA');
        formData.append('name_of_witness_two', singleData.name_of_witness_two?.toString().trim() || 'NA');

        formData.append('address_of_witness_one', singleData.address_of_witness_one?.toString() || 'NA');
        formData.append('address_of_witness_two', singleData.address_of_witness_two?.toString() || 'NA');

        const vahanDetail = await this.sqliteService.getVahanDetailByPorId(singleData.id);

        if (vahanDetail && vahanDetail.length > 0) {
          formData.append('is_japt_vahan', "1");
          formData.append('japt_vahan_detail', JSON.stringify(vahanDetail));
        } else {
          formData.append('japt_vahan_detail', "");
          formData.append('is_japt_vahan', "0");
        }

        formData.append('is_beat_nirikshan', singleData.is_beat_nirikshan);

        if (singleData.sign_of_witness_one && singleData.sign_of_witness_one.trim() !== "") {
          const blobImage = this.dataURLtoBlob(singleData.sign_of_witness_one);
          formData.append('first_witness_sign', blobImage, 'photo_first_witness_sign.jpg');
        }

        if (singleData.sign_of_witness_two && singleData.sign_of_witness_two.trim() !== "") {
          const blobImage = this.dataURLtoBlob(singleData.sign_of_witness_two);
          formData.append('second_witness_sign', blobImage, 'photo_second_witness_sign.jpg');
        }

        formData.append('createdBy', singleData.createdBy.toString());

        formData.append('circle_id', singleData.circle_id.toString());
        formData.append('division_id', singleData.division_id.toString());
        formData.append('sub_division_id', singleData.sub_division_id.toString());
        formData.append('range_id', singleData.range_id.toString());
        formData.append('sub_rang_id', singleData.sub_rang_id.toString());
        formData.append('beat_id', singleData.beat_id.toString());
        formData.append('compartment_number', singleData.compartment_number.toString());

        formData.append('crime_dhara', singleData.crime_dhara);

        formData.append('por_number', singleData.por_number);

        formData.append('lat', singleData.lat);
        formData.append('lng', singleData.lng);

        formData.append('map_address', singleData.map_address);

        const photoString = singleData.full_photo_name_comma_separated;

        if (photoString && photoString.trim() !== "") {
          this.fullphotosBase64 = photoString.split(/,(?=data:image)/g);
        }

        if (this.fullphotosBase64.length > 0) {

          for (let i = 0; i < this.fullphotosBase64.length; i++) {
            const blob = this.dataURLtoBlob(this.fullphotosBase64[i]);
            formData.append('listOfFile', blob, `photo_${i + 1}.jpg`);
          }

        }

        const blobJaptinamaPhoto = this.dataURLtoBlob(singleData.japti_nama_photo);
        formData.append('japtinama_photo', blobJaptinamaPhoto, `photo_japtinama.jpg`);

        if (singleData.supurd_nama_photo && singleData.supurd_nama_photo.trim() !== "") {
          const blobSupurdnamaPhoto = this.dataURLtoBlob(singleData.supurd_nama_photo);
          formData.append('supurnama_photo', blobSupurdnamaPhoto, 'photo_supurdnama.jpg');
        }

        if (singleData.complainer_sign != null) {
          const blobSignaturePhoto = this.dataURLtoBlob(singleData.complainer_sign);
          formData.append('complainer_sign', blobSignaturePhoto, `photo_complainer_sign.jpg`);
        } else {
          formData.append('complainer_sign', "");
        }

        if (singleData.por_photo && singleData.por_photo.trim() !== "") {
          const blobPorPhoto = this.dataURLtoBlob(singleData.por_photo);
          formData.append('por_pic', blobPorPhoto, 'photo_por_photo.jpg');
        }

        if (singleData.apradhi_photo && singleData.apradhi_photo.trim() !== "") {
          const blobApadhiPhoto = this.dataURLtoBlob(singleData.apradhi_photo);
          formData.append('apradhi_pic', blobApadhiPhoto, 'photo_apradhi_photo.jpg');
        }

        if (singleData.mark_image_ankit_on_japt_saman && singleData.mark_image_ankit_on_japt_saman.trim() !== "") {
          const blobPhoto = this.dataURLtoBlob(singleData.mark_image_ankit_on_japt_saman);
          formData.append('ankit_mark_on_japt_saman', blobPhoto, 'photo_mark_image_ankit_on_japt_saman.jpg');
        }

        if (singleData.supurddar_sign && singleData.supurddar_sign.trim() !== "") {
          const blobPhoto = this.dataURLtoBlob(singleData.supurddar_sign);
          formData.append('supurddar_ka_sign', blobPhoto, 'photo_supurddar_signature_photo.jpg');
        }

        formData.append('japtikarta_ka_name', singleData.japtikarta_ka_name);
        formData.append('japtikarta_ka_pad', singleData.japtikarta_ka_pad);


        const blobPanchNamaPhoto = this.dataURLtoBlob(singleData.panch_nama_photo);
        formData.append('panchnama_photo', blobPanchNamaPhoto, `photo_panchnama.jpg`);

        formData.append('Saman_Detail', singleData.saman_detail);

        formData.append('complainer_name', singleData.complainer_name);

        formData.append('complainer_pad', singleData.complainer_pad);
        formData.append('vishesh_vivran_on_japtanama', singleData.japtinama_any_vishesh_vivran);
        formData.append('is_supurddar_and_japtikarta_same', singleData.is_supurddar_and_japtikarta_same);
        formData.append('supurdar_ka_name', singleData.supurdar_ka_name);
        formData.append('supurdar_ka_father', singleData.supurdar_ka_father);
        formData.append('supurdar_ka_jati', singleData.supurdar_ka_jati);
        formData.append('supurdar_ka_vyavsay', singleData.supurdar_ka_vyavsay);
        formData.append('supurdar_ka_poora_pata', singleData.supurdar_ka_poora_pata);
        formData.append('supurdar_me_lene_ka_date', singleData.supurdar_me_lene_ka_date);

        const accusedPersons = this.getAccusedPersons(singleData.id);

        if (accusedPersons && accusedPersons.length > 0) {


          const accusedPersonsData: any[] = [];

          for (let i = 0; i < accusedPersons.length; i++) {

            const person = accusedPersons[i];

            let signBlob: Blob;


            if (person.signature_image && person.signature_image.trim() !== "") {
              signBlob = this.dataURLtoBlob(person.signature_image);
            } else {
              // Create an empty placeholder blob
              signBlob = new Blob([], { type: 'image/jpeg' });
            }

            // Append to FormData (always — even if empty)
            formData.append('listOfAccussedSign', signBlob, `photo_${i + 1}.jpg`);

            accusedPersonsData.push({
              Name: person.accused_name || "",
              FathersName: person.accused_fathers_name || "",
              Address: person.accused_address || "",
              Cast: person.accused_cast || "",
              Age: person.age || "",
              ActualCast: person.jati_name || "",
              mobile_number: person.mobile_number || ""
            });

          }

          formData.append('accusedName', accusedPersonsData[0].Name);
          formData.append('accusedFathersName', accusedPersonsData[0].FathersName);
          formData.append('accusedCast', accusedPersonsData[0].Cast);
          formData.append('accusedAddress', accusedPersonsData[0].Address);

          formData.append('AccusedPersons', JSON.stringify(accusedPersonsData));
        } else {
          formData.append('accusedName', '');
          formData.append('accusedFathersName', '');
          formData.append('accusedCast', '');
          formData.append('accusedAddress', '');
          formData.append('AccusedPersons', JSON.stringify([]));
        }

        const data: any = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        this.showDialog('शिकायत जमा किया जा रहा है कृपया इंतजार करें');
        this.apiService.submitCrimData(formData).subscribe(
          async (response) => {
            this.dismissDialog();

            if (response.response.code === 200) {
              this.sharedService.setRefresh(true);

              const porId = await this.sqliteService.getPorIdByPorNumber(singleData.por_number);

              if (porId) {
                await this.sqliteService.deleteAccusedPersonsByPorId(porId);
              }

              const deleted = await this.sqliteService.deletePorDetailByPorNumber(singleData.por_number);

              if (deleted) {
                this.loadPorData(false);  // This just reloads data without auto-submitting
              }

            } else {
              this.showError(response.response.msg);
            }

          },
          (error) => {
             ;
            this.dismissDialog();
            this.longToast(error);
          }
        );
      } else {
        this.loadPorData(true);
      }


    } else {
      this.showError("इंटरनेट उपलब्ध नहीं है |");
    }

  }


  // listOfVahanDetail:
  //   {
  //     id: number,
  //     vahan_prakar: string;
  //     vahan_kramank: string,
  //     anumanit_mulya: string,
  //     malik_ka_name: string,
  //     malik_k_father_ka_name: string,
  //     pata: string,
  //     tahsil: string,
  //     jila: string,
  //     por_table_id: string
  //   }[] = [];

  async deleteData(por_number: string) {

    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'यह POR DELETE होने के पश्चात् ,आप वापिस से नहीं ला पाएंगे | क्या आप DELETE करना चाहते हैं ?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {

        //const deleted = await this.sqliteService.deletePorDetailById(clickedIndex);
        const porId = await this.sqliteService.getPorIdByPorNumber(por_number);

        // Delete accused persons first (if POR ID exists)
        if (porId) {
          await this.sqliteService.deleteAccusedPersonsByPorId(porId);
        }
        const deleted = await this.sqliteService.deletePorDetailByPorNumber(por_number);
        if (deleted) {
          this.loadPorData(false);
        }

      }
    });

    await modal.present();

  }

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

  listOfWoodPrajati: any = [];

  async getLoginedOfficerDetail() {

    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {

      const dharaData = await Preferences.get({ key: PreferenceKeys.dhara_data });
      const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

      if (prajatiName.value) {
        this.listOfWoodPrajati = JSON.parse(prajatiName.value);
      }

    }

  }


}