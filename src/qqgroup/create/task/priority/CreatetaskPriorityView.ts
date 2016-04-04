import {View} from '../../../';
import {createTemptask, PRIORITY} from '../CreateTaskView';

export class CreatetaskPriorityView extends View {
  public task: typeof createTemptask;
  public PRIORITY = PRIORITY;

  public onAllChangesDone() {
    this.task = createTemptask;
  }

  public selectPriority(priority: number) {
    if (priority === this.task.priority) {
      return ;
    }
    this.task.priority = priority;
    window.history.back();
  }

}

angular.module('teambition').controller('CreatetaskPriorityView', CreatetaskPriorityView);
