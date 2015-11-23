/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  @Component({
    templateUrl: 'et/input/file',
    selector: 'body',
    lazy: true
  })
  export class InputComponments extends ETComponent {

    private hasInserted = false;
    private input: any;

    public show(scope: any) {
      if (!this.hasInserted) {
        this.bindContext(scope);
        this.hasInserted = true;
        let evt = document.createEvent('MouseEvent');
        this.input = this.element.querySelector('.et-input-file');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.input.dispatchEvent(evt);
        this.input.addEventListener('change', (e: Event) => {
          e.preventDefault();
          scope.fileContent = this.input.files;
          scope.uploadFile(this.input.files);
          if (scope.$scope && !scope.$scope.$$phase) {
            scope.$scope.$digest();
          }
        });
      }
      return this;
    }
  }

  angular.module('et.template').service('InputComponments', InputComponments);
}
