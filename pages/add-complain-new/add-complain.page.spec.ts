import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddComplainNewPage } from './add-complain.page';

describe('AddComplainNewPage', () => {
  let component: AddComplainNewPage;
  let fixture: ComponentFixture<AddComplainNewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComplainNewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
