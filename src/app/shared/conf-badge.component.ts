import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-conf-badge',
  standalone: true,
  template: `
    <span
      class="rounded-full font-bold"
      [class.text-lg]="size === 'lg'"
      [class.px-3]="size === 'lg'"
      [class.py-1]="size === 'lg'"
      [class.text-xs]="size !== 'lg'"
      [class.px-2]="size !== 'lg'"
      [class.py-0\\.5]="size !== 'lg'"
      [style.background]="bg()"
      [style.color]="color()"
      >{{ value }}%</span
    >
  `
})
export class ConfBadgeComponent {
  @Input() set value(v: number) {
    this._value.set(v);
  }
  get value(): number {
    return this._value();
  }
  @Input() size: 'sm' | 'lg' = 'sm';

  private _value = signal(0);

  readonly bg = computed(() => {
    const v = this._value();
    return v >= 95 ? '#d1fae5' : v >= 80 ? '#dbeafe' : '#fef3c7';
  });

  readonly color = computed(() => {
    const v = this._value();
    return v >= 95 ? '#059669' : v >= 80 ? '#1d4ed8' : '#b45309';
  });
}
