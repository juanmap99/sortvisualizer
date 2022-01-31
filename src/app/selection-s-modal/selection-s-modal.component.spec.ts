import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionSModalComponent } from './selection-s-modal.component';

describe('SelectionSModalComponent', () => {
  let component: SelectionSModalComponent;
  let fixture: ComponentFixture<SelectionSModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectionSModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionSModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
