import {inject, View, MemberAPI} from '../../../';
import {createTemptask} from '../CreateTaskView';
import {IMemberData} from 'teambition';

@inject([
  'MemberAPI'
])
export class CreatetaskInvolveView extends View {
  public ViewName = 'CreatetaskInvolveView';
  public task: typeof createTemptask;
  public members: {
    [index: string]: IMemberData;
  };

  private MemberAPI: MemberAPI;
  private projectId: string;

  constructor() {
    super();
    this.task = createTemptask;
    this.zone.run(() => {
      this.projectId = this.$state.params._id;
    });
  }

  public onInit() {
    return this.MemberAPI.fetch(this.projectId)
    .then((members: {[index: string]: IMemberData}) => {
      this.members = members;
    });
  }

  public onAllChangesDone() {
    angular.forEach(this.members, (val: IMemberData) => {
      if (this.task.involveMembers.indexOf(val._id) !== -1) {
        val.isSelected = true;
      }else {
        val.isSelected = false;
      }
    });
  }

  public selectInvolveMember(_id: string) {
    this.members[_id].isSelected = !this.members[_id].isSelected;
  }

  public getMemberSelectedLength() {
    let length = 0;
    if (this.members) {
      angular.forEach(this.members, (member: IMemberData) => {
        if (member.isSelected) {
          length ++;
        }
      });
    }
    return length;
  }

  // involve
  public selectInvolve() {
    angular.forEach(this.members, (member: IMemberData) => {
      if (member.isSelected && this.task.involveMembers.indexOf(member._id) === -1) {
        this.task.involveMembers.push(member._id);
      }
    });
    this.task.visiable = this.task.isVisiable ? 'involves' : 'members';
    window.history.back();
  }
}

angular.module('teambition').controller('CreatetaskInvolveView', CreatetaskInvolveView);
