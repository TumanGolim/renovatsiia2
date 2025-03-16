import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, 
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./apps/main/main.routes').then((m) => m.MAIN_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./apps/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        canActivate: [],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
