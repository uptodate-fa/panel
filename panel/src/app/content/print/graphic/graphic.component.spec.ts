import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintGraphicComponent } from './graphic.component';

describe('PrintGraphicComponent', () => {
  let component: PrintGraphicComponent;
  let fixture: ComponentFixture<PrintGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintGraphicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
