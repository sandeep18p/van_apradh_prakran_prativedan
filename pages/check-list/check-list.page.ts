import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LanguageServiceService } from 'src/app/services/languageServices/language-service.service';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { arrowBack, checkmarkCircleOutline, closeCircleOutline, downloadOutline, documentTextOutline, informationCircleOutline, peopleOutline, listOutline } from 'ionicons/icons';
import { SharedserviceService } from 'src/app/services/sharedService/sharedservice.service';
import { addIcons } from 'ionicons';
import { Platform } from '@ionic/angular';
import pdfMake from 'pdfmake/build/pdfmake';
import { vfs as vfsRegular } from 'src/assets/fonts/vfs_fonts_custom';
import { vfs as vfsBold } from 'src/assets/fonts/vfs_fonts_bold_custom';
import { Router } from '@angular/router';
import { AccusedPersonForCourtChalanDetail, ComplainDetails } from '../officer-dashboard/GetDashboardResponse.model';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Users } from '../login-officer/OfficerLoginResponse';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { MessageDialogComponent } from 'src/app/dialogs/message-dialog/message-dialog.component';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

const mergedVfs = {
    ...vfsRegular,
    ...vfsBold
};

@Component({
    selector: 'app-check-list',
    templateUrl: './check-list.page.html',
    styleUrls: ['./check-list.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule],
    providers: [AndroidPermissions]
})
export class CheckListPage implements OnInit {

    private androidPermissions = inject(AndroidPermissions);

    comingComplaintData!: ComplainDetails;

    user_id: number = 0;
    loginedOfficerDesignationId: string = "";

    accusedPersonsList: AccusedPersonForCourtChalanDetail[] = [];

    por_number: string = "";
    rangName: string = "";
    divisionName: string = "";

    crime_dhara: string = "";

    masterQuestions = [
        { id: 1, text: 'अपराधी को आगे अन्य कोई अपराध करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
        { id: 2, text: 'अपराधी को इस अपराध की समुचित जांच के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
        { id: 3, text: 'अपराधी को इस अपराध से संबंधित सबूत को गायब या किसी तरह से छेड़छाड़ करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
        { id: 4, text: 'अपराधी को किसी ऐसे व्यक्ति को पुलिस या न्यायालय को अपराध के संबंध में किसी तथ्य की जानकारी देने से प्रवाचित करने, धमकी देने या वचन के द्वारा निवारित करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
        { id: 5, text: 'अपराधी को उसकी उपस्थिति न्यायालय के समक्ष सुनिश्चित करने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
        { id: 6, text: 'अपराधी को आगे अन्य कोई अपराध करने से रोकने के लिए गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' }
    ];

    checkListData: any = {
        por_number: '7877/99',
        incident_date: '30/01/2025',
        crime_type: 'अवैध कटाई',
        crime_sections: 'वन्य प्राणी संरक्षण अधिनियम 1972 की धारा 9, 39, 50, 51',
        sub_range: 'गरियाबंद',
        accused_details: 'गंगासिंग बघेल पिता स्व. श्री भुवन लाल बघेल निवासी गरियाबंद',
        arrest_date: '30/01/2025',
        arrest_time: '11:30 AM',
        arrest_place: 'गरियाबंद',
        range_office: 'गरियाबंद डिवीजन गरियाबंद',
        questions: [
            { id: 1, text: 'अपराधी को आगे अन्य कोई अपराध करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
            { id: 2, text: 'अपराधी को इस अपराध की समुचित जांच के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
            { id: 3, text: 'अपराधी को इस अपराध से संबंधित सबूत को गायब या किसी तरह से छेड़छाड़ करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
            { id: 4, text: 'अपराधी को किसी ऐसे व्यक्ति को पुलिस या न्यायालय को अपराध के संबंध में किसी तथ्य की जानकारी देने से प्रवाचित करने, धमकी देने या वचन के द्वारा निवारित करने से रोकने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
            { id: 5, text: 'अपराधी को उसकी उपस्थिति न्यायालय के समक्ष सुनिश्चित करने के लिये सुनिश्चित करने के लिये गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' },
            { id: 6, text: 'अपराधी को आगे अन्य कोई अपराध करने से रोकने के लिए गिरफ्तार किया गया है?', answer: 'नहीं', reason: '' }
        ]
    };

    isLoading: boolean = false;
    loadingMessage: string = 'कृपया प्रतीक्षा करें...';
    canShowPdfDownload: boolean = false;

    constructor(
        private sharedService: SharedserviceService,
        private modalController: ModalController,
        private apiService: ApiServiceService,
        private languageService: LanguageServiceService,
        private navCtrl: NavController,
        private cdRef: ChangeDetectorRef,
        private platform: Platform,
        private router: Router
    ) {
        addIcons({ arrowBack, checkmarkCircleOutline, closeCircleOutline, downloadOutline, documentTextOutline, informationCircleOutline, peopleOutline, listOutline });
    }

    async ngOnInit() {
        this.canShowPdfDownload = false;

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

                this.accusedPersonsList = this.accusedPersonsList.map(accused => {

                    const questions = this.masterQuestions.map(q => {
                        const yesNoKey = `answer_${q.id}_yes_no` as keyof AccusedPersonForCourtChalanDetail;
                        const reasonKey = `answer_${q.id}_reason` as keyof AccusedPersonForCourtChalanDetail;

                        return {
                            id: q.id,
                            text: q.text,
                            answer: (accused[yesNoKey] ?? '0').toString(), // <-- always string
                            reason: (accused[reasonKey] ?? '').toString()  // <-- always string
                        };
                    });

                    return {
                        ...accused,
                        answer_1_yes_no: (accused.answer_1_yes_no ?? '0').toString(),
                        answer_2_yes_no: (accused.answer_2_yes_no ?? '0').toString(),
                        answer_3_yes_no: (accused.answer_3_yes_no ?? '0').toString(),
                        answer_4_yes_no: (accused.answer_4_yes_no ?? '0').toString(),
                        answer_5_yes_no: (accused.answer_5_yes_no ?? '0').toString(),
                        answer_6_yes_no: (accused.answer_6_yes_no ?? '0').toString(),

                        answer_1_reason: (accused.answer_1_reason ?? '').toString(),
                        answer_2_reason: (accused.answer_2_reason ?? '').toString(),
                        answer_3_reason: (accused.answer_3_reason ?? '').toString(),
                        answer_4_reason: (accused.answer_4_reason ?? '').toString(),
                        answer_5_reason: (accused.answer_5_reason ?? '').toString(),
                        answer_6_reason: (accused.answer_6_reason ?? '').toString(),

                        questions
                    };
                });


            } else {
                this.accusedPersonsList = [];
            }

        }

        const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

        if (value) {
            const userData = JSON.parse(value) as Users;

            this.user_id = userData.emp_id;
            this.loginedOfficerDesignationId = userData.designation_id;
            this.rangName = userData.range_name;
            this.divisionName = userData.division_name;

            this.getDetailOfComplain();

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

    async longToast(msg: string) {
        await Toast.show({
            text: msg,
            duration: 'long',
            position: 'bottom'
        });
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

    goBack() {
        this.navCtrl.back();
    }

    submitData() {

        let personDetail = JSON.stringify(this.accusedPersonsList);

        this.showDialog("कृपया प्रतीक्षा करें");

        this.apiService.submitCourtCheckListDetail(
            this.comingComplaintData.complain_id,
            this.user_id.toString(),
            personDetail
        ).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {
                    this.canShowPdfDownload = true;

                    let giraftari_patrak_id = response.response.generated_id;

                    const idsArray = giraftari_patrak_id
                        .split(",")
                        .map(id => id.trim())
                        .filter(id => id !== "");

                    for (let i = 0; i < this.accusedPersonsList.length; i++) {
                        const row = this.accusedPersonsList[i];
                        let idToUpdate = idsArray[i];
                        row.id_to_update = idToUpdate;
                    }

                    this.showError(response.response.msg);

                } else {
                    this.canShowPdfDownload = false;
                    this.showError(response.response.msg);
                }

            },
            (error) => {

                this.dismissDialog();
                this.canShowPdfDownload = false;
                this.showError(error);
            }
        );

    }

    async downloadPdf() {
        if (!this.canShowPdfDownload) {
            await this.showError("PDF डाउनलोड करने से पहले सफलतापूर्वक SUBMIT करें या backend से data आने दें।");
            return;
        }

        const contentArray: any[] = [];

        const formatText = (text: string) => {
            if (!text) return '';
            return text.replace(/(\S{22})/g, '$1\u200B'); // ensures long gibberish words properly wrap instead of overflowing 
        };

        console.log('Downloading Check List PDF...');

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

            for (let index = 0; index < this.accusedPersonsList.length; index++) {

                let accussedModel = this.accusedPersonsList[index];

                let question = accussedModel.questions;

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

                    { text: 'चेक लिस्ट', fontSize: 14, alignment: 'center', bold: true, margin: [0, 20, 0, 2], decoration: 'underline' },
                    { text: 'दण्ड प्रक्रिया संहिता की धारा 41(1)(ii) के अंतर्गत', fontSize: 11, alignment: 'center', margin: [0, 0, 0, 2] },
                    { text: `कार्यालय वन परिक्षेत्र अधिकारी ${this.comingComplaintData.range_name || '............................'}`, fontSize: 11, alignment: 'center', bold: true, margin: [0, 0, 0, 8] },

                    {
                        table: {
                            widths: [130, '*', 100, '*'],
                            body: [
                                [
                                    { text: 'वन अपराध प्रकरण क्रमांक', bold: true, color: '#333' },
                                    { text: this.por_number },
                                    { text: 'पंजीयन दिनांक', bold: true, color: '#333' },
                                    { text: this.comingComplaintData.date_of_crime }
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
                        },
                        margin: [0, 0, 0, 0]
                    },
                    {
                        table: {
                            widths: [130, '*'],
                            body: [
                                [
                                    { text: 'अपराध का प्रकार', bold: true, color: '#333' },
                                    { text: this.comingComplaintData.crime_type }
                                ],
                                [
                                    { text: 'अधिनियम/नियम एवं धाराएं', bold: true, color: '#333' },
                                    { text: this.crime_dhara }
                                ],
                                [
                                    { text: 'अपराधी का पूर्ण विवरण', bold: true, color: '#333' },
                                    { text: `नाम : ${name}, पिता का नाम : ${fatherName} उम्र : ${age}, जाति : ${jati}, मोबाइल नंबर : ${mobile} , पता : ${address}` },
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
                        table: {
                            widths: [130, '*', 60, '*', 60, '*'],
                            body: [
                                [
                                    { text: 'गिरफ्तारी दिनांक', bold: true, color: '#333' },
                                    { text: gir_date },
                                    { text: 'समय', bold: true, color: '#333' },
                                    { text: gir_time },
                                    { text: 'स्थान', bold: true, color: '#333' },
                                    { text: gir_sthan }
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
                        text: 'अपराधी की गिरफ्तारी निम्नलिखित कारणों से की गयी है:-',
                        bold: true,
                        fontSize: 10,
                        alignment: 'center',
                        margin: [0, 8, 0, 5]
                    },


                    {
                        table: {
                            widths: [20, '*', 45],
                            body: question?.map((q: any) => {
                                return [
                                    [
                                        { text: q.id.toString(), alignment: 'center', margin: [0, 4] },
                                        {
                                            stack: [
                                                { text: q.text, margin: [0, 2] },
                                                ...(q.answer === '1'
                                                    ? [{ text: `यदि हां तो कारण:\n${formatText(q.reason || '------------------------------------------------')}`, fontSize: 8, margin: [0, 4, 0, 2], bold: true }]
                                                    : []
                                                )
                                            ]
                                        },
                                        { text: q.answer === '1' ? 'हाँ' : 'नहीं', alignment: 'center', bold: true, margin: [0, 4] }
                                    ]
                                ];
                            }).reduce((acc: any, val: any) => acc.concat(val), [])
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
                        text: 'विवेचना अधिकारी का हस्ताक्षर',
                        alignment: 'right',
                        bold: true,
                        margin: [0, 50, 10, 0],
                        fontSize: 10
                    }

                ]

                if (index > 0) {
                    (accussed_content[0] as any).pageBreak = 'before';
                }


                contentArray.push(...accussed_content);

            }

            const docDefinition: any = {
                content: contentArray,

                defaultStyle: {
                    font: 'NotoSansDevanagari',
                    fontSize: 7.8,
                    lineHeight: 1.05
                },
                pageMargins: [50, 10, 50, 10],

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

            };

            const safePorNumber = (this.comingComplaintData?.por_number || '')
                .replace(/[\\/:*?"<>|]/g, '_')
                .replace(/\s+/g, '_');
            const fileName = `चेक_लिस्ट_PDF_${safePorNumber}.pdf`;

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
                    this.longToast(err?.message || 'PDF तैयार नहीं हो सका।');
                    return;
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
                        title: 'चेक लिस्ट PDF',
                        text: 'चेक लिस्ट पीडीएफ',
                        url: savedFile.uri,
                        dialogTitle: 'Share or Save PDF'
                    });
                } catch (err: any) {
                    this.longToast(err?.message || 'PDF सहेजने में त्रुटि।');
                }
            }

        } catch (error: any) {
            console.error('Error generating PDF:', error);
            this.longToast(error?.message || 'PDF तैयार नहीं हो सका।');
        }
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



    getDetailOfComplain() {

        this.showDialog("कृपया प्रतीक्षा करें");

        this.apiService.getComplainDetailOfSelectedOne(this.comingComplaintData.complain_id, this.user_id.toString(), this.loginedOfficerDesignationId.toString()).subscribe(
            (response) => {
                this.dismissDialog();

                if (response.response.code === 200) {
                    this.canShowPdfDownload = !!(response.court_check_list && response.court_check_list.length);

                    if (response.complainData && response.complainData.length > 0) {

                        this.comingComplaintData = response.complainData[0];


                    }


                    if (response.gir_patrak && response.gir_patrak.length) {

                        for (let i = 0; i < response.gir_patrak.length; i++) {

                            const rowPerson = this.accusedPersonsList[i];

                            const girPatrakData = response.gir_patrak.find(item =>
                                item.accussed_person_table_id === rowPerson.accussed_person_table_id
                            );

                            if (girPatrakData) {
                                 ;
                                //rowPerson.id_to_update = girPatrakData.id_to_update;
                                rowPerson.gir_date = girPatrakData.gir_date;
                                rowPerson.gir_time = this.to12Hour(girPatrakData.gir_time);
                                rowPerson.gir_sthan = girPatrakData.gir_sthan;
                                rowPerson.gir_adhikari = girPatrakData.gir_adhikari_ka_name_and_pad;
                                rowPerson.gir_paya_gaya_saman = girPatrakData.gir_time_paya_gaya_saman;
                                rowPerson.gir_body_mark = girPatrakData.chonto_ka_vivran;
                            }

                        }
                    }


                    if (response.court_check_list && response.court_check_list.length) {
                         ;

                        for (let i = 0; i < response.court_check_list.length; i++) {

                            const rowPerson = this.accusedPersonsList[i];
                            const checkListData = response.court_check_list[i];

                            rowPerson.id_to_update = checkListData.id_to_update;
                            rowPerson.accussed_person_table_id = checkListData.accussed_person_table_id;

                            rowPerson.answer_1_yes_no = checkListData.answer_1_yes_no;
                            rowPerson.answer_1_reason = checkListData.answer_1_reason;

                            rowPerson.answer_2_yes_no = checkListData.answer_2_yes_no;
                            rowPerson.answer_2_reason = checkListData.answer_2_reason;

                            rowPerson.answer_3_yes_no = checkListData.answer_3_yes_no;
                            rowPerson.answer_3_reason = checkListData.answer_3_reason;

                            rowPerson.answer_4_yes_no = checkListData.answer_4_yes_no;
                            rowPerson.answer_4_reason = checkListData.answer_4_reason;

                            rowPerson.answer_5_yes_no = checkListData.answer_5_yes_no;
                            rowPerson.answer_5_reason = checkListData.answer_5_reason;

                            rowPerson.answer_6_yes_no = checkListData.answer_6_yes_no;
                            rowPerson.answer_6_reason = checkListData.answer_6_reason;


                            const questions = this.masterQuestions.map(q => {
                                const yesNoKey = `answer_${q.id}_yes_no` as keyof AccusedPersonForCourtChalanDetail;
                                const reasonKey = `answer_${q.id}_reason` as keyof AccusedPersonForCourtChalanDetail;

                                // Use server value if present, else default '0'
                                const answerFromServer = rowPerson[yesNoKey] !== undefined && rowPerson[yesNoKey] !== null
                                    ? rowPerson[yesNoKey].toString()
                                    : '0';

                                const reasonFromServer = rowPerson[reasonKey] !== undefined && rowPerson[reasonKey] !== null
                                    ? rowPerson[reasonKey].toString()
                                    : '';

                                return {
                                    id: q.id,
                                    text: q.text,
                                    answer: answerFromServer, // '0' or '1' from server
                                    reason: reasonFromServer
                                };
                            })

                            rowPerson.questions = questions;

                        }
                    }


                }
                else {
                    this.canShowPdfDownload = false;
                }


            },
            (error) => {
                this.dismissDialog();
                this.canShowPdfDownload = false;
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

    to12Hour(time24: string | undefined): string {
        if (!time24) return '--';

        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;

        return `${hour.toString().padStart(2, '0')}: ${m.toString().padStart(2, '0')} ${ampm}`;
    }


    onSegmentChange(event: any, question_id: number, row: any) {


        const selectedValue = event.detail.value;
        const answer = selectedValue;

        if (question_id === 1) {
            row.answer_1_yes_no = answer;
        } else if (question_id === 2) {
            row.answer_2_yes_no = answer;
        } else if (question_id === 3) {
            row.answer_3_yes_no = answer;
        } else if (question_id === 4) {
            row.answer_4_yes_no = answer;
        } else if (question_id === 5) {
            row.answer_5_yes_no = answer;
        } else if (question_id === 6) {
            row.answer_6_yes_no = answer;
        }

    }

    onReasonChange(question: any, row: any) {

        if (question.id === 1) {
            row.answer_1_reason = question.reason;
        } else if (question.id === 2) {
            row.answer_2_reason = question.reason;
        } else if (question.id === 3) {
            row.answer_3_reason = question.reason;
        } else if (question.id === 4) {
            row.answer_4_reason = question.reason;
        } else if (question.id === 5) {
            row.answer_5_reason = question.reason;
        } else if (question.id === 6) {
            row.answer_6_reason = question.reason;
        }

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

}
