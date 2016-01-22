'use strict';
import {View, getParam} from '../';

export class LoginView extends View {
  public ViewName = 'LoginView';

  public aid = getParam(window.location.hash, 'aid');

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

}

angular.module('teambition').controller('LoginView', LoginView);
