import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline, arrowBackOutline, downloadOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular/standalone';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-new-pdf-viewer-dialog',
  templateUrl: './pdf-new-viewer-dialog.component.html',
  styleUrls: ['./pdf-new-viewer-dialog.component.scss'],
  standalone: true,
  imports: [IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem, IonList, IonImg],
})
export class NewPdfViewerDialogComponent implements OnInit {

  toolbarTitle: string = "अग्रेषण पत्र";
  pdfUrl: string = "";
  safePdfUrl: SafeResourceUrl | undefined;
  isLoading: boolean = true;
  isHtmlResponse: boolean = false;

  constructor(private modalCtrl: ModalController,
    private sanitizer: DomSanitizer, private router: Router, private navController: NavController, private platform: Platform, private toastController: ToastController) {

    addIcons({ warningOutline, arrowBackOutline, downloadOutline })

  }

  async ngOnInit() {
    
    // this.isLoading = true;
    // this.isHtmlResponse = false;

    // const url = history.state['pdf_url'];
    // const title = history.state['pdf_title'];

    // if (title) {
    //   this.toolbarTitle = title;
    // }

    // if (url) {
    //   this.pdfUrl = url;

    //   try {
    //     // Fetch the PDF using the ngrok-skip header
    //     // This is crucial to prevent ngrok from sending the HTML warning page into the iframe.
    //     const response = await fetch(this.pdfUrl, {
    //       headers: {
    //         'ngrok-skip-browser-warning': 'true',
    //         'Bypass-Tunnel-Reminder': 'true'
    //       }
    //     });

    //     if (!response.ok) {
    //       throw new Error('Failed to fetch PDF directly');
    //     }

    //     const blob = await response.blob();

    //     // Check if the server returned HTML (i.e. Ngrok blocked the file)
    //     if (blob.type.includes('text/html')) {
    //       this.isHtmlResponse = true;
    //       this.isLoading = false;
    //       console.error('Received HTML webpage instead of PDF. Usually caused by ngrok browser warning block.');
    //       return;
    //     }

    //     // Create a local blob URL
    //     const objectUrl = URL.createObjectURL(blob);
    //     this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);

    //     // Give the iframe a tiny moment to parse the blob URL
    //     setTimeout(() => {
    //       this.isLoading = false;
    //     }, 300);

    //   } catch (error) {
    //     console.error('Failed to load PDF blob directly:', error);

    //     // Fallback: Use standard Google Docs Viewer OR direct URL approach if fetch fails
    //     if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('mobile') || this.platform.is('ios') || this.platform.is('android')) {
    //       const gviewUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(this.pdfUrl)}`;
    //       this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(gviewUrl);
    //     } else {
    //       this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
    //     }

    //     setTimeout(() => {
    //       this.isLoading = false;
    //     }, 300);
    //   }
    // } else {
    //   this.isLoading = false;
    // }


    
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goBack() {
    this.navController.back();
  }

  async downloadPdf() {
    if (!this.pdfUrl) return;

    if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('mobile') || this.platform.is('ios') || this.platform.is('android')) {
      try {
        const toast = await this.toastController.create({
          message: 'Downloading...',
          duration: 2000,
          position: 'bottom'
        });
        await toast.present();

        const response = await fetch(this.pdfUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true' // In case you are using ngrok
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const blob = await response.blob();

        const base64data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        // Ensure we strip the data URI prefix (e.g., "data:application/pdf;base64,") before writing via Capacitor
        const base64Payload = base64data.includes(',') ? base64data.split(',')[1] : base64data;
        const fileName = `Document_${new Date().getTime()}.pdf`;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Payload,
          directory: Directory.Documents,
          recursive: true
        });

        const successToast = await this.toastController.create({
          message: 'File Downloaded Successfully!',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await successToast.present();

        // Share the file
        await Share.share({
          title: 'Document PDF',
          text: 'Here is your PDF document',
          url: savedFile.uri,
          dialogTitle: 'Share or Save PDF',
        });

      } catch (error: any) {
        console.error('Download Error:', error);
        const errorToast = await this.toastController.create({
          message: 'Error downloading file: ' + (error.message || 'Unknown error'),
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        });
        await errorToast.present();
      }
    } else {
      // Browser fallback
      const link = document.createElement('a');
      link.href = this.pdfUrl;
      link.download = `Document_${new Date().getTime()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

}