import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/masters';

  constructor(private http: HttpClient) {}

  createMasterProfile(profileData: any) {
    return this.http.post(this.apiUrl, profileData);
  }
}
