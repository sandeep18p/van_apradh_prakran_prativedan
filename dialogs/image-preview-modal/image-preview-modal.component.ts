import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular'; // Import IonicModule
import { addIcons } from 'ionicons';
import { closeCircle, closeCircleOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrls: ['./image-preview-modal.component.scss'],
  imports: [IonicModule]
})
export class ImagePreviewModalComponent implements OnInit {
  @Input() imageUrl!: string;

  @ViewChild('imageRef', { static: false }) imageElement!: ElementRef<HTMLImageElement>;

  scale = 1;
  translateX = 0;
  translateY = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeCircleOutline });
  }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }


  zoomIn() {
    this.scale += 0.2;
    this.applyTransform();
  }

  zoomOut() {
    if (this.scale > 0.4) {
      this.scale -= 0.2;
      this.applyTransform();
    }
  }

  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  private applyTransform() {
    if (this.imageElement) {
      this.imageElement.nativeElement.style.transform =
        `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
      this.imageElement.nativeElement.style.transition = 'transform 0.2s ease-out';
    }
  }

  // --- Drag start ---
  startDrag(event: MouseEvent | TouchEvent) {
    if (this.scale <= 1) return; // only allow drag when zoomed
    this.isDragging = true;
    if (event instanceof MouseEvent) {
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    } else {
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    }
    this.imageElement.nativeElement.style.transition = 'none'; // disable smoothness while dragging
  }

  // --- Drag move ---
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    if (event instanceof MouseEvent) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    } else {
      this.translateX = event.touches[0].clientX - this.startX;
      this.translateY = event.touches[0].clientY - this.startY;
    }
    this.applyTransform();
  }

  // --- Drag end ---
  endDrag() {
    this.isDragging = false;
  }


}
