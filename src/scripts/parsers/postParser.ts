/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostDataParsed extends IPostData {
    parsed: boolean;
    rawContent: string;
    updated: number;
    creatorName: string;
    creatorAvatar: string;
    fetchTime: number;
    linked?: ILinkedData[];
    isLike?: boolean;
    likedPeople?: string;
    likesCount?: number;
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
      if (post.parsed) {
        return post;
      }
      post.rawContent = post.content;
      post.content = post.html ? post.html : post.content;
      if (post.postMode !== 'html') {
        post.content = mdParser(post.content);
        post.content = $sanitize(post.content);
      }
      if (!post.title) {
        let $title = angular.element(`<div>${post.content}</div>`);
        let title = (typeof($title.text().trim) === 'function') ? $title.text().trim() : '';
        if (!title.length) {
          $title = $title.find('img:first');
          title = $title.attr('alt') || $title.attr('title') || $title.attr('src');
        }
        post.title = $filter<ICutString>('cutString')(title, 60, '...');
      }
      post.updated = + new Date(post.updated);
      post.creator = post.creator || {_id: null, avatarUrl: nobodyUrl, name: null};
      post.creatorName = post.creator.name;
      post.creatorAvatar = post.creator.avatarUrl;
      post.parsed = true;
      return post;
    };
  });
}
