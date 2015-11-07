/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let Consumer;

  export interface IConsumer {
    _join(roomId: string, consumerId: string): void;
    join(roomId: string): angular.IPromise<any>;
    onmessage(eventName: Event | string, callback: (result: any) => any);
  }

  let joined = [];
  let listener = {};

  angular.module('teambition').factory('ngConsumer',
  // @ngInject
  (
    RestAPI: IRestAPI
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
      console.log('join');
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
        let params = event.data ? event.data.params : '';
        let results = [];
        if (params instanceof Array) {
          angular.forEach(params, (data: any, index: number) => {
            let result = JSON.parse(data);
            let e: string = result.e;
            let d = result.d;
            if (e.indexOf('message') !== -1) {
              if (e.indexOf('change') !== -1 || e.indexOf('new') !== -1) {
                let _id = e.split('/')[1];
                d.msgId = _id;
                return fireListener(listener[':change:message'], d);
              }
            }
            fireListener(listener[e], d);
          });
        }
        if (results.length) {
          console.log('results: ', results);
        }
      }
    };
    return consumer;
  });
}
