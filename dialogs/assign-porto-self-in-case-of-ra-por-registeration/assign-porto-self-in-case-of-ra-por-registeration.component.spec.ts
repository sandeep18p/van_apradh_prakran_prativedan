import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssignPORToSelfInCaseOfRAPORRegisterationComponent } from './assign-porto-self-in-case-of-ra-por-registeration.component';

describe('AssignPORToSelfInCaseOfRAPORRegisterationComponent', () => {
  let component: AssignPORToSelfInCaseOfRAPORRegisterationComponent;
  let fixture: ComponentFixture<AssignPORToSelfInCaseOfRAPORRegisterationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignPORToSelfInCaseOfRAPORRegisterationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignPORToSelfInCaseOfRAPORRegisterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
