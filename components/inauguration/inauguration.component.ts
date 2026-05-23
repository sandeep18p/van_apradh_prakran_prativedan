import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-inauguration',
  templateUrl: './inauguration.component.html',
  styleUrls: ['./inauguration.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InaugurationComponent {
  @Output() completed = new EventEmitter<void>();

  isOpening = false;
  isOpened = false;

  openCurtain() {
    if (this.isOpening || this.isOpened) return;

    this.isOpening = true;

    // After animation ends (approx 3-4 seconds), emit completed
    setTimeout(() => {
      this.isOpened = true;
      this.isOpening = false;
      // You can either hide it automatically or wait for a user click
      // Let's wait another 1 second then emit
      setTimeout(() => {
        this.completed.emit();
      }, 3000);
    }, 5000);
  }
}
