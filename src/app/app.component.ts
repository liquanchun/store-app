import { Component, ViewContainerRef, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GlobalState } from './global.state';
import { HttpService } from './providers/httpClient';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner } from './theme/services';
import { BaThemeConfig } from './theme/theme.config';
import { layoutPaths } from './theme/theme.constants';
import { Observable, Subscription } from 'rxjs/Rx';
import * as _ from 'lodash';
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  styleUrls: ['./app.component.scss'],
  template: `
    <main [class.menu-collapsed]="isMenuCollapsed" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class App implements AfterViewInit, OnDestroy {
  isMenuCollapsed: boolean = false;
  private sub: Subscription;
  constructor(
    private _router: Router,
    private modalService: NgbModal,
    private _httpService: HttpService,
    private _state: GlobalState,
    private _imageLoader: BaImageLoaderService,
    private _spinner: BaThemeSpinner,
    private viewContainerRef: ViewContainerRef,
    private themeConfig: BaThemeConfig) {
    if (!sessionStorage.getItem('userId')) {
      this._router.navigate(['login']);
    }
    themeConfig.config();

    this._loadImages();

    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
      console.log('app.component');
    });

    this._state.subscribe('http.error', (error) => {
      this._httpService
        .create('/common/log', { user_id: sessionStorage.getItem('userId'), desc: JSON.stringify(error) })
        .then(function (data) { });
    });

    window.addEventListener('storage', function onStorageChange(event) {
      console.log(event.key);
    });

    let timer = Observable.timer(3000, 10000);
    this.sub = timer.subscribe(t => {
      this._httpService
        .getModelList('TokenAuth')
        .then(function (data) { }, (err) => {
          if (err && _.isString(err) && err.indexOf('401') > -1) {
            this._router.navigate(['login']);
          }
        });
    });
  }

  ngAfterViewInit(): void {
    // hide spinner once all loaders are completed
    BaThemePreloader.load().then((values) => {
      this._spinner.hide();
    });
  }

  private _loadImages(): void {
    // register some loaders
    BaThemePreloader.registerLoader(this._imageLoader.load('/assets/img/sky-bg.jpg'));
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
