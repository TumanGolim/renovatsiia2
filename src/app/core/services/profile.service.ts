import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceCategory } from '../models/services.model';

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

  getMastersByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/masters?category_id=${categoryId}`);
  }

  getMastersBySubcategory(subcategoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/masters?subcategory_id=${subcategoryId}`);
  }
}
