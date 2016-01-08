import {MomentLocale} from '../components/bases/MomentLocale';
import {app} from '../components/config/config';

export const RunFn = function() {
  app.NAME = 'teambition-qqgroup';
  MomentLocale(app.LANGUAGE, moment);
};
