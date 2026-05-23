import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageServiceService {

  private currentLanguage: string = 'hindi'; // default language
  public languageData: any = {}; // Store the loaded language data
  private languageSubject: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private httpClient: HttpClient) {
    this.loadLanguage(this.currentLanguage);
  }
  // Method to load the language file
  loadLanguage(language: string) {
    this.httpClient.get(`assets/language/${language}.json`).subscribe((data) => {
      this.languageData = data;
      this.languageSubject.next(this.languageData);
    });
  }

  // Method to change the language
  changeLanguage(language: string) {
    this.currentLanguage = language;
    this.loadLanguage(language);
  }

  // Method to get the translated text based on key
  getTranslation(key: string): string {
    if (this.languageData && this.languageData[key]) {
      return this.languageData[key];
    } else {
      return ""; // Return key if translation is not found
    }
  }

  // Observable to watch language changes
  get language$() {
    return this.languageSubject.asObservable();
  }

}
