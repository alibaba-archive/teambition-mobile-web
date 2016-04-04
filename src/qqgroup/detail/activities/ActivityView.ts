'use strict';
import {parentView, inject, View, ActivityAPI} from '../../index';
import {IActivityData, IFileData} from 'teambition';

@parentView('DetailView')
@inject([
  'ActivityAPI'
])
export class ActivityView extends View {
  public activities: IActivityData[];

  private ActivityAPI: ActivityAPI;

  public onInit() {
    let _boundToObjectType = this.parent._boundToObjectType;
    let _boundToObjectId = this.parent._boundToObjectId;
    return this.ActivityAPI.fetch(_boundToObjectType, _boundToObjectId)
    .then((activities: IActivityData[]) => {
      this.activities = activities;
    });
  }

  public openDetail(linked: any) {
    if (linked) {
      window.location.hash = `/detail/${linked.objectType}/${linked._objectId}`;
    }
  }

  public openAtta(atta: IFileData) {
    if (atta.fileCategory === 'image') {
      console.log(atta);
    }else {
      window.location.hash = `/detail/work/${atta._id}`;
    }
  }
}

angular.module('teambition').controller('ActivityView', ActivityView);
