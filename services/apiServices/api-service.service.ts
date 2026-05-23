import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Form } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { strict } from 'assert';
import { create } from 'domain';
import { url } from 'inspector';
import { catchError, delay, firstValueFrom, from, map, Observable, of, switchMap, throwError, timeout } from 'rxjs';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { GetRAResponse } from 'src/app/dialogs/assign-ra-by-ro/GetRAResponse.modal';
import { GetCastAndCrimTypeMasterResponse } from 'src/app/pages/add-complain/GetCastAndCrimTypeMasterResponse';
import { SubmitCrimDetailRequestModel } from 'src/app/pages/add-complain/SubmitCrimDetailRequestModel';
import { GetComplainHistoryResponse } from 'src/app/pages/complain-life-history/GetComplainHistoryResponse.modal';
import { OfficerLoginResponse } from 'src/app/pages/login-officer/OfficerLoginResponse';
import { GetDashboardResponse } from 'src/app/pages/officer-dashboard/GetDashboardResponse.model';
import { GetEmployeeListResponse } from 'src/app/pages/officer-dashboard/GetEmployeeListResponse.model';
import { GetPorCountResponse } from 'src/app/pages/officer-dashboard/GetPorCountResponse.model';
import { GetAppDetailResponse, GetMastersResponse, GetUserNameListResponse } from 'src/app/pages/profile-setup/GetMasterResponse';
import { SubmitProfileRequestModel } from 'src/app/pages/profile-setup/SubmitProfilRequestModel';
import { WorkLogResponseModal } from 'src/app/pages/show-ra-work-log/WorkLogResponseModal.modal';
import { ExtensionAwedanListResponse } from 'src/app/pages/show-submited-request-to-extend-janch-awadhi/ExtensionAwedanList.modal';
import { GetStateNameResponseModel } from 'src/app/pages/splash-page/GetStateNameResponse.model';
import { TakeNGRokURLResponse } from 'src/app/pages/splash-page/TakeNgRokUrl.model';
import { PreviouseExtensionResponse, PreviouseExtensionResponseModal } from 'src/app/pages/submit-janch-extend-request/PreviouseExtensionReponse.modal';
import { Base64ResponseModal, SupportiveDocumentsInterface } from 'src/app/pages/view-complain-detail/base64responseofsign.modal';
import { environment } from 'src/environments/environment.prod';



@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  private apiUrlToGetNgRokURL: string = `https://yotech.co.in/kisan_vrikh_yojna/take_ngrok_url.php`; // Ensure no double slashes
  private apiUrlOfficerLogin: string = `login_employee`;
  private apiUrlGetCircle: string = `getCircle`;
  private apiUrlGetDivision: string = `getDivision`;
  private apiUrlGetUserNameList: string = `getUsernameList`;
  private apiUrlGetSubDivision: string = `getSubDivision`;
  private apiUrlGetRang: string = `getRange`;
  private apiUrlGetSubRang: string = `getSubRange`;
  private apiUrlGetBeat: string = `getBeat`;
  private apiUrlSubmitProfileData: string = `selfVerified`;
  private apiUrlSubmitComplainData: string = `submitComplain`;
  private apiUrlGetMaster: string = `get_master`;
  private apiUrlToGetDashboardData: string = `getComplainList`;
  private apiUrlToGetDashboardDataAccordingToFilter: string = `getComplainListAccordingToFilter`;
  //private apiUrlToApproveReject: string = `approve_reject_complain`;
  private apiUrlToGetListOfRA: string = `getRA`;
  private apiUrlToGetListOfSDO: string = `getSDO`;
  private apiUrlToAssignRA: string = `assign_RA`;
  private apiUrlToAssignSelfOnComplain: string = `assign_self_for_complain`;
  private apiUrlToAssignSDO: string = `forward_to_sdo_by_ro`;

  private apiUrlToClosePOR_BY_SDO: string = `close_complain_by_sdo`;
  private apiUrlToClosePOR_BY_DFO: string = `close_complain_by_dfo`;
  private apiUrlToClosePOR_BY_CCF: string = `close_complain_by_ccf`;
  private apiUrlToForwardPOR_To_DFO_BY_SDO: string = `forward_to_dfo_by_sdo`;
  private apiUrlToForwardPOR_To_CCF_BY_DFO: string = `forward_to_ccf_by_dfo`;

  private getRAWorkLog: string = `getRAWorkLog`;
  private submitVasuliDetail: string = `submitVasuliDetail`;
  private apiUrlToGetOneComplainHistory: string = `getComplainLifeHistroy`;
  private apiUrlToCheckUniqueDeviceId: string = `check_unique_device_id`;
  private apiUrlToGetComplainCountOnRangWise: string = `getComplainCountOnRangWise`;
  private apiUrlToGetPOR_JanchPrakranPanjiyanBookDetailForRang: string = `getPOR_JanchPrakranPanjiyanBookDetailForRang`;
  private apiUrlToGetGoogleAddress: string = `https://nominatim.openstreetmap.org/reverse`;

  private apiUrlSubmitWorkLog: string = `submit_ra_log`;
  private apiUrlSubmitPrakranPrativedan: string = `submit_apradh_prakaran_prativedan`;
  private apiUrlSubmitParivahanDetail: string = `submit_vanopaj_parivahan_detail`;

  private apiUrlToGetBase64: string = `getBase64`;
  private apiUrlToGetOldExtensionOfOnePOR: string = `get_por_old_extension`;
  private apiUrlToSubmitJanchDaysExtensionRequest: string = `submit_janch_days_extend_request`;
  private apiUrlToGetAllExtensionAwedanList: string = `get_my_all_extension_awedan_list`;
  private apiUrlToGetExtensionAwedanListWhichIWillApprove: string = `get_all_extension_awedan_list_which_i_will_approve`;
  private apiUrlToApproveRejectAwedan: string = `approve_reject_extend_request`;
  private apiUrlToGetAppDetail: string = `getAppDetail`;

  private apiUrlToGet_FOCR_PanjiData: string = `getFOCR_Panji`;
  private apiUrlToGet_FOCR_PrashmanPunji: string = `getFOCR_PrashmanPunji`;

  private apiUrlSubmitDrDetail = `submit_dr_detail`;

  private submitReqestForNastibadhaFromROToSDO: string = `submit_request_to_nastibadh_from_ro_to_sdo`;

  private submitReqestForNastibadhaFromSDOToDFO: string = `submit_request_to_nastibadh_from_sdo_to_dfo`;

  private submitReqestForFInalNastibadhaFromDFOToRO: string = `submit_final_nastibadh`;

  private apiUrlToAssignRAForVasuli: string = `assign_RA_for_vasuli`;

  private apiToGetSingleComplainDetail: string = `getOneComplainDetail`;

  private apiUrlSubmitSuchnaFromRO_TO_SDO: string = `submit_suchna_from_ro_to_sdo`;

  private apiUrlSubmitSuchnaFromSDOTOMajistret: string = `submit_suchna_from_sdo_to_majistret`;

  private apiUrlToPradhikaritAdhiakri: string = `get_pradhikrit_adhikari_name`;

  private apiUrlToRevertComplain: string = `revert_complain`;

  private apiUrlToSaveGirPatrakDetail = "submit_gir_patrak_detail";

  private apiUrlToGetAdminDashboardData: string = `getComplainListForAdminLevel`;

  private apiUrlSubmitComplainYes: string = "submitComplainYes";

  private apiUrlToSaveGirPatrakSuchnaDetail = "submit_gir_suchna_detail";

  private apiUrlToSubmitCourtChallanDetail = "submit_court_challan_detail";

  private apiUrlToSubmitCourtCaseNumberDetail = "submit_court_case_or_adesh_detail";

  private apiUrlToSubmitCourtCheckList = "submit_court_check_list_detail";

  private apiUrlToSubmitRemand = "submit_remand_detail";

  private apiUrlToSubmitCourtWitnessDetail = "submit_witness_detail_for_court";

  private apiUrlToGetEmployeeList = "employee-list";

  private apiUrlToUpdateEmployee = "update-employee";

  private apiUrlToUpdateOfficerPassword: string = `update-password`;

  private apiUrlSubmitJaptiNama: string = `submit_japtinama_vivran_data`;

  private apiUrlSubmitSupurdNama: string = `submit_supurdnama_vivran_data`;
  private apiUrlGetParivahanRelatedReport: string = `get_parivahan_related_report`;

  // Loginas (Super Admin: designation_id = 7)
  // These are served from api/Loginas/* (different controller than ForestComplainMonitoringSystem)
  private apiUrlLoginasHierarchyUsers: string = `hierarchy-users`;
  private apiUrlLoginasImpersonate: string = `impersonate`;

  constructor(private httpClicent: HttpClient) { }

  timeOutTiming = 60000; // 60 second

  // Take NGROK url from server //
  getSampleData(): Observable<any> {
    const body = {};
    return this.httpClicent.get<any>("/admin/user/getAll").pipe(
      catchError((error) => {
        const errorMsg = error?.error?.message || error?.message || 'Unknown error occurred';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  async buildApiUrl(path: string): Promise<string | null> {

    const { value: baseUrl } = await Preferences.get({ key: PreferenceKeys.ngrok_url });

    if (baseUrl) {
      const finalUrl = `${baseUrl}${path}`;
      return finalUrl;
    } else {
      return null;
    }
  }

  async buildApiUrlForController(controllerName: string, path: string): Promise<string | null> {
    const { value: baseUrl } = await Preferences.get({ key: PreferenceKeys.ngrok_url });

    if (!baseUrl) return null;

    const apiIndex = baseUrl.indexOf('api/');
    if (apiIndex === -1) return null;

    const apiBase = baseUrl.substring(0, apiIndex + 4); // includes "api/"
    const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${apiBase}${controllerName}/${trimmedPath}`;
  }

  login(mobile: string, password: string, firebaseToken: string, mobileNumber: string
  ): Observable<OfficerLoginResponse> {

    const body = {
      username: mobile.toString(),
      password: password.toString(),
      firebase_token: firebaseToken.toString(),
      mobile: mobileNumber.toString()
    };

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlOfficerLogin)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<OfficerLoginResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

    // return this.httpClicent.post<OfficerLoginResponse>(this.apiUrlOfficerLogin, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }

    //     return throwError(() => new Error('API error'));
    //   })
    // );

  }

  getBase64Image(fileName: string): Observable<Base64ResponseModal> {
    const headers = { 'Content-Type': 'application/json' };

    // ;
    const body = {
      "file_name": fileName
    };

    return from(this.buildApiUrl(this.apiUrlToGetBase64)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<Base64ResponseModal>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )
  }

  // Get Circle
  getCircles(): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {};

    return from(this.buildApiUrl(this.apiUrlGetCircle)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

    // return this.httpClicent.post<GetMastersResponse>(this.apiUrlGetCircle, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }

    //     return throwError(() => new Error('API error'));
    //   })
    // );

  }

  // Get Division
  getDivision(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
    };

    // return this.httpClicent.post<GetMastersResponse>(this.apiUrlGetDivision, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }
    //     return throwError(() => new Error('API error'));
    //   })
    // );

    return from(this.buildApiUrl(this.apiUrlGetDivision)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  getSubDivision(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
    };

    // return this.httpClicent.post<GetMastersResponse>(this.apiUrlGetSubDivision, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }
    //     return throwError(() => new Error('API error'));
    //   })
    // );

    return from(this.buildApiUrl(this.apiUrlGetSubDivision)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  getRang(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
    };

    // return this.httpClicent.post<GetMastersResponse>(this.apiUrlGetRang, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }
    //     return throwError(() => new Error('API error'));
    //   })
    // );

    return from(this.buildApiUrl(this.apiUrlGetRang)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  getSubRang(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlGetSubRang)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  downloadExcelPorCounts(
    emp_id: string,
    designation_id: string,
    circle_div_subDiv_rang_id: string): Observable<GetPorCountResponse> {
    ;
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString(),
      designation_id: designation_id.toString(),
      circle_div_subDiv_rang_id: circle_div_subDiv_rang_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToGetComplainCountOnRangWise)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetPorCountResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  downloadExcelPorRegisterData(
    emp_id: string,
    designation_id: string,
    circle_div_subDiv_rang_id: string): Observable<GetPorCountResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString(),
      designation_id: designation_id.toString(),
      circle_div_subDiv_rang_id: circle_div_subDiv_rang_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToGetPOR_JanchPrakranPanjiyanBookDetailForRang)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetPorCountResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  getDataFor_FOCR_Panji(
    emp_id: string,
    designation_id: string,
    circle_div_subDiv_rang_id: string): Observable<GetPorCountResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString(),
      designation_id: designation_id.toString(),
      circle_div_subDiv_rang_id: circle_div_subDiv_rang_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToGet_FOCR_PanjiData)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetPorCountResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  getBeat(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
    };

    // return this.httpClicent.post<GetMastersResponse>(this.apiUrlGetBeat, body, { headers }).pipe(
    //   timeout(10000),
    //   catchError((error) => {
    //     if (error.name === 'TimeoutError') {
    //       return throwError(() => new Error('Request timed out'));
    //     }
    //     return throwError(() => new Error('API error'));
    //   })
    // );

    return from(this.buildApiUrl(this.apiUrlGetBeat)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }



  submitProfilData(model: SubmitProfileRequestModel): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      empId: model.empId.toString(),           // e.g., 'EMP123'
      circleId: model.circleId.toString(),     // e.g., 'CIR001'
      divisionId: model.divisionId.toString(), // e.g., 'DIV001'
      subDivisionId: model.subDivisionId.toString(),// e.g., 'SUBDIV002'
      rangId: model.rangId.toString(),        // e.g., 'RANG005'
      beatId: model.beatId.toString()          // e.g., 'BEAT009'
    };

    return from(this.buildApiUrl(this.apiUrlSubmitProfileData)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  // GET GOOGLE ADDRESS PROGRAMATICALLY
  getGoogleAddress(lat: number, lng: number): Observable<GetStateNameResponseModel> {

    return this.httpClicent.get<GetStateNameResponseModel>(this.apiUrlToGetGoogleAddress + "?lat=" + lat.toString() + "&lon=" + lng.toString() + "&format=json").pipe(
      catchError((error) => {
        throw new Error('Server not responding');
      })
    );

  }


  // Get Cast And Crim Master
  getCastAndCrimMaster(empId: String, designationId: String): Observable<GetCastAndCrimTypeMasterResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId,
      designation_id: designationId
    };

    return from(this.buildApiUrl(this.apiUrlGetMaster)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetCastAndCrimTypeMasterResponse>(url, body, { headers }).pipe(
          timeout(1200000)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  submitCrimData(formformData: FormData): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitComplainData)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        ;
        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  // GET DASHBOARD DATAT //
  getDashboardData(
    mainURL: string,
    empId: string,
    designationId: string,
    startDate: string,
    endDate: string,
    is_supuer_admin?: string): Observable<GetDashboardResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId.toString(),
      designation_id: designationId.toString(),
      is_supuer_admin: is_supuer_admin,
      start_date: startDate,
      end_date: endDate
    };

    const url = mainURL + this.apiUrlToGetDashboardData;
    return of(url).pipe(   // ✅ use of() instead of from()
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post(url, body, {
          headers,
          responseType: 'json',
        }) as Observable<GetDashboardResponse>;
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  // GET DASHBOARD DATA BY FILTER //
  getDashboardDataByFilter(
    empId: string,
    designationId: string,
    circle_id: string,
    division_id: string,
    sub_division_id: string,
    range_id: string,
    sub_range_id: string,
    beat_id: string,
    startDate: string = '',
    endDate: string = ''
  ): Observable<GetDashboardResponse> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      emp_id: empId.toString(),
      designation_id: designationId.toString(),
      circle_id: circle_id.toString(),
      division_id: division_id.toString(),
      sub_division_id: sub_division_id.toString(),
      rang_id: range_id.toString(),
      sub_rang_id: sub_range_id.toString(),
      beat_id: beat_id.toString(),
      start_date: startDate,
      end_date: endDate,
    };

    return from(this.buildApiUrl(this.apiUrlToGetDashboardDataAccordingToFilter)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetDashboardResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  // APPROVE REJECT COMPLAIN //
  // approveRejectComplain(
  //   empId: string,
  //   approve_reject: number,
  //   approve_reject_remark: string,
  //   complain_history_table_id: string,
  //   complain_table_table_id: string): Observable<GetDashboardResponse> {
  //   const headers = { 'Content-Type': 'application/json' };

  //   const body = {
  //     emp_id: empId.toString(),
  //     approve_reject: approve_reject.toString(),
  //     approve_reject_remark: approve_reject_remark.toString(),
  //     complain_history_table_id,
  //     complain_table_table_id

  //   };

  //   return from(this.buildApiUrl(this.apiUrlToApproveReject)).pipe(
  //     switchMap((url) => {
  //       if (!url) return throwError(() => new Error('No API URL configured'));
  //       return this.httpClicent.post<GetDashboardResponse>(url, body, { headers });
  //     }),
  //     catchError((error) => {

  //       return throwError(() => new Error('Server not responding'));
  //     })
  //   );

  // }



  // GET COMPLETE COMPLAIN HISTORY OF ONE COMPLAIN //
  getOnComplainFullHistory(
    emp_id: number,
    complain_id: string): Observable<GetComplainHistoryResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString(),
      complain_id: complain_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetOneComplainHistory)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetComplainHistoryResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  /// ASSIGN RA BY RO ///
  getRAList(
    empId: string,
    designation_id: string): Observable<GetRAResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId.toString(),
      designation_id: designation_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetListOfRA)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  /// ASSIGN SDO BY RO ///
  getSDOList(
    empId: string,
    designation_id: string): Observable<GetRAResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId.toString(),
      designation_id: designation_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetListOfSDO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  // ASSIGN RA ON COMPLAIN //
  assignSelfOnComplain(complain_history_table_id: string,
    complain_table_id: string,
    ro_id: string,
    ra_id: string,
    remark: string,
    focr_date: string,
    focr_number: string
  ): Observable<GetRAResponse> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_history_table_id: complain_history_table_id.toString(),
      complain_table_id: complain_table_id.toString(),
      ro_id: ro_id.toString(),
      ra_id: ra_id.toString(),
      remark: remark.toString(),
      focr_date: focr_date.toString(),
      focr_number: focr_number.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToAssignSelfOnComplain)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  // ASSIGN RA ON COMPLAIN //
  assignRA(complain_history_table_id: string,
    complain_table_id: string,
    ro_id: string,
    ra_id: string,
    remark: string,
    focr_date: string,
    focr_number: string,
    assignedLimit?: Number
  ): Observable<GetRAResponse> {


    const headers = { 'Content-Type': 'application/json' };

    const body: any = {
      complain_history_table_id: complain_history_table_id.toString(),
      complain_table_id: complain_table_id.toString(),
      ro_id: ro_id.toString(),
      ra_id: ra_id.toString(),
      remark: remark.toString(),
      focr_date: focr_date.toString(),
      focr_number: focr_number.toString()
    };

    if (assignedLimit !== undefined && assignedLimit !== null) {
      body.assignedLimit = Number(assignedLimit);
    }

    return from(this.buildApiUrl(this.apiUrlToAssignRA)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  // ASSIGN SDO ON COMPLAIN //
  assignSDO(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    ro_id: string,
    sdo_id: string,
    remark: string,
    selected_file: File,
    shesh_vasuli_rashi: string,
    sdo_or_dfo_designation_id: string
  ): Observable<GetRAResponse> {


    const headers = { 'Content-Type': 'application/json' };

    // const body = {
    //   japt_saman_total_price: japt_saman_total_price.toString(),
    //   found_vanopaj_total_price: found_vanopaj_total_price.toString(),
    //   actual_loss_total_price: actual_loss_total_price.toString(),
    //   mahsul_total_price: mahsul_total_price.toString(),
    //   mavja_total_price: mavja_total_price.toString(),
    //   complain_history_table_id: complain_history_table_id.toString(),
    //   complain_table_id: complain_table_id.toString(),
    //   ro_id: ro_id.toString(),
    //   sdo_id: sdo_id.toString(),
    //   remark: remark.toString(),
    // };


    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("remark", remark.toString());
    formData.append("sdo_id", sdo_id.toString());
    formData.append("sdo_or_dfo_designation_id", sdo_or_dfo_designation_id);
    formData.append("ro_id", ro_id.toString());
    formData.append("complain_table_id", complain_table_id);
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi);

    formData.append("agreshan_patra", selected_file);  // ⬅ PDF FILE HERE


    return from(this.buildApiUrl(this.apiUrlToAssignSDO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );


  }




  /// SUBMIT WORK LOG ///
  submitWorkLog(formformData: FormData): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitWorkLog)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  /// SUBMIT PRAKRAN PRATIVEDAN ///
  submitPrakranPrativedan(formformData: FormData): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitPrakranPrativedan)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  /// SUBMIT VASULI VIVRAN ///
  submitVasuliVivran(complain_id: string,
    vasuli_detail: string,
    created_by: string,
    complain_progress_stage: string
  ): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      vasuli_detail: vasuli_detail.toString(),
      created_by: created_by.toString(),
      complain_progress_stage: complain_progress_stage.toString()
    };

    return from(this.buildApiUrl(this.submitVasuliDetail)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  /// SUBMIT VANOPAJ PARIVAHAN ///
  submitVanopajParivahan(formDada: FormData
  ): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitParivahanDetail)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));

        return this.httpClicent.post<GetMastersResponse>(url, formDada).pipe(
          timeout(this.timeOutTiming)
        );

        // return this.httpClicent.post<GetMastersResponse>(url, formData, { headers }).pipe(
        //   timeout(this.timeOutTiming)
        // );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  // Get Division
  checkUniqueDeviceId(empId: string, unique_device_id: String): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      empId: empId.toString(),
      uniqueDeviceId: unique_device_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToCheckUniqueDeviceId)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  // GET RA WORK LOG LIST //
  getRAWorkLogList(complain_id: string): Observable<WorkLogResponseModal> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString()
    };

    return from(this.buildApiUrl(this.getRAWorkLog)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<WorkLogResponseModal>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }



  // APLEKHIT/ABHISANDHAN/COURT CHALAN POR BY SDO //
  aplekhitOrAbhisandhanOrCourtChallan_complain_by_sdo(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    sdo_id: string,
    remark: string,
    selected_file: File,
    action_taken_by_officer: string,
    shesh_vasuli_rashi: string,
    adesh_kramank: string,
    adesh_dinank: string,
    listOfSupportiveDocumentsSDOSection: SupportiveDocumentsInterface[]
  ): Observable<GetRAResponse> {

    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("complain_table_id", complain_table_id);
    formData.append("sdo_id", sdo_id.toString());
    formData.append("remark", remark.toString());
    formData.append("action_taken_by_officer", action_taken_by_officer.toString());
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi.toString());

    formData.append("adesh_kramank", adesh_kramank.toString());
    formData.append("adesh_dinank", adesh_dinank.toString());

    formData.append("adesh_ki_prati", selected_file);  // ⬅ PDF FILE HERE
    ;
    listOfSupportiveDocumentsSDOSection.forEach((doc, index) => {

      formData.append(
        `supportive_documents[${index}].document_title`,
        doc.document_title
      );

      formData.append(
        `supportive_documents[${index}].designation_id`,
        doc.designation_id
      );

      if (doc.document_file) {
        formData.append(
          `supportive_documents[${index}].document_file`,
          doc.document_file
        );
      }
    });

    ;
    return from(this.buildApiUrl(this.apiUrlToClosePOR_BY_SDO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  // APLEKHIT/ABHISANDHAN/COURT CHALAN POR BY DFO //
  aplekhitOrAbhisandhanOrCourtChallan_complain_by_dfo(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    dfo_id: string,
    remark: string,
    pdfFile: File,
    action_taken_by_officer: string,
    shesh_vasuli_rashi: string,
    adesh_kramank: string,
    adesh_dinank: string
  ): Observable<GetRAResponse> {

    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("complain_table_id", complain_table_id);
    formData.append("dfo_id", dfo_id.toString());
    formData.append("remark", remark.toString());
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi.toString());

    formData.append("adesh_kramank", adesh_kramank.toString());
    formData.append("adesh_dinank", adesh_dinank.toString());

    formData.append("action_taken_by_officer", action_taken_by_officer.toString());

    formData.append("adesh_ki_prati", pdfFile);  // ⬅ PDF FILE HERE

    return from(this.buildApiUrl(this.apiUrlToClosePOR_BY_DFO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  // FORWARD POR BY SDO TO DFO //
  forward_complain_by_dfo(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    sdo_id: string,
    remark: string,
    selected_file: File,
    shesh_vasuli_rashi: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    // const body = {
    //   japt_saman_total_price: japt_saman_total_price.toString(),
    //   found_vanopaj_total_price: found_vanopaj_total_price.toString(),
    //   actual_loss_total_price: actual_loss_total_price.toString(),
    //   mahsul_total_price: mahsul_total_price.toString(),
    //   mavja_total_price: mavja_total_price.toString(),
    //   complain_history_table_id: complain_history_table_id.toString(),
    //   complain_table_id: complain_table_id.toString(),
    //   sdo_id: sdo_id.toString(),
    //   remark: remark.toString(),

    // };

    // return from(this.buildApiUrl(this.apiUrlToForwardPOR_To_DFO_BY_SDO)).pipe(
    //   switchMap((url) => {
    //     if (!url) return throwError(() => new Error('No API URL configured'));
    //     return this.httpClicent.post<GetRAResponse>(url, body, { headers });
    //   }),
    //   catchError((error) => {
    //     return throwError(() => new Error('Error'));
    //   })
    // );

    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("complain_table_id", complain_table_id);
    formData.append("sdo_id", sdo_id.toString());
    formData.append("remark", remark.toString());
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi.toString());

    formData.append("adesh_ki_prati", selected_file);  // ⬅ PDF FILE HERE

    return from(this.buildApiUrl(this.apiUrlToForwardPOR_To_DFO_BY_SDO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  // GET PREVIOUS EXTENSION REQUEST //
  getPreviourExtenstionRequestOfOneComplain(complain_id: string): Observable<PreviouseExtensionResponseModal> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetOldExtensionOfOnePOR)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<PreviouseExtensionResponseModal>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  // GET PREVIOUS EXTENSION REQUEST //
  submitExtensionRequest(complain_id: string, created_by: string, assigned_to: string, days_to_extend: string): Observable<PreviouseExtensionResponseModal> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      created_by: created_by.toString(),
      assigned_to: assigned_to.toString(),
      days_to_extend: days_to_extend.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSubmitJanchDaysExtensionRequest)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<PreviouseExtensionResponseModal>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  // GET PREVIOUS EXTENSION REQUEST //
  getMyExtensionRequestList(emp_id: string): Observable<ExtensionAwedanListResponse> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetAllExtensionAwedanList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<ExtensionAwedanListResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  // GET EXTENSION REQUEST FOR ME TO APPROVE //
  getExtensionRequestListWhich_I_Will_Approve(emp_id: string): Observable<ExtensionAwedanListResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetExtensionAwedanListWhichIWillApprove)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<ExtensionAwedanListResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  /// ASSIGN RA BY RO ///
  approveRejectExtensionRequest(
    request_table_id: string,
    approve_or_rejcct: string,
    days_count_by_approver: string,
    updated_by: string,
    complain_id: string): Observable<GetRAResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      request_table_id: request_table_id.toString(),
      approve_or_rejcct: approve_or_rejcct.toString(),
      days_count_by_approver: days_count_by_approver.toString(),
      updated_by: updated_by.toString(),
      complain_id: complain_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToApproveRejectAwedan)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  // Get App Details
  getAppDetails(app_version: string): Observable<GetAppDetailResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      app_version: app_version.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToGetAppDetail)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetAppDetailResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  /// SUBMIT DR DETAIL ///
  submitDrInfo(dr_list_data: string
  ): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      dr_list_data: dr_list_data.toString()
    };

    return from(this.buildApiUrl(this.apiUrlSubmitDrDetail)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  // REQUEST FOR NASTIBADH FROM RO TO SDO//
  requestForNastibadhFromROToSDO(complain_id: string, empId: string, complain_history_table_id: string
    , sdoOrDFo: string, sendTO: string
  ): Observable<WorkLogResponseModal> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      created_by: empId,
      complain_history_table_id: complain_history_table_id.toString(),
      sdo_or_dfo: sdoOrDFo.toString(),
      send_to: sendTO.toString()
    };

    return from(this.buildApiUrl(this.submitReqestForNastibadhaFromROToSDO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<WorkLogResponseModal>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  // REQUEST FOR NASTIBADH FROM SDO TO DFO//
  requestForNastibadhFromSDOToDFO(complain_id: string, empId: string, complain_history_table_id: string
    , sdoOrDFo: string
  ): Observable<WorkLogResponseModal> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      created_by: empId,
      complain_history_table_id: complain_history_table_id.toString(),
      sdo_or_dfo: sdoOrDFo.toString(),
      send_to: "0"
    };

    return from(this.buildApiUrl(this.submitReqestForNastibadhaFromSDOToDFO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<WorkLogResponseModal>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  // FINAL FOR NASTIBADH //
  requestForFinalNastibadh(complain_id: string,
    empId: string,
    complain_history_table_id: string,
    sdoOrDFo: string
  ): Observable<WorkLogResponseModal> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      created_by: empId,
      complain_history_table_id: complain_history_table_id.toString(),
      sdo_or_dfo: sdoOrDFo.toString()
    };

    return from(this.buildApiUrl(this.submitReqestForFInalNastibadhaFromDFOToRO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<WorkLogResponseModal>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  // ASSIGN RA FOR VASULI //
  assignRAForVasuli(complain_history_table_id: string,
    complain_table_id: string,
    ro_id: string,
    ra_id: string,
    remark: string,
    shesh_vasuli_rashi: string
  ): Observable<GetRAResponse> {


    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_history_table_id: complain_history_table_id.toString(),
      complain_table_id: complain_table_id.toString(),
      ro_id: ro_id.toString(),
      ra_id: ra_id.toString(),
      remark: remark.toString(),
      shesh_vasuli_rashi: shesh_vasuli_rashi.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToAssignRAForVasuli)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  getComplainDetailOfSelectedOne(complain_id: string, empId: string, designatioId: string): Observable<GetDashboardResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: Number(empId),
      designation_id: Number(designatioId),
      complain_id: Number(complain_id)
    };

    return from(this.buildApiUrl(this.apiToGetSingleComplainDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetDashboardResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );


  }


  getDataFor_FOCR_PrashmanPunji(
    emp_id: string,
    designation_id: string,
    circle_div_subDiv_rang_id: string,
    start_date: string, end_date: string): Observable<GetPorCountResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: emp_id.toString(),
      designation_id: designation_id.toString(),
      circle_div_subDiv_rang_id: circle_div_subDiv_rang_id.toString(),
      start_date: start_date,
      end_date: end_date
    };

    return from(this.buildApiUrl(this.apiUrlToGet_FOCR_PrashmanPunji)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetPorCountResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  submitSuchnaFromRO_To_SDO(
    saman_detail: string,
    patra_kramank: string,
    patra_dinank: string,
    anya_vishesh_vivran: string,
    other_thing_which_not_present_by_officer: string,
    complain_id: string,
    created_by: string,
    pristh_kramank: string
  ): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      saman_detail: saman_detail.toString(),
      patra_kramank: patra_kramank.toString(),
      patra_dinank: patra_dinank.toString(),
      anya_vishesh_vivran: anya_vishesh_vivran.toString(),
      other_thing_which_not_present_by_officer: other_thing_which_not_present_by_officer.toString(),
      complain_id: complain_id.toString(),
      created_by: created_by.toString(),
      pristh_kramank: pristh_kramank.toString()
    };

    return from(this.buildApiUrl(this.apiUrlSubmitSuchnaFromRO_TO_SDO)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  submitSuchnaFromSDOToMajistret(
    patra_kramank: string,
    patra_dinank: string,
    complain_id: string,
    created_by: string,
    nayayalay_sthan: string,
    sdo_sankhipt_vivran: string
  ): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      patra_kramank: patra_kramank.toString(),
      patra_dinank: patra_dinank.toString(),
      complain_id: complain_id.toString(),
      created_by: created_by.toString(),
      nayayalay_sthan: nayayalay_sthan.toString(),
      sdo_sankhipt_vivran: sdo_sankhipt_vivran.toString()
    };

    return from(this.buildApiUrl(this.apiUrlSubmitSuchnaFromSDOTOMajistret)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetMastersResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }


  getPradhikaritAdhikariDetail(
    empId: string,
    designation_id: string,
    complain_id: string): Observable<GetRAResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId.toString(),
      designation_id: designation_id.toString(),
      complain_id: complain_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToPradhikaritAdhiakri)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  // REVERT COMPLAIN //
  revertComplain(
    complain_history_table_id: string,
    complain_table_id: string,
    from_employee: string,
    to_employee: string,
    remark: string,
    designation: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      from_employee: from_employee.toString(),
      to_employee: to_employee.toString(),
      complain_history_table_id: complain_history_table_id.toString(),
      complain_id: complain_table_id.toString(),
      remark: remark.toString(),
      designation: designation.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToRevertComplain)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );


  }

  submitGirftariPatrakDetail(
    complain_id: string,
    accussed_detail: string,
    created_by: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      accussed_detail: accussed_detail.toString(),
      created_by: created_by.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSaveGirPatrakDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  // GET DASHBOARD DATAT //
  getAdminDashboardData(
    mainURL: string,
    empId: string, designationId: string, circleId: string, divisionId: string,
    start_date: string, end_date: string): Observable<GetDashboardResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      emp_id: empId.toString(),
      designation_id: designationId.toString(),
      circle_id: circleId.toString(),
      division_id: divisionId.toString(),
      start_date: start_date.toString(),
      end_date: end_date.toString()
    };

    const url = mainURL + this.apiUrlToGetAdminDashboardData;
    return of(url).pipe(   // ✅ use of() instead of from()
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post(url, body, {
          headers,
          responseType: 'json',
        }) as Observable<GetDashboardResponse>;
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  submitCrimDataYes(formformData: FormData): Observable<GetMastersResponse> {
    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitComplainYes)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));

        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming),
          catchError((error) => {
            console.error('Error submitting complain data:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }



  submitGirftariSuchnaDetail(
    complain_id: string,
    nyayik_dandadhikari_sthan: string,
    created_by: string,
    person_detail: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      complain_id: complain_id.toString(),
      court_place_name: nyayik_dandadhikari_sthan.toString(),
      person_detail: person_detail.toString(),
      created_by: created_by.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSaveGirPatrakSuchnaDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  submitCourtChallanDetail(
    complain_id: string,
    adhikari_name: string,
    pad: string,
    investigation_date: string,
    muljim_bayan_detail: string,
    created_by: string,
    id_to_update: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      created_by: created_by.toString(),
      complain_id: complain_id.toString(),
      adhikari_name: adhikari_name.toString(),
      pad: pad.toString(),
      investigation_date: investigation_date.toString(),
      muljim_bayan_detail: muljim_bayan_detail.toString(),
      id_to_update: id_to_update.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToSubmitCourtChallanDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }



  submitCourtCheckListDetail(
    complain_id: string,
    created_by: string,
    check_list_detail: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      created_by: created_by.toString(),
      complain_id: complain_id.toString(),
      check_list_detail: check_list_detail.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSubmitCourtCheckList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }




  submitCourtRemandForm(
    complain_id: string,
    created_by: string,
    district: string,
    detail: string,
    accussed_remand_detail: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      created_by: created_by.toString(),
      complain_id: complain_id.toString(),
      district: district.toString(),
      detail: detail.toString(),
      accussed_remand_detail: accussed_remand_detail.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSubmitRemand)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  submitCourtWitnessDetail(
    created_by: string,
    complain_id: string,
    witness_detail: string
  ): Observable<GetRAResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      created_by: created_by.toString(),
      complain_id: complain_id.toString(),
      witness_detail: witness_detail.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToSubmitCourtWitnessDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }



  getEmployeeList(
    designation_id: string,
    emp_id: string,
    circle_id: string,
    division_id: string,
    sub_division_id: string,
    rang_id: string,
    sub_rang_id: string,
    beat_id: string,
  ): Observable<GetEmployeeListResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      designation_id: designation_id.toString(),
      emp_id: emp_id.toString(),
      circle: circle_id.toString(),
      division: division_id.toString(),
      sub_division: sub_division_id.toString(),
      rang: rang_id.toString(),
      sub_rang: sub_rang_id.toString(),
      beat: beat_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlToGetEmployeeList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetEmployeeListResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }

  updateEmployeeData(
    updated_by: string,
    emp_id: string,
    mobile: string,
    emp_name: string,
    password: string
  ): Observable<GetEmployeeListResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      updated_by: updated_by.toString(),
      emp_id: emp_id.toString(),
      mobile: mobile.toString(),
      emp_name: emp_name.toString(),
      password: password.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToUpdateEmployee)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetEmployeeListResponse>(url, body, { headers });
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  updatePasswordByEmployee(empId: string, password: string): Observable<OfficerLoginResponse> {

    const body = {
      password: password.toString(),
      emp_id: empId.toString(),
      updated_by: empId.toString()
    };

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlToUpdateOfficerPassword)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<OfficerLoginResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }



  // FORWARD POR BY DFO TO CCF //
  forward_complain_to_ccf_by_dfo(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    sdo_id: string,
    remark: string,
    selected_file: File,
    shesh_vasuli_rashi: string
  ): Observable<GetRAResponse> {

    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("complain_table_id", complain_table_id);
    formData.append("sdo_id", sdo_id.toString());
    formData.append("remark", remark.toString());
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi.toString());

    formData.append("adesh_ki_prati", selected_file);  // ⬅ PDF FILE HERE

    return from(this.buildApiUrl(this.apiUrlToForwardPOR_To_CCF_BY_DFO)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );


  }



  // APLEKHIT/ABHISANDHAN/COURT CHALAN POR BY CCF //
  aplekhitOrAbhisandhancomplain_by_ccf(
    japt_saman_total_price: string,
    found_vanopaj_total_price: string,
    actual_loss_total_price: string,
    mahsul_total_price: string,
    mavja_total_price: string,
    complain_history_table_id: string,
    complain_table_id: string,
    dfo_id: string,
    remark: string,
    pdfFile: File,
    action_taken_by_officer: string,
    shesh_vasuli_rashi: string,
    adesh_kramank: string,
    adesh_dinank: string
  ): Observable<GetRAResponse> {

    const formData = new FormData();

    formData.append("japt_saman_total_price", japt_saman_total_price.toString());
    formData.append("found_vanopaj_total_price", found_vanopaj_total_price.toString());
    formData.append("actual_loss_total_price", actual_loss_total_price.toString());
    formData.append("mahsul_total_price", mahsul_total_price.toString());
    formData.append("mavja_total_price", mavja_total_price.toString());
    formData.append("complain_history_table_id", complain_history_table_id);
    formData.append("complain_table_id", complain_table_id);
    formData.append("dfo_id", dfo_id.toString());
    formData.append("remark", remark.toString());
    formData.append("shesh_vasuli_rashi", shesh_vasuli_rashi.toString());

    formData.append("adesh_kramank", adesh_kramank.toString());
    formData.append("adesh_dinank", adesh_dinank.toString());

    formData.append("action_taken_by_officer", action_taken_by_officer.toString());

    formData.append("adesh_ki_prati", pdfFile);  // ⬅ PDF FILE HERE

    return from(this.buildApiUrl(this.apiUrlToClosePOR_BY_CCF)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  submitJaptinamaData(formformData: FormData): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitJaptiNama)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        ;
        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  submitSupurdnamaData(formformData: FormData): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitSupurdNama)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        ;
        return this.httpClicent.post<GetMastersResponse>(url, formformData).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        ;
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  submitCourtCaseOrAdeshDetail(
    court_case_number: string,
    court_prastuti_date: string,
    selected_file: File,
    complain_id: string,
    created_by: string
  ): Observable<GetRAResponse> {

    ;
    const formData = new FormData();
    formData.append("court_case_number", court_case_number.toString());
    formData.append("court_prastuti_date", court_prastuti_date.toString());
    formData.append("complain_id", complain_id.toString());
    formData.append("updated_by", created_by.toString());
    formData.append("court_adesh_pdf", selected_file);

    return from(this.buildApiUrl(this.apiUrlToSubmitCourtCaseNumberDetail)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetRAResponse>(url, formData).pipe(
          timeout(this.timeOutTiming)
        );
      }),
      catchError((error) => {
        ;
        return throwError(() => new Error('Server not responding'));
      })
    );

  }


  // Get UserNameList
  getUserNameList(designation: string, circle: string, division: string,
    sub_division: string, rang: string, sub_rang: string, beat: string
  ): Observable<GetUserNameListResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      designation: designation.toString(),
      circle: circle.toString(),
      division: division.toString(),
      sub_division: sub_division.toString(),
      rang: rang.toString(),
      sub_rang: sub_rang.toString(),
      beat: beat.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetUserNameList)).pipe(

      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<GetUserNameListResponse>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),

      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Server not responding'));

      })
    )

  }

  // Loginas: fetch users for dropdown at next designation level (includes mobile + password)
  loginasHierarchyUsers(
    superAdminEmpId: string,
    nextDesignationId: string,
    circleId: string,
    divisionId: string,
    subDivisionId: string,
    rangId: string,
    subRangId: string,
    beatId: string
  ): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      super_admin_emp_id: superAdminEmpId,
      next_designation_id: nextDesignationId,
      circle_id: circleId,
      division_id: divisionId,
      sub_division_id: subDivisionId,
      rang_id: rangId,
      sub_rang_id: subRangId,
      beat_id: beatId,
    };

    return from(this.buildApiUrlForController('Loginas', this.apiUrlLoginasHierarchyUsers)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<any>(url, body, { headers }).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        if (error.name === 'TimeoutError') return throwError(() => new Error('Request timed out'));
        return throwError(() => new Error('Server not responding'));
      })
    );
  }

  // Loginas: impersonate a selected officer (super admin only)
  loginasImpersonate(superAdminEmpId: string, targetUserName: string, reason: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      super_admin_emp_id: superAdminEmpId,
      target_user_name: targetUserName,
      reason: reason ?? "",
    };

    return from(this.buildApiUrlForController('Loginas', this.apiUrlLoginasImpersonate)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<any>(url, body, { headers }).pipe(timeout(this.timeOutTiming));
      }),
      catchError((error) => {
        if (error.name === 'TimeoutError') return throwError(() => new Error('Request timed out'));
        return throwError(() => new Error('Server not responding'));
      })
    );
  }

  getParivahanRelatedReport(circleId: number, fromDate: string, toDate: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      circleId,
      fromDate,
      toDate
    };

    return from(this.buildApiUrl(this.apiUrlGetParivahanRelatedReport)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.httpClicent.post<any>(url, body, { headers }).pipe(
          timeout(this.timeOutTiming)
        );
      }),
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }
        return throwError(() => new Error('Server not responding'));
      })
    );
  }

  takeNGRokURL(): Observable<TakeNGRokURLResponse> {
    const body = {};
    return this.httpClicent.post<TakeNGRokURLResponse>(this.apiUrlToGetNgRokURL, body).pipe(
      catchError((error) => {
        throw new Error('Server not responding');
      })
    );
  }

}