import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalController, NavController, Platform, LoadingController } from '@ionic/angular';

import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBack, removeOutline } from 'ionicons/icons';

import { PdfViewerModule } from 'ng2-pdf-viewer';

//pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-viewer-dialog',
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrls: ['./pdf-viewer-dialog.component.scss'],
  standalone: true,
  imports: [IonRadioGroup, CommonModule,
    IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
    IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
    IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
    IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
    IonModal, IonChip, PdfViewerModule
  ]
})
export class PdfViewerDialogComponent implements OnInit {
  pdfUrl: string = '';
  safePdfUrl: SafeResourceUrl | undefined;
  toolbarTitle: string = "अग्रेषण पत्र";
  showPdfViewer = false;
  pdfPages: HTMLCanvasElement[] = [];  // multiple canvas pages

  loading: HTMLIonLoadingElement | null = null;

  @ViewChild('pdfContainer', { static: false }) pdfContainer: any;
  @ViewChild('pinchContainer', { static: false }) pinchContainer: any;

  constructor(
    public platform: Platform,
    private sanitizer: DomSanitizer,
    private navController: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ addOutline, removeOutline, arrowBack });
  }

  async presentLoader() {
    if (!this.loading) {
      this.loading = await this.loadingCtrl.create({
        message: 'Loading PDF...',
        spinner: 'circles',
        backdropDismiss: false
      });
      await this.loading.present();
    }
  }


  onPdfLoadComplete(pdf: any) {
    console.log('PDF fully loaded. Total pages:', pdf.numPages);
    this.dismissLoader();
  }

  onPdfError(error: any) {
    console.error('PDF load error:', error);
    this.dismissLoader();
  }

  onPdfProgress(progressData: any) {

    // Optional: progress percentage
    if (progressData?.loaded && progressData?.total) {
      const percent = Math.round(
        (progressData.loaded / progressData.total) * 100
      );
      if (this.loading) {
        this.loading.message = `Loading PDF... ${percent}%`;
      }
    }
  }

  async dismissLoader() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  ngOnInit() {

    
    const data = history.state['pdf_url'];

    if (data) {
      this.pdfUrl = data;
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
      if (this.platform.is('hybrid')) {
        this.presentLoader();
      }

      let pdf_title = history.state['pdf_title'];
      if (pdf_title != undefined) {
        this.toolbarTitle = pdf_title;
      }

    }

    this.handleBackButton();

  }

  backButtonHandler: any;
  removeBackButtonListener() {
    if (this.backButtonHandler) {
      this.backButtonHandler.unsubscribe();
      this.backButtonHandler = null;
    }
  }

  ngOnDestroy() {
    this.dismissLoader();
    this.removeBackButtonListener();
  }

  async handleBackButton() {

    this.backButtonHandler = this.platform.backButton.subscribeWithPriority(10, async () => {

      await this.dismissLoader();  // 👈 dismiss first
      this.goBack();

    });

  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  goBack() {
    this.navController.back();
  }

  zoom = 1;

  private initialDistance = 0;
  private initialZoom = 1;

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.initialDistance = this.getDistance(event.touches);
      this.initialZoom = this.zoom;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault();

      const currentDistance = this.getDistance(event.touches);
      const scale = currentDistance / this.initialDistance;

      this.zoom = this.initialZoom * scale;

      // limit zoom range
      if (this.zoom < 0.5) this.zoom = 0.5;
      if (this.zoom > 5) this.zoom = 5;
    }
  }

  onTouchEnd() {
    this.initialDistance = 0;
  }

  private getDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoomIn() {
    this.zoom += 0.2;
  }

  zoomOut() {
    if (this.zoom > 0.5) {
      this.zoom -= 0.2;
    }
  }

}