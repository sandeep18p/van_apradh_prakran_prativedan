import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginOfficerPage } from './login-officer.page';

describe('LoginOfficerPage', () => {
  let component: LoginOfficerPage;
  let fixture: ComponentFixture<LoginOfficerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginOfficerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
