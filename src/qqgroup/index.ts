'use strict';

export * from '../bootstrap';
export * from '../components/services/apis/RESTFul';
import {app} from '../components/config';
import {RunFn} from './run';
import {rootZone} from '../components/bases/Utils';
import {Notify} from '../components/et/notify/notify';
import {InputComponments} from '../components/et/input/input';

angular.module('et.template')
.service('notify', Notify)
.service('InputComponments', InputComponments);

angular.module('teambition')
.constant('app', app)
.run(RunFn);

rootZone.run(() => {
  angular.element(document).ready(() => {
    angular.bootstrap(document, ['teambition']);
  });
});

export * from '../components/et/input/input';
export * from '../components/et/notify/notify';
export * from '../components/config';
export * from '../components/directives';
export * from '../components/filters';
export * from '../components/bases/Utils';
export * from '../components/bases/View';
export * from '../components/services';
export * from './router';
export * from './RootView';
