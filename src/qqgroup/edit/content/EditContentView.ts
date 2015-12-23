'use strict';
import {View, inject, DetailAPI} from '../../index';

@inject([
  'DetailAPI'
])
export class EditContentView extends View {
  public ViewName = 'EditContentView';

  public detail: any;

  public content: string;

  private DetailAPI: DetailAPI;
  private boundToObjectId: string;
  private boundToObjectType: string;

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
      this.content = this.detail.content;
    });
  }

  public updateContent() {
    if (this.content !== this.detail.content) {
      this.showLoading();
      this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        content: this.content
      }, 'content')
      .then(() => {
        this.hideLoading();
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '更新备注出错', message);
        this.hideLoading();
        window.history.back();
      });
    }
  }

}

angular.module('teambition').controller('EditContentView', EditContentView);
