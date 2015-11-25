/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI',
    'MemberAPI'
  ])
  class EditExectorView extends View {
    public ViewName = 'EditExectorView';

    public members: any;
    public detail: ITaskDataParsed;

    private DetailAPI: IDetailAPI;
    private MemberAPI: IMemberAPI;
    private boundToObjectId: string;
    private lastSelected: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.boundToObjectId = this.$state.params._id;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.boundToObjectId, 'task')
      .then((detail: ITaskDataParsed) => {
        this.detail = detail;
        return detail._projectId;
      })
      .then((projectId: string) => {
        return this.MemberAPI.fetch(projectId)
        .then((members: {[index: string]: IMemberData}) => {
          this.members = members;
          let executorId = this.detail._executorId ? this.detail._executorId : '0';
          angular.forEach(this.members, (member: IMemberData) => {
            if (member._id === executorId) {
              member.isSelected = true;
            }else {
              member.isSelected = false;
            }
          });
        });
      });
    }

    public selectExecutor(id: string) {
      if (id === this.detail._executorId) {
        return ;
      }
      this.showLoading();
      let _id = id === '0' ? null : id;
      return this.DetailAPI.update(this.boundToObjectId, 'task', {
        _executorId: _id
      })
      .then((patch: any) => {
        if (this.lastSelected) {
          this.members[this.lastSelected].isSelected = false;
        }
        this.members[id].isSelected = true;
        this.lastSelected = id;
        this.showMsg('success', '更新成功', '已成功更新任务执行者');
        this.hideLoading();
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '网络错误', message);
        this.hideLoading();
        window.history.back();
      });
    }
  }

  angular.module('teambition').controller('EditExectorView', EditExectorView);
}
