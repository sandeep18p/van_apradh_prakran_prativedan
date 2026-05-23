import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowSubmitedRequestToExtendJanchAwadhiComponent } from './show-submited-request-to-extend-janch-awadhi.component';

describe('ShowSubmitedRequestToExtendJanchAwadhiComponent', () => {
  let component: ShowSubmitedRequestToExtendJanchAwadhiComponent;
  let fixture: ComponentFixture<ShowSubmitedRequestToExtendJanchAwadhiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowSubmitedRequestToExtendJanchAwadhiComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowSubmitedRequestToExtendJanchAwadhiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
