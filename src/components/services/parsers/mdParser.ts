'use strict';

export const mdParser = (md: string) => {
  if (angular.isString(md)) {
    return marked(md);
  }
}
