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
      { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
      { path: 'maps', loadChildren: './maps/maps.module#MapsModule' },
      { path: 'sys', loadChildren: './sys/sys.module#SysModule' },
      { path: 'house', loadChildren: './house/house.module#HouseModule' },
      { path: 'store', loadChildren: './store/store.module#StoreModule' },
      { path: 'frontdesk', loadChildren: './frontdesk/frontdesk.module#FrontdeskModule' },
      { path: 'order', loadChildren: './order/order.module#OrderModule' },
      { path: 'market', loadChildren: './market/market.module#MarketModule' },
      { path: 'report', loadChildren: './report/report.module#ReportModule' },
      { path: 'sms', loadChildren: './sms/sms.module#SmsModule' },
      { path: 'account', loadChildren: './account/account.module#AccountModule' },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
