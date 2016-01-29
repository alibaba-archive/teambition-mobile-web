'use strict';

import {IRootScope} from 'teambition';
import {RestAPI} from '../apis/RESTFul';

declare let Consumer: any;

export interface IConsumer {
  _join(roomId: string, consumerId: string): void;
  join(roomId: string): angular.IPromise<any>;
  onmessage(eventName: Event | string, callback: (result: any) => any);
}

let joined = [];
let listener = {};

export const ngConsumer = angular.module('teambition').factory('ngConsumer', ['$rootScope', 'RestAPI',
(
  $rootScope: IRootScope,
  RestAPI: RestAPI
) => {
  let consumer = new Consumer();
  let join = consumer.join;

  let fireListener = (listeners: Function[], result: any) => {
    if (!listeners || !listeners.length) {
      return ;
    }
    for (let index = 0; index < listeners.length; index++) {
      let _listener = listeners[index];
      if (typeof _listener === 'function') {
        _listener(result);
      }
    }
    if (!$rootScope.$$phase) {
      $rootScope.$digest();
    }
  };

  consumer._join = (_id: string, consumerId: string) => {
    if (!_id) {
      return;
    }
    return RestAPI.save({
      Type: 'projects',
      Id: _id,
      Path1: 'subscribe'
    }, {
      consumerId: consumerId
    });
  };
  consumer.join = (_id: string) => {
    if (joined.indexOf(_id) === -1) {
      join.call(consumer, _id);
      joined.push(_id);
    }
  };
  consumer.onmessage = (event: any, callback: Function) => {
    console.log(event);
    if (!event) {
      return;
    }
    if (typeof event === 'string') {
      if (typeof callback === 'function') {
        if (listener[event] && listener[event].length) {
          if (listener[event].indexOf(callback) === -1) {
            listener[event].push(callback);
          }
        }else {
          listener[event] = [callback];
        }
      }
    }else {
      const params = event.data ? event.data.params : '';
      const results = [];
      if (params instanceof Array) {
        angular.forEach(params, (data: any, index: number) => {
          const result = JSON.parse(data);
          const e: string = result.e;
          const d = result.d;
          const namespace = e.split('/')[0];
          if (e.indexOf('message') !== -1 && typeof d === 'object') {
            const _id = e.split('/')[1];
            d.msgId = _id;
            fireListener(listener[namespace], d);
          }else if (namespace.indexOf('new') !== -1) {
            fireListener(listener[namespace], d);
          }else {
            fireListener(listener[e], d);
          }
        });
      }
      if (results.length) {
        console.log('results: ', results);
      }
    }
  };
  return consumer;
}]);
