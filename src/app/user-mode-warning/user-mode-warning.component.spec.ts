import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserModeWarningComponent } from './user-mode-warning.component';

describe('UserModeWarningComponent', () => {
  let component: UserModeWarningComponent;
  let fixture: ComponentFixture<UserModeWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserModeWarningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserModeWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
