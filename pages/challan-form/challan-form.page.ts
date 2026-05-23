import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { arrowBack, calendarOutline, personOutline, documentTextOutline, locationOutline, shieldCheckmarkOutline, peopleOutline, clipboardOutline, fingerPrintOutline, calendarNumberOutline, mapOutline, businessOutline, downloadOutline, closeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom';
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { AccusedPersonForCourtChalanDetail, ComplainDetails } from '../officer-dashboard/GetDashboardResponse.model';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';

import { TableModule } from 'primeng/table'; // Import TableModule

const mergedVfs = {
    ...vfsRegular,
    ...vfsBold
};

@Component({
    selector: 'app-challan-form',
    templateUrl: './challan-form.page.html',
    styleUrls: ['./challan-form.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class ChallanFormPage implements OnInit {

    listOfWitness:
        {
            id: string,
            naam: string;
            pita_ka_naam: string;
            pata: string;
            jaati: string;
            age: string;
            sign: string;
        }[] = [];

    // Hardcoded data as requested
    // Properties for point 7 & 8 if data is null
    input_investigation_officer: string = "";
    input_io_designation: string = "";
    input_investigation_date: string = "";
    input_summary: string = "";

    isLoading: boolean = false;
    loadingMessage: string = 'कृपया प्रतीक्षा करें...';
    showPdfButton: boolean = false;

    rangName: string = "";
    divisionName: string = "";

    private androidPermissions = inject(AndroidPermissions);

    constructor(
        private sharedService: SharedserviceService,
        private languageService: LanguageServiceService,
        private navCtrl: NavController,
        private modalController: ModalController,
        private cdRef: ChangeDetectorRef,
        private platform: Platform,
        private apiService: ApiServiceService,
        private router: Router
    ) {
        addIcons({ arrowBack, calendarOutline, personOutline, documentTextOutline, locationOutline, shieldCheckmarkOutline, peopleOutline, clipboardOutline, fingerPrintOutline, calendarNumberOutline, mapOutline, businessOutline, downloadOutline, closeCircleOutline });
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

    por_number: string = "";

    comingComplaintData!: ComplainDetails;

    accusedPersonsList: AccusedPersonForCourtChalanDetail[] = [];

    user_id: number = 0;
    loginedOfficerDesignationId: string = "";

    crime_dhara: string = "0";

    actual_crime_date : string = "";
    todayDate: string = "";

    private getTodayDateYMD(): string {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    async ngOnInit() {

        this.todayDate = this.getTodayDateYMD();

        const nav = this.router.getCurrentNavigation();
        const data = nav?.extras.state?.['data'];
        
        if (data) {

            this.comingComplaintData = JSON.parse(data) as ComplainDetails;
            this.por_number = this.comingComplaintData.por_number;

            this.crime_dhara = this.getCrimDharaCommaSeparated(this.comingComplaintData.crime_dhara);

            if (this.comingComplaintData.is_accused_found === '1') {
                
                let accusedJsonStr = this.comingComplaintData.accused_persons_json;

                accusedJsonStr = `[${accusedJsonStr}]`;

                this.accusedPersonsList = JSON.parse(accusedJsonStr);



            } else {
                this.accusedPersonsList = [];
            }

        }

        // this.showLoader();
        // // Simulate loading for 1 second
        // setTimeout(() => {
        //     this.dismissLoader();
        // }, 1000);

        const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

        if (value) {
            const userData = JSON.parse(value) as Users;

            this.user_id = userData.emp_id;
            this.loginedOfficerDesignationId = userData.designation_id;
            this.rangName = userData.range_name;
            this.divisionName = userData.division_name;

            this.getDetailOfComplain();

        }


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

    ddMMyyyyFormatDate(dateStr: string): string {
        if (!dateStr) return '--';
        if (dateStr.includes('/')) return dateStr;
        const [yyyy, mm, dd] = dateStr.split('-');
        return `${dd}-${mm}-${yyyy}`;
    }

    async downloadPdf() {
        console.log('Downloading PDF...');

        (pdfMake as any).vfs = mergedVfs;
        (pdfMake as any).fonts = {
            NotoSansDevanagari: {
                normal: 'NotoSansDevanagari-Regular.ttf',
                bold: 'NotoSansDevanagari-Bold.ttf',
                italics: 'NotoSansDevanagari-Regular.ttf',
                bolditalics: 'NotoSansDevanagari-Regular.ttf'
            }
        };

        const contentArray: any[] = [];

        const formatText = (text: string) => {
            if (!text) return '';
            return text.replace(/(\S{22})/g, '$1\u200B'); // ensures long gibberish words properly wrap instead of overflowing 
        };

        const witnessText = this.listOfWitness.map((w: any, i: number) => {
            return `(${i + 1}) ${w.naam} पिता ${w.pita_ka_naam} जाति ${w.jaati} उम्र ${w.age} निवासी ${w.pata}`;
        }).join('\n');

        const point7Content = [this.adhikari_name].filter(s => s).join(' ');

        const dottedLines = "\n........................................................\n........................................................\n........................................................\n........................................................\n........................................................\n........................................................\n........................................................\n........................................................";


        for (let index = 0; index < this.accusedPersonsList.length; index++) {

            let accussedModel = this.accusedPersonsList[index];


            let name = accussedModel.name || '--';
            let fatherName = accussedModel.fathersName || '--';

            let age = accussedModel.age || '--';
            let mobile = accussedModel.mobile_number || '--';

            let cast = accussedModel.cast || '--';
            let jati = accussedModel.jati_name || '--';

            let address = accussedModel.address || '--';

            let gir_sthan = accussedModel.gir_sthan;
            let gir_date = accussedModel.gir_date
                ? accussedModel.gir_date.split('-').reverse().join('-')
                : '--';
            let gir_time = accussedModel.gir_time;

            let accussed_content = [
                {
                    text: 'चालान फार्म',
                    fontSize: 14,
                    alignment: 'center',
                    decoration: 'underline',
                    margin: [0, 20, 0, 8]
                },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: `पी.ओ.आर क्रमांक  ${this.comingComplaintData.por_number}`, margin: [0, 0] },
                                        { text: `पंजीयन दिनांक  ${this.comingComplaintData.date_of_crime}`, margin: [0, 0] },
                                        { text: `सहायक परिक्षेत्र  ${this.comingComplaintData.sub_range_name}`, margin: [0, 0] },
                                        { text: `परिक्षेत्र  ${this.comingComplaintData.range_name}`, margin: [0, 0] },
                                        { text: `वनमंडल  ${this.comingComplaintData.division_name}`, margin: [0, 0] }
                                    ],
                                    border: [false, false, false, false],
                                    fontSize: 9
                                },
                                {
                                    stack: [
                                        { text: `पी.ओ.आर क्रमांक ${this.comingComplaintData.por_number}`, margin: [0, 0] },
                                        { text: `पंजीयन दिनांक  ${this.comingComplaintData.date_of_crime}`, margin: [0, 0] },
                                        { text: `सहायक परिक्षेत्र  ${this.comingComplaintData.sub_range_name}`, margin: [0, 0] },
                                        { text: `परिक्षेत्र  ${this.comingComplaintData.range_name}`, margin: [0, 0] },
                                        { text: `वनमंडल  ${this.comingComplaintData.division_name}`, margin: [0, 0] }
                                    ],
                                    border: [false, false, false, false],
                                    fontSize: 9
                                }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 4]
                },
                {
                    table: {
                        widths: [10, '*', 10, '*'],
                        body: [
                            [
                                { text: '1', alignment: 'center', bold: true, color: '#333' },
                                {
                                    text: [{ text: 'तारीख रिपोर्ट मय नाम ओहदा जिसने पता लगायाः-\n', bold: true, color: '#333' }, `तारीख ${this.comingComplaintData.date_of_crime} नाम - ${this.comingComplaintData.complainer_name} ${this.comingComplaintData.complainer_pad}, ${this.comingComplaintData.is_complain_created_by_ra == '0' ? this.comingComplaintData.beat_name : this.comingComplaintData.sub_range_name}`]
                                },

                                { text: '1', alignment: 'center', bold: true, color: '#333' },
                                {
                                    text: [{ text: 'तारीख रिपोर्ट मय नाम ओहदा जिसने पता लगायाः-\n', bold: true, color: '#333' }, `तारीख ${this.comingComplaintData.date_of_crime} नाम - ${this.comingComplaintData.complainer_name} ${this.comingComplaintData.complainer_pad}, ${this.comingComplaintData.is_complain_created_by_ra == '0' ? this.comingComplaintData.beat_name : this.comingComplaintData.sub_range_name}`]
                                }
                            ],
                            [
                                { text: '2', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'तारीख वकुआ जुर्मः-\n', bold: true, color: '#333' }, `दिनांक ${this.ddMMyyyyFormatDate(this.actual_crime_date)}`] },
                                { text: '2', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'तारीख वकुआ जुर्मः-\n', bold: true, color: '#333' }, `दिनांक ${this.ddMMyyyyFormatDate(this.actual_crime_date)}`] }
                            ],
                            [
                                { text: '3', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम मुलजिम मय वल्दियत, कौमियत व. सकूनतः-\n', bold: true, color: '#333' }, `${formatText(name)}, पिता - ${formatText(fatherName)}, उम्र - ${age}, जाति - ${cast} ${jati},  निवासी - ${formatText(address)}`] },
                                { text: '3', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम मुलजिम मय वल्दियत, कौमियत व. सकूनतः-\n', bold: true, color: '#333' }, `${formatText(name)}, पिता - ${formatText(fatherName)}, उम्र - ${age}, जाति - ${cast} ${jati},  निवासी - ${formatText(address)}`] },
                            ],
                            [
                                { text: '4', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'तारीख गिरफ्तारी मुलजिम अगर गिरफ्तार हुआ होः-\n', bold: true, color: '#333' }, `${gir_date}, ${gir_time}`] },
                                { text: '4', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'तारीख गिरफ्तारी मुलजिम अगर गिरफ्तार हुआ होः-\n', bold: true, color: '#333' }, `${gir_date}, ${gir_time}`] }
                            ],
                            [
                                { text: '5', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'किस्म जुर्म व मुलजिम दफा फारेस्ट एक्ट मय तखनीमा नुकसानः-\n', bold: true, color: '#333' }, `${this.comingComplaintData.crime_type}, ${this.crime_dhara} `] },
                                { text: '5', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'किस्म जुर्म व मुलजिम दफा फारेस्ट एक्ट मय तखनीमा नुकसानः-\n', bold: true, color: '#333' }, `${this.comingComplaintData.crime_type}, ${this.crime_dhara} `] },
                            ],
                            [
                                { text: '6', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम और सकूनत उन लोगो को जो जुर्म की शहादत दे सकते हैं:-\n', bold: true, color: '#333' }, `${formatText(witnessText)}`] },
                                { text: '6', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम और सकूनत उन लोगो को जो जुर्म की शहादत दे सकते हैं:-\n', bold: true, color: '#333' }, `${formatText(witnessText)}`] }
                            ],
                            [
                                { text: '7', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम आफिसर तहकीकात कुनिन्दा मय तारीख तहकीकातः-\n', bold: true, color: '#333' }, `${point7Content}`] },
                                { text: '7', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'नाम आफिसर तहकीकात कुनिन्दा मय तारीख तहकीकातः-\n', bold: true, color: '#333' }, `${point7Content}`] }
                            ],
                            [
                                { text: '8', alignment: 'center', bold: true, color: '#333' },
                                { text: [{ text: 'मुख्तसिर नतीजा तहकीकात मय बयान मुलजिमः-\n', bold: true, color: '#333' }, `${formatText(this.muljim_bayan_detail)}`] },
                                { text: '8', alignment: 'center', bold: true, color: '#333' },
                                {
                                    stack: [
                                        { text: 'फैसलाः-', bold: true, color: '#333', margin: [0, 0, 0, 10] }
                                    ]
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#000',
                        vLineColor: () => '#000',
                        paddingLeft: (i: any) => (i % 2 === 0 ? 1 : 3),
                        paddingRight: (i: any) => (i % 2 === 0 ? 1 : 2),
                        paddingTop: () => 6,
                        paddingBottom: () => 6
                    }
                },
                {
                    columns: [
                        { text: 'विवेचना अधिकारी के हस्ताक्षर', alignment: 'left', bold: true, width: '*' },
                        { text: 'प्रस्तुतकर्ता', alignment: 'right', bold: true, width: '*', margin: [0, 0, 30, 0] },
                        { text: 'तारीखः- ____________', alignment: 'left', bold: true, width: '*', margin: [30, 0, 0, 0] },
                        { text: 'दस्तखत मजिस्ट्रेट', alignment: 'right', bold: true, width: '*' }
                    ],
                    margin: [10, 50, 10, 0],
                    fontSize: 10
                }
            ]

            if (index > 0) {
                (accussed_content[0] as any).pageBreak = 'before';
            }


            contentArray.push(...accussed_content);


        }

        // const data = this.challanData;
        // const valInvOfficer = data.investigation_officer || this.input_investigation_officer || '';
        // const valInvDesignation = data.io_designation || this.input_io_designation || '';
        // const rawInvDate = data.investigation_date || this.input_investigation_date;
        // const valInvDate = (rawInvDate && rawInvDate !== '--') ? this.ddMMyyyyFormatDate(rawInvDate) : '';
        // const valSummary = data.summary || this.input_summary || '';
        // const valArrestDate = (data.arrest_date && data.arrest_date !== '--') ? data.arrest_date : '';
        // const displayDate = data.incident_date;

        // // const point7Content = [this.adhikari_name, this.pad, this.investigation_date ? `तारीख ${this.investigation_date}` : ''].filter(s => s).join(' ');

        // const point8Content = valSummary ? `विवरण ${valSummary}` : '';

        // // const witnessText = this.listOfWitness.map((w: any, i: number) => {
        // //     return `(${i + 1}) ${w.naam} पिता ${w.pita_ka_naam} जाति ${w.jaati} उम्र ${w.age} निवासी ${w.address}`;
        // // }).join('\n');


        // const docDefinition: any = {
        //     content: [
        //         {
        //             text: 'चालान फार्म',
        //             fontSize: 14,
        //             alignment: 'center',
        //             decoration: 'underline',
        //             margin: [0, 0, 0, 8]
        //         },
        //         {
        //             table: {
        //                 widths: ['*', '*'],
        //                 body: [
        //                     [
        //                         {
        //                             stack: [
        //                                 { text: `क्रमांक पी.ओ.आर ${this.comingComplaintData.por_number}`, margin: [0, 0] },
        //                                 { text: `सन्  ${this.comingComplaintData.date_of_crime}`, margin: [0, 0] },
        //                                 { text: `सब रेंज  ${this.comingComplaintData.sub_range_name}`, margin: [0, 0] },
        //                                 { text: `रेंज  ${this.comingComplaintData.range_name}`, margin: [0, 0] }
        //                             ],
        //                             border: [false, false, false, false],
        //                             fontSize: 9
        //                         },
        //                         {
        //                             stack: [
        //                                 { text: `पुस्तक क्रमांक पी.ओ.आर ${this.comingComplaintData.por_number}`, margin: [0, 0] },
        //                                 { text: `सन्  ${this.comingComplaintData.date_of_crime}`, margin: [0, 0] },
        //                                 { text: `सब रेंज  ${this.comingComplaintData.sub_range_name}`, margin: [0, 0] },
        //                                 { text: `रेंज  ${this.comingComplaintData.range_name}`, margin: [0, 0] }
        //                             ],
        //                             border: [false, false, false, false],
        //                             fontSize: 9
        //                         }
        //                     ]
        //                 ]
        //             },
        //             margin: [0, 0, 0, 4]
        //         },
        //         {
        //             table: {
        //                 widths: [10, '*', 10, '*'],
        //                 body: [
        //                     [
        //                         { text: '1', alignment: 'center', bold: true, color: '#333' },
        //                         {
        //                             text: [{ text: 'तारीख रिपोर्ट मय नाम ओहदा जिसने पता लगायाः- ', bold: true, color: '#333' }, `तारीख ${this.comingComplaintData.actual_crime_date} नाम - ${this.comingComplaintData.complainer_name} ${this.comingComplaintData.complainer_pad} ${this.comingComplaintData.is_complain_created_by_ra == '0' ? this.comingComplaintData.beat_name : this.comingComplaintData.sub_range_name} ${this.comingComplaintData.range_name}`]
        //                         },

        //                         { text: '1', alignment: 'center', bold: true, color: '#333' },
        //                         {
        //                             text: [{ text: 'तारीख रिपोर्ट मय नाम ओहदा जिसने पता लगायाः- ', bold: true, color: '#333' }, `तारीख ${this.comingComplaintData.actual_crime_date} नाम - ${this.comingComplaintData.complainer_name} ${this.comingComplaintData.complainer_pad} ${this.comingComplaintData.is_complain_created_by_ra == '0' ? this.comingComplaintData.beat_name : this.comingComplaintData.sub_range_name} ${this.comingComplaintData.range_name}`]
        //                         }
        //                     ],
        //                     [
        //                         { text: '2', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'तारीख वकुआ जुर्मः- ', bold: true, color: '#333' }, `दिनांक ${this.comingComplaintData.date_of_crime}`] },
        //                         { text: '2', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'तारीख वकुआ जुर्मः- ', bold: true, color: '#333' }, `दिनांक ${this.comingComplaintData.date_of_crime}`] }
        //                     ],
        //                     [
        //                         { text: '3', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम मुलजिम मय वल्दियत, कौमियत व. सकूनतः- ', bold: true, color: '#333' }, `${data.accused_name} पिता ${data.father_name} उम्र - ${data.age} जाति ${data.caste} निवासी ${data.address} तह + जिला गरियाबंद छ०ग०`] },
        //                         { text: '3', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम मुलजिम मय वल्दियत, कौमियत व. सकूनतः- ', bold: true, color: '#333' }, `${data.accused_name} पिता ${data.father_name} उम्र - ${data.age} जाति ${data.caste} निवासी ${data.address} तह + जिला गरियाबंद छ०ग०`] }
        //                     ],
        //                     [
        //                         { text: '4', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'तारीख गिरफ्तारी मुलजिम अगर गिरफ्तार हुआ होः- ', bold: true, color: '#333' }, `${valArrestDate}`] },
        //                         { text: '4', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'तारीख गिरफ्तारी मुलजिम अगर गिरफ्तार हुआ होः- ', bold: true, color: '#333' }, `${valArrestDate}`] }
        //                     ],
        //                     [
        //                         { text: '5', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'किस्म जुर्म व मुलजिम दफा फारेस्ट एक्ट मय तखनीमा नुकसानः- ', bold: true, color: '#333' }, `${data.crime_sections}`] },
        //                         { text: '5', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'किस्म जुर्म व मुलजिम दफा फारेस्ट एक्ट मय तखनीमा नुकसानः- ', bold: true, color: '#333' }, `${data.crime_sections}`] }
        //                     ],
        //                     [
        //                         { text: '6', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम और सकूनत उन लोगो को जो जुर्म की शहादत दे सकते हैं:-\n', bold: true, color: '#333' }, `${witnessText}`] },
        //                         { text: '6', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम और सकूनत उन लोगो को जो जुर्म की शहादत दे सकते हैं:-\n', bold: true, color: '#333' }, `${witnessText}`] }
        //                     ],
        //                     [
        //                         { text: '7', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम आफिसर तहकीकात कुनिन्दा मय तारीख तहकीकातः- ', bold: true, color: '#333' }, `${point7Content}`] },
        //                         { text: '7', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'नाम आफिसर तहकीकात कुनिन्दा मय तारीख तहकीकातः- ', bold: true, color: '#333' }, `${point7Content}`] }
        //                     ],
        //                     [
        //                         { text: '8', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'मुख्तसिर नतीजा तहकीकात मय बयान मुलजिमः- ', bold: true, color: '#333' }, `${this.muljim_bayan_detail}`] },
        //                         { text: '8', alignment: 'center', bold: true, color: '#333' },
        //                         { text: [{ text: 'फैसलाः-', bold: true, color: '#333' }, `${dottedLines}`] }
        //                     ]
        //                 ]
        //             },
        //             layout: {
        //                 hLineWidth: () => 0.5,
        //                 vLineWidth: () => 0.5,
        //                 hLineColor: () => '#000',
        //                 vLineColor: () => '#000',
        //                 paddingLeft: (i: any) => (i % 2 === 0 ? 1 : 3),
        //                 paddingRight: (i: any) => (i % 2 === 0 ? 1 : 2),
        //                 paddingTop: () => 2,
        //                 paddingBottom: () => 2
        //             }
        //         },
        //         {
        //             text: 'तारीखः- ____________',
        //             alignment: 'center',
        //             margin: [0, 8, 0, 10],
        //             fontSize: 10
        //         },
        //         {
        //             columns: [
        //                 { text: 'जांचकर्ता', alignment: 'left', bold: true, width: '*' },
        //                 { text: 'प्रस्तुतकर्ता', alignment: 'center', bold: true, width: '*' },
        //                 { text: 'दस्तखत मजि', alignment: 'right', bold: true, width: '*' }
        //             ],
        //             margin: [10, 0, 10, 0],
        //             fontSize: 10
        //         }
        //     ],
        //     defaultStyle: {
        //         font: 'NotoSansDevanagari',
        //         fontSize: 7.8,
        //         lineHeight: 1.05
        //     },
        //     pageMargins: [10, 10, 10, 10]
        // };

        // pdfMake.createPdf(docDefinition).download(`Challan_Form_${data.por_number}.pdf`);


        const docDefinition: any = {
            content: contentArray,

            defaultStyle: {
                font: 'NotoSansDevanagari',
                fontSize: 7.8,
                lineHeight: 1.05
            },
            pageMargins: [65, 10, 65, 10],

            styles: {
                title: {
                    fontSize: 14,    // 18 → bahut bada lagta hai print me
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 6]
                },

                subTitle: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 8]
                },

                section: {
                    bold: true,
                    margin: [0, 6, 0, 4]
                }
            },

            //pageMargins: [40, 30, 40, 30] // 🔹 clean left-right spacing
        };

        const safePorNumber = (this.comingComplaintData?.por_number || '')
            .replace(/[\\/:*?"<>|]/g, '_')
            .replace(/\s+/g, '_');
        const fileName = `CHALLAN_FORM_PDF_${safePorNumber}.pdf`;

        if (this.platform.is('desktop')) {

            pdfMake.createPdf(docDefinition).download(fileName);

        } else if (this.platform.is('android')) {

            await this.checkAndRequestStoragePermission();

            const PDF_TIMEOUT_MS = 35000;

            const dataUrl = await new Promise<string>((resolve, reject) => {
                const timer = setTimeout(() => {
                    reject(new Error('PDF generation timed out. Please try again.'));
                }, PDF_TIMEOUT_MS);

                pdfMake.createPdf(docDefinition).getDataUrl((dataUrlResult: string) => {
                    clearTimeout(timer);
                    if (dataUrlResult) {
                        resolve(dataUrlResult);
                    } else {
                        reject(new Error('PDF generation failed.'));
                    }
                });
            }).catch(err => {
                this.showError(err?.message || 'PDF तैयार नहीं हो सका।');
                return '';
            });

            if (!dataUrl) return;

            try {
                const base64Payload = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Payload,
                    directory: Directory.Documents,
                    recursive: true
                });

                await Share.share({
                    title: 'Challan Form PDF',
                    text: 'चालान फार्म पीडीएफ',
                    url: savedFile.uri,
                    dialogTitle: 'Share or Save PDF'
                });
            } catch (err: any) {
                this.showError(err?.message || 'PDF सहेजने में त्रुटि।');
            }

        }

    }

    getTranslation(key: string) {
        return this.languageService.getTranslation(key);
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

        this.showPdfButton = false;
        this.showDialog("कृपया प्रतीक्षा करें");

        this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.user_id.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {

                    if (response.complainData && response.complainData.length > 0) {

                        this.comingComplaintData = response.complainData[0];

                        
                        this.listOfWitness = this.comingComplaintData.listOfWitness;

                    }

                    
                    if (response.gir_patrak && response.gir_patrak.length) {
                        
                        for (let i = 0; i < response.gir_patrak.length; i++) {

                            const rowPerson = this.accusedPersonsList[i];

                            const girPatrakData = response.gir_patrak.find(item =>
                                item.accussed_person_table_id === rowPerson.accussed_person_table_id
                            );

                            if (girPatrakData) {
                                
                                rowPerson.id_to_update = girPatrakData.id_to_update;
                                rowPerson.gir_date = girPatrakData.gir_date;
                                rowPerson.gir_time = this.to12Hour(girPatrakData.gir_time);
                                rowPerson.gir_sthan = girPatrakData.gir_sthan;
                                rowPerson.gir_adhikari = girPatrakData.gir_adhikari_ka_name_and_pad;
                                rowPerson.gir_paya_gaya_saman = girPatrakData.gir_time_paya_gaya_saman;
                                rowPerson.gir_body_mark = girPatrakData.chonto_ka_vivran;
                            }

                        }
                    }


                    if (response.court_challan_form && response.court_challan_form.length > 0) {

                        for (let i = 0; i < response.court_challan_form.length; i++) {

                            let courtChallanFormValues = response.court_challan_form[i];

                            this.id_to_update = courtChallanFormValues.id_to_update;
                            this.adhikari_name = courtChallanFormValues.adhikari_name;
                            this.pad = courtChallanFormValues.pad;
                            this.investigation_date = courtChallanFormValues.investigation_date;
                            this.muljim_bayan_detail = courtChallanFormValues.muljim_bayan_detail;


                        }

                        this.showPdfButton = true;
                    } else {
                        this.showPdfButton = false;
                    }


                }


            },
            (error) => {
                this.dismissDialog();
                this.showPdfButton = false;
            }
        );

    }


    to12Hour(time24: string | undefined): string {
        if (!time24) return '--';

        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;

        return `${hour.toString().padStart(2, '0')}: ${m.toString().padStart(2, '0')} ${ampm}`;
    }

    getCrimDharaCommaSeparated(input: string): string {
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

    adhikari_name: string = "";
    pad: string = "";
    investigation_date: string = "";
    muljim_bayan_detail: string = "";

    id_to_update: string = "";

    submit_to_server() {

        if (this.adhikari_name === "") {
            this.showError("अधिकारी का नाम");
            return;
        }

        if (this.actual_crime_date && this.actual_crime_date > this.todayDate) {
            this.showError("तारीख वकुआ जुर्मः- आज या उससे पहले होनी चाहिए");
            return;
        }

        // if (this.pad === "") {
        //     this.showError("अधिकारी का पद");
        //     return;
        // }

        // if (this.investigation_date === "") {
        //     this.showError("तहकीकात तारीख");
        //     return;
        // }

        if (this.muljim_bayan_detail === "") {
            this.showError("मुख्तसिर नतीजा तहकीकात मय बयान मुलजिमः");
            return;
        }

        this.showDialog("कृपया प्रतीक्षा करें");
        
        this.apiService.submitCourtChallanDetail(
            this.comingComplaintData.complain_id,
            this.adhikari_name,
            this.pad,
            this.investigation_date,
            this.muljim_bayan_detail,
            this.user_id.toString(),
            this.id_to_update.toString()
        ).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {
                    this.sharedService.setRefresh(true);
                    this.id_to_update = response.response.generated_id;
                    this.showPdfButton = true;

                    this.showError(response.response.msg);

                } else {
                    this.showPdfButton = false;
                    this.showError(response.response.msg);
                }

            },
            (error) => {

                this.dismissDialog();
                this.showPdfButton = false;
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

    isWebPlatform(): boolean {
        return this.platform.is('desktop');
    }


}
