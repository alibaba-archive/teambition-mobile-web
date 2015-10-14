/// <reference path="../interface/teambition.d.ts" />
module teambition {
	'use strict';
	export type IGetParmByName = (search: string, name: string) => string;

	angular.module('teambition').factory('getParameterByName', [
		(): IGetParmByName => {
			return (search: string, name: string) => {
				if (!search || !name) {
					return '';
				}else {
					let _name: string = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
					let regex: RegExp = new RegExp('[\\?&]' + _name + '=([^&#]*)');
					let params: string = '?' + search.split('?')[1];
					let results: string[] = regex.exec(params);
					if (!results) {
						return '';
					}else {
						return decodeURIComponent(results[1].replace(/\+/g, ' '));
					}
				}
			};
		}
	]);
}
