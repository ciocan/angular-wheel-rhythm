##### Angular implementation for wheel method of visualize rhythm
[Demo here](http://ciocan.github.io/angular-wheel-rhythm)

###### Module usage:
Load angular-wheel-rhythm.js module, e.g.

    angular.module('your-module', ['wheelRhythm']);

Prepare a wheel box:

    <jv-wheel-rhythm name="name" tempo="tempo" sound-lib="soundLib">
	    <jv-wheel radius="320" sounds="sounds"></jv-wheel>
    </jv-wheel-rhythm>

Where name is the *name* of the rhythm displayed, *tempo* is the default tempo played. Tempo equals 60 means that a second takes a full circle. The *soundLib* is the default library of sounds loaded by module. It's an array of objects like this:

    [
    	{
    		'type': 'kick',
    		'color': '#003333',
    		'sounds': [
		    'sounds/KickDrums1/kickdrum1.wav',
    			'sounds/KickDrums1/kickdrum2.wav',
    			'sounds/KickDrums1/kickdrum3.wav'
    			]
    	},
    	{
    		'type': 'bass',
    		'color': '#3399CC',
    		'sounds': [
    			'sounds/BassDrums1/bassdrum1.wav',
    			'sounds/BassDrums1/bassdrum2.wav',
    			'sounds/BassDrums1/bassdrum3.wav'
    		]
    	},
    	...
    ]

Inside *<jv-wheel-rhythm>* can be placed another *<jv-wheel>* directives as wheels where sounds can be placed. It has a *radius* and *sounds* attributes. The sounds attribute is an array like:

    [
    	{type: 'hihat', active:5, angle: 45},
    	{type: 'hihat', active:5, angle: 135},
    	{type: 'hihat', active:5, angle: 225},
    	{type: 'hihat', active:5, angle: 315},
    	{type: 'hihat', active:5, angle: 337.5},
    	...
    ]

Where *type* matches the type from the sound library and *active* is the active sound from sounds array from library. The *angle* attribute is the angle where sound is placed on the wheel.

##### Download:

Using Bower:

    bower install angular-wheel-rhythm

##### TODO:

* Snap to grid
* Drag & drop instead of double click to add to wheel.
* Fix the timers

###### Possible bugs and/or errors:

Some times some sounds are skipped because of javascript inaccurate timers. It use *requestAnimationFrame* function which ticks 60 times per second (every 16ms)

