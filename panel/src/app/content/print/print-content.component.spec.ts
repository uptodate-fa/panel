import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintContentComponent } from './print-content.component';

describe('PrintContentComponent', () => {
  let component: PrintContentComponent;
  let fixture: ComponentFixture<PrintContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
