/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  angular.module('teambition').factory('socketListener',
  // @ngInject
  (
    app: Iapp
  ) => {
    let listener = [];
    return (params: IRestPaths) => {
      if (!params || !app.socket) {
        return;
      }
      let socket = app.socket;
      let name = params.Type === 'projects' ? 'project' : params.Type;
      let _id = params.Id || params._boundToObjectId;
      let namespace = name;

      if (_id) {
        namespace = `${name}/${_id}`;
      }
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
      }else if (_id) {
        socket.join(_id);
      }
      socket.on(`:new:${namespace}`, newMsgCallback);
      socket.on(`:change:${namespace}`, changeMsgCallback);
      socket.on(`:refresh:${namespace}`, refreshMsgCallback);
      socket.on(`:remove:${namespace}`, removeMsgCallback);
    };
  });
}
