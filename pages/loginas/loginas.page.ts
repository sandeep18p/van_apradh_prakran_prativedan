import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonLabel, IonRow, IonTitle, IonToolbar, IonLoading } from '@ionic/angular/standalone';
import { NgSelectModule } from '@ng-select/ng-select';
import { Preferences } from '@capacitor/preferences';
import { PreferenceKeys } from 'src/app/constants/PreferenceKeys';
import { Users } from '../login-officer/OfficerLoginResponse';
import { ApiServiceService } from 'src/app/services/apiServices/api-service.service';
import { Router } from '@angular/router';
import { Toast } from '@capacitor/toast';
import { LoginasHierarchyUserRow } from './loginas.models';

@Component({
  selector: 'app-loginas',
  templateUrl: './loginas.page.html',
  styleUrls: ['./loginas.page.scss'],
  standalone: true,
  imports: [IonLoading, IonInput, IonButton, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, NgSelectModule]
})
export class LoginasPage implements OnInit {
  constructor(
    private apiService: ApiServiceService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  isLoading = false;
  loadingMessage = 'Please wait...';

  superAdminEmpId = "";
  superAdminUser: Users | null = null;

  // geo masters
  listOfCircle: any[] = [];
  listOfDivision: any[] = [];
  listOfSubDivision: any[] = [];
  listOfRang: any[] = [];
  listOfSubRang: any[] = [];
  listOfBeat: any[] = [];

  selectedCircleId: any = null;
  selectedDivisionId: any = null;
  selectedSubDivisionId: any = null;
  selectedRangId: any = null;
  selectedSubRangId: any = null;
  selectedBeatId: any = null;

  // user lists per designation
  listCCF: LoginasHierarchyUserRow[] = [];
  listDFO: LoginasHierarchyUserRow[] = [];
  listSDO: LoginasHierarchyUserRow[] = [];
  listRO: LoginasHierarchyUserRow[] = [];
  listRA: LoginasHierarchyUserRow[] = [];  // designation 6
  listBFO: LoginasHierarchyUserRow[] = []; // designation 5

  selectedCCF: LoginasHierarchyUserRow | null = null;
  selectedDFO: LoginasHierarchyUserRow | null = null;
  selectedSDO: LoginasHierarchyUserRow | null = null;
  selectedRO: LoginasHierarchyUserRow | null = null;
  selectedRA: LoginasHierarchyUserRow | null = null;
  selectedBFO: LoginasHierarchyUserRow | null = null;

  selectedTarget: LoginasHierarchyUserRow | null = null;
  reason = '';

  async ngOnInit() {
    await this.loadSuperAdmin();
    this.loadCircles();
  }

  private async loadSuperAdmin() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginedOfficerData });
    if (!value) {
      this.router.navigateByUrl('/splash-page', { replaceUrl: true });
      return;
    }

    const user = JSON.parse(value) as Users;
    this.superAdminUser = user;
    // Ensure we never accidentally send an object as emp_id ("[object Object]")
    const rawEmpId: any = (user as any)?.emp_id;
    this.superAdminEmpId = rawEmpId === null || rawEmpId === undefined ? "" : String(rawEmpId);

    if (user.designation_id !== "7") {
      await Toast.show({ text: 'Unauthorized', duration: 'short', position: 'bottom' });
      this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
    }
  }

  private showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  private dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  loadCircles() {
    this.showDialog('Loading circles...');
    this.apiService.getCircles().subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfCircle = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });
  }

  private coerceId(value: any): any {
    // ng-select (change) may emit either the bound value OR the full object.
    if (value && typeof value === 'object') {
      if ('id' in value) return (value as any).id;
      if ('emp_id' in value) return (value as any).emp_id;
    }
    return value;
  }

  async onChangeCircle(circleId: any) {
    this.selectedCircleId = this.coerceId(circleId);
    this.resetBelow('circle');

    if (!this.selectedCircleId) return;

    this.showDialog('Loading divisions...');
    this.apiService.getDivision(String(this.selectedCircleId)).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfDivision = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });

    this.loadUsers('1'); // CCF list under circle
  }

  async onSelectCCF(user: LoginasHierarchyUserRow | null) {
    this.selectedCCF = user;
    if (user) this.selectedTarget = user;
  }

  async onChangeDivision(divisionId: any) {
    this.selectedDivisionId = this.coerceId(divisionId);
    this.resetBelow('division');
    if (!this.selectedCircleId || !this.selectedDivisionId) return;

    this.showDialog('Loading sub divisions...');
    this.apiService.getSubDivision(String(this.selectedDivisionId)).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfSubDivision = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });

    this.loadUsers('2'); // DFO list
  }

  async onSelectDFO(user: LoginasHierarchyUserRow | null) {
    this.selectedDFO = user;
    if (user) this.selectedTarget = user;
  }

  async onChangeSubDivision(subDivisionId: any) {
    this.selectedSubDivisionId = this.coerceId(subDivisionId);
    this.resetBelow('subDivision');
    if (!this.selectedCircleId || !this.selectedDivisionId || !this.selectedSubDivisionId) return;

    this.showDialog('Loading ranges...');
    this.apiService.getRang(String(this.selectedSubDivisionId)).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfRang = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });

    this.loadUsers('3'); // SDO list
  }

  async onSelectSDO(user: LoginasHierarchyUserRow | null) {
    this.selectedSDO = user;
    if (user) this.selectedTarget = user;
  }

  async onChangeRange(rangeId: any) {
    this.selectedRangId = this.coerceId(rangeId);
    this.resetBelow('range');
    if (!this.selectedCircleId || !this.selectedDivisionId || !this.selectedSubDivisionId || !this.selectedRangId) return;

    this.showDialog('Loading sub ranges...');
    this.apiService.getSubRang(String(this.selectedRangId)).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfSubRang = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });

    this.loadUsers('4'); // RO list
  }

  async onSelectRO(user: LoginasHierarchyUserRow | null) {
    this.selectedRO = user;
    if (user) this.selectedTarget = user;
  }

  async onChangeSubRange(subRangeId: any) {
    this.selectedSubRangId = this.coerceId(subRangeId);
    this.resetBelow('subRange');
    if (!this.selectedCircleId || !this.selectedDivisionId || !this.selectedSubDivisionId || !this.selectedRangId || !this.selectedSubRangId) return;

    this.showDialog('Loading beats...');
    this.apiService.getBeat(String(this.selectedSubRangId)).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code === 200) {
          this.listOfBeat = res.data ?? [];
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });

    this.loadUsers('6'); // RA (Deputy Ranger) list under sub-range
  }

  async onSelectRA(user: LoginasHierarchyUserRow | null) {
    this.selectedRA = user;
    if (user) this.selectedTarget = user;
  }

  async onChangeBeat(beatId: any) {
    this.selectedBeatId = this.coerceId(beatId);
    this.resetBelow('beat');
    if (!this.selectedCircleId || !this.selectedDivisionId || !this.selectedSubDivisionId || !this.selectedRangId || !this.selectedSubRangId || !this.selectedBeatId) return;

    this.loadUsers('5'); // BFO list under beat
  }

  async onSelectBFO(user: LoginasHierarchyUserRow | null) {
    this.selectedBFO = user;
    if (user) this.selectedTarget = user;
  }

  private resetBelow(level: 'circle' | 'division' | 'subDivision' | 'range' | 'subRange' | 'beat') {
    // reset geo lists/selections below current level
    if (level === 'circle') {
      this.selectedDivisionId = null; this.listOfDivision = [];
    }
    if (level === 'circle' || level === 'division') {
      this.selectedSubDivisionId = null; this.listOfSubDivision = [];
    }
    if (level === 'circle' || level === 'division' || level === 'subDivision') {
      this.selectedRangId = null; this.listOfRang = [];
    }
    if (level === 'circle' || level === 'division' || level === 'subDivision' || level === 'range') {
      this.selectedSubRangId = null; this.listOfSubRang = [];
    }
    if (level === 'circle' || level === 'division' || level === 'subDivision' || level === 'range' || level === 'subRange') {
      this.selectedBeatId = null; this.listOfBeat = [];
    }

    // reset user lists below
    if (level === 'circle') { this.listCCF = []; this.selectedCCF = null; }
    if (level === 'circle' || level === 'division') { this.listDFO = []; this.selectedDFO = null; }
    if (level === 'circle' || level === 'division' || level === 'subDivision') { this.listSDO = []; this.selectedSDO = null; }
    if (level === 'circle' || level === 'division' || level === 'subDivision' || level === 'range') { this.listRO = []; this.selectedRO = null; }
    if (level === 'circle' || level === 'division' || level === 'subDivision' || level === 'range' || level === 'subRange') { this.listRA = []; this.selectedRA = null; }
    if (level === 'circle' || level === 'division' || level === 'subDivision' || level === 'range' || level === 'subRange' || level === 'beat') { this.listBFO = []; this.selectedBFO = null; }

    if (level !== 'beat') {
      // keep target if it is at/above current level, else clear
      this.selectedTarget = this.selectedTarget; // no-op for now
    }
  }

  private loadUsers(nextDesignationId: string) {
    this.showDialog('Loading officers...');
    this.apiService.loginasHierarchyUsers(
      this.superAdminEmpId,
      nextDesignationId,
      String(this.selectedCircleId ?? ""),
      String(this.selectedDivisionId ?? ""),
      String(this.selectedSubDivisionId ?? ""),
      String(this.selectedRangId ?? ""),
      String(this.selectedSubRangId ?? ""),
      String(this.selectedBeatId ?? "")
    ).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code !== 200) {
          await Toast.show({ text: res?.response?.msg || 'Problem to get data', duration: 'short', position: 'bottom' });
          return;
        }
        const data = (res?.data ?? []) as LoginasHierarchyUserRow[];
        if (nextDesignationId === '1') this.listCCF = data;
        if (nextDesignationId === '2') this.listDFO = data;
        if (nextDesignationId === '3') this.listSDO = data;
        if (nextDesignationId === '4') this.listRO = data;
        if (nextDesignationId === '6') this.listRA = data; // RA (Deputy Ranger)
        if (nextDesignationId === '5') this.listBFO = data; // BFO (Beat Officer)
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });
  }

  async loginAsSelected() {
    if (!this.selectedTarget) {
      await Toast.show({ text: 'Please select an officer', duration: 'short', position: 'bottom' });
      return;
    }

    // persist impersonator so we can exit later
    const { value } = await Preferences.get({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    if (!value && this.superAdminUser) {
      await Preferences.set({ key: PreferenceKeys.loginasImpersonatorOfficerData, value: JSON.stringify(this.superAdminUser) });
    }

    this.showDialog('Logging in...');
    this.apiService.loginasImpersonate(this.superAdminEmpId, this.selectedTarget.user_name, this.reason).subscribe({
      next: async (res) => {
        this.dismissDialog();
        if (res?.response?.code !== 200) {
          await Toast.show({ text: res?.response?.msg || 'Login as failed', duration: 'short', position: 'bottom' });
          return;
        }
        const user = res?.data?.[0];
        if (!user) {
          await Toast.show({ text: 'Invalid response', duration: 'short', position: 'bottom' });
          return;
        }

        await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(user) });

        if (String(user.designation_id) === "7") {
          this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/officer-dashboard', { replaceUrl: true });
        }
      },
      error: async () => {
        this.dismissDialog();
        await Toast.show({ text: 'Server not responding', duration: 'short', position: 'bottom' });
      }
    });
  }

  async exitLoginAs() {
    const { value } = await Preferences.get({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    if (!value) {
      await Toast.show({ text: 'No impersonation active', duration: 'short', position: 'bottom' });
      return;
    }
    const original = JSON.parse(value) as Users;
    await Preferences.set({ key: PreferenceKeys.loginedOfficerData, value: JSON.stringify(original) });
    await Preferences.remove({ key: PreferenceKeys.loginasImpersonatorOfficerData });
    this.router.navigateByUrl('/admin-officer-dashboard', { replaceUrl: true });
  }
}

