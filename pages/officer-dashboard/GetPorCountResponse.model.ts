import { SuccessResponse } from "../profile-setup/GetMasterResponse";

export interface GetPorCountResponse {
  response: SuccessResponse,
  complainData: GetPorCountResponseModal[],
  register_data: GetPorPanjiyanRegisterDetail[]
  register_data_focr_modal: FOCR_Modal[]
}

export interface GetPorCountResponseModal {
  circle_name: string,
  div_name: string,
  sub_div_name: string,
  rang_name: string,
  por_count: string
}

export interface GetPorPanjiyanRegisterDetail {
  current_level: string;
  complainId: string;
  date_to_jari_por: string;
  complain_creator_name_designation: string;
  por_reached_at_ro_office: string;
  ra_name: string;
  accussed_detail: string;
  witness_detail: string;
  supurd_dar_name: string;
  vanopaj_detail: string;
  janch_karta_ko_jab_por_diya_gaya: string;
  janch_karta_name_or_pad: string;
  if_janch_extended_then_detail: string;
  back_to_ro_office_after_complete_janch: string;
  prakran_me_japt_vanopaj_pa_kra: string;
  come_at_sdo_office: string;
  prakran_compound_pashchyat: string;
  prakran_mavja: string;
  prakran_mahsul: string;
  prakran_total: string;
  prakran_ke_liye_gay_nirnay: string;
  vasuli_ka_vivran: string;
  money_rasid_kramank_or_date: string;
  chalan_kramank: string;
  rashi_samayojan_ka_vivran: string;
  after_nastibadh_back_at: string;
  challan_detail: string;
}

export interface FOCR_Modal {
  adesh_dinank: string;
  adesh_kramank: string;
  rang_name: string;
  actual_loss:string;
  crime_type: string;
  crime_dhara: string;
  por_number: any;
  date_of_crime: any;
  ra_name: any;
  beat_name: any;

  complain_creator_name_designation: any;
  por_reached_at_ro_office: any;

  accussed_detail: any;
  complain_table_accussed_detail: any;

  witness_detail: any;
  supurd_dar_name: any;
  vanopaj_detail: any;
  janch_karta_ko_jab_por_diya_gaya: any;
  janch_karta_name_or_pad: any;
  if_janch_extended_then_detail: any;
  back_to_ro_office_after_complete_janch: any;
  challan_detail: any;
  come_at_sdo_office: any;
  por_come_at_dfo_office: any;
  come_at_ro_after_janch_from_sdo_or_dfo: any;
  prakran_compound_pashchyat: any;
  prakran_mavja: any;
  prakran_mahsul: any;
  prakran_total: any;
  money_rasid_kramank_or_date: any;
  chalan_kramank: any;
  after_nastibadh_back_at: any;
  action_taken_at_prakran: any;

  vasuli_mahsul: any;
  vasuli_mavja: any;
  total_vasuli: any;

  came_after_vasuli: any;
  sent_to_vasuli: any;

  came_at_ro_after_nastibadh: any;

  japtiSamanDetail: JaptSamanDetailModal[];
  depoDetailList: DepoDetailModalClass[];
  vasuliDetailList: VasuliModalClass[];

}

export interface VasuliModalClass {
  mahsul_rashi: any;
  mavja_rashi: any;
  total_rashi: any;
  money_rasid_kramank_and_date: any;
  dr_number_and_month: any;
}

export interface DepoDetailModalClass {
  challan_kramank: any;
  challan_date: any;
  total_matra_in_ghan_meter: any;
  total_matra_in_sankhya: any;
  vanopaj_type: any;
  depo_name: any;
}

export interface JaptSamanDetailModal {
  japtSamanType: any;
  prajatiName: string;
  golai: string;
  lambai: string;
  ghan_meter: string;
  nag: string;
  dar: string;
  total_cost: string;
  if_other_then_detail: string;
}