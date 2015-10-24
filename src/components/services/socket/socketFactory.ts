/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  angular.module('teambition').factory('socket',
  // @ngInject
  (
    app: Iapp,
    ngConsumer: any
  ) => {
    return (token: string) => {
      let ws = ngConsumer.connect(app.wsHost, {
        path: '/websocket',
        token: token
      });
      ws.on = (eventName: string, callback?: Function) => {
        return ngConsumer.onmessage(event, (data?: any) => {
          console.log(event);
        });
      };
      return ws;
    };
  });
}
