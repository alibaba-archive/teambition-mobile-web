'use strict';
import {inject, View, DetailAPI} from '../../../index';

@inject([
  'DetailAPI'
])
export class EditNoteView extends View {
  public ViewName = 'EditNoteView';

  public detail: any;

  public note: string;

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
      this.note = this.detail.note;
    });
  }

  public updateNote() {
    if (this.note !== this.detail.note) {
      this.showLoading();
      this.DetailAPI.update(this.boundToObjectId, this.boundToObjectType, {
        note: this.note
      }, 'note')
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
    }else {
      window.history.back();
    }
  }

}

angular.module('teambition').controller('EditNoteView', EditNoteView);
