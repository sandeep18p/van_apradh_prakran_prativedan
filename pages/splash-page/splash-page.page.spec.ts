import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplashPagePage } from './splash-page.page';

describe('SplashPagePage', () => {
  let component: SplashPagePage;
  let fixture: ComponentFixture<SplashPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
