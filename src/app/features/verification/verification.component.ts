import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { COLORS } from '@core/colors';
import { VERIFY_ITEMS } from '@core/data';
import { VerifyItem } from '@core/models';
import { ConfBadgeComponent } from '@shared/conf-badge.component';
import { DocViewerComponent } from '@shared/doc-viewer.component';
import { QueueDrawerComponent } from '@shared/queue-drawer.component';
import { QueueRailComponent } from '@shared/queue-rail.component';
import { ToastComponent } from '@shared/toast.component';
import { WorkbenchFooterComponent } from '@shared/workbench-footer.component';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule,
    ConfBadgeComponent,
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
            title="items need verification"
            (select)="selectItem($event)"
            (close)="drawerOpen.set(false)"
          >
            <ng-template #badge let-item>
              <app-conf-badge [value]="item.confidence"></app-conf-badge>
            </ng-template>
          </app-queue-drawer>
        }

        <!-- Doc Viewer -->
        <div class="flex-1 min-w-0">
          <app-doc-viewer [title]="active().file + ' — Page 1 of ' + active().pages">
            <div class="text-center mb-4 pb-3 border-b-2 border-gray-200">
              <h3 class="text-sm font-bold">{{ active().provider }}</h3>
              <p class="text-[9px] text-gray-500">Medical Records Department</p>
            </div>
            <div class="text-[9px] font-semibold text-gray-500 mb-2">
              APPEAL DOCUMENTATION
            </div>
            <table class="w-full text-[10px] mb-3 border-collapse">
              <tbody>
                @for (row of docRows(); track row[0]) {
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
                        [style.background]="
                          row[0] === 'Patient' ? '#fef3c7' : 'rgba(124,58,237,0.1)'
                        "
                        [style.border]="
                          row[0] === 'Patient'
                            ? '1px solid #fcd34d'
                            : '1px solid rgba(124,58,237,0.2)'
                        "
                        >{{ row[1] }}</span
                      >
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (active().reason.includes('Name')) {
              <div class="bg-amber-50 px-2 py-1.5 rounded text-[9px] text-amber-800">
                <strong>⚠ AI Note:</strong> {{ active().reason }}
              </div>
            }
            <div class="mt-4 pt-3 border-t border-gray-200">
              <div
                class="text-[9px] font-semibold text-gray-500 uppercase mb-1"
              >
                History &amp; Physical (pp. 1-2)
              </div>
              <div class="text-[10px] text-gray-600 leading-relaxed">
                Chief Complaint: Left hip pain, progressive over 3 months. Patient is
                a 67-year-old male presenting for evaluation of progressive left hip
                osteoarthritis with decreasing mobility and increasing reliance on
                assistive device...
              </div>
            </div>
          </app-doc-viewer>
        </div>

        <!-- Workbench -->
        <div
          class="flex flex-col bg-white border-l flex-shrink-0 overflow-hidden"
          style="width: 440px;"
          [style.borderColor]="COLORS.gray200"
        >
          <div class="px-5 py-4 border-b flex-shrink-0" [style.borderColor]="COLORS.gray200">
            <div class="font-semibold text-sm">Verify AI Match</div>
            <div class="text-[11px] text-gray-500">
              Confirm indexing before applying
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <!-- Handoff Card -->
            <div
              class="rounded-xl p-4 mb-5 border"
              [style.background]="COLORS.aiGradient"
              [style.borderColor]="COLORS.aiBorder"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                  style="background: rgba(13,148,136,0.15);"
                  [style.color]="COLORS.teal"
                >
                  🤖
                </div>
                <div>
                  <div class="text-xs font-semibold" [style.color]="COLORS.aiText">
                    AI Analysis Complete
                  </div>
                  <div class="text-[10px]" [style.color]="COLORS.aiTextMuted">
                    Handed off for verification
                  </div>
                </div>
              </div>
              <div
                class="rounded-lg p-3 mb-3 bg-white border"
                [style.borderColor]="COLORS.aiBorder"
              >
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="text-[9px] uppercase tracking-wide"
                    [style.color]="COLORS.aiTextMuted"
                    >Matched Audit</span
                  >
                  <div class="flex items-center gap-1.5">
                    <span class="text-xl font-bold" [style.color]="COLORS.teal">{{
                      active().confidence
                    }}%</span>
                    <span class="text-[10px]" [style.color]="COLORS.aiTextMuted"
                      >conf.</span
                    >
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  @for (m of matchedFields(); track m[0]) {
                    <div>
                      <div class="text-[9px]" [style.color]="COLORS.aiTextMuted">
                        {{ m[0] }}
                      </div>
                      <div class="text-xs font-medium" [style.color]="COLORS.aiText">
                        {{ m[1] }}
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div
                class="rounded-lg p-3"
                style="background: rgba(217,119,6,0.08); border: 1px solid rgba(217,119,6,0.2);"
              >
                <div
                  class="text-[9px] font-semibold uppercase tracking-wide mb-1"
                  [style.color]="COLORS.amber"
                >
                  ⚠ Why Verification Needed
                </div>
                <div class="text-[11px] leading-relaxed" [style.color]="COLORS.gray700">
                  {{ active().reason }}
                </div>
              </div>
            </div>

            <!-- Classification -->
            <div class="mb-5">
              <div
                class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Clinical Classification
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                @for (c of classification; track c[0]) {
                  <div
                    class="flex items-center justify-between px-3 py-2 rounded-lg"
                    [style.background]="COLORS.gray100"
                  >
                    <span class="text-[11px] font-medium">{{ c[0] }}</span>
                    <span
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style="background: #d1fae5; color: #059669;"
                      >{{ c[1] }}</span
                    >
                  </div>
                }
              </div>
            </div>

            <!-- Keywords -->
            <div>
              <div
                class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Indexing Keywords
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                @for (k of keywords(); track k.label) {
                  <div>
                    <label
                      class="text-[10px] text-gray-500 mb-1 flex items-center gap-1"
                      >{{ k.label }}
                      <span
                        class="text-[8px] font-bold px-1 rounded"
                        [class.bg-purple-100]="k.src === 'AI'"
                        [class.text-purple-600]="k.src === 'AI'"
                        [class.bg-blue-100]="k.src === 'DB'"
                        [class.text-blue-600]="k.src === 'DB'"
                        >{{ k.src }}</span
                      ></label
                    >
                    @if (k.label === 'Doc Type') {
                      <select
                        class="w-full px-2 py-1.5 text-xs border rounded-md"
                        [style.borderColor]="COLORS.gray200"
                      >
                        <option>COM Appeals 1</option>
                        <option>MR ALL</option>
                      </select>
                    } @else {
                      <input
                        class="w-full px-2 py-1.5 text-xs border rounded-md"
                        style="background: #faf5ff; border-color: #c4b5fd;"
                        [value]="k.value"
                        [readOnly]="k.src === 'DB'"
                      />
                    }
                  </div>
                }
              </div>
            </div>
          </div>
          <app-workbench-footer
            [itemNum]="activeIndex() + 1"
            [totalItems]="items.length"
          >
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-semibold border"
              style="background: #fef3c7; color: #b45309; border-color: #fcd34d;"
            >
              ⚠ Research
            </button>
            <button
              type="button"
              (click)="confirm()"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              [style.background]="
                'linear-gradient(135deg, ' + COLORS.greenLight + ', ' + COLORS.green + ')'
              "
            >
              ✓ Confirm &amp; Index
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
export class VerificationComponent {
  readonly COLORS = COLORS;
  readonly items = VERIFY_ITEMS;

  readonly drawerOpen = signal(false);
  readonly activeId = signal<number>(VERIFY_ITEMS[0].id);
  readonly toastMsg = signal('');
  readonly toastSub = signal('');
  readonly toastVisible = signal(false);

  readonly active = computed<VerifyItem>(
    () => this.items.find((i) => i.id === this.activeId()) ?? this.items[0]
  );
  readonly activeIndex = computed(() =>
    this.items.findIndex((i) => i.id === this.activeId())
  );

  readonly docRows = computed<[string, string][]>(() => {
    const a = this.active();
    return [
      ['Patient', a.patient],
      ['DOB', '03/15/1958'],
      ['Audit #', a.audit],
      ['Claim #', a.claim]
    ];
  });

  readonly matchedFields = computed<[string, string][]>(() => {
    const a = this.active();
    return [
      ['Audit Number', a.audit],
      ['Claim Number', a.claim],
      ['Patient (System)', a.patient],
      ['Provider', a.provider]
    ];
  });

  readonly classification: [string, string][] = [
    ['📋 H&P', '97%'],
    ['📝 Progress Notes', '95%'],
    ['📊 Lab Results', '99%'],
    ['📄 Appeal Letter', '98%']
  ];

  readonly keywords = computed(() => {
    const a = this.active();
    const last = a.patient.split(', ')[0] ?? '';
    const first = a.patient.split(', ')[1]?.split(' ')[0] ?? '';
    return [
      { label: 'Audit #', value: a.audit, src: 'DB' as const },
      { label: 'Claim #', value: a.claim, src: 'DB' as const },
      { label: 'First Name', value: first, src: 'AI' as const },
      { label: 'Last Name', value: last, src: 'AI' as const },
      { label: 'DOB', value: '03/15/1958', src: 'AI' as const },
      { label: 'Doc Type', value: 'COM Appeals 1', src: 'AI' as const }
    ];
  });

  selectItem(id: number): void {
    this.activeId.set(id);
    this.drawerOpen.set(false);
  }

  confirm(): void {
    const a = this.active();
    this.toastMsg.set('Indexed Successfully');
    this.toastSub.set(`${a.audit} → AVA, Audit Studio`);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }
}
