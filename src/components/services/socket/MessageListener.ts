/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMessageListener {
    listen(callback: Function): void;
  }

  class MessageListener extends Listener implements IMessageListener {
    public listen(callback: Function) {
      this.listenTo('message', 'change', callback);
    }
  }

  angular.module('teambition').service('MessageListener', MessageListener);
}
