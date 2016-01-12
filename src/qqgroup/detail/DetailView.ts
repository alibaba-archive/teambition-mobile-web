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
  MemberAPI,
  InputComponments
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
let fileContent = [];

@inject([
  '$timeout',
  'DetailAPI',
  'ActivityAPI',
  'ProjectsAPI',
  'MemberAPI',
  'EntryAPI',
  'WorkAPI',
  'LikeAPI',
  'StrikerAPI',
  'InputComponments'
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
  public textareaHeight: string;
  public transformY: string;
  public fileContent: any[];

  protected _boundToObjectId: string;
  protected _boundToObjectType: string;
  protected _linkedId: string;
  protected detail: any;

  private $timeout: angular.ITimeoutService;
  private DetailAPI: DetailAPI;
  private ActivityAPI: ActivityAPI;
  private StrikerAPI: StrikerAPI;
  private ProjectsAPI: ProjectsAPI;
  private WorkAPI: WorkAPI;
  private LikeAPI: LikeAPI;
  private MemberAPI: MemberAPI;
  private InputComponments: InputComponments;
  private files: string[];

  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.comment = '';
    this.fileContent = [];
    this.files = [];
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
    this.openModal('detail/comment.html', {
      scope: this.$scope
    });
  }

  public cancelComment() {
    console.log(123);
    this.cancelModal();
  }

  public chooseFiles() {
    this.InputComponments.show(this);
  }

  public uploadFile() {
    let contents = fileContent;
    angular.forEach(this.fileContent, (file: any, index: number) => {
      file.fileType = file.name.split('.').pop();
      if (file.fileType.length > 4) {
        file.fileType = file.fileType.substr(0, 1);
        file.class = 'bigger-bigger';
      }
      if (
        file.fileType.indexOf('png') !== -1 ||
        file.fileType.indexOf('jpg') !== -1 ||
        file.fileType.indexOf('jpeg') !== -1 ||
        file.fileType.indexOf('gif') !== -1 ||
        file.fileType.indexOf('bmp') !== -1
      ) {
        file.thumbnail = URL.createObjectURL(file);
      }
      let content = {
        progress: '0',
        request: null,
        content: file,
        index: index
      };
      content.request = this.StrikerAPI.upload([file], content).then((res: IStrikerRes) => {
        return this.WorkAPI.uploads(this.project._defaultCollectionId, this.project._id, [res]);
      })
      .then((data: any) => {
        let $index: number;
        this.files.push(data[0]._id)
        angular.forEach(this.fileContent, (_content: any, i: number) => {
          if (_content.index === content.index) {
            $index = i;
          }
        });
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '上传出错', message);
        let $index: number;
        angular.forEach(this.fileContent, (_content: any, i: number) => {
          if (_content.index === content.index) {
            $index = i;
          }
        });
      });
      contents.push(content);
    });
    this.fileContent = contents;
    fileContent = contents;
  }

  public removeFile($index: number) {
    this.fileContent.splice($index, 1);
  }

  public hasContent() {
    return !!(this.fileContent.length || this.comment.length);
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
    if (!this.comment && !this.fileContent.length) {
      return ;
    }
    this.showLoading();
    let _projectId = this.detail._projectId;
    if (!this.fileContent.length) {
      return this.addTextComment()
      .then(() => {
        this.hideLoading();
      });
    }else {
      return this.addTextComment(this.files)
      .then(() => {
        this.cancelModal();
      })
      .catch((reason: any) => {
        const message = this.getFailureReason(reason);
        this.showMsg('error', '评论失败', message);
        this.hideLoading();
        this.cancelModal();
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
      this.fileContent = [];
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
