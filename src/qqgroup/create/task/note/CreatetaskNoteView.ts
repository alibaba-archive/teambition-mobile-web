import {View} from '../../../';
import {createTemptask} from '../CreateTaskView';

export class CreatetaskNoteView extends View {
  public task: typeof createTemptask;

  private note: string;

  public onAllChangesDone() {
    this.task = createTemptask;
    this.note = createTemptask.note;
  }

  public confirmNote() {
    this.task.note = this.note;
    window.history.back();
  }
}

angular.module('teambition').controller('CreatetaskNoteView', CreatetaskNoteView);
