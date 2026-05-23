import { SuccessResponse } from "../add-complain/GetCastAndCrimTypeMasterResponse";

export interface ExtensionAwedanListResponse {
    response: SuccessResponse;
    data: ExtensionAwedanListResponseModal[];
}

export interface ExtensionAwedanListResponseModal{
    request_at:string,
    approver_name:string,
    por_number:string,
    request_table_id:string,
    complain_id:string,
    assigned_to:string,
    is_approved:string,
    days_to_extend:string,
    days_by_approver:string,
    requester_name:string
}