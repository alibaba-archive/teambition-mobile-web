'use strict';
import {
  inject,
  host,
  View,
  Ding,
  DetailAPI,
  ActivityAPI,
  StrikerAPI,
  ProjectsAPI,
  WorkAPI,
  EntryAPI,
  LikeAPI,
  MemberAPI,
  IDingMemberData
} from '../index';
import {
  IProjectData,
  IMemberData,
  IEntryData,
  IStrikerRes,
  IFileData
} from 'teambition';

interface IImagesData {
  data: File;
  url: string;
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
let actionSheet: any;

@inject([
  '$filter',
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

  public ViewName = 'DetailView';

  public title: string;
  public fixWebkit = false;
  public comment: string;
  public project: IProjectData;
  public projectMembers: {
    [index: string]: IMemberData
  };

  protected _boundToObjectId: string;
  protected _boundToObjectType: string;
  protected _linkedId: string;
  protected detail: any;

  private $filter: any;
  private DetailAPI: DetailAPI;
  private ActivityAPI: ActivityAPI;
  private StrikerAPI: StrikerAPI;
  private ProjectsAPI: ProjectsAPI;
  private WorkAPI: WorkAPI;
  private EntryAPI: EntryAPI;
  private LikeAPI: LikeAPI;
  private MemberAPI: MemberAPI;
  private images: IImagesData[];
  private name: string;
  private forms: {
    key: string;
    value: string;
  }[];

  // @ngInject
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
          if (Ding && Ding.corpId) {
            return this.MemberAPI.getDingId(members, this.project._id, Ding.corpId).then((data: any) => {
              angular.forEach(data, (dingMember: {_userId: string, emplId: string}) => {
                this.projectMembers[dingMember._userId].emplId = dingMember.emplId;
              });
            })
            .catch((reason: any) => {
              let message = this.getFailureReason(reason);
              this.showMsg('error', '数据获取失败', message);
              window.history.back();
            });
          }
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '数据获取失败', message);
          window.history.back();
        });
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
    if (Ding) {
      Ding.setLeft('返回', true, true, () => {
        if (window.history.length > 2) {
          window.history.back();
        }else {
          let type = this._boundToObjectType;
          type = type === 'task' ? 'tasklist' : type;
          window.location.hash = `/project/${this.project._id}/${type}`;
        }
      });
      Ding.setRight('更多', true, false, () => {
        this.showOptions();
      });
    }
    switch (this._boundToObjectType) {
      case 'task':
        this.name = this.detail.content;
        this.forms = [{
          key: '执行者: ',
          value: this.detail._executorId ? this.projectMembers[this.detail._executorId].name : '待认领'
        }, {
          key: '截止日期: ',
          value: this.detail.dueDate ? this.$filter('formatDate')(this.detail.dueDate, 'll') : '未指定'
        }];
        break;
      case 'post':
        this.name = this.detail.title;
        this.forms = [];
        break;
      case 'event':
        this.name = this.detail.title;
        this.forms = [{
          key: '时间: ',
          value: this.$filter('eventDateFormat')(this.detail.startDate, this.detail.endDate)
        }];
        break;
      case 'work':
        this.name = this.detail.fileName;
        this.forms = [{
          key: '文件大小: ',
          value: this.$filter('formatFileSize')(this.detail.fileSize)
        }];
        break;
    };
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

  public previewFile() {
    Ding.previewImages([this.detail.downloadUrl]);
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

  private openContact() {
    let defer = this.$q.defer();
    let defaultUsers = [];
    angular.forEach(this.detail.involveMembers, (userId: string) => {
      if (userId !== this.$rootScope.userMe._id) {
        defaultUsers.push(this.projectMembers[userId].emplId);
      }
    });
    Ding.openConcatChoose(true, defaultUsers, (data: IDingMemberData[]) => {
      let users = [];
      angular.forEach(data, (user: IDingMemberData) => {
        users.push(user.emplId);
      });
      defer.resolve(users);
    });
    return defer.promise;
  }

  private openDing() {
    this.openContact().then((users: string[]) => {
      let title = objectTpls[this._boundToObjectType].title;
      let link = `${host}/${window.location.search}#/detail/${this._boundToObjectType}/${this._boundToObjectId}`;
      Ding.createDing(users, link, title, this.name);
    });
  }

  private openCall() {
    this.openContact().then((users: string[]) => {
      Ding.createCall(users);
    });
  }

  private pickConversation() {
    let sender = this.projectMembers[this.$rootScope.userMe._id].emplId;
    Ding.pickConversation((cid: string) => {
      Ding.sendContentToChat(cid, sender, window.location.href, {
        title: this.name,
        form: this.forms
      })
      .then(() => {
        this.showMsg('success', '发送成功', '');
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '发送失败', message);
      });
    });
  }

  private showOptions() {
    if (actionSheet) {
      actionSheet = actionSheet();
    }else {
      actionSheet = this.$ionicActionSheet.show({
        buttons: [{
          text: 'Ding 一下'
        }, {
          text: '语音通话'
        }, {
          text: '发送到聊天'
        }, {
          text: `<font color="red">删除${objectTpls[this._boundToObjectType].name}</font>`
        }],
        cancelText: '取消',
        buttonClicked: (index: number) => {
          switch (index) {
            case 0:
              this.openDing();
              break;
            case 1:
              this.openCall();
              break;
            case 2:
              this.pickConversation();
              break;
            case 3:
              this.removeObject();
              break;
          }
          return true;
        }
      });
    }
  }

}

angular.module('teambition').controller('DetailView', DetailView);

export * from './activities/ActivityView';
export * from './task/TaskView';
export * from './work/FileView';
export * from './post/PostView';
export * from './linked/LinkView';
export * from './involve/EditInvolveView';
export * from './event/EventView';
export * from './entry/EntryView';
