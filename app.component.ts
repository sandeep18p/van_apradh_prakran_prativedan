import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { PushNotificationService } from './services/push_notification/push-notification.service'; 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform, private pushService: PushNotificationService) {
    this.initializeApp();
    this.pushService.initPush();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Remove dark class if present
      document.body.classList.remove('dark');
    });
  }

}


