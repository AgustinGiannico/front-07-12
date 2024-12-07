import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ot } from '../interfaces/ot';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})

export class OtService {
  private apiUrl = `${API_BASE_URL}/ot`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Ot[]> {
    return this.http.get<Ot[]>(this.apiUrl, { withCredentials: true });
  }

  getById(id: number): Observable<Ot> {
    return this.http.get<Ot>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  create(data: Ot): Observable<Ot> {
    // Convertir las fechas a formato 'YYYY-MM-DD' antes de enviar
    if (data.request_date instanceof Date) {
      data.request_date = data.request_date.toISOString().split('T')[0];
    }
    if (data.initial_date instanceof Date) {
      data.initial_date = data.initial_date.toISOString().split('T')[0];
    }
    if (data.completion_date instanceof Date) {
      data.completion_date = data.completion_date.toISOString().split('T')[0];
    }

    return this.http.post<Ot>(this.apiUrl, data, { withCredentials: true });
  }


  update(id: number, data: Partial<Ot>): Observable<Ot> {
    return this.http.patch<Ot>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
