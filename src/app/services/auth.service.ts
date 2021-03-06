import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {AuthResponseData, AuthUser} from '../models/Auth';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {LocalStorageService} from './angular-universal.service';
import {Store} from '@ngrx/store';
import * as fromApp from '../ngrx/app.reducer';
import * as Auth from '../ngrx/actions/auth.actions';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly ROOT_ENDPOINT = environment.firebaseConfig.apiKey;
  authUser = new BehaviorSubject<AuthUser>(null);
  private tokenExpirationTimer: any;

  constructor(private router: Router,
              private http: HttpClient,
              private store: Store<fromApp.State>,
              private fireAuth: AngularFireAuth, // prevent firebase permission-denied error
              private localStorageService: LocalStorageService) {}


  login(user): any {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + AuthService.ROOT_ENDPOINT, {
      email: user.email,
      password: user.password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap((resData: any) => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  register(user): any {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + AuthService.ROOT_ENDPOINT, {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: user.password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap((resData: any) => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  handleAuthentication(email: string, userId: string, token: string, expiresIn: number): void {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const authUser = new AuthUser(email, userId, token, expirationDate);
    this.store.dispatch(new Auth.SetAuthenticated({
      email: email,
      id: userId,
      _token: token,
      _tokenExpirationDate: expirationDate
    }));
    // this.authUser.next(authUser);
    this.autoLogout(expiresIn * 1000);
    this.localStorageService.setItem('userData', JSON.stringify(authUser));
  }

  private handleError(errorRes: HttpErrorResponse): any {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email doees not exist!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct!';
        break;
    }
    return throwError(errorMessage);
  }

  logout(): void {
    this.store.dispatch(new Auth.SetUnauthenticated());
    // this.authUser.next(null);
    this.localStorageService.removeItem('userData');
    this.router.navigate(['/']);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin(): void {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string;
    } = JSON.parse(this.localStorageService.getItem('userData'));
    if (!userData) {
      return;
    }
    const loadUser = new AuthUser(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
    if (loadUser.token) {
      this.store.dispatch(new Auth.SetAuthenticated({
        email: loadUser.email,
        id: loadUser.id,
        _token: loadUser.token,
        _tokenExpirationDate: new Date(userData._tokenExpirationDate)
      }));
      // this.authUser.next(loadUser);
      // @ts-ignore
      const expirationDuration = new Date(userData._tokenExpirationDate) - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }
}
