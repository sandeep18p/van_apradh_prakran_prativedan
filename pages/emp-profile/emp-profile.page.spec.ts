import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpProfilePage } from './emp-profile.page';

describe('EmpProfilePage', () => {
  let component: EmpProfilePage;
  let fixture: ComponentFixture<EmpProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
