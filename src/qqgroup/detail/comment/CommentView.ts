'use strict';
import {
  inject,
  View,
  StrikerAPI,
  WorkAPI,
  ActivityAPI,
  ProjectsAPI,
  InputComponments
} from '../../';
import {IStrikerRes, IProjectData} from 'teambition';

let fileContent = [];

@inject([
  'ProjectsAPI',
  'ActivityAPI',
  'StrikerAPI',
  'WorkAPI',
  'InputComponments'
])
export class CommentView extends View {

  public fileContent: any[] = [];
  public comment: string = '';
  public project: IProjectData;

  private _boundToObjectId: string;
  private _boundToObjectType: string;
  private projectId: string;
  private InputComponments: InputComponments;
  private files: string[] = [];
  private StrikerAPI: StrikerAPI;
  private WorkAPI: WorkAPI;
  private ActivityAPI: ActivityAPI;
  private ProjectsAPI: ProjectsAPI;

  public onInit() {
    this._boundToObjectId = this.$state.params._id;
    this._boundToObjectType = this.$state.params.type;
    this.projectId = this.$state.params.projectId;
    return this.ProjectsAPI
    .fetchById(this.projectId)
    .then((project: IProjectData) => {
      this.project = project;
      this.hideLoading();
    });
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
        this.files.push(data[0]._id);
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

  public addComment() {
    if (!this.comment && !this.fileContent.length) {
      return ;
    }
    this.showLoading();
    if (!this.fileContent.length) {
      return this.addTextComment()
      .then(() => {
        this.hideLoading();
        window.history.back();
      });
    }else {
      return this.addTextComment(this.files)
      .then(() => {
        window.history.back();
      })
      .catch((reason: any) => {
        const message = this.getFailureReason(reason);
        this.showMsg('error', '评论失败', message);
        this.hideLoading();
        window.history.back();
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

angular.module('teambition').controller('CommentView', CommentView);
