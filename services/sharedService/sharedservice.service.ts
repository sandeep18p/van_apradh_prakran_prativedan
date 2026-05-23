import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedserviceService {
  constructor() { }

  private refreshFlag = false;

  private selectedCrimeDate = '';
  private selectedActualCrimeDate = '';
  private selectedApradhPrativedanDate = '';

  addedPlantJson: string = "";
  setAddPlantJson(addedPlantJson: string) {
    this.addedPlantJson = addedPlantJson;
  }

  getAddedPlanJson(): string {
    return this.addedPlantJson;
  }


  setSelectedCrimDate(selectedDate: string) {
    this.selectedCrimeDate = selectedDate;
  }

  setSelectedActualCrimDate(selectedDate: string) {
    this.selectedActualCrimeDate = selectedDate;
  }

  setSelectedApradhPrativedanDate(selectedDate: string) {
    this.selectedApradhPrativedanDate = selectedDate;
  }

  getSelectedCrimeDate(): string {
    //;
    return this.selectedCrimeDate;
  }

  getSelectedActualCrimeDate(): string {
    return this.selectedActualCrimeDate;
  }

  getSelectedApradhPrativedanDate(): string {
    return this.selectedApradhPrativedanDate;
  }

  setRefresh(value: boolean) {
    this.refreshFlag = value;
  }

  getRefresh(): boolean {
    return this.refreshFlag;
  }


}
