/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI'
  ])
  class CreateEventView extends View {

    public ViewName = 'CreateEventView';

    public title: string;
    public startDate: Date | string;
    public endDate: Date | string;
    public involveMembers: string[];
    public location: string;
    public content: string;
    public recurrence: string;

    private projectId: string;
    private DetailAPI: IDetailAPI;

    constructor() {
      super();
      this.startDate = new Date();
      this.endDate = new Date(Date.now() + 3600000);
      this.zone.run(() => {
        this.projectId = this.$state.params._id;
      });
    }

    public onAllChangesDone() {
      if (Ding) {
        Ding.setRight('确定', true, false, () => {
          this.createPost();
        });
        Ding.setLeft('取消', true, false, () => {
          window.history.back();
        });
      }
    }

    private createPost() {
      if (!this.title || !this.startDate || !this.endDate) {
        this.showLoading();
        this.DetailAPI.create('event', {
          _projectId: this.projectId,
          title: this.title,
          startDate: this.startDate,
          endDate: this.endDate,
          content: this.content,
          location: this.location,
          involveMembers: this.involveMembers,
          recurrence: [this.recurrence]
        })
        .then((event: IEventDataParsed) => {
          this.showMsg('success', '创建成功', '已成功创建日程', `#/detail/event/${event._id}`);
          this.hideLoading();
          window.history.back();
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '创建失败', message);
          this.hideLoading();
          window.history.back();
        });
      }
    }
  }

  angular.module('teambition').controller('CreateEventView', CreateEventView);
}
