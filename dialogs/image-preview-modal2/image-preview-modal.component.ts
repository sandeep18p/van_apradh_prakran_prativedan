import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeCircle, closeCircleOutline, addOutline, removeOutline, refreshOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrls: ['./image-preview-modal.component.scss'],
  imports: [IonicModule]
})
export class ImagePreviewModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() imageUrl!: string;
  @ViewChild('imageContainer', { static: false }) imageContainer!: ElementRef;
  @ViewChild('imageElement', { static: false }) imageElement!: ElementRef;

  zoomLevel: number = 1;
  rotation: number = 0;
  minZoom: number = 0.5;
  maxZoom: number = 3;
  zoomStep: number = 0.25;

  // Panning properties
  panX: number = 0;
  panY: number = 0;
  isPanning: boolean = false;
  lastPanX: number = 0;
  lastPanY: number = 0;
  startX: number = 0;
  startY: number = 0;

  // Touch gesture properties
  initialDistance: number = 0;
  initialZoom: number = 1;
  isPinching: boolean = false;
  lastTouchTime: number = 0;

  // Smooth dragging properties
  private animationFrameId: number | null = null;
  private isDragging: boolean = false;

  // Event listener references for proper cleanup
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundWheel: (event: WheelEvent) => void;
  private boundTouchStart: (event: TouchEvent) => void;
  private boundTouchMove: (event: TouchEvent) => void;
  private boundTouchEnd: (event: TouchEvent) => void;

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeCircleOutline, addOutline, removeOutline, refreshOutline });
    
    // Bind event handlers once in constructor
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);
  }

  ngOnInit() { }

  ngAfterViewInit() {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      this.setupEventListeners();
    }, 100);
  }

  ngOnDestroy() {
    this.cleanupEventListeners();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  setupEventListeners() {
    const container = this.imageContainer?.nativeElement;
    if (!container) {
      setTimeout(() => this.setupEventListeners(), 100);
      return;
    }

    // Mouse events for desktop
    container.addEventListener('mousedown', this.boundMouseDown);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    container.addEventListener('wheel', this.boundWheel);

    // Touch events for mobile
    container.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd, { passive: false });
  }

  cleanupEventListeners() {
    const container = this.imageContainer?.nativeElement;
    if (!container) return;

    // Remove mouse events
    container.removeEventListener('mousedown', this.boundMouseDown);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    container.removeEventListener('wheel', this.boundWheel);

    // Remove touch events
    container.removeEventListener('touchstart', this.boundTouchStart);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  // Mouse event handlers
  onMouseDown(event: MouseEvent) {
    if (this.zoomLevel > 1) {
      this.isPanning = true;
      this.isDragging = true;
      this.startX = event.clientX - this.panX;
      this.startY = event.clientY - this.panY;
      this.disableImageTransition();
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isPanning && this.zoomLevel > 1) {
      this.panX = event.clientX - this.startX;
      this.panY = event.clientY - this.startY;
      this.constrainPan();
      this.updateImageTransform();
      event.preventDefault();
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      this.isDragging = false;
      this.enableImageTransition();
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
    
    if (newZoom !== this.zoomLevel) {
      // Zoom towards mouse position
      const rect = this.imageContainer.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      this.zoomTowardsPoint(newZoom, mouseX, mouseY);
    }
  }

  // Touch event handlers
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      // Single touch - panning
      const touch = event.touches[0];
      this.startX = touch.clientX - this.panX;
      this.startY = touch.clientY - this.panY;
      this.isPanning = true;
      this.isDragging = true;
      this.disableImageTransition();
    } else if (event.touches.length === 2) {
      // Two touches - pinch to zoom
      this.isPinching = true;
      this.isPanning = false;
      this.isDragging = false;
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.initialDistance = this.getDistance(touch1, touch2);
      this.initialZoom = this.zoomLevel;
    }
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 1 && this.isPanning && this.zoomLevel > 1) {
      // Single touch panning - simplified approach
      const touch = event.touches[0];
      this.panX = touch.clientX - this.startX;
      this.panY = touch.clientY - this.startY;
      this.constrainPan();
      this.updateImageTransform();
    } else if (event.touches.length === 2 && this.isPinching) {
      // Pinch to zoom
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(touch1, touch2);
      
      if (this.initialDistance > 0) {
        const scale = currentDistance / this.initialDistance;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.initialZoom * scale));
        
        if (newZoom !== this.zoomLevel) {
          // Get center point between two touches
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          const rect = this.imageContainer.nativeElement.getBoundingClientRect();
          const relativeX = centerX - rect.left;
          const relativeY = centerY - rect.top;
          
          this.zoomTowardsPoint(newZoom, relativeX, relativeY);
        }
      }
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (this.isPanning) {
      this.isPanning = false;
      this.isDragging = false;
      this.enableImageTransition();
    }
    
    this.isPinching = false;
    
    // Double tap to reset
    if (event.touches.length === 0) {
      const currentTime = Date.now();
      if (currentTime - this.lastTouchTime < 300) {
        this.resetImage();
      }
      this.lastTouchTime = currentTime;
    }
  }

  // Helper methods
  getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoomTowardsPoint(newZoom: number, x: number, y: number) {
    const oldZoom = this.zoomLevel;
    this.zoomLevel = newZoom;
    
    // Adjust pan to zoom towards the point
    const zoomRatio = newZoom / oldZoom;
    this.panX = x - (x - this.panX) * zoomRatio;
    this.panY = y - (y - this.panY) * zoomRatio;
    
    this.constrainPan();
    this.updateImageTransform();
  }

  constrainPan() {
    if (this.zoomLevel <= 1) {
      this.panX = 0;
      this.panY = 0;
      return;
    }

    const container = this.imageContainer?.nativeElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const imageElement = this.imageElement?.nativeElement;
    
    if (!imageElement) return;

    // Get the natural image dimensions (before any transforms)
    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;
    
    // Calculate effective dimensions after rotation
    const isRotated90or270 = this.rotation === 90 || this.rotation === 270;
    const effectiveWidth = isRotated90or270 ? naturalHeight : naturalWidth;
    const effectiveHeight = isRotated90or270 ? naturalWidth : naturalHeight;
    
    // Calculate scaled dimensions
    const scaledWidth = effectiveWidth * this.zoomLevel;
    const scaledHeight = effectiveHeight * this.zoomLevel;
    
    // Calculate maximum pan based on scaled dimensions
    const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
    this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
  }

  // Smooth dragging methods
  disableImageTransition() {
    if (this.imageElement?.nativeElement) {
      this.imageElement.nativeElement.style.transition = 'none';
    }
  }

  enableImageTransition() {
    if (this.imageElement?.nativeElement) {
      this.imageElement.nativeElement.style.transition = 'transform 0.2s ease-out';
    }
  }

  updateImageTransform() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      if (this.imageElement?.nativeElement) {
        const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
        this.imageElement.nativeElement.style.transform = transform;
      }
    });
  }

  dismiss() {
    this.cleanupEventListeners();
    this.modalCtrl.dismiss();
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      const newZoom = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
      this.zoomTowardsPoint(newZoom, 0, 0);
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      const newZoom = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
      this.zoomTowardsPoint(newZoom, 0, 0);
    }
  }

  rotateImage() {
    this.rotation = (this.rotation + 90) % 360;
    // Reset pan when rotating
    this.panX = 0;
    this.panY = 0;
    this.updateImageTransform();
  }

  resetImage() {
    this.zoomLevel = 1;
    this.rotation = 0;
    this.panX = 0;
    this.panY = 0;
    this.updateImageTransform();
  }

  getImageTransform(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
  }

  getZoomPercentage(): string {
    return Math.round(this.zoomLevel * 100) + '%';
  }

  onImageLoad() {
    // Reset zoom, rotation, and pan when new image loads
    this.resetImage();
    // Re-setup event listeners after image loads
    setTimeout(() => {
      this.setupEventListeners();
    }, 100);
  }

  onImageError() {
  }
}