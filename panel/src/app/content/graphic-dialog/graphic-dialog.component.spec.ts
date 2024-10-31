import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphicDialogComponent } from './graphic-dialog.component';

describe('GraphicDialogComponent', () => {
  let component: GraphicDialogComponent;
  let fixture: ComponentFixture<GraphicDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphicDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GraphicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
