import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  }

  authenticateUser(user: any){ 
    return this.http.post(environment.apiBaseUrl + '/login', user, this.httpOptions);
  }

  registerUser(user: any){ 
    return this.http.post(environment.apiBaseUrl + '/register', user, this.httpOptions);
  }

}
