import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular'; // Import IonicModule
import { addIcons } from 'ionicons';
import { closeCircle, closeCircleOutline } from 'ionicons/icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-image-preview-offline-modal',
  templateUrl: './image-preview-offline-modal.component.html',
  styleUrls: ['./image-preview-offline-modal.component.scss'],
  imports: [IonicModule]
})

export class ImagePreviewOfflineModalComponent implements OnInit {
  @Input() imageUrl!: string;

  constructor(private modalCtrl: ModalController, 
    private sanitizer: DomSanitizer,) {
    addIcons({ closeCircleOutline });
  }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  showImage(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

}
