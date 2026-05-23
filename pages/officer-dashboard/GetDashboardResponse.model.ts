import { JaptVahanDetailInterface } from "../view-complain-detail/base64responseofsign.modal";

export interface GetDashboardResponse {
    response: SuccessResponse;
    totalComplainData: GetDashboardResponseModel[];
    complainData: ComplainDetails[];
    supportiveDocument: SupportiveDocumentResponseModel[];
    gir_patrak: GirPatrakResponseModal[];
    gir_suchna_patrak: GirSuchnaPatrakResponseModal[];
    court_challan_form: CourtChallanFormResponseModal[];
    court_check_list: CourtCheckListResponseModal[];
    beat_compartment: BeatMasterWithComparmentModal[];
    total_por_count: TotalPORCountResponseModal[];
    remand_form_detail: AccussedRemandFormResponseModal[];
    witness_list: WitnessResponseModal[];
    listOfSupurdnamaVivran: SupurdnamaResponse[];
}

export interface BeatMasterWithComparmentModal {
    id: Number;
    name: string;
    compartment_no: string;
}

export interface TotalPORCountResponseModal {
    circleName: string;
    circleId: string;
    divisionName: string;
    divisionId: string;

    totalPOR: string;
    totalGyatPOR: string;
    totalAGyatPOR: string;
    nastibadhaPOR: string;
    underProcessPOR: string;
    ccfLevelPending: string;
    dfoLevelPending: string;
    sdoLevelPending: string;
    roLevelOPendingToForwardSDO: string;
    roLevelPendingToAssignRA: string;
    raLevel: string;
    totalAplekhit: string;
    totalAbhisandhanit: string;
    totalCourtCase: string;
    totalPendingToNastibadh: string;
    totalBeatNirikshan: string;
}

export interface GirPatrakResponseModal {
    accussed_person_table_id: string,
    id_to_update: string,
    gir_sthan: string,
    gir_date: string,
    gir_time: string,
    gir_adhikari_ka_name_and_pad: string,
    gir_time_paya_gaya_saman: string,
    chonto_ka_vivran: string,
}

export interface AccussedRemandFormResponseModal {
    id_to_update: string,
    district: string,
    detail: string,
    complain_id: string,
    accussed_person_table_id: string,
    previous_remand: string,
    want_remand: string,
    kafiyat: string,
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface SupportiveDocumentResponseModel {
    document_name: number,
    document_title: number,
    designation_id: string
}

export interface GetDashboardResponseModel {
    totalComplain: number,
    whichTypeOfComplain: number,
    whichTypeOfComplainTitle: string
}

export interface ComplainDetails {
    is_it_court_case?: string | number,
    court_case_number?: string,
    court_prastuti_date?: string,
    court_adesh_pdf?: string,
    complainer_emp_id?: string,
    is_accused_found: string,
    total_japt_saman_costing: string;
    complain_created_by: string;
    beat_name: string;
    complain_id: string;
    transferd_to: string;
    transferd_by: string;
    complain_history_table_id: string;
    complain_status: string;
    complain_status_text: string;
    current_stage: string;
    stage_name: string;
    accused_name: string;
    accused_fathers_name: string;
    cast_name: string;
    crime_type: string;
    accused_address: string;
    type_of_crime: string;
    place_of_crime: string;
    date_of_crime: string; // Format: 'YYYY-MM-DD HH:mm:ss'
    details_of_seized_goods: string;
    is_japt_vahan: string;
    is_vahan_suchana_given_by_ro_to_sdo: string;
    is_rajsath_suchana_given_by_sdo_to_majistret: string;
    show_approve_reject_button: string;
    imageUrl: string;
    lat: string;
    lng: string;
    map_address: string;
    all_image_name: string;

    name_of_witness_one: string;
    name_of_witness_two: string;
    address_of_witness_one: string;
    address_of_witness_two: string;
    ra_name: string;
    button_text: string;
    complain_progress_stage: string;

    por_number: string;
    compartment_number: string;
    crime_dhara: string;
    compartment_option: string;
    left_days_to_resolve_por: string;

    japtSamanList: (JaptSamanItem & { can_delete: boolean, compartment_number: string })[];

    panch_nama_photo: string;
    japti_nama_photo: string;
    supurd_nama_photo: string;
    complainer_name: string;
    finalWorkLogDetailByRa: FinalWorkLog[]
    //Addedhtml2
    // ADD THESE NEW PROPERTIES
    accused_count?: number;
    accused_persons_json?: string;
    japt_vahan_detail?: string;
    accusedPersons?: AccusedPersonDetailForVanApradhPrakran[];
    witnesses?: WitnessDetailForPor[];
    witnesses_json?: string;
    assigner_remark: string;

    circle_name: string;
    division_name: string;
    sub_division_name: string;
    range_name: string;
    sub_range_name: string;

    is_complain_created_by_ra: string; // if 0 - then BFO if 1 - then RA
    apradhi_photo: string;
    por_photo: string;
    complainer_sign: string;

    complainer_pad: string;
    witness_1_sign: string;
    witness_2_sign: string;
    chinhaPhoto: string;
    isJaptikartaAndSupurdarSame: string;
    supurddar_ka_name: string;
    supurddar_ka_pita_ka_name: string;
    supurdar_ka_jati: string;
    supurddar_ka_vyavsay: string;
    supurdar_ka_poora_pata: string;
    supurd_me_lene_ka_dinank: string;
    japtinama_anya_vishesh_vivran: string;
    supurddar_sign: string;
    japtikarta_ka_name: string;
    japtikarta_ka_pad: string;
    shesh_vasuli_rashi: string;
    patra_kramank: string;
    pratra_dinank: string;
    anya_vishesh_vivran: string;
    other_thing_which_not_present_by_officer: string;
    sdo_patra_kramank: string;
    sdo_patra_dinank: string;
    pristh_kramank: string;
    nayayalay_sthan: string;
    sdo_sankhipt_vivran: string;
    sys_gen_por_number: string;
    actual_crime_date: string;
    vahan_detail: string;
    is_beat_nirikshan: string;

    focr_number: string;
    focr_date: string;

    beat_id: string;

    listOfWitness: WitnessResponseModal[];
    listOfJaptinamaVivran?: JaptinamaResponseModal[];
    Saman_Detail?: any[];

    japti_ka_dinak?: string;
    japti_ka_sthaan?: string;
    decision?: string;
}

// Add this new interface Addedhtml2
export interface AccusedPersonDetail {
    accussed_person_table_id: string,
    is_it_por_accussed?: string,
    name: string;
    fathersName: string;
    address: string;
    cast: string;
    signatureImage: string;
    base64: string | null;
    age: string | null;
    jati_name: string;
    mobile_number: string;
    aadhaar_number?: string;
    japtinama_table_id?: string
}

export interface AccusedPersonDetailForVanApradhPrakran {
    accussed_person_table_id: string;
    is_it_por_accussed?: string;
    name: string;
    fathersName: string;
    address: string;
    cast: string;
    signatureImage: string;
    base64: string | null;
    age: string | null;
    jati_name: string;
    mobile_number: string;
    aadhaar_number?: string;
    show_delete_button: boolean;
}

export interface AccusedPersonDetailForChallanRealted {
    accussed_person_table_id: string,
    Name: string;
    FathersName: string;
    Address: string;
    Cast: string;
    signatureImage: string;
    base64: string | null;
}

export interface WitnessDetail {
    witnessName: string;
    address: string;
    sign: string;
    base64: string | null;

}



export interface JaptSamanItem {
    jabti_saman_type: string; // १ - ठूंठ, २ - लट्ठा, ३ - अन्य , 4 - chiran, 5 - जलाऊ
    actual_name_of_saman: string; // १ - ठूंठ, २ - लट्ठा, ३ - अन्य , 4 - chiran , 5 - जलाऊ
    saman_table_id: string;
    prajati_name: string;
    prajati_type: number;
    lambai: string;
    golai: string;
    ghan_meter: string;
    nag: string;
    dar: string;
    total_cost: string;
    if_other_then_detail: string;
    one_golai_less: string;
    form_factor: string;
    motai: string;
    unchai: string;
    kasth_halat: number;
    kasth_halat_name: string;
    is_yogya_to_parivahan: string; /// 0-no,1-yes
    if_not_yogya_then_reason: string;
    is_janch_karta_entry: boolean;
    site_quality: number;
    is_dar_editable: boolean;
    japtinama_table_id?: string;
    supurd_me_diya_gya?: Number;
    supurd_me_diya_gya_nag?: Number;
    left_nag?: Number;

}



export interface FinalWorkLog {
    jachkarta_decision?: number | null;
    workLogTableIdMyProperty: number;
    created_at: string;
    work_log_text: string;
    ra_name: string;
    japt_saman_total_price: string;
    found_vanopaj_total_price: string;
    actual_loss_total_price: string;
    mahsul_total_price: string;
    mavja_total_price: string;
    ra_anushansha: string;
    agrim_vasuli_money: string;
    total_vasuli_rashi_after_adesh: string;
    money_rasid_number: string;
    is_accussed_want_to_abhisandhanit: string;
    accussed_financial_condition: string;
    accussed_found_date_in_case_of_agyat: string;
    japt_suda_saman_jinko_diya_gaya: string;
    start_end_janch_date: string;
    money_rasid_date: string;
    tafsil_jurm_or_tafil_maal_jo_giraftar_hua: string;
    raji_nama_pic: string;
    shesh_vasuli_rashi: string;
    totalPreviouseVasuliRashi: string;
    past_crim_record_of_accussed: string;
    prativedan_dinank: string;
    prativedan_kramank: string;
    janch_karta_id: string;
}

export interface VasuliViranDetailRequestModal {
    complain_id: string;
    mavja_rashi: string;
    mahsul_rashi: string;
    total_rashi: string;
    created_by: string;
    money_rasid_kramank: string;
    money_rasid_dinank: string;
    month_year: string;
    dr_number: string;
    vasuli_table_id: string;
    updated_by: string;
    updated_at: string;
    is_editable: string; // 1 - editable , 0 - non-editable
    created_at: string;
    bank_chalan_kramank?: string;
    bank_chalan_dinank?: string;
}

export interface Dr_Detail_RequestModal {
    updated_by: string;
    dr_number: string;
    month: string;
    created_by: string;
}

export interface AccusedPersonForCourtChalanDetail {
    name: string;                   // अभियुक्त का नाम
    fathersName: string;            // पिता का नाम
    age: string | number;           // उम्र
    mobile_number: string;          // मोबाइल नंबर
    aadhaar_number?: string;        // आधार नंबर
    cast: string;                   // जाति वर्ग
    jati_name: string;              // जाति
    address: string;                // पता
    gir_sthan: string;              // गिरफ्तारी स्थान
    gir_date: string;               // गिरफ्तारी दिनांक (dd-MM-yyyy format for UI)
    gir_time: string;               // गिरफ्तारी समय (12-hour format for UI)
    gir_adhikari: string;           // गिरफ्तार करने वाले अधिकारी का नाम और पद
    gir_paya_gaya_saman: string;    // गिरफ्तारी के समय पाया गया सामान
    gir_body_mark: string;          // शरीर पर पाई गई चोटों का विवरण
    id_to_update: string;          // शरीर पर पाई गई चोटों का विवरण
    accussed_person_table_id?: string;
    answer_1_yes_no?: string;
    answer_1_reason?: string;
    answer_2_yes_no?: string;
    answer_2_reason?: string;
    answer_3_yes_no?: string;
    answer_3_reason?: string;
    answer_4_yes_no?: string;
    answer_4_reason?: string;
    answer_5_yes_no?: string;
    answer_5_reason?: string;
    answer_6_yes_no?: string;
    answer_6_reason?: string;
    questions?: { id: number; text: string; answer: string; reason: string }[];
    district?: string;
    detail?: string;
    complain_id?: string;
    accussed_table_id?: string;
    previous_remand?: string;
    want_remand?: string;
    kafiyat?: string;
    suchna_person_name?: string;
    suchna_pita_pati_name?: string;
    suchna_person_jati?: string;
    suchna_person_pata?: string;
    prastut_hone_ka_dinank?: string;
    signatureImage?: string;
    base64?: string;
    show_delete_button?: boolean;
    is_checked?: boolean;
}

export interface GirSuchnaPatrakResponseModal {
    id_to_update: string,
    court_place_name: string,
    accussed_person_table_id: string,
    complain_id: string,
    suchna_person_name: string,
    suchna_pita_pati_name: string,
    suchna_person_jati: string,
    suchna_person_pata: string,
    prastut_hone_ka_dinank: string,
}

export interface CourtChallanFormResponseModal {
    id_to_update: string,
    adhikari_name: string,
    pad: string
    investigation_date: string
    muljim_bayan_detail: string
}

export interface CourtCheckListResponseModal {
    id_to_update: string,
    accussed_person_table_id: string,
    answer_1_yes_no: string,
    answer_1_reason: string,
    answer_2_yes_no: string,
    answer_2_reason: string,
    answer_3_yes_no: string,
    answer_3_reason: string,
    answer_4_yes_no: string,
    answer_4_reason: string,
    answer_5_yes_no: string,
    answer_5_reason: string,
    answer_6_yes_no: string,
    answer_6_reason: string
}

export interface SupurdnamaResponse {
    id: string;
    SupurdarKaName: string;
    witness_json: string;
    witnessPersonList?: WitnessResponseModal[],
    SupurdarKaFather: string;
    SupurdarKaJati: string;
    SupurdarKaVyavsay: string;
    SupurdarKaPooraPata: string;
    SupurdarMeLeneKaDate: string;
    SupurdnamaPic: string;
    SupurdMeDeneWaleAdhikariName: string;
    SupurdMeDeneWaleAdhikariPad: string;
    SupurdMeDeneWaleAdhikariSign: string;
    SupurdarKaSign: string;
    japtSamanList: JaptSamanItem[];
    kasthItemsList?: any[];
    thuthItemsList?: any[];
    chiranItemsList?: any[];
    chattaItemsList: any[];
    balliItemsList?: any[];
    OtherJaptItemsList?: any[];
    baansItemsList: any[];
    polItemsList: any[];
}

export interface JaptinamaResponseModal {
    japtinnama_table_id: string,
    japti_ka_dinak: string,
    japti_ka_sthaan: string,
    hammer_mark_pic: string,
    other_vivran: string,
    japtinama_pic: string,
    japtikarta_ka_name: string,
    japtikarta_ka_pad: string,
    accussed_ids: string;
    witness_json: string;
    accusedPersonsList?: AccusedPersonForCourtChalanDetail[];
    witnessPersonList?: WitnessResponseModal[],

    kasthItemsList?: any[],
    thuthItemsList?: any[],
    chiranItemsList?: any[],
    chattaItemsList: any[],
    balliItemsList?: any[],
    OtherJaptItemsList?: any[],
    baansItemsList: any[],
    polItemsList: any[],
    listOfJaptVahanDetail: JaptVahanDetailInterface[]
}

export interface WitnessResponseModal {
    id: string,
    naam: string;
    pita_ka_naam: string;
    pata: string;
    jaati: string;
    age: string;
    sign: string;
    id_to_update?: string,
    isNew?: boolean,
    japtinama_table_id?: string,
    supurdnama_table_id?: string
}

export interface WitnessDetailForPor {
    name: string;
    fatherName: string;
    address: string;
    jaati: string;
    age: string;
    signatureImage: string;
}