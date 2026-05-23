export interface GetStateNameResponseModel {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    neighbourhood?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
  };
  boundingbox: [string, string, string, string];
}


export interface GetAppDetailResponse {
  response: SuccessResponse,
  data: AppDetailModel
}

export interface AppDetailModel {
  app_version: string,
  is_forcely_update: string,
  is_app_under_maintanance: string,
}

export interface SuccessResponse {
  code: number;
  msg: string;
}
