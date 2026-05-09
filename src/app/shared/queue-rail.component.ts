import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { COLORS } from '@core/colors';
import { QueueItem } from '@core/models';

@Component({
  selector: 'app-queue-rail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center pt-3 border-r flex-shrink-0 bg-white"
      style="width: 52px;"
    >
      <button
        type="button"
        (click)="toggle.emit()"
        class="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3 border hover:bg-purple-50 hover:border-purple-300"
        [style.background]="COLORS.gray100"
        [style.borderColor]="COLORS.gray200"
      >
        ☰
      </button>
      <div class="text-xs font-bold" [style.color]="COLORS.purple">
        {{ availableCount }}
      </div>
      <div class="text-[8px] text-gray-400 uppercase tracking-wide mb-4">avail</div>
      <div class="flex flex-col gap-1.5 items-center">
        @for (item of items; track item.id; let idx = $index) {
          <button
            type="button"
            (click)="!item.locked && select.emit(item.id)"
            class="w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-all"
            [ngClass]="
              item.id === activeId
                ? 'text-white'
                : item.locked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
            "
            [style.background]="
              item.id === activeId
                ? COLORS.purple
                : item.locked
                ? '#fee2e2'
                : COLORS.gray100
            "
            style="border: 2px solid transparent; font-size: 10px;"
            [title]="item.locked ? 'Locked by ' + item.lockedBy : item.file"
          >
            {{ item.locked ? item.lockedBy : idx + 1 }}
          </button>
        }
      </div>
      <div class="mt-auto mb-3 flex flex-col gap-1 items-center">
        <button
          type="button"
          class="w-8 h-7 rounded border text-xs text-gray-500 bg-white hover:bg-gray-50"
          [style.borderColor]="COLORS.gray200"
        >
          ▲
        </button>
        <button
          type="button"
          class="w-8 h-7 rounded border text-xs text-gray-500 bg-white hover:bg-gray-50"
          [style.borderColor]="COLORS.gray200"
        >
          ▼
        </button>
      </div>
    </div>
  `
})
export class QueueRailComponent {
  @Input() items: QueueItem[] = [];
  @Input() activeId: number | null = null;
  @Output() select = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<void>();

  readonly COLORS = COLORS;

  get availableCount(): number {
    return this.items.filter((i) => !i.locked).length;
  }
}
