import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from './../services/auth.service';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import * as fromApp from '../ngrx/app.reducer';
import {Store} from '@ngrx/store';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs/internal/Subject';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() style: number;
  userIsAuthenticated = false;
  private onDestroy = new Subject();

  constructor(
    public authService: AuthService,
    private store: Store<fromApp.State>,
    private titlePage: Title,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.store.select(fromApp.getAuthState).pipe(map(authState => authState.user), takeUntil(this.onDestroy)).subscribe(user => {
      this.userIsAuthenticated = !!user;
    });

    // this.authService.authUser.pipe(takeUntil(this.onDestroy)).subscribe(data => {
    //   this.userIsAuthenticated = !!data;
    // });
  }

  setPageTitle(title: string): void {
    this.titlePage.setTitle('Angular App | ' + this.translate.instant('navigation.' + title));
  }

  signOut(): void {
    this.authService.logout();
    this.setPageTitle('home');
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
