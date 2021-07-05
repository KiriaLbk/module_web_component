import {ApplicationRef, ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'web-text',
  template: `
    <p>
      custome-element works!
      text = "{{text}}"
    </p>
    <button (click) = "click()">Change text</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  @Input() text = '';
  @Output() change = new EventEmitter();

  constructor(private app: ApplicationRef) {}

  click(){
    this.text = Math.random().toString();
    console.log(this.text);
    this.change.emit(this.text);
    this.app.tick();
  }
}
