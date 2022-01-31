import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertionSModalComponent } from './insertion-s-modal.component';

describe('InsertionSModalComponent', () => {
  let component: InsertionSModalComponent;
  let fixture: ComponentFixture<InsertionSModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertionSModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertionSModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
