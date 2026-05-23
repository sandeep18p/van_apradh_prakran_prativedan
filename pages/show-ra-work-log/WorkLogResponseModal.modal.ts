import { SuccessResponse } from "../add-complain/GetCastAndCrimTypeMasterResponse";
import { GetComplainHistoryResponseModal } from "../complain-life-history/GetComplainHistoryResponse.modal";
import { VasuliViranDetailRequestModal } from "../officer-dashboard/GetDashboardResponse.model";

export interface WorkLogResponseModal {
    response: SuccessResponse;
    data: WorkLogResponseModal[];
    when_assign_janchkarta_adhikari : WorkLogResponseModal[];
    final_log: FInalWorkLogResponseModal[];
    por_history: GetComplainHistoryResponseModal[];
    challan_detail: ChallanDetailResponseModal[];
    vasuli_detail: VasuliViranDetailRequestModal[];
    dr_detail: Dr_Detail_ResponseModal[];
}

export interface FInalWorkLogResponseModal {
    ra_name: string;
    japt_saman_total_price: string;
    found_vanopaj_total_price: string;
    actual_loss_total_price: string;
    mahsul_total_price: string;
    mavja_total_price: string;
    ra_anushansha: string;
    is_accussed_want_to_abhisandhanit: string;
    accussed_financial_condition: string;
    accussed_found_date_in_case_of_agyat: string;
    japt_suda_saman_jinko_diya_gaya: string;
    raji_nama_pic: string;
    past_crim_record_of_accussed: string;
}


export interface WorkLogResponseModal {
    created_at: string;
    work_log_text: string;
    log_pic: string;
    address: string;
    work_log_images: string;
    work_log_images_array: string[];
    work_log_date: string;
    janch_karta_ka_sign:string;
    ra_name:string;
}

export interface ChallanDetailResponseModal {
    challan_kramank: string;
    challan_date: string;
    depo_name: string;
    total_matra_in_ghan_meter: string;
    challan_image: string;
    total_matra_in_sankhya: string;
    vanopaj_type: string;
    vanopaj_type_id: string;
}

export interface Dr_Detail_ResponseModal {
    dr_number: string;
    month: string;
}