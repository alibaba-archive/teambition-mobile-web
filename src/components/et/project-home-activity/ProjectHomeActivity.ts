'use strict';
import {Component, ETComponent} from '../../bases/ETComponents';
import {inject} from '../../bases/Utils';

@Component({
  templateUrl: 'et/project-home-activity/index',
  selector: '.activities-wrap .activities-list',
  lazy: true
})
@inject([
  '$filter'
])
export class ProjectHomeActivity extends ETComponent {

  public formatDate: any;

  private $filter: angular.IFilterService;

  public show(scope: any) {
    this.formatDate = this.$filter('formatDate');
    this.bindContext(scope);
    this.insertDOM();
    return this;
  }
}
