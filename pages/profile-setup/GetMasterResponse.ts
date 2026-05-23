export interface GetMastersResponse {
    response: SuccessResponse,
    data: MastersResponseModel[]
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface MastersResponseModel {
    id: number,
    name: string
}

export interface GetAppDetailResponse {
    response: SuccessResponse,
    data: GetAppDetailResponseModal[]
}

export interface GetAppDetailResponseModal {
    android_app_version: string,
    is_app_under_maintainance: string,
    is_web_app_under_maintainance: string,
    app_under_maintainance_msg: string,
    app_update_msg: string,
}

export interface GetUserNameListResponse {
    response: SuccessResponse,
    data: GetUserNameListResponseModel[]
}

export interface GetUserNameListResponseModel {
    user_name: string,
    emp_mobile_number: string,
    emp_original_name: string,
    f_name: string,
    name_to_show: string
}