import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-signature-page',
  templateUrl: './signature-page.component.html',
  styleUrls: ['./signature-page.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SignaturePageComponent implements AfterViewInit, OnDestroy {

  @Input() personName!: string;

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  constructor(private modalCtrl: ModalController) { }

  async ngAfterViewInit() {
    await this.lockOrientation();
    this.setupCanvas();
  }

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } catch (e) {
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.setupCanvas();
  }

  setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    // Full screen size
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(ratio, ratio);
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000';
    this.clearCanvas();
  }

  startDrawing(event: TouchEvent | MouseEvent) {
    this.drawing = true;
    const { x, y } = this.getPosition(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: TouchEvent | MouseEvent) {
    if (!this.drawing) return;
    const { x, y } = this.getPosition(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.drawing = false;
  }

  getPosition(event: TouchEvent | MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (event instanceof TouchEvent) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    } else {
      return { x: (event as MouseEvent).clientX - rect.left, y: (event as MouseEvent).clientY - rect.top };
    }
  }

  clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  saveSignature() {
    const canvas = this.canvasRef.nativeElement;
    const base64 = canvas.toDataURL('image/png');
    this.modalCtrl.dismiss({ confirmed: true, signature: base64 });
  }

  cancel() {
    this.modalCtrl.dismiss({ confirmed: false });
  }

  ngOnDestroy() {
    ScreenOrientation.unlock();
  }

}