import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lock-badge',
  standalone: true,
  template: `
    <div
      class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style="background: #fee2e2; color: #991b1b;"
    >
      🔒 {{ initials }}
    </div>
  `
})
export class LockBadgeComponent {
  @Input() initials = '';
}
