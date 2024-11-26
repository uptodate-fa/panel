import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationCodeTableComponent } from './table.component';

describe('ActivationCodeTableComponent', () => {
  let component: ActivationCodeTableComponent;
  let fixture: ComponentFixture<ActivationCodeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationCodeTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivationCodeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
