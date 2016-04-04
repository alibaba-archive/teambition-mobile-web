'use strict';
import {View, getParam} from '../';

export class LoginView extends View {

  public aid = getParam(window.location.hash, 'aid');

}

angular.module('teambition').controller('LoginView', LoginView);
