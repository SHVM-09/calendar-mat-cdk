import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss']
})
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;
  private formSubmit = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.appointmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    // Initialize form with data if available
    if (data) {
      this.appointmentForm.patchValue(data);
    }

    // Handle form value changes
    this.appointmentForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });

    // Handle form submission
    this.formSubmit.asObservable().subscribe(() => {
      this.save();
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.appointmentForm.valid) {
      this.dialogRef.close(this.appointmentForm.value);
    }
  }

  submitForm(): void {
    this.formSubmit.next();
  }
}
