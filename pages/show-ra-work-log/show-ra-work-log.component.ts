import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ModalController, NavController, Platform } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { ComplainDetails } from '../officer-dashboard/GetDashboardResponse.model';
import { WorkLogResponseModal } from './WorkLogResponseModal.modal';
// Icon setup
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  arrowBack,
  addOutline,
  documentTextOutline,
  personCircleOutline,
  peopleOutline
} from 'ionicons/icons';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';

import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom'; // adjust the path if needed
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom'; // adjust the path if needed

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { ImagePreviewModalComponent } from 'src/app/dialogs/image-preview-modal2/image-preview-modal.component';
import { Users } from '../login-officer/OfficerLoginResponse';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

const mergedVfs = {
  ...vfsRegular,
  ...vfsBold
};

@Component({
  selector: 'app-show-ra-work-log',
  templateUrl: './show-ra-work-log.component.html',
  styleUrls: ['./show-ra-work-log.component.scss'],
  standalone: true,
  providers: [SocialSharing, File],
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ShowRaWorkLogComponent implements OnInit {

  toolbarTitle: string = "";

  private androidPermissions = inject(AndroidPermissions);
  private socialSharing = inject(SocialSharing);

  isRA: boolean = false;
  isComingForLogEntry: boolean = false;

  constructor(
    private sharedService: SharedserviceService,
    private modalCtrl: ModalController,
    private file: File,
    private platForm: Platform,
    private cdRef: ChangeDetectorRef,
    private apiService: ApiServiceService,
    private router: Router,
    private navController: NavController,
    private langService: LanguageServiceService
  ) {
    addIcons({
      addCircleOutline,
      arrowBack,
      addOutline,
      documentTextOutline,
      personCircleOutline,
      peopleOutline
    });
  }
  isLoading: boolean = false;
  loadingMessage: string = ""
  por_number: string = "";
  complain_id: string = "";

  comingComplaintData!: ComplainDetails;
  workLogList: WorkLogResponseModal[] = [];
  whenAssignJanchkartaDetail: WorkLogResponseModal[] = [];

  filePath: string = "";

  async getLoginedOfficerName() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      const userData = JSON.parse(value) as Users;
      //if (userData.designation_id === "6") {
        this.isRA = true;
      //}

    }
  }

  async ngOnInit() {

    const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    this.filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/uploads') ?? '';

    const nav = this.router.getCurrentNavigation();
    const data = history.state['data'];

    this.isComingForLogEntry = history.state['is_coming_for_log_entry'] || false;

    //const data = nav?.extras.state?.['data'];
    if (data) {
      // Convert plain object back to model
      this.comingComplaintData = JSON.parse(data) as ComplainDetails;
      this.por_number = this.comingComplaintData.por_number;
      this.complain_id = this.comingComplaintData.complain_id;

      this.toolbarTitle = this.comingComplaintData.por_number;

      this.getWorkLog();

      this.getLoginedOfficerName();

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

  ionViewWillEnter() {

    if (this.sharedService.getRefresh()) {
      this.getWorkLog();
      this.sharedService.setRefresh(true);
    }

  }

  getWorkLog() {

    this.showDialog("कृपया प्रतीक्षा करें");

    this.apiService.getRAWorkLogList(this.complain_id).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          this.workLogList = response.data

           ;
          this.whenAssignJanchkartaDetail = response.when_assign_janchkarta_adhikari;

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

      },
      (error) => {
        this.dismissDialog();
      }
    );
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

  getFullPathImage(photoName: string): string {
    return this.filePath + "/" + photoName;
  }

  goBack() {
    this.navController.back();
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  //Code added by sandeep start 1
  addNewWorkLog() {

    const jsonData = JSON.stringify(this.comingComplaintData);

    //  this.router.navigateByUrl('/ra-work-log', {
    //     state: { data: jsonData },
    //     replaceUrl: false
    //   });
    this.router.navigate(['/ra-work-log'], {
      state: { data: jsonData },
      replaceUrl: false
    });

  }
  //Code added by sandeep end 1


  async generatePDF() {


    (pdfMake as any).vfs = mergedVfs;

    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: 'NotoSansDevanagari-Regular.ttf',
        bold: 'NotoSansDevanagari-Bold.ttf',
        italics: 'NotoSansDevanagari-Regular.ttf',
        bolditalics: 'NotoSansDevanagari-Regular.ttf'
      }
    };

    const tableBody = [
      [
        { text: 'तहकीकात शुरू होने की तारीख और वक्त', bold: true },
        { text: 'मुकाम', bold: true },
        { text: 'तहकीकात करने वाले ऑफिसर का खुलासा (टीप) हर एक इन्द्रराज पर तहकीकात करने वाले ऑफिसर की दस्तखत करके तारीख और तहकीकात बंद करने का वक्त दर्ज करना चाहिए', bold: true },
        { text: 'हुक्म पाने वाले के दस्तखत', bold: true }
      ],
      ...this.workLogList.map(item => [
        item.created_at || '',
        item.address || '',
        item.work_log_text || '',
        ''
      ])
    ];

    const docDefinition: any = {
      content: [


        { text: 'कार्रवाही का तख्ता (मुकदमा का रोजनामचा)', style: 'title' },

        {
          columns: [
            {
              width: 'auto',
              text: 'जिस जुर्म और तफ्तीश माल जो गिरफ्तार हुआ'
            },
            {
              width: '*',
              text: '________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'मुल्जिमों के नाम, वल्दियत व सकुनत (और मालूम हो):'
            },
            {
              width: '*',
              text: '_________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'तारीख बकुवा (जुर्म):'
            },
            {
              width: '*',
              text: '___________________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'पता लगाने वाले ऑफिसर का नाम :'
            },
            {
              width: '*',
              text: '_________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },


        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'पता लगाने तारीख और वक्त :'
            },
            {
              width: '*',
              text: '_________________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'इफ्तदाई रिपोर्ट नंबर एवं नंबर और उसकी रवानगी की तारीख और वक्त :'
            },
            {
              width: '*',
              text: '______________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          columns: [
            {
              width: 'auto',
              text: 'इफ्तदाई रिपोर्ट की तारीख और वक्त :'
            },
            {
              width: '*',
              text: '________________________________________________________________',
              margin: [5, 0, 0, 0] // optional spacing between text and line
            }
          ],
          margin: [0, 5, 0, 5]
        },

        { text: '\n' },

        {
          margin: [0, 10, 0, 10],
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: tableBody
          }
        }
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
    };

    if (this.platForm.is('desktop')) {

      pdfMake.createPdf(docDefinition).download(this.comingComplaintData.por_number + '.pdf');

    } else if (this.platForm.is('android')) {

      await this.checkAndRequestStoragePermission();

      pdfMake.createPdf(docDefinition).getBase64(async (base64Data: string) => {

        const fileName = this.comingComplaintData.por_number + '.pdf';

        await this.savePdf(base64Data, fileName);


      });

    }

  }

  async savePdf(base64Data: string, fileName: string) {
    const cleanedBase64 = base64Data.replace(/\s/g, '').trim();

    await this.platForm.ready();

    const filePath = this.file.externalDataDirectory || this.file.dataDirectory;

    await this.file.writeFile(
      filePath,
      fileName,
      this.convertBase64ToBlob(cleanedBase64, 'application/pdf'),
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


}
