/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  interface IImagesData {
    data: File;
    url: string;
  }

  const objectTpls = {
    task: {
      title: '任务详情'
    },
    post: {
      title: '分享详情'
    },
    event: {
      title: '日程详情'
    },
    work: {
      title: '文件详情'
    },
    entry: {
      title: '记账详情'
    }
  };

  let popup: ionic.popup.IonicPopupPromise;
  let boundToObjectId: string;

  @inject([
    'DetailAPI',
    'ActivityAPI',
    'ProjectsAPI',
    'MemberAPI',
    'EntryAPI',
    'WorkAPI',
    'LikeAPI',
    'StrikerAPI'
  ])
  class DetailView extends View {

    public ViewName = 'DetailView';

    public title: string;
    public fixWebkit = false;
    public comment: string;
    public project: IProjectDataParsed;
    public projectMembers: {
      [index: string]: IMemberData
    };

    protected _boundToObjectId: string;
    protected _boundToObjectType: string;
    protected _linkedId: string;
    protected detail: any;
    protected members: IMemberData[];

    private DetailAPI: IDetailAPI;
    private ActivityAPI: IActivityAPI;
    private StrikerAPI: IStrikerAPI;
    private ProjectsAPI: IProjectsAPI;
    private WorkAPI: IWorkAPI;
    private EntryAPI: IEntryAPI;
    private LikeAPI: ILikeAPI;
    private MemberAPI: IMemberAPI;
    private images: IImagesData[];

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.comment = '';
      this.images = [];
      this.zone.run(noop);
    }

    public onInit(): angular.IPromise<any> {
      this._boundToObjectId = this.$state.params._id;
      this._boundToObjectType = this.$state.params.type;
      this._linkedId = this.$state.params.linkedId;
      if (boundToObjectId === this._boundToObjectId) {
        return;
      }
      if (this._boundToObjectType !== 'entry') {
        return this.DetailAPI.fetch(this._boundToObjectId, this._boundToObjectType, this._linkedId)
        .then((detail: any) => {
          this.detail = detail;
          this.members = detail.members;
          return this.$q.all([
            this.MemberAPI.fetch(detail._projectId)
            .then((members: {[index: string]: IMemberData}) => {
              this.projectMembers = members;
            }),
            this.ProjectsAPI.fetchById(detail._projectId)
            .then((project: IProjectDataParsed) => {
              this.project = project;
            })
          ]);
        });
      }else {
        return this.EntryAPI.fetch(this._boundToObjectId)
        .then((data: IEntryData) => {
          this.detail = data;
          return data;
        });
      }
    }

    public onAllChangesDone() {
      this.title = objectTpls[this._boundToObjectType].title;
    }

    public showLikes() {
      popup = this.$ionicPopup.show({
        templateUrl: 'detail/likes/index.html',
        scope: this.$scope
      });
      this.fixWebkit = true;
    }

    public hideLikes() {
      popup.close();
      this.fixWebkit = false;
    }

    public loadImages (images: IImagesData[]) {
      this.images = this.images.concat(images);
    }

    public removeImage($index: number) {
      let item = this.images.splice($index, 1)[0];
      URL.revokeObjectURL(item.url);
    }

    public hasContent() {
      return !!(this.images.length || this.comment.length);
    }

    public like() {
      if (!this._boundToObjectType) {
        return;
      }
      return this.LikeAPI.postLike(
        this.detail
      );
    }

    public openLinked() {
      if (this.detail.linked) {
        window.location.hash = `/detail/${this._boundToObjectType}/${this._boundToObjectId}/link`;
      }
    }

    public addComment() {
      if (!this.comment && !this.images.length) {
        return ;
      }
      this.showLoading();
      let _projectId = this.detail._projectId;
      if (!this.images.length) {
        return this.addTextComment()
        .then(() => {
          this.hideLoading();
        });
      }else {
        let files = this.images.map((item: {data: File}) => {
          return item.data;
        });
        let strikerRes: IStrikerRes[];
        return this.StrikerAPI.upload(files)
        .then((data: any) => {
          if (data) {
            if (data.length) {
              strikerRes = data;
            }else {
              strikerRes = [data];
            }
          }else {
            strikerRes = [];
          }
        })
        .then(() => {
          return this.ProjectsAPI.fetchById(_projectId);
        })
        .then((project: IProjectDataParsed) => {
          let collectionId = project._defaultCollectionId;
          console.log(strikerRes);
          return this.WorkAPI.uploads(collectionId, _projectId, strikerRes);
        })
        .then((resp: IFileDataParsed[]) => {
          let attachments = [];
          angular.forEach(resp, (file: IFileDataParsed, index: number) => {
            attachments.push(file._id);
          });
          return attachments;
        })
        .then((attachments: string[]) => {
          return this.addTextComment(attachments);
        })
        .catch((reason: any) => {
          this.hideLoading();
        });
      }
    }

    public openEdit(name: string) {
      window.location.hash = `/detail/${this._boundToObjectType}/${this._boundToObjectId}/${name}`;
    }

    private addTextComment(attachments?: string[]) {
      attachments = (attachments && attachments.length) ? attachments : [];
      return this.ActivityAPI.save({
        _boundToObjectId: this._boundToObjectId,
        attachments: attachments,
        boundToObjectType: this._boundToObjectType,
        content: this.comment
      })
      .then(() => {
        this.comment = '';
        this.images = [];
        this.hideLoading();
      })
      .catch((reason: any) => {
        let msg = '网络错误';
        msg = (reason && typeof(reason.data) === 'object') ? reason.data.message : msg;
        this.showMsg('error', '评论失败', msg);
        this.hideLoading();
      });
    }

  }

  angular.module('teambition').controller('DetailView', DetailView);
}
