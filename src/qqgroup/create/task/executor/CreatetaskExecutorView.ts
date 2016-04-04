import {inject, View, MemberAPI} from '../../../';
import {createTemptask} from '../CreateTaskView';
import {IMemberData} from 'teambition';

@inject([
  'MemberAPI'
])
export class CreatetaskExecutrorView extends View {
  public task: any;
  public members: {
    [index: string]: IMemberData;
  };

  private MemberAPI: MemberAPI;
  private projectId: string;

  public onInit() {
    this.task = createTemptask;
    this.projectId = this.$state.params._id;
    return this.MemberAPI.fetch(this.projectId)
    .then((members: {[index: string]: IMemberData}) => {
      this.members = members;
    });
  }

  public chooseExecutor(id: string) {
    if (id !== this.task._executorId) {
      this.task._executorId = id;
    }
    window.history.back();
  }
}

angular.module('teambition').controller('CreatetaskExecutrorView', CreatetaskExecutrorView);
