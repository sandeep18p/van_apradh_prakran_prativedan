import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, NavController, ModalController } from '@ionic/angular/standalone';
import { FormsModule, NgModel } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, arrowBack, baseball, book, calendarOutline, calculatorOutline, cameraOutline, checkmarkCircleOutline, closeCircle, closeCircleOutline, createOutline, documentTextOutline, informationCircleOutline, leafOutline, locationOutline, micCircleOutline, peopleOutline, trashOutline } from 'ionicons/icons';
import { AccusedPersonDetail, AccusedPersonDetailForVanApradhPrakran, ComplainDetails, JaptSamanItem, VasuliViranDetailRequestModal, WitnessDetail, WitnessResponseModal } from '../officer-dashboard/GetDashboardResponse.model';
import { Users } from '../login-officer/OfficerLoginResponse';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Router } from '@angular/router';
import { SelectDateDialogComponent } from 'src/app/dialogs/select-date-dialog/select-date-dialog.component';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { TableModule } from 'primeng/table'; // Import TableModule
import { Platform } from '@ionic/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Toast } from '@capacitor/toast';
import { ChallanDetailResponseModal, FInalWorkLogResponseModal, WorkLogResponseModal } from '../show-ra-work-log/WorkLogResponseModal.modal';
import { GetComplainHistoryResponseModal } from '../complain-life-history/GetComplainHistoryResponse.modal';
import { finalize } from 'rxjs';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { BalliPriceMasterResponse, BambooPriceMasterResponse, ChattaJalauPriceMasterResponse, ChiraanPriceMasterResponse, DharaDataNew, FencingPolPriceMasterResponse, FormFactorResponse, IdAndNameModel, KhadaVrikhaPriceMasterResponse, LatthaKasthPriceMasterResponse } from '../add-complain/GetCastAndCrimTypeMasterResponse';
import { JaptVahanDetailInterface } from '../view-complain-detail/base64responseofsign.modal';
import { SelectActualCrimeDateDialogComponent } from 'src/app/dialogs/select-actual-crime-date-dialog/select-actual-crime-date-dialog.component';
import { SelectApradhPrakranaDialogComponent } from 'src/app/dialogs/select-apradh-prakrana-date-dialog/select-apradh-prakrana-dialog.component';
import { Agent } from 'http';

@Component({
  selector: 'app-submit-van-apradh-prakaran-by-ra',
  templateUrl: './submit-van-apradh-prakaran-by-ra.component.html',
  styleUrls: ['./submit-van-apradh-prakaran-by-ra.component.scss'],
  imports: [NgSelectModule, IonicModule, FormsModule, CommonModule, TableModule],
})
export class SubmitVanApradhPrakaranByRaComponent implements OnInit {


  isLoading: boolean = false;
  loadingMessage: string = ""

  comingComplaintData!: ComplainDetails;

  placeOfCrime = "";
  beatName = "";
  compartmentOption = "";
  compartmentNumber = "";



  witnessFirstName: string = "";
  witnessFirstAddress: string = "";
  witnessSecondName: string = "";
  witnessSecondAddress: string = "";

  japtsuda_saman_supurd_emp_name: string = "";

  janch_adhikari_ka_name: string = "";

  toolbarTitle: string = "";
  ra_name: string = '';
  apradh_prativend_jama_date: string = "";
  apradh_prativend_kramank: string = "";
  loginedOfficerEmpId: number = 0;
  loginedOfficerDesignationId: number = 0;
  loginedOfficerCircleId: string = "0";
  loginedOfficerDivisionId: string = "0";
  loginedOfficerSubDivisionId: string = "0";
  loginedOfficerRangId: string = "0";
  loginedOfficerBeatId: string = "0";

  actual_crime_date: string = "";
  date_of_crime: string = "";
  complainer_name: string = "";
  por_number: string = "";

  accusedPersons: AccusedPersonDetailForVanApradhPrakran[] = [];
  accusedCount: number = 0;
  accussedName: string = ""; accussedFatherName: string = ""; accussedAddress: string = "";
  accussedCast: string = "";
  seizedGoodDetail: string = "";
  crime_dhara: string = "";
  crimType: string = "";
  isAccussedFound: boolean = false;
  listOfWoodPrajati: any = [];
  listOfjaptiSaman: (JaptSamanItem & { can_delete: boolean })[] = [];


  janch_ki_awadhi: string = "";

  totalVasuliRashi: string = "";

  sheshVasuliRashi: number = 0;

  apradhi_ke_purv_apradh_ka_vivran: string = "";
  isAccusedWantToAbhisandhanit: boolean = true;
  // 0 = अभिसन्धानित/अपलेखित, 1 = न्यायालय में देने हेतु अनुशंषा
  jachkartaDecision: number = 0;
  accussedFinancialCondition: string = "";
  accussed_found_date: string = "";

  // ===== Image cropper (CropperJS) - used for "राजी नामा" upload =====
  isImagePreviewModalOpen: boolean = false;
  previewImageDataUrl: string = "";
  originalImageDataUrl: string = "";
  private cropperInstance: any = null;

  @ViewChild('imagePreview', { static: false }) imagePreviewElement!: ElementRef<HTMLImageElement>;
  @ViewChild('cropperContainer', { static: false }) cropperContainerElement!: ElementRef<HTMLDivElement>;

  constructor(private apiService: ApiServiceService, private cdRef: ChangeDetectorRef, private platform: Platform, private navController: NavController, private languageService: LanguageServiceService,
    private router: Router, private modalController: ModalController, private actionSheetController: ActionSheetController, private sharedService: SharedserviceService
  ) {
    addIcons({ peopleOutline, calendarOutline, calculatorOutline, leafOutline, informationCircleOutline, addCircleOutline, trashOutline, checkmarkCircleOutline, closeCircleOutline, arrowBack, cameraOutline, closeCircle, micCircleOutline, createOutline, documentTextOutline, locationOutline })
  }

  isShowEditDharaBox: boolean = false;

  samanTypeMap: Record<string, string> = {
    "1": "ठूंठ",
    "2": "लट्ठा",
    "3": "Other",
    "4": "चिरान",
    "5": "चट्टा",
    "6": "बल्ली"
  };

  selectedCrimType: any = null;

  async ngOnInit() {

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.apradh_prativend_jama_date = `${yyyy}-${mm}-${dd}`;

    this.getLoginedOfficerData();

    const nav = this.router.getCurrentNavigation();
    const data = nav?.extras.state?.['data'];

    const { value } = await Preferences.get({ key: PreferenceKeys.emp_name });
    if (value) {
      this.ra_name = value;
      this.janch_adhikari_ka_name = value;
    }

    if (data) {


      const crimTypeMaster = await Preferences.get({ key: PreferenceKeys.crimType_master });

      const castMasterType = await Preferences.get({ key: PreferenceKeys.cast_master });

      const dharaData = await Preferences.get({ key: PreferenceKeys.dhara_data });


      if (dharaData.value) {

        this.listOfDharaNew = JSON.parse(dharaData.value);

        this.localListOfDharaHead = this.listOfDharaNew
          .map((item: { dhara_head: string; id: string, dhara_year: string }) => ({
            name: item.dhara_head,
            id: item.id,
            dharaYear: item.dhara_year
          }));

      }

      if (crimTypeMaster.value) {
        this.listOfCrimType = JSON.parse(crimTypeMaster.value);
      }

      if (castMasterType.value) {
        // 
        this.listOfCast = JSON.parse(castMasterType.value);
      }



      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.toolbarTitle = this.comingComplaintData.por_number;



      this.compartmentNumber = this.comingComplaintData.compartment_number;
      this.compartmentOption = this.comingComplaintData.compartment_option;
      this.beatName = this.comingComplaintData.beat_name;
      this.placeOfCrime = this.comingComplaintData.place_of_crime;

      this.witnessFirstName = this.comingComplaintData.name_of_witness_one;
      this.witnessSecondName = this.comingComplaintData.name_of_witness_two;
      this.witnessFirstAddress = this.comingComplaintData.address_of_witness_one;
      this.witnessSecondAddress = this.comingComplaintData.address_of_witness_two;

      this.japtsuda_saman_supurd_emp_name = this.comingComplaintData.supurddar_ka_name;
      //  

      this.actual_crime_date = this.formatDateString(this.comingComplaintData.actual_crime_date);
      // 

      // if (this.comingComplaintData.actual_crime_date) {
      //   const [year, month, day] = this.comingComplaintData.actual_crime_date.split('-');
      //   this.actual_crime_date = `${day}-${month}-${year}`;
      // } else {
      //   this.actual_crime_date = "---";
      // }

      this.date_of_crime = this.comingComplaintData.date_of_crime;
      this.complainer_name = this.comingComplaintData.complainer_name;
      this.por_number = this.comingComplaintData.por_number;

      this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
      this.crimType = this.comingComplaintData.crime_type;
      // 
      for (let i = 0; i < this.listOfCrimType.length; i++) {

        if (this.crimType === this.listOfCrimType[i].name) {
          this.selectedCrimType = this.listOfCrimType[i].id;
        }

      }

      let totalDhara = this.comingComplaintData.crime_dhara;
      // 
      if (this.comingComplaintData?.crime_dhara) {
        // 
        const dharaArray = this.comingComplaintData.crime_dhara
          .split(',')
          .map(d => d.trim())
          .filter(d => d); // remove empty values

        dharaArray.forEach((dhara, index) => {
          //    
          let dhara1 = dhara;

          const dharaArraySplited = dhara1
            .split('-')
            .map(d => d.trim())
            .filter(d => d); // remove empty values


          this.clipboardDharas.push({
            id: (index + 1).toString(),   // or use UUID if needed
            name: dharaArraySplited[1],
            extraInfo: dharaArraySplited[0]
          });
        });
      }

      this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

      // 
      if (this.comingComplaintData.is_accused_found === "1") {
        this.isAccussedFound = true;
      }

      const prajatiName = await Preferences.get({ key: PreferenceKeys.prajati_name });

      if (prajatiName.value) {
        this.listOfWoodPrajati = JSON.parse(prajatiName.value);
      }

      this.listOfjaptiSaman = this.comingComplaintData.japtSamanList;



      console.log(this.listOfjaptiSaman, ' this.listOfjaptiSaman');
      if (this.listOfjaptiSaman != null) {
        this.listOfjaptiSaman.forEach(item => {
          item.is_janch_karta_entry = true;
          item.can_delete = false;
        });

        console.log(' this.listOfjaptiSaman after forEach', this.listOfjaptiSaman);

        this.filterItems();

      }




      if (this.comingComplaintData.is_accused_found === '1') {
        //  
        this.accusedCount = this.comingComplaintData.accused_count || 0;
        this.accusedPersons = this.comingComplaintData.accusedPersons || [];

        for (let i = 0; i < this.accusedPersons.length; i++) {
          let singleValue = this.accusedPersons[i];
          singleValue.cast = this.retrievIdFromCastList(singleValue.cast);
          singleValue.show_delete_button = false;
        }

        if (this.accusedCount === 0) {
          this.accusedCount = 1;
        }

      } else {
        this.accusedCount = 0;
        this.accusedPersons = [];
      }


      this.accussedName = this.comingComplaintData.accused_name;
      this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
      this.accussedAddress = this.comingComplaintData.accused_address;
      this.accussedCast = this.comingComplaintData.cast_name;

      // 

      if (this.comingComplaintData.isJaptikartaAndSupurdarSame) {
        this.japtsuda_saman_supurd_emp_name = this.comingComplaintData.japtikarta_ka_name;
      }


      this.getMasterData();

      this.getWorkLog();

      this.getDetailOfComplain();

    }



    this.listOfSiteQuality = [
      { id: 3, name: 'III' },
      { id: 4, name: 'IVA' },
      { id: 5, name: 'IVB' }
    ];

    this.handleBackButton();

  }

  selectedCrimeBeat: string = "";
  selectedCrimeBeatName: string = "";
  crimePlace: string = "";

  listOfWitness:
    {
      id: string,
      naam: string;
      pita_ka_naam: string;
      pata: string;
      jaati: string;
      age: string;
      sign: string;
      japtinama_table_id?: string | null;
      supurdnama_table_id?: string | null;
    }[] = [];

  /** साक्षी जिनका जप्तीनामा अभी लिंक नहीं है — केवल इन्हीं को इस फॉर्म पर दिखाया/संपादित करें। */
  private filterWitnessesWithoutJaptinama(
    list: typeof this.listOfWitness
  ): typeof this.listOfWitness {
    return (list || []).filter((w) => {
      const jId = w.japtinama_table_id;
      const sId = w.supurdnama_table_id;
      const jEmpty = jId === undefined || jId === null || jId === '';
      const sEmpty = sId === undefined || sId === null || sId === '';
      return jEmpty && sEmpty;
    });
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

            console.log(' this.comingComplaintData', this.comingComplaintData);

            this.listOfjaptiSaman = this.comingComplaintData.japtSamanList;

            console.log(' this.listOfjaptiSaman after getDetailOfComplain', this.listOfjaptiSaman);

            this.listOfWitness = this.filterWitnessesWithoutJaptinama(
              this.comingComplaintData.listOfWitness
            );
            console.log(' this.listOfWitness after getDetailOfComplain', this.listOfWitness);

            this.crimePlace = this.comingComplaintData.place_of_crime;

            this.selectedCrimeBeat = this.comingComplaintData.beat_id;
            this.selectedCrimeBeatName = this.comingComplaintData.beat_name;

            this.compartmentNumber = this.comingComplaintData.compartment_number;
            this.compartmentOption = this.comingComplaintData.compartment_option;

            let listOfBeatData = response.beat_compartment[0];

            this.listOfCompartment = listOfBeatData.compartment_no
              .split(',')
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0)
              .map((name: string) => ({ name }));

            this.listOfCompartment.push({ name: 'अन्य स्थल' });



            this.selectedCompartmentOption = this.compartmentOption as 'RF' | 'PF' | 'OA' | null;

            this.clipboardCompartment.push({ name: this.comingComplaintData.compartment_number });

            this.beatName = this.comingComplaintData.beat_name;
            this.placeOfCrime = this.comingComplaintData.place_of_crime;


            this.selectedCrimType = Number(this.comingComplaintData.type_of_crime);

            // Use setTimeout to defer and avoid blocking UI
            setTimeout(() => {
              // If "अन्य" is selected or no compartment option, filter by empty forest_type
              if ((this.hasNoneCompartment || !this.selectedCompartmentOption) && this.selectedCrimType) {
                this.buildDharaNewGroupsForCrimeTypeOnly();
              } else if (this.selectedCompartmentOption && this.selectedCrimType) {
                // When compartment option (RF/PF/OA) is selected, use normal filtering
                this.buildDharaNewGroups();
              }
            }, 0);



            if (this.comingComplaintData.is_japt_vahan === "1") {
              if (this.comingComplaintData.japt_vahan_detail && this.comingComplaintData.japt_vahan_detail.trim() !== '') {
                try {
                  this.listOfJaptVahanDetail = JSON.parse('[' + this.comingComplaintData.japt_vahan_detail + ']');

                  this.listOfJaptVahanDetail = this.listOfJaptVahanDetail.map((item: any) => ({
                    ...item,
                    malik_k_father_ka_name:
                      item.malik_k_father_ka_name ||
                      item.pita_ka_name ||
                      '',
                    malik_ka_name:
                      item.malik_ka_name ||
                      item.malik_name ||
                      ''
                  }));

                } catch (error) {

                }
              }
            }

          }

        }



      },
      (error) => {
        this.dismissDialog();
      }
    );

  }

  listOfCrimType: any = [];
  localListOfDharaHead: { name: string; id: string, dharaYear: string }[] = [];
  localListOfActualDhara: { name: string; id: string }[] = [];
  listOfDharaNew: any = [];

  getJaptisamanList(samanDetails: JaptSamanItem[]) {
    // this.listOfjaptiSaman = samanDetails.filter(item => item.jabti_saman_type !== "3")
    //   .map((item, index) => {
    //     const prajati = this.listOfWoodPrajati.find(
    //       (p: any) => p.id === Number(item.prajati_type)
    //     );


    //     return {
    //       jabti_saman_type: item.jabti_saman_type,
    //       actual_name_of_saman: this.samanTypeMap[item.jabti_saman_type] ?? "",
    //       saman_table_id: item.saman_table_id,
    //       prajati_name: prajati?.name ?? "",
    //       prajati_type: item.prajati_type,
    //       lambai: item.lambai,
    //       golai: item.golai,
    //       ghan_meter: item.ghan_meter,
    //       nag: item.nag,
    //       dar: item.dar,
    //       total_cost: item.total_cost,
    //       if_other_then_detail: item.if_other_then_detail,
    //       motai: item.motai,
    //       unchai: item.unchai,
    //       kasth_halat: item.kasth_halat,
    //       kasth_halat_name: item.kasth_halat_name,
    //       is_yogya_to_parivahan: item.is_yogya_to_parivahan,
    //       if_not_yogya_then_reason: item.if_not_yogya_then_reason
    //     } as JaptSamanItem;
    //   });

    this.filterItems();

  }

  filterItems() {
    // 
    this.listOfKashthaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'लट्ठा'
    );

    this.listOfKashthaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfKashthaDetail.forEach(row => {
      row.kasth_halat = Number(row.kasth_halat);
    });

    this.listOfChiranaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चिरान'
    );

    this.listOfChiranaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfThunthDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'ठूंठ'
    );

    this.listOfThunthDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
      row.site_quality = Number(row.site_quality);
      row.kasth_halat = Number(row.kasth_halat);
    });

    this.listOfChattaDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'चट्टा'
    );

    this.listOfChattaDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    //
    this.listOfBalliDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बल्ली'
    );

    this.listOfBalliDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });
    // 
    this.listOfOtherJaptSamanDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'अन्य जप्त सामान'
    );

    this.listOfBanshDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'बाँस'
    );

    this.listOfBanshDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.listOfFencingPolDetail = this.listOfjaptiSaman.filter(
      item => item.actual_name_of_saman === 'पोल'
    );

    this.listOfFencingPolDetail.forEach(row => {
      row.prajati_type = Number(row.prajati_type);
    });

    this.updateTotalThunthRashi();
    this.getTotalVanopajRashi();

  }

  totalCostOfVastawikHani: number = 0;

  totalVanopajRashi: string = '0';
  totalThunthRashi: string = '0.000';
  totalChattaRashi: number = 0;
  totalThunthGhanmeter: number = 0;

  totalCostOfMahsul: string = "0";
  totalCostOfMuwavja: string = "0";
  totalOfMahsulAndMawja: number = 0;

  ra_ki_anushanasha: string = "";

  updateTotalOfMahsulAndMawja() {
    this.totalOfMahsulAndMawja = Number(this.totalCostOfMahsul) + Number(this.totalCostOfMuwavja);

    this.calculateSheshRashi();

  }

  getTotalVanopajRashi() {
    // 
    const kashRashi = this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const balliRashi = this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const chiranRashi = this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const jalauRashi = this.listOfChattaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const totalAnyJaptSamanRashi = this.listOfOtherJaptSamanDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);

    const banshRashi = this.listOfBanshDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);


    const polRashi = this.listOfFencingPolDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0);


    this.totalVanopajRashi = (kashRashi + chiranRashi + jalauRashi + balliRashi + totalAnyJaptSamanRashi + polRashi + banshRashi).toFixed(0);

  }

  updateTotalThunthRashi() {
    this.totalThunthRashi = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0).toFixed(3);

    this.totalThunthGhanmeter = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.ghan_meter) || 0;
      return sum + cost;
    }, 0);

  }

  getCrimDharaCommaSeparated(input: string): string {
    // 
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

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  async getLoginedOfficerData() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      this.loginedOfficerEmpId = userData.emp_id;
      this.loginedOfficerDesignationId = Number(userData.designation_id);
      this.loginedOfficerCircleId = userData.circle_id;
      this.loginedOfficerDivisionId = userData.division_id;
      this.loginedOfficerSubDivisionId = userData.sub_division_id;
      this.loginedOfficerRangId = userData.range_id;
      this.loginedOfficerBeatId = userData.beat_id;
    }

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
    }[] = [];

  addChattaInfo() {
    this.listOfChattaDetail.push({
      jabti_saman_type: '5', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
    }[] = [];

  addOtherJaptSamanDetail() {
    this.listOfOtherJaptSamanDetail.push({
      jabti_saman_type: '5', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
    });
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


  get totalChattaNag(): number {
    return this.listOfChattaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  kasthHalatList = [
    { id: 1, name: 'इमारती' },
    { id: 2, name: 'अर्ध इमारती' },
    { id: 3, name: 'जलाऊ' }
  ];


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
      one_golai_less: string,
      form_factor: string,
      motai: string,
      unchai: string,
      kasth_halat: number,
      is_janch_karta_entry: boolean;
      site_quality: number;
      can_delete: boolean;
    }[] = [];

  // !row.is_janch_karta_entry

  isReadOnly(item: any): boolean {
    if (item.is_janch_karta_entry) {
      return true;
    }
    return false;
  }

  isDarReadOnly(row: any): boolean {
    if (row.is_dar_editable) {
      return false;
    } else {
      return true;
    }
  }

  isJanchKartaEntry(item: any): boolean {

    if (!item.is_janch_karta_entry) {
      return true;
    }
    return false;
  }

  addThunthInfo() {

    this.listOfThunthDetail.push({
      jabti_saman_type: '1', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', one_golai_less: '', form_factor: '', motai: '', unchai: '', kasth_halat: 0,
      is_janch_karta_entry: false, site_quality: 0, can_delete: true
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
    }[] = [];

  addChiranInfo() {
    this.listOfChiranaDetail.push({
      jabti_saman_type: '4', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
    });
  }

  addKasthaInfo() {
    this.listOfKashthaDetail.push({
      jabti_saman_type: '2', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
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
      kasth_halat: number,
      is_yogya_to_parivahan: string, /// 0-no,1-yes
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
    }[] = [];

  addBalliInfo() {
    this.listOfBalliDetail.push({
      jabti_saman_type: '6', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '', unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
    });
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

  allowOnlyRangePatternForWarg(event: KeyboardEvent) {
    const allowed = /^[0-9-]$/;   // Only numbers and dash

    if (!allowed.test(event.key)) {
      event.preventDefault();  // BLOCK letters like "r" or "e"
    }
  }

  async removeBalliInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप बल्ली की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfBalliDetail.length) {
      this.listOfBalliDetail.splice(index, 1);
    }
  }


  async removeThunthInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप ठूंठ की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfThunthDetail.length) {
      this.listOfThunthDetail.splice(index, 1);
    }

    this.getTotalVanopajRashi();
    this.updateTotalThunthRashi();

  }

  async removeKashthaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप लट्ठा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfKashthaDetail.length) {
      this.listOfKashthaDetail.splice(index, 1);
    }

    this.getTotalVanopajRashi();

  }

  async removeChiranInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप चिरान की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfChiranaDetail.length) {
      this.listOfChiranaDetail.splice(index, 1);
    }
  }


  async selectAccussedFoundDate() {

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

        this.accussed_found_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }




  async selectActualCrimeDate() {

    const modal = await this.modalController.create({
      component: SelectActualCrimeDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {

        const date = new Date(this.sharedService.getSelectedActualCrimeDate());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        this.actual_crime_date = `${yyyy}-${mm}-${dd}`;
        this.actual_crime_date = this.formatDateString(this.actual_crime_date);

      }

    });

    await modal.present();

  }








  async selectPrativedanSubmissionDate() {

    const modal = await this.modalController.create({
      component: SelectApradhPrakranaDialogComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {

        const date = new Date(this.sharedService.getSelectedApradhPrativedanDate());
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        this.apradh_prativend_jama_date = `${yyyy}-${mm}-${dd}`;

      }

    });

    await modal.present();

  }


  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }


  calculateGhanMeter(row: any) {

    const nag = parseFloat(row.nag) || 0;
    const form_factor = parseFloat(row.form_factor);
    row.ghan_meter = (nag * form_factor).toFixed(3);

    this.updateCostThunth(row);
    this.getTotalVanopajRashi();
    this.updateTotalThunthRashi();

  }

  get totalAnumanitRashi(): number {
    return this.listOfOtherJaptSamanDetail.reduce(
      (sum, item) => sum + (Number(item.total_cost) || 0),
      0
    );
  }

  updateAnumanitRashi() {

    this.getTotalVanopajRashi();

  }

  updateCostThunth(item: any) {


    if (this.isThunthCalculationFromFormFactor) {
      const ghan_meter = parseFloat(item.ghan_meter) || 0;
      const dar = parseFloat(item.dar) || 0;
      item.total_cost = (ghan_meter * dar).toFixed(2);
    } else {
      const totalCount = parseFloat(item.nag) || 0;
      const dar = parseFloat(item.dar) || 0;
      item.total_cost = (totalCount * dar).toFixed(2);
    }

    this.updateTotalCostOfThunth();
    this.getTotalVanopajRashi();

  }

  totalCostOfThunth: number = 0;
  totalCostOfKasth: number = 0;
  totalCostOfChiran: number = 0;
  totalCostOfThunthAndKasth: number = 0;

  updateTotalCostOfThunth() {
    // reset first
    this.totalCostOfThunth = 0;

    // japti saman
    this.totalCostOfThunthAndKasth = this.listOfjaptiSaman.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    // thunth
    this.totalCostOfThunth = this.listOfThunthDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    // kastha
    this.totalCostOfKasth = this.listOfKashthaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    this.totalCostOfChiran = this.listOfChiranaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);


    this.getTotalVanopajRashi();

  }

  updateTotal(item: any) {

    // const ghan_meter = parseFloat(item.ghan_meter) || 0;
    // const dar = parseFloat(item.dar) || 0;
    // item.total_cost = (ghan_meter * dar).toFixed(3);

    if (this.isThunthCalculationFromFormFactor) {
      const ghan_meter = parseFloat(item.ghan_meter) || 0;
      const dar = parseFloat(item.dar) || 0;
      item.total_cost = (ghan_meter * dar).toFixed(2);
    } else {
      const totalCount = parseFloat(item.nag) || 0;
      const dar = parseFloat(item.dar) || 0;
      item.total_cost = (totalCount * dar).toFixed(2);
    }

    this.updateTotalThunthRashi();
    this.getTotalVanopajRashi();
  }

  get totalThunthNag(): number {
    return this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalThunthGhanMeter(): number {
    return parseFloat(this.listOfThunthDetail.reduce(
      (sum, item) => sum + (Number(item.ghan_meter) || 0),
      0
    ).toFixed(3));
  }


  calculateGhanMeterKastha(row: any) {
    const golai = parseFloat(row.golai) || 0;
    const lambai = parseFloat(row.lambai) || 0;
    const nag = parseFloat(row.nag) || 0;

    row.ghan_meter = ((lambai * (golai * golai)) / 160000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);

    this.updateCostKasth(row);

  }

  calculateTotalBalliRashi(row: any) {
    const nag = parseFloat(row.nag) || 0;
    const dar = parseFloat(row.dar) || 0;

    row.total_cost = (dar * nag).toFixed(2);

    this.getTotalVanopajRashi();
  }

  updateCostKasth(item: any) {
    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.updateTotalCostOfThunth();
    this.getTotalVanopajRashi();

  }

  get totalKashthNag(): number {
    return this.listOfKashthaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliNag(): number {
    return this.listOfBalliDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalBalliRashi(): string {
    return this.listOfBalliDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  get totalKashthGhanMeter(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalKashthRashi(): string {
    return this.listOfKashthaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  calculateGhanMeterChiran(row: any) {
    const lambai = parseFloat(row.lambai) || 0;
    const chodai = parseFloat(row.golai) || 0;
    const motai = parseFloat(row.motai) || 0;
    const nag = parseFloat(row.nag) || 0;

    row.ghan_meter = ((lambai * chodai * motai) / 10000) * nag;

    row.ghan_meter = row.ghan_meter.toFixed(3);

    this.getChiraanPriceSingleValue(row);

  }

  updateCostChiran(item: any) {

    const ghan_meter = Number(item.ghan_meter) || 0;
    const dar = Number(item.dar) || 0;
    item.total_cost = Math.round(ghan_meter * dar);

    this.updateTotalCostOfThunth();

  }

  get totalChiranNag(): number {
    return this.listOfChiranaDetail.reduce(
      (sum, item) => sum + (Number(item.nag) || 0),
      0
    );
  }

  get totalChiranGhanMeter(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.ghan_meter) || 0), 0)
      .toFixed(3);
  }

  get totalChiranRashi(): string {
    return this.listOfChiranaDetail
      .reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0)
      .toFixed(0);
  }

  updateTotalChattaRashi(item: any) {
    const nag = parseFloat(item.nag) || 0;
    const dar = parseFloat(item.dar) || 0;
    item.total_cost = (nag * dar).toFixed(3);

    this.totalChattaRashi = this.listOfChattaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    this.getTotalVanopajRashi();

  }

  async removeChattaInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप जलाऊ चट्टा की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfChattaDetail.length) {
      this.listOfChattaDetail.splice(index, 1);
    }

    this.totalChattaRashi = this.listOfChattaDetail.reduce((sum, item) => {
      const cost = parseFloat(item.total_cost) || 0;
      return sum + cost;
    }, 0);

    this.getTotalVanopajRashi();

  }

  onAccusedChoiceChange(event: any) {
    this.isAccusedWantToAbhisandhanit = event.detail.value === 'true';
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

  async takeRajiNamaPhoto() {
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
              source: CameraSource.Camera
            });

            if (image.dataUrl) {
              this.openRajinamaCropper(image.dataUrl);
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
              source: CameraSource.Photos
            });

            if (image.dataUrl) {
              this.openRajinamaCropper(image.dataUrl);
            }
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
    // ss120326end

  }

  openRajinamaCropper(imageDataUrl: string) {
    this.originalImageDataUrl = imageDataUrl;
    this.previewImageDataUrl = imageDataUrl;
    this.isImagePreviewModalOpen = true;

    // Wait for modal + img to render
    setTimeout(() => {
      this.initializeCropperForRajinama();
    }, 300);
  }

  async initializeCropperForRajinama() {
    if (!this.imagePreviewElement?.nativeElement) {
      setTimeout(() => this.initializeCropperForRajinama(), 100);
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
        setTimeout(() => resolve(false), 5000);
      });
    }

    const Cropper = (await import('cropperjs')).default;

    // Destroy existing instance
    if (this.cropperInstance) {
      try {
        this.cropperInstance.destroy();
      } catch (e) {
        // ignore
      }
      this.cropperInstance = null;
    }

    // Ensure image is visible
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.height = 'auto';

    this.cropperInstance = new Cropper(img, {
      aspectRatio: undefined,
      viewMode: 1,
      dragMode: 'crop',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      zoomable: true,
      scalable: true,
      rotatable: false,
      ready: () => {
        if (this.cropperInstance) {
          try {
            this.cropperInstance.center();
          } catch (e) {
            // ignore
          }
        }
      }
    } as any);
  }

  approveRajinamaImage() {
    if (!this.cropperInstance) {
      this.closeRajinamaCropper();
      return;
    }

    const canvas = this.cropperInstance.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      maxWidth: 1920,
      maxHeight: 1920,
    });

    if (!canvas) {
      this.closeRajinamaCropper();
      return;
    }

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.rajinamaPhoto = croppedDataUrl;
    this.closeRajinamaCropper();
  }

  rejectRajinamaImage() {
    this.closeRajinamaCropper();
  }

  closeRajinamaCropper() {
    if (this.cropperInstance) {
      try {
        this.cropperInstance.destroy();
      } catch (e) {
        // ignore
      }
      this.cropperInstance = null;
    }
    this.isImagePreviewModalOpen = false;
    this.previewImageDataUrl = '';
    this.originalImageDataUrl = '';
  }

  rajinamaPhoto: string = "";

  submitPativedan() {

    if (this.workLogList.length === 0) {
      this.showError("आपने कार्यवाही तख्ता की जानकारी प्रविष्ट नहीं की है , कृपया कार्यवाही तख्ता पहले प्रविष्ट करें |");
      return;
    }

    const formData = new FormData();

    formData.append('prativedan_kramank', this.apradh_prativend_kramank);

    formData.append('prativedan_dinank', this.apradh_prativend_jama_date);


    if (this.actual_crime_date != null && this.actual_crime_date != "") {
      formData.append('actual_crime_date', this.formatDateStringIntoYYYYMMDD(this.actual_crime_date));
    } else {
      formData.append('actual_crime_date', "");
    }


    formData.append('accussed_found_date_in_case_of_agyat', this.accussed_found_date);

    formData.append('japtsuda_saman_supurd_emp_name', this.japtsuda_saman_supurd_emp_name);
    formData.append('janchkarta_adhikari_ka_name', this.janch_adhikari_ka_name);
    formData.append('past_crim_record_of_apradhi', this.apradhi_ke_purv_apradh_ka_vivran);

    let isWantToAbhisandhanit = "0";
    if (this.isAccusedWantToAbhisandhanit) {
      isWantToAbhisandhanit = "1";
    }

    formData.append('is_accussed_want_to_abhisandhanit', isWantToAbhisandhanit.toString());

    if (this.rajinamaPhoto != "") {
      const blob = this.dataURLtoBlob(this.rajinamaPhoto);
      formData.append('rajinama_ka_photo', blob, `photo_rajinama_ki_pic.jpg`);
    }
    formData.append('accussed_financial_condition', this.accussedFinancialCondition.toString());

    if (this.isShowEditDharaBox) {

      if (this.reasonToDeleteDhara === "") {
        this.showError("अपराध और घटना स्थल का विवरण परिवर्तित करने का कारण दर्ज करें | ");
        return;
      }

      formData.append('reason_to_delete_dhara', this.reasonToDeleteDhara);

      const commaSeparatedCompartment = this.clipboardCompartment
        .map(d => `${d.name}`)
        .join(', ');

      formData.append('compartment_number', commaSeparatedCompartment);
      formData.append('compartment_option', this.selectedCompartmentOption || '');
      formData.append('place_of_crime', this.crimePlace);
      formData.append('typeOfCrime', this.selectedCrimType);

      let crimeDhara = "";

      if (this.selectedDharaNewItems && this.selectedDharaNewItems.length > 0) {
        const mappedDhara = this.selectedDharaNewItems
          .map((x: any) => `${String(x?.adhiniyam ?? '').trim()} - ${String(x?.dhara ?? '').trim()}`)
          .filter(s => s !== '-' && s.trim() !== '')
          .join(', ');

        if (mappedDhara && mappedDhara.trim() !== '') {
          crimeDhara = mappedDhara;
        }
      }

      if (!crimeDhara || crimeDhara.trim() === '') {
        this.shortToast("अपराथ की धारा चुने");
        return;
      }

      formData.append('crime_dhara', crimeDhara);

    } else {


      formData.append('reason_to_delete_dhara', "");

      formData.append('compartment_number', this.comingComplaintData.compartment_number);
      formData.append('compartment_option', this.comingComplaintData.compartment_option || '');
      formData.append('place_of_crime', this.comingComplaintData.place_of_crime);
      formData.append('typeOfCrime', this.comingComplaintData.type_of_crime);
      formData.append('crime_dhara', this.comingComplaintData.crime_dhara);
    }

    //    if (this.isEditAccussedDetail) {

    var is_accused_found = "0";
    if (this.isAccussedFound === true) {
      is_accused_found = "1";
    }

    formData.append('is_accused_found', is_accused_found);

    if (this.isAccussedFound && this.accusedPersons.length > 0) {
      const accusedPersonsData: any[] = [];

      for (let i = 0; i < this.accusedPersons.length; i++) {
        const person = this.accusedPersons[i];

        accusedPersonsData.push({
          Name: person.name || "",
          FathersName: person.fathersName || "",
          Address: person.address || "",
          Cast: person.cast || "",
          AccussedTableId: person.accussed_person_table_id,
          Age: person.age || "",
          ActualCast: person.jati_name,
          mobile_number: person.mobile_number,
          aadhaar_number: person.aadhaar_number ?? ''
        });

      }

      formData.append('accusedName', this.accusedPersons[0].name);
      formData.append('accusedFathersName', this.accusedPersons[0].fathersName);
      formData.append('accusedCast', this.accusedPersons[0].cast);
      formData.append('accusedAddress', this.accusedPersons[0].address);
      formData.append('AccusedPersons', JSON.stringify(accusedPersonsData));
    } else {
      formData.append('accusedName', '');
      formData.append('accusedFathersName', '');
      formData.append('accusedCast', '');
      formData.append('accusedAddress', '');
      formData.append('AccusedPersons', JSON.stringify([]));
    }
    // } else {



    //   formData.append('is_accused_found', this.comingComplaintData.is_accused_found);

    //   this.accusedPersons = this.comingComplaintData.accusedPersons || [];


    //   if (this.comingComplaintData.is_accused_found && this.accusedPersons.length > 0) {

    //     const incomingAccusedPersons = this.accusedPersons[0] as unknown as AccussedDetailLocal;


    //     // let personValue = incomingAccusedPersons?.map(p => ({
    //     //   ActualCast: p.jati_name || "", // if available
    //     //   Address: p.fathersName || "", // default null,
    //     //   Age: p.age,
    //     //   Cast: p.jati_name,
    //     //   Name: p.name,
    //     //   FathersName: p.fathersName,
    //     //   mobile_number: p.mobile_number
    //     // })) as AccussedDetailLocal[];

    //     const accusedPersonsData = {
    //       Name: incomingAccusedPersons.Name || "",
    //       FathersName: incomingAccusedPersons.FathersName || "",
    //       Address: incomingAccusedPersons.Address || "",
    //       Cast: incomingAccusedPersons.Cast || "",
    //       AccussedTableId: "",
    //       Age: incomingAccusedPersons.Age || "",
    //       ActualCast: incomingAccusedPersons.ActualCast || "",
    //       mobile_number: incomingAccusedPersons.mobile_number || ""
    //     };


    //     formData.append('accusedName', this.accusedPersons[0].name);
    //     formData.append('accusedFathersName', this.accusedPersons[0].fathersName);
    //     formData.append('accusedCast', this.accusedPersons[0].cast);
    //     formData.append('accusedAddress', this.accusedPersons[0].address);
    //     formData.append('AccusedPersons', JSON.stringify(accusedPersonsData));
    //   } else {
    //     formData.append('accusedName', '');
    //     formData.append('accusedFathersName', '');
    //     formData.append('accusedCast', '');
    //     formData.append('accusedAddress', '');
    //     formData.append('AccusedPersons', JSON.stringify([]));
    //   }

    // }

    let isValidThunthEntry = true;
    let isValidKasthEntry = true;
    let isValidChiranEntry = true;
    let isValidFencinPolEntry = true;
    let isValidJalauEntry = true;
    let isValidBalliEntry = true;
    let isValidBanshEntry = true;



    var msg = "";

    for (let i = 0; i < this.listOfOtherJaptSamanDetail.length; i++) {
      const row = this.listOfOtherJaptSamanDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "अन्य जप्त सामान: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "अन्य जप्त सामान: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }

    // लट्ठा (Kashtha)
    for (let i = 0; i < this.listOfKashthaDetail.length; i++) {
      const row = this.listOfKashthaDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "लट्ठा: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "लट्ठा: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }



    // बल्ली (Balli)
    for (let i = 0; i < this.listOfBalliDetail.length; i++) {
      const row = this.listOfBalliDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "बल्ली: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "बल्ली: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }

    // चिरान (Chirana)
    for (let i = 0; i < this.listOfChiranaDetail.length; i++) {
      const row = this.listOfChiranaDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "चिरान: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "चिरान: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }

    // फेंसिंग पोल (Fencing Pole)
    for (let i = 0; i < this.listOfFencingPolDetail.length; i++) {
      const row = this.listOfFencingPolDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "फेंसिंग पोल: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "फेंसिंग पोल: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }

    // जलाऊ चट्टा (Chatta)
    for (let i = 0; i < this.listOfChattaDetail.length; i++) {
      const row = this.listOfChattaDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "जलाऊ चट्टा: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "जलाऊ चट्टा: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }

    // बाँस (Bans)
    for (let i = 0; i < this.listOfBanshDetail.length; i++) {
      const row = this.listOfBanshDetail[i];
      if (!row.is_yogya_to_parivahan) {
        msg = "बाँस: क्या वनोपज काष्ठागार में परिवहन किया जाना है? चुनें";
        break;
      }
      if (row.is_yogya_to_parivahan === "0" && row.if_not_yogya_then_reason === "") {
        msg = "बाँस: यदि नहीं, तो कारण दर्ज करें";
        break;
      }
    }


    if (msg != "") {
      this.showError(msg);
      return;
    }




    for (let i = 0; i < this.listOfFencingPolDetail.length; i++) {
      const row = this.listOfFencingPolDetail[i];

      if (
        !row.prajati_type ||
        !row.nag ||
        !row.dar ||
        !row.total_cost
      ) {
        isValidFencinPolEntry = false;

        break;
      }
    }

    if (!isValidFencinPolEntry) {
      this.showError("फेंसिंग पोल की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfBanshDetail.length; i++) {
      const row = this.listOfBanshDetail[i];

      if (
        !row.prajati_type ||
        !row.lambai ||
        !row.nag ||
        !row.dar ||
        !row.total_cost ||
        !row.ghan_meter
      ) {
        isValidBanshEntry = false;

        break;
      }
    }

    if (!isValidBanshEntry) {
      this.showError("बाँस की सम्पूर्ण जानकारी भरें");
      return;
    }




    for (let i = 0; i < this.listOfThunthDetail.length; i++) {
      const row = this.listOfThunthDetail[i];

      if (
        !row.prajati_type ||
        !row.nag ||
        !row.golai ||
        !row.one_golai_less ||
        !row.dar ||        // 0 allowed
        !row.total_cost
      ) {
        isValidThunthEntry = false;
        break;
      }
    }
    ;
    if (!isValidThunthEntry) {
      this.showError("ठूंठ की सम्पूर्ण जानकारी भरें");
      return;
    }

    for (let i = 0; i < this.listOfKashthaDetail.length; i++) {
      const row = this.listOfKashthaDetail[i];

      if (
        !row.prajati_type ||
        !row.lambai ||
        !row.golai ||
        !row.nag ||
        !row.dar ||
        !row.total_cost ||
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

      if (
        !row.prajati_type ||
        !row.lambai ||
        !row.golai ||
        !row.nag ||
        !row.dar ||
        !row.total_cost
      ) {
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

      if (
        !row.prajati_type ||
        !row.motai ||
        !row.lambai ||
        !row.golai ||
        !row.nag ||
        !row.dar ||
        !row.total_cost ||
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

      if (
        !row.prajati_type ||
        !row.nag ||
        !row.dar ||
        !row.total_cost
      ) {
        isValidJalauEntry = false;

        break;
      }
    }

    if (!isValidJalauEntry) {
      this.showError("जलाऊ की सम्पूर्ण जानकारी भरें");
      return;
    }

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

      if (
        !row.if_other_then_detail ||
        !row.total_cost
      ) {
        isValidOtherJaptSamanEntry = false;

        break;
      }

    }

    if (!isValidOtherJaptSamanEntry) {
      this.showError("अन्य जप्त सामान की सम्पूर्ण जानकारी भरें");
      return;
    }

    let isValidJaptVahanDetail: boolean = true;
    ;
    for (let i = 0; i < this.listOfJaptVahanDetail.length; i++) {
      const row = this.listOfJaptVahanDetail[i];
      // 

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



    if (!isValidJaptVahanDetail) {
      this.showError("जप्त वाहन की सभी जानकारी प्रविस्ट करिये");
      return;
    }


    formData.append('japt_vahan_detail', JSON.stringify(this.listOfJaptVahanDetail));


    formData.append('japt_saman_total_price', this.totalThunthRashi.toString());
    formData.append('found_vanopaj_total_price', this.totalVanopajRashi.toString());
    formData.append('actual_loss_total_price', this.totalCostOfVastawikHani.toString());
    formData.append('mahsul_total_price', this.totalCostOfMahsul.toString());
    formData.append('mavja_total_price', this.totalCostOfMuwavja.toString());

    formData.append('shesh_vasuli_rashi', this.sheshVasuliRashi.toString());

    formData.append('ra_anushansha', this.ra_ki_anushanasha.toString());

    formData.append('reason_to_update_accussed', this.reasonToDeleteOrAddAccussed.toString());

    formData.append('reason_to_update_vanopaj', this.reasonToUpdateDar.toString());

    if (this.japtsuda_saman_supurd_emp_name === "") {
      this.showError("जप्तशुदा माल को जिसके सुपुर्द किया गया");
      return;
    }
    if (this.janch_adhikari_ka_name === "") {
      this.showError("जाँच अधिकारी का नाम एवं पद");
      return;
    }
    if (this.janch_ki_awadhi === "") {
      this.showError("जाँच की अवधि");
      return;
    }
    if (this.isAccusedWantToAbhisandhanit && this.rajinamaPhoto === "") {
      this.showError("राजी नामा का फोटो");
      return;
    }

    // if (this.totalCostOfVastawikHani === 0) {
    //   this.showError(" वास्तविक हानि की कुल राशि प्रेषित करें ");
    //   return;
    // }

    if (this.isAccussedFound && this.accussedFinancialCondition === "") {
      this.showError("अपराधी की आर्थिक परिस्थिति का विवरण");
      return;
    }

    if (this.ra_ki_anushanasha === "") {
      this.showError("जाँच अधिकारी की अनुशंषा");
      return;
    }

    if (this.jachkartaDecision !== 0 && this.jachkartaDecision !== 1) {
      this.showError("जाँचकर्ता अधिकारी की अनुशंषा चुनें");
      return;
    }



    formData.append('emp_id', this.loginedOfficerEmpId.toString());
    formData.append('complain_id', this.comingComplaintData.complain_id);
    formData.append('is_final_submit', "1");
    formData.append('jachkarta_decision', this.jachkartaDecision.toString());

    const mergedList = [...this.listOfThunthDetail, ...this.listOfKashthaDetail, ...this.listOfChiranaDetail, ...this.listOfChattaDetail, ...this.listOfBalliDetail, ...this.listOfOtherJaptSamanDetail, ...this.listOfBanshDetail, ...this.listOfFencingPolDetail];

    formData.append('japti_saman_data', JSON.stringify(mergedList));
    formData.append('complain_history_table_id', this.comingComplaintData.complain_history_table_id);

    if (this.isEditDarDetail) {
      if (this.reasonToUpdateDar === "") {
        this.showError("वनोपज एवं अन्य वस्तुओं के विवरण में बदलाव का कारण स्पष्ट रूप से प्रेषित करें");
        return;
      }
    }

    let isValidWitnessEntry = true;

    if (this.isEditWitnessDetail) {

      for (let i = 0; i < this.listOfWitness.length; i++) {
        const row = this.listOfWitness[i];

        if (
          !row.naam ||
          !row.pita_ka_naam ||
          !row.age ||
          !row.pata ||
          !row.jaati
        ) {
          isValidWitnessEntry = false;

          break;
        }
      }

      if (!isValidWitnessEntry) {
        this.showError("साक्षियों  की सम्पूर्ण जानकारी भरें");
        return;
      }

      if (this.reasonToUpdateWitnessDetail === "") {
        this.showError("साक्षियों के विवरण में बदलाव का कारण स्पष्ट रूप से प्रेषित करें");
        return;
      }

    }

    formData.append('reason_to_update_witness', this.reasonToUpdateWitnessDetail);

    formData.append('witness_detail', JSON.stringify(this.listOfWitness));


    this.showDialog('जमा किया जा रहा है कृपया इंतजार करें');
    this.apiService.submitPrakranPrativedan(formData).subscribe(
      (response) => {
        this.dismissDialog();

        if (response.response.code === 200) {
          this.afterSubmitLog(response.response.msg, true);
          this.sharedService.setRefresh(true);
        } else {
          //this.longToast(response.response.msg);
          this.showError(response.response.msg)
        }

      },
      (error) => {
        this.dismissDialog();
        //this.longToast(error);
        this.showError(error);
      }
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

  async afterSubmitLog(msg: string, isGoBack: boolean) {

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        if (isGoBack) {
          this.goBack();
        }
      }
    });

    await modal.present();
  }


  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }, 0);
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

  async cancel() {
    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप इस क्रिया को रद्द करना चाहते हैं ?',
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

  handleBackButton() {
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

  validateOneLessGolai(row: any) {

    // const value = row.one_golai_less;

    // const pattern = /^[0-9]{1,3}-[0-9]{1,3}$/;

    // if (value && !pattern.test(value)) {
    //   const partial = /^[0-9-]*$/;

    //   if (!partial.test(value)) {
    //     row.one_golai_less = value.slice(0, -1); 
    //   }
    // }



  }

  allowOnlyRangePatternForThunthGolai(event: KeyboardEvent) {
    const allowed = /^[0-9-]$/;   // Only numbers and dash

    if (!allowed.test(event.key)) {
      event.preventDefault();  // BLOCK letters like "r" or "e"
    }
  }

  challanDetailList: ChallanDetailResponseModal[] = [];
  workLogList: Array<WorkLogResponseModal & { work_log_images_array?: string[] }> = [];
  whenAssignJanchkartaDetail: WorkLogResponseModal[] = [];
  finalWorkLogList: FInalWorkLogResponseModal[] = [];
  porHistoryLogList: GetComplainHistoryResponseModal[] = [];
  listOfAlreadySubmittedVasuliDetail: VasuliViranDetailRequestModal[] = [];

  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService
      .getRAWorkLogList(this.comingComplaintData.complain_id)
      .pipe(
        finalize(() => {
          //
          this.dismissDialog(); // ✅ always called
        })
      )
      .subscribe(
        (response) => {
          if (response.response.code === 200) {

            this.workLogList = response.data || [];
            debugger;
            if (this.workLogList.length === 0) {
              this.showError("आपने कार्यवाही तख्ता की जानकारी प्रविष्ट नहीं की है , कृपया कार्यवाही तख्ता पहले प्रविष्ट करें |");
            }
            this.whenAssignJanchkartaDetail = response.when_assign_janchkarta_adhikari || [];
            this.workLogList.forEach((item) => {
              // Normalize work log images (same shape used in ra-work-log)
              const anyItem = item as any;
              if (anyItem.work_log_images && anyItem.work_log_images.trim() !== '') {
                item.work_log_images_array = anyItem.work_log_images
                  .split(',')
                  .filter((name: string) => name.trim() !== '')
                  .map((name: string) => name.trim());
              } else {
                (item as any).work_log_images_array = [];
              }
            });
            this.finalWorkLogList = response.final_log;

            this.porHistoryLogList = response.por_history;
            this.challanDetailList = response.challan_detail;
            this.listOfAlreadySubmittedVasuliDetail = response.vasuli_detail;

            const lastRecord = this.porHistoryLogList[this.porHistoryLogList.length - 1];
            const pastDate = new Date(lastRecord.complain_created_at);
            const now = new Date();

            const diffMs = now.getTime() - pastDate.getTime();
            this.janch_ki_awadhi =
              (Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1).toString();

            if (this.listOfAlreadySubmittedVasuliDetail.length > 0) {
              const totalMavjaRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
                (sum, item) => sum + (Number(item.mavja_rashi) || 0),
                0
              );
              const totalMahsulRashi = this.listOfAlreadySubmittedVasuliDetail.reduce(
                (sum, item) => sum + (Number(item.mahsul_rashi) || 0),
                0
              );
              this.totalVasuliRashi = (totalMahsulRashi + totalMavjaRashi).toString();
            }


            if (this.finalWorkLogList && this.finalWorkLogList.length > 0) {

              let finalWorkLogValue = this.finalWorkLogList[0];

              this.janch_adhikari_ka_name = finalWorkLogValue.ra_name;
              this.accussed_found_date = finalWorkLogValue.accussed_found_date_in_case_of_agyat;
              this.totalThunthRashi = (finalWorkLogValue.japt_saman_total_price);
              this.totalVanopajRashi = finalWorkLogValue.found_vanopaj_total_price;
              this.totalCostOfVastawikHani = Number(finalWorkLogValue.actual_loss_total_price);
              this.totalCostOfMahsul = finalWorkLogValue.mahsul_total_price;
              this.totalCostOfMuwavja = finalWorkLogValue.mavja_total_price;

              this.accussedFinancialCondition = finalWorkLogValue.accussed_financial_condition;
              this.ra_ki_anushanasha = finalWorkLogValue.ra_anushansha;

              this.totalOfMahsulAndMawja = Number(finalWorkLogValue.mahsul_total_price) +
                Number(finalWorkLogValue.mavja_total_price);

              this.japtsuda_saman_supurd_emp_name = finalWorkLogValue.japt_suda_saman_jinko_diya_gaya;
              this.apradhi_ke_purv_apradh_ka_vivran = finalWorkLogValue.past_crim_record_of_accussed;
              if (finalWorkLogValue.is_accussed_want_to_abhisandhanit === "0") {
                this.isAccusedWantToAbhisandhanit = false;
              } else {
                this.isAccusedWantToAbhisandhanit = true;
                this.rajinamaPhotoUrl = finalWorkLogValue.raji_nama_pic;
              }

            }


          }
        },
        (error) => {
          console.error(error);
        }
      );

  }

  listOfJaptVahanDetail:
    {
      vahan_prakar: string;
      vahan_kramank: string,
      anumanit_mulya: string,
      malik_ka_name?: string,
      malik_name?: string;
      malik_k_father_ka_name?: string,
      pita_ka_name?: string,
      pata: string,
      tahsil: string,
      jila: string
    }[] = [];


  async showImageAlert(imageUrl: string) {

    const modal = await this.modalController.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: {
        imageUrl: this.filePath + "/" + imageUrl
      },
      backdropDismiss: true,
    });

    await modal.present();

  }

  // ss120326start
  /** Opens full-screen preview for base64 image (e.g. newly uploaded rajinama photo). Same as view-complain-detail3. */
  async showBase64ImageAlert(dataUrl: string) {
    if (!dataUrl || dataUrl.trim() === '') return;
    const modal = await this.modalController.create({
      component: ImagePreviewModalComponent,
      cssClass: 'custom-dialog-modal-full-screen',
      componentProps: { imageUrl: dataUrl },
      backdropDismiss: true,
    });
    await modal.present();
  }
  // ss120326end

  filePath: string = "";

  getFullPathImage(photoName: string): string {
    //
    return this.filePath + "/" + photoName;
  }

  rajinamaPhotoUrl: string = "";



  workLogTableIdMyProperty: number = 0;

  // getDetailOfComplain() {

  //   this.showDialog("कृपया प्रतीक्षा करें");
  //   
  //   this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
  //     (response) => {
  //       this.dismissDialog();
  //       
  //       if (response.response.code === 200) {

  //         if (response.complainData && response.complainData.length > 0) {
  //           this.comingComplaintData = response.complainData[0];


  //           

  //           if (this.comingComplaintData.finalWorkLogDetailByRa != null) {

  //             if (this.comingComplaintData.finalWorkLogDetailByRa.length > 0) {

  //               let finalWorkLog = this.comingComplaintData.finalWorkLogDetailByRa[0];

  //               if (this.comingComplaintData.is_accused_found === "1") {
  //                 this.isAccussedFound = false;
  //                 this.accussed_found_date = this.comingComplaintData.date_of_crime;
  //               } else {
  //                 this.accussed_found_date = finalWorkLog.accussed_found_date_in_case_of_agyat;
  //               }

  //               this.japtsuda_saman_supurd_emp_name = finalWorkLog.japt_suda_saman_jinko_diya_gaya;
  //               this.totalThunthRashi = Number(finalWorkLog.japt_saman_total_price);
  //               this.totalVanopajRashi = finalWorkLog.found_vanopaj_total_price;
  //               this.totalCostOfVastawikHani = Number(finalWorkLog.actual_loss_total_price);

  //               this.totalCostOfMahsul = finalWorkLog.mahsul_total_price;
  //               this.totalCostOfMuwavja = finalWorkLog.mavja_total_price;
  //               this.totalOfMahsulAndMawja = Number(finalWorkLog.mahsul_total_price) + Number(finalWorkLog.mavja_total_price);

  //               this.japtsuda_saman_supurd_emp_name = finalWorkLog.japt_suda_saman_jinko_diya_gaya;
  //               this.janch_adhikari_ka_name = finalWorkLog.ra_name;

  //               this.apradhi_ke_purv_apradh_ka_vivran = finalWorkLog.past_crim_record_of_accussed;

  //               this.workLogTableIdMyProperty = finalWorkLog.workLogTableIdMyProperty;

  //               if (finalWorkLog.is_accussed_want_to_abhisandhanit === "1") {
  //                 this.isAccusedWantToAbhisandhanit = true;
  //               } else {
  //                 this.isAccusedWantToAbhisandhanit = false;
  //               }

  //               this.accussedFinancialCondition = finalWorkLog.accussed_financial_condition;

  //               this.ra_ki_anushanasha = finalWorkLog.ra_anushansha;

  //             }

  //           }



  //           this.chinhaPhoto = this.comingComplaintData.chinhaPhoto;
  //           this.japtinama_anya_vishesh_vivran = this.comingComplaintData.japtinama_anya_vishesh_vivran;

  //           if (this.comingComplaintData.isJaptikartaAndSupurdarSame === "0") {
  //             this.is_japtikarta_and_supurddar_same = true;
  //           } else {
  //             this.is_japtikarta_and_supurddar_same = false;
  //           }

  //           this.supurddar_ka_name = this.comingComplaintData.supurddar_ka_name;
  //           this.supurddar_ka_pita_ka_name = this.comingComplaintData.supurddar_ka_pita_ka_name;
  //           this.supurdar_ka_jati = this.comingComplaintData.supurdar_ka_jati;
  //           this.supurddar_ka_vyavsay = this.comingComplaintData.supurddar_ka_vyavsay;
  //           this.supurdar_ka_poora_pata = this.comingComplaintData.supurdar_ka_poora_pata;
  //           this.supurd_me_lene_ka_dinank = this.comingComplaintData.supurd_me_lene_ka_dinank;

  //           this.japtikarta_ka_name = this.comingComplaintData.japtikarta_ka_name;
  //           this.japtikarta_ka_pad = this.comingComplaintData.japtikarta_ka_pad;
  //           this.supurddar_sign = this.comingComplaintData.supurddar_sign;

  //           this.complainer_name = this.comingComplaintData.complainer_name;
  //           this.complainer_pad = this.comingComplaintData.complainer_pad;

  //           this.complainer_sign = this.comingComplaintData.complainer_sign;
  //           this.apradhi_ki_photo = this.comingComplaintData.apradhi_photo;
  //           this.por_ki_photo = this.comingComplaintData.por_photo;
  //           this.supurd_nama_photo = this.comingComplaintData.supurd_nama_photo;
  //           this.japti_nama_photo = this.comingComplaintData.japti_nama_photo;
  //           this.panch_nama_photo = this.comingComplaintData.panch_nama_photo;

  //           this.beat_name = this.comingComplaintData.beat_name;

  //           this.accussedName = this.comingComplaintData.accused_name;
  //           this.accussedFatherName = this.comingComplaintData.accused_fathers_name;
  //           this.address = this.comingComplaintData.accused_address;
  //           this.accussedCast = this.comingComplaintData.cast_name;

  //           this.crimType = this.comingComplaintData.crime_type;
  //           this.crimeDate = this.comingComplaintData.date_of_crime;

  //           this.witness_name_first = this.comingComplaintData.name_of_witness_one;
  //           this.witness_name_second = this.comingComplaintData.name_of_witness_two;
  //           this.witness_address_first = this.comingComplaintData.address_of_witness_one;
  //           this.witness_address_second = this.comingComplaintData.address_of_witness_two;
  //           this.witness_sign_first = this.comingComplaintData.witness_1_sign;
  //           this.witness_sign_second = this.comingComplaintData.witness_2_sign;

  //           this.witnessDetailList.push({
  //             witnessName: this.witness_name_first,
  //             address: this.witness_address_first,
  //             sign: this.witness_sign_first,
  //             base64: null
  //           });
  //           this.witnessDetailList.push({
  //             witnessName: this.witness_name_second,
  //             address: this.witness_address_second,
  //             sign: this.witness_sign_second,
  //             base64: null
  //           });


  //           this.por_number = this.comingComplaintData.por_number;
  //           this.compartment_number = this.comingComplaintData.compartment_number;
  //           this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

  //           this.crimePlace = this.comingComplaintData.place_of_crime;
  //           this.seizedGoodDetail = this.comingComplaintData.details_of_seized_goods;
  //           this.lat = this.comingComplaintData.lat;
  //           this.lon = this.comingComplaintData.lng;
  //           this.complain_location_google_addres = this.comingComplaintData.map_address;

  //           this.listOfjaptiSaman = this.comingComplaintData.japtSamanList || [];



  //           if (this.comingComplaintData.all_image_name && this.comingComplaintData.all_image_name.trim() !== '') {
  //             this.photos = this.comingComplaintData.all_image_name
  //               .split(',')
  //               .filter(name => name.trim() !== '')
  //               .map(name => name.trim());
  //           }

  //           
  //           this.getWorkLog();




  //         }

  //         this.getComplainerSignIntoBase64();

  //       }


  //     },
  //     (error) => {
  //       this.dismissDialog();
  //     }
  //   );

  // }

  calculateSheshRashi() {
    this.sheshVasuliRashi = this.totalOfMahsulAndMawja - Number(this.totalVasuliRashi);
    if (this.sheshVasuliRashi < 0) {
      this.sheshVasuliRashi = 0;
    }
  }

  async removeOtherJaptiSaman(index: number) {
    const ok = await this.confirmYesNo("क्या आप अन्य जप्त सामग्री की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfOtherJaptSamanDetail.length) {
      this.listOfOtherJaptSamanDetail.splice(index, 1);
    }
  }

  onRadioChange(event: any) {
    this.isAccussedFound = event.detail.value
  }

  addAccusedPerson() {
    this.accusedPersons.push({
      name: "",
      fathersName: "",
      address: "",
      cast: "",
      signatureImage: "",
      base64: null,
      accussed_person_table_id: '',
      age: '',
      jati_name: '',
      mobile_number: '',
      aadhaar_number: '',
      show_delete_button: true
    });

    this.accusedCount = this.accusedPersons.length;

  }

  listOfCast: any = [];

  async removeAccusedPerson(index: number) {
    const ok = await this.confirmYesNo("क्या आप अभियुक्त की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    //if (this.accusedPersons.length > 1) {
    this.accusedPersons.splice(index, 1);
    // }
    this.accusedCount = this.accusedPersons.length;
  }

  async removeWitness(index: number) {
    const ok = await this.confirmYesNo("क्या आप साक्षी की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    this.listOfWitness.splice(index, 1);
  }

  addWitnessPerson() {

    if (!this.listOfWitness) {
      this.listOfWitness = [];
    }
    this.listOfWitness.push({
      id: "",
      naam: "",
      pita_ka_naam: "",
      pata: "",
      jaati: "",
      age: "",
      sign: ""
    });

  }

  retrievIdFromCastList(value: string): string {
    for (let i = 0; i < this.listOfCast.length; i++) {
      if (this.listOfCast[i].name === value) {
        return this.listOfCast[i].id;
      }
    }
    return "0";
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

  }

  selectedDharayen(selected: any) {

    const selectedId = selected.id ?? selected;

    const selectedItem = this.localListOfActualDhara.find(d => d.id === selectedId);

    if (selectedItem) {

      const newDhara = {
        id: selectedItem.id,
        name: selectedItem.name, // extra text
        extraInfo: this.selectedDharaHeadYear
      };

      if (!this.clipboardDharas.some(d => d.name === selectedItem.name)) {
        this.clipboardDharas.push(newDhara);
      }
    }

  }

  clipboardDharas: { id: string; name: string, extraInfo: string }[] = [];

  async removeDhara(id: string) {
    const ok = await this.confirmYesNo("क्या आप धारा हटाना चाहते हैं?");
    if (!ok) return;
    this.clipboardDharas = this.clipboardDharas.filter(d => d.id !== id);
    this.showDialogForReasonAfterDeleteDhara = true;
  }

  showDialogForReasonAfterDeleteDhara: boolean = false;
  reasonToDeleteDhara: string = "";






  ////////// GET ALL DATA //////////

  listOfSiteQuality: IdAndNameModel[] = [];

  listOfBalliPriceMaster: BalliPriceMasterResponse[] = [];

  listOfFormFactorMaster: FormFactorResponse[] = [];
  listOfVrikhaPriceMaster: KhadaVrikhaPriceMasterResponse[] = [];

  listOfGolaiValue: IdAndNameModel[] = [];

  setListOfGolaiAccordingToYear(yearOfCrim: number) {

    this.listOfGolaiValue = Array.from(
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

  }

  onRowChangeOfSiteQualityAndHalat() {

  }

  getBalliPriceSingleValue(row: any) {


    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    if (this.listOfBalliPriceMaster.length > 0) {

      const rowPrajati = String(row.prajati_type);
      const rowGolai = String(row.golai);
      const rowLambai = String(row.lambai);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.length === rowLambai &&
        item.applicable_year === year.toString() &&
        item.girh_class === rowGolai;

      let singleRow: any = null;

      // 🔹 CASE 1: prajati != 0, try exact match first
      if (rowPrajati !== '0') {
        singleRow = this.listOfBalliPriceMaster.find(item =>
          baseFilter(item) && item.prajati === rowPrajati
        );
      }

      // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      if (!singleRow) {
        singleRow = this.listOfBalliPriceMaster.find(item =>
          baseFilter(item) && item.prajati === '0'
        );
      }

      row.dar = singleRow?.price ?? null;

      this.calculateTotalBalliRashi(row);
    }


  }

  getFencingPolPriceSingleValue(row: any) {


    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    if (this.listOfFencingPriceMaster.length > 0) {

      const rowPrajati = String(row.prajati_type);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.applicable_year === year.toString();

      let singleRow: any = null;

      // 🔹 CASE 1: prajati != 0, try exact match first
      if (rowPrajati !== '0') {
        singleRow = this.listOfFencingPriceMaster.find(item =>
          baseFilter(item) && item.prajati === rowPrajati
        );
      }

      // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      if (!singleRow) {
        singleRow = this.listOfFencingPriceMaster.find(item =>
          baseFilter(item) && item.prajati === '0'
        );
      }

      //
      row.dar = singleRow?.price ?? null;
      if (singleRow != undefined) {
        if (singleRow.price === "0") {
          row.is_dar_editable = true;
        } else {
          row.is_dar_editable = false;
        }
      } else {
        row.is_dar_editable = true;
      }

      this.calculateTotalFencingPolRashi(row);
    }


  }

  calculateTotalFencingPolRashi(row: any) {
    const nag = parseFloat(row.nag) || 0;
    const dar = parseFloat(row.dar) || 0;

    row.total_cost = (dar * nag).toFixed(2);

    this.getTotalVanopajRashi();

  }


  getBanshPriceSingleValue(row: any) {

    //;
    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    if (this.listOfBambooPriceMaster.length > 0) {

      const rowPrajati = String(row.prajati_type);
      const rowLambai = String(row.lambai);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.size === rowLambai &&
        item.applicable_year === year.toString();

      let singleRow: any = null;

      // 🔹 CASE 1: prajati != 0, try exact match first
      if (rowPrajati !== '0') {
        singleRow = this.listOfBambooPriceMaster.find(item =>
          baseFilter(item) && item.bambu_type === rowPrajati
        );
      }

      if (singleRow != undefined) {
        if (singleRow.price === "0") {
          row.is_dar_editable = true;
        } else {
          row.is_dar_editable = false;
        }
      } else {
        row.is_dar_editable = true;
      }

      // // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      // if (!singleRow) {
      //   singleRow = this.listOfBambooPriceMaster.find(item =>
      //     baseFilter(item) && item.bambu_type === '0'
      //   );
      // }

      // if (singleRow.price === "0") {
      //   row.is_janch_karta_entry = false;
      // } else {
      //   row.is_janch_karta_entry = true;
      //   row.dar = singleRow?.price ?? null;
      // }

      row.dar = singleRow?.price ?? null;

      this.calculateTotalBanshRashi(row);

    } else {
      this.calculateTotalBanshRashi(row);
    }


  }

  calculateTotalBanshRashi(row: any) {
    const nag = parseFloat(row.nag) || 0;
    const dar = parseFloat(row.dar) || 0;
    const ghanMeter = parseFloat(row.ghan_meter) || 0;


    //
    if (row.prajati_type === 1) {
      row.total_cost = (dar * nag).toFixed(2);
    } else {
      row.total_cost = (dar * ghanMeter).toFixed(2);
    }

    this.getTotalVanopajRashi();

    // this.getTotalVanopajRashi();
  }

  setThunthGolai(row: any) {

    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    row.golai = null;
    row.one_golai_less = null;
    row.site_quality = null;
    row.nag = "";

    this.listOfGolaiValue = [];
    this.listOfGolaiValue = Array.from(
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

    if (this.listOfGolaiValue.length === 0) {
      this.listOfGolaiValue = Array.from(
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

  getFormFactorAccordingToSelectedValues(row: any) {

    //row.dar = "";
    //row.total_cost = "";
    //row.site_quality = null;



    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    if (this.isThunthCalculationFromFormNagPrice) {

      if (this.listOfVrikhaPriceMaster.length > 0) {



        // 2️⃣ Selected prajati
        const rowPrajati = Number(row.prajati_type);

        // 3️⃣ Common filter conditions
        const baseFilter = (item: any) =>
          item.site_quality === String(row.site_quality) &&
          item.girh_class === row.one_golai_less &&
          item.applicable_year === year &&
          item.circle === this.loginedOfficerCircleId &&
          item.price !== "0";

        // 4️⃣ First priority: exact prajati match
        let singleRow = this.listOfVrikhaPriceMaster.find(item =>
          baseFilter(item) &&
          Number(item.prajati) === rowPrajati
        );

        // 5️⃣ Fallback: default prajati = 0
        if (!singleRow) {
          singleRow = this.listOfVrikhaPriceMaster.find(item =>
            baseFilter(item) &&
            Number(item.prajati) === 0
          );
        }

        if (singleRow === undefined) {
          row.dar = "0";
          row.is_dar_editable = false;
        } else {
          row.is_dar_editable = false;
          row.dar = singleRow?.price;
        }

        this.calculateGhanMeter(row);
      }

    } else {
      //
      let halat = row.kasth_halat.toString();
      const year = this.comingComplaintData.date_of_crime.split('-')[2];

      let singleRow = this.listOfFormFactorMaster.find(item =>
        item.site_quality === String(row.site_quality) &&
        item.girh_class === row.one_golai_less &&
        item.applicable_year === year
      );

      if (halat === "1") {
        row.form_factor = singleRow?.sound ?? "";
        singleRow?.sound ?? "";
      } else if (halat === "2") {
        row.form_factor = singleRow?.half_sound ?? "";
        singleRow?.half_sound ?? "";
      } else if (halat === "3") {
        row.form_factor = singleRow?.jalau ?? "";
        singleRow?.jalau ?? "";
      }

      // 
      this.calculateGhanMeter(row);
    }

  }



  getOneGolaiVargKamKarkeForFirstTime(row: any) {


    const year = this.comingComplaintData.date_of_crime.split('-')[2];

    let listOfGolaiValue = [];
    listOfGolaiValue = Array.from(
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

    if (listOfGolaiValue.length === 0) {
      listOfGolaiValue = Array.from(
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



    if (listOfGolaiValue.length > 0) {
      if (row.golai === 'ABOVE 240') {
        const numericRanges = listOfGolaiValue
          .map(g => g.name)
          .filter(name => name.includes('-'))
          .map(name => {
            const [start, end] = name.split('-').map(Number);
            return { name, start, end };
          })
          .sort((a, b) => b.end - a.end); // highest first

        const previous = numericRanges.length ? numericRanges[0].name : '';

        row.one_golai_less = previous;
        //this.getFormFactorAccordingToSelectedValues(row);
        //return previous;
      }

      // 
      if (row.golai === "21-30") {
        row.one_golai_less = "0-20";

        //this.getFormFactorAccordingToSelectedValues(row);
        //return "0-20";
      } else {

        if (row.golai != null) {
          const [currentStart] = row.golai.split('-').map(Number);

          let previous: string = "";

          for (const golai of listOfGolaiValue) {
            const [, end] = golai.name.split('-').map(Number);

            if (end < currentStart) {
              previous = golai.name;   // keep updating
            }
          }
          row.one_golai_less = previous;
          //this.getFormFactorAccordingToSelectedValues(row);
          //return previous;
        }


      }

      //this.getFormFactorAccordingToSelectedValues(row);

      //return "";
    }

    return "";
  }







  getOneGolaiVargKamKarke(row: any): string {

    if (this.listOfGolaiValue.length > 0) {
      if (row.golai === 'ABOVE 240') {
        const numericRanges = this.listOfGolaiValue
          .map(g => g.name)
          .filter(name => name.includes('-'))
          .map(name => {
            const [start, end] = name.split('-').map(Number);
            return { name, start, end };
          })
          .sort((a, b) => b.end - a.end); // highest first

        const previous = numericRanges.length ? numericRanges[0].name : '';

        row.one_golai_less = previous;
        this.getFormFactorAccordingToSelectedValues(row);
        return previous;
      }

      // 
      if (row.golai === "21-30") {
        row.one_golai_less = "0-20";
        row.form_factor = "0";
        row.ghan_meter = "0";
        row.dar = "0";
        row.total_cost = "0";
        this.getFormFactorAccordingToSelectedValues(row);
        return "0-20";
      } else {

        if (row.golai != null) {
          const [currentStart] = row.golai.split('-').map(Number);

          let previous: string = "";

          for (const golai of this.listOfGolaiValue) {
            const [, end] = golai.name.split('-').map(Number);

            if (end < currentStart) {
              previous = golai.name;   // keep updating
            }
          }
          row.one_golai_less = previous;
          this.getFormFactorAccordingToSelectedValues(row);
          return previous;
        }


      }

      this.getFormFactorAccordingToSelectedValues(row);

      return "";
    }
    return "";
  }

  listOfBeat: any = [];

  getMasterData() {
    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getCastAndCrimMaster(this.loginedOfficerEmpId.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
      async (response) => {

        await this.dismissDialog();

        if (response.response.code === 200) {



          this.listOfBeat = response.beat_name

          //const rawCompartment = this.listOfBeat[0]?.compartment_no?.[0] ?? '';
          //console.log(rawCompartment, 'rawCompartment');
          // this.listOfCompartment = rawCompartment
          //   .split(',')
          //   .map((item: string) => item.trim())
          //   .filter((item: string) => item.length > 0)
          //   .map((name: string) => ({ name }));

          // this.listOfCompartment.push({ name: 'अन्य स्थल' });
          //console.log(this.listOfCompartment, 'this.listOfCompartment');


          this.listOfCast = response.cast_data;
          this.listOfCrimType = response.crim_type_data;

          this.listOfDharaNew = response.dhara_data;
          this.listOfWoodPrajati = response.prajati_name;

          this.listOfDharaDataNew = response.dhara_data_new ?? [];
          this.buildDharaNewGroups();




          ;
          this.prepareWoodLists();

          this.listOfFormFactorMaster = response.form_factor_master;

          this.listOfBalliPriceMaster = response.balli_price_master;

          this.listOfLattaKasthaPriceMaster = response.lattha_price_master;

          this.listOfChiranPriceMaster = response.chiraan_price_master;
          this.listOfJalauChattaPriceMaster = response.chatta_price_master;

          const year = Number(this.comingComplaintData.date_of_crime.split('-')[2]);

          this.listOfVrikhaPriceMaster = response.khada_vrikha_price_master;

          this.listOfBambooPriceMaster = response.bamboo_price_master;

          this.listOfFencingPriceMaster = response.fencing_pol_price_master;


          ;
          //this.setListOfGolaiAccordingToYearAccordingToKhadaVrikha(year);

          this.listOfThunthDetail.forEach(row => {

            const year = this.comingComplaintData.date_of_crime.split('-')[2];

            let listOfGolaiValue = [];
            listOfGolaiValue = Array.from(
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

            if (listOfGolaiValue.length === 0) {
              listOfGolaiValue = Array.from(
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




            if (listOfGolaiValue.length > 0) {
              if (row.golai === 'ABOVE 240') {
                const numericRanges = listOfGolaiValue
                  .map(g => g.name)
                  .filter(name => name.includes('-'))
                  .map(name => {
                    const [start, end] = name.split('-').map(Number);
                    return { name, start, end };
                  })
                  .sort((a, b) => b.end - a.end); // highest first

                const previous = numericRanges.length ? numericRanges[0].name : '';

                row.one_golai_less = previous;
              } else if (row.golai === "21-30") {
                row.one_golai_less = "0-20";
                row.dar = "0";
              } else {

                if (row.golai != null) {
                  const [currentStart] = row.golai.split('-').map(Number);

                  let previous: string = "";

                  for (const golai of listOfGolaiValue) {
                    const [, end] = golai.name.split('-').map(Number);

                    if (end < currentStart) {
                      previous = golai.name;   // keep updating
                    }
                  }
                  row.one_golai_less = previous;
                }


              }

            }
          })

          this.cdRef.detectChanges();

          this.setListOfBanshSizeAccordingToYearAndType(year);



          this.listOfBalliDetail.forEach(row => {
            this.getBalliPriceSingleValue(row);
          });


          this.listOfChiranaDetail.forEach(row => {
            this.getChiraanPriceSingleValue(row);
          });

          this.listOfChattaDetail.forEach(row => {
            ;
            this.getJalauChattaPriceSingleValue(row);
          });


          this.listOfBanshDetail.forEach(row => {
            this.getBanshPriceSingleValue(row);
          });

          this.listOfFencingPolDetail.forEach(row => {

            this.getFencingPolPriceSingleValue(row);
          });

          this.listOfKashthaDetail.forEach(row => {
            this.setPerLatthaPriceAccordingToEnterValues(row);
          });

        }

      },
      async (error) => {
        this.cdRef.detectChanges;
        await this.dismissDialog();
        this.shortToast(error);
      }
    );
  }

  isThunthCalculationFromFormFactor = false;
  isThunthCalculationFromFormNagPrice = true;

  isThunthDarReadable(): boolean {
    return this.isThunthCalculationFromFormNagPrice;
  }


  setListOfGolaiAccordingToYearAccordingToKhadaVrikha(yearOfCrim: number) {

    this.listOfGolaiValue = Array.from(
      new Map(
        this.listOfVrikhaPriceMaster
          .filter(item =>
            item.applicable_year === yearOfCrim.toString() &&
            item.circle === this.loginedOfficerCircleId &&   // 👈 added condition
            item.prajati === "12" &&   // 👈 added condition
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

    if (this.listOfGolaiValue.length === 0) {
      this.isThunthCalculationFromFormNagPrice = false;
      this.isThunthCalculationFromFormFactor = true;

      this.setListOfGolaiAccordingToYear(yearOfCrim);

    } else {

      this.isThunthCalculationFromFormNagPrice = true;
      this.isThunthCalculationFromFormFactor = false;

    }

    if (this.isThunthCalculationFromFormFactor) {
      /////// SET SITE QUALITY VALUE ///////
      this.listOfSiteQuality = [
        { id: 1, name: 'I' },
        { id: 2, name: 'II' },
        { id: 3, name: 'III' },
        { id: 4, name: 'IVA' },
        { id: 5, name: 'IVB' },
        { id: 6, name: 'VA/VB' }
      ];
    } else {
      this.listOfSiteQuality = [
        { id: 3, name: 'III' },
        { id: 4, name: 'IVA' },
        { id: 5, name: 'IVB' }
      ];
    }



  }

  setListOfLambaiAndGolaiAccordingToYearAndPrajatiSelection(row: any) {


    row.lambai = null;
    row.golai = null;
    row.dar = 0;
    row.total_cost = 0;

    this.listOfLambaiValueBalli = [];
    this.listOfGolaiValueBalli = [];


    const yearOfCrim = Number(this.comingComplaintData.date_of_crime.split('-')[2]);

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

    this.getBalliPriceSingleValue(row);

  }

  listOfGolaiValueBalli: IdAndNameModel[] = [];
  listOfLambaiValueBalli: IdAndNameModel[] = [];



  listOfChiranPriceMaster: ChiraanPriceMasterResponse[] = [];

  listOfJalauChattaPriceMaster: ChattaJalauPriceMasterResponse[] = [];


  listOfLattaKasthaPriceMaster: LatthaKasthPriceMasterResponse[] = [];
  listOfGolaiForLatthaKasth: IdAndNameModel[] = [];
  listOfLambaiForLatthaKasth: IdAndNameModel[] = [];

  setLambaiOrGolaiValidation(row: any) {

    row.lambai = null;
    row.golai = null;
    row.dar = "";
    row.ghan_meter = "";

    this.listOfGolaiForLatthaKasth = [];
    this.listOfLambaiForLatthaKasth = [];

    const yearOfCrim = Number(this.comingComplaintData.date_of_crime.split('-')[2]);

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


  checkMinMaxForRowLatthaGolai(row: any) {

    let min = 0;
    let max = 0;
    if (!this.listOfGolaiForLatthaKasth || this.listOfGolaiForLatthaKasth.length === 0) {
      min = 0;
      max = 0;
      return;
    }

    //
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
      if (row.golai >= min) {

      } else {

        this.showError("गोलाई " + min + " से.मी. से कम की प्रविष्टि नहीं की जा सकती , कृपया सही गोलाई प्रविष्ट करें ");

        row.golai = "";
      }
    }

    this.setPerLatthaPriceAccordingToEnterValues(row);

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
      max = 200; // fixed upper limit
    } else {
      const [, maxEnd] = last.split('-').map(Number);
      max = maxEnd;
    }

    if (row.lambai >= min && row.lambai <= max) {

    } else {

      row.lambai = "";
    }

    this.setPerLatthaPriceAccordingToEnterValues(row);

  }

  setPerLatthaPriceAccordingToEnterValues(row: any) {
    //

    const yearOfCrim = Number(this.comingComplaintData.date_of_crime.split('-')[2]);
    let lambai = row.lambai;
    let golai = row.golai;

    if (golai === null || lambai === null) {
      row.dar = "";
      return;
    }

    /* ---------------- Base Filter ---------------- */
    const baseFilter = (prajati: string) => (item: any) =>
      item.circle === this.loginedOfficerCircleId.toString() &&
      item.applicable_year === yearOfCrim.toString() &&
      item.prajati === prajati;

    /* ---------------- Range Parser ---------------- */
    function parseRange(str: string) {
      if (!str) return { min: 0, max: 0 };

      if (str.toUpperCase().includes('ABOVE')) {
        const min = Number(str.replace(/\D/g, ''));
        return { min, max: 9999 };
      }

      const [min, max] = str.split('-').map(Number);
      return { min, max };
    }

    /* ---------------- Range Match Logic ---------------- */
    const rangeMatch = (item: any) => {
      const lengthRange = parseRange(item.length);
      const golaiRange = parseRange(item.girh_class);

      const lambaiOk = lambai >= lengthRange.min && lambai <= lengthRange.max;
      const golaiOk = golai >= golaiRange.min && golai <= golaiRange.max;

      return lambaiOk && golaiOk;
    };

    /* ---------------- Find Matching Row ---------------- */

    // 1️⃣ Try exact prajati match
    let matchingRow = this.listOfLattaKasthaPriceMaster
      .filter(baseFilter(row.prajati_type.toString()))
      .find(rangeMatch);

    // 2️⃣ Fallback to prajati = '0'
    if (!matchingRow) {
      matchingRow = this.listOfLattaKasthaPriceMaster
        .filter(baseFilter('0'))
        .find(rangeMatch);
    }

    /* ---------------- Result ---------------- */


    if (matchingRow != undefined) {
      if (matchingRow?.price != "0") {
        row.dar = matchingRow?.price ?? null;
        row.is_dar_editable = false;
      } else {
        row.is_dar_editable = true;
      }
    } else {
      row.is_dar_editable = true;
    }


    if (!matchingRow) {
      row.dar = "";
      console.warn('No matching row found for this lambai and golai');
      return;
    }

    console.log('Matching row:', matchingRow);
    row.dar = matchingRow.price;


    this.calculateGhanMeterKastha(row);

  }


  getChiraanPriceSingleValue(row: any) {

    //
    if (this.listOfChiranPriceMaster.length > 0) {

      const year = this.comingComplaintData.date_of_crime.split('-')[2];
      const rowPrajati = String(row.prajati_type);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.applicable_year === year.toString();

      let singleRow: any = null;

      // 🔹 CASE 1: prajati != 0, try exact match first
      if (rowPrajati !== '0') {
        singleRow = this.listOfChiranPriceMaster.find(item =>
          baseFilter(item) && item.prajati === rowPrajati
        );
      }

      // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      if (!singleRow) {
        singleRow = this.listOfChiranPriceMaster.find(item =>
          baseFilter(item) && item.prajati === '0'
        );
      }

      if (singleRow != undefined) {
        if (singleRow?.price != "0") {
          row.dar = singleRow?.price ?? null;
          row.is_dar_editable = false;
        } else {
          row.is_dar_editable = true;
        }
      } else {
        row.is_dar_editable = true;
      }

      this.updateCostChiran(row);
    }


  }


  getIsChiranDarReadonly = true;


  setAllchiraanFieldsBlank(row: any) {

    row.lambai = null;
    row.golai = null;
    row.motai = null;
    row.dar = null;
    row.nag = null;
    row.ghan_meter = "";

    this.getChiraanPriceSingleValue(row);

  }

  getJalauChattaPriceSingleValue(row: any) {

    //;
    if (this.listOfJalauChattaPriceMaster.length > 0) {

      const year = this.comingComplaintData.date_of_crime.split('-')[2];
      const rowPrajati = String(row.prajati_type);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.applicable_year === year.toString();

      let singleRow: any = null;
      ;
      // 🔹 CASE 1: prajati != 0, try exact match first
      if (rowPrajati !== '0') {
        singleRow = this.listOfJalauChattaPriceMaster.find(item =>
          baseFilter(item) && item.prajati === rowPrajati
        );
      }

      // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      if (!singleRow) {
        singleRow = this.listOfJalauChattaPriceMaster.find(item =>
          baseFilter(item) && item.prajati === '0' && item.price != "0"
        );
      }

      // row.dar = singleRow?.price ?? null;
      if (singleRow != undefined) {
        if (singleRow?.price != "0") {
          row.dar = singleRow?.price ?? null;
          row.is_dar_editable = false;
        } else {
          row.is_dar_editable = true;
        }
      } else {
        row.is_dar_editable = true;
      }

      this.updateTotalChattaRashi(row);
    }

  }

  setAllJalauChattaFieldsBlank(row: any) {

    row.nag = null;
    row.total_cost = null;

    this.getJalauChattaPriceSingleValue(row);

  }

  woodListForJalau: any = [];
  woodListForExceptJalau: any = [];

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


  listOfBambooPriceMaster: BambooPriceMasterResponse[] = [];


  listOfBanshType = [
    { id: 1, name: 'व्यापारिक' },
    { id: 2, name: 'औद्योगिक' }
  ];

  listOfBanshSizeVyaparik: IdAndNameModel[] = [];
  listOfBanshSizeOdyogic: IdAndNameModel[] = [];


  listOfBanshDetail:
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
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      is_dar_editable: boolean;
      can_delete: boolean;
    }[] = [];

  addBanshInfo() {
    this.listOfBanshDetail.push({
      jabti_saman_type: '7', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, is_dar_editable: true, can_delete: true
    });
  }

  getIsDarEditable(row: any): boolean {
    return row.is_dar_editable;
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
    //;
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
    row.dar = null;
  }

  calculateNosionalTon(row: any) {
    ;
    let lambai = row.lambai;
    let nag = row.nag;

    let mult = (lambai * nag);

    let matra = ((mult) / 2400).toFixed(3);
    row.ghan_meter = matra;

    this.getBanshPriceSingleValue(row);

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

  get totalVyaparikBanshRashi(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 1)
      .reduce(
        (sum, item) => sum + (Number(item.total_cost) || 0),
        0
      );
  }

  get totalOdyogicBanshRashi(): number {
    return this.listOfBanshDetail
      .filter(item => Number(item.prajati_type) === 2)
      .reduce(
        (sum, item) => sum + (Number(item.total_cost) || 0),
        0
      );
  }

  async removeBanshInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप बाँस की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
    if (index > -1 && index < this.listOfBanshDetail.length) {
      this.listOfBanshDetail.splice(index, 1);
    }
    this.getTotalVanopajRashi();
  }


  listOfFencingPriceMaster: FencingPolPriceMasterResponse[] = [];

  listOfFencingPolDetail:
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
      if_not_yogya_then_reason: string,
      is_janch_karta_entry: boolean;
      can_delete: boolean;
    }[] = [];

  addFencingPolInfo() {
    this.listOfFencingPolDetail.push({
      jabti_saman_type: '8', prajati_type: 0,
      lambai: '', golai: '', ghan_meter: '', nag: '', dar: '', total_cost: '', if_other_then_detail: '', motai: '',
      unchai: '', kasth_halat: 0, is_yogya_to_parivahan: '', /// 0-no,1-yes
      if_not_yogya_then_reason: '', is_janch_karta_entry: false, can_delete: true
    });
  }

  async removeFencingPolInfo(index: number) {
    const ok = await this.confirmYesNo("क्या आप फेंसिंग पोल की प्रविष्टि हटाना चाहते हैं?");
    if (!ok) return;
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

  get totalFencingPolRashi(): number {
    return this.listOfFencingPolDetail
      .reduce(
        (sum, item) => sum + (Number(item.total_cost) || 0),
        0
      );
  }

  getFencingPriceSingleValue(row: any) {

    if (this.listOfFencingPriceMaster.length > 0) {

      const year = this.comingComplaintData.date_of_crime.split('-')[2];
      const rowPrajati = String(row.prajati_type);
      const circleId = String(this.loginedOfficerCircleId);

      const baseFilter = (item: any) =>
        item.circle === circleId &&
        item.applicable_year === year.toString();

      let singleRow: any = null;

      if (rowPrajati !== '0') {
        singleRow = this.listOfFencingPriceMaster.find(item =>
          baseFilter(item) && item.prajati === rowPrajati
        );
      }

      // 🔹 CASE 2: If no match or prajati == 0 → fallback to prajati = 0
      if (!singleRow) {
        singleRow = this.listOfFencingPriceMaster.find(item =>
          baseFilter(item) && item.prajati === '0'
        );
      }
      //
      row.dar = singleRow?.price ?? null;

      this.updateCostChiran(row);
    }


  }

  // editCrimeDhara() {
  //   if (this.isShowEditDharaBox) {
  //     this.isShowEditDharaBox = false;
  //   } else {
  //     this.isShowEditDharaBox = true;
  //   }
  // }




  selectedCompartmentOption: 'RF' | 'PF' | 'OA' | null = null;
  private readonly compartmentOptionKey = 'compartment_option';
  private lastConfirmedCrimType: number | null = null;
  private lastConfirmedCompartmentOption: 'RF' | 'PF' | 'OA' | null = null;

  async onCrimTypeChange() {
    const isDharaSelected =
      (this.selectedDharaNewIds && this.selectedDharaNewIds.size > 0) ||
      (this.clipboardDharas && this.clipboardDharas.length > 0);

    if (
      isDharaSelected &&
      this.lastConfirmedCrimType !== null &&
      this.selectedCrimType !== null &&
      Number(this.selectedCrimType) !== Number(this.lastConfirmedCrimType)
    ) {
      const ok = await this.confirmYesNo(
        "क्या आप अपराध का प्रकार बदलना चाहते हैं? बदलने पर चयनित धाराएं हट जाएंगी।"
      );
      if (!ok) {
        this.selectedCrimType = this.lastConfirmedCrimType;
        return;
      }
    }

    this.lastConfirmedCrimType = this.selectedCrimType != null ? Number(this.selectedCrimType) : null;
    this.resetCascade('crimeType');

    // Use setTimeout to defer and avoid blocking UI
    setTimeout(() => {
      // If "अन्य" is selected or no compartment option, filter by empty forest_type
      if ((this.hasNoneCompartment || !this.selectedCompartmentOption) && this.selectedCrimType) {
        this.buildDharaNewGroupsForCrimeTypeOnly();
      } else if (this.selectedCompartmentOption && this.selectedCrimType) {
        // When compartment option (RF/PF/OA) is selected, use normal filtering
        this.buildDharaNewGroups();
      }
    }, 0);
  }
  //sandeep end 1 jan 26 2


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



  // Getter to check if "अन्य" is selected in clipboardCompartment
  get hasNoneCompartment(): boolean {
    return this.clipboardCompartment.some(c => c.name === 'अन्य स्थल');
  }

  isBeatNirikshan: boolean = false;

  async selectedCompartment(selected: any) {

    const selectedName: string = selected?.name ?? selected;

    if (!this.isBeatNirikshan) {
      this.clipboardCompartment = [];
    }

    await this.resetCascade('compartment');

    if (selectedName === 'अन्य') {
      this.clipboardCompartment = [{ name: 'अन्य स्थल' }];

      // 🔥 force reset AFTER ng-select internal update
      setTimeout(() => {
        this.selectedCompartmentValue = null;
      });

      return;
    }

    if (!this.clipboardCompartment.some(d => d.name === selectedName)) {
      this.clipboardCompartment.push({ name: selectedName });
    }

    // 🔥 always reset in next tick
    setTimeout(() => {
      this.selectedCompartmentValue = null;
    });
  }


  clipboardCompartment: { name: string }[] = [];


  selectedCompartmentValue: string | null = null;
  selectedDharaValue: number | null = null;

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

    const dharaArray = this.comingComplaintData.crime_dhara
      .split(',')
      .map(d => d.trim())
      .filter(d => d); // remove empty values

    dharaArray.forEach((dhara, index) => {
      //    

      let dhara1 = dhara;

      const dharaArraySplited = dhara1
        .split('-')
        .map(d => d.trim())
        .filter(d => d); // remove empty values


      let selectedNameOfDhara = dharaArraySplited[1];
      let selectedAdhiniyam = dharaArraySplited[0];

      this.dharaNewGroups.forEach(group => {
        group.items.forEach(item => {

          let listDhara = item.dhara;
          let adhiniyam = item.adhiniyam;

          if (listDhara === selectedNameOfDhara &&
            adhiniyam === selectedAdhiniyam
          ) {
            this.selectedDharaNewIds.add(item.id);
          }

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

  buildDharaNewGroups() {
    const forestType = (this.selectedCompartmentOption ?? '').trim();
    const crimeType = this.selectedCrimType != null ? String(this.selectedCrimType).trim() : '';

    if (!forestType || !crimeType || !Array.isArray(this.listOfDharaDataNew)) {
      this.dharaNewGroups = [];
      this.flattenedDharaForSelect = [];
      this.selectedDharaItemsArray = [];
      this.selectedDharaGroupedByAdhiniyam = [];
      return;
    }

    //old sandeep
    // const filteredRaw = this.listOfDharaDataNew.filter((x: any) =>
    //   (
    //     String(x?.forest_type ?? '').trim() === forestType ||
    //     String(x?.forest_type ?? '').trim() === '' // common/all
    //   ) &&
    //   String(x?.crime_type ?? '').trim() === crimeType
    // );
    // new sandeep 22 jan 26
    const filteredRaw = this.listOfDharaDataNew.filter((x: any) => {
      const itemForestType = String(x?.forest_type ?? '').trim();
      const itemCrimeType = String(x?.crime_type ?? '').trim();
      // console.log(itemForestType, "itemForestType", itemCrimeType, "itemCrimeType");
      // Check crime type first/
      if (itemCrimeType !== crimeType) {
        return false;
      }

      // Forest type matching logic
      if (forestType === 'RF') {
        // RF: match only RF or empty (common/all)
        return itemForestType === 'RF' || itemForestType === '';
      } else if (forestType === 'PF' || forestType === 'OA') {
        // PF and OA: treat as equivalent - match PF, OA, or empty (common/all)
        return itemForestType === 'PF' || itemForestType === 'OA' || itemForestType === '';
      }

      return false;
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

    const dharaArray = this.comingComplaintData.crime_dhara
      .split(',')
      .map(d => d.trim())
      .filter(d => d); // remove empty values

    dharaArray.forEach((dhara, index) => {
      //    

      let dhara1 = dhara;

      const dharaArraySplited = dhara1
        .split('-')
        .map(d => d.trim())
        .filter(d => d); // remove empty values


      let selectedNameOfDhara = dharaArraySplited[1];
      let selectedAdhiniyam = dharaArraySplited[0];

      this.dharaNewGroups.forEach(group => {
        group.items.forEach(item => {

          let listDhara = item.dhara;
          let adhiniyam = item.adhiniyam;

          if (listDhara === selectedNameOfDhara &&
            adhiniyam === selectedAdhiniyam
          ) {
            this.selectedDharaNewIds.add(item.id);
          }

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

  listOfDharaDataNew: DharaDataNew[] = [];
  dharaNewGroups: { adhiniyam: string; items: DharaDataNew[] }[] = [];

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

  isDharaInfoOpen = false;
  dharaInfoTitle = '';
  dharaInfoDescription = '';
  dharaInfoAdhiniyam = '';


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



  listOfCompartment: any = [];

  async onCompartmentOptionChange(event: any) {
    const value = event.detail.value;
    const next = value as 'RF' | 'PF' | 'OA' | null;

    // confirm only when changing an existing option (affects dhara)
    const isDharaSelected =
      (this.selectedDharaNewIds && this.selectedDharaNewIds.size > 0) ||
      (this.clipboardDharas && this.clipboardDharas.length > 0);

    if (isDharaSelected && this.lastConfirmedCompartmentOption !== null && next !== this.lastConfirmedCompartmentOption) {
      const ok = await this.confirmYesNo(
        "क्या आप कक्ष क्रमांक का विकल्प (RF/PF/OA) बदलना चाहते हैं? बदलने पर चयनित धाराएं प्रभावित हो सकती हैं।"
      );
      if (!ok) {
        // revert UI selection
        this.selectedCompartmentOption = this.lastConfirmedCompartmentOption;
        return;
      }
    }

    await Preferences.set({ key: this.compartmentOptionKey, value });
    this.selectedCompartmentOption = next;
    this.lastConfirmedCompartmentOption = next;

    await this.resetCascade('option');

    // Use setTimeout to defer buildDharaNewGroups and avoid blocking UI
    setTimeout(() => {
      this.buildDharaNewGroups();
    }, 0);
  }

  reasonToDeleteOrAddAccussed: string = "";

  reasonToUpdateDar: string = "";

  reasonToUpdateWitnessDetail: string = "";

  isEditAccussedDetail: boolean = false;
  isEditWitnessDetail: boolean = false;
  isEditDarDetail: boolean = false;

  private clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
  }

  private editBackup1: any = null;
  private editBackup2: any = null;
  private editBackup3: any = null;
  private editBackup4: any = null;

  private captureEditBackup(option: '1' | '2' | '3' | '4') {
    if (option === '1') {
      this.editBackup1 = {
        clipboardCompartment: this.clone(this.clipboardCompartment),
        selectedCompartmentOption: this.selectedCompartmentOption,
        selectedCompartmentValue: this.selectedCompartmentValue,
        selectedCrimType: this.selectedCrimType,
        selectedDharaHeadYear: this.selectedDharaHeadYear,
        clipboardDharas: this.clone(this.clipboardDharas),
      };
      return;
    }

    if (option === '2') {
      this.editBackup2 = {
        isAccussedFound: this.isAccussedFound,
        accusedPersons: this.clone(this.accusedPersons),
        reasonToDeleteOrAddAccussed: this.reasonToDeleteOrAddAccussed,
      };
      return;
    }

    if (option === '3') {
      this.editBackup3 = {
        listOfWitness: this.clone(this.listOfWitness),
        reasonToUpdateWitnessDetail: this.reasonToUpdateWitnessDetail,
      };
      return;
    }

    if (option === '4') {
      this.editBackup4 = {
        listOfjaptiSaman: this.clone(this.listOfjaptiSaman),
        listOfThunthDetail: this.clone(this.listOfThunthDetail),
        listOfKashthaDetail: this.clone(this.listOfKashthaDetail),
        listOfChiranaDetail: this.clone(this.listOfChiranaDetail),
        listOfChattaDetail: this.clone(this.listOfChattaDetail),
        listOfOtherJaptSamanDetail: this.clone(this.listOfOtherJaptSamanDetail),
        listOfJaptVahanDetail: this.clone(this.listOfJaptVahanDetail),
        reasonToUpdateDar: this.reasonToUpdateDar,
      };
      return;
    }
  }

  cancelSectionEdit(option: '1' | '2' | '3' | '4') {
    if (option === '1' && this.editBackup1) {
      this.clipboardCompartment = this.clone(this.editBackup1.clipboardCompartment);
      this.selectedCompartmentOption = this.editBackup1.selectedCompartmentOption;
      this.selectedCompartmentValue = this.editBackup1.selectedCompartmentValue;
      this.selectedCrimType = this.editBackup1.selectedCrimType;
      this.selectedDharaHeadYear = this.editBackup1.selectedDharaHeadYear;
      this.clipboardDharas = this.clone(this.editBackup1.clipboardDharas);
      this.isShowEditDharaBox = false;
      return;
    }

    if (option === '2' && this.editBackup2) {
      this.isAccussedFound = this.editBackup2.isAccussedFound;
      this.accusedPersons = this.clone(this.editBackup2.accusedPersons);
      this.reasonToDeleteOrAddAccussed = this.editBackup2.reasonToDeleteOrAddAccussed || '';
      this.isEditAccussedDetail = false;
      return;
    }

    if (option === '3' && this.editBackup3) {
      this.listOfWitness = this.clone(this.editBackup3.listOfWitness);
      this.reasonToUpdateWitnessDetail = this.editBackup3.reasonToUpdateWitnessDetail || '';
      this.isEditWitnessDetail = false;
      return;
    }

    if (option === '4' && this.editBackup4) {
      this.listOfjaptiSaman = this.clone(this.editBackup4.listOfjaptiSaman);
      this.listOfThunthDetail = this.clone(this.editBackup4.listOfThunthDetail);
      this.listOfKashthaDetail = this.clone(this.editBackup4.listOfKashthaDetail);
      this.listOfChiranaDetail = this.clone(this.editBackup4.listOfChiranaDetail);
      this.listOfChattaDetail = this.clone(this.editBackup4.listOfChattaDetail);
      this.listOfOtherJaptSamanDetail = this.clone(this.editBackup4.listOfOtherJaptSamanDetail);
      this.listOfJaptVahanDetail = this.clone(this.editBackup4.listOfJaptVahanDetail);
      this.reasonToUpdateDar = this.editBackup4.reasonToUpdateDar || '';
      this.isEditDarDetail = false;
      this.listOfjaptiSaman.forEach(item => {
        item.is_janch_karta_entry = true;
      });
      return;
    }
  }

  async confirmCancelSectionEdit(option: '1' | '2' | '3' | '4') {
    let msg = "क्या आप संपादन रद्द करना चाहते हैं?";

    if (option === '1') {
      msg = "क्या आप अपराध और घटना स्थल के विवरण का संपादन रद्द करना चाहते हैं?";
    } else if (option === '2') {
      msg = "क्या आप अपराधियों के विवरण का संपादन रद्द करना चाहते हैं?";
    } else if (option === '3') {
      msg = "क्या आप साक्षियों के विवरण का संपादन रद्द करना चाहते हैं?";
    } else if (option === '4') {
      msg = "क्या आप वनोपज एवं अन्य वस्तुओं के विवरण का संपादन रद्द करना चाहते हैं?";
    }

    const modal = await this.modalController.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.cancelSectionEdit(option);

        if (option === '1') {
          this.reasonToDeleteDhara = '';
        } else if (option === '2') {
          this.reasonToDeleteOrAddAccussed = '';
        } else if (option === '3') {
          this.reasonToUpdateWitnessDetail = '';
        } else if (option === '4') {
          this.reasonToUpdateDar = '';
        }
      }
    });

    await modal.present();
  }

  // optionToEdit = 1 (apradh viran), 2 (apradhiyo ka vivran), 3 (witness detail), 4 (dar update)
  async editCrimeDhara(optionToEdit: string) {
    let msg = "";

    if (optionToEdit === "1") {
      msg = "क्या आप अपराध का विवरण एडिट करना चाहते हैं";
    } else if (optionToEdit === "2") {
      msg = "क्या आप अपराधीयो का विवरण एडिट करना चाहते हैं";
    } else if (optionToEdit === "3") {
      msg = "क्या आप साक्षियों का विवरण एडिट करना चाहते हैं";
    } else if (optionToEdit === "4") {
      msg = "क्या आप वनोपज एवं अन्य वस्तुओं का विवरण एडिट करना चाहते हैं";
    }


    const modal = await this.modalController.create({
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
        if (optionToEdit === "1" || optionToEdit === "2" || optionToEdit === "3" || optionToEdit === "4") {
          this.captureEditBackup(optionToEdit as '1' | '2' | '3' | '4');
        }
        if (optionToEdit === "1") {
          this.isShowEditDharaBox = true;
        } else if (optionToEdit === "2") {
          this.isEditAccussedDetail = true;
        } else if (optionToEdit === "3") {
          this.isEditWitnessDetail = true;
        } else if (optionToEdit === "4") {
          this.isEditDarDetail = true;
          this.listOfjaptiSaman.forEach(item => {
            item.is_janch_karta_entry = false;
          });
        }
        //this.goBack();
      } else {
        if (optionToEdit === "1") {
          this.isShowEditDharaBox = false;
        } else if (optionToEdit === "2") {
          this.isEditAccussedDetail = false;
        } else if (optionToEdit === "3") {
          this.isEditWitnessDetail = false;
        } else if (optionToEdit === "4") {
          this.isEditDarDetail = false;
          this.listOfjaptiSaman.forEach(item => {
            item.is_janch_karta_entry = true;
          });
        }
      }
    });

    await modal.present();

  }


  formatDateString(dateStr: string): string {
    if (!dateStr) return '';

    const parts = dateStr.split('-'); // [dd, MM, yyyy]
    if (parts.length !== 3) return '';

    return `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-MM-dd
  }

  formatDateStringIntoYYYYMMDD(dateStr: string): string {
    if (!dateStr) return '';

    const parts = dateStr.split('-'); // [dd, MM, yyyy]
    if (parts.length !== 3) return '';

    return `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-MM-dd
  }



}

export interface AccussedDetailLocal {
  ActualCast: string,
  Address: string,
  Age: string,
  Cast: string,
  Name: string,
  FathersName: string,
  mobile_number: string;
}