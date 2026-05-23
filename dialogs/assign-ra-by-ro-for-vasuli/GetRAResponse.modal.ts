export interface GetRAResponse {
    response: SuccessResponse;
    data: GetRAResponseModal[];
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface GetRAResponseModal{
    emp_id:number;
    empName:string;
    mobile_number:string;
}