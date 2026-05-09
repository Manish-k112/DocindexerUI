import { Component, Input } from '@angular/core';

import { COLORS } from '@core/colors';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  template: `
    <div class="mb-4">
      <h2 class="text-lg font-bold" [style.color]="COLORS.dark">{{ title }}</h2>
      @if (sub) {
        <p class="text-xs text-gray-500">{{ sub }}</p>
      }
    </div>
  `
})
export class SectionHeadingComponent {
  @Input() title = '';
  @Input() sub = '';
  readonly COLORS = COLORS;
}
