import { DharaData, GetBeatResponseModal, GetCastAndCrimTypeMasterResponseModal, PrajatiName } from "../add-complain/GetCastAndCrimTypeMasterResponse";

export interface OfficerLoginResponse {
    response: SuccessResponse,
    data: Users[],
    cast: GetCastAndCrimTypeMasterResponseModal[],
    beat: GetBeatResponseModal[],
    crimType: GetCastAndCrimTypeMasterResponseModal[],
    dhara_data: DharaData[],
    prajati_name: PrajatiName[];

}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface Users {
    emp_id: number;
    f_name: string;
    l_name: string;
    designation_id: string;
    designation_name: string;
    user_name: string;
    password: string;
    is_active: number;
    mobile_number: number;
    circle_id: string;
    circle_name: string;
    division_id: string;
    division_name: string;
    range_id: string;
    range_name: string;
    sub_rang_id: string;
    sub_rang_name: string;
    beat_id: string;
    beat_name: string;
    sub_division_id: string;
    sub_division_name: string;
    is_self_verified: number;
    unique_device_id: string;
    emp_original_name: string;
    emp_mobile_number: string;
}