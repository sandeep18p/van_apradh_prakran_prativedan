import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor() { }

  initPush() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', async (token: Token) => {
      // Send token to backend if needed
      await Preferences.set({ key: PreferenceKeys.firebase_token, value: token.value});

    });

    PushNotifications.addListener('registrationError', (error) => {
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
    });

    // PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    // });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {

      const title = action.notification.title;
      const body = action.notification.body;
      const data = action.notification.data;

      const name = data.name;
      //alert(`Clicked Notification:\n${name}`);
      // You can navigate or show a modal based on data

    });

  }

}
