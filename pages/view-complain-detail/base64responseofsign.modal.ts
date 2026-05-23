export interface Base64ResponseModal {
    response: Base64ResponseModalValue;
}

export interface Base64ResponseModalValue {
    code: number,
    msg: string,
}

export interface JaptVahanDetailInterface {
    japtinama_table_id: string;
    vahan_table_id: string;
    vahan_prakar: string;
    vahan_kramank: string,
    anumanit_mulya: string,
    malik_name: string,
    pita_ka_name: string,
    pata: string,
    tahsil: string,
    jila: string
}

export interface JaptVahanDetailInterfaceOnlyMalikDetail {
    vahan_table_id: string;
    malik_name: string,
    pita_ka_name: string,
    pata: string,
    tahsil: string,
    jila: string
}

export interface JaptVahanDetailInterfaceOnlyVahanDetail {
    vahan_table_id: string;
    vahan_prakar: string;
    vahan_kramank: string,
    anumanit_mulya: string
}

export interface SupportiveDocumentsInterface {
    document_file: File | null,
    document_title: string,
    designation_id: string
}