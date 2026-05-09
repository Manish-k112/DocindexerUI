import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('@features/home/home.component').then((m) => m.HomeComponent),
    data: { page: 'home' }
  },
  {
    path: 'queues/verify',
    loadComponent: () =>
      import('@features/verification/verification.component').then(
        (m) => m.VerificationComponent
      ),
    data: { page: 'verify' }
  },
  {
    path: 'queues/research',
    loadComponent: () =>
      import('@features/research/research.component').then(
        (m) => m.ResearchComponent
      ),
    data: { page: 'research' }
  },
  {
    path: 'queues/intent',
    loadComponent: () =>
      import('@features/intent-review/intent-review.component').then(
        (m) => m.IntentReviewComponent
      ),
    data: { page: 'intent' }
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('@features/analytics/analytics.component').then(
        (m) => m.AnalyticsComponent
      ),
    data: { page: 'analytics' }
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('@features/admin/admin.component').then((m) => m.AdminComponent),
    data: { page: 'admin' }
  },
  { path: '**', redirectTo: '' }
];
