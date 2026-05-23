export interface GetCastAndCrimTypeMasterResponse {
    response: SuccessResponse,
    crim_type_data: GetCastAndCrimTypeMasterResponseModal[],
    cast_data: GetCastAndCrimTypeMasterResponseModal[],
    beat_name: GetBeatResponseModal[]
    dhara_data: DharaData[]
    prajati_name: PrajatiName[];
    dhara_data_new?: DharaDataNew[]
    form_factor_master?: FormFactorResponse[];
    khada_vrikha_price_master?: KhadaVrikhaPriceMasterResponse[];
    balli_price_master?: BalliPriceMasterResponse[];
    lattha_price_master?: LatthaKasthPriceMasterResponse[];
    chatta_price_master?: ChattaJalauPriceMasterResponse[];
    chiraan_price_master?: ChiraanPriceMasterResponse[];
    fencing_pol_price_master?: FencingPolPriceMasterResponse[];
    bamboo_price_master?: BambooPriceMasterResponse[];
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface GetCastAndCrimTypeMasterResponseModal {
    id: number,
    name: string,
    dhara:string
}

export interface GetBeatResponseModal {
    id: number,
    name: string,
    compartment_no:string[]
}

export interface DharaData {
  id: string;
  dhara_head: string;
  dhara_comma_separated: string[]; // Array of dhara strings
  dhara_year: string;
}

export interface PrajatiName {
  id: number;
  name: string;
  show_in?: string;
}


export interface DharaDataNew {
  id: string;
  crime_type: string;
  adhiniyam: string;
  dhara: string;
  discription: string;
  forest_type: string; // "RF" | "PF" | "" etc.
}

export interface FormFactorResponse {
    id: string;
    site_quality: string;
    girh_class: string;
    sound: string;
    half_sound: string;
    jalau: string;
    applicable_year: string;
}

export interface KhadaVrikhaPriceMasterResponse {
    id: string;
    site_quality: string;
    girh_class: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface IdAndNameModel {
    id: number;
    name: string;
}

export interface BalliPriceMasterResponse {
    id: string;
    length: string;
    girh_class: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface LatthaKasthPriceMasterResponse {
    id: string;
    length: string;
    girh_class: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface ChattaJalauPriceMasterResponse {
    id: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface ChiraanPriceMasterResponse {
    id: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface FencingPolPriceMasterResponse {
    id: string;
    prajati: string;
    circle: string;
    applicable_year: string;
    price: string;
}

export interface BambooPriceMasterResponse {
    id: string;
    circle: string;
    bambu_type: string;
    applicable_year: string;
    size: string;
    price: string;
}