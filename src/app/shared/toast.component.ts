import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { COLORS } from '@core/colors';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl"
        [style.background]="COLORS.dark"
        style="color: white; animation: slideUp 0.3s ease;"
      >
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          [style.background]="COLORS.greenLight"
        >
          ✓
        </div>
        <div>
          <div class="font-semibold text-sm">{{ message }}</div>
          <div class="text-xs opacity-70">{{ sub }}</div>
        </div>
      </div>
    }
  `
})
export class ToastComponent {
  @Input() message = '';
  @Input() sub = '';
  @Input() visible = false;
  readonly COLORS = COLORS;
}
