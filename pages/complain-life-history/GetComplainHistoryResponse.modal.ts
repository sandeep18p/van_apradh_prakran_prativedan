import { ExtensionAwedanListResponseModal } from "../show-submited-request-to-extend-janch-awadhi/ExtensionAwedanList.modal";

export interface GetComplainHistoryResponse {
    response: SuccessResponse;
    data: GetComplainHistoryResponseModal[];
    extension_history: ExtensionAwedanListResponseModal[];
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface GetComplainHistoryResponseModal {
    date_of_crime: string;             // Format: "dd-MM-yyyy"
    complain_created_by: string;       // Example: "yogesh sharma (BG)"
    complain_created_at: string;       // Format: "dd-MM-yyyy hh:mm AM/PM"
    complain_sended_to: string;        // Example: "yogesh sharma (RO)"
    complain_updated_at: string;       // Format: "dd-MM-yyyy hh:mm AM/PM"
    stage_name: string;                // Example: "CFO LEVEL"
    complain_status: string;           // Example: "APPROVED"
    approve_reject_remark: string;     // Example: "approved by ro"
    complain_status_number: string;
    designation_id: string;
    japt_saman_total_price_edited: string;
    found_vanopaj_total_price_edited: string;
    actual_loss_total_price_edited: string;
    mahsul_total_price_edited: string;
    mavja_total_price_edited: string;
    agreshan_patra: string;
    shesh_vasuli_rashi: string;
    complain_history_table_id: string;
    created_by_at_history_table: string;
    action_taken_by_stage_officer_like_sdo_dfo: string;
}