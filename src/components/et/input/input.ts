import {Component, ETComponent} from '../../bases/ETComponents';

'use strict';

@Component({
  templateUrl: 'et/input/file',
  selector: 'body',
  lazy: true
})
export class InputComponments extends ETComponent {

  private input: any;

  public show(scope: any) {
    this.bindContext(scope);
    let evt = document.createEvent('MouseEvent');
    this.input = this.element.querySelector('.et-input-file');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    this.input.dispatchEvent(evt);
    return this;
  }
}
