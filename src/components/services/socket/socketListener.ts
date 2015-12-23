'use strict';
import {app} from '../../config/config';

let listener = [];
const typeMap = [
  'new',
  'change',
  'refresh',
  'remove'
];
export let socketListener = (type: string, namespace: string, callback?: Function) => {
  if (!type || !namespace || !app.socket || typeMap.indexOf(type) === -1) {
    return;
  }
  let socket = app.socket;
  if (listener.indexOf(`:${type}:${namespace}`) !== -1) {
    return ;
  }
  listener.push(`:${type}:${namespace}`);

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

  socket.on(`:${type}:${namespace}`, buildCallback(type));
};
