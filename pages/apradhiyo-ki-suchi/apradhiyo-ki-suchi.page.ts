import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController, Platform } from '@ionic/angular/standalone';
import { arrowBack, downloadOutline, closeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';

import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom';
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom';
import { ComplainDetails } from '../officer-dashboard/GetDashboardResponse.model';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';

const mergedVfs = {
    ...vfsRegular,
    ...vfsBold
};

@Component({
    selector: 'app-apradhiyo-ki-suchi',
    templateUrl: './apradhiyo-ki-suchi.page.html',
    styleUrls: ['./apradhiyo-ki-suchi.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class ApradhiyoKiSuchiPage implements OnInit {

    comingComplaintData!: ComplainDetails;

    apradhiList: any[] = [];

    isLoading: boolean = false;
    loadingMessage: string = 'कृपया प्रतीक्षा करें...';

    user_id: number = 0;
    loginedOfficerDesignationId: string = "";
    por_number: string = "";
    sys_gen_por_number: string = "";
    date_of_crime: string = "";

    constructor(
        private apiService: ApiServiceService,
        private navCtrl: NavController,
        private router: Router,
        private cdRef: ChangeDetectorRef
    ) {
        addIcons({ arrowBack, downloadOutline, closeCircleOutline });
    }

    async ngOnInit() {
        this.showLoader();

        const nav = this.router.getCurrentNavigation();
        const stateData = nav?.extras.state?.['data'];

        if (stateData) {

            this.comingComplaintData = JSON.parse(stateData) as ComplainDetails;
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

    getDetailOfComplain() {

        this.showDialog("कृपया प्रतीक्षा करें");

        this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.user_id.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {

                    if (response.complainData && response.complainData.length > 0) {
                        this.comingComplaintData = response.complainData[0];

                        let accusedJsonStr = this.comingComplaintData.accused_persons_json;

                        accusedJsonStr = `[${accusedJsonStr}]`;

                        this.apradhiList = JSON.parse(accusedJsonStr);

                        if (this.apradhiList && this.apradhiList.length > 0) {
                            this.apradhiList.forEach((item, index) => {
                                item.sno = index + 1;
                            });
                        }
                    }

                }


            },
            (error) => {
                this.dismissDialog();
            }
        );

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

    async downloadPdf() {
        console.log('Downloading Apradhiyo Ki Suchi PDF...');

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

            const data = this.comingComplaintData;

            // Map list to table body
            const tableBody: any[] = [
                // Header row
                [
                    { text: 'क्रमांक', bold: true, color: '#333', alignment: 'center' },
                    { text: 'अपराधी का नाम', bold: true, color: '#333', alignment: 'center' },
                    { text: 'पिता का नाम', bold: true, color: '#333', alignment: 'center' },
                    { text: 'उम्र', bold: true, color: '#333', alignment: 'center' },
                    { text: 'जाति वर्ग', bold: true, color: '#333', alignment: 'center' },
                    { text: 'जाति', bold: true, color: '#333', alignment: 'center' },
                    { text: 'मोबाइल नंबर', bold: true, color: '#333', alignment: 'center' },
                    { text: 'आधार नंबर', bold: true, color: '#333', alignment: 'center' },
                    { text: 'पता', bold: true, color: '#333', alignment: 'center' },
                    { text: 'फोटो', bold: true, color: '#333', alignment: 'center' }
                ]
            ];

            // Data rows
            this.apradhiList.forEach((item: any) => {
                tableBody.push([
                    { text: item.sno ? item.sno.toString() : '', color: '#000', alignment: 'center' },
                    { text: item.name || '', color: '#000', alignment: 'center' },
                    { text: item.fathersName || '', color: '#000', alignment: 'center' },
                    { text: item.age ? item.age.toString() : '', color: '#000', alignment: 'center' },
                    { text: item.cast || '', color: '#000', alignment: 'center' },
                    { text: item.jati_name || '', color: '#000', alignment: 'center' },
                    { text: item.mobile_number || '', color: '#000', alignment: 'center' },
                    { text: item.aadhaar_number || '—', color: '#000', alignment: 'center' },
                    { text: item.address || '', color: '#000', alignment: 'center' },
                    { text: '', margin: [0, 30, 0, 30] } // Placeholder box for photo
                ]);
            });

            const docDefinition: any = {
                content: [
                    { text: 'अपराधियों की सूची', fontSize: 14, alignment: 'center', bold: true, margin: [0, 20, 0, data.sys_gen_por_number ? 5 : 25], decoration: 'underline' },
                    ...(data.sys_gen_por_number ? [{ text: `(${data.sys_gen_por_number})`, alignment: 'center', fontSize: 10, bold: true, margin: [0, 0, 0, 20] }] : []),
                    {
                        columns: [
                            { text: `POR क्रमांक : ${data.por_number}`, alignment: 'left', bold: true },
                            { text: `पंजीयन दिनांक : ${data.date_of_crime}`, alignment: 'right', bold: true }
                        ],
                        fontSize: 9,
                        margin: [0, 0, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 50],
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

            const safeFileName = data.por_number ? data.por_number.replace(/\//g, '_') : 'list';
            pdfMake.createPdf(docDefinition).download(`Apradhiyo_Ki_Suchi_${safeFileName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }
}
