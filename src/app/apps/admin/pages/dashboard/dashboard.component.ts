import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../../components/profile/profile.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
}