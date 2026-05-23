import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewComplainDetailPage } from './view-complain-detail.page2';

describe('ViewComplainDetailPage', () => {
  let component: ViewComplainDetailPage;
  let fixture: ComponentFixture<ViewComplainDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewComplainDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
