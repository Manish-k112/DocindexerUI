import { Component, Input } from '@angular/core';

import { COLORS } from '@core/colors';

@Component({
  selector: 'app-workbench-footer',
  standalone: true,
  template: `
    <div
      class="flex items-center justify-between px-5 py-3 border-t flex-shrink-0"
      style="background: #f9fafb;"
      [style.borderColor]="COLORS.gray200"
    >
      <span class="text-xs text-gray-500"
        >Item {{ itemNum }} of {{ totalItems }} · Auto-advance on</span
      >
      <div class="flex gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class WorkbenchFooterComponent {
  @Input() itemNum = 0;
  @Input() totalItems = 0;
  readonly COLORS = COLORS;
}
