import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceBarComponent } from './reference-bar.component';

describe('StateBarComponent', () => {
  let component: ReferenceBarComponent;
  let fixture: ComponentFixture<ReferenceBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
