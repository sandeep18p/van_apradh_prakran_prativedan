export interface GetRAResponse {
    response: SuccessResponse;
    data: GetRAResponseModal[];
}

export interface SuccessResponse {
    code: number,
    msg: string,
    generated_id: string
}

export interface GetRAResponseModal{
    emp_id:number;
    empName:string;
    mobile_number:string;
    designation_id:string;
}