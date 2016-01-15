import {MomentLocale} from '../components/bases/MomentLocale';
import {app} from '../components/config/config';
import {IRootScope} from 'teambition';

export const RunFn = function($rootScope: IRootScope) {
  app.NAME = 'teambition-qqgroup';
  MomentLocale(app.LANGUAGE, moment);
  $rootScope.global.title = 'Teambition 任务';
};

RunFn.$inject = ['$rootScope'];
