/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export type ISocketListener = (namespace: string, callback?: Function) => void;

  angular.module('teambition').factory('socketListener',
  // @ngInject
  (
    app: Iapp
  ) => {
    let listener = [];
    return (namespace: string, callback?: Function) => {
      if (!namespace || !app.socket) {
        return;
      }
      let socket = app.socket;
      if (listener.indexOf(namespace) !== -1) {
        return ;
      }
      listener.push(namespace);

      let newMsgCallback = (data: any) => {
        console.log(data, `:new:${namespace}`);
      };

      let changeMsgCallback = (data: any) => {
        console.log(data, `:change:${namespace}`);
      };

      let refreshMsgCallback = (_id: string) => {
        console.log(_id, `:refresh:${namespace}`);
      };

      let removeMsgCallback = (_id: string) => {
        console.log(_id, `:remove:${namespace}`);
      };

      let changeIsArchivedCallback = (model: any, isArchived: boolean) => {
        console.log(model, isArchived);
      };

      let buildCallback = (type: string) => {
        return (...args: any[]) => {
          if (callback) {
            args.unshift(type);
            callback.apply(null, args);
          }else {
            switch (type) {
              case 'new':
                newMsgCallback.apply(null, args);
                break;
              case 'change':
                changeMsgCallback.apply(null, args);
                break;
              case 'refresh':
                refreshMsgCallback.apply(null, args);
                break;
              case 'remove':
                removeMsgCallback.apply(null, args);
                break;
              case 'isArchived':
                changeIsArchivedCallback.apply(null, args);
                break;
            }
          }
        };
      };

      if (name !== 'project') {
        socket.on('change:isArchived', buildCallback('change'));
      }

      socket.on(`:new:${namespace}`, buildCallback('new'));
      socket.on(`:change:${namespace}`, buildCallback('change'));
      socket.on(`:refresh:${namespace}`, buildCallback('refresh'));
      socket.on(`:remove:${namespace}`, buildCallback('remove'));
    };
  });
}
