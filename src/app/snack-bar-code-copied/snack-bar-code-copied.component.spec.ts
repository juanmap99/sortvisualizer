import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackBarCodeCopiedComponent } from './snack-bar-code-copied.component';

describe('SnackBarCodeCopiedComponent', () => {
  let component: SnackBarCodeCopiedComponent;
  let fixture: ComponentFixture<SnackBarCodeCopiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackBarCodeCopiedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackBarCodeCopiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
