'use strict';
import {nobodyUrl} from '../../config/config';
import {getDeps} from '../../bases/Utils';
import {mdParser} from './mdParser';
import {cutString} from '../../filters';
import {IPostData} from 'teambition';

export const postParser = (post: IPostData) => {
  post.displayContent = post.content;
  if (post.postMode !== 'html') {
    post.displayContent = mdParser(post.displayContent);
    let $sanitize = getDeps('$sanitize');
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
    post.displayedTitle = cutString(title, 60, '...');
  }
  post.updated = + new Date(post.updated + '');
  post.creator = post.creator || {_id: null, avatarUrl: nobodyUrl, name: null};
  post.creatorName = post.creator.name;
  post.creatorAvatar = post.creator.avatarUrl;
  return post;
};
