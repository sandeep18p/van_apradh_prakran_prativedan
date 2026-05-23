import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  private sqliteConnection: SQLiteConnection;
  private db!: SQLiteDBConnection;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB(): Promise<void> {
    let db: SQLiteDBConnection;
    const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

    if (isConn.result) {
      db = await this.sqliteConnection.retrieveConnection('offline_crime_db', false);
    } else {
      this.db = await this.sqliteConnection.createConnection(
        'offline_crime_db',
        false,
        'no-encryption',
        1, false
      );
    }

    await this.db.open();

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS por_detail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complainer_name TEXT,
        complainer_pad TEXT,
        mark_image_ankit_on_japt_saman TEXT,
        japtinama_any_vishesh_vivran TEXT,
        isAccusedFound TEXT,
        accusedName TEXT,
        accusedFathersName TEXT,
        accusedCast TEXT,
        accusedAddress TEXT,
        typeOfCrime TEXT,
        placeOfCrime TEXT,
        dateOfCrime TEXT,
        detailsOfSeizedGoods TEXT,
        name_of_witness_one TEXT,
        name_of_witness_two TEXT,
        address_of_witness_one TEXT,
        address_of_witness_two TEXT,
        sign_of_witness_one TEXT,
        sign_of_witness_two TEXT,
        createdBy TEXT,
        circle_id TEXT,
        division_id TEXT,
        sub_division_id TEXT,
        range_id TEXT,
        sub_rang_id TEXT,
        beat_id TEXT,
        compartment_number TEXT,
        crime_dhara TEXT,
        por_number TEXT,
        lat TEXT,
        lng TEXT,
        map_address TEXT,
        photo_name_comma_separated TEXT,
        saman_detail TEXT,
        japti_nama_photo TEXT,
        supurd_nama_photo TEXT,
        panch_nama_photo TEXT,
        apradhi_photo TEXT,
        por_photo TEXT,
        complainer_sign TEXT,
        is_supurddar_and_japtikarta_same TEXT,
        supurdar_ka_name TEXT,
        supurdar_ka_father TEXT,
        supurdar_ka_jati TEXT,
        supurdar_ka_vyavsay TEXT,
        supurdar_ka_poora_pata TEXT,
        supurdar_me_lene_ka_date TEXT,
        supurddar_sign TEXT,
        japtikarta_ka_name TEXT,
        japtikarta_ka_pad TEXT,
        is_beat_nirikshan TEXT,
        accusedAge TEXT
      );
    `);

    //ADDEDHTML
    // Add the new accused persons table
    await this.db.execute(`
    CREATE TABLE IF NOT EXISTS accused_persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      por_detail_id INTEGER,
      accused_name TEXT,
      accused_fathers_name TEXT,
      accused_cast TEXT,
      accused_address TEXT,
      signature_image TEXT,
      age TEXT,
      jati_name TEXT,
      mobile_number TEXT,
      FOREIGN KEY (por_detail_id) REFERENCES por_detail (id)
    );
  `);


    //ADDEDHTML
    // Add the new accused persons table
    await this.db.execute(`
    CREATE TABLE IF NOT EXISTS vahan_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vahan_prakar TEXT,
      vahan_kramank TEXT,
      anumanit_mulya TEXT,
      malik_ka_name TEXT,
      malik_k_father_ka_name TEXT,
      pata TEXT,
      tahsil TEXT,
      jila TEXT,
      por_table_id TEXT
    );
  `);


  }



  async updatePORData(
    dateOfCrime: string,
    por_number: string,
    compartment_number: string,
    isAccusedFound: string,
    accusedName: string,
    accusedFathersName: string,
    accusedAddress: string,
    accusedCast: string,
    typeOfCrime: string,
    crime_dhara: string,
    name_of_witness_one: string,
    name_of_witness_two: string,
    address_of_witness_one: string,
    address_of_witness_two: string,
    placeOfCrime: string,
    saman_detail: string,
    detailsOfSeizedGoods: string,
    japti_nama_photo: string,
    supurd_nama_photo: string,
    panch_nama_photo: string,
    photo_name_comma_separated: string,
    id: number,
    complainer_name: string,
    apradhi_ka_photo: string,
    por_photo: string,
    complainer_sign: string,
    complainer_pad: string,
    mark_image_ankit_on_japt_saman: string,
    japtinama_any_vishesh_vivran: string,
    is_supurddar_and_japtikarta_same: string,
    supurdar_ka_name: string,
    supurdar_ka_father: string,
    supurdar_ka_jati: string,
    supurdar_ka_vyavsay: string,
    supurdar_ka_poora_pata: string,
    supurdar_me_lene_ka_date: string,
    witness1Sign: string,
    witness2Sign: string,
    supurddar_sign: string,
    japtikarta_ka_name: string,
    japtikarta_ka_pad: string,
    is_beat_nirikshan: string,
    accusedAge: string,
  ): Promise<boolean> {
    try {
      const isConn = await this.sqliteConnection.isConnection(
        'offline_crime_db',
        false
      );

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection(
          'offline_crime_db',
          false,
          'no-encryption',
          1,
          false
        );

      await db.open(); // open connection

      const query = `
      UPDATE por_detail 
      SET accusedAge = ?, is_beat_nirikshan = ?, isAccusedFound = ?, accusedName = ?, accusedFathersName = ?, accusedCast = ?, accusedAddress = ?, 
          typeOfCrime = ?, placeOfCrime = ?, dateOfCrime = ?, detailsOfSeizedGoods = ?, 
          name_of_witness_one = ?, name_of_witness_two = ?, address_of_witness_one = ?, address_of_witness_two = ?, 
          compartment_number = ?, crime_dhara = ?, por_number = ?, photo_name_comma_separated = ?, 
          saman_detail = ?, japti_nama_photo = ?, supurd_nama_photo = ?, panch_nama_photo = ?, complainer_name = ? , apradhi_photo = ? , por_photo = ? , complainer_sign = ?, complainer_pad = ?, mark_image_ankit_on_japt_saman = ?, japtinama_any_vishesh_vivran = ?, is_supurddar_and_japtikarta_same = ?, supurdar_ka_name = ?,supurdar_ka_father = ?, supurdar_ka_jati = ?, supurdar_ka_vyavsay = ?, supurdar_ka_poora_pata = ?, supurdar_me_lene_ka_date = ?, sign_of_witness_one = ?, sign_of_witness_two = ?, supurddar_sign = ?, japtikarta_ka_name = ?, japtikarta_ka_pad = ?  WHERE id = ?; `;

      const values = [
        accusedAge, is_beat_nirikshan, isAccusedFound, accusedName, accusedFathersName, accusedCast, accusedAddress,
        typeOfCrime, placeOfCrime, dateOfCrime, detailsOfSeizedGoods,
        name_of_witness_one, name_of_witness_two, address_of_witness_one, address_of_witness_two,
        compartment_number, crime_dhara, por_number, photo_name_comma_separated,
        saman_detail, japti_nama_photo, supurd_nama_photo, panch_nama_photo,
        complainer_name, apradhi_ka_photo, por_photo, complainer_sign, complainer_pad, mark_image_ankit_on_japt_saman, japtinama_any_vishesh_vivran, is_supurddar_and_japtikarta_same, supurdar_ka_name, supurdar_ka_father, supurdar_ka_jati, supurdar_ka_vyavsay, supurdar_ka_poora_pata, supurdar_me_lene_ka_date, witness1Sign, witness2Sign, supurddar_sign, japtikarta_ka_name, japtikarta_ka_pad, id   // 👈 moved id to the last position
      ];

      const result = await db.run(query, values);

      const changes =
        typeof result.changes === 'number'
          ? result.changes
          : result.changes?.changes ?? 0;

      if (changes > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  //AddedHTML
  // Add this method to insert accused person
  //Code Added by sandeep start 1 method for accused person inserting multiple accused persons
  async insertAccusedPerson(
    porDetailId: number,
    accusedName: string,
    accusedFathersName: string,
    accusedCast: string,
    accusedAddress: string,
    signatureImage: string,
    age: string,
    jati_name: string,
    mobile_number: string
  ): Promise<void> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const query = `
        INSERT INTO accused_persons (
          por_detail_id, accused_name, accused_fathers_name, accused_cast, accused_address, signature_image , age, jati_name, mobile_number
        )     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

      const values = [porDetailId, accusedName, accusedFathersName, accusedCast, accusedAddress, signatureImage, age, jati_name, mobile_number];

      await db.run(query, values);
    } catch (error) {
      throw error;
    }
  }


  async deleteVahanDetailByPorId(porDetailId: number): Promise<boolean> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const result = await db.run(`DELETE FROM vahan_detail WHERE por_table_id = ?`, [porDetailId]);

      const deleteCount = (result as any)?.changes?.changes ?? 0;
      return deleteCount > 0;
    } catch (error) {
      return false;
    }
  }

  async insertMultipleVahanDetail(
    porDetailId: number,
    vahanDetailArray: Array<{
      vahan_prakar: string;
      vahan_kramank: string;
      anumanit_mulya: string;
      malik_ka_name: string;
      malik_k_father_ka_name: string,
      pata: string,
      tahsil: string,
      jila: string
    }>
  ): Promise<void> {
     ;
    try {
      for (const vahanModal of vahanDetailArray) {
        await this.insertVahanDetail(
          porDetailId,
          vahanModal.vahan_prakar,
          vahanModal.vahan_kramank,
          vahanModal.anumanit_mulya,
          vahanModal.malik_ka_name,
          vahanModal.malik_k_father_ka_name,
          vahanModal.pata,
          vahanModal.tahsil,
          vahanModal.jila
        );
      }

    } catch (error) {
      throw error;
    }
  }


  async insertVahanDetail(
    porDetailId: number,
    vahan_prakar: string,
    vahan_kramank: string,
    anumanit_mulya: string,
    malik_ka_name: string,
    malik_k_father_ka_name: string,
    pata: string,
    tahsil: string,
    jila: string
  ): Promise<void> {

     ;
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const query = `
        INSERT INTO vahan_detail (
          vahan_prakar, vahan_kramank, anumanit_mulya, malik_ka_name, malik_k_father_ka_name, pata , tahsil, jila, por_table_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

      const values = [vahan_prakar, vahan_kramank, anumanit_mulya, malik_ka_name, malik_k_father_ka_name, pata, tahsil, jila, porDetailId];

      await db.run(query, values);
    } catch (error) {
      throw error;
    }

  }

  async getVahanDetailByPorId(porDetailId: number): Promise<{
    id: number,
    vahan_prakar: string,
    vahan_kramank: string,
    anumanit_mulya: string,
    malik_ka_name: string,
    malik_k_father_ka_name: string,
    pata: string,
    tahsil: string,
    jila: string,
    por_table_id: string
  }[]> {
    try {
       ;
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const result = await db.query(`SELECT * FROM vahan_detail WHERE por_table_id = ?`, [porDetailId]);
      return result.values ?? [];
    } catch (error) {
      return [];
    }
  }


  //Major code added by sandeep pansari start 1 Date 9 28 25

  async clearAccusedFieldsInPorDetail(porDetailId: number): Promise<void> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const query = `UPDATE por_detail SET accusedName = '', accusedFathersName = '', accusedCast = '', accusedAddress = '' WHERE id = ?`;
      await db.run(query, [porDetailId]);

    } catch (error) {
      throw error;
    }
  }

  async updateAccusedFieldsInPorDetail(
    porDetailId: number,
    accusedName: string,
    accusedFathersName: string,
    accusedCast: string,
    accusedAddress: string,
    age: string,
    jati_name: string,
    mobile_number: string
  ): Promise<void> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const query = `UPDATE por_detail SET accusedAge = ?, accusedName = ?, accusedFathersName = ?, accusedCast = ?, accusedAddress = ?, age = ?, jati_name = ?, mobile_number = ?  WHERE id = ?`;
      const values = [age, accusedName, accusedFathersName, accusedCast, accusedAddress, age, jati_name, mobile_number, porDetailId];

      await db.run(query, values);
    } catch (error) {
      throw error;
    }
  }

  // Insert multiple accused persons
  async insertMultipleAccusedPersons(
    porDetailId: number,
    accusedPersons: Array<{
      name: string;
      fathersName: string;
      cast: number;
      address: string;
      signatureImage: string,
      age: string,
      jati_name: string,
      mobile_number: string
    }>
  ): Promise<void> {
    try {
      for (const person of accusedPersons) {
        await this.insertAccusedPerson(
          porDetailId,
          person.name,
          person.fathersName,
          person.cast.toString(),
          person.address,
          person.signatureImage,
          person.age,
          person.jati_name,
          person.mobile_number
        );
      }

    } catch (error) {
      throw error;
    }
  }


  //Major code added by sandeep end 1 Date 9 28 25



  //Code Added by sandeep end 1 method for accused person
  //AddedHTML DELETE 
  //code added by sandeep
  async deleteAccusedPersonsByPorId(porDetailId: number): Promise<boolean> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const result = await db.run(`DELETE FROM accused_persons WHERE por_detail_id = ?`, [porDetailId]);

      const deleteCount = (result as any)?.changes?.changes ?? 0;
      return deleteCount > 0;
    } catch (error) {
      return false;
    }
  }
  //code added by sandeep


  // Add this method to get POR ID by POR number AddedHTML
  //Code Added by sandeep start 2 method for accused person
  async getPorIdByPorNumber(porNumber: string): Promise<number | null> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const result = await db.query(`SELECT id FROM por_detail WHERE por_number = ?`, [porNumber]);

      if (result.values && result.values.length > 0) {
        return result.values[0].id;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
  //Code Added by sandeep end 2 method for accused person

  async insertPorData(
    complainer_name: string,
    isAccusedFound: string,
    accusedName: string,
    accusedFathersName: string,
    accusedCast: string,
    accusedAddress: string,
    typeOfCrime: string,
    placeOfCrime: string,
    dateOfCrime: string,
    detailsOfSeizedGoods: string,
    name_of_witness_one: string,
    name_of_witness_two: string,
    address_of_witness_one: string,
    address_of_witness_two: string,
    createdBy: string,
    circle_id: string,
    division_id: string,
    sub_division_id: string,
    range_id: string,
    sub_rang_id: string,
    beat_id: string,
    compartment_number: string,
    crime_dhara: string,
    por_number: string,
    lat: string,
    lng: string,
    map_address: string,
    photo_name_comma_separated: string,
    saman_detail: string,
    japti_nama_photo: string,
    panch_nama_photo: string,
    apradhi_photo: string,
    por_photo: string,
    complainer_sign: string,
    complainer_pad: string,
    mark_image_ankit_on_japt_saman: string,
    japtinama_any_vishesh_vivran: string,
    witness1Sign: string,
    witness2Sign: string,
    japtikarta_ka_name: string,
    japtikarta_ka_pad: string,
    is_beat_nirikshan: string
  ): Promise<void> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open(); // VERY IMPORTANT

      const query = `
      INSERT INTO por_detail (is_beat_nirikshan, complainer_name,
      isAccusedFound,
        accusedName, accusedFathersName, accusedCast, accusedAddress,
        typeOfCrime, placeOfCrime, dateOfCrime, detailsOfSeizedGoods,
        name_of_witness_one, name_of_witness_two,
        address_of_witness_one, address_of_witness_two,
        createdBy, circle_id, division_id, sub_division_id,
        range_id, sub_rang_id, beat_id, compartment_number,
        crime_dhara, por_number, lat, lng, map_address,
        photo_name_comma_separated, saman_detail, japti_nama_photo, panch_nama_photo, apradhi_photo,
        por_photo, complainer_sign, complainer_pad, mark_image_ankit_on_japt_saman, japtinama_any_vishesh_vivran,
          sign_of_witness_one , sign_of_witness_two, japtikarta_ka_name, japtikarta_ka_pad
      )
      VALUES (?,?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

      const values = [
        is_beat_nirikshan,
        complainer_name,
        isAccusedFound,
        accusedName, accusedFathersName, accusedCast, accusedAddress,
        typeOfCrime, placeOfCrime, dateOfCrime, detailsOfSeizedGoods,
        name_of_witness_one, name_of_witness_two,
        address_of_witness_one, address_of_witness_two,
        createdBy, circle_id, division_id, sub_division_id,
        range_id, sub_rang_id, beat_id, compartment_number,
        crime_dhara, por_number, lat, lng, map_address,
        photo_name_comma_separated, saman_detail, japti_nama_photo, panch_nama_photo, apradhi_photo,
        por_photo,
        complainer_sign, complainer_pad, mark_image_ankit_on_japt_saman, japtinama_any_vishesh_vivran,
        witness1Sign, witness2Sign, japtikarta_ka_name, japtikarta_ka_pad
      ];
       ;
      await db.run(query, values);

    } catch (error) {
       ;
    }

  }



  // Add this method to get all accused persons for a POR AddedHTML
  //Code Added by sandeep start 3 method for accused person
  async getAccusedPersonsByPorId(porDetailId: number): Promise<{
    id: number,
    por_detail_id: number,
    accused_name: string,
    accused_fathers_name: string,
    accused_cast: string,
    accused_address: string,
    signature_image: string,
    age: string,
    jati_name: string,
    mobile_number: string
  }[]> {
    try {
      const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

      const db = isConn.result
        ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
        : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

      await db.open();

      const result = await db.query(`SELECT * FROM accused_persons WHERE por_detail_id = ?`, [porDetailId]);
      return result.values ?? [];
    } catch (error) {
      return [];
    }
  }
  //Code Added by sandeep end 3 method for accused person


  async deletePorDetailByPorNumber(por_number: string): Promise<boolean> {
    const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);
    const db = isConn.result
      ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
      : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

    await db.open(); // VERY IMPORTANT

    // const deleteCount = (result as any)?.changes?.changes ?? 0;

    // // Safely check if rows were affected
    // return deleteCount > 0;
    try {
      // Step 1: Get the POR ID first
      const porResult = await db.query(`SELECT id FROM por_detail WHERE por_number = ?`, [por_number]);

      if (!porResult.values || porResult.values.length === 0) {
        return false;
      }

      const porId = porResult.values[0].id;

      // Step 2: Delete related accused persons first (to avoid foreign key constraint)
      await db.run(`DELETE FROM accused_persons WHERE por_detail_id = ?`, [porId]);

      // Step 3: Now delete the main POR record
      const result = await db.run(`DELETE FROM por_detail WHERE por_number = ?`, [por_number]);

      const deleteCount = (result as any)?.changes?.changes ?? 0;

      return deleteCount > 0;

    } catch (error) {
      throw error;
    }
  }

  async deletePorDetailById(id: number): Promise<boolean> {
    const isConn = await this.sqliteConnection.isConnection('offline_crime_db', false);

    const db = isConn.result
      ? await this.sqliteConnection.retrieveConnection('offline_crime_db', false)
      : await this.sqliteConnection.createConnection('offline_crime_db', false, 'no-encryption', 1, false);

    await db.open(); // VERY IMPORTANT

    const result = await db.run(`DELETE FROM por_detail WHERE id = ?`, [id]);

    const deleteCount = (result as any)?.changes?.changes ?? 0;

    // Safely check if rows were affected
    return deleteCount > 0;
  }

  async getPorData(): Promise<{
    id: number,
    isAccusedFound: string,
    accusedName: string,
    accusedFathersName: string,
    accusedCast: string,
    accusedAddress: string,
    typeOfCrime: string,
    placeOfCrime: string,
    dateOfCrime: string,
    detailsOfSeizedGoods: string,
    name_of_witness_one: string,
    name_of_witness_two: string,
    address_of_witness_one: string,
    address_of_witness_two: string,
    createdBy: string,
    circle_id: string,
    division_id: string,
    sub_division_id: string,
    range_id: string,
    sub_rang_id: string,
    beat_id: string,
    compartment_number: string,
    crime_dhara: string,
    por_number: string,
    lat: string,
    lng: string,
    map_address: string,
    photo_name_comma_separated: string,
    full_photo_name_comma_separated: string,
    saman_detail: string,
    panch_nama_photo: string,
    japti_nama_photo: string,
    supurd_nama_photo: string,
    complainer_name: string,
    apradhi_photo: string,
    por_photo: string,
    complainer_sign: string,
    complainer_pad: string,
    sign_of_witness_one: string,
    sign_of_witness_two: string,
    mark_image_ankit_on_japt_saman: string,
    is_supurddar_and_japtikarta_same: string,
    supurdar_ka_name: string,
    supurdar_ka_father: string,
    supurdar_ka_jati: string,
    supurdar_ka_vyavsay: string,
    supurdar_ka_poora_pata: string,
    supurdar_me_lene_ka_date: string,
    japtinama_any_vishesh_vivran: string,
    supurddar_sign: string,
    japtikarta_ka_name: string,
    japtikarta_ka_pad: string,
    is_beat_nirikshan: string
  }[]> {
    const result = await this.db.query(`SELECT id, 
                isAccusedFound,
                (CASE  WHEN isAccusedFound = 0 THEN 'अज्ञात' ELSE accusedName  END) AS accusedName,
	            (CASE WHEN isAccusedFound = 0 THEN 'अज्ञात' ELSE accusedFathersName  END) AS accusedFathersName,
	            (CASE  WHEN isAccusedFound = 0 THEN 'अज्ञात' ELSE accusedFathersName  END) AS accusedFathersName,
                (CASE WHEN isAccusedFound = 0 THEN '0' ELSE accusedCast END)  AS accusedCast,
	            (CASE WHEN isAccusedFound = 0 THEN 'अज्ञात' ELSE accusedAddress END) AS accusedAddress,
                typeOfCrime, placeOfCrime, dateOfCrime, detailsOfSeizedGoods,
                name_of_witness_one, name_of_witness_two,
                photo_name_comma_separated,
                address_of_witness_one, address_of_witness_two,
                createdBy, circle_id, division_id, sub_division_id,
                range_id, sub_rang_id, beat_id, compartment_number,
                crime_dhara, por_number, lat, lng, map_address,
                saman_detail, japti_nama_photo, supurd_nama_photo, panch_nama_photo, por_detail.photo_name_comma_separated as full_photo_name_comma_separated, complainer_name, apradhi_photo, por_photo, complainer_sign, complainer_pad, sign_of_witness_one, sign_of_witness_two, 
                mark_image_ankit_on_japt_saman, is_supurddar_and_japtikarta_same, supurdar_ka_name, supurdar_ka_father, supurdar_ka_jati, supurdar_ka_vyavsay, supurdar_ka_poora_pata, supurdar_me_lene_ka_date, japtinama_any_vishesh_vivran, supurddar_sign, japtikarta_ka_name, japtikarta_ka_pad, is_beat_nirikshan  FROM por_detail`);
    return result.values ?? [];
  }

  async checkPorExists(porNumber: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM por_detail WHERE por_number = ?`;
    const result = await this.db.query(query, [porNumber]);
    return result.values?.[0]?.count > 0;
  }

  async checkPorExistsUsingIdAlso(porNumber: string, id: Number): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM por_detail WHERE por_number = ? and id != ?`;
    const result = await this.db.query(query, [porNumber, id]);
    return result.values?.[0]?.count > 0;
  }

  async getSinglePorData(): Promise<{
    accusedName: string,
    accusedFathersName: string,
    accusedCast: string,
    accusedAddress: string,
    typeOfCrime: string,
    placeOfCrime: string,
    dateOfCrime: string,
    detailsOfSeizedGoods: string,
    name_of_witness_one: string,
    name_of_witness_two: string,
    address_of_witness_one: string,
    address_of_witness_two: string,
    createdBy: string,
    circle_id: string,
    division_id: string,
    sub_division_id: string,
    range_id: string,
    sub_rang_id: string,
    beat_id: string,
    compartment_number: string,
    crime_dhara: string,
    por_number: string,
    lat: string,
    lng: string,
    map_address: string,
    photo_name_comma_separated: string
  }[]> {
    const result = await this.db.query(`SELECT * FROM por_detail LIMIT 1`);
    return result.values ?? [];
  }

  async closeDB(): Promise<void> {
    await this.sqliteConnection.closeConnection('offline_crime_db', false);
  }

}
