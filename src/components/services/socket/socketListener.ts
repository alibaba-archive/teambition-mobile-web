/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  angular.module('teambition').factory('socketListener',
  // @ngInject
  (
    app: Iapp
  ) => {
    let listener = [];
    return (namespace: string) => {
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

      let changIsArchivedCallback = (model: any, isArchived: boolean) => {
        console.log(model, isArchived);
      };

      if (name !== 'project') {
        socket.on('change:isArchived', changIsArchivedCallback);
      }
      socket.on(`:new:${namespace}`, newMsgCallback);
      socket.on(`:change:${namespace}`, changeMsgCallback);
      socket.on(`:refresh:${namespace}`, refreshMsgCallback);
      socket.on(`:remove:${namespace}`, removeMsgCallback);
    };
  });
}
