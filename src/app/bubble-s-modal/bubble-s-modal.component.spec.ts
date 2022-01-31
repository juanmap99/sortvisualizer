import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleSModalComponent } from './bubble-s-modal.component';

describe('BubbleSModalComponent', () => {
  let component: BubbleSModalComponent;
  let fixture: ComponentFixture<BubbleSModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BubbleSModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleSModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
