import { Component, Input } from '@angular/core';

import { COLORS } from '@core/colors';

@Component({
  selector: 'app-doc-viewer',
  standalone: true,
  template: `
    <div class="flex flex-col h-full" [style.background]="COLORS.dark">
      <div
        class="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        [style.background]="COLORS.darkAlt"
      >
        <span class="text-white text-xs font-medium">{{ title }}</span>
        <div class="flex gap-1">
          @for (b of buttons; track b) {
            <button
              type="button"
              class="px-2 py-1 rounded text-xs border border-white/20 text-white bg-transparent hover:bg-white/10"
            >
              {{ b }}
            </button>
          }
        </div>
      </div>
      <div class="flex-1 p-4 overflow-auto flex items-start justify-center">
        <div
          class="bg-white rounded w-full h-full p-6 overflow-auto text-xs leading-relaxed"
        >
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class DocViewerComponent {
  @Input() title = '';
  readonly COLORS = COLORS;
  readonly buttons = ['◀', '▶', '🔍', '⬇'];
}
