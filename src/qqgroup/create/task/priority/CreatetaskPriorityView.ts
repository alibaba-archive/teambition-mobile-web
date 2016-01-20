import {View} from '../../../';
import {createTemptask, PRIORITY} from '../CreateTaskView';

export class CreatetaskPriorityView extends View {
  public ViewName = 'CreatetaskPriorityView';
  public task: typeof createTemptask;
  public PRIORITY = PRIORITY;

  constructor() {
    super();
    this.zone.run(() => {
      this.task = createTemptask;
    });
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
