import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '@uptodate/types';
import { UserTableComponent } from "./table/table.component";

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserTableComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class UserListComponent {
  private http = inject(HttpClient);

  query = injectQuery(() => ({
    queryKey: ['users'],
    queryFn: () => lastValueFrom(this.http.get<User[]>(`/api/users`)),
  }));
}
