'use strict';
import {View, parentView, inject, PostAPI} from '../../index';
import {IPostData} from 'teambition';

let projectId: string;

@parentView('TabsView')
@inject([
  'PostAPI'
])
export class PanelPostView extends View {

  public posts: IPostData[];

  private PostAPI: PostAPI;

  public onInit() {
    projectId = this.$state.params._id;
    return this.initFetch();
  }

  public openDetail(postId: string) {
    if (!postId) {
      return;
    }
    window.location.hash = `/detail/post/${postId}`;
  }

  private initFetch() {
    return this.PostAPI.fetchAll(projectId)
    .then((posts: IPostData[]) => {
      this.posts = posts;
    });
  }
}

angular.module('teambition').controller('PanelPostView', PanelPostView);
