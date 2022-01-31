import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergesModalComponent } from './merges-modal.component';

describe('MergesModalComponent', () => {
  let component: MergesModalComponent;
  let fixture: ComponentFixture<MergesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MergesModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
