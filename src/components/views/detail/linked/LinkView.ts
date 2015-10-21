/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  const iconMap = {
    task: 'icon-board',
    event: 'icon-td-calendar-blank',
    post: 'icon-wall',
    work: 'icon-file'
  };

  class LinkView extends View {

    public ViewName = 'LinkView';

    public linked: ILinkedData[];

    private detailAPI: IDetailAPI;
    // @ngInject
    constructor(
      detailAPI: IDetailAPI
    ) {
      super();
      this.detailAPI = detailAPI;
      this.zone.run(noop);
    }

    public onInit() {
      let id = this.$state.params._id;
      let type = this.$state.params.type;
      return this.detailAPI.fetch(id, type)
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
      this.detailAPI.fetch(item._linkedId, item.linkedType, item._id)
      .then((data: any) => {
        window.location.hash = `/detail/${item.linkedType}/${data._id}?linkedId=${item._id}`;
      })
      .catch((reason: any) => {
        this.showMsg('error', '打开关联失败', '无权限访问');
      });
    }

  }

  angular.module('teambition').controller('LinkView', LinkView);
}
