/**
*  Module Wheel Rhythm
*  Version 0.1.0
* 
*  Description
*
*  Angular implementation for wheel method of visualize rhythm
*  
*  Inspired by TEDEd talk of John Varney
*  http://ed.ted.com/lessons/a-different-way-to-visualize-rhythm-john-varney
*  
*/	

'use strict';

angular.module('wheelRhythm', ['ngAnimate'])
	// 
	.factory('WheelSound', function(){
		var soundLib = null;
		var activeSound = {}
		var tempo = 60;
		return {
			set: function(sound) {
				activeSound = sound;
			},
			get: function() {
				return activeSound;
			},
			setTempo: function(bpm) {
				tempo = bpm;
			},
			getTempo: function() {
				return tempo;
			},
			setSoundLib: function(lib) {
				soundLib = lib;
			},
			getSoundLib: function() {
				return soundLib;
			}
		}
	})
	.directive('jvWheelRhythm', function($compile){
		return {
			restrict: 'E',
			scope: {
				name: '=',
				tempo: '='
			},
			replace: true,
			transclude: true,
			template: '<div><div class="wr-name">{{name}}</div><input type="number" min="1" max="180" ng-model="tempo" class="wr-tempo" /> \
						<button class="wr-play">{{action}}</button><span class="wr-hand" ng-class="{\'wr-hand-animation\':start}"></span><div ng-transclude></div></div>',
			link: function(scope, element, attrs) {
				scope.action = 'Play';
				scope.start = false;
				scope.animation = 'wr-hand-animation';

				var updateTempo = function(tempo) {
					element.find('span').css({'-webkit-animation-duration': (60000 / tempo)+'ms'});
					element.find('span').css({'-moz-animation-duration': (60000 / tempo)+'ms'});
					element.find('span').css({'-ms-animation-duration': (60000 / tempo)+'ms'});					
				}

				scope.$watch('tempo', function(newTempo) {
					updateTempo(newTempo);
				});

				// display measures markers
				for(var i=0; i<360; i+=22.5) {
					var border = '1';
					if(i % 45 == 0) border = '3';
					var M = angular.element('<span class="wr-marker" style="height:'+border+'px; transform: rotate('+i+'deg);"></span>');
					var m = $compile(M)(scope);
					element.append(m);
				}

				var hand = element.find('span')[0];

				// transform 2d matrix to rotation degree
				// http://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix
				function matrix2deg(tr) {
					if(!tr) return;
					var degree = 180 / Math.PI;
					var radian = Math.PI / 180;

					var values = tr.split('(')[1];
					    values = values.split(')')[0];
					    values = values.split(',');

					var a = values[0]; 
					var b = values[1]; 
					var c = values[2]; 
					var d = values[3]; 

					var scaleX = Math.sqrt((a * a) + (c * c));
					var scaleY = Math.sqrt((b * b) + (d * d));

					var sign = Math.atan(-c / a);
					var rad  = Math.acos(a / scaleX);
					var deg  = rad * degree;
					var rotation;

					if (deg > 90 && sign > 0) {
					    rotation = (360 - deg) * radian;
					} else if (deg < 90 && sign < 0) {
					    rotation = (360 - deg) * radian;
					} else {
					    rotation = rad;
					}

					var rotationInDegree = rotation * degree;
					return rotationInDegree * 1;
				}

				function tick() {
					var angle = matrix2deg($(hand).css('transform')); //jQuery					
					var audios = element.find('audio');
					var precision = 5;

					if(scope.tempo > 1 && scope.tempo <= 15) precision = 3;
					if(scope.tempo > 15 && scope.tempo <= 30) precision = 6;
					if(scope.tempo > 30 && scope.tempo <= 60) precision = 12;
					if(scope.tempo > 60 ) precision = 24;

					if(angle - precision <= 270 && angle + precision >= 270) {
						angular.forEach(audios, function (audio) {
							audio.setAttribute('canPlay', true);
						});
					}

					angular.forEach(audios, function (audio) {						
						var audioAngle = matrix2deg($(audio).parent().css('transform')); //jQuery						
						if( angle - precision <= audioAngle && angle + precision >= audioAngle) {
							if(audio.getAttribute('canPlay')) {
								audio.play();
								audio.setAttribute('canPlay', false);
							}
						}
					});

					if(scope.animation) {
						window.requestAnimationFrame(tick);
					}					
				}				

				element.find('button').on('click', function() {
					scope.start = !scope.start;					

					updateTempo(scope.tempo);

					if(scope.start) {
						scope.animation = 'wr-hand-animation';
						window.requestAnimationFrame(tick);
						scope.action = 'Pause';
					} else {
						scope.animation = '';
						scope.action = 'Play';
					}
					scope.$apply();
				});
				
			}
		}
	})
	.directive('jvWheel', ['$compile', 'WheelSound', function($compile, WheelSound){
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			scope: {
				radius: '=',
				sounds: '='
			},
			template: '<div class="ws-outer"><div class="ws-inner"></div></div>',
			
			link: function(scope, element, attrs) {
				var border = 8;
				element.css({
					'width': scope.radius+'px',
					'height': scope.radius+'px',
					'margin-top': -scope.radius / 2 +'px',
					'margin-left': -scope.radius / 2 +'px'
				});

    			element.find('div').css({
    				'width': scope.radius - border + 'px',
    				'height': scope.radius - border + 'px',
    				'left': border / 2 + 'px',
    				'top': border / 2 + 'px'
    			});

				var rect = element[0].getBoundingClientRect();

				var center = {
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2
				};
			           
				var rotate = function(x, y){
					var deltaX = x - center.x,
						deltaY = y - center.y -35,
						angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
					return angle
				};
			
				function createSound(event, type, color, active, url, angle, from) {

    					var DOM = angular.element('<div class="ws-picker"><span title="'+type+'" class="ws-picker-circle"\
    							style="background: '+color+';">'+active+'</span></div>');

				        if(from === 'user')	angle = Math.round(rotate(event.pageX, event.pageY));				        

    					var audio = new Audio(url);
				        var e = $compile(DOM)(scope);

				        e.attr('sType',type);
				        e.attr('sActive',active);

				        e.append(audio);
				        element.append(e);

				        e.css({transform: 'rotate(' + angle + 'deg)'});

				        // update scope				        
				        var updateScope = function() {
				        	var sc = [];
				        	angular.forEach(element.find('div'),function (elm) {				        		
				        		if(elm.className == 'ws-picker ng-scope') {				        			
				        			sc.push({type: elm.getAttribute('sType'), active: elm.getAttribute('sActive'), angle: Math.round(elm.style.transform.split('rotate(')[1].split('deg)')[0])});
				        		}				        		
				        	});
				        	scope.sounds = sc;
				        };

						var mousemove = function(event){
							var angle = rotate(event.pageX, event.pageY);
							e.css({transform: 'rotate(' + angle + 'deg)'});							
						}
						var mousedown = function(event){								
							mousemove(event);
							document.addEventListener('mousemove', mousemove);
							document.addEventListener('mouseup', mouseup);
						}
						var mouseup = function(){
							document.removeEventListener('mouseup', mouseup);
							document.removeEventListener('mousemove', mousemove);
							updateScope();
							//scope.$apply()
							window.setTimeout(function() {scope.$apply()}, 500);
						}

						e.on('mousedown', mousedown);
						e.on('dblclick', function(event) {
							event.stopPropagation();
							angular.element(angular.element(event.target)[0].offsetParent).remove();
							updateScope();
						});
						e.on('click', function(event) {
							angular.element(angular.element(event.target)[0].offsetParent).find('audio')[0].play();
						});

				        if(from === 'user')	{
				        	updateScope();
				        	window.setTimeout(function() {scope.$apply()}, 500);
				        }

				}

				// put custom sounds on the wheel
				scope.$watch('sounds', function(newSounds) {
					// clear existing		
					element.find('audio').remove();
					angular.forEach(element.find('div'), function (element) {
						if(element.className == 'ws-picker ng-scope') {
							element.remove();
						}						
					});

					if(!newSounds) return;
					angular.forEach(newSounds, function(sound) {						
						if(!sound) return;
						var found = _.find(WheelSound.getSoundLib(), function(s) {return s.type == sound.type } );						
						createSound(null, found.type, found.color, sound.active, found.sounds[sound.active], sound.angle, 'api');
					});

				});

    			element.on('dblclick', function(event) {
    				var elm = angular.element(event.toElement);        				
    				if(elm.attr('class') != 'inner') {
    					var sound = WheelSound.get();
    					if(!sound.hasOwnProperty('sounds')) return;

    					createSound(event, sound.type, sound.color, sound.active, sound.sounds[sound.active], null, 'user');
    				}
    			});
  			}
		}
	}]);