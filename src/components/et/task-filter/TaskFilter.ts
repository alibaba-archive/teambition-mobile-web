import {Component, ETComponent} from '../../bases/ETComponents';
import {inject} from '../../bases/Utils';
import {ITasklistData} from 'teambition';
'use strict';

let dropDownTimer: number;
let removeTimer: number;

@Component({
  templateUrl: 'et/task-filter/index',
  selector: 'body',
  lazy: true
})
@inject([
  '$ionicBackdrop'
])
export class TaskFilter extends ETComponent {

  public animateClass: string;
  public taskListGroup: ITasklistData[];
  public selectedTaskList: ITasklistData;
  private $ionicBackdrop: ionic.backdrop.IonicBackdropService;

  public show(scope: any) {
    window.clearTimeout(dropDownTimer);
    window.clearTimeout(removeTimer);
    this.$ionicBackdrop.release();
    this.animateClass = 'slideInDown';
    this.bindContext(scope);
    this.insertDOM();
    this.$ionicBackdrop.retain();
    return this;
  }

  public close(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    this.animateClass = 'slideOutUp';
    dropDownTimer = window.setTimeout(() => {
      this.$ionicBackdrop.release();
    }, 200);
    removeTimer = window.setTimeout(() => {
      this.remove();
    }, 400);

  }
}
