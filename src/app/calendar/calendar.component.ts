import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';

interface Appointment {
  title: string;
  description: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [DatePipe]
})
export class CalendarComponent implements OnInit {
  days: Date[] = [];
  appointments: { [key: string]: Appointment[] } = {};
  currentDate: Date = new Date();
  dropListIds: string[] = [];
  weekDays: string[] = [];
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  demoAddedKey: string = 'demoAppointmentsAdded';

  constructor(public dialog: MatDialog, private datePipe: DatePipe) {}

  ngOnInit() {
    this.generateCalendar();
    this.loadAppointments();
    this.generateWeekDays();
    this.addDemoAppointments(); // Initialize demo appointments
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysFromPreviousMonth = startDay;
    const lastDayOfPreviousMonth = new Date(this.currentYear, this.currentMonth, 0);

    this.days = [];
    this.dropListIds = [];

    for (let i = lastDayOfPreviousMonth.getDate() - daysFromPreviousMonth + 1; i <= lastDayOfPreviousMonth.getDate(); i++) {
      this.days.push(new Date(this.currentYear, this.currentMonth - 1, i));
    }

    for (let day = new Date(firstDayOfMonth); day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split('T')[0];
      this.days.push(new Date(day));
      this.dropListIds.push(dateStr);
    }

    const endDay = lastDayOfMonth.getDay();
    const daysToAdd = (6 - endDay);

    const firstDayOfNextMonth = new Date(this.currentYear, this.currentMonth + 1, 1);
    for (let i = 1; i <= daysToAdd; i++) {
      this.days.push(new Date(this.currentYear, this.currentMonth + 1, i));
    }
  }

  generateWeekDays() {
    const startDay = 0; // Sunday
    const weekDays = [];
    for (let i = startDay; i < startDay + 7; i++) {
      weekDays.push(new Date(2024, 0, i).toLocaleDateString('en-US', { weekday: 'short' }));
    }
    this.weekDays = weekDays;
  }

  openAppointmentDialog(date: Date) {
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '250px',
      data: { date }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { title, description } = result;
        const key = date.toISOString().split('T')[0];
        if (!this.appointments[key]) {
          this.appointments[key] = [];
        }
        this.appointments[key].push({ title, description });
        this.saveAppointments();
      }
    });
  }

  onDrop(event: CdkDragDrop<Appointment[]>) {
    const previousKey = event.previousContainer.id;
    const newKey = event.container.id;

    if (!event.item.data) return;

    const appointment = event.item.data as Appointment;
    const previousList = this.appointments[previousKey] || [];
    const newList = this.appointments[newKey] || [];

    const index = previousList.indexOf(appointment);
    if (index !== -1) {
      previousList.splice(index, 1);
    }

    newList.splice(event.currentIndex, 0, appointment);

    if (previousList.length === 0) {
      delete this.appointments[previousKey];
    } else {
      this.appointments[previousKey] = previousList;
    }
    this.appointments[newKey] = newList;

    this.saveAppointments();
  }

  deleteAppointment(date: Date, index: number) {
    const key = date.toISOString().split('T')[0];
    this.appointments[key].splice(index, 1);

    if (this.appointments[key].length === 0) {
      delete this.appointments[key];
    }

    this.saveAppointments();
  }

  changeMonth(offset: number) {
    this.currentMonth += offset;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.currentDate = new Date(this.currentYear, this.currentMonth, 1);
    this.generateCalendar();
  }

  private saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
  }

  private loadAppointments() {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      this.appointments = JSON.parse(savedAppointments);
    }
  }

  private addDemoAppointments() {
    // Check if demo appointments have already been added
    if (localStorage.getItem(this.demoAddedKey)) {
      return;
    }

    // Add demo appointments to the current date + 1 or 2 days
    const today = new Date();
    const demoAppointments = {
      [this.formatDate(new Date(today.getTime() - 1*24*60*60*1000))]: [{ title: 'Play Tennis', description: 'Go loius club to play tennis' }],
      [this.formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000))]: [{ title: 'Meeting', description: 'Discuss project milestones' }],
      [this.formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))]: [{ title: 'Dentist Appointment', description: 'Checkup' }],
      [this.formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))]: [{ title: 'Lunch with Alice', description: 'Catch up with Alice' }],
    };

    for (const [key, appointments] of Object.entries(demoAppointments)) {
      if (!this.appointments[key]) {
        this.appointments[key] = [];
      }
      this.appointments[key] = this.appointments[key].concat(appointments);
    }

    this.saveAppointments();

    // Set flag to indicate demo appointments have been added
    localStorage.setItem(this.demoAddedKey, 'true');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getFormattedMonthYear(): string {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    return this.datePipe.transform(date, 'MMMM yyyy') || '';
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }
}
