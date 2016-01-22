'use strict';

angular.module('teambition', [
  'ionic',
  'ngResource',
  'tbTemplates',
  'ngFileUpload',
  'et.template'
]);

import {RunFn} from './run';
import {
  Notify,
  ProjectHomeActivity
} from '../components/et';
import {rootZone} from '../components/bases/Utils';

angular.module('et.template')
.service('notify', Notify)
.service('ProjectHomeActivity', ProjectHomeActivity);

angular.module('teambition')
.run(RunFn);

rootZone.run(() => {
  angular.element(document).ready(() => {
    angular.bootstrap(document, ['teambition']);
  });
});

export * from './router';
export * from '../components/services';
export * from '../components/directives';
export * from '../components/config';
export * from '../components/bases';
export * from '../components/et';
export * from './RootView';
