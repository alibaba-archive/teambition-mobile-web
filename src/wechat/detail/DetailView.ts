'use strict';
import {
  inject,
  View,
  DetailAPI,
  ActivityAPI,
  StrikerAPI,
  ProjectsAPI,
  WorkAPI,
  EntryAPI,
  LikeAPI
} from '../index';
import {
  IStrikerRes,
  IProjectData,
  IMemberData,
  IEntryData,
  IFileData
} from 'teambition';

interface IImagesData {
  data: File;
  url: string;
}

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

let popup: ionic.popup.IonicPopupPromise;

@inject([
  'DetailAPI',
  'ActivityAPI',
  'ProjectsAPI',
  'EntryAPI',
  'WorkAPI',
  'LikeAPI',
  'StrikerAPI'
])
export class DetailView extends View {

  public objectTpl: string;
  public fixWebkit = false;
  public comment: string = '';
  public project: IProjectData;

  protected $state: angular.ui.IStateService & ng.ui.IState;
  protected _boundToObjectId: string;
  protected _boundToObjectType: string;
  protected _linkedId: string;
  protected detail: any;
  protected members: IMemberData[];

  private DetailAPI: DetailAPI;
  private ActivityAPI: ActivityAPI;
  private StrikerAPI: StrikerAPI;
  private ProjectsAPI: ProjectsAPI;
  private WorkAPI: WorkAPI;
  private EntryAPI: EntryAPI;
  private LikeAPI: LikeAPI;
  private images: IImagesData[] = [];

  public onInit(): angular.IPromise<any> {
    this._boundToObjectId = this.$state.params._id;
    this._boundToObjectType = this.$state.params.type;
    this._linkedId = this.$state.params.linkedId;
    if (this._boundToObjectType !== 'entry') {
      let deferred = this.$q.defer();
      this.DetailAPI.fetch(this._boundToObjectId, this._boundToObjectType, this._linkedId)
      .then((detail: any) => {
        this.detail = detail;
        this.members = detail.members;
        this.ProjectsAPI.fetchById(detail._projectId)
        .then((project: IProjectData) => {
          this.project = project;
          deferred.resolve(project);
        });
      })
      .catch(error => {
        if (error.status === 403) {
          return this.noAccess();
        }
        this.showMsg(
          'error',
          '数据加载失败',
          this.getFailureReason(error)
        );
      });
      return deferred.promise;
    }else {
      return this.EntryAPI.fetch(this._boundToObjectId)
      .then((data: IEntryData) => {
        this.detail = data;
        return data;
      });
    }
  }

  public onAllChangesDone() {
    this.objectTpl = objectTpls[this._boundToObjectType].url;
  }

  public showExecutors() {
    popup = this.$ionicPopup.show({
      templateUrl: 'detail/executors/index.html',
      scope: this.$scope
    });
    this.fixWebkit = true;
  }

  public hideExecutors() {
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
    return this.LikeAPI.postLike(this._boundToObjectType, this.detail);
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
      .then(project => {
        let collectionId = project._defaultCollectionId;
        console.log(strikerRes);
        return this.WorkAPI.uploads(collectionId, _projectId, strikerRes);
      })
      .then(resp => {
        let attachments = [];
        angular.forEach(resp, (file: IFileData, index: number) => {
          attachments.push(file._id);
        });
        return attachments;
      })
      .then(attachments => {
        return this.addTextComment(attachments);
      })
      .catch(reason => {
        this.hideLoading();
      });
    }
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
    })
    .catch(reason => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '评论失败', message);
    })
    .then(() => {
      this.hideLoading();
    });
  }

  // 用户不是项目成员
  private noAccess() {
    this.cancelPending();
    const nextUrl = encodeURIComponent(this.$location.absUrl());
    const search = this.$location.url().split(this.$location.path())[1];
    const params = search ?
        search.substr(1)
          .split('&')
          .map(param => decodeURIComponent(param)) :
        [];
    const [
      projectId,
      projectName,
      inviterId,
      inviterName,
      signCode
    ] = params;
    this.$state.go('detail403', {
      projectId,
      projectName,
      inviterId,
      inviterName,
      signCode,
      nextUrl
    }, {
      location: 'replace'
    });
  }
}

angular.module('teambition').controller('DetailView', DetailView);

export * from './work/FileView';
export * from './task/TaskView';
export * from './post/PostView';
export * from './linked/LinkView';
export * from './event/EventView';
export * from './entry/EntryView';
export * from './activities/ActivityView';
export * from './403/Detail403View';
