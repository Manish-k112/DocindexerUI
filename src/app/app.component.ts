import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { COLORS } from '@core/colors';
import { PAGE_ROUTES, PageId, QUEUE_TABS, QueueTab } from '@core/models';

const QUEUE_PAGES: PageId[] = ['verify', 'research', 'intent'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen" [style.background]="COLORS.bgPage">
      <!-- Global Header -->
      <header
        class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 shadow-md"
        [style.background]="COLORS.gradientHeader"
        [style.height.px]="52"
      >
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 text-white">
            <span class="font-bold text-base tracking-tight"
              >ClaimCompl<span class="font-normal opacity-90">AI</span></span
            >
            <div class="w-px h-5 bg-white/30"></div>
            <span class="font-medium text-sm opacity-95">Document Manager</span>
          </div>
          <nav class="flex gap-1">
            @for (t of topNav; track t.id) {
              <button
                type="button"
                (click)="navigateTop(t.id)"
                class="px-4 py-1.5 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  isTopActive(t.id)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                "
              >
                {{ t.label }}
              </button>
            }
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs px-3 py-1 rounded-md text-white bg-white/15 border border-white/25"
            >Highmark</span
          >
          <div
            class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white"
          >
            DM
          </div>
        </div>
      </header>

      <!-- Queue Sub-Nav -->
      @if (isQueuePage()) {
        <div
          class="fixed left-0 right-0 z-30 bg-white border-b flex items-center justify-between px-6"
          [style.top.px]="52"
          [style.height.px]="48"
          [style.borderColor]="COLORS.gray200"
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="goHome()"
              class="text-xs text-gray-500 hover:text-gray-900 px-2 py-1"
            >
              ← Home
            </button>
            <div class="flex items-center gap-2 ml-2">
              <div
                class="w-7 h-7 rounded-md flex items-center justify-center text-sm"
                [style.background]="queueIconBg()"
              >
                {{ queueIcon() }}
              </div>
              <span class="text-sm font-semibold">{{ queueTab() }} Queue</span>
            </div>
          </div>
          <div class="flex gap-1">
            @for (t of queueTabs; track t) {
              <button
                type="button"
                (click)="navigateQueue(t)"
                class="px-4 py-3 text-xs font-medium relative flex items-center gap-1.5"
                [ngClass]="
                  queueTab() === t
                    ? t === 'Intent Review'
                      ? 'text-pink-600'
                      : 'text-purple-600'
                    : 'text-gray-500 hover:text-gray-900'
                "
              >
                {{ t }}
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  [class.bg-blue-100]="t === 'Verification'"
                  [class.text-blue-600]="t === 'Verification'"
                  [class.bg-amber-100]="t === 'Research'"
                  [class.text-amber-700]="t === 'Research'"
                  [class.bg-pink-100]="t === 'Intent Review'"
                  [class.text-pink-700]="t === 'Intent Review'"
                  [class.bg-green-100]="t === 'Completed'"
                  [class.text-green-700]="t === 'Completed'"
                  >{{ tabCount(t) }}</span
                >
                @if (queueTab() === t) {
                  <div
                    class="absolute bottom-0 left-0 right-0 h-0.5"
                    [style.background]="
                      t === 'Intent Review' ? COLORS.pink : COLORS.purple
                    "
                  ></div>
                }
              </button>
            }
          </div>
        </div>
      }

      <!-- Page Content -->
      <div [style.marginTop.px]="isQueuePage() ? 100 : 52">
        @if (isQueuePage()) {
          <div [style.height]="queuePageHeight">
            <router-outlet></router-outlet>
          </div>
        } @else {
          <router-outlet></router-outlet>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class AppComponent {
  readonly COLORS = COLORS;
  readonly queueTabs = QUEUE_TABS;
  readonly queuePageHeight = 'calc(100vh - 100px)';
  readonly topNav: { id: 'home' | 'queues' | 'analytics' | 'admin'; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'queues', label: 'Queues' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'admin', label: 'Admin' }
  ];

  private readonly currentPage = signal<PageId>('home');

  readonly isQueuePage = computed(() => QUEUE_PAGES.includes(this.currentPage()));
  readonly queueTab = computed<QueueTab>(() => {
    switch (this.currentPage()) {
      case 'verify':
        return 'Verification';
      case 'research':
        return 'Research';
      case 'intent':
        return 'Intent Review';
      default:
        return 'Verification';
    }
  });

  readonly queueIcon = computed(() => {
    const tab = this.queueTab();
    return tab === 'Intent Review' ? '💬' : tab === 'Research' ? '🔬' : '🔍';
  });

  readonly queueIconBg = computed(() => {
    const tab = this.queueTab();
    return tab === 'Intent Review'
      ? 'linear-gradient(135deg, #fce7f3, #fbcfe8)'
      : tab === 'Research'
      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
      : 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
  });

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const data = this.deepestData(this.router.routerState.snapshot.root);
        const page = (data?.['page'] as PageId | undefined) ?? 'home';
        this.currentPage.set(page);
        window.scrollTo(0, 0);
      });
  }

  isTopActive(id: 'home' | 'queues' | 'analytics' | 'admin'): boolean {
    if (id === 'queues') return this.isQueuePage();
    return this.currentPage() === id;
  }

  navigateTop(id: 'home' | 'queues' | 'analytics' | 'admin'): void {
    if (id === 'queues') {
      this.router.navigateByUrl(PAGE_ROUTES.verify);
    } else {
      this.router.navigateByUrl(PAGE_ROUTES[id]);
    }
  }

  navigateQueue(tab: QueueTab): void {
    if (tab === 'Verification') this.router.navigateByUrl(PAGE_ROUTES.verify);
    else if (tab === 'Research') this.router.navigateByUrl(PAGE_ROUTES.research);
    else if (tab === 'Intent Review') this.router.navigateByUrl(PAGE_ROUTES.intent);
  }

  goHome(): void {
    this.router.navigateByUrl(PAGE_ROUTES.home);
  }

  tabCount(tab: QueueTab): number {
    switch (tab) {
      case 'Verification':
        return 8;
      case 'Research':
        return 3;
      case 'Intent Review':
        return 3;
      case 'Completed':
        return 179;
    }
  }

  private deepestData(
    snapshot: import('@angular/router').ActivatedRouteSnapshot
  ): { [key: string]: unknown } | undefined {
    let cur = snapshot;
    while (cur.firstChild) cur = cur.firstChild;
    return cur.data;
  }
}
