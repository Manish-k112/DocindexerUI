import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';

import { COLORS } from '@core/colors';
import { QueueItem, VerifyItem } from '@core/models';

import { LockBadgeComponent } from './lock-badge.component';

@Component({
  selector: 'app-queue-drawer',
  standalone: true,
  imports: [CommonModule, LockBadgeComponent],
  template: `
    <div
      class="absolute top-0 bottom-0 bg-white border-r z-20 flex flex-col shadow-xl"
      style="left: 52px; width: 340px;"
      [style.borderColor]="COLORS.gray200"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b"
        [style.borderColor]="COLORS.gray200"
      >
        <span class="text-sm">
          <strong [style.color]="COLORS.purple">{{ items.length }}</strong>
          {{ title }}
        </span>
        <button
          type="button"
          (click)="close.emit()"
          class="w-7 h-7 rounded-md border flex items-center justify-center text-xs hover:bg-gray-50"
          [style.borderColor]="COLORS.gray200"
        >
          ✕
        </button>
      </div>
      <div class="flex-1 overflow-y-auto">
        @for (item of items; track item.id) {
          <div
            (click)="!item.locked && select.emit(item.id)"
            class="px-4 py-3 border-b cursor-pointer transition-colors"
            [ngClass]="
              item.locked
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50'
            "
            [style.background]="
              item.id === activeId
                ? 'linear-gradient(135deg, #ede9fe, #dbeafe)'
                : ''
            "
            [style.borderBottomColor]="COLORS.gray100"
            style="border-left-style: solid; border-left-width: 3px;"
            [style.borderLeftColor]="
              item.id === activeId ? COLORS.purple : 'transparent'
            "
          >
            <div class="flex items-start justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-md flex items-center justify-center text-[9px] font-bold"
                  style="background: #fee2e2; color: #dc2626;"
                >
                  {{ item.type }}
                </div>
                <div>
                  <div class="font-semibold text-xs truncate" style="max-width: 150px;">
                    {{ item.file }}
                  </div>
                  <div class="text-[10px] text-gray-500">
                    {{ item.channel }} · {{ item.pages }}p · {{ item.time }}
                  </div>
                </div>
              </div>
              @if (item.locked) {
                <app-lock-badge [initials]="item.lockedBy ?? ''"></app-lock-badge>
              } @else if (badgeTpl) {
                <ng-container
                  *ngTemplateOutlet="badgeTpl; context: { $implicit: item }"
                ></ng-container>
              }
            </div>
            @if (!item.locked) {
              <div
                class="rounded-md px-2.5 py-1.5 text-[10px]"
                [style.background]="
                  item.id === activeId
                    ? 'rgba(124,58,237,0.08)'
                    : COLORS.gray100
                "
              >
                <div
                  class="font-semibold uppercase tracking-wide mb-0.5"
                  [style.color]="COLORS.purple"
                  style="font-size: 9px;"
                >
                  🤖 {{ asVerify(item)?.confidence ? 'AI Match' : 'Routing Reason' }}
                </div>
                <div class="text-gray-600">
                  {{
                    asVerify(item)?.confidence
                      ? asVerify(item)!.audit + ' · ' + asVerify(item)!.patient
                      : item.reason
                  }}
                </div>
              </div>
            }
            @if (item.locked) {
              <div class="text-[10px] text-red-700 mt-1">
                🔒 Locked by {{ item.lockedBy }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class QueueDrawerComponent {
  @Input() items: QueueItem[] = [];
  @Input() activeId: number | null = null;
  @Input() title = '';
  @ContentChild('badge', { read: TemplateRef })
  badgeTpl: TemplateRef<{ $implicit: QueueItem }> | null = null;
  @Output() select = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  readonly COLORS = COLORS;

  asVerify(item: QueueItem): VerifyItem | null {
    return 'confidence' in item ? (item as VerifyItem) : null;
  }
}
