import {MomentLocale} from '../components/bases/MomentLocale';
import {app} from '../components/config/config';

export const RunFn = function() {
  MomentLocale(app.LANGUAGE, moment);
};
