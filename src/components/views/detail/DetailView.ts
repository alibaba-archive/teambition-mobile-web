/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  const objectTpls = {
    task: {
      url: 'detail/task/index.html',
      title: '任务详情'
    },
    post: {
      url: 'detail/post/index.html',
      title: '分享详情'
    },
    event: {
      url: 'detail/event/index.html',
      title: '日程详情'
    },
    work: {
      url: 'detail/file/index.html',
      title: '文件详情'
    },
    entry: {
      url: 'detail/entry/index.html',
      title: '记账详情'
    }
  };

  class DetailView extends View {

    public ViewName = 'DetailView';

    public objectTpl: string;

    protected _boundToObjectId: string;
    protected _boundToObjectType: string;
    protected _linkedId: string;
    protected detail: any;
    protected members: IMemberData[];

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
      this._boundToObjectId = this.$state.params._id;
      this._boundToObjectType = this.$state.params.type;
      this._linkedId = this.$state.params.linkedId;
      if (this._boundToObjectType !== 'entry') {
        return this.detailAPI.fetch(this._boundToObjectId, this._boundToObjectType, this._linkedId)
        .then((detail: any) => {
          this.detail = detail;
          this.members = detail.involveMembers;
          return detail;
        });
      }
    }

    public onAllChangesDone() {
      this.objectTpl = objectTpls[this._boundToObjectType].url;
    }

  }

  angular.module('teambition').controller('DetailView', DetailView);
}
