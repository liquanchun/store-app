import { Routes, RouterModule } from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders } from '@angular/core';
// noinspection TypeScriptValidateTypes

// export function loadChildren(path) { return System.import(path); };

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule'
  },
  {
    path: 'register',
    loadChildren: 'app/pages/register/register.module#RegisterModule'
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'editors', loadChildren: './editors/editors.module#EditorsModule' },
      { path: 'components', loadChildren: './components/components.module#ComponentsModule' },
      { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
      { path: 'forms', loadChildren: './forms/forms.module#FormsModule' },
      { path: 'sys', loadChildren: './sys/sys.module#SysModule' },
      { path: 'store', loadChildren: './store/store.module#StoreModule' },
      { path: 'market', loadChildren: './market/market.module#MarketModule' },
      { path: 'report', loadChildren: './report/report.module#ReportModule' },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
