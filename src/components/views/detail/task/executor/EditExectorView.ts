/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    '$ionicHistory',
    'DetailAPI',
    'MemberAPI'
  ])
  class EditExectorView extends View {
    public ViewName = 'EditExectorView';

    public members: any;
    public detail: ITaskData;

    private $ionicHistory: ionic.navigation.IonicHistoryService;
    private DetailAPI: IDetailAPI;
    private MemberAPI: IMemberAPI;
    private boundToObjectType: string;
    private boundToObjectId: string;
    private lastSelected: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.boundToObjectId = this.$state.params._id;
        this.boundToObjectType = this.$state.params.type;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
      .then((detail: ITaskData) => {
        this.detail = detail;
        return detail._projectId;
      })
      .then((projectId: string) => {
        return this.MemberAPI.fetch(projectId)
        .then((members: {[index: string]: IMemberData}) => {
          this.members = members;
          let exector = this.members[this.detail._executorId];
          if (exector) {
            exector.isSelected = true;
            this.lastSelected = this.detail._executorId;
          }
        });
      });
    }

    public selectExecutor(id: string) {
      if (id === this.detail._executorId) {
        return ;
      }
      this.showLoading();
      return this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        _executorId: id
      })
      .then((patch: any) => {
        this.members[this.lastSelected].isSelected = false;
        this.members[id].isSelected = true;
        this.lastSelected = id;
        this.showMsg('success', '更新成功', '已成功更新任务执行者');
        this.hideLoading();
        this.$ionicHistory.goBack();
      })
      .catch((reason: any) => {
        this.showMsg('error', '网络错误', '更新任务执行者失败');
        this.hideLoading();
        this.$ionicHistory.goBack();
      });
    }
  }

  angular.module('teambition').controller('EditExectorView', EditExectorView);
}
