import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubmitVasuliViranPageComponent } from './submit-vasuli-viran-page.component';

describe('SubmitVasuliViranPageComponent', () => {
  let component: SubmitVasuliViranPageComponent;
  let fixture: ComponentFixture<SubmitVasuliViranPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitVasuliViranPageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitVasuliViranPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
