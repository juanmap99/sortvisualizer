import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapsModalComponent } from './heaps-modal.component';

describe('HeapsModalComponent', () => {
  let component: HeapsModalComponent;
  let fixture: ComponentFixture<HeapsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeapsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeapsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
