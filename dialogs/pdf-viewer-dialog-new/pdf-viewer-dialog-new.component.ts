import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalController, NavController, Platform, LoadingController } from '@ionic/angular';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

import { IonList, IonItem, IonInput, IonRadioGroup, IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol, IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonImg, IonCheckbox, IonModal, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBack, removeOutline } from 'ionicons/icons';

import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer-dialog-new',
  templateUrl: './pdf-viewer-dialog-new.component.html',
  styleUrls: ['./pdf-viewer-dialog-new.component.scss'],
  standalone: true,
  imports: [IonRadioGroup,
    IonRadio, IonLoading, IonTextarea, IonLabel, IonRow, IonGrid, IonCol,
    IonText, IonIcon, IonCardTitle, IonCard, IonCardContent, IonCardHeader,
    IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle,
    IonToolbar, IonInput, IonItem, IonList, IonImg, IonCheckbox,
    IonModal, IonChip,
    PdfViewerModule
  ]
})
export class PdfViewerDialogNewComponent implements OnInit {
  pdfUrl: string = '';
  safePdfUrl: SafeResourceUrl | undefined;

  constructor(
    public platform: Platform,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ addOutline, removeOutline, arrowBack });
  }

  ngOnInit() {


    const data = history.state['pdf_url'];
    if (data) {
      this.pdfUrl = data;
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
      if (this.platform.is('hybrid')) {
        
        //this.renderPdfInApp(this.pdfUrl);
      }
    }

  }

  zoom = 1.0;

  zoomIn() {
    this.zoom += 0.2;
  }

  zoomOut() {
    if (this.zoom > 0.5) {
      this.zoom -= 0.2;
    }
  }

}