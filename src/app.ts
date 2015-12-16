/// <reference path="./typings.d.ts" />
export * from './bootstrap';
import {app} from './components/config/config';
import {RunFn, rootZone} from './run';
import {
  Notify,
  InputComponments,
  ProjectHomeActivity,
  TaskFilter
} from './components/et/ETs';

angular.module('et.template')
.service('notify', Notify)
.service('InputComponments', InputComponments)
.service('ProjectHomeActivity', ProjectHomeActivity)
.service('taskFilter', TaskFilter);

angular.module('teambition')
.constant('app', app)
.constant('moment', moment)
.constant('marked', marked)
.run(RunFn);

rootZone.run(() => {
  angular.element(document).ready(() => {
    angular.bootstrap(document, ['teambition']);
  });
});

export * from './components/config/config';
export * from './components/services/service';
export * from './components/dingtalk/Views';
export * from './components/config/ngConfig';
export * from './components/config/router';
export * from './components/directives/directive';
