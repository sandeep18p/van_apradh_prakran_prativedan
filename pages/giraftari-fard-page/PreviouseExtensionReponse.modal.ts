import { SuccessResponse } from "../add-complain/GetCastAndCrimTypeMasterResponse";

export interface PreviouseExtensionResponseModal {
    response: SuccessResponse;
    data: PreviouseExtensionResponse[];
}

export interface PreviouseExtensionResponse{
    previous_request_count:string,
    approver_name:string,
    approver_id:string,
    pending_request_id:string
}