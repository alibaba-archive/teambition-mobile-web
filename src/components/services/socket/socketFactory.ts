'use strict';
import {app} from '../../config/config';

export const socket = angular.module('teambition').factory('socket', ['ngConsumer', (
  ngConsumer: any
) => {
  return (token: string) => {
    let ws = ngConsumer.connect(app.wsHost, {
      path: '/websocket',
      token: token
    });
    ws.on = (eventName: string, callback?: Function) => {
      return ngConsumer.onmessage(eventName, callback);
    };
    return ws;
  };
}]);
