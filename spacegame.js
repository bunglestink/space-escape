/**
 * spacegame.js
 *
 * by Kirk Thompson
 *
 * This file turns a canvas into a simple space game. It expects that the canvas
 * that it is being applied to is a 800x600 in size.  
 */

var game = { 
	/** start game by showing title screen, this loads all images **/
	showTitle: function(canvas) {
		context = canvas.getContext("2d");
		context.fillRect(0,0,canvas.width, canvas.height);
		context.fillStyle = '#fff';
		context.fillText('loading...', 10, 10);
		
		// preload all game images
		var titleImage = new Image();
		titleImage.src = 'resources/images/title-screen.png';
		var gameImages = [
			'resources/images/enemy-ship.png',
			'resources/images/enemy-ship-dead.png',
			'resources/images/enemy-drone.png',
			'resources/images/enemy-drone-dead.png',
			'resources/images/meteor.png',
			'resources/images/nebula.png',
			'resources/images/nebula3.png',
			'resources/images/nebula2.png',
			'resources/images/planet-pluto.png',
			'resources/images/planet-uranus.png',
			'resources/images/planet-neptune.png',
			'resources/images/player-ship.png',
			'resources/images/player-ship-dead.png',
			'resources/images/player-shot.png',
		];
		var loadedImageCount = 0;
		for (var i=0; i<gameImages.length; i++) {
			var thisImage = new Image();
			thisImage.onload = function() { 
				loadedImageCount++; 
				if (loadedImageCount == gameImages.length) {
					context.drawImage(titleImage, 0, 0);
				}
			};
			thisImage.src = gameImages[i];
		}
	},

	/** run game by calling this method, after images are loaded **/
	runGame: function(canvas, gameOverCallback) {	
		var context = canvas.getContext("2d");		// get the context
		var count = 0;								// tracks ticks since game start
		
		/**
		 * this object contains universal game settings.
		 */
		var settings = {
			refreshRate: 33,
			headerY: 15,
			messageTicks: 120,
			
			enemyShipMaxPeriod: 20,
			enemyShipMinPeriod: 5,
			enemyShipMaxPeriodHeight: 250,
			enemyShipImage: 'resources/images/enemy-ship.png',
			deadEnemyShipImage: 'resources/images/enemy-ship-dead.png',
			deadEnemyShipTicks: 15,
			
			enemyDroneImage: 'resources/images/enemy-drone.png',
			deadEnemyDroneImage: 'resources/images/enemy-drone-dead.png',
			enemyDroneMinY: 10,
			enemyDroneMaxY: 20,
			
			playerShipImage: 'resources/images/player-ship.png',
			playerShipDeadImage: 'resources/images/player-ship-dead.png',
			playerShotImage: 'resources/images/player-shot.png',
			playerShotVelocity: -20,
			
			meteorImage: 'resources/images/meteor.png',
			backgroundObjectImages: [
				'resources/images/nebula.png',
				'resources/images/nebula2.png',
				'resources/images/nebula3.png'
			],

			starCount: 50,
			maxStarSpeed: 10,
			maxBackgroundObjectSpeed: 2,
			maxMeteorSpeed: 10,
			minMeteorSpeed: 5,
			
			totalDistance: 300,
			distanceToEarth: function (t) {
				return settings.totalDistance - Math.floor(t / 30);
			},
			locations: [ {
					upperBound: 300, 
					lowerBound: 260, 
					locationName: 'Oort Cloud',
					message: 'You are currently in the Oort Cloud, make your way back to Earth!',
					probability: {
						backgroundObject: 200,
						enemy: 40,
						drone: 0,
						meteor: 50,
					}
				}, { 
					upperBound: 259, 
					lowerBound: 240, 
					locationName: 'Kuiper Belt' ,
					message: 'Approaching the Kuiper Belt, beware of meteors!',
					probability: {
						backgroundObject: 0,
						enemy: 0,
						drone: 0,
						meteor: 8,
					}
				}, { 
					upperBound: 239, 
					lowerBound: 220, 
					locationName: 'Pluto Orbit',
					message: 'Entering Pluto\'s Orbit',
					background: { image: 'resources/images/planet-pluto.png', speed: 2 },
					probability: {
						backgroundObject: 300,
						enemy: 40,
						drone: 0,
						meteor: 40,
					}
				}, { 
					upperBound: 219, 
					lowerBound: 180, 
					locationName: 'Neptune Orbit',
					message: 'Entering Neptune\'s Orbit',
					background: { image: 'resources/images/planet-neptune.png', speed: 2 },
					probability: {
						backgroundObject: 500,
						enemy: 50,
						drone: 50,
						meteor: 50,
					}
				}, { 
					upperBound: 179, 
					lowerBound: 140, 
					locationName: 'Uranus Orbit',
					message: 'Entering Uranus\'s Orbit',
					background: { image: 'resources/images/planet-uranus.png', speed: 2 },
					probability: {
						backgroundObject: 500,
						enemy: 35,
						drone: 50,
						meteor: 50,
					}
				}, { 
					upperBound: 139, 
					lowerBound: 100, 
					locationName: 'Saturn Orbit',
					message: 'Approaching Saturn close, watch out for rocky rings!',
					background: { 
						image: 'resources/images/planet-saturn.png', 
						speed: 2,
						x: 0,
						y: -1200
					},
					probability: {
						backgroundObject: 500,
						enemy: 35,
						drone: 50,
						meteor: 12
					}
				}, { 
					upperBound: 99, 
					lowerBound: 70, 
					locationName: 'Jupiter Orbit',
					message: 'generic',
					probability: {
						backgroundObject: 500,
						enemy: 30,
						drone: 40,
						meteor: 50,
					}
				}, { 
					upperBound: 69, 
					lowerBound: 50, 
					locationName: 'Asteroid Belt',
					message: 'Asteroid Belt, lookout!',
					probability: {
						backgroundObject: 500,
						enemy: 45,
						drone: 45,
						meteor: 5,
					}
				}, { 
					upperBound: 49, 
					lowerBound: 30, 
					locationName: 'Mars Orbit',
					message: 'generic',
					probability: {
						backgroundObject: 500,
						enemy: 30,
						drone: 0,
						meteor: 50,
					}
				}, { 
					upperBound: 29, 
					lowerBound: 0, 
					locationName: 'Earth Orbit',
					message: 'generic',
					probability: {
						backgroundObject: 500,
						enemy: 30,
						drone: 0,
						meteor: 50,
					}
				}
			],
			
			pointsPerShipKill: 150,
			pointsPerDroneKill: 250,
			pointsPerMeteor: 10
		};
		
		
		/** utility functions **/
		var util = {
			rangedRandom: function(min, max) {
				return (Math.random() * (max - min)) + min;
			}
		};
		/** end utility functions **/
		
		
		/** the score keeper **/
		var scoreKeeper = {
			shotsFired: 0,
			meteorsAvoided: 0,
			enemiesKilled: 0,
			enemyDronesKilled: 0,
			
			totalPoints: 0,
			hitPercentage: 0,
			
			calcTotals: function() {
				this.hitPercentage = Math.round(
					((this.enemiesKilled + this.enemyDronesKilled) / this.shotsFired) * 
					10000) / 100;
				this.totalPoints = (this.meteorsAvoided * settings.pointsPerMeteor) + 
					(this.enemiesKilled * settings.pointsPerShipKill) + 
					(this.enemyDronesKilled * settings.pointsPerDroneKill);
			}
		};
		/** end score keeper **/

		/** spawner object, manages spawning objects **/
		var spawner = {
		
			refreshLocation: function(t) {
				var distance = settings.distanceToEarth(t);
				for (var i in settings.locations) {
					var location = settings.locations[i];
					if (location.upperBound >= distance && location.lowerBound <= distance) {

						// test if location is changing and report
						if (location != this.currentLocation) {
							gameObjectManager.add(new Message(location.message));
							
							// if this location has a background, display it
							if (location.background) {
								var background = new BackgroundObject();
								
								background.image.src = location.background.image;
								background.deepSpaceObject = false;
								background.yVelocity = location.background.speed;
								
								if (location.background.x !== undefined && 
									location.background.y !== undefined) {
									background.x = location.background.x;
									background.y = location.background.y;
								}
								
								gameObjectManager.add(background);
							}
						}
					
						this.currentLocation = location;
						break;
					}
				}
			},
		
			spawn: function(t) {
				this.refreshLocation(t);
			
				if (this.spawnObject(this.currentLocation.probability.enemy)) {
					gameObjectManager.add(new EnemyShip());
				}
				if (this.spawnObject(this.currentLocation.probability.drone)) {
					gameObjectManager.add(new EnemyDrone());
				}
				if (this.spawnObject(this.currentLocation.probability.meteor)) {
					gameObjectManager.add(new Meteor());
				}
				if (this.spawnObject(this.currentLocation.probability.backgroundObject)) {
					gameObjectManager.add(new BackgroundObject());
				}
			},
		
			spawnObject: function(probability) {
				if (probability === 0) {
					return false;
				}
				return Math.floor(Math.random() * probability) === 0;
			}
		};
		/** end spawner **/
		
		
		/** collisionDetector **/
		var collisionDetector = {
			
			handleCollisions: function() {
				this.handleShotCollisions();
				this.handlePlayerCollisions();
			},
			
			handleShotCollisions: function() {
				// loop through all shots
				for (var key in gameObjectManager.playerShots) {
					var obj = gameObjectManager.playerShots[key];
					
					// for each shot, loop through all game objects, testing for hits
					for (var key2 in gameObjectManager.gameObjects) {
						var obj2 = gameObjectManager.gameObjects[key2];
						
						// test for collisions
						if (this.collision(obj, obj2)) {
							if (obj2.enemyShip || obj2.enemyDrone) {
								gameObjectManager.remove(obj);
								obj2.hit();
								
							} else if (obj2.meteor) {
								gameObjectManager.remove(obj);
							}
						}
					}		
				}
			},
			
			handlePlayerCollisions: function() {
				for (var key in gameObjectManager.gameObjects) {
					var obj = gameObjectManager.gameObjects[key];
					
					if (obj.killsPlayer && this.collision(player, obj)) {
						// set dead player image
						var deadImage = new Image();
						deadImage.src = settings.playerShipDeadImage;
						player.image = deadImage;
						
						clearInterval(gameLoopHandle);
						gameOverCallback();
					}
				}
			},
			
			// returns true if there is a collision between two objects:
			collision: function (obj1, obj2) {
				// verify that the objects have images before testing
				if (obj1.image && obj2.image) {
					
					// test for collisions
					if (obj1.x < obj2.x + obj2.image.width && 
						obj2.x < obj1.x + obj1.image.width && 
						obj1.y < obj2.y + obj2.image.height &&
						obj2.y < obj1.y + obj1.image.height) {
						return true;
					}
				}
				
				// default return false
				return false;
			}
		};
		/** end collisionDetector **/
		
		
		/** Game Objects: **/
		
		/** BasicObject - used for player **/
		function BasicObject(imagePath, x, y) {
			this.gameObject = true;
			this.x = x;
			this.y = y;
			this.image = new Image();
			this.image.src = imagePath;
		}
		BasicObject.prototype.draw = function() {
			context.drawImage(this.image, this.x, this.y);
		};
		/** End BasicObject **/
		
		
		/** an Enemy Ship **/
		function EnemyShip() {
			this.gameObject = true;
			this.enemyShip = true;
			this.killsPlayer = true;
			
			this.time = 0;
			
			this.y = -50;
			this.yVelocity = (Math.random() + 1) * 7;
			
			// create ship path
			this.xStart = (Math.random() * canvas.width);
			this.xAmplitude = (Math.random() * settings.enemyShipMaxPeriodHeight);
			this.xDirection = (Math.floor(Math.random() * 2) == 1) ? 1 : -1;
			this.xPeriod = util.rangedRandom(settings.enemyShipMinPeriod, settings.enemyShipMaxPeriod);
			this.xFunction = function(t) { 
				return this.xDirection * this.xAmplitude * Math.sin(t/this.xPeriod) + this.xStart;
			};
			this.x = this.xFunction(0);
			
			this.image = new Image();
			this.image.src = settings.enemyShipImage;
		}
		
		EnemyShip.prototype.animate = function() {
			this.time++;
			this.y += this.yVelocity;
			this.x = this.xFunction(this.time);
			
			if (this.y >= canvas.height + 100) {
				gameObjectManager.remove(this);
			}
		};
		
		EnemyShip.prototype.draw = function(context) {
			context.drawImage(this.image, this.x, this.y);
		};
		
		EnemyShip.prototype.kill = function() {
			gameObjectManager.remove(this);
			gameObjectManager.add(new DeadEnemy(this));
			scoreKeeper.enemiesKilled++;
			scoreKeeper.calcTotals();
		};
		EnemyShip.prototype.hit = function() { this.kill(); }
		/** End EnemyShip **/
		
		
		/** an Enemy Drone **/
		function EnemyDrone() {
			this.gameObject = true;
			this.enemyDrone = true;
			this.killsPlayer = true;
			
			this.y = -50;
			this.yVelocity = (Math.random() * 
				(settings.enemyDroneMaxY - settings.enemyDroneMinY)) + 
				settings.enemyDroneMinY;
			
			// create Drone path
			this.x = (Math.random() * canvas.width);
			this.xVelocity = (Math.random() * 2) - 1;
			
			this.image = new Image();
			this.image.src = settings.enemyDroneImage;
		}
		
		EnemyDrone.prototype.animate = function() {
			this.y += this.yVelocity;
			this.x += this.xVelocity;
			
			if (this.y >= canvas.height + 100) {
				gameObjectManager.remove(this);
			}
		};
		
		EnemyDrone.prototype.draw = function(context) {
			context.drawImage(this.image, this.x, this.y);
		};
		
		EnemyDrone.prototype.kill = function() {
			gameObjectManager.remove(this);
			gameObjectManager.add(new DeadEnemy(this));
			scoreKeeper.enemyDronesKilled++;
			scoreKeeper.calcTotals();
		};
		EnemyDrone.prototype.hit = function() { this.kill(); }
		/** End EnemyDrone **/
		
		
		/** Meteor - kills player, stops shots **/
		function Meteor() {
			this.gameObject = true;
			this.meteor = true;
			this.killsPlayer = true;
			
			this.x = Math.floor(Math.random() * canvas.width);
			this.y = -100;
			this.yVelocity = util.rangedRandom(settings.minMeteorSpeed, settings.maxMeteorSpeed);
			this.image = new Image();
			this.image.src = settings.meteorImage;
		}
		
		Meteor.prototype.animate = function() {
			this.y += this.yVelocity;
			if (this.y > canvas.height + 100) {
				gameObjectManager.remove(this);
				scoreKeeper.meteorsAvoided++;
				scoreKeeper.calcTotals();
			}
		};
		
		Meteor.prototype.draw = function(context) {
			context.drawImage(this.image, this.x, this.y);
		};
		/** End Meteor **/

		/** A player Shot **/
		function Shot(imagePath, x, y, xVelocity, yVelocity) {
			scoreKeeper.shotsFired++;
			
			this.gameObject = true;
			this.playerShot = true;
			
			this.image = new Image();
			this.image.src = imagePath;
			this.x = x;
			this.y = y;
			this.xVelocity = xVelocity;
			this.yVelocity = yVelocity;
		}
		
		// move shot upward, remove if out of scope
		Shot.prototype.animate = function() {
			this.x += this.xVelocity;
			this.y += this.yVelocity;
			
			if (this.y < -20) {
				gameObjectManager.remove(this);
			}
		};
		
		Shot.prototype.draw = function() {
			context.drawImage(this.image, this.x, this.y);
		};
		/** End player Shot **/
		
		/** Begin Background Constructors **/
		
		
		/** background Star **/
		function Star() {
			this.backgroundObject = true;
			
			this.x = Math.floor(Math.random() * canvas.width);
			this.y = Math.floor(Math.random() * canvas.height);
			this.yVelocity = Math.floor(Math.random() * settings.maxStarSpeed);
		}
		
		Star.prototype.animate = function() {
			this.y += this.yVelocity;
			this.y %= canvas.height;
		};
		
		Star.prototype.draw = function(context) {
			context.fillRect(this.x, this.y, 1, 1);
		};
		/** end background Star **/
		
		
		/** other BackgroundObject **/
		function BackgroundObject() {
			this.backgroundObject = true;
			this.deepSpaceObject = true;
			
			this.x = Math.floor(Math.random() * canvas.width);
			this.y = -200;
			this.yVelocity = Math.floor(Math.random() * settings.maxBackgroundObjectSpeed);
			this.image = new Image();
			this.image.src = (function() {
				var index = Math.floor((Math.random() * 
					settings.backgroundObjectImages.length));
				return settings.backgroundObjectImages[index];
			}());
		}
		
		BackgroundObject.prototype.animate = function() {
			this.y += this.yVelocity;
			if (this.y > canvas.height + 100) {
				gameObjectManager.remove(this);
			}
		};
		
		BackgroundObject.prototype.draw = function(context) {
			context.drawImage(this.image, this.x, this.y);
		};
		/** End Background Object **/
		
		
		/** Dead Enemy Ship **/
		function DeadEnemy(enemyShip) {
			this.backgroundObject = true;
			
			this.x = enemyShip.x;
			this.y = enemyShip.y;
			this.yVelocity = enemyShip.yVelocity;
			this.image = new Image();
			
			if (enemyShip.enemyShip) {
				this.image.src = settings.deadEnemyShipImage;
			} else if (enemyShip.enemyDrone) {
				this.image.src = settings.deadEnemyDroneImage;
			}
			
			this.timer = 0;
		};
		
		DeadEnemy.prototype.animate = function() {
			this.y += this.yVelocity;
			this.timer++;
			if (this.timer > settings.deadEnemyShipTicks) {
				gameObjectManager.remove(this);
			}
		};
		
		DeadEnemy.prototype.draw = function(context) {
			context.drawImage(this.image, this.x, this.y);
		};
		/** End DeadEnemyShip **/
		
		/** user Message **/
		function Message(message) {
			this.backgroundObject = true;
			
			this.x = canvas.width / 2;
			this.y = (canvas.height / 2) - 100;
			this.ticks = 0;
			this.message = message;
		}
		Message.prototype.animate = function() {
			this.ticks++;
			if (this.ticks > settings.messageTicks) {
				gameObjectManager.remove(this);
			}
		};
		Message.prototype.draw = function(context) {
			context.textAlign = 'center';
			context.font = '14pt Arial';
			context.fillText(this.message, this.x, this.y);
		}
		/** End user Message **/
		/** End Background Constructors **/
		
		/** End Game Objects **/
		
		
		
		/** Build Initial State **/
		
		var gameObjectManager = {
			// game and background objects
			gameObjects: [],
			backgroundObjects: [],
			playerShots: [],
			
			// init all stars
			initStars: function() {
				for(var i=0; i < settings.starCount; i++) {
					this.backgroundObjects.push(new Star());
				}
			},
			
			// add a game object
			add: function(gameObject) {
				// add to appropriate array
				if (gameObject.playerShot) {
					this.playerShots.push(gameObject);
				}
				else if (gameObject.gameObject) {
					this.gameObjects.push(gameObject);
				} 
				if (gameObject.deepSpaceObject) {
					this.backgroundObjects.unshift(gameObject);
				}
				else if (gameObject.backgroundObject) {
					
					this.backgroundObjects.push(gameObject);
				}
			},
			
			// removes a game object
			remove: function(removeObj) {
				var objects;
				
				// get correct array
				if (removeObj.playerShot) {
					objects = this.playerShots;
				} 
				else if (removeObj.gameObject) {
					objects = this.gameObjects;
				}
				else if (removeObj.backgroundObject) {
					objects = this.backgroundObjects;
				}
				
				// remove object
				for (var key in objects) {
					var obj = objects[key];
					if (obj === removeObj) {
						delete objects[key];
					}
				}
			},
			
			// animate all objects, given time
			animateObjects: function(t) {
				for (var key in this.gameObjects) {
					var obj = this.gameObjects[key];
					
					if (obj.animate) {
						obj.animate();
					}
				}
				for (var key in this.backgroundObjects) {
					var obj = this.backgroundObjects[key];
					
					if (obj.animate) {
						obj.animate();
					}
				}
				for (var key in this.playerShots) {
					var obj = this.playerShots[key];

					if (obj.animate) {
						obj.animate();
					}
				}
			},
			
			// draws all objects
			drawObjects: function() {
				for (var key in this.backgroundObjects) {
					var obj = this.backgroundObjects[key];
					obj.draw(context);
				}
				for (var key in this.gameObjects) {
					var obj = this.gameObjects[key];
					obj.draw(context);
				}
				for (var key in this.playerShots) {
					var obj = this.playerShots[key];
					obj.draw(context);
				}
			}
		};
		
		// create player and stars, in
		var player = new BasicObject(settings.playerShipImage, 400, 500);
		gameObjectManager.add(player);
		gameObjectManager.initStars();
		/** End Build Initial State **/
		
			
		
		/** main game loop **/
		function gameLoop() {
			count++;									// increment time
			
			/** Update Game Logic **/
			spawner.spawn(count);						// handles spawning of new objects
			gameObjectManager.animateObjects(count);	// animate all existing objects
			collisionDetector.handleCollisions();		// handle collisions
			/** End Update Game Logic **/
			
			/** Begin Update Screen**/
			canvas.width = canvas.width;				// resets screen
			context.fillStyle = '#000';
			context.fillRect(0,0,canvas.width, canvas.height);
			context.fillStyle = '#fff';
			
			// draw objects
			gameObjectManager.drawObjects();
			
			// overlay header
			context.font = '10pt Arial';
			context.textAlign = 'left';
			context.fillText('Location: ' + spawner.currentLocation.locationName, 5, settings.headerY);
			context.fillText('Distance to Earth: ' + (settings.distanceToEarth(count)), 200, settings.headerY);
			context.fillText('Hit Percentage: ' + scoreKeeper.hitPercentage + '%', 400, settings.headerY);
			context.fillText('Points: ' + scoreKeeper.totalPoints, 600, settings.headerY);
			/** End Update Screen **/
		};
		/** end main game loop **/
		
		
		/** Begin User Input Event Handling **/
		// track the ships position w/ the mouse
		canvas.onmousemove = function(args) {
			player.x = args.clientX - (player.image.width / 2) - canvas.offsetLeft;
			
			// lets player move up and down... comment out if undesired.
			player.y = args.clientY - (player.image.height / 2) - canvas.offsetTop;
		};
		
		// handle shooting when click occurs
		canvas.onmousedown = function(args) {
			gameObjectManager.add(new Shot(settings.playerShotImage, 
				player.x + 10, 
				player.y, 
				0, 
				settings.playerShotVelocity));
		};

		// disable right clicking the context
		canvas.oncontextmenu = function() {return false;}
		/** End User Input Events **/
		
		
		// start game loop!
		var gameLoopHandle = setInterval(gameLoop, settings.refreshRate);
	}
}