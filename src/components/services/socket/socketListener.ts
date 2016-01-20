'use strict';
import {app} from '../../config/config';

const listener = [];
export const cacheListener = [];
const typeMap = [
  'new',
  'change',
  'refresh',
  'remove'
];
export const socketListener = (type: string, namespace: string, callback?: Function) => {
  if (!type || !namespace || !app.socket || typeMap.indexOf(type) === -1) {
    return;
  }
  const socket = app.socket;
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
    if (!socket) {
      cacheListener.push(() => {
        socket.on('change:isArchived', buildCallback('change'));
      });
    }else {
      socket.on('change:isArchived', buildCallback('change'));
    }
  }

  if (!socket) {
    cacheListener.push(() => {
      socket.on(`:${type}:${namespace}`, buildCallback(type));
    });
  }else {
    socket.on(`:${type}:${namespace}`, buildCallback(type));
  }
};
