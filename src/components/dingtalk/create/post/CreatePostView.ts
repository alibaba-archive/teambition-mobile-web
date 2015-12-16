'use strict';
import {parentView, inject} from '../../../bases/Utils';
import {Ding} from '../../../../Run';
import {View} from '../../../bases/View';
import {DetailAPI, MemberAPI} from '../../../services/service';
import {IMemberData, IPostData} from 'teambition';

@inject([
  'DetailAPI',
  'MemberAPI',
])
export class CreatePostView extends View {

  public ViewName = 'CreatePostView';

  public title: string;
  public content: string;
  public involveMembers: string[];
  public isVisiable = false;
  public members: {
    [index: string]: IMemberData;
  };
  public visiable = 'members';

  private state: string;
  private projectId: string;
  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;

  // @ngInject
  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.state = 'origin';
    this.zone.run(() => {
      this.projectId = this.$state.params._id;
    });
  }

  public onInit() {
    return this.MemberAPI.fetch(this.projectId)
    .then((members: any) => {
      this.members = members;
    });
  }

  public onAllChangesDone() {
    let userid = this.$rootScope.userMe._id;
    this.involveMembers = [];
    this.involveMembers.push(userid);
    angular.forEach(this.members, (member: IMemberData) => {
      if (member._id === userid) {
        member.isSelected = true;
      }else {
        member.isSelected = false;
      }
    });
    this.setHeader();
  }

  // involve
  public openInvolve() {
    this.state = 'involve';
    this.setHeader();
    this.openModal('create/post/involve-modal.html', {
      scope: this.$scope
    });
  }

  public getInvolveNames() {
    let names = [];
    angular.forEach(this.members, (member: IMemberData) => {
      if (member.isSelected) {
        names.push(member.name);
      }
    });
    return names.join('、');
  }

  public selectInvolveMember(_id: string) {
    this.members[_id].isSelected = !this.members[_id].isSelected;
  }

  private selectInvolve() {
    let involve = [];
    angular.forEach(this.members, (member: any) => {
      if (member.isSelected) {
        involve.push(member._id);
      }
    });
    this.involveMembers = involve;
    this.visiable = this.isVisiable ? 'involves' : 'members';
  }

  private setHeader() {
    switch (this.state) {
      case 'origin':
        if (Ding) {
          Ding.setRight('确定', true, false, () => {
            this.createPost();
            this.state = 'origin';
          });
          Ding.setLeft('取消', true, false, () => {
            window.history.back();
            this.state = 'origin';
          });
        }
        break;
      case 'involve':
        if (Ding) {
          Ding.setRight('确定', true, false, () => {
            this.selectInvolve();
            this.state = 'origin';
            this.cancelModal();
            this.setHeader();
          });
          Ding.setLeft('取消', true, false, () => {
            let id = this.$rootScope.userMe._id;
            this.involveMembers = [id];
            angular.forEach(this.members, (member: IMemberData) => {
              member.isSelected = member._id === id;
            });
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
    }
  }

  private createPost() {
    if (typeof this.title !== 'undefined') {
      this.showLoading();
      return this.DetailAPI.create('post', {
        _projectId: this.projectId,
        _creatorId: this.$rootScope.userMe._id,
        title: this.title,
        content: this.content,
        involveMembers: this.involveMembers,
        visiable: this.visiable
      })
      .then((post: IPostData) => {
        this.showMsg('success', '创建成功', '已成功创建分享', `#/detail/post/${post._id}`);
        this.hideLoading();
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        alert(JSON.stringify(reason));
        this.showMsg('error', JSON.stringify(reason), message);
        this.hideLoading();
        window.history.back();
      });
    }
  }

}

angular.module('teambition').controller('CreatePostView', CreatePostView);
