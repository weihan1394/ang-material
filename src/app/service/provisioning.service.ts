import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProvisioningService {

  constructor(private httpClient: HttpClient) { }

  baseUrl: string = environment.backend.baseURL;
  baseUrl2: string = environment.backend.baseURL2;

  getProvisioning(): Observable<any> {
    console.log(this.baseUrl);
    return this.httpClient.get<any>(this.baseUrl + "/forms").pipe
      (
        catchError(this.handleError)
      )
  }

  sendProvisioning(result: any): Observable<any> {
    return this.httpClient.post<any>(this.baseUrl2 + "/services", result, httpOptions).pipe
      (
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string = "";

    if (error.error instanceof ErrorEvent) {
      errorMessage = "An unknown error has occurred: " + error.error.message;
    }
    else {
      errorMessage = "A HTTP error has occurred: " + `HTTP ${error.status}: ${error.error.message}`;
    }
    
    console.error(error);
    console.error(errorMessage);

    return throwError(errorMessage);
  }
}
