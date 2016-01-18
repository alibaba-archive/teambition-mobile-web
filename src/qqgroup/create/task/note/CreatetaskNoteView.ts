import {View} from '../../../';
import {createTemptask} from '../CreateTaskView';

export class CreatetaskNoteView extends View {
  public ViewName = 'CreatetaskNoteView';
  public task: typeof createTemptask;

  private note: string;

  constructor() {
    super();
    this.task = createTemptask;
    this.note = createTemptask.note;
    this.zone.run(angular.noop);
  }

  public confirmNote() {
    this.task.note = this.note;
    window.history.back();
  }
}

angular.module('teambition').controller('CreatetaskNoteView', CreatetaskNoteView);
