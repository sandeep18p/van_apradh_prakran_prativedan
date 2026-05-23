import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ComplainDetails, JaptSamanItem, VasuliViranDetailRequestModal } from '../officer-dashboard/GetDashboardResponse.model';
import { Toast } from '@capacitor/toast';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { IonicModule, Platform } from '@ionic/angular'; // Import IonicModule
import { TableModule } from 'primeng/table'; // Import TableModule
import { NgIf } from '@angular/common';  // 👈 add this
import { CommonModule } from '@angular/common';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { ActionSheetController, NavController, ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { ChallanDetailResponseModal } from '../show-ra-work-log/WorkLogResponseModal.modal';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-submit-parivahan-page',
  templateUrl: './submit-parivahan-page.component.html',
  styleUrls: ['./submit-parivahan-page.component.scss'],
  standalone: true,
  imports: [IonicModule, TableModule, NgIf, CommonModule, FormsModule, NgSelectModule]
})
export class SubmitParivahanPageComponent implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  loginedOfficerEmpId: number = 0;
  comingComplaintData!: ComplainDetails;
  toolbarTitle: string = "";
  challanDetailList: ChallanDetailResponseModal[] = [];


  prapt_lattha_kul_sankhya: number = 0;
  prapt_lattha_kul_aytan: number = 0;
  prapt_chiran_kul_sankhya: number = 0;
  prapt_chiran_kul_aytan: number = 0;
  prapt_balli_kul_sankhya: number = 0;
  prapt_balli_kul_aytan: number = 0;
  prapt_jalau_kul_sankhya: number = 0;
  prapt_jalau_kul_aytan: number = 0;
  prapt_anya_japt_samagree_kul_sankhya: number = 0;
  prapt_anya_japt_samagree_kul_aytan: number = 0;
  prapt_vanopaj_kul_sankhya: number = 0;
  prapt_vanopaj_kul_aytan: number = 0;
  prapt_bansh_kul_sankhya: number = 0;
  prapt_bansh_kul_aytan: number = 0;
  prapt_fencing_pol_kul_sankhya: number = 0;
  prapt_fencing_pol_kul_aytan: number = 0;


  dipo_parivahan_yogya_lattha_kul_sankhya: number = 0;
  dipo_parivahan_yogya_lattha_kul_aytan: number = 0;
  dipo_parivahan_yogya_chiran_kul_sankhya: number = 0;
  dipo_parivahan_yogya_chiran_kul_aytan: number = 0;
  dipo_parivahan_yogya_balli_kul_sankhya: number = 0;
  dipo_parivahan_yogya_balli_kul_aytan: number = 0;
  dipo_parivahan_yogya_jalau_kul_sankhya: number = 0;
  dipo_parivahan_yogya_jalau_kul_aytan: number = 0;
  dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya: number = 0;
  dipo_parivahan_yogya_anya_japt_samagree_kul_aytan: number = 0;
  dipo_parivahan_yogya_vanopaj_kul_sankhya: number = 0;
  dipo_parivahan_yogya_vanopaj_kul_aytan: number = 0;

  dipo_parivahan_yogya_bansh_kul_sankhya: number = 0;
  dipo_parivahan_yogya_bansh_kul_aytan: number = 0;
  dipo_parivahan_yogya_fencing_pol_kul_sankhya: number = 0;
  dipo_parivahan_yogya_fencing_pol_kul_aytan: number = 0;


  dipo_parivahit_lattha_kul_sankhya: number = 0;
  dipo_parivahit_lattha_kul_aytan: number = 0;
  dipo_parivahit_chiran_kul_sankhya: number = 0;
  dipo_parivahit_chiran_kul_aytan: number = 0;
  dipo_parivahit_balli_kul_sankhya: number = 0;
  dipo_parivahit_balli_kul_aytan: number = 0;
  dipo_parivahit_jalau_kul_sankhya: number = 0;
  dipo_parivahit_jalau_kul_aytan: number = 0;
  dipo_parivahit_anya_japt_samagree_kul_sankhya: number = 0;
  dipo_parivahit_anya_japt_samagree_kul_aytan: number = 0;
  dipo_parivahit_vanopaj_kul_sankhya: number = 0;
  dipo_parivahit_vanopaj_kul_aytan: number = 0;

  dipo_parivahit_bansh_kul_sankhya: number = 0;
  dipo_parivahit_bansh_kul_aytan: number = 0;
  dipo_parivahit_fencing_pol_kul_sankhya: number = 0;
  dipo_parivahit_fencing_pol_kul_aytan: number = 0;


  dipo_parivahan_hetu_shesh_lattha_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_lattha_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_chiran_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_chiran_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_balli_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_balli_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_jalau_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_jalau_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_vanopaj_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_vanopaj_kul_aytan: number = 0;

  dipo_parivahan_hetu_shesh_bansh_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh__bansh_kul_aytan: number = 0;
  dipo_parivahan_hetu_shesh_fencing_pol_kul_sankhya: number = 0;
  dipo_parivahan_hetu_shesh_fencing_pol_kul_aytan: number = 0;




  constructor(private languageService: LanguageServiceService, private navController: NavController, private modalCtrl: ModalController, private actionSheetController: ActionSheetController, private sharedService: SharedserviceService, private platform: Platform, private router: Router, private apiService: ApiServiceService, private cdRef: ChangeDetectorRef) {

    addIcons({ addCircleOutline, trashOutline, mapOutline, closeCircle, cameraOutline, arrowBack, locationOutline, refreshCircleOutline, calendarOutline, checkmarkCircleOutline, closeCircleOutline });

  }

  async ngOnInit() {

    this.getLoginedOfficerData();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    if (data) {
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;

      this.getJaptisamanList(this.comingComplaintData.japtSamanList);

      this.getWorkLog();

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

  async takeChallanPhoto(index: number) {
    // ss120326start
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Photo Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: async () => {
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
              source: CameraSource.Camera,
            });

            if (image?.dataUrl) {
              this.listOfChallanDetail[index].challan_image = image.dataUrl;
            }
          }
        },
        {
          text: 'Gallery',
          icon: 'images-outline',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 10,
              resultType: CameraResultType.DataUrl,
              source: CameraSource.Photos,
            });

            if (image?.dataUrl) {
              this.listOfChallanDetail[index].challan_image = image.dataUrl;
            }
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ],
    });

    await actionSheet.present();
    // ss120326end

  }

  async getLoginedOfficerData() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;
    }

  }

  vanopajTypeList = [
    { id: 2, name: 'लट्ठा' },
    { id: 4, name: 'चिरान' },
    { id: 6, name: 'बल्ली' },
    { id: 8, name: 'फेंसिंग पोल' },
    { id: 5, name: 'जलाऊ' },
    { id: 7, name: 'बाँस' },
    { id: 3, name: 'अन्य जप्त सामाग्री' }
  ];

  listOfChallanDetail:
    {
      challan_kramank: string;
      challan_date: string,
      total_matra_in_ghan_meter: string,
      depo_name: string,
      challan_image: string,
      challan_image_blob: Blob | null,
      vanopaj_type: number,
      total_matra_in_sankhya: string,
      is_ghanmter_readonly: boolean
    }[] = [];

  async getWorkLog() {

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getRAWorkLogList(this.comingComplaintData.complain_id).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          this.challanDetailList = [];
          this.challanDetailList = response.challan_detail;
          this.listOfVasuliViran = [];

          this.setTotalVariables();


        }

      },
      (error) => {
        this.dismissDialog();
      }
    );
  }

  listOfWoodPrajati: any = [];

  listOfjaptiSaman: JaptSamanItem[] = []

  samanTypeMap: Record<string, string> = {
    "1": "ठूंठ",
    "2": "लट्ठा",
    "3": "Other",
    "4": "चिरान",
    "5": "चट्टा",
    "6": "बल्ली"
  };

  getJaptisamanList(samanDetails: JaptSamanItem[]) {
    this.listOfjaptiSaman = samanDetails
      .map((item, index) => {
        const prajati = this.listOfWoodPrajati.find(
          (p: any) => p.id === Number(item.prajati_type)
        );


        return {
          jabti_saman_type: item.jabti_saman_type,
          actual_name_of_saman: this.samanTypeMap[item.jabti_saman_type] ?? "",
          saman_table_id: item.saman_table_id,
          prajati_name: prajati?.name ?? "",
          prajati_type: item.prajati_type,
          lambai: item.lambai,
          golai: item.golai,
          ghan_meter: item.ghan_meter,
          nag: item.nag,
          dar: item.dar,
          total_cost: item.total_cost,
          if_other_then_detail: item.if_other_then_detail,
          motai: item.motai,
          unchai: item.unchai,
          kasth_halat: item.kasth_halat,
          kasth_halat_name: item.kasth_halat_name,
          is_yogya_to_parivahan: item.is_yogya_to_parivahan,
          if_not_yogya_then_reason: item.if_not_yogya_then_reason
        } as JaptSamanItem;
      });



    if (this.listOfjaptiSaman.length > 0) {
      for (let i = 0; i < this.listOfjaptiSaman.length; i++) {

        const singleValue = this.listOfjaptiSaman[i];

        if (singleValue.jabti_saman_type === "2") { // LATTHA
          this.prapt_lattha_kul_sankhya = this.prapt_lattha_kul_sankhya + Number(singleValue.nag);
          this.prapt_lattha_kul_aytan = Number((this.prapt_lattha_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_lattha_kul_sankhya = this.dipo_parivahan_yogya_lattha_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_lattha_kul_aytan = Number((this.dipo_parivahan_yogya_lattha_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

            if (this.dipo_parivahan_yogya_lattha_kul_sankhya > 0
              || this.dipo_parivahan_yogya_lattha_kul_aytan > 0) {
              this.isShowLattaRow = true;
            }

          }

        }

        if (singleValue.jabti_saman_type === "4") { // CHIRAAN
          this.prapt_chiran_kul_sankhya = this.prapt_chiran_kul_sankhya + Number(singleValue.nag);
          this.prapt_chiran_kul_aytan = Number((this.prapt_chiran_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_chiran_kul_sankhya = this.dipo_parivahan_yogya_chiran_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_chiran_kul_aytan = Number((this.dipo_parivahan_yogya_chiran_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));


            if (this.dipo_parivahan_yogya_chiran_kul_sankhya > 0
              || this.dipo_parivahan_yogya_chiran_kul_aytan > 0) {
              this.isShowChiranRow = true;
            }


          }

        }

        if (singleValue.jabti_saman_type === "5") { // JALAU
          this.prapt_jalau_kul_sankhya = this.prapt_jalau_kul_sankhya + Number(singleValue.nag);
          this.prapt_jalau_kul_aytan = Number((this.prapt_jalau_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_jalau_kul_sankhya = this.dipo_parivahan_yogya_jalau_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_jalau_kul_aytan = Number((this.dipo_parivahan_yogya_jalau_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

            if (this.dipo_parivahan_yogya_jalau_kul_sankhya > 0
              || this.dipo_parivahan_yogya_jalau_kul_aytan > 0) {
              this.isShowJalauRow = true;
            }

          }

        }

        if (singleValue.jabti_saman_type === "6") { // BALLI
          this.prapt_balli_kul_sankhya = this.prapt_balli_kul_sankhya + Number(singleValue.nag);
          this.prapt_balli_kul_aytan = Number((this.prapt_balli_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_balli_kul_sankhya = this.dipo_parivahan_yogya_balli_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_balli_kul_aytan = Number((this.dipo_parivahan_yogya_balli_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));


            if (this.dipo_parivahan_yogya_balli_kul_sankhya > 0
              || this.dipo_parivahan_yogya_balli_kul_aytan > 0) {
              this.isShowBalliRow = true;
            }


          }

        }


        if (singleValue.jabti_saman_type === "3") { // OTHER JAPTI SAMAN
          this.prapt_anya_japt_samagree_kul_sankhya = this.prapt_anya_japt_samagree_kul_sankhya + Number(singleValue.nag);
          this.prapt_anya_japt_samagree_kul_aytan = Number((this.prapt_anya_japt_samagree_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya = this.dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_anya_japt_samagree_kul_aytan = Number((this.dipo_parivahan_yogya_anya_japt_samagree_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

            if (this.dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya > 0
              || this.dipo_parivahan_yogya_anya_japt_samagree_kul_aytan > 0) {
              this.isShowOtherJaptSaman = true;
            }

          }

        }



        if (singleValue.jabti_saman_type === "7") { // bansh
          this.prapt_bansh_kul_sankhya = this.prapt_bansh_kul_sankhya + Number(singleValue.nag);
          this.prapt_bansh_kul_aytan = Number((this.prapt_bansh_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_bansh_kul_sankhya = this.dipo_parivahan_yogya_bansh_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_bansh_kul_aytan = Number((this.dipo_parivahan_yogya_bansh_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));


            if (this.dipo_parivahan_yogya_bansh_kul_sankhya > 0
              || this.dipo_parivahan_yogya_bansh_kul_aytan > 0) {
              this.isShowBanshiRow = true;
            }


          }

        }

        if (singleValue.jabti_saman_type === "8") { // pol
          this.prapt_fencing_pol_kul_sankhya = this.prapt_fencing_pol_kul_sankhya + Number(singleValue.nag);
          this.prapt_fencing_pol_kul_aytan = Number((this.prapt_fencing_pol_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));

          if (singleValue.is_yogya_to_parivahan === "1") {
            this.dipo_parivahan_yogya_fencing_pol_kul_sankhya = this.dipo_parivahan_yogya_fencing_pol_kul_sankhya + Number(singleValue.nag);
            this.dipo_parivahan_yogya_fencing_pol_kul_aytan = Number((this.dipo_parivahan_yogya_fencing_pol_kul_aytan + Number(singleValue.ghan_meter)).toFixed(2));


            if (this.dipo_parivahan_yogya_fencing_pol_kul_sankhya > 0
              || this.dipo_parivahan_yogya_fencing_pol_kul_aytan > 0) {
              this.isShowPolRow = true;
            }


          }

        }


      }

      this.prapt_vanopaj_kul_sankhya = this.prapt_lattha_kul_sankhya + this.prapt_chiran_kul_sankhya + this.prapt_jalau_kul_sankhya + this.prapt_balli_kul_sankhya + this.prapt_anya_japt_samagree_kul_sankhya + this.prapt_fencing_pol_kul_sankhya + this.prapt_bansh_kul_sankhya;
      this.prapt_vanopaj_kul_aytan = Number((this.prapt_lattha_kul_aytan + this.prapt_chiran_kul_aytan + this.prapt_jalau_kul_aytan + this.prapt_balli_kul_aytan + this.prapt_anya_japt_samagree_kul_aytan + this.prapt_fencing_pol_kul_aytan + this.prapt_bansh_kul_aytan).toFixed(2));



      this.dipo_parivahan_yogya_vanopaj_kul_sankhya = this.dipo_parivahan_yogya_lattha_kul_sankhya + this.dipo_parivahan_yogya_chiran_kul_sankhya + this.dipo_parivahan_yogya_jalau_kul_sankhya + this.dipo_parivahan_yogya_balli_kul_sankhya + this.dipo_parivahan_yogya_bansh_kul_sankhya + this.dipo_parivahan_yogya_fencing_pol_kul_sankhya + this.dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya;

      this.dipo_parivahan_yogya_vanopaj_kul_aytan = Number((this.dipo_parivahan_yogya_lattha_kul_aytan + this.dipo_parivahan_yogya_chiran_kul_aytan + this.dipo_parivahan_yogya_jalau_kul_aytan + this.dipo_parivahan_yogya_balli_kul_aytan + this.dipo_parivahan_yogya_anya_japt_samagree_kul_aytan + this.dipo_parivahan_yogya_bansh_kul_aytan + this.dipo_parivahan_yogya_fencing_pol_kul_aytan).toFixed(2));

    }

  }

  isShowLattaRow: boolean = false;
  isShowChiranRow: boolean = false;
  isShowBalliRow: boolean = false;
  isShowBanshiRow: boolean = false;
  isShowPolRow: boolean = false;
  isShowJalauRow: boolean = false;
  isShowOtherJaptSaman: boolean = false;


  // filterItems() {
  //   this.listOfKashthaDetail = this.listOfjaptiSaman.filter(
  //     item => item.actual_name_of_saman === 'लट्ठा'
  //   );

  //   this.listOfKashthaDetail.forEach(row => {
  //     row.prajati_type = Number(row.prajati_type);
  //   });

  //   this.listOfKashthaDetail.forEach(row => {
  //     row.kasth_halat = Number(row.kasth_halat);
  //   });

  //   this.listOfChiranaDetail = this.listOfjaptiSaman.filter(
  //     item => item.actual_name_of_saman === 'चिरान'
  //   );

  //   this.listOfChiranaDetail.forEach(row => {
  //     row.prajati_type = Number(row.prajati_type);
  //   });

  //   this.listOfThunthDetail = this.listOfjaptiSaman.filter(
  //     item => item.actual_name_of_saman === 'ठूंठ'
  //   );

  //   this.listOfThunthDetail.forEach(row => {
  //     row.prajati_type = Number(row.prajati_type);
  //   });

  //   this.listOfChattaDetail = this.listOfjaptiSaman.filter(
  //     item => item.actual_name_of_saman === 'चट्टा'
  //   );

  //   this.listOfChattaDetail.forEach(row => {
  //     row.prajati_type = Number(row.prajati_type);
  //   });

  //   //
  //   this.listOfBalliDetail = this.listOfjaptiSaman.filter(
  //     item => item.actual_name_of_saman === 'बल्ली'
  //   );

  //   this.listOfBalliDetail.forEach(row => {
  //     row.prajati_type = Number(row.prajati_type);
  //   });

  //   this.updateTotalThunthRashi();
  //   this.getTotalVanopajRashi();

  // }

  setTotalVariables() {

    this.dipo_parivahit_lattha_kul_sankhya = 0;
    this.dipo_parivahit_lattha_kul_aytan = 0;
    this.dipo_parivahit_chiran_kul_sankhya = 0;
    this.dipo_parivahit_chiran_kul_aytan = 0;
    this.dipo_parivahit_jalau_kul_sankhya = 0;
    this.dipo_parivahit_jalau_kul_aytan = 0;
    this.dipo_parivahit_balli_kul_sankhya = 0;
    this.dipo_parivahit_balli_kul_aytan = 0;
    this.dipo_parivahit_anya_japt_samagree_kul_sankhya = 0;
    this.dipo_parivahit_anya_japt_samagree_kul_aytan = 0;
    this.dipo_parivahit_bansh_kul_sankhya = 0;
    this.dipo_parivahit_bansh_kul_aytan = 0;
    this.dipo_parivahit_fencing_pol_kul_sankhya = 0;
    this.dipo_parivahit_fencing_pol_kul_aytan = 0;

     ;
    if (this.challanDetailList.length > 0) {

      for (let i = 0; i < this.challanDetailList.length; i++) {
        const singleValue = this.challanDetailList[i];

        if (singleValue.vanopaj_type_id === "2") { // LATTHA
          this.dipo_parivahit_lattha_kul_sankhya = this.dipo_parivahit_lattha_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_lattha_kul_aytan = Number((this.dipo_parivahit_lattha_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }

        if (singleValue.vanopaj_type_id === "4") { // CHIRAAN
          this.dipo_parivahit_chiran_kul_sankhya = this.dipo_parivahit_chiran_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_chiran_kul_aytan = Number((this.dipo_parivahit_chiran_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }

        if (singleValue.vanopaj_type_id === "5") { // JALAU
          this.dipo_parivahit_jalau_kul_sankhya = this.dipo_parivahit_jalau_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_jalau_kul_aytan = Number((this.dipo_parivahit_jalau_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }

        if (singleValue.vanopaj_type_id === "6") { // BALLI
          this.dipo_parivahit_balli_kul_sankhya = this.dipo_parivahit_balli_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_balli_kul_aytan = Number((this.dipo_parivahit_balli_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }

        if (singleValue.vanopaj_type_id === "3") { // OTHER JAPT SAMAN
          this.dipo_parivahit_anya_japt_samagree_kul_sankhya = this.dipo_parivahit_anya_japt_samagree_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_anya_japt_samagree_kul_aytan = Number((this.dipo_parivahit_anya_japt_samagree_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }





        if (singleValue.vanopaj_type_id === "7") { // BANSH
          this.dipo_parivahit_bansh_kul_sankhya = this.dipo_parivahit_bansh_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_bansh_kul_aytan = Number((this.dipo_parivahit_bansh_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }


        if (singleValue.vanopaj_type_id === "8") { // FENCING POL
          this.dipo_parivahit_fencing_pol_kul_sankhya = this.dipo_parivahit_fencing_pol_kul_sankhya + Number(singleValue.total_matra_in_sankhya);
          this.dipo_parivahit_fencing_pol_kul_aytan = Number((this.dipo_parivahit_fencing_pol_kul_aytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
        }



      }

      this.dipo_parivahit_vanopaj_kul_sankhya = this.dipo_parivahit_lattha_kul_sankhya +
        this.dipo_parivahit_chiran_kul_sankhya + this.dipo_parivahit_balli_kul_sankhya +
        this.dipo_parivahit_jalau_kul_sankhya + this.dipo_parivahit_bansh_kul_sankhya + this.dipo_parivahit_fencing_pol_kul_sankhya;

      this.dipo_parivahit_vanopaj_kul_aytan = Number((this.dipo_parivahit_lattha_kul_aytan +
        this.dipo_parivahit_chiran_kul_aytan + this.dipo_parivahit_fencing_pol_kul_aytan +
        this.dipo_parivahit_fencing_pol_kul_aytan).toFixed(2));

    }

    this.dipo_parivahan_hetu_shesh_lattha_kul_sankhya = this.dipo_parivahan_yogya_lattha_kul_sankhya -
      this.dipo_parivahit_lattha_kul_sankhya;

    this.dipo_parivahan_hetu_shesh_lattha_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_lattha_kul_aytan -
          this.dipo_parivahit_lattha_kul_aytan
        ).toFixed(2)
      )
    );

    this.dipo_parivahan_hetu_shesh_chiran_kul_sankhya = this.dipo_parivahan_yogya_chiran_kul_sankhya -
      this.dipo_parivahit_chiran_kul_sankhya;
    this.dipo_parivahan_hetu_shesh_chiran_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_chiran_kul_aytan -
          this.dipo_parivahit_chiran_kul_aytan
        ).toFixed(2)
      )
    );

    this.dipo_parivahan_hetu_shesh_balli_kul_sankhya = this.dipo_parivahan_yogya_balli_kul_sankhya -
      this.dipo_parivahit_balli_kul_sankhya;
    this.dipo_parivahan_hetu_shesh_balli_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_balli_kul_aytan -
          this.dipo_parivahit_balli_kul_aytan
        ).toFixed(2)
      )
    );

    this.dipo_parivahan_hetu_shesh_jalau_kul_sankhya = this.dipo_parivahan_yogya_jalau_kul_sankhya -
      this.dipo_parivahit_jalau_kul_sankhya;
    this.dipo_parivahan_hetu_shesh_jalau_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_jalau_kul_aytan -
          this.dipo_parivahit_jalau_kul_aytan
        ).toFixed(2)
      )
    );

    this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_sankhya = this.dipo_parivahan_yogya_anya_japt_samagree_kul_sankhya -
      this.dipo_parivahit_anya_japt_samagree_kul_sankhya;

    this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_anya_japt_samagree_kul_aytan -
          this.dipo_parivahit_anya_japt_samagree_kul_aytan
        ).toFixed(2)
      )
    );


    this.dipo_parivahan_hetu_shesh_bansh_kul_sankhya = this.dipo_parivahan_yogya_bansh_kul_sankhya -
      this.dipo_parivahit_bansh_kul_sankhya;
    this.dipo_parivahan_hetu_shesh__bansh_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_bansh_kul_aytan -
          this.dipo_parivahit_bansh_kul_aytan
        ).toFixed(2)
      )
    );

    this.dipo_parivahan_hetu_shesh_fencing_pol_kul_sankhya = this.dipo_parivahan_yogya_fencing_pol_kul_sankhya -
      this.dipo_parivahit_fencing_pol_kul_sankhya;
    this.dipo_parivahan_hetu_shesh_fencing_pol_kul_aytan = Math.max(
      0,
      Number(
        (
          this.dipo_parivahan_yogya_fencing_pol_kul_aytan -
          this.dipo_parivahit_fencing_pol_kul_aytan
        ).toFixed(2)
      )
    );


    this.dipo_parivahan_hetu_shesh_vanopaj_kul_sankhya = this.dipo_parivahan_hetu_shesh_lattha_kul_sankhya +
      this.dipo_parivahan_hetu_shesh_chiran_kul_sankhya + this.dipo_parivahan_hetu_shesh_balli_kul_sankhya +
      this.dipo_parivahan_hetu_shesh_jalau_kul_sankhya + this.dipo_parivahan_hetu_shesh_bansh_kul_sankhya +
      this.dipo_parivahan_hetu_shesh_fencing_pol_kul_sankhya + this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_sankhya;

    this.dipo_parivahan_hetu_shesh_vanopaj_kul_aytan = Number((this.dipo_parivahan_hetu_shesh_lattha_kul_aytan +
      this.dipo_parivahan_hetu_shesh_chiran_kul_aytan + this.dipo_parivahan_hetu_shesh_balli_kul_aytan +
      this.dipo_parivahan_hetu_shesh_jalau_kul_aytan + this.dipo_parivahan_hetu_shesh__bansh_kul_aytan +
      this.dipo_parivahan_hetu_shesh_fencing_pol_kul_aytan + this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_aytan).toFixed(2));


  }

  totalGhanMeterWhichSentToDEOP: number = 0;
  totalSankhyaWhichSentToDEOP: number = 0;

  removeChallan(index: number) {
    if (index > -1 && index < this.listOfChallanDetail.length) {
      this.listOfChallanDetail.splice(index, 1);
    }

    this.totalGhanMeterWhichSentToDEOP = this.listOfChallanDetail.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    );

    this.totalSankhyaWhichSentToDEOP = this.listOfChallanDetail.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_sankhya) || 0),
      0
    );

  }

  addChallanDetail() {

    if (this.dipo_parivahan_hetu_shesh_vanopaj_kul_sankhya === 0 &&
      this.dipo_parivahan_hetu_shesh_vanopaj_kul_aytan === 0
    ) {
      this.showError("परिवहन हेतु वनोपज शेष नहीं है | सभी वनोपज परिवहित हो चुके हैं | ");
      return;
    }

    this.listOfChallanDetail.push({
      challan_kramank: '', challan_date: '', total_matra_in_ghan_meter: '', depo_name: '', challan_image: '',
      challan_image_blob: null, vanopaj_type: 0, total_matra_in_sankhya: '', is_ghanmter_readonly: false
    });
  }

  async selectWorkChallanDate(item: any) {

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
        item.challan_date = `${yyyy}-${mm}-${dd}`;
      }

    });

    await modal.present();

  }

  calculateTotalGhanMeterToSentDep() {
    this.totalGhanMeterWhichSentToDEOP = this.listOfChallanDetail.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    );
  }

  calculateTotalSankhyaToSentDep() {
    this.totalSankhyaWhichSentToDEOP = this.listOfChallanDetail.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_sankhya) || 0),
      0
    );
  }

  get totalDispatchedGhanmeter(): number {
    return Number(this.challanDetailList.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_ghan_meter) || 0),
      0
    ).toFixed(2));
  }

  get totalDispatchedSankhya(): number {
    return this.challanDetailList.reduce(
      (sum, item) => sum + (Number(item.total_matra_in_sankhya) || 0),
      0
    );
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

  listOfVasuliViran: VasuliViranDetailRequestModal[] = [];

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

  onVanopajTypeChange(selectedValue: any, row: any) {
    // Convert selectedValue to number, just in case
    const val = Number(selectedValue);

    if (val === 5 || val === 6) {
      row.is_ghanmter_readonly = true;  // editable
    } else {
      row.is_ghanmter_readonly = false;  // readonly
    }
  }

  submitDataToServer() {



    let isAllDataSubmitted = true;
    let listOfBlobs: (Blob | null)[] = [];

    let totalLattaSankhya = 0; let totalLattaAytan = 0; // 2
    let totalChiranSankhya = 0; let totalChiranAytan = 0; // 4
    let totalBalliSankhya = 0; let totalBalliAytan = 0; // 6
    let totalJalauSankhya = 0; let totalJalauAytan = 0; // 5
    let totalBanshSankhya = 0; let totalBanshAytan = 0; // 7
    let totalPolSankhya = 0; let totalPolAytan = 0; // 8
    let totalAnyaJaptSamanSankhya = 0; let totalAnyaJaptSamanAytan = 0; // 3

    // Validate data and convert images
    for (let i = 0; i < this.listOfChallanDetail.length; i++) {
      const singleValue = this.listOfChallanDetail[i];

      if (singleValue.total_matra_in_ghan_meter === "" && singleValue.total_matra_in_sankhya === "") {
        isAllDataSubmitted = false;
        break;
      }

      if (
        !singleValue.challan_image ||
        !singleValue.challan_date ||
        !singleValue.depo_name ||
        !singleValue.challan_kramank ||
        singleValue.vanopaj_type === 0
      ) {
        isAllDataSubmitted = false;
        break;
      }

      // Convert base64 image to Blob if exists
      let imageBlob: Blob | null = null;
      if (singleValue.challan_image && singleValue.challan_image.trim() !== "") {
        imageBlob = this.dataURLtoBlob(singleValue.challan_image);
      }

      if (singleValue.vanopaj_type === 2) {
        totalLattaSankhya = totalLattaSankhya + Number(singleValue.total_matra_in_sankhya);
        totalLattaAytan = Number((totalLattaAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 4) {
        totalChiranSankhya = totalChiranSankhya + Number(singleValue.total_matra_in_sankhya);
        totalChiranAytan = Number((totalChiranAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 6) {
        totalBalliSankhya = totalBalliSankhya + Number(singleValue.total_matra_in_sankhya);
        totalBalliAytan = Number((totalBalliAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 5) {
        totalJalauSankhya = totalJalauSankhya + Number(singleValue.total_matra_in_sankhya);
        totalJalauAytan = Number((totalJalauAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 7) {
        totalBanshSankhya = totalBanshSankhya + Number(singleValue.total_matra_in_sankhya);
        totalBanshAytan = Number((totalBanshAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 8) {
        totalPolSankhya = totalPolSankhya + Number(singleValue.total_matra_in_sankhya);
        totalPolAytan = Number((totalPolAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      if (singleValue.vanopaj_type === 3) {
        totalAnyaJaptSamanSankhya = totalAnyaJaptSamanSankhya + Number(singleValue.total_matra_in_sankhya);
        totalAnyaJaptSamanAytan = Number((totalAnyaJaptSamanAytan + Number(singleValue.total_matra_in_ghan_meter)).toFixed(2));
      }

      // Store blob or null for every item
      listOfBlobs.push(imageBlob);
    }

    if (!isAllDataSubmitted) {
      this.showError("कृपया परविहन की पूरी जानकारी भरें");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_lattha_kul_sankhya < totalLattaSankhya) {
      this.showError("लट्ठा की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_lattha_kul_aytan < totalLattaAytan) {
      this.showError("लट्ठा की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_chiran_kul_sankhya < totalChiranSankhya) {
      this.showError("चिरान की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_chiran_kul_aytan < totalChiranAytan) {
      this.showError("चिरान की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_balli_kul_sankhya < totalBalliSankhya) {
      this.showError("बल्ली की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_balli_kul_aytan < totalBalliAytan) {
      this.showError("बल्ली की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_bansh_kul_sankhya < totalBanshSankhya) {
      this.showError("बाँस की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh__bansh_kul_aytan < totalBanshAytan) {
      this.showError("बाँस की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_fencing_pol_kul_sankhya < totalPolSankhya) {
      this.showError("फेंसिंग पोल की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_fencing_pol_kul_aytan < totalPolAytan) {
      this.showError("फेंसिंग पोल की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_jalau_kul_sankhya < totalJalauSankhya) {
      this.showError("जलाऊ की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_jalau_kul_aytan < totalJalauAytan) {
      this.showError("जलाऊ की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    if (this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_sankhya < totalAnyaJaptSamanSankhya) {
      this.showError("अन्य जप्त सामाग्री की कुल संख्या सही प्रेषित करिये |");
      return;
    }
    if (this.dipo_parivahan_hetu_shesh_anya_japt_samagree_kul_aytan < totalAnyaJaptSamanAytan) {
      this.showError("अन्य जप्त सामाग्री की कुल मात्रा (घ.मी.) सही प्रेषित करिये |");
      return;
    }

    // Prepare FormData
    const formData = new FormData();

    // Create JSON list without the image
    const challanDetailsWithoutFile = this.listOfChallanDetail.map((item) => ({
      complain_table_id: this.comingComplaintData.complain_id,
      challan_kramank: item.challan_kramank,
      challan_date: item.challan_date,
      total_matra_in_ghan_meter: item.total_matra_in_ghan_meter,
      depo_name: item.depo_name,
      vanopaj_type: item.vanopaj_type.toString(),
      total_matra_in_sankhya: item.total_matra_in_sankhya,
    }));

    formData.append("challan_detail", JSON.stringify(challanDetailsWithoutFile));
    formData.append("created_by", this.loginedOfficerEmpId.toString());
    formData.append("complain_id", this.comingComplaintData.complain_id.toString());

    // Append images (if any)
    listOfBlobs.forEach((blob, index) => {
      if (blob) {
        formData.append("challan_images", blob, `challan_${index}.jpg`);
      } else {
        // Optional: still maintain order if backend expects fixed count
        // formData.append("challan_images", new Blob(), `challan_${index}_empty.jpg`);
      }
    });

    // Send request
    this.showDialog("कृपया प्रतीक्षा करें.....");
    this.cdRef.detectChanges();

    this.apiService.submitVanopajParivahan(formData).subscribe(
      async (response) => {
        await this.dismissDialog();
        this.cdRef.detectChanges();

        if (response.response.code === 200) {
          this.listOfChallanDetail = [];
          this.challanDetailList = [];
          this.cdRef.detectChanges();
          this.sharedService.setRefresh(true);
          this.getWorkLog();
        } else {
          this.showError(response.response.msg);
        }
      },
      async (error) => {
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


  removeVasuliData(index: number) {
    if (index > -1 && index < this.listOfVasuliViran.length) {
      this.listOfVasuliViran.splice(index, 1);
    }



  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  // getTotal(field: 'mavja_rashi' | 'mahsul_rashi' | 'total_rashi'): number {
  //   return this.listOfChallanDetail?.reduce((sum, item) => {
  //     const val = parseFloat(item[field]) || 0;
  //     return sum + val;
  //   }, 0) || 0;
  // }

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  filePath: string = "";
  getFullPathImage(photoName: string): string {
    return this.filePath + "/" + photoName;
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

  onImageError(event: any) {
    event.target.src = 'assets/img/default_image.png'; // path to your default image
  }

}
