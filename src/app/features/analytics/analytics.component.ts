import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { COLORS } from '@core/colors';
import { PAGE_ROUTES } from '@core/models';
import { SectionHeadingComponent } from '@shared/section-heading.component';

interface Metric {
  l: string;
  v: string;
  vc?: string;
  t: string;
  tc: string;
}

interface BarDay {
  day: string;
  total: number;
  pcts: number[];
}

interface ReasonRow {
  r: string;
  c: number;
  p: number;
}

interface ChannelRow {
  icon: string;
  name: string;
  vol: string;
  auto: string;
  err: string;
  bg: string;
  warn?: boolean;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, SectionHeadingComponent],
  template: `
    <div class="p-6 mx-auto" style="max-width: 1400px;">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold" [style.color]="COLORS.dark">Analytics</h1>
          <p class="text-sm text-gray-500">
            Document intake performance, trends, and operational intelligence
          </p>
        </div>
        <div class="flex items-center gap-3">
          <select
            class="px-3 py-2 border rounded-lg text-xs font-medium"
            [style.borderColor]="COLORS.gray200"
          >
            <option>Highmark BCBS</option>
            <option>All Payers</option>
          </select>
          <select
            class="px-3 py-2 border rounded-lg text-xs font-medium"
            [style.borderColor]="COLORS.gray200"
          >
            <option>Last 7 Days</option>
            <option>Today</option>
            <option>Last 30 Days</option>
          </select>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-medium border"
            [style.borderColor]="COLORS.gray200"
          >
            📤 Export
          </button>
        </div>
      </div>

      <!-- Metrics Bar -->
      <div class="grid grid-cols-6 gap-4 mb-7">
        @for (m of metrics; track m.l) {
          <div class="bg-white rounded-xl px-5 py-4 shadow-sm">
            <div class="text-[10px] text-gray-500 font-medium mb-1.5">{{ m.l }}</div>
            <div
              class="text-2xl font-bold tabular-nums"
              [style.color]="m.vc ?? COLORS.dark"
            >
              {{ m.v }}
            </div>
            <div class="text-[10px] font-medium mt-1" [style.color]="m.tc">
              {{ m.t }}
            </div>
          </div>
        }
      </div>

      <app-section-heading
        title="Trends"
        sub="Volume, automation, and processing patterns over the selected period"
      ></app-section-heading>

      <div class="grid grid-cols-2 gap-5 mb-7">
        <!-- Daily Volume -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b" [style.borderColor]="COLORS.gray100">
            <div class="text-sm font-semibold">Daily Volume &amp; Outcome Split</div>
            <div class="text-[10px] text-gray-500">
              Documents received per day with AI vs human breakdown
            </div>
          </div>
          <div class="p-5">
            <div class="flex items-end gap-1.5" style="height: 140px;">
              @for (d of barData; track d.day) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <div class="text-[8px] font-semibold text-gray-600">{{ d.total }}</div>
                  <div
                    class="w-full rounded-t flex flex-col justify-end overflow-hidden"
                    [style.height.%]="(d.total / maxTotal) * 100"
                  >
                    @for (p of d.pcts; track $index) {
                      <div
                        [style.height.%]="p"
                        [style.background]="barColors[$index]"
                      ></div>
                    }
                  </div>
                  <div class="text-[8px] text-gray-400">{{ d.day }}</div>
                </div>
              }
            </div>
            <div class="flex gap-4 mt-3 text-[10px] text-gray-500">
              @for (l of legend; track l; let i = $index) {
                <span class="flex items-center gap-1"
                  ><span
                    class="w-2 h-2 rounded-full"
                    [style.background]="barColors[i]"
                  ></span
                  >{{ l }}</span
                >
              }
            </div>
          </div>
        </div>

        <!-- Automation Rate -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            class="px-5 py-3 border-b flex items-center justify-between"
            [style.borderColor]="COLORS.gray100"
          >
            <div>
              <div class="text-sm font-semibold">Automation Rate Trend</div>
              <div class="text-[10px] text-gray-500">
                Percentage auto-indexed without human review
              </div>
            </div>
            <span class="text-2xl font-bold" [style.color]="COLORS.green">83.2%</span>
          </div>
          <div class="p-5">
            <div class="flex items-center justify-between text-[10px] mb-2">
              <span class="text-gray-500">Target: 90%</span>
              <span class="font-semibold" [style.color]="COLORS.amber"
                >6.8% below target</span
              >
            </div>
            <div class="h-2 bg-gray-200 rounded-full relative mb-5">
              <div
                class="h-full rounded-full"
                style="width: 83.2%;"
                [style.background]="
                  'linear-gradient(90deg, ' +
                  COLORS.greenLight +
                  ', ' +
                  COLORS.green +
                  ')'
                "
              ></div>
              <div
                class="absolute"
                style="left: 90%; top: -3px; bottom: -3px; width: 2px; border-radius: 1px;"
                [style.background]="COLORS.amber"
              ></div>
            </div>
            <div class="text-xs font-semibold mb-2">7-Day Trend</div>
            <div class="flex items-end gap-1" style="height: 48px;">
              @for (v of trend7; track $index) {
                <div
                  class="flex-1 rounded-t"
                  [style.height.%]="v"
                  [style.background]="COLORS.greenLight"
                ></div>
              }
            </div>
            <div class="flex justify-between text-[8px] text-gray-400 mt-1">
              @for (d of barData; track d.day) {
                <span>{{ d.day }}</span>
              }
            </div>
          </div>
        </div>
      </div>

      <app-section-heading
        title="Operational Intelligence"
        sub="Patterns that may require configuration changes or staffing adjustments"
      ></app-section-heading>

      <div class="grid grid-cols-2 gap-5 mb-7">
        <!-- Verification Reasons -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b" [style.borderColor]="COLORS.gray100">
            <div class="text-sm font-semibold">Top Verification Queue Reasons</div>
            <div class="text-[10px] text-gray-500">152 items, 7 days</div>
          </div>
          <div class="p-5">
            @for (item of reasons; track item.r; let i = $index) {
              <div class="flex items-center gap-3 mb-3">
                <span
                  class="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
                  [style.background]="COLORS.gray100"
                  [style.color]="COLORS.gray500"
                  >{{ i + 1 }}</span
                >
                <div class="flex-1">
                  <div class="text-xs font-medium mb-1">{{ item.r }}</div>
                  <div
                    class="h-1.5 rounded-full"
                    [style.background]="COLORS.gray100"
                  >
                    <div
                      class="h-full rounded-full"
                      [style.width.%]="item.p"
                      [style.background]="
                        'linear-gradient(90deg, ' + COLORS.blue + ', #60a5fa)'
                      "
                    ></div>
                  </div>
                </div>
                <span class="text-xs font-bold tabular-nums w-8 text-right">{{
                  item.c
                }}</span>
                <span class="text-[10px] text-gray-500 w-8 text-right"
                  >{{ item.p }}%</span
                >
              </div>
            }
            <div
              class="flex items-center gap-2.5 mt-4 p-3 rounded-lg text-xs border"
              style="background: #faf5ff; border-color: #ede9fe; color: #5b21b6;"
            >
              💡 62% are name variations.
              <button
                type="button"
                (click)="goAdmin()"
                class="font-semibold underline"
                [style.color]="COLORS.purple"
              >
                Adjust Name Matching Thresholds
              </button>
            </div>
          </div>
        </div>

        <!-- Channel Health -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b" [style.borderColor]="COLORS.gray100">
            <div class="text-sm font-semibold">Channel Health</div>
            <div class="text-[10px] text-gray-500">
              Volume and exception rates by delivery channel
            </div>
          </div>
          <div class="p-5">
            @for (ch of channels; track ch.name) {
              <div
                class="flex items-center gap-3 py-3 border-b last:border-0"
                [style.borderColor]="COLORS.gray100"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  [style.background]="ch.bg"
                >
                  {{ ch.icon }}
                </div>
                <div class="flex-1">
                  <div class="text-xs font-medium">{{ ch.name }}</div>
                  <div class="text-[10px] text-gray-500">{{ ch.vol }}</div>
                </div>
                <div class="text-center">
                  <div
                    class="text-xs font-bold"
                    [class.text-amber-600]="ch.warn"
                  >
                    {{ ch.auto }}
                  </div>
                  <div class="text-[8px] text-gray-400">Auto</div>
                </div>
                <div class="text-center ml-4">
                  <div
                    class="text-xs font-bold"
                    [class.text-amber-600]="ch.warn"
                  >
                    {{ ch.err }}
                  </div>
                  <div class="text-[8px] text-gray-400">Error</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Export Bar -->
      <div
        class="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center justify-between"
      >
        <span class="text-xs text-gray-500"
          >📊 Showing analytics for <strong>Highmark BCBS</strong> · Last 7 days (Apr
          1 – Apr 7, 2026)</span
        >
        <div class="flex gap-2">
          @for (b of exportButtons; track b) {
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border"
              [style.borderColor]="COLORS.gray200"
            >
              {{ b }}
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  readonly COLORS = COLORS;

  readonly metrics: Metric[] = [
    { l: 'Documents Received', v: '1,247', t: '↑ 8%', tc: COLORS.green },
    {
      l: 'Auto-Indexed',
      v: '1,038',
      vc: COLORS.green,
      t: '83.2% rate',
      tc: COLORS.green
    },
    { l: 'Human Verified', v: '152', t: '12.2% of total', tc: COLORS.gray500 },
    {
      l: 'In Research',
      v: '41',
      vc: COLORS.amber,
      t: '↑ 3.3% exception',
      tc: COLORS.red
    },
    { l: 'Avg Processing', v: '17s', t: '↓ 3s improvement', tc: COLORS.green },
    { l: 'Errors', v: '16', t: '1.3% error rate', tc: COLORS.gray500 }
  ];

  readonly barData: BarDay[] = [
    { day: 'Mon', total: 162, pcts: [82, 12, 4, 2] },
    { day: 'Tue', total: 189, pcts: [85, 10, 3, 2] },
    { day: 'Wed', total: 201, pcts: [84, 11, 3, 2] },
    { day: 'Thu', total: 178, pcts: [80, 14, 4, 2] },
    { day: 'Fri', total: 155, pcts: [83, 12, 3, 2] },
    { day: 'Sat', total: 175, pcts: [84, 11, 3, 2] },
    { day: 'Today', total: 187, pcts: [83, 12, 4, 1] }
  ];

  readonly barColors = [COLORS.greenLight, COLORS.blue, COLORS.amber, COLORS.red];
  readonly legend = ['Auto-Indexed', 'Verified', 'Research', 'Error'];
  readonly trend7 = [82, 85, 84, 80, 83, 84, 83];

  readonly reasons: ReasonRow[] = [
    { r: 'Name variation (fuzzy match below threshold)', c: 94, p: 62 },
    { r: 'Date of service mismatch (within tolerance)', c: 32, p: 21 },
    { r: 'Multiple audit candidates (2 matches)', c: 17, p: 11 },
    { r: 'Provider ID mismatch', c: 9, p: 6 }
  ];

  readonly channels: ChannelRow[] = [
    { icon: '📁', name: 'SFTP', vol: '612 docs · 49%', auto: '87%', err: '1.8%', bg: '#d1fae5' },
    {
      icon: '📠',
      name: 'Fax',
      vol: '387 docs · 31%',
      auto: '76%',
      err: '2.8%',
      bg: '#fef3c7',
      warn: true
    },
    { icon: '🌐', name: 'Portal', vol: '198 docs · 16%', auto: '91%', err: '0.5%', bg: '#dbeafe' },
    {
      icon: '📬',
      name: 'Mail/Scan',
      vol: '50 docs · 4%',
      auto: '72%',
      err: '4.0%',
      bg: '#ede9fe',
      warn: true
    }
  ];

  readonly exportButtons = ['📄 PDF', '📊 CSV', '📧 Schedule'];

  get maxTotal(): number {
    return Math.max(...this.barData.map((d) => d.total));
  }

  constructor(private readonly router: Router) {}

  goAdmin(): void {
    this.router.navigateByUrl(PAGE_ROUTES.admin);
  }
}
