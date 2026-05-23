import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { arrowBack, downloadOutline, closeCircleOutline, checkmarkCircleOutline, trashOutline, peopleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';

import { Users } from '../login-officer/OfficerLoginResponse';

import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom';
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom';

import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { ComplainDetails, WitnessResponseModal } from '../officer-dashboard/GetDashboardResponse.model';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';

const mergedVfs = {
    ...vfsRegular,
    ...vfsBold
};

@Component({
    selector: 'app-sakshiyo-ki-suchi',
    templateUrl: './sakshiyo-ki-suchi.page.html',
    styleUrls: ['./sakshiyo-ki-suchi.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class SakshiyoKiSuchiPage implements OnInit {

    listOfWitness: WitnessResponseModal[] = [];

    comingComplaintData!: ComplainDetails;

    sakshiList: any[] = [];
    isAddingNew: boolean = false;

    addWitness() {
        this.isAddingNew = true;
        this.listOfWitness.push({
            id: '',
            naam: '',
            pita_ka_naam: '',
            pata: '',
            jaati: '',
            age: '',
            isNew: true, // Flag to identify newly added witnesses manually
            sign: '',
            id_to_update: ''
        });
    }

    removeWitness(index: number) {
        // Find if any custom added witness remains, if not hide submit
        this.listOfWitness.splice(index, 1);

        const hasNew = this.listOfWitness.some(item => item.isNew);
        this.isAddingNew = hasNew;
    }

    isLoading: boolean = false;
    loadingMessage: string = 'कृपया प्रतीक्षा करें...';

    constructor(
        private sharedService: SharedserviceService,
        private modalController: ModalController,
        private apiService: ApiServiceService,
        private navCtrl: NavController,
        private router: Router,
        private cdRef: ChangeDetectorRef
    ) {
        addIcons({ arrowBack, downloadOutline, closeCircleOutline, checkmarkCircleOutline, trashOutline, peopleOutline });
    }

    user_id: number = 0;
    loginedOfficerDesignationId: string = "";
    por_number: string = "";
    sys_gen_por_number: string = "";
    date_of_crime: string = "";

    async ngOnInit() {

        this.showLoader();

        const nav = this.router.getCurrentNavigation();
        const data = nav?.extras.state?.['data'];

        if (data) {

            this.comingComplaintData = JSON.parse(data) as ComplainDetails;
            this.por_number = this.comingComplaintData.por_number;
            this.date_of_crime = this.comingComplaintData.date_of_crime;
            this.sys_gen_por_number = this.comingComplaintData.sys_gen_por_number;


            const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

            if (value) {
                const userData = JSON.parse(value) as Users;

                this.user_id = userData.emp_id;
                this.loginedOfficerDesignationId = userData.designation_id;

                this.getDetailOfComplain();

            }
        }

        setTimeout(() => {
            this.dismissLoader();
        }, 800);
    }

    showLoader(msg: string = 'कृपया प्रतीक्षा करें...') {
        this.loadingMessage = msg;
        this.isLoading = true;
        this.cdRef.detectChanges();
    }

    dismissLoader() {
        this.isLoading = false;
        this.cdRef.detectChanges();
    }

    goBack() {
        this.navCtrl.back();
    }

    submitData() {

        let personDetail = JSON.stringify(this.listOfWitness);

        this.showDialog("कृपया प्रतीक्षा करें");
        ;
        this.apiService.submitCourtWitnessDetail(
            this.user_id.toString(),
            this.comingComplaintData.complain_id,
            personDetail
        ).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {

                    let giraftari_patrak_id = response.response.generated_id;
                    ;
                    const idsArray = giraftari_patrak_id
                        .split(",")
                        .map(id => id.trim())
                        .filter(id => id !== "");

                    for (let i = 0; i < this.listOfWitness.length; i++) {
                        const row = this.listOfWitness[i];
                        let idToUpdate = idsArray[i];
                        row.id_to_update = idToUpdate;
                    }


                    this.showError(response.response.msg);

                } else {
                    this.showError(response.response.msg);
                }

            },
            (error) => {

                this.dismissDialog();
                this.showError(error);
            }
        );
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

    async downloadPdf() {
        console.log('Downloading Sakshiyo Ki Suchi PDF...');

        try {
            (pdfMake as any).vfs = mergedVfs;
            (pdfMake as any).fonts = {
                NotoSansDevanagari: {
                    normal: 'NotoSansDevanagari-Regular.ttf',
                    bold: 'NotoSansDevanagari-Bold.ttf',
                    italics: 'NotoSansDevanagari-Regular.ttf',
                    bolditalics: 'NotoSansDevanagari-Regular.ttf'
                }
            };

            // Map list to table body
            const tableBody: any[] = [
                // Header row
                [
                    { text: 'क्रमांक', bold: true, color: '#333', alignment: 'center' },
                    { text: 'साक्षी का नाम', bold: true, color: '#333', alignment: 'center' },
                    { text: 'पिता का नाम', bold: true, color: '#333', alignment: 'center' },
                    { text: 'पूर्ण पता', bold: true, color: '#333', alignment: 'center' },
                    { text: 'जाति', bold: true, color: '#333', alignment: 'center' },
                    { text: 'आयु', bold: true, color: '#333', alignment: 'center' },
                    { text: 'फोटो', bold: true, color: '#333', alignment: 'center' }
                ]
            ];

            this.listOfWitness.forEach((item: any, index: number) => {
                tableBody.push([
                    { text: (index + 1).toString(), color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: item.naam || '', color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: item.pita_ka_naam || '', color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: item.pata || '', color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: item.jaati || '', color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: item.age ? item.age.toString() : '', color: '#000', alignment: 'center', margin: [0, 22, 0, 0] },
                    { text: '\n\n\n\n\n', color: '#000', alignment: 'center' } // passport size photo space
                ]);
            });

            const docDefinition: any = {
                content: [
                    { text: 'साक्षियों की सूची', fontSize: 14, alignment: 'center', bold: true, margin: [0, 20, 0, this.sys_gen_por_number ? 5 : 25], decoration: 'underline' },
                    ...(this.sys_gen_por_number ? [{ text: `(${this.sys_gen_por_number})`, alignment: 'center', fontSize: 10, bold: true, margin: [0, 0, 0, 20] }] : []),
                    {
                        columns: [
                            { text: `POR क्रमांक : ${this.por_number}`, alignment: 'left', bold: true },
                            { text: `पंजीयन दिनांक : ${this.date_of_crime}`, alignment: 'right', bold: true }
                        ],
                        fontSize: 9,
                        margin: [0, 0, 10, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: [25, '*', '*', '*', '*', 25, 80],
                            body: tableBody
                        },
                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5,
                            hLineColor: () => '#000',
                            vLineColor: () => '#000',
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 6,
                            paddingBottom: () => 6
                        }
                    },
                    {
                        text: 'विवेचना अधिकारी का हस्ताक्षर',
                        alignment: 'right',
                        bold: true,
                        margin: [0, 50, 10, 0],
                        fontSize: 10
                    }
                ],
                defaultStyle: {
                    font: 'NotoSansDevanagari',
                    fontSize: 7.8,
                    lineHeight: 1.05
                },
                pageMargins: [65, 10, 65, 10]
            };

            const safeFileName = this.por_number ? this.por_number.replace(/\//g, '_') : 'list';
            pdfMake.createPdf(docDefinition).download(`Sakshiyo_Ki_Suchi_${safeFileName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }




    getDetailOfComplain() {

        this.showDialog("कृपया प्रतीक्षा करें");

        this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.user_id.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {

                    if (response.complainData && response.complainData.length > 0) {

                        this.comingComplaintData = response.complainData[0];


                    }


                    ;
                    if (response.witness_list && response.witness_list.length) {
                        this.listOfWitness = response.witness_list;
                    }

                }


            },
            (error) => {
                this.dismissDialog();
            }
        );

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






}
