'use strict';
angular.module('overlaymessage',[])
.service("overlay_message", ['$rootScope', '$timeout', function ($rootScope, $timeout) {
	var object = {};
	var defaults = {
		"class":"",
		"content":"",
		"timeout":false
	};
	object.message = {};

	for(var p in defaults){
		object.message[p] = defaults[p];
	}

	var t = null;
	var triedApply = 0;

	function runApply(){
		$timeout.cancel(t);
		return tryApply();
	}

	function tryApply(){
		var phase = $rootScope.$root.$$phase;
		if((phase == '$apply' || phase == '$digest') && triedApply < 100){
			triedApply++;
			t = $timeout(function(){runApply();}, 100);
		}else if(triedApply < 100){
			triedApply = 0;
			$rootScope.$apply();
			return object;
		}
	}

	object.set = function (data) {
		for(var p in data){
			if(object.message.hasOwnProperty(p)){
				object.message[p] = data[p];
			}
		}
		return runApply();
	};

	object.close = function(){
		return object.set(defaults);
	};

	return object;
}])

.directive('overlayMessage', ['$timeout','overlay_message', function($timeout,overlay_message){
	return {
		restrict: 'E',
		controller: ['$scope', '$element', 'overlay_message', function($scope, $element, overlay_message){
			$scope.overlay_message = overlay_message;
		}],
		template:function(s,a){
			var html = ''+
			'<div overlay-message-timeout="{{overlay_message.timeout}}" id="overlay-message" class="{{overlay_message.message.class}}">'+
				'<div id="overlay-message-outer"><div id="overlay-message-inner"><div id="overlay-message-section">'+
					'<div id="overlay-message-content" ng-bind-html="overlay_message.message.content"></div>'+
				'</div></div></div>'+
			'</div>';
			return html;
		},
		link:function(scope,elm,attr){
			scope.$watch(
				function(){
					return overlay_message.message;
				},
				function(newVal){
					if(newVal){
						if(newVal.hasOwnProperty('timeout') && newVal.timeout && newVal.timeout !== '' && !isNaN(parseInt(newVal.timeout))){
							$timeout(function(){
								overlay_message.close();
							}, (parseInt(newVal.timeout) * 1000));
						}
					}
				},true
			);
		}
	};
}])
;
