'use strict';
import {
  inject,
  View,
  DetailAPI,
  ActivityAPI,
  StrikerAPI,
  ProjectsAPI,
  WorkAPI,
  LikeAPI,
  MemberAPI
} from '../index';
import {
  IProjectData,
  IMemberData,
  IStrikerRes,
  IFileData
} from 'teambition';

interface IImagesData {
  data: File;
  url: string;
}

interface IonicOptionsButtonsOption {
  text: string;
}

const objectTpls = {
  task: {
    title: '任务详情',
    name: '任务'
  },
  post: {
    title: '分享详情',
    name: '分享'
  },
  event: {
    title: '日程详情',
    name: '日程'
  },
  work: {
    title: '文件详情',
    name: '文件'
  },
  entry: {
    title: '记账详情',
    name: '记账'
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
export class DetailView extends View {

  public static $inject = ['$scope'];

  public ViewName = 'DetailView';

  public title: string;
  public comment: string;
  public project: IProjectData;
  public projectMembers: {
    [index: string]: IMemberData
  };

  public isComment = false;

  protected _boundToObjectId: string;
  protected _boundToObjectType: string;
  protected _linkedId: string;
  protected detail: any;

  private DetailAPI: DetailAPI;
  private ActivityAPI: ActivityAPI;
  private StrikerAPI: StrikerAPI;
  private ProjectsAPI: ProjectsAPI;
  private WorkAPI: WorkAPI;
  private LikeAPI: LikeAPI;
  private MemberAPI: MemberAPI;
  private images: IImagesData[];

  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.comment = '';
    this.images = [];
    this.zone.run(angular.noop);
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
        return this.$q.all([
          this.MemberAPI.fetch(detail._projectId)
          .then((members: {[index: string]: IMemberData}) => {
            this.projectMembers = members;
          }),
          this.ProjectsAPI.fetchById(detail._projectId)
          .then((project: IProjectData) => {
            this.project = project;
          })
        ])
        .then(() => {
          let members = Object.keys(this.projectMembers);
          let index = members.indexOf('0');
          members.splice(index, 1);
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '数据获取失败', message);
          window.history.back();
        });
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
  }

  public hideLikes() {
    popup.close();
  }

  public openComment() {
    this.isComment = true;
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

  public openOptions() {
    let index: number = -1;
    let thisButtons: IonicOptionsButtonsOption[] = [];
    let deleteIndex: number;
    let shareIndex: number;
    thisButtons.push({text: '<font color="red">删除</font>'});
    deleteIndex = ++index;
    thisButtons.push({text: '分享'});
    shareIndex = ++index;
    this.$ionicActionSheet.show({
      buttons: thisButtons,
      cancelText: '取消',
      buttonClicked: (index: number) => {
        switch (index) {
          case deleteIndex :
            this.removeObject();
            break;
          case shareIndex :
            const options = this.shareToQQgroup();
            window['openGroup'].share(options);
            break;
        };
        return true;
      }
    });
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
      .then((project: IProjectData) => {
        let collectionId = project._defaultCollectionId;
        return this.WorkAPI.uploads(collectionId, _projectId, strikerRes);
      })
      .then((resp: IFileData[]) => {
        let attachments = [];
        angular.forEach(resp, (file: IFileData, index: number) => {
          attachments.push(file._id);
        });
        return attachments;
      })
      .then((attachments: string[]) => {
        return this.addTextComment(attachments);
      })
      .catch((reason: any) => {
        const message = this.getFailureReason(reason);
        this.showMsg('error', '评论失败', message);
        this.hideLoading();
      });
    }
  }

  public openEdit(name: string) {
    window.location.hash = `/detail/${this._boundToObjectType}/${this._boundToObjectId}/${name}`;
  }

  public getInvolves() {
    if (this.detail) {
      let involves = [];
      angular.forEach(this.detail.members, (member: IMemberData) => {
        involves.push(member.name);
      });
      return involves.join('、');
    }
  }

  public removeObject() {
    this.DetailAPI.delete(this._boundToObjectType, this._boundToObjectId)
    .then(() => {
      window.history.back();
      this.showMsg('success', '删除成功', '');
    })
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '删除失败', message);
    });
  }

  private shareToQQgroup() {
    const executorName = this.projectMembers[this.detail._executorId].name || this.detail.executorName || '暂无执行者';
    const dueDate = this.detail.dueDate ? `,截止日期: ${moment(this.detail.dueDate).calendar()}` : '';
    return {
      title: `我创建了任务: ${this.detail.content}`,
      desc: `执行者: ${executorName} ${dueDate}`,
      share_url: `http://${window.location.host}/qqgroup?_boundToObjectType=${this._boundToObjectType}&_boundToObjectId=${this._boundToObjectId}`,
      image_url: `http://${window.location.host}/images/teambition.png`,
      debug: 1,
      onError: function() {
        alert(JSON.stringify(arguments));
      }
    };
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
      const message = this.getFailureReason(reason);
      this.showMsg('error', '评论失败', message);
      this.hideLoading();
    });
  }

}

angular.module('teambition').controller('DetailView', DetailView);

export * from './activities/ActivityView';
export * from './task/TaskView';
export * from './work/FileView';
export * from './involve/EditInvolveView';
