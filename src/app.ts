export * from './bootstrap';
import {app} from './components/config';
import {RunFn, rootZone} from './run';
import {
  Notify,
  InputComponments,
  ProjectHomeActivity,
  TaskFilter
} from './components/et';

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

export * from './Run';
export * from './components/services/service';
export * from './components/directives/directive';
export * from './components/config';
export * from './components/bases';
export * from './components/et';
export * from './ding';
