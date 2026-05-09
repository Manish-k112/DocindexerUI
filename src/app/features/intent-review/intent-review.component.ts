import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { COLORS } from '@core/colors';
import { INTENT_ITEMS } from '@core/data';
import { IntentItem } from '@core/models';
import { DocViewerComponent } from '@shared/doc-viewer.component';
import { QueueDrawerComponent } from '@shared/queue-drawer.component';
import { QueueRailComponent } from '@shared/queue-rail.component';
import { ToastComponent } from '@shared/toast.component';
import { WorkbenchFooterComponent } from '@shared/workbench-footer.component';

interface HistoryEntry {
  label: string;
  code: string;
  date: string;
  current?: boolean;
}

@Component({
  selector: 'app-intent-review',
  standalone: true,
  imports: [
    CommonModule,
    DocViewerComponent,
    QueueDrawerComponent,
    QueueRailComponent,
    ToastComponent,
    WorkbenchFooterComponent
  ],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex flex-1 overflow-hidden relative">
        <app-queue-rail
          [items]="items"
          [activeId]="activeId()"
          (select)="selectItem($event)"
          (toggle)="drawerOpen.set(!drawerOpen())"
        ></app-queue-rail>

        @if (drawerOpen()) {
          <app-queue-drawer
            [items]="items"
            [activeId]="activeId()"
            title="items need intent review"
            (select)="selectItem($event)"
            (close)="drawerOpen.set(false)"
          >
            <ng-template #badge let-item>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                [style.background]="item.badgeColor + '22'"
                [style.color]="item.badgeColor"
                >{{ item.badge }}</span
              >
            </ng-template>
          </app-queue-drawer>
        }

        <!-- Doc Viewer -->
        <div class="flex-1 min-w-0">
          <app-doc-viewer [title]="active().file + ' — Page 1 of ' + active().pages">
            @if (isNoForm()) {
              <div class="text-center mb-4 pb-3 border-b-2 border-gray-200">
                <h3 class="text-sm font-bold">Riverside Community Hospital</h3>
                <p class="text-[9px] text-gray-500">
                  Medical Records Department · Pittsburgh, PA
                </p>
              </div>
              <div class="text-[10px] text-gray-600 mb-3">
                TO: CGI ProperPay — Medical Record Request
              </div>
              <div class="text-[10px] text-gray-500 mb-4 leading-relaxed">
                Please find attached the requested medical records for the patient
                below. Records include: H&amp;P, Operative Report, Discharge Summary,
                Nursing Notes, Lab Results.
              </div>
              <table class="w-full text-[10px] mb-4 border-collapse">
                <tbody>
                  @for (row of noFormRows(); track row[0]) {
                    <tr>
                      <td
                        class="border border-gray-200 bg-gray-50 px-2 py-1 font-medium"
                        style="width: 96px;"
                      >
                        {{ row[0] }}
                      </td>
                      <td class="border border-gray-200 px-2 py-1">
                        <span
                          class="px-1 rounded"
                          style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);"
                          >{{ row[1] }}</span
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              <div
                class="border-2 border-dashed border-amber-400 rounded-lg p-6 text-center my-4"
                style="background: #fef3c7;"
              >
                <div class="text-3xl mb-2">📋</div>
                <div class="text-xs font-semibold text-amber-800">
                  No Provider Response Form Detected
                </div>
                <div class="text-[10px] text-amber-700 mt-1">
                  This packet contains medical records and a cover letter but no
                  response form.
                </div>
              </div>
            } @else {
              <div class="text-center mb-4 pb-3 border-b-2 border-gray-200">
                <h3 class="text-sm font-bold">CGI — ProperPay Audit Findings Response</h3>
                <p class="text-[9px] text-gray-500">FINDINGS LETTER (FINDALL)</p>
              </div>
              <table class="w-full text-[10px] mb-3 border-collapse">
                <tbody>
                  @for (row of findingsRows(); track row[0]) {
                    <tr>
                      <td
                        class="border border-gray-200 bg-gray-50 px-2 py-1 font-medium"
                        style="width: 96px;"
                      >
                        {{ row[0] }}
                      </td>
                      <td class="border border-gray-200 px-2 py-1">
                        <span
                          class="px-1 rounded"
                          style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);"
                          >{{ row[1] }}</span
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
              <div class="border-2 border-amber-400 rounded-lg p-3 my-3 relative">
                <div
                  class="absolute text-[8px] font-semibold px-2 py-0.5 rounded"
                  style="top: -10px; left: 12px; background: #fef3c7; color: #92400e;"
                >
                  🤖 AI analyzed this area
                </div>
                <div class="flex items-center gap-2 mb-2 text-xs">
                  <div
                    class="w-4 h-4 rounded border-2 bg-blue-600 border-blue-600 text-white text-[8px] flex items-center justify-center"
                  >
                    ✓
                  </div>
                  <span><strong>I AGREE</strong> with the audit findings</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <div class="w-4 h-4 rounded border-2 border-gray-400"></div>
                  <span><strong>I DISAGREE</strong> with the audit findings</span>
                </div>
              </div>
              <div class="border-2 border-purple-400 rounded-lg p-3 my-3 relative">
                <div
                  class="absolute text-[8px] font-semibold px-2 py-0.5 rounded"
                  style="top: -10px; left: 12px; background: #ede9fe; color: #6b21a8;"
                >
                  🤖 AI analyzed comments
                </div>
                <div class="text-[10px] text-gray-600 italic leading-relaxed">
                  "I agree with the findings on the hip replacement but strongly
                  disagree with the downcode on the shoulder arthroscopy. Please see
                  attached operative report pp. 3-5."
                </div>
              </div>
            }
          </app-doc-viewer>
        </div>

        <!-- Workbench -->
        <div
          class="flex flex-col bg-white border-l flex-shrink-0 overflow-hidden"
          style="width: 440px;"
          [style.borderColor]="COLORS.gray200"
        >
          <div class="px-5 py-4 border-b flex-shrink-0" [style.borderColor]="COLORS.gray200">
            <div class="font-semibold text-sm">
              {{ isNoForm() ? 'Determine Provider Intent' : 'Resolve Provider Intent' }}
            </div>
            <div class="text-[11px] text-gray-500">
              {{
                isNoForm()
                  ? 'No response form detected — review packet context'
                  : 'Checkbox/content conflict — determine Agree or Disagree'
              }}
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <!-- AI Analysis Card -->
            <div
              class="rounded-xl p-4 mb-5 border"
              [style.background]="COLORS.aiGradient"
              [style.borderColor]="COLORS.aiBorder"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                  style="background: rgba(190,24,93,0.1);"
                  [style.color]="COLORS.pink"
                >
                  🤖
                </div>
                <div>
                  <div class="text-xs font-semibold" [style.color]="COLORS.aiText">
                    AI Intent Analysis
                  </div>
                  <div class="text-[10px]" [style.color]="COLORS.aiTextMuted">
                    {{
                      isNoForm()
                        ? 'No response form detected'
                        : 'Checkbox/content conflict detected'
                    }}
                  </div>
                </div>
              </div>
              @if (!isNoForm()) {
                <div
                  class="rounded-lg p-3 mb-3 bg-white border"
                  [style.borderColor]="COLORS.aiBorder"
                >
                  <div class="grid grid-cols-3 gap-2 items-center">
                    <div
                      class="text-center p-2 rounded-lg"
                      style="background: rgba(217,119,6,0.08); border: 1px solid rgba(217,119,6,0.2);"
                    >
                      <div
                        class="text-[9px] font-semibold uppercase mb-1"
                        [style.color]="COLORS.amber"
                      >
                        Checkbox
                      </div>
                      <div class="text-sm font-bold" [style.color]="COLORS.aiText">
                        ✓ Agree
                      </div>
                    </div>
                    <div class="text-center font-bold" [style.color]="COLORS.gray300">
                      VS
                    </div>
                    <div
                      class="text-center p-2 rounded-lg"
                      style="background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2);"
                    >
                      <div
                        class="text-[9px] font-semibold uppercase mb-1"
                        [style.color]="COLORS.purple"
                      >
                        Comments
                      </div>
                      <div class="text-sm font-bold" [style.color]="COLORS.aiText">
                        Mixed
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex items-center justify-between mt-3 pt-3"
                    [style.borderTop]="'1px solid ' + COLORS.gray200"
                  >
                    <span class="text-[10px]" [style.color]="COLORS.aiTextMuted"
                      >AI Confidence (content-wins)</span
                    >
                    <span class="text-lg font-bold" [style.color]="COLORS.red">58%</span>
                  </div>
                </div>
              } @else {
                <div
                  class="rounded-lg p-4 mb-3 text-center bg-white border"
                  [style.borderColor]="COLORS.aiBorder"
                >
                  <div class="text-3xl mb-2">📋</div>
                  <div class="text-sm font-semibold" [style.color]="COLORS.aiText">
                    No Provider Response Form
                  </div>
                  <div class="text-xs mt-1" [style.color]="COLORS.aiTextMuted">
                    Packet contains medical records and cover letter only
                  </div>
                </div>
              }
              <div
                class="rounded-lg p-3"
                [style.background]="
                  isNoForm() ? 'rgba(124,58,237,0.06)' : 'rgba(217,119,6,0.08)'
                "
                [style.border]="
                  isNoForm()
                    ? '1px solid rgba(124,58,237,0.15)'
                    : '1px solid rgba(217,119,6,0.2)'
                "
              >
                <div
                  class="text-[9px] font-semibold uppercase tracking-wide mb-1"
                  [style.color]="isNoForm() ? COLORS.purple : COLORS.amber"
                >
                  {{ isNoForm() ? 'ℹ' : '⚠' }} Why Human Review Needed
                </div>
                <div class="text-[11px] leading-relaxed" [style.color]="COLORS.gray700">
                  {{
                    isNoForm()
                      ? 'Provider sent records without a response form. Intent cannot be determined by AI.'
                      : 'Provider checked Agree but written comments express partial disagreement on shoulder arthroscopy downcode.'
                  }}
                </div>
              </div>
            </div>

            <!-- Correspondence History -->
            <div class="mb-5">
              <div
                class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
              >
                Correspondence History
              </div>
              <div class="pl-5 relative">
                <div
                  class="absolute w-0.5 bg-gray-200"
                  style="left: 7px; top: 4px; bottom: 4px;"
                ></div>
                @for (c of history(); track c.label) {
                  <div class="relative pb-4 last:pb-0">
                    <div
                      class="absolute w-2.5 h-2.5 rounded-full border-2"
                      style="left: -17px; top: 4px;"
                      [class.border-pink-600]="c.current"
                      [class.bg-pink-50]="c.current"
                      [class.border-gray-400]="!c.current"
                      [class.bg-white]="!c.current"
                    ></div>
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-xs font-semibold">{{ c.label }}</span>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded"
                        [class.bg-pink-50]="c.current"
                        [class.text-pink-700]="c.current"
                        [class.bg-gray-100]="!c.current"
                        [class.text-gray-500]="!c.current"
                        >{{ c.code }}</span
                      >
                    </div>
                    <div class="text-[10px] text-gray-500">{{ c.date }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Audit Context -->
            <div class="mb-5">
              <div
                class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Matched Audit
              </div>
              <div class="grid grid-cols-2 gap-2">
                @for (a of auditFields(); track a[0]) {
                  <div
                    class="px-3 py-2 rounded-lg"
                    [style.background]="COLORS.gray100"
                  >
                    <div class="text-[9px] text-gray-500">{{ a[0] }}</div>
                    <div class="text-xs font-semibold">{{ a[1] }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Intent Decision -->
            <div
              class="rounded-xl p-5 border-2"
              style="background: #fdf2f8; border-color: #fbcfe8;"
            >
              <div
                class="text-xs font-semibold uppercase tracking-wide mb-3"
                style="color: #9d174d;"
              >
                Your Determination
              </div>
              <div class="grid grid-cols-2 gap-3 mb-4">
                @for (opt of options; track opt) {
                  <button
                    type="button"
                    (click)="setIntent(opt)"
                    class="p-4 rounded-xl border-2 text-center transition-all"
                    [ngClass]="
                      intent() === opt
                        ? opt === 'agree'
                          ? 'border-green-600 bg-green-50 shadow-sm shadow-green-200'
                          : 'border-red-600 bg-red-50 shadow-sm shadow-red-200'
                        : 'border-gray-200 bg-white hover:border-pink-400'
                    "
                  >
                    <div class="text-2xl mb-1">
                      {{ opt === 'agree' ? '✅' : '❌' }}
                    </div>
                    <div class="text-sm font-semibold">
                      {{ opt === 'agree' ? 'Agree' : 'Disagree' }}
                    </div>
                    <div class="text-[10px] text-gray-500 mt-1">
                      {{
                        opt === 'agree'
                          ? 'Provider accepts findings'
                          : 'Provider appeals findings'
                      }}
                    </div>
                  </button>
                }
              </div>

              @if (intent()) {
                <div class="bg-white rounded-lg p-3 mb-3">
                  <div
                    class="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
                  >
                    What happens next (from rules engine)
                  </div>
                  <div
                    class="flex items-center gap-2.5 p-2.5 rounded-lg mb-2"
                    [style.background]="COLORS.gray100"
                  >
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style="background: #dbeafe; color: #1d4ed8;"
                    >
                      📄
                    </div>
                    <div>
                      <div class="text-xs font-semibold">
                        Response Type:
                        {{ intent() === 'agree' ? 'COM Signature Form' : 'COM Appeals 1' }}
                      </div>
                      <div class="text-[10px] text-gray-500">
                        FINDALL + {{ intent() === 'agree' ? 'Agree' : 'Disagree' }} →
                        {{ intent() === 'agree' ? 'COM Signature Form' : 'COM Appeals 1' }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-2.5 p-2.5 rounded-lg"
                    [style.background]="COLORS.gray100"
                  >
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      [style.background]="
                        intent() === 'agree' ? '#d1fae5' : '#fee2e2'
                      "
                      [style.color]="intent() === 'agree' ? '#059669' : '#dc2626'"
                    >
                      {{ intent() === 'agree' ? '→' : '⚡' }}
                    </div>
                    <div>
                      <div class="text-xs font-semibold">
                        Triggers:
                        {{
                          intent() === 'agree'
                            ? 'Provider Agreement workflow'
                            : 'Appeal Level 1 creation'
                        }}
                      </div>
                      <div class="text-[10px] text-gray-500">
                        {{
                          intent() === 'agree'
                            ? 'Audit → Ready for adjustment & reconciliation'
                            : 'Creates appeal in Audit Studio · SLA timer starts'
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="overrideOpen.set(!overrideOpen())"
                  class="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 mb-2"
                >
                  <span>{{ overrideOpen() ? '▾' : '▸' }}</span> Override Response Type
                </button>
                @if (overrideOpen()) {
                  <div
                    class="bg-white border rounded-lg p-3"
                    style="border-color: #fbcfe8;"
                  >
                    <div
                      class="flex items-start gap-2 p-2 rounded-md mb-2 text-[10px]"
                      style="background: #fef3c7; color: #92400e;"
                    >
                      ⚠️ Overriding rules engine output. Will be logged in audit trail.
                    </div>
                    <div
                      class="text-[10px] font-semibold mb-1"
                      style="color: #9d174d;"
                    >
                      Select Response Type
                    </div>
                    <select
                      class="w-full px-2 py-1.5 text-xs border rounded-md mb-2"
                      [style.borderColor]="COLORS.gray200"
                    >
                      <option>— Use rules engine result —</option>
                      <option>MR ALL</option>
                      <option>MR Additional Documents</option>
                      <option>COM Signature Form</option>
                      <option>COM Appeals 1</option>
                      <option>COM Appeals 3</option>
                    </select>
                    <div
                      class="text-[10px] font-semibold mb-1"
                      style="color: #9d174d;"
                    >
                      Override Reason (required)
                    </div>
                    <textarea
                      class="w-full px-2 py-1.5 text-xs border rounded-md resize-y"
                      [style.borderColor]="COLORS.gray200"
                      style="min-height: 50px;"
                      placeholder="Explain why the rules engine result is incorrect..."
                    ></textarea>
                  </div>
                }
              }
            </div>
          </div>
          <app-workbench-footer
            [itemNum]="activeIndex() + 1"
            [totalItems]="items.length"
          >
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-semibold"
              style="background: #fef3c7; color: #b45309; border: 1px solid #fcd34d;"
            >
              ⚠ Research
            </button>
            <button
              type="button"
              [disabled]="!intent()"
              (click)="submit()"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              [ngClass]="
                !intent()
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:-translate-y-0.5'
              "
              [style.background]="
                'linear-gradient(135deg, ' + COLORS.pink + ', #9d174d)'
              "
            >
              ✓ Submit Determination
            </button>
          </app-workbench-footer>
        </div>
      </div>
      <app-toast
        [message]="toastMsg()"
        [sub]="toastSub()"
        [visible]="toastVisible()"
      ></app-toast>
    </div>
  `
})
export class IntentReviewComponent {
  readonly COLORS = COLORS;
  readonly items = INTENT_ITEMS;
  readonly options: ('agree' | 'disagree')[] = ['agree', 'disagree'];

  readonly drawerOpen = signal(false);
  readonly activeId = signal<number>(INTENT_ITEMS[0].id);
  readonly intent = signal<'agree' | 'disagree' | null>(null);
  readonly overrideOpen = signal(false);
  readonly toastMsg = signal('');
  readonly toastSub = signal('');
  readonly toastVisible = signal(false);

  readonly active = computed<IntentItem>(
    () => this.items.find((i) => i.id === this.activeId()) ?? this.items[0]
  );
  readonly activeIndex = computed(() =>
    this.items.findIndex((i) => i.id === this.activeId())
  );
  readonly isNoForm = computed(() => this.active().scenario === 'no-form');

  readonly noFormRows = computed<[string, string][]>(() => [
    ['Patient', this.active().patient],
    ['MRN', 'MRN-2025-88421'],
    ['Admission', '10/03/2025'],
    ['Discharge', '10/08/2025']
  ]);

  readonly findingsRows = computed<[string, string][]>(() => [
    ['Patient', this.active().patient],
    ['DOB', '07/22/1965'],
    ['DOS', '11/14/2025 – 11/18/2025'],
    ['Audit #', this.active().audit]
  ]);

  readonly auditFields = computed<[string, string][]>(() => [
    ['Audit Number', this.active().audit],
    ['Patient', this.active().patient],
    ['Audit Type', 'DRG Validation'],
    ['Status', this.isNoForm() ? 'Awaiting Records' : 'Findings Issued']
  ]);

  readonly history = computed<HistoryEntry[]>(() =>
    this.isNoForm()
      ? [
          {
            label: 'Provider Response Received',
            code: 'Current',
            date: 'Jan 21, 2026',
            current: true
          },
          { label: 'Initial MR Request Sent', code: 'REQMI', date: 'Nov 20, 2025' }
        ]
      : [
          {
            label: 'Provider Response Received',
            code: 'Current',
            date: 'Jan 21, 2026',
            current: true
          },
          { label: 'Findings Letter Sent', code: 'FINDALL', date: 'Jan 3, 2026' },
          { label: 'Medical Records Received', code: 'REC', date: 'Dec 12, 2025' },
          { label: 'Initial MR Request Sent', code: 'REQMI', date: 'Nov 20, 2025' }
        ]
  );

  selectItem(id: number): void {
    this.activeId.set(id);
    this.drawerOpen.set(false);
    this.intent.set(null);
    this.overrideOpen.set(false);
  }

  setIntent(opt: 'agree' | 'disagree'): void {
    this.intent.set(opt);
    this.overrideOpen.set(false);
  }

  submit(): void {
    if (!this.intent()) return;
    const isAgree = this.intent() === 'agree';
    this.toastMsg.set(`Intent Resolved — ${isAgree ? 'Agree' : 'Disagree'}`);
    this.toastSub.set(
      isAgree
        ? 'COM Signature Form · Event published'
        : 'COM Appeals 1 · Event published'
    );
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }
}
