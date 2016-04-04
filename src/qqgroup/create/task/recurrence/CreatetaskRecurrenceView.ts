import {View} from '../../../';
import {createTemptask, recurrence} from '../CreateTaskView';

let lastRecurrneceIndex: number;

export class CreatetaskRecurrenceView extends View {
  public task: typeof createTemptask;
  public recurrence = recurrence;

  public onAllChangesDone() {
    this.task = createTemptask;
    angular.forEach(this.recurrence, (val: any, index: number) => {
      if (val.isSelected) {
        lastRecurrneceIndex = index;
      }
    });
  }

  public chooseRecurrence($index: number) {
    this.recurrence[lastRecurrneceIndex || 0].isSelected = false;
    lastRecurrneceIndex = $index;
    this.recurrence[$index].isSelected = true;
    this.task.recurrenceStr = this.recurrence[$index].recurrence;
    this.task.recurrenceName = this.recurrence[$index].name;
    window.history.back();
  }

}

angular.module('teambition').controller('CreatetaskRecurrenceView', CreatetaskRecurrenceView);
