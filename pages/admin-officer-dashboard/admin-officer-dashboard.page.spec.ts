import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficerDashboardPage } from './officer-dashboard.page';

describe('OfficerDashboardPage', () => {
  let component: OfficerDashboardPage;
  let fixture: ComponentFixture<OfficerDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficerDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
