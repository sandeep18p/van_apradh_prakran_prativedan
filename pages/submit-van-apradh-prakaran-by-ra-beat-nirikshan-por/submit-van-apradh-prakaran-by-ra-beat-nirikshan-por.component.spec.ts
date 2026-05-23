import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubmitVanApradhPrakaranByRaComponent } from './submit-van-apradh-prakaran-by-ra.component';

describe('SubmitVanApradhPrakaranByRaComponent', () => {
  let component: SubmitVanApradhPrakaranByRaComponent;
  let fixture: ComponentFixture<SubmitVanApradhPrakaranByRaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitVanApradhPrakaranByRaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitVanApradhPrakaranByRaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
