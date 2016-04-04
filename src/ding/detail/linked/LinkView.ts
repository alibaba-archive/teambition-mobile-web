'use strict';
import {inject, View, DetailAPI} from '../../index';
import {ILinkedData} from 'teambition';

const iconMap = {
  task: 'icon-board',
  event: 'icon-td-calendar-blank',
  post: 'icon-wall',
  work: 'icon-file'
};

@inject([
  'DetailAPI'
])
export class LinkView extends View {

  public linked: ILinkedData[];

  private DetailAPI: DetailAPI;

  public onInit() {
    let id = this.$state.params._id;
    let type = this.$state.params.type;
    return this.DetailAPI.fetch(id, type)
    .then((data: any) => {
      let linked = data.linked;
      angular.forEach(linked, (link: ILinkedData, index: number) => {
        link.icon = iconMap[link.linkedType];
      });
      this.linked = linked;
    });
  }

  public openDetail(item: ILinkedData) {
    if (!item) {
      return;
    }
    this.DetailAPI.fetch(item._linkedId, item.linkedType, item._id)
    .then((data: any) => {
      window.location.hash = `/detail/${item.linkedType}/${data._id}?linkedId=${item._id}`;
    })
    .catch((reason: any) => {
      this.showMsg('error', '打开关联失败', '无权限访问');
    });
  }

}

angular.module('teambition').controller('LinkView', LinkView);
