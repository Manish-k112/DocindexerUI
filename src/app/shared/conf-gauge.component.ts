import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-conf-gauge',
  standalone: true,
  template: `
    <div class="flex items-center gap-3 p-3 bg-white rounded-lg">
      <span
        class="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
        >Confidence</span
      >
      <div class="flex-1 h-2 bg-gray-200 rounded-full relative">
        <div
          class="absolute"
          style="left: 80%; top: -2px; bottom: -2px; width: 2px; background: rgba(0,0,0,0.2); border-radius: 1px;"
        ></div>
        <div
          class="absolute"
          style="left: 95%; top: -2px; bottom: -2px; width: 2px; background: rgba(0,0,0,0.2); border-radius: 1px;"
        ></div>
        <div
          class="h-full rounded-full transition-all"
          [style.width.%]="value"
          [style.background]="fillColor()"
        ></div>
      </div>
      <span
        class="text-xl font-bold tabular-nums"
        [style.color]="textColor()"
        style="min-width: 42px; text-align: right;"
        >{{ value }}%</span
      >
    </div>
  `
})
export class ConfGaugeComponent {
  @Input() set value(v: number) {
    this._value.set(v);
  }
  get value(): number {
    return this._value();
  }

  private _value = signal(0);

  readonly fillColor = computed(() => {
    const v = this._value();
    return v >= 95 ? '#059669' : v >= 80 ? '#d97706' : '#dc2626';
  });
  readonly textColor = this.fillColor;
}
