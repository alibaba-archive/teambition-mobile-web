'use strict';

let $$injector;

export let getDeps = (name: string) => {
  if ($$injector) {
    return $$injector.get(name);
  }else {
    return angular.noop;
  }
}

export const inject = (services: string[]) => {
  if (!services || !services.length) {
    return;
  }
  let service: any;
  return function(Target: any) {
    angular.module('teambition').run(['$injector', ($injector: any) => {
      $$injector = $injector;
      angular.forEach(services, (name: string, index: number) => {
        try {
          service = $injector.get(name);
          Target.prototype[name] = service;
        } catch (error) {
          console.error(error);
        }
      });
    }]);
  };
};

export function parentView (name: string) {
  return function(TargetView: any) {
    TargetView.prototype.parentName = name;
  };
}

export const getParam = (search: string, name: string) => {
  if (!search || !name) {
    return '';
  }else {
    let _name: string = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex: RegExp = new RegExp('[\\?&]' + _name + '=([^&#]*)');
    let params: string = '?' + search.split('?')[1];
    let results: string[] = regex.exec(params);
    if (!results) {
      return '';
    }else {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  }
};
