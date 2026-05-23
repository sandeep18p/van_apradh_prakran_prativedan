import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewOneOfflineDataDetailComponent } from './view-one-offline-data-detail.component';

describe('ViewOneOfflineDataDetailComponent', () => {
  let component: ViewOneOfflineDataDetailComponent;
  let fixture: ComponentFixture<ViewOneOfflineDataDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOneOfflineDataDetailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewOneOfflineDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
