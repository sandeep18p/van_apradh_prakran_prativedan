import { Injectable } from '@angular/core';
import { SpeechRecognition } from '@awesome-cordova-plugins/speech-recognition/ngx';

@Injectable({
  providedIn: 'root',
})
export class SpeechServiceService {

  private isListening = false;

  constructor(private speechRecognition: SpeechRecognition) { }

  async startContinuousListening(callback: (matches: string[]) => void) {
    const hasPerm = await this.speechRecognition.hasPermission();
    if (!hasPerm) await this.speechRecognition.requestPermission();

    this.isListening = true;
    this.listenLoop(callback);
  }

  private listenLoop(callback: (matches: string[]) => void) {
    if (!this.isListening) return;

    this.speechRecognition.startListening({
      language: 'en-US',
      showPopup: false
    }).subscribe(
      (matches) => callback(matches),
      (err) => {
        if (this.isListening) this.listenLoop(callback); // retry on error
      },
      () => {
        if (this.isListening) this.listenLoop(callback); // restart on complete
      }
    );
  }

  stopListening() {
    this.isListening = false;
    this.speechRecognition.stopListening();
  }

}
