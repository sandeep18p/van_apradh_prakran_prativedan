import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddComplainPage } from './add-complain.page';

describe('AddComplainPage', () => {
  let component: AddComplainPage;
  let fixture: ComponentFixture<AddComplainPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComplainPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
