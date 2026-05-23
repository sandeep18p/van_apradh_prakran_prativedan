import { SuccessResponse } from "./GetDashboardResponse.model";

export interface GetEmployeeListResponse {
    response: SuccessResponse,
    data: GetEmployeeListResponseModal[];
}

export interface GetEmployeeListResponseModal {
    emp_id: string;
    designation_name: string;
    emp_original_name: string;
    f_name: string;
    user_name: string;
    rangeName: string;
    circleName: string;
    divisionName: string;
    subDivisionName: string;
    sub_rang_name: string;
    beat_name: string;
    password: string;
    emp_mobile_number: string;
    is_editable?: boolean;
}