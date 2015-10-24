/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let Consumer;

  angular.module('teambition').factory('ngConsumer',
  // @ngInject
  (
    RestAPI: IRestAPI
  ) => {
    let consumer = new Consumer();
    let join = consumer.join;
    let joined = [];
    consumer._join = (_id: string, consumerId: string) => {
      console.log(_id, consumerId);
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
      if (!event) {
        return;
      }
      let params = event.data ? event.data.params : '';
      let results = [];
      if (params instanceof Array) {
        angular.forEach(params, (data: any, index: number) => {
          results.push(JSON.parse(data));
        });
      }
      if (typeof(callback) === 'function') {
        callback(results);
      }
      console.log('results: ', results);
    };
    return consumer;
  });
}
