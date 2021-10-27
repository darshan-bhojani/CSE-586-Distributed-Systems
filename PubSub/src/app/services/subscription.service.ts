import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  }

  getUserSubscriptions(user: any){ 
    return this.http.post(environment.apiBaseUrl + '/getUserSubscriptions', user, this.httpOptions);
  }

  getTopicList(){ 
    return this.http.get(environment.apiBaseUrl + '/getTopicList', this.httpOptions);
  }

  subscribeToTopics(user_subscriptions: any){ 
    return this.http.post(environment.apiBaseUrl + '/subscribeToTopics', user_subscriptions, this.httpOptions);
  }

  unsubscribeUserTopics(user_subscriptions: any){ 
    return this.http.post(environment.apiBaseUrl + '/unsubscribeUserTopics', user_subscriptions, this.httpOptions);
  }

  getUserSubscriptionData(user_subscriptions: any){ 
    return this.http.post(environment.apiBaseUrl + '/getUserSubscriptionData', user_subscriptions, this.httpOptions);
  }


  
}
