import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { COLORS } from '@core/colors';
import { PAGE_ROUTES } from '@core/models';

interface RoutingRow {
  icon: string;
  name: string;
  desc: string;
  iconBg: string;
  ava: boolean;
  audit: boolean;
  pareo: boolean;
}

interface RuleRow {
  corr: string;
  corrColor: string;
  corrText: string;
  intent: string;
  intentColor: string;
  mrAction: string;
  classify: string;
  responseType: string;
  event: string;
  eventColor?: string;
  isResearch?: boolean;
}

interface ThresholdCard {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  prefix?: string;
  val?: string;
  val1?: string;
  val2?: string;
  inherited: boolean;
}

interface ChannelCard {
  icon: string;
  name: string;
  bg: string;
  status: string;
  inactive?: boolean;
  details: [string, string][];
}

interface CompletenessRule {
  icon: string;
  name: string;
  desc: string;
  on: boolean;
}

interface AuditEntry {
  avatar: string;
  name: string;
  action: string;
  old?: string;
  new_?: string;
  scope: string;
  reason: string;
  time: string;
  tab: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 mx-auto" style="max-width: 1400px;">
      <div class="flex items-start justify-between mb-5">
        <div>
          <div class="text-xs text-gray-500 mb-1">
            <button
              type="button"
              (click)="goHome()"
              class="text-purple-600 hover:underline"
            >
              Document Manager
            </button>
            / Admin
          </div>
          <h1 class="text-2xl font-bold" [style.color]="COLORS.dark">Configuration</h1>
          <p class="text-sm text-gray-500">
            Manage routing, thresholds, rules, and channel settings
          </p>
        </div>
        <div class="flex items-center gap-3">
          @if (unsaved()) {
            <span class="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>Unsaved changes
            </span>
          }
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-medium border"
            [style.borderColor]="COLORS.gray200"
          >
            Export
          </button>
          <button
            type="button"
            (click)="saveModal.set(true)"
            class="px-4 py-2 rounded-lg text-xs font-semibold text-white"
            [style.background]="
              'linear-gradient(135deg, ' + COLORS.purple + ', ' + COLORS.darkPurple + ')'
            "
          >
            💾 Save Changes
          </button>
        </div>
      </div>

      <!-- Scope Selector -->
      <div
        class="bg-white border rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between"
        [style.borderColor]="COLORS.gray200"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2.5">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
              style="background: #ede9fe;"
            >
              🏢
            </div>
            <div>
              <div class="text-[9px] text-gray-500 font-semibold uppercase">
                Operating Entity
              </div>
              <div class="text-sm font-semibold">CGI ProperPay</div>
            </div>
          </div>
          <span class="text-gray-300 text-lg">→</span>
          <div class="flex items-center gap-2.5">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
              style="background: #dbeafe;"
            >
              🏥
            </div>
            <div>
              <div class="text-[9px] text-gray-500 font-semibold uppercase">
                Payer Configuration
              </div>
              <select
                [ngModel]="payer()"
                (ngModelChange)="payer.set($event)"
                class="text-sm font-semibold border rounded-md px-2 py-1"
                style="min-width: 180px;"
                [style.borderColor]="COLORS.gray200"
              >
                <option value="highmark">Highmark BCBS</option>
                <option value="anthem">Anthem Blue Cross</option>
                <option value="defaults">— Global Defaults —</option>
              </select>
            </div>
          </div>
          <span
            class="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            [style.background]="payer() === 'defaults' ? '#d1fae5' : '#fef3c7'"
            [style.color]="payer() === 'defaults' ? '#065f46' : '#92400e'"
          >
            {{ payer() === 'defaults' ? 'Global Defaults' : '3 overrides' }}
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b" [style.borderColor]="COLORS.gray200">
        @for (t of tabs; track t.id) {
          <button
            type="button"
            (click)="activeTab.set(t.id)"
            class="px-5 py-3 text-xs font-medium relative flex items-center gap-1.5"
            [ngClass]="
              activeTab() === t.id
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-900'
            "
          >
            {{ t.label }}
            <span
              class="text-[8px] font-bold px-1.5 py-0.5 rounded"
              [class.bg-blue-100]="t.scope === 'Payer'"
              [class.text-blue-600]="t.scope === 'Payer'"
              [class.bg-purple-100]="t.scope === 'Entity'"
              [class.text-purple-600]="t.scope === 'Entity'"
              >{{ t.scope }}</span
            >
            @if (activeTab() === t.id) {
              <div
                class="absolute left-0 right-0 h-0.5"
                style="bottom: -1px;"
                [style.background]="COLORS.purple"
              ></div>
            }
          </button>
        }
      </div>

      <!-- ROUTING -->
      @if (activeTab() === 'routing') {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b"
            [style.borderColor]="COLORS.gray200"
          >
            <div>
              <div class="font-semibold">Document Type Routing</div>
              <div class="text-xs text-gray-500">
                Configure which systems receive indexed documents for
                {{ payer() === 'defaults' ? 'all payers' : 'Highmark' }}
              </div>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border"
              [style.borderColor]="COLORS.gray200"
            >
              + Add Doc Type
            </button>
          </div>
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b" [style.borderColor]="COLORS.gray200">
                @for (h of routingHeaders; track h) {
                  <th
                    class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {{ h }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (r of routingRows; track r.name) {
                <tr
                  class="border-b last:border-0 hover:bg-gray-50"
                  [style.borderColor]="COLORS.gray100"
                >
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        [style.background]="r.iconBg"
                      >
                        {{ r.icon }}
                      </div>
                      <div>
                        <div class="text-sm font-medium">{{ r.name }}</div>
                        <div class="text-[10px] text-gray-500">{{ r.desc }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <label class="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="r.ava"
                        (change)="markUnsaved()"
                        class="sr-only peer"
                      />
                      <div
                        class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors"
                      ></div>
                      <div
                        class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                      ></div>
                    </label>
                  </td>
                  <td class="px-5 py-3">
                    <label class="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="r.audit"
                        (change)="markUnsaved()"
                        class="sr-only peer"
                      />
                      <div
                        class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors"
                      ></div>
                      <div
                        class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                      ></div>
                    </label>
                  </td>
                  <td class="px-5 py-3">
                    <label class="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="r.pareo"
                        (change)="markUnsaved()"
                        class="sr-only peer"
                      />
                      <div
                        class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors"
                      ></div>
                      <div
                        class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                      ></div>
                    </label>
                  </td>
                  <td class="px-5 py-3">
                    <button
                      type="button"
                      class="px-3 py-1 rounded-md text-xs font-medium border"
                      [style.borderColor]="COLORS.gray200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- THRESHOLDS -->
      @if (activeTab() === 'thresholds') {
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              class="flex items-center justify-between px-6 py-4 border-b"
              [style.borderColor]="COLORS.gray200"
            >
              <div>
                <div class="font-semibold">Confidence Routing Thresholds</div>
                <div class="text-xs text-gray-500">
                  How documents are routed based on AI match confidence
                </div>
              </div>
              <span
                class="text-xs font-medium px-3 py-1 rounded-full"
                style="background: #f0fdf4; color: #065f46;"
              >
                Current auto-index rate: 83%
              </span>
            </div>
            <div class="p-6 grid grid-cols-3 gap-5">
              @for (t of thresholdCards; track t.title) {
                <div
                  class="p-5 rounded-xl border"
                  [style.background]="COLORS.gray100"
                  [style.borderColor]="COLORS.gray200"
                >
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      [style.background]="t.iconBg"
                      [style.color]="t.iconColor"
                    >
                      {{ t.icon }}
                    </div>
                    <div>
                      <div class="font-semibold text-sm">{{ t.title }}</div>
                      <div class="text-xs text-gray-500">{{ t.sub }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    @if (t.prefix) {
                      <span class="text-sm text-gray-500">{{ t.prefix }}</span>
                    }
                    <input
                      class="w-16 px-2.5 py-2 border rounded-lg text-base font-bold text-center"
                      [style.borderColor]="COLORS.gray200"
                      [value]="t.val ?? t.val1"
                      (input)="markUnsaved()"
                    />
                    @if (t.val2) {
                      <span class="text-sm text-gray-500">% to</span>
                      <input
                        class="w-16 px-2.5 py-2 border rounded-lg text-base font-bold text-center"
                        [style.borderColor]="COLORS.gray200"
                        [value]="t.val2"
                        (input)="markUnsaved()"
                      />
                    }
                    <span class="text-sm text-gray-500">%</span>
                  </div>
                  <div
                    class="mt-3 text-[10px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded"
                    [class.bg-green-50]="t.inherited"
                    [class.text-green-700]="t.inherited"
                    [class.bg-amber-50]="!t.inherited"
                    [class.text-amber-700]="!t.inherited"
                  >
                    {{ t.inherited ? '✓ Using global default' : '⚠ Overridden (default: 95%)' }}
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b" [style.borderColor]="COLORS.gray200">
              <div class="font-semibold">Matching Settings</div>
              <div class="text-xs text-gray-500">
                Name matching, date tolerances, and scoring
              </div>
            </div>
            <div class="p-6 grid grid-cols-2 gap-5">
              <div
                class="p-5 rounded-xl border"
                [style.background]="COLORS.gray100"
                [style.borderColor]="COLORS.gray200"
              >
                <div class="font-semibold text-sm mb-1">Name Matching</div>
                <div class="text-xs text-gray-500 mb-4">
                  Patient name comparison settings
                </div>
                @for (row of nameMatchingNumbers; track row[0]) {
                  <div
                    class="flex items-center justify-between py-2.5 border-b"
                    [style.borderColor]="COLORS.gray100"
                  >
                    <span class="text-xs text-gray-700">{{ row[0] }}</span>
                    <input
                      class="w-24 px-2 py-1 text-xs text-center border rounded-md"
                      [style.borderColor]="COLORS.gray200"
                      [value]="row[1]"
                      (input)="markUnsaved()"
                    />
                  </div>
                }
                @for (l of nameMatchingToggles; track l) {
                  <div
                    class="flex items-center justify-between py-2 border-b last:border-0"
                    [style.borderColor]="COLORS.gray100"
                  >
                    <span class="text-xs text-gray-700">{{ l }}</span>
                    <label class="relative inline-block w-10 h-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked
                        (change)="markUnsaved()"
                        class="sr-only peer"
                      />
                      <div
                        class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors"
                      ></div>
                      <div
                        class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                      ></div>
                    </label>
                  </div>
                }
              </div>
              <div
                class="p-5 rounded-xl border"
                [style.background]="COLORS.gray100"
                [style.borderColor]="COLORS.gray200"
              >
                <div class="font-semibold text-sm mb-1">Date Matching Tolerances</div>
                <div class="text-xs text-gray-500 mb-4">
                  Allowed variance for date comparisons
                </div>
                @for (row of dateRows; track row[0]) {
                  <div
                    class="flex items-center justify-between py-2.5 border-b"
                    [style.borderColor]="COLORS.gray100"
                  >
                    <span class="text-xs text-gray-700">{{ row[0] }}</span>
                    <input
                      class="w-24 px-2 py-1 text-xs text-center border rounded-md"
                      [style.borderColor]="COLORS.gray200"
                      [value]="row[1]"
                      (input)="markUnsaved()"
                    />
                  </div>
                }
                <div class="mt-3">
                  <div class="text-xs text-gray-500 mb-2">Scoring Mode</div>
                  <div class="flex gap-3">
                    @for (m of scoringModes; track m; let i = $index) {
                      <label class="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="scoring"
                          [checked]="i === 0"
                          class="accent-purple-600"
                        />
                        {{ m }}
                      </label>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- COMPLETENESS -->
      @if (activeTab() === 'completeness') {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b"
            [style.borderColor]="COLORS.gray200"
          >
            <div>
              <div class="font-semibold">Document Completeness Rules</div>
              <div class="text-xs text-gray-500">
                Required documents based on claim characteristics
              </div>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border"
              [style.borderColor]="COLORS.gray200"
            >
              + Add Rule
            </button>
          </div>
          @for (r of completenessRules; track r.name) {
            <div
              class="flex items-center justify-between px-6 py-4 border-b last:border-0"
              [class.opacity-50]="!r.on"
              [style.borderColor]="COLORS.gray100"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  [style.background]="COLORS.gray100"
                >
                  {{ r.icon }}
                </div>
                <div>
                  <div class="text-sm font-medium">{{ r.name }}</div>
                  <div class="text-xs text-gray-500">{{ r.desc }}</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <label class="relative inline-block w-10 h-5 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="r.on"
                    (change)="markUnsaved()"
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 transition-colors"
                  ></div>
                  <div
                    class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
                  ></div>
                </label>
                <button
                  type="button"
                  class="px-3 py-1 rounded-md text-xs font-medium border"
                  [style.borderColor]="COLORS.gray200"
                >
                  Edit
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- RESPONSE RULES -->
      @if (activeTab() === 'response-rules') {
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div
              class="flex items-center justify-between px-6 py-4 border-b"
              [style.borderColor]="COLORS.gray200"
            >
              <div>
                <div class="font-semibold">Response Type Decision Matrix</div>
                <div class="text-xs text-gray-500">
                  Rules engine for E-MRI-09 — determines Response Type from
                  correspondence history and intent
                </div>
              </div>
              <span
                class="text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
                [style.background]="COLORS.gray100"
                [style.color]="COLORS.gray500"
                >🔒 Read-Only MVP</span
              >
            </div>
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-gray-50 border-b" [style.borderColor]="COLORS.gray200">
                  @for (h of ruleHeaders; track h) {
                    <th
                      class="text-left px-4 py-2.5 text-[9px] font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {{ h }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (r of rulesMatrix; track $index) {
                  <tr
                    class="border-b last:border-0 hover:bg-pink-50"
                    [style.borderColor]="COLORS.gray100"
                  >
                    <td class="px-4 py-3">
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded"
                        [style.background]="r.corrColor"
                        [style.color]="r.corrText"
                        >{{ r.corr }}</span
                      >
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="text-[10px] font-semibold"
                        [style.color]="r.intentColor"
                        >{{ r.intent }}</span
                      >
                    </td>
                    <td class="px-4 py-3 text-gray-600">{{ r.mrAction }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ r.classify }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded"
                        [class.bg-amber-50]="r.isResearch"
                        [class.text-amber-700]="r.isResearch"
                        [class.bg-gray-100]="!r.isResearch"
                        [class.text-gray-700]="!r.isResearch"
                        >{{ r.responseType }}</span
                      >
                    </td>
                    <td
                      class="px-4 py-3 text-[10px]"
                      [style.color]="r.eventColor ?? COLORS.gray500"
                    >
                      {{ r.event }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- CHANNELS -->
      @if (activeTab() === 'channels') {
        <div>
          <div
            class="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5 text-xs border"
            style="background: #ede9fe; border-color: #c4b5fd; color: #5b21b6;"
          >
            🏢 These settings apply to <strong>CGI ProperPay</strong> (Operating Entity
            level) and are shared across all payers.
          </div>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b" [style.borderColor]="COLORS.gray200">
              <div class="font-semibold">Delivery Channels</div>
              <div class="text-xs text-gray-500">
                Document ingestion sources and connection settings
              </div>
            </div>
            <div class="p-6 grid grid-cols-2 gap-4">
              @for (ch of channelCards; track ch.name) {
                <div
                  class="p-5 rounded-xl border"
                  [class.opacity-50]="ch.inactive"
                  [style.background]="COLORS.gray100"
                  [style.borderColor]="COLORS.gray200"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                        [style.background]="ch.bg"
                      >
                        {{ ch.icon }}
                      </div>
                      <span class="font-semibold text-sm">{{ ch.name }}</span>
                    </div>
                    <span
                      class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                      [class.bg-gray-200]="ch.inactive"
                      [class.text-gray-500]="ch.inactive"
                      [class.bg-green-100]="!ch.inactive"
                      [class.text-green-700]="!ch.inactive"
                      >{{ ch.status }}</span
                    >
                  </div>
                  @for (d of ch.details; track d[0]) {
                    <div class="flex justify-between py-1.5 text-xs">
                      <span class="text-gray-500">{{ d[0] }}</span>
                      <span class="font-medium">{{ d[1] }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Audit Trail -->
      <div class="bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
        <div
          class="flex items-center justify-between px-6 py-4 border-b"
          [style.borderColor]="COLORS.gray200"
        >
          <div>
            <div class="font-semibold text-sm">Recent Configuration Changes</div>
            <div class="text-xs text-gray-500">Audit trail with reasons</div>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border"
            [style.borderColor]="COLORS.gray200"
          >
            View Full Log
          </button>
        </div>
        @for (a of auditTrail; track a.time) {
          <div
            class="flex items-start gap-3.5 px-6 py-3.5 border-b last:border-0"
            [style.borderColor]="COLORS.gray100"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style="background: #ede9fe;"
              [style.color]="COLORS.purple"
            >
              {{ a.avatar }}
            </div>
            <div class="flex-1">
              <div class="text-xs">
                <strong>{{ a.name }}</strong> {{ a.action }}
                @if (a.old) {
                  <span class="line-through text-red-500">{{ a.old }}</span> →
                  <span class="font-semibold text-green-600">{{ a.new_ }}</span>
                }
                for {{ a.scope }}
              </div>
              <div
                class="text-[10px] text-gray-500 italic mt-1 pl-3 border-l-2"
                [style.borderColor]="COLORS.gray200"
              >
                "{{ a.reason }}"
              </div>
              <div class="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                <span>{{ a.time }}</span><span>·</span><span>{{ a.tab }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Save Modal -->
      @if (saveModal()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div class="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div
              class="flex items-center justify-between px-6 py-4 border-b"
              [style.borderColor]="COLORS.gray200"
            >
              <span class="text-lg font-semibold">Save Configuration Changes</span>
              <button
                type="button"
                (click)="saveModal.set(false)"
                class="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
                [style.background]="COLORS.gray100"
              >
                ✕
              </button>
            </div>
            <div class="p-6">
              <div class="rounded-lg p-3 mb-4" [style.background]="COLORS.gray100">
                <div
                  class="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >
                  Changes to save
                </div>
                <div class="text-xs flex items-center gap-2">
                  <span class="font-medium">Auto-Approve Threshold:</span>
                  <span class="text-red-500 line-through">90%</span>
                  <span>→</span>
                  <span class="text-green-600 font-semibold">95%</span>
                </div>
              </div>
              <label class="text-xs font-medium block mb-2"
                >Change Reason (required)</label
              >
              <textarea
                [ngModel]="saveReason()"
                (ngModelChange)="saveReason.set($event)"
                class="w-full px-3 py-2 text-xs border rounded-lg resize-y"
                style="min-height: 70px;"
                [style.borderColor]="COLORS.gray200"
                placeholder="Explain why these changes are being made..."
              ></textarea>
              <div class="text-[10px] text-gray-500 mt-2">
                Scope: <strong>Highmark BCBS</strong> · Changes take effect
                immediately.
              </div>
            </div>
            <div
              class="flex justify-end gap-3 px-6 py-4 border-t"
              [style.borderColor]="COLORS.gray200"
            >
              <button
                type="button"
                (click)="saveModal.set(false)"
                class="px-4 py-2 rounded-lg text-xs font-medium border"
                [style.borderColor]="COLORS.gray200"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmSave()"
                class="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                [style.background]="
                  'linear-gradient(135deg, ' + COLORS.purple + ', ' + COLORS.darkPurple + ')'
                "
              >
                💾 Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminComponent {
  readonly COLORS = COLORS;

  readonly activeTab = signal<
    'routing' | 'thresholds' | 'completeness' | 'response-rules' | 'channels'
  >('routing');
  readonly payer = signal<'highmark' | 'anthem' | 'defaults'>('highmark');
  readonly unsaved = signal(false);
  readonly saveModal = signal(false);
  readonly saveReason = signal('');

  readonly tabs: {
    id: 'routing' | 'thresholds' | 'completeness' | 'response-rules' | 'channels';
    label: string;
    scope: 'Payer' | 'Entity';
  }[] = [
    { id: 'routing', label: 'Document Routing', scope: 'Payer' },
    { id: 'thresholds', label: 'Matching & Thresholds', scope: 'Payer' },
    { id: 'completeness', label: 'Completeness Rules', scope: 'Payer' },
    { id: 'response-rules', label: 'Response Type Rules', scope: 'Payer' },
    { id: 'channels', label: 'Channel Settings', scope: 'Entity' }
  ];

  readonly routingHeaders = ['Document Type', 'AVA', 'Audit Studio', 'Pareo', 'Actions'];
  readonly routingRows: RoutingRow[] = [
    { icon: '📄', name: 'MR ALL', desc: 'Initial medical record request', iconBg: '#dbeafe', ava: true, audit: true, pareo: false },
    { icon: '📎', name: 'MR Additional Documents', desc: 'Supplemental documentation', iconBg: '#dbeafe', ava: true, audit: false, pareo: false },
    { icon: '💵', name: 'MR Billing', desc: 'Itemized bills and charges', iconBg: '#d1fae5', ava: true, audit: true, pareo: false },
    { icon: '⚖️', name: 'COM Appeals 1', desc: 'First level appeal', iconBg: '#fef3c7', ava: true, audit: true, pareo: false },
    { icon: '⚖️', name: 'COM Appeals 3', desc: 'Final level appeal', iconBg: '#fef3c7', ava: true, audit: true, pareo: false },
    { icon: '✍️', name: 'COM Signature Form', desc: 'Provider agreement forms', iconBg: '#f3f4f6', ava: false, audit: true, pareo: false }
  ];

  readonly thresholdCards: ThresholdCard[] = [
    {
      icon: '✓',
      iconBg: '#d1fae5',
      iconColor: '#065f46',
      title: 'Auto-Approve',
      sub: 'High confidence',
      prefix: '≥',
      val: '95',
      inherited: false
    },
    {
      icon: '👁',
      iconBg: '#fef3c7',
      iconColor: '#92400e',
      title: 'Verification Queue',
      sub: 'Human verification',
      val1: '80',
      val2: '94',
      inherited: true
    },
    {
      icon: '!',
      iconBg: '#fee2e2',
      iconColor: '#991b1b',
      title: 'Research Queue',
      sub: 'Manual research',
      prefix: '<',
      val: '80',
      inherited: true
    }
  ];

  readonly nameMatchingNumbers: [string, string][] = [
    ['Similarity Threshold', '0.85'],
    ['Exact Match Threshold', '0.95']
  ];
  readonly nameMatchingToggles = [
    'Nickname Expansion (Rob → Robert)',
    'Phonetic Matching',
    'Strip Suffixes (Jr., Sr.)'
  ];
  readonly dateRows: [string, string][] = [
    ['Admission Date', '± 3 days'],
    ['Discharge Date', '± 5 days'],
    ['Date of Birth', 'Exact']
  ];
  readonly scoringModes = ['Graduated', 'Binary', 'Exact Only'];

  readonly completenessRules: CompletenessRule[] = [
    {
      icon: '🔪',
      name: 'Surgical Claims Require Operative Notes',
      desc: 'When claim has ICD-10-PCS procedure codes',
      on: true
    },
    {
      icon: '💵',
      name: 'Charge Audits Require Itemized Bill',
      desc: 'When audit type is Charge/Itemized Review',
      on: true
    },
    {
      icon: '🏥',
      name: 'Extended Stay Requires Discharge Summary',
      desc: 'When inpatient LOS > 3 days',
      on: true
    },
    {
      icon: '🚑',
      name: 'Emergency Admits Require ED Notes',
      desc: 'When admission type is Emergency',
      on: false
    }
  ];

  readonly ruleHeaders = [
    'Correspondence',
    'Intent',
    'Last MR Action',
    'Classify',
    'Response Type',
    'Event'
  ];
  readonly rulesMatrix: RuleRow[] = [
    { corr: 'REQMI', corrColor: '#dbeafe', corrText: '#1d4ed8', intent: '—', intentColor: '#9ca3af', mrAction: '≠ REC', classify: '—', responseType: 'MR ALL', event: 'MR.DocumentIndexed' },
    { corr: 'MRREM', corrColor: '#dbeafe', corrText: '#1d4ed8', intent: '—', intentColor: '#9ca3af', mrAction: '≠ REC', classify: '—', responseType: 'MR ALL', event: 'MR.DocumentIndexed' },
    { corr: 'REQMI', corrColor: '#dbeafe', corrText: '#1d4ed8', intent: '—', intentColor: '#9ca3af', mrAction: '= REC', classify: '—', responseType: 'MR Additional Docs', event: 'MR.DocumentIndexed' },
    { corr: 'OUTREACH', corrColor: '#d1fae5', corrText: '#065f46', intent: '—', intentColor: '#9ca3af', mrAction: '= REC', classify: '= I-Bill', responseType: 'MR Billing', event: 'MR.DocumentIndexed' },
    { corr: 'FINDALL', corrColor: '#fef3c7', corrText: '#92400e', intent: 'Agree', intentColor: '#059669', mrAction: '—', classify: '—', responseType: 'COM Signature Form', event: 'MR.ProviderAgreementReceived', eventColor: '#059669' },
    { corr: 'FINDALL', corrColor: '#fef3c7', corrText: '#92400e', intent: 'Disagree', intentColor: '#dc2626', mrAction: '—', classify: '—', responseType: 'COM Appeals 1', event: 'MR.AppealOneSubmitted', eventColor: '#dc2626' },
    { corr: 'APALL1', corrColor: '#fee2e2', corrText: '#991b1b', intent: 'Agree', intentColor: '#059669', mrAction: '—', classify: '—', responseType: 'COM Signature Form', event: 'MR.ProviderAgreementReceived', eventColor: '#059669' },
    { corr: 'APALL1', corrColor: '#fee2e2', corrText: '#991b1b', intent: 'Disagree', intentColor: '#dc2626', mrAction: '—', classify: '—', responseType: 'COM Appeals 3', event: 'MR.AppealThreeSubmitted', eventColor: '#dc2626' },
    { corr: 'APALL3', corrColor: '#fee2e2', corrText: '#991b1b', intent: 'Disagree', intentColor: '#dc2626', mrAction: '—', classify: '—', responseType: '→ Research Queue', event: 'Final appeal exhausted', isResearch: true }
  ];

  readonly channelCards: ChannelCard[] = [
    {
      icon: '🌐',
      name: 'Provider Portal',
      bg: '#dbeafe',
      status: 'Active',
      details: [
        ['Endpoint', '/api/v1/documents/upload'],
        ['Max file', '50 MB'],
        ['Formats', 'PDF, TIF, PNG']
      ]
    },
    {
      icon: '📁',
      name: 'SFTP',
      bg: '#d1fae5',
      status: 'Active',
      details: [
        ['Endpoint', 'sftp.properpay.cgi.com'],
        ['Polling', 'Every 5 min'],
        ['Directory', '/inbound/medical-records/']
      ]
    },
    {
      icon: '📠',
      name: 'Fax Gateway',
      bg: '#fef3c7',
      status: 'Active',
      details: [
        ['Fax #', '(800) 555-0142'],
        ['Provider', 'RingCentral'],
        ['Auto-OCR', 'Enabled']
      ]
    },
    {
      icon: '📬',
      name: 'Mail / Scan',
      bg: '#ede9fe',
      status: 'Active',
      details: [
        ['Directory', '/inbound/scanned/'],
        ['Polling', 'Every 15 min'],
        ['Auto-OCR', 'Enabled']
      ]
    },
    {
      icon: '📧',
      name: 'Email',
      bg: '#fce7f3',
      status: 'Inactive',
      inactive: true,
      details: [['Status', 'Not configured']]
    }
  ];

  readonly auditTrail: AuditEntry[] = [
    {
      avatar: 'DM',
      name: 'David Morrison',
      action: 'updated Auto-Approve Threshold: ',
      old: '90%',
      new_: '95%',
      scope: 'Highmark',
      reason: 'Reducing false positives after 3 mis-indexed appeals',
      time: 'Today, 9:14 AM',
      tab: 'Matching & Thresholds'
    },
    {
      avatar: 'DM',
      name: 'David Morrison',
      action: 'enabled COM Signature Form → Audit Studio routing',
      scope: 'Highmark',
      reason:
        'Highmark requested signed forms route to Audit Studio for reconciliation',
      time: 'Yesterday, 3:42 PM',
      tab: 'Document Routing'
    },
    {
      avatar: 'RR',
      name: 'Rani Ramahi',
      action: 'added completeness rule: Emergency Admits Require ED Notes',
      scope: 'Global Default',
      reason:
        'New requirement per QA review — missing ED notes caused 12 rework items',
      time: 'Apr 4, 2026',
      tab: 'Completeness Rules'
    }
  ];

  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl(PAGE_ROUTES.home);
  }

  markUnsaved(): void {
    this.unsaved.set(true);
  }

  confirmSave(): void {
    if (!this.saveReason().trim()) {
      alert('Please provide a change reason.');
      return;
    }
    this.saveModal.set(false);
    this.unsaved.set(false);
    this.saveReason.set('');
  }
}
