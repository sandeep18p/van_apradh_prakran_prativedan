import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSheetController, Platform } from '@ionic/angular/standalone';

import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip } from '@ionic/angular/standalone';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Browser } from '@capacitor/browser';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
    documentTextOutline, chevronDownOutline, chevronUpOutline,
    closeOutline, logInOutline, homeOutline, personOutline,
    gridOutline, eyeOutline, eyeOffOutline, leafOutline,
    libraryOutline, documentsOutline, checkmarkCircleOutline,
    arrowForwardOutline, arrowBackOutline, chevronForwardOutline,
    calculatorOutline, pricetagOutline, statsChartOutline,
    schoolOutline, shieldCheckmarkOutline, constructOutline,
    downloadOutline
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from '../../constants/PreferenceKeys';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, FormsModule, IonRadioGroup,
        IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
        IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
        IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
        IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
        IonModal, IonChip
    ]
})
export class HomePage implements OnInit {

    showDataTable: boolean = false;
    isLoggedIn: boolean = false;
    showManual613Modal: boolean = false;
    isWeb: boolean = true;

    actsAndRules = [
        { name: 'भारतीय वन अधिनियम 1927', status: 'OK', remark: '', docName: 'ifa-1927.pdf' },
        { name: 'छत्तीसगढ़ तेन्दूपत्ता (व्यापार विनियमन) अधिनियम 1964', status: 'OK', remark: '', docName: 'cg-tendu-1964.pdf' },
        { name: 'छत्तीसगढ़ तेन्दूपत्ता (व्यापार विनियमन) नियमावली 1966', status: 'OK', remark: '', docName: 'cg-tendu-rules-1966.pdf' },
        { name: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) अधिनियम 1969', status: 'OK', remark: '', docName: 'cg-fp-trade-1969.pdf' },
        { name: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) नियम 1969', status: 'OK', remark: '', docName: 'cg-fp-trade-rules-1969.pdf' },
        { name: 'वन्य प्राणी (संरक्षण) अधिनियम 1972 यथा संशोधित 2022', status: 'OK', remark: 'सूची नहीं है', docName: 'wpa-1972.pdf' },
        { name: 'छत्तीसगढ़ वनोपज (व्यापार विनियमन) काष्ठ नियम 1973', status: 'OK', remark: '', docName: 'cg-fp-trade-timber-1973.pdf' },
        { name: 'छत्तीसगढ़ काष्ठ चिरान (विनियमन) अधिनियम 1984', status: 'OK', remark: '', docName: 'cg-timber-1984.pdf' },
        { name: 'छत्तीसगढ़ काष्ठ चिरान (विनियमन) नियम 1984', status: 'OK', remark: '', highlight: 'orange', docName: 'cg-timber-rules-1984.pdf' },
        { name: 'लोक संपत्ति क्षति निवारण अधिनियम 1984', status: '', remark: '', highlight: 'orange', docName: 'ppd-1984.pdf' },
        { name: 'छत्तीसगढ़ चराई नियम 1986', status: 'OK', remark: '', docName: 'cg-grazing-1986.pdf' },
        { name: 'छत्तीसगढ़ वनोपज (अभिवहन) नियम 2001', status: 'OK', remark: '', docName: 'cg-fp-transport-2001.pdf' },
        { name: 'वन्य प्राणी (संरक्षण) संशोधित अधिनियम 2022', status: 'OK', remark: 'सूची नहीं है', docName: 'wpa-amendmend-2022.pdf' },
    ];

    referenceDocs = [
        { name: 'फॉर्म फेक्टर', detail: '', status: 'OK', docName: 'form_factor.pdf', icon: 'construct-outline', isFormFactor: true },
        { name: 'गैर वाणिज्यक दर', detail: '', status: 'OK', docName: 'non_commercial_rate.pdf', icon: 'pricetag-outline', isNonCommercialRate: true },
        { name: 'आयतन गणना पत्रक', detail: '', status: 'OK', docName: 'jantri_volume_calculation.pdf', icon: 'calculator-outline', isJantri: true },
        { name: 'फारेस्ट मैनुअल', detail: '', status: 'OK', docName: 'forest_manual.pdf', isManual: true, icon: 'library-outline' },
        { name: 'ट्रेनिंग मैनुअल', detail: '', status: 'OK', docName: 'training_manual.pdf', icon: 'school-outline', isTrainingManual: true },
        { name: 'शक्ति का प्रत्यायोजन', detail: '', status: 'OK', docName: 'delegation_of_power.pdf', icon: 'shield-checkmark-outline' },
    ];

    constructor(
        private sanitizer: DomSanitizer,
        private router: Router, private actionSheetCtrl: ActionSheetController, private platform: Platform) {
        addIcons({
            documentTextOutline, chevronDownOutline, chevronUpOutline,
            closeOutline, logInOutline, homeOutline, personOutline,
            gridOutline, eyeOutline, eyeOffOutline, leafOutline,
            libraryOutline, documentsOutline, checkmarkCircleOutline,
            arrowBackOutline, chevronForwardOutline, calculatorOutline,
            pricetagOutline, statsChartOutline, schoolOutline,
            shieldCheckmarkOutline, constructOutline, downloadOutline
        });
    }

    async openTrainingManualActionSheet() {
        console.log("Triggered openTrainingManualActionSheet -> Waiting for setTimeout");
        setTimeout(async () => {
            console.log("Creating Training Manual Action Sheet...");
            try {
                const actionSheet = await this.actionSheetCtrl.create({
                    header: 'ट्रेनिंग मैनुअल (भाग चुनें)',
                    cssClass: 'modern-action-sheet',
                    buttons: [
                        { text: 'वन्य प्राणी (संरक्षण) अधिनियम 1972 यथा संशोधित 2022 अपराध एवं प्रक्रिया', icon: 'school-outline', handler: () => { console.log("Option 1 Clicked"); this.openDocument('training_manual_1.pdf', "वन्य प्राणी (संरक्षण) अधिनियम 1972 यथा संशोधित 2022 अपराध एवं प्रक्रिया"); } },
                        { text: 'वन अपराध पंजीबद्ध करना', icon: 'school-outline', handler: () => { console.log("Option 2 Clicked"); this.openDocument('training_manual_2.pdf', "वन अपराध पंजीबद्ध करना"); } },
                        { text: 'वन संरक्षण', icon: 'school-outline', handler: () => { console.log("Option 3 Clicked"); this.openDocument('training_manual_3.pdf', "वन संरक्षण"); } },
                        { text: 'Cancel', role: 'cancel', handler: () => { console.log("Cancel Clicked"); } }
                    ]
                });
                console.log("Presenting Training Manual Action Sheet");
                await actionSheet.present();
            } catch (err: any) {
                console.error("Training Action Sheet Error:", err);
                alert("Action Sheet Error: " + (err.message || JSON.stringify(err)));
            }
        }, 100);
    }

    async openNonCommercialRateActionSheet() {
        console.log("Triggered openNonCommercialRateActionSheet -> Waiting for setTimeout");
        setTimeout(async () => {
            console.log("Creating Non-Commercial Rate Action Sheet...");
            try {
                const actionSheet = await this.actionSheetCtrl.create({
                    header: 'गैर वाणिज्यक दर (वृत्त चुनें)',
                    cssClass: 'modern-action-sheet',
                    buttons: [
                        { text: 'बिलासपुर वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Bilaspur Clicked'); this.openDocument('bilaspur.pdf', "गैर वाणिज्यक दर (बिलासपुर वृत्त)"); } },
                        { text: 'दुर्ग वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Durg Clicked'); this.openDocument('durg.pdf', "गैर वाणिज्यक दर (दुर्ग वृत्त)"); } },
                        { text: 'जगदलपुर वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Jagdalpur Clicked'); this.openDocument('jagdalpur.pdf', "गैर वाणिज्यक दर (जगदलपुर वृत्त)"); } },
                        { text: 'कांकेर वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Kanker Clicked'); this.openDocument('kanker.pdf', "गैर वाणिज्यक दर (कांकेर वृत्त)"); } },
                        { text: 'रायपुर वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Raipur Clicked'); this.openDocument('raipur.pdf', "गैर वाणिज्यक दर (रायपुर वृत्त)"); } },
                        { text: 'सरगुजा वृत्त', icon: 'pricetag-outline', handler: () => { console.log('Surguja Clicked'); this.openDocument('surguja.pdf', "गैर वाणिज्यक दर (सरगुजा वृत्त)"); } },
                        { text: 'Cancel', role: 'cancel', handler: () => { console.log('Cancel Clicked'); } }
                    ]
                });
                console.log("Presenting Non-Commercial Rate Action Sheet");
                await actionSheet.present();
            } catch (err: any) {
                console.error("Rate Action Sheet Error:", err);
                alert("Action Sheet Error: " + (err.message || JSON.stringify(err)));
            }
        }, 100);
    }

    async openFormFactorActionSheet() {
        await this.platform.ready();
        console.log("Triggered openFormFactorActionSheet -> Waiting for setTimeout");
        setTimeout(async () => {
            console.log("Creating Form Factor Action Sheet...");
            try {
                const actionSheet = await this.actionSheetCtrl.create({
                    header: 'फॉर्म फेक्टर (वर्ष चुनें)',
                    cssClass: 'modern-action-sheet',
                    buttons: [
                        { text: 'फॉर्म फेक्टर वर्ष 2025', icon: 'document-text-outline', handler: () => { console.log("Form Factor 2025-26 Clicked"); this.openDocument('form_factor.pdf', "फॉर्म फेक्टर वर्ष 2025"); } },
                        { text: 'Cancel', role: 'cancel', handler: () => { console.log("Cancel Clicked"); } }
                    ]
                });
                console.log("Presenting Form Factor Action Sheet");
                await actionSheet.present();
            } catch (err: any) {
                console.error("Form Factor Action Sheet Error:", err);
                alert("Action Sheet Error: " + (err.message || JSON.stringify(err)));
            }
        }, 100);
    }

    async openManualActionSheet() {
        console.log("Triggered openManualActionSheet -> Waiting for setTimeout");
        setTimeout(async () => {
            console.log("Creating Forest Manual Action Sheet...");
            try {
                const actionSheet = await this.actionSheetCtrl.create({
                    header: 'फारेस्ट मैनुअल',
                    cssClass: 'modern-action-sheet',
                    buttons: [
                        { text: 'फारेस्ट मैनुअल भाग 1', icon: 'document-text-outline', handler: () => { console.log("Part 1 Clicked"); this.openDocument('forest_manual_part1.pdf', "फारेस्ट मैनुअल भाग 1"); } },
                        { text: 'फारेस्ट मैनुअल भाग 2', icon: 'document-text-outline', handler: () => { console.log("Part 2 Clicked"); this.openDocument('forest_manual_part2.pdf', "फारेस्ट मैनुअल भाग 2"); } },
                        { text: 'Cancel', role: 'cancel', handler: () => { console.log("Cancel Clicked"); } }
                    ]
                });
                console.log("Presenting Forest Manual Action Sheet");
                await actionSheet.present();
            } catch (err: any) {
                console.error("Manual Action Sheet Error:", err);
                alert("Action Sheet Error: " + (err.message || JSON.stringify(err)));
            }
        }, 100);
    }

    async openActsActionSheet() {
        console.log("Triggered openActsActionSheet -> Waiting for setTimeout");
        setTimeout(async () => {
            console.log("Creating Acts Action Sheet...");
            try {
                const buttons = this.actsAndRules.map(act => {
                    return {
                        text: act.name,
                        icon: 'document-text-outline',
                        handler: () => {
                            console.log(`Act/Rule Clicked: ${act.name}`);
                            this.openDocument(act.docName, act.name);
                        }
                    };
                });

                buttons.push({
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => { console.log("Acts Action Sheet Cancelled"); }
                } as any);

                const actionSheet = await this.actionSheetCtrl.create({
                    header: 'अधिनियम एवं नियम',
                    cssClass: 'modern-action-sheet',
                    buttons: buttons
                });
                console.log("Presenting Acts Action Sheet");
                await actionSheet.present();
            } catch (err: any) {
                console.error("Acts Action Sheet Error:", err);
                alert("Action Sheet Error: " + (err.message || JSON.stringify(err)));
            }
        }, 100);
    }

    onDocClick(doc: any) {
        if (doc.isNonCommercialRate) {
            this.openNonCommercialRateActionSheet();
        } else if (doc.isFormFactor) {
            this.openFormFactorActionSheet();
        } else if (doc.isJantri) {
            this.router.navigateByUrl('/jantri-page', {
                replaceUrl: false
            });
        } else if (doc.isTrainingManual) {
            this.openTrainingManualActionSheet();
        } else if (doc.isManual) {
            this.openManualActionSheet();
        } else {
            this.openDocument(doc.docName, doc.name);
        }
    }

    async ngOnInit() {
        this.isWeb = !this.platform.is('hybrid') && !this.platform.is('capacitor');
        await this.checkLoginStatus();
    }

    async ionViewWillEnter() {
        await this.checkLoginStatus();
    }

    async checkLoginStatus() {
        // Check if user is already logged in
        const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });
        this.isLoggedIn = !!value;
    }

    // toggleDataTable() is no longer needed but kept for safety if referenced elsewhere
    toggleDataTable() {
        this.showDataTable = !this.showDataTable;
    }

    goToLogin() {
        this.router.navigateByUrl('/login-officer', { replaceUrl: false });
    }

    goToDashboard() {
        this.router.navigateByUrl('/officer-dashboard', { replaceUrl: false });
    }

    // async openDocument(pdfName: string) {
    //     const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
    //     let filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/por_related_pdf') ?? '';
    //      ;
    //     let pdfUrl = filePath + "/" + pdfName;

    //      ;
    //     this.router.navigateByUrl('/pdf_viewer_component', {
    //         state: { pdf_url: pdfUrl },
    //         replaceUrl: false
    //     });

    // }

    pdfUrl: SafeResourceUrl | null = null;
    showPdfViewer: boolean = false;

    openCompoundingProcessImage() {
        this.showManual613Modal = true;
    }

    closeManual613Modal() {
        this.showManual613Modal = false;
    }

    async openDocument(docName: string, docTitle: string) {

        ;
        const result = await Preferences.get({ key: PreferenceKeys.ngrok_url });
        let filePath = result.value?.replace('api/ForestComplainMonitoringSystem', '/por_related_pdf') ?? '';
        ;
        const url = filePath + "/" + docName;



        if (this.platform.is('android') || this.platform.is('ios')) {
            this.router.navigateByUrl('/pdf_viewer_component', {
                state: {
                    pdf_url: url,
                    pdf_title: docTitle
                },
                replaceUrl: false
            });
        } else {
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.showPdfViewer = true;

            // this.router.navigateByUrl('/pdf_viewer_component_new', {
            //     state: {
            //         pdf_url: url,
            //         pdf_title: docName.replace('.pdf', '').replace(/-/g, ' ').replace(/_/g, ' ').toUpperCase()
            //     },
            //     replaceUrl: false
            // });
        }

    }

    async downloadApp() {
        const url = 'https://yotech.co.in/kisan_vrikh_yojna/POR_ANDROID_APP.apk';

        //const url = "https://drive.google.com/file/d/1xoT-y7qSO0wmw5WMdI3HJJxp2AB-Hym0/view?usp=drive_link";

        const link = document.createElement('a');
        link.href = url;
        link.download = 'POR_ANDROID_APP.apk'; // optional (may not work cross-origin)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}