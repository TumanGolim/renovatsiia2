import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Master {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  location?: string;
  experience: number;
  available: boolean;
  rating?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  masters: Master[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadMasters();
  }

  loadMasters(): void {
    this.isLoading = true;
    this.error = null;

    fetch('http://localhost:3000/masters')
      .then((response) => response.json())
      .then((data) => {
        this.masters = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = 'Помилка при завантаженні даних';
        this.isLoading = false;
        console.error('Error:', error);
      });
  }

  deleteMaster(id: string): void {
    if (confirm('Ви впевнені, що хочете видалити цього майстра?')) {
      fetch(`http://localhost:3000/masters/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            this.masters = this.masters.filter((master) => master.id !== id);
          } else {
            throw new Error('Помилка при видаленні');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Помилка при видаленні майстра');
        });
    }
  }
}
