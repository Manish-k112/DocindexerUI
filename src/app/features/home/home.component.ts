import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import { COLORS } from '@core/colors';
import {
  AGENTS,
  FEED_ITEMS,
  INTENT_ITEMS,
  RESEARCH_ITEMS,
  VERIFY_ITEMS
} from '@core/data';
import { PAGE_ROUTES } from '@core/models';
import { ConfGaugeComponent } from '@shared/conf-gauge.component';
import { LockBadgeComponent } from '@shared/lock-badge.component';

interface QuickAction {
  icon: string;
  bg: string;
  label: string;
  desc: string;
  badge?: number;
  route?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ConfGaugeComponent, LockBadgeComponent],
  template: `
    <div class="p-6 mx-auto" style="max-width: 1600px;">
      <div class="mb-6">
        <h1 class="text-2xl font-bold" [style.color]="COLORS.dark">
          Good morning, David 👋
        </h1>
        <p class="text-sm text-gray-500">
          Here's what's happening with document intake today
        </p>
      </div>

      <div class="grid gap-6" style="grid-template-columns: 1fr 380px;">
        <!-- Main Column -->
        <div class="flex flex-col gap-6">
          <!-- AI Activity Panel -->
          <div
            class="rounded-xl overflow-hidden shadow-sm border"
            [style.background]="COLORS.aiGradient"
            [style.borderColor]="COLORS.aiBorder"
          >
            <div
              class="flex items-center justify-between px-5 py-3"
              [style.borderBottom]="'1px solid ' + COLORS.aiBorder"
            >
              <span
                class="font-semibold text-sm flex items-center gap-2"
                [style.color]="COLORS.aiText"
                >🤖 AI Agent Activity</span
              >
              <div class="relative">
                <button
                  type="button"
                  (click)="agentPopover.set(!agentPopover())"
                  class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                  style="background: rgba(16,185,129,0.12);"
                  [style.color]="COLORS.teal"
                >
                  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  3 Agents Active
                </button>
                @if (agentPopover()) {
                  <div
                    class="absolute right-0 top-full mt-2 w-64 rounded-xl p-3 shadow-xl z-50 bg-white border"
                    [style.borderColor]="COLORS.aiBorder"
                  >
                    @for (a of agents; track a.name) {
                      <div
                        class="flex items-center gap-2.5 py-2 last:border-0"
                        [style.borderBottom]="'1px solid ' + COLORS.gray100"
                      >
                        <span
                          class="w-2 h-2 rounded-full"
                          [class.bg-gray-400]="a.status === 'Idle'"
                          [class.bg-green-500]="a.status !== 'Idle'"
                        ></span>
                        <span
                          class="text-xs font-medium flex-1"
                          [style.color]="COLORS.aiText"
                          >{{ a.name }}</span
                        >
                        <span class="text-[10px]" [style.color]="COLORS.aiTextMuted">{{
                          a.status
                        }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="p-5">
              <div class="grid grid-cols-5 gap-3 mb-5">
                @for (s of stats; track s.l) {
                  <div
                    class="text-center p-3 rounded-lg"
                    [style.background]="COLORS.aiStatBg"
                  >
                    <div
                      class="text-2xl font-bold"
                      [style.color]="s.hl ?? COLORS.tealDark"
                    >
                      {{ s.v }}
                    </div>
                    <div class="text-[10px] mt-1" [style.color]="COLORS.aiTextMuted">
                      {{ s.l }}
                    </div>
                  </div>
                }
              </div>
              <div class="overflow-y-auto" style="max-height: 180px;">
                @for (f of feedItems; track f.file) {
                  <div
                    class="flex items-start gap-3 py-2.5 last:border-0"
                    style="border-bottom: 1px solid rgba(13,148,136,0.08);"
                  >
                    <div
                      class="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                      [style.background]="feedIconBg(f.type)"
                      [style.color]="feedIconColor(f.type)"
                    >
                      @if (f.type === 'processing') {
                        <span
                          class="w-3.5 h-3.5 border-2 border-purple-300/30 border-t-purple-500 rounded-full animate-spin"
                        ></span>
                      } @else if (f.type === 'success') {
                        ✓
                      } @else if (f.type === 'error') {
                        ✕
                      } @else {
                        →
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs truncate" [style.color]="COLORS.aiText">
                        {{ f.file }}
                      </div>
                      <div class="text-[10px]" [style.color]="COLORS.aiTextMuted">
                        {{ f.meta }}
                      </div>
                      @if (f.reason) {
                        <div
                          class="text-[10px] italic mt-0.5"
                          [style.color]="COLORS.aiTextFaint"
                        >
                          {{ f.reason }}
                        </div>
                      }
                    </div>
                    <span
                      class="text-[10px] whitespace-nowrap"
                      [style.color]="COLORS.aiTextFaint"
                      >{{ f.time }}</span
                    >
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Queue Cards -->
          <div>
            <h2 class="text-base font-semibold mb-4" [style.color]="COLORS.dark">
              👤 Your Work Queues
            </h2>
            <div class="grid grid-cols-2 gap-4 mb-3">
              <!-- Verification card -->
              <div
                (click)="goTo('verify')"
                class="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div class="p-5 flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);"
                  >
                    🔍
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-base" [style.color]="COLORS.dark">
                      Verification Queue
                    </div>
                    <div class="text-xs text-gray-500 mb-3">
                      AI matched with 80–94% confidence. Quick review to confirm.
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        class="px-3 py-1 rounded-full text-sm font-semibold"
                        style="background: #fee2e2; color: #dc2626;"
                        >8 items</span
                      >
                      <span class="text-xs text-gray-500 flex items-center gap-1"
                        >⏱ Oldest: 2h 14m</span
                      >
                    </div>
                  </div>
                </div>
                <div class="px-5 pb-5 space-y-2">
                  @for (item of verifyPreview; track item.id) {
                    <div
                      class="flex items-center justify-between px-3 py-2 rounded-lg"
                      [style.background]="COLORS.gray100"
                    >
                      <div class="flex items-center gap-2.5">
                        <div
                          class="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold"
                          style="background: #fee2e2; color: #dc2626;"
                        >
                          {{ item.type }}
                        </div>
                        <div>
                          <div class="text-xs font-medium">{{ item.file }}</div>
                          <div class="text-[10px] text-gray-500">
                            {{ item.confidence }}% · {{ item.channel }} ·
                            {{ item.time }}
                          </div>
                        </div>
                      </div>
                      @if (item.locked) {
                        <app-lock-badge [initials]="item.lockedBy ?? ''"></app-lock-badge>
                      } @else {
                        <span
                          class="text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style="background: #dbeafe; color: #1d4ed8;"
                          >Verify</span
                        >
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Research card -->
              <div
                (click)="goTo('research')"
                class="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div class="p-5 flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style="background: linear-gradient(135deg, #fef3c7, #fde68a);"
                  >
                    🔬
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-base" [style.color]="COLORS.dark">
                      Research Queue
                    </div>
                    <div class="text-xs text-gray-500 mb-3">
                      AI couldn't match confidently. Manual investigation needed.
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        class="px-3 py-1 rounded-full text-sm font-semibold"
                        style="background: #fee2e2; color: #dc2626;"
                        >3 items</span
                      >
                      <span
                        class="text-xs font-medium flex items-center gap-1"
                        style="color: #dc2626;"
                        >⏱ Oldest: 4h 52m</span
                      >
                    </div>
                  </div>
                </div>
                <div class="px-5 pb-5 space-y-2">
                  @for (item of researchPreview; track item.id) {
                    <div
                      class="flex items-center justify-between px-3 py-2 rounded-lg"
                      [style.background]="COLORS.gray100"
                    >
                      <div class="flex items-center gap-2.5">
                        <div
                          class="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold"
                          style="background: #fee2e2; color: #dc2626;"
                        >
                          {{ item.type }}
                        </div>
                        <div>
                          <div class="text-xs font-medium">{{ item.file }}</div>
                          <div class="text-[10px] text-gray-500">
                            {{ item.badge }} · {{ item.time }}
                          </div>
                        </div>
                      </div>
                      @if (item.locked) {
                        <app-lock-badge [initials]="item.lockedBy ?? ''"></app-lock-badge>
                      } @else {
                        <span
                          class="text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style="background: #fef3c7; color: #b45309;"
                          >Research</span
                        >
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Intent Review compact -->
            <div
              (click)="goTo('intent')"
              class="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div class="px-5 py-4 flex items-center gap-3.5">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style="background: linear-gradient(135deg, #fce7f3, #fbcfe8);"
                >
                  💬
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-sm" [style.color]="COLORS.dark">
                    Intent Review
                  </div>
                  <div class="text-[11px] text-gray-500">
                    Provider responses with unclear or conflicting intent
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    style="background: #fee2e2; color: #dc2626;"
                    >3 items</span
                  >
                  <span class="text-[10px] text-gray-500">⏱ 2h 14m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-6">
          <!-- Up Next -->
          <div
            class="rounded-xl overflow-hidden shadow-sm border-2"
            [style.borderColor]="COLORS.purple"
            style="background: linear-gradient(135deg, #faf5ff, #f5f3ff);"
          >
            <div
              class="px-5 py-3.5 flex items-center justify-between text-white"
              [style.background]="
                'linear-gradient(135deg, ' + COLORS.purple + ', ' + COLORS.darkPurple + ')'
              "
            >
              <span class="font-semibold text-sm flex items-center gap-2"
                >⚡ Up Next</span
              >
              <span class="text-xs opacity-80">Highest priority</span>
            </div>
            <div class="p-5">
              <div class="flex items-start gap-4 mb-4">
                <div
                  class="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center text-xl"
                >
                  📄
                </div>
                <div>
                  <div class="font-semibold text-sm">{{ upNext.file }}</div>
                  <div class="text-xs text-gray-500">
                    {{ upNext.pages }} pages · {{ upNext.channel }} · {{ upNext.time }}
                  </div>
                </div>
              </div>
              <app-conf-gauge [value]="72"></app-conf-gauge>
              <div
                class="rounded-lg p-3 my-4 border"
                [style.background]="COLORS.tealBg"
                [style.borderColor]="COLORS.aiBorder"
              >
                <div
                  class="text-[9px] font-semibold uppercase tracking-wide mb-1"
                  [style.color]="COLORS.teal"
                >
                  🤖 AI Handoff Reason
                </div>
                <div class="text-xs" [style.color]="COLORS.gray700">
                  Checkbox/content conflict: Provider checked "Agree" but written
                  comments express partial disagreement on shoulder arthroscopy.
                </div>
              </div>
              <button
                type="button"
                (click)="goTo('intent')"
                class="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                [style.background]="
                  'linear-gradient(135deg, ' + COLORS.pink + ', #9d174d)'
                "
              >
                ▶ Resolve Intent
              </button>
            </div>
          </div>

          <!-- Completed Today -->
          <div class="bg-white rounded-xl shadow-sm">
            <div
              class="flex items-center justify-between px-5 py-3 border-b"
              [style.borderColor]="COLORS.gray100"
            >
              <span class="font-semibold text-sm">📊 Completed Today</span>
              <span
                class="text-xs font-medium cursor-pointer"
                [style.color]="COLORS.purple"
                >View All</span
              >
            </div>
            <div class="p-5">
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="text-center p-4 rounded-lg" style="background: #f9fafb;">
                  <div class="text-2xl font-bold" [style.color]="COLORS.greenLight">
                    156
                  </div>
                  <div class="text-[10px] text-gray-500 mt-1">AI Auto-Indexed</div>
                </div>
                <div class="text-center p-4 rounded-lg" style="background: #f9fafb;">
                  <div class="text-2xl font-bold" [style.color]="COLORS.blue">23</div>
                  <div class="text-[10px] text-gray-500 mt-1">Human Verified</div>
                </div>
              </div>
              <div class="text-xs text-gray-500 mb-2">
                Total: 179 documents processed
              </div>
              <div class="h-2 bg-gray-200 rounded-full flex overflow-hidden mb-2">
                <div
                  class="h-full rounded-l-full"
                  style="width: 87%;"
                  [style.background]="
                    'linear-gradient(90deg, ' +
                    COLORS.greenLight +
                    ', ' +
                    COLORS.green +
                    ')'
                  "
                ></div>
                <div
                  class="h-full rounded-r-full"
                  style="width: 13%;"
                  [style.background]="
                    'linear-gradient(90deg, ' + COLORS.blue + ', #2563eb)'
                  "
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-gray-500">
                <span class="flex items-center gap-1"
                  ><span
                    class="w-2 h-2 rounded-full"
                    [style.background]="COLORS.greenLight"
                  ></span>
                  AI (87%)</span
                >
                <span class="flex items-center gap-1"
                  ><span
                    class="w-2 h-2 rounded-full"
                    [style.background]="COLORS.blue"
                  ></span>
                  Human (13%)</span
                >
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-5 py-3 border-b" [style.borderColor]="COLORS.gray100">
              <span class="font-semibold text-sm">⚡ Quick Actions</span>
            </div>
            <div class="p-5 space-y-2">
              @for (a of quickActions; track a.label) {
                <button
                  type="button"
                  (click)="a.route && goRaw(a.route)"
                  class="flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left hover:border-purple-400 transition-colors"
                  style="background: #f9fafb;"
                  [style.borderColor]="COLORS.gray200"
                >
                  <div
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                    [style.background]="a.bg"
                  >
                    {{ a.icon }}
                  </div>
                  <div class="flex-1">
                    <div class="text-xs font-medium">{{ a.label }}</div>
                    <div class="text-[10px] text-gray-500">{{ a.desc }}</div>
                  </div>
                  @if (a.badge) {
                    <span
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style="background: #fee2e2; color: #dc2626;"
                      >{{ a.badge }}</span
                    >
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  readonly COLORS = COLORS;
  readonly agents = AGENTS;
  readonly feedItems = FEED_ITEMS;
  readonly verifyPreview = VERIFY_ITEMS.slice(0, 2);
  readonly researchPreview = RESEARCH_ITEMS.slice(0, 2);
  readonly upNext = INTENT_ITEMS[0];

  readonly stats = [
    { v: '187', l: 'Received Today', hl: undefined as string | undefined },
    { v: '156', l: 'Auto-Indexed', hl: COLORS.teal as string },
    { v: '83%', l: 'Automation Rate', hl: undefined as string | undefined },
    { v: '18s', l: 'Avg Processing', hl: undefined as string | undefined },
    { v: '4', l: 'Errors Today', hl: COLORS.amber as string }
  ];

  readonly quickActions: QuickAction[] = [
    { icon: '📤', bg: '#ede9fe', label: 'Upload Documents', desc: 'Manually add files to intake' },
    {
      icon: '⚠️',
      bg: '#fee2e2',
      label: 'Processing Errors',
      desc: 'Documents that failed OCR or intake',
      badge: 4
    },
    { icon: '🕐', bg: '#dbeafe', label: 'Search History', desc: 'Find previously indexed documents' },
    {
      icon: '⚙️',
      bg: '#f3f4f6',
      label: 'Configuration',
      desc: 'Manage routing and thresholds',
      route: PAGE_ROUTES.admin
    }
  ];

  readonly agentPopover = signal(false);

  constructor(private readonly router: Router) {}

  goTo(target: 'verify' | 'research' | 'intent' | 'admin'): void {
    this.router.navigateByUrl(PAGE_ROUTES[target]);
  }

  goRaw(url: string): void {
    this.router.navigateByUrl(url);
  }

  feedIconBg(type: string): string {
    switch (type) {
      case 'processing':
        return 'rgba(124,58,237,0.12)';
      case 'success':
        return 'rgba(16,185,129,0.15)';
      case 'error':
        return 'rgba(220,38,38,0.1)';
      default:
        return 'rgba(217,119,6,0.12)';
    }
  }

  feedIconColor(type: string): string {
    switch (type) {
      case 'processing':
        return COLORS.purple;
      case 'success':
        return COLORS.aiSuccess;
      case 'error':
        return COLORS.aiError;
      default:
        return COLORS.aiHandoff;
    }
  }
}
