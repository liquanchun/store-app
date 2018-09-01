import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './pages.routing';
import { NgaModule } from '../theme/nga.module';
import { AppTranslationModule } from '../app.translation.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Select2Module } from 'ng2-select2';
import { Pages } from './pages.component';
import { Router, Routes, RouterModule } from '@angular/router';
import * as _ from 'lodash';

@NgModule({
  imports: [
    CommonModule,
    AppTranslationModule,
    NgaModule,
    routing,
    BrowserAnimationsModule,
    Select2Module,
  ],
  declarations: [Pages]
})
export class PagesModule implements OnInit {
  constructor(private router: Router) {
    // console.log(routing.providers);
    // console.log(this.router);

    // this.router.config[2].children.push(
    //   { path: 'sys', loadChildren: './sys/sys.module#SysModule' }
    // );
    // this.router.resetConfig(this.router.config);
  }

  ngOnInit() {
  }
}
