import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Додаємо інтерфейси
export interface ServiceCategory {
  category_id: number;
  category_name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  subcategory_id: number;
  subcategory_name: string;
  description: string;
  price_from: number;
  price_to: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createMasterProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/masters`, profileData);
  }

  // Додаємо правильну типізацію
  getServices(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.apiUrl}/serviceCategories`);
  }
}
