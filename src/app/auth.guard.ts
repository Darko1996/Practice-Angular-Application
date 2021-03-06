import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import {map, take, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import * as fromApp from './ngrx/app.reducer';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    // private authService: AuthService,
    private router: Router,
    private store: Store<fromApp.State>) {}

  canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot): | boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
    return this.store.select(fromApp.getAuthState).pipe(
      take(1),
      map(authState => {
        return authState.user;
      }),
      map(user => {
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }
        return this.router.createUrlTree(['/login']);
      })
    );
  }

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
  //   return this.authService.authUser.pipe(map(user => {
  //     return !!user;
  //   }), tap(isAuth => {
  //     if (!isAuth) {
  //       this.router.navigate(['/login']);
  //     }
  //   })
  //   );
  // }

}
