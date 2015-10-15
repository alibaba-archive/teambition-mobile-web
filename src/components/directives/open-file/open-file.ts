/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  angular.module('teambition').directive('openFile', [() => {
    return {
      restrict: 'A',
      scope: {
        onload: '&openFile',
        multiple: '=openFileMultiple',
        filter: '&openFileFilter'
      },
      link: (scope: any, element: angular.IRootElementService, attrs: any) => {
        let imageChosen = function() {
          let items = [];
          angular.forEach(this.files, (file: any, index: number) => {
            let item: {
              url?: any;
              data?: any;
              [index: string]: any;
            };
            item = {
              data: file
            };
            items.push(item);
            let reader = new FileReader();
            reader.onload = () => {
              item.url = URL.createObjectURL(file);
              scope.$apply();
            };
            reader.readAsDataURL(file);
          });
          scope.$apply(() => {
            scope.onload({images: items});
          });
        };

        let chooseImage = (e: Event) => {
          e.preventDefault();

          let input = document.createElement('INPUT');
          input.setAttribute('type', 'file');
          if (scope.multiple) {
            input.setAttribute('multiple', 'multiple');
          }
          input.addEventListener('change', imageChosen, false);

          angular.element(input).click();
        };

        angular.element(element).on('tap', chooseImage);
      }
    };
  }]);
}
