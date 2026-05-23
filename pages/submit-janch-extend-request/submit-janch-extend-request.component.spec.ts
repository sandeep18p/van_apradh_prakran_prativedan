import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubmitJanchExtendRequestComponent } from './submit-janch-extend-request.component';

describe('SubmitJanchExtendRequestComponent', () => {
  let component: SubmitJanchExtendRequestComponent;
  let fixture: ComponentFixture<SubmitJanchExtendRequestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitJanchExtendRequestComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitJanchExtendRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
