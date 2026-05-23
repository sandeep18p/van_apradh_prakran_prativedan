export interface TakeNGRokURLResponse {
    response: SuccessResponse;
    data: TakeNGRokURLModel;
}

export interface SuccessResponse {
    status: string,
    msg: string
}

export interface TakeNGRokURLModel {
    forest_complain_ngrok_url: string,
    tester_user_id: string,
    forest_complain_ngrok_url_testing: string;

}