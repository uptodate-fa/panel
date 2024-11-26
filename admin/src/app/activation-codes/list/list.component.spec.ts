import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationCodesListComponent } from './list.component';

describe('ActivationCodesListComponent', () => {
  let component: ActivationCodesListComponent;
  let fixture: ComponentFixture<ActivationCodesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationCodesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivationCodesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
