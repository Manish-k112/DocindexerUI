import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { COLORS } from '@core/colors';
import { RESEARCH_ITEMS } from '@core/data';
import { ResearchItem } from '@core/models';
import { DocViewerComponent } from '@shared/doc-viewer.component';
import { QueueDrawerComponent } from '@shared/queue-drawer.component';
import { QueueRailComponent } from '@shared/queue-rail.component';
import { ToastComponent } from '@shared/toast.component';
import { WorkbenchFooterComponent } from '@shared/workbench-footer.component';

@Component({
  selector: 'app-research',
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
            title="items need research"
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

        <div class="flex-1 min-w-0">
          <app-doc-viewer [title]="active().file + ' — Page 1 of ' + active().pages">
            <div class="text-center mb-4 pb-3 border-b-2 border-gray-200">
              <h3 class="text-sm font-bold">Medical Records</h3>
              <p class="text-[9px] text-gray-500">
                Received via {{ active().channel }}
              </p>
            </div>
            <div
              class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center my-6"
            >
              <div class="text-2xl mb-2">🔬</div>
              <div class="text-xs font-semibold text-amber-800">
                {{ active().badge }}
              </div>
              <div class="text-[10px] text-amber-700 mt-1">{{ active().reason }}</div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200">
              <div class="text-[9px] font-semibold text-gray-500 uppercase mb-1">
                Document Content Preview
              </div>
              <div class="text-[10px] text-gray-600 leading-relaxed">
                This document contains clinical records that could not be automatically
                matched to an audit record. Manual research is required to identify the
                correct audit and apply indexing keywords.
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
            <div class="font-semibold text-sm">Research &amp; Index</div>
            <div class="text-[11px] text-gray-500">
              Search for the correct audit and apply indexing
            </div>
          </div>
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div
              class="rounded-xl p-4 mb-5 border"
              [style.background]="COLORS.aiGradient"
              [style.borderColor]="COLORS.aiBorder"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                  style="background: rgba(217,119,6,0.1);"
                >
                  🔬
                </div>
                <div>
                  <div class="text-xs font-semibold" [style.color]="COLORS.aiText">
                    Manual Research Required
                  </div>
                  <div class="text-[10px]" [style.color]="COLORS.aiTextMuted">
                    {{ active().badge }}
                  </div>
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
                  Reason
                </div>
                <div class="text-[11px]" [style.color]="COLORS.gray700">
                  {{ active().reason }}
                </div>
              </div>
            </div>

            <div class="mb-5">
              <div
                class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
              >
                Audit Search
              </div>
              <div class="grid grid-cols-2 gap-2 mb-3">
                @for (f of searchFields; track f) {
                  <div>
                    <label class="text-[10px] text-gray-500">{{ f }}</label>
                    <input
                      class="w-full px-2 py-1.5 text-xs border rounded-md"
                      [style.borderColor]="COLORS.gray200"
                      [placeholder]="f"
                    />
                  </div>
                }
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  [style.background]="COLORS.purple"
                >
                  Search
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg text-xs font-semibold border"
                  [style.borderColor]="COLORS.gray200"
                >
                  Clear
                </button>
              </div>
            </div>

            <div class="text-center py-8 text-gray-400">
              <div class="text-3xl mb-2">🔍</div>
              <div class="text-xs">Search for an audit to begin indexing</div>
            </div>
          </div>
          <app-workbench-footer
            [itemNum]="activeIndex() + 1"
            [totalItems]="items.length"
          >
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-semibold text-white opacity-50 cursor-not-allowed"
              [style.background]="COLORS.green"
            >
              ✓ Apply Index
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
export class ResearchComponent {
  readonly COLORS = COLORS;
  readonly items = RESEARCH_ITEMS;
  readonly searchFields = [
    'Patient Name',
    'DOB',
    'Claim Number',
    'Audit Number',
    'Dates of Service',
    'Provider'
  ];

  readonly drawerOpen = signal(false);
  readonly activeId = signal<number>(RESEARCH_ITEMS[0].id);
  readonly toastMsg = signal('');
  readonly toastSub = signal('');
  readonly toastVisible = signal(false);

  readonly active = computed<ResearchItem>(
    () => this.items.find((i) => i.id === this.activeId()) ?? this.items[0]
  );
  readonly activeIndex = computed(() =>
    this.items.findIndex((i) => i.id === this.activeId())
  );

  selectItem(id: number): void {
    this.activeId.set(id);
    this.drawerOpen.set(false);
  }
}
