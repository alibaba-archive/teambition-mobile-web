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
      let name = params.Type;
      let _id = params.Id || params._boundToObjectId;
      let namespace = name;
      if (_id) {
        namespace = `${name}/${_id}`;
      }
      if (listener.indexOf(namespace) !== -1) {
        return ;
      }
      listener.push(namespace);
      if (name !== 'projects') {
        socket.on('change:isArchived', (model: any, isArchived: boolean) => {
          console.log(model, isArchived);
        });
      }else if (_id) {
        socket.join(_id);
      }
      socket.on(`:new:${namespace}`, (data: any) => {
        console.log(data);
      });
      socket.on(`:change:${namespace}`, (data: any) => {
        console.log(data);
      });
      socket.on(`:refresh:${namespace}`, (_id: string) => {
        console.log(_id);
      });
      socket.on(`:remove:${namespace}`, (_id: string) => {
        console.log(_id);
      });
      socket.on(`:remove:${namespace}`, (_id: string) => {
        console.log(_id);
      });
    };
  });
}
