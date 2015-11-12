/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostDataParsed extends IPostData {
    displayContent: string;
    updated: number;
    creatorName: string;
    creatorAvatar: string;
    fetchTime: number;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount?: number;
    displayedTitle: string;
  }

  export interface IPostParser {
    (post: IPostData): IPostDataParsed;
  }

  angular.module('teambition').factory('postParser',
  // @ngInject
  (
    $filter: angular.IFilterService,
    $sanitize: any,
    mdParser: (markdownString: string) => string
  ) => {
    return (post: IPostDataParsed) => {
      post.displayContent = post.content;
      if (post.postMode !== 'html') {
        post.displayContent = mdParser(post.displayContent);
        post.displayContent = $sanitize(post.displayContent);
      }
      post.displayedTitle = post.title;
      if (!post.title) {
        let $title = angular.element(`<div>${post.displayContent}</div>`);
        let title = (typeof($title.text().trim) === 'function') ? $title.text().trim() : '';
        if (!title.length) {
          $title = $title.find('img:first');
          title = $title.attr('alt') || $title.attr('title') || $title.attr('src');
        }
        post.displayedTitle = $filter<ICutString>('cutString')(title, 60, '...');
      }
      post.updated = + new Date(post.updated);
      post.creator = post.creator || {_id: null, avatarUrl: nobodyUrl, name: null};
      post.creatorName = post.creator.name;
      post.creatorAvatar = post.creator.avatarUrl;
      return post;
    };
  });
}
