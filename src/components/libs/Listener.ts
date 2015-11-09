/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  @inject([
    'socketListener'
  ])
  export class Listener {
    private socketListener: ISocketListener;

    protected listenTo(type: string, namespace: string, callback: Function) {
      this.socketListener(type, namespace, ($type: string, data: any) => {
        callback(type, data);
      });
    }
  }

  angular.module('teambition').service('Listener', Listener);
}
