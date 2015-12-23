'use strict';
import {
  Ding,
  inject,
  View,
  DetailAPI,
  MemberAPI
} from '../../index';
import {IMemberData} from 'teambition';

@inject([
  'DetailAPI',
  'MemberAPI'
])
export class EditInvolveView extends View {
  public ViewName = 'EditInvolveView';

  public detail: any;
  public members: {
    [index: string]: any
  };
  public isVisiable: boolean;

  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private boundToObjectType: string;
  private boundToObjectId: string;

  constructor() {
    super();
    this.zone.run(() => {
      this.boundToObjectId = this.$state.params._id;
      this.boundToObjectType = this.$state.params.type;
    });
  }

  public onInit() {
    return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
    .then((detail: any) => {
      this.detail = detail;
      this.isVisiable = (this.detail.visiable === 'involves');
      return this.MemberAPI.fetch(detail._projectId)
      .then((members: {[index: string]: IMemberData}) => {
        this.members = members;
      });
    });
  }

  public onAllChangesDone() {
    angular.forEach(this.members, (member: any) => {
      if (this.detail.involveMembers.indexOf(member._id) !== -1) {
        member.isSelected = true;
      }else {
        member.isSelected = false;
      }
    });
    if (Ding) {
      Ding.setRight('确定', true, false, () => {
        this.updateInvolve();
      });
    }
  }

  public selectExecutor(id: string) {
    this.members[id].isSelected = !this.members[id].isSelected;
  }

  private updateInvolve() {
    this.showLoading();
    let involveMembers = [];
    angular.forEach(this.members, (member: IMemberData) => {
      if (member.isSelected) {
        involveMembers.push(member._id);
      }
    });
    let promise = [
      this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        involveMembers: involveMembers
      }, 'involveMembers')
    ];
    if (this.isVisiable !== (this.detail.visiable === 'involves')) {
      let request = this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        visiable: this.isVisiable ? 'involves' : 'members'
      }, 'visiable');
      promise.push(request);
    }
    this.$q.all(promise)
    .then(() => {
      this.hideLoading();
      window.history.back();
    })
    .catch((reason: any) => {
      this.hideLoading();
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新参与者出错', message);
      window.history.back();
    });
  }
}

angular.module('teambition').controller('EditInvolveView', EditInvolveView);
