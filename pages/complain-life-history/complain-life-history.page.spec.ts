import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplainLifeHistoryPage } from './complain-life-history.page';

describe('ComplainLifeHistoryPage', () => {
  let component: ComplainLifeHistoryPage;
  let fixture: ComponentFixture<ComplainLifeHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplainLifeHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
