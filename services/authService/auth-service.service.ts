import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from 'src/app/pages/login-officer/OfficerLoginResponse';



@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }

  async isEmpLogined() : Promise<boolean>{
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });

    if (value) {
      return true;
    }
    return false;
  }

}


