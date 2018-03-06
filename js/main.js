// Confusing terms. Rat vs Mouse:
// Rat = The things chased by a cat
// Mouse = the Mouse pointer.

$(window).load(function() {

	var canvas = $("#c");
	var canvasHeight;
	var canvasWidth;
	var ctx;

	var catCollection;
	var ratCollection;
	var messageCollection
	var ratBox;
	var toRunDistance

	var score = 0;
	var counter = 0;
	var gameFirst = true
	var gameOver = true
	var messages
	var imageHole = new Image();
	imageHole.src = 'images/hole.png';

	function init() {
		initEventListeners();
		updateCanvasDimensions();
		timeout();
	};


	function resetGame() {
		updateCanvasDimensions();

		ratCollection = new RatCollection();
		ratCollection.newRat();

		catCollection = new CatCollection();
		catCollection.newCat();
		catCollection.newCat();

		messageCollection = new MessageCollection();
		messageCollection.newMessage('Protect the mouse!!', new Vector(canvasWidth/2-30 , 100))

		score = 0;
		counter = 0;
		gameOver = false;
		gameFirst = false;
	}

	function initEventListeners() {
		$(window).bind('resize', updateCanvasDimensions).bind('mousemove', onMove);

		canvas.get(0).ontouchmove = function(e) {
			e.preventDefault();
			onTouchMove(e);
		};

		canvas.get(0).ontouchstart = function(e) {
			e.preventDefault();
		};
		canvas.get(0).onclick = function(e) {
			e.preventDefault();
			onClick(e)
		};
	};

	function updateCanvasDimensions() {
		canvas.attr({height: $(window).height(), width: $(window).width()});
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();

		ratBox = new RatBox();

		toRunDistance =  canvasWidth/32 + canvasHeight/32
		draw();
	};

	function onMove(e) {
		if (catCollection)
			catCollection.mousePos.set(e.pageX, e.pageY);
	};

	function onTouchMove(e) {
		if (catCollection)
			catCollection.mousePos.set(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	};

	function onClick(e) {
		if (gameOver) {
			document.getElementById('welcomeDiv').setAttribute('style','display: none');
			document.getElementById('tipDiv').setAttribute('style','display: none');
			//alert(	document.getElementById('welcomeDiv').getAttribute('style') );
			resetGame();
		}
	};

	function timeout() {
		update();
		draw();

		setTimeout(function() { timeout() }, 30);
	};

	function doScore() {
		counter++;
		if (counter % 10 == 0) {
			score ++;
		}
		if (counter % 500 == 0) {
			var cat = catCollection.newCat()
			messageCollection.newMessage("     New Cat   ", cat.curPos);
		}
		if (counter % 500 == 250) {
			var rat = ratCollection.newRat()
			messageCollection.newMessage("Extra Mouse + 10", rat.curPos)
			score += 10;
		}

	}

	function draw() {
		var tmpCanvas = canvas.get(0);

		if (tmpCanvas.getContext == null) {
			return;
		};

		ctx = tmpCanvas.getContext('2d');

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctx.strokeStyle = '#CCC';

		// Outer box
		ctx.fillStyle = '#999999'
		ctx.strokeRect(5,5, canvasWidth-10, canvasHeight-10);

		// Inner Rat box
		if (ratBox) {
			ratBox.draw();
		}
		ctx.fillStyle = '#999999'

		ctx.drawImage(imageHole, canvasWidth/2 - imageHole.width/2, canvasHeight/2 - imageHole.height/2);

		// Stats:
		ctx.strokeStyle = '#CCC';
		ctx.font = '20pt Helvetica Neue';
		ctx.fillText("score: "+score, canvasWidth - 180, 40 );


		if (catCollection) {
			catCollection.draw();
		}
		if (ratCollection) {
			ratCollection.draw();
		}
		if (messageCollection) {
			messageCollection.draw();
		}

		if ((!gameFirst) && (gameOver)) {
			ctx.strokeStyle = '#FFFFFF';
			ctx.font = '60pt Helvetica Neue';
			ctx.fillText("Game Over", canvasWidth/2 -230, 100  );
			ctx.font = '20pt Helvetica Neue';
			ctx.fillText("Click to play again", canvasWidth/2 - 130, 170  );
		}
	};


	function update() {
		if (!gameOver) {
			doScore();

			if (ratBox) {
				ratBox.update();
			}
			if (catCollection) {
				catCollection.update(ratCollection, messageCollection);
			}
			if (ratCollection) {
				ratCollection.update();
			}
		}

		if (messageCollection) {
			messageCollection.update();
		}
	};

	function Vector(x, y) {
		this.x = x;
		this.y = y;

		this.addX = function(x) {
			this.x += x;
		};

		this.addY = function(y) {
			this.y += y;
		};

		this.set = function(x, y) {
			this.x = x;
			this.y = y;
		};
	};

	function MessageCollection() {
		this.messages = new Array();

		this.newMessage = function(msg, xAndY) {
			this.messages.push( new Message(msg, xAndY) )
		}

		this.update = function() {
			for (var i = 0; i < this.messages.length; i++) {
				var message = this.messages[i];
				if (message == null) {
					continue;
				}
				message.timeToLive--;
			}
			// If first message is to be taken off the stack
			if (this.messages.length > 0 && this.messages[0].timeToLive <= 0) {
				this.messages.shift()
			}
		}


		this.draw = function() {
			for (var i = 0; i < this.messages.length; i++) {
				var message = this.messages[i];
				if (message == null) {
					continue;
				}
				message.draw(i);
			}
		}

	};


	function Message(msg, xAndY) {
		var timeToLiveBase = 100;
		this.timeToLive = timeToLiveBase;
		var baseColor = 0xCC

		// xAndY Vector object is a POINTER - so dont change it
		// Fail: this.curPos = xAndY

		var x = xAndY.x
		if (x < 140) {
			x = 140;
		} else if (x > canvasWidth - 140) {
			x = canvasWidth - 140;
		}
		var y = xAndY.y
		if (y < 30) {
			y = 30;
		} else if (y > canvasHeight - 30) {
			y = canvasHeight - 30;
		}

		this.curPos = new Vector(x, y)

		this.draw = function(){
			var scale = 3 - (this.timeToLive / timeToLiveBase)*2;
			var alpha =  (this.timeToLive / timeToLiveBase);

			ctx.save()
			ctx.translate(this.curPos.x, this.curPos.y)
			ctx.scale(scale, scale)
			ctx.beginPath()
			ctx.fillStyle = "rgba(200, 200, 200, "+alpha+")";
			ctx.font =  '16pt Helvetica Neue';
			ctx.fillText(msg, -80, 10);
			ctx.closePath()
			ctx.fill()

			ctx.restore();

		};
	};

	function RatBox(){
		this.minY = Math.round(canvasHeight/2 - canvasHeight/8);
		this.maxY = Math.round(canvasHeight/2 + canvasHeight/8);
		this.minX = Math.round(canvasWidth/2 - canvasWidth/8);
		this.maxX = Math.round(canvasWidth/2 + canvasWidth/8);

		this.coords = new Array();
		this.coords.push( new Vector( this.minX , 	this.maxY ) );
		this.coords.push( new Vector( Math.round(canvasWidth/2) ,this.maxY ) );
		this.coords.push( new Vector( this.maxX , 	this.maxY ) );
		this.coords.push( new Vector( this.maxX,  	Math.round(canvasHeight/2) ) );
		this.coords.push( new Vector( this.maxX, 	this.minY ) );
		this.coords.push( new Vector( Math.round(canvasWidth/2) ,this.minY ) );
		this.coords.push( new Vector( this.minX, 	this.minY ) );
		this.coords.push( new Vector( this.minX, 	Math.round(canvasHeight/2) ) );


		this.targetIndex = -1;
		this.targetVector;

		this.draw = function(){
			ctx.strokeStyle = '#999999';
			ctx.fillStyle = '#EEEEEE';
			ctx.beginPath();
			ctx.moveTo(this.coords[0].x, this.coords[0].y);
			for (var i = 1; i < this.coords.length; i++) {
				ctx.lineTo(this.coords[i].x, this.coords[i].y);
			}
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}

		this.update = function() {
			// if we are going to choose a new node to move
			if (this.targetIndex == -1 && Math.random() < 0.01) {
				this.targetIndex = Math.floor(Math.random() * this.coords.length);
				var v = this.coords[this.targetIndex];

				this.targetVector = new Vector(v.x, v.y);

				// select a new target X
				if (this.targetIndex == 0 || this.targetIndex == 6 || this.targetIndex == 7) {
					this.targetVector.x -= Math.round(Math.random() * 20);
				}
				else if (this.targetIndex == 2 || this.targetIndex == 3 || this.targetIndex == 4) {
					this.targetVector.x += Math.round(Math.random() * 20);
				}
				else { // 1 or 4
					this.targetVector.x += Math.round(Math.random() * 20) - 10;
				}

				// new target Y
				if (this.targetIndex < 3) {
					this.targetVector.y += Math.round(Math.random()*20);
				}
				else if (this.targetIndex == 4 || this.targetIndex == 5 || this.targetIndex == 6) {
					this.targetVector.y -= Math.round(Math.random() * 20);
				}
				else {
					this.targetVector.y += Math.round(Math.random() * 20) - 10;
				}
			}

			if (this.targetIndex != -1)  {

				if (this.coords[this.targetIndex].x < this.targetVector.x) {
					this.coords[this.targetIndex].x += 1;
				}
				else if (this.coords[this.targetIndex].x > this.targetVector.x) {
					this.coords[this.targetIndex].x -= 1;
				}

				if (this.coords[this.targetIndex].y < this.targetVector.y) {
					this.coords[this.targetIndex].y += 1;
				}
				else if (this.coords[this.targetIndex].y > this.targetVector.y) {
					this.coords[this.targetIndex].y -= 1;
				}

				// If we have reached our target
				if (this.coords[this.targetIndex].x == this.targetVector.x &&
						this.coords[this.targetIndex].y == this.targetVector.y) {
					this.targetIndex = -1;
				}
			}
		}

               this.getPotentialVector = function() {
		       var count = 0;
                       do {
                               // Choose random X & Y
                               var x = Math.round( this.minX + Math.round(Math.random() * (this.maxX - this.minX)) );
                               var y = Math.round( this.minY + Math.round(Math.random() * (this.maxY - this.minY)) );
			       count += 1;
			       // In the highly unlikely event of us persistently randomly choosing a location outside
			       // the ratbox - we just pick the middle point
			       if (count == 10) {
				       x = this.minX + (this.maxX - this.minX)/2;
				       y = this.minY + (this.maxY - this.minY)/2;
			       }
                       } while(!this.inside(x, y))
                       return new Vector(x, y);
		}

	        // This function casts a ray 'right' and counts the number of line intersections with ratBox.
	        // Even number of intersections are outside the box. Odd is inside.
		this.inside = function(x, y) {
		    var inside = false;
		    for (var i = 0, j = this.coords.length - 1; i < this.coords.length; j = i++) {
			var xi = this.coords[i].x, yi = this.coords[i].y;
			var xj = this.coords[j].x, yj = this.coords[j].y;

			var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) {
				inside = !inside;
			}
		    }
		    return inside;
		};

	}

	function RatCollection(){
		this.rats = new Array();

		this.newRat = function(messageCollection){
			var rat = new Rat(canvasWidth/2, canvasHeight/2);
			this.rats.push(rat);
			return rat;
		};

		this.update = function(){
			var ratsLength = this.rats.length;

			for (var i = 0; i < ratsLength; i++) {
				var rat = this.rats[i];
				if (rat == null) {
					continue;
				}
				if (rat.targetPos != null && Math.random() < 0.01) {
					rat.targetPos = ratBox.getPotentialVector();
				}
				rat.update()
			}
		}

		this.draw = function() {
			var ratsLength = this.rats.length;
			for (var i = 0; i < ratsLength; i++) {
				var rat = this.rats[i];

				if (rat == null) {
					continue;
				}
				rat.draw()
			};
		};

		this.getRandomRat = function(catPos) {
			// 30% chance of a random rat
			if (Math.random() < 0.3) {
				var i = Math.random() * this.rats.length
				return this.rats[Math.floor(i)]
			}

			// 70% chance of nearest rat
			var nearest = canvasWidth + canvasHeight;
			var nearestIndex = 0;
			var ratsLength = this.rats.length;

			for (var i = 0; i < ratsLength; i++) {
				var rat = this.rats[i];

				if (rat == null) {
					continue;
				}

				var dx = catPos.x - rat.curPos.x;
				var dy = catPos.y - rat.curPos.y;
				var dd = (dx * dx) + (dy * dy);
				var d = Math.sqrt(dd);
				if (nearest > d) {
					nearest = d;
					nearestIndex = i
				}
			}
			return this.rats[nearestIndex]
		};
	};

	function CatCollection() {

		this.mousePos = new Vector(0, 0);
		this.cats = new Array();

		this.newCat = function() {
			// Cats must appear at a random screen edge
			if (Math.random() < 0.5) {
				if (Math.random() < 0.5) {
					x = 25;
				} else {
					x = canvasWidth - 25;
				}

				y = Math.random() * canvasHeight
			} else {
				if (Math.random() < 0.5) {
					y = 25;
				} else {
					y = canvasHeight - 25;
				}

				x = Math.random() * canvasWidth
			}
			var cat = new Cat(x, y);
			this.cats.push(cat);

			return cat;
		};

		this.update = function(ratCollection, messageCollection) {
			var catsLength = this.cats.length;

			for (var i = 0; i < catsLength; i++) {
				var cat = this.cats[i];

				if (cat == null)
					continue;

				var dx = this.mousePos.x - cat.curPos.x;
				var dy = this.mousePos.y - cat.curPos.y;
				var dd = (dx * dx) + (dy * dy);
				var d = Math.sqrt(dd);


				// if mouse pointer is near
				if (d < toRunDistance) {

					potentialX = cat.curPos.x - dx*100
					potentialY = cat.curPos.y - dy*100

					// If the 'scared distance' is more than what we currently have or if the targetRat has not been cleared
					// (ie the first scaring) then plot a new run away position
					if ((cat.timeRunning < (toRunDistance - d) / 5 )
							|| (cat.targetRat != null)) {
						cat.targetPos.x = potentialX
						cat.targetPos.y = potentialY
						cat.timeRunning = (toRunDistance - d) / 5;
						cat.targetRat = null;
					}

					cat.isScared = true;
				}
				else {
					cat.isScared = false;
				}

				// if cat has run far enough
				if (cat.timeRunning <= 0 && cat.targetRat == null) {
					cat.targetRat = ratCollection.getRandomRat(cat.curPos)
					cat.pointerThisClose = Number.MAX_VALUE
				}

				// Is cat running really quickly -> Terrified
				if ( !cat.isTerrified && Math.abs(cat.velocity.x) + Math.abs(cat.velocity.y) > 8) {
					cat.isTerrified = true;
					score += 5;
					messageCollection.newMessage("Terrified Cat! + 5", cat.curPos);
				}
				if( cat.isTerrified && Math.abs(cat.velocity.x) + Math.abs(cat.velocity.y) < 2) {
					cat.isTerrified = false
				}

				// Is cat near its target rat:
				if (cat.targetRat != null) {
					var dx = cat.targetRat.curPos.x - cat.curPos.x;
					var dy = cat.targetRat.curPos.y - cat.curPos.y;
					var dd = (dx * dx) + (dy * dy);
					var d = Math.sqrt(dd);
					if (d < 35) {
						messageCollection.newMessage(" Lunch - Yummy Mouse ", cat.curPos)
						messageCollection.newMessage("    Game Over   ", this.mousePos)
						gameOver = true;
					}
				}
				cat.update();
			};
		};

		this.draw = function() {

			var catsLength = this.cats.length;
			for (var i = 0; i < catsLength; i++) {
				var cat = this.cats[i];

				if (cat == null){
					continue;
				}


				cat.draw();
			};
		};
	};

	function Rat(x, y) {
		var imgRat = new Image();
		imgRat.src = 'images/rat.png';

		this.curPos = new Vector(x, y);
		this.targetPos = new Vector(x, y);

		this.update = function() {
			var ratio = Math.abs(this.targetPos.x - this.curPos.x) + Math.abs(this.targetPos.y - this.curPos.y)

			if (Math.abs(this.targetPos.x - this.curPos.x) > 1) {
				this.curPos.x += (this.targetPos.x - this.curPos.x) / (ratio/2)
			}
			if (Math.abs(this.targetPos.y - this.curPos.y) > 1) {
				this.curPos.y += (this.targetPos.y - this.curPos.y) / (ratio/2)
			}

		};


		this.draw = function() {
			ctx.beginPath();
			// FF throws weird errors on its first attempt to draw an image
			try {
				ctx.drawImage(imgRat, this.curPos.x - imgRat.width / 2, this.curPos.y - imgRat.height / 2);
			} catch(e) {
				if (window.console != undefined) {
			        console.log(e);
			    }

			}
			ctx.fill();

		};
	};

	function Cat(x, y) {
		var imgCat = new Image();
		imgCat.src = 'images/cat.png';

		this.curPos = new Vector(x, y);
		this.targetPos = new Vector(x, y);
		this.velocity = new Vector(0, 0);
		this.timeRunning = 0;
		this.timeBeforeAlive = 50;
		this.targetRat = null;
		this.isScared = false;
		this.isTerrified = false;

		var accelerationFactor = 0.95;


		this.update = function() {
			if (this.timeBeforeAlive >= 0 ) {
				this.timeBeforeAlive--
				return
			}

			this.timeRunning--;

			if (this.targetRat != null) {
				this.targetPos.x = this.targetRat.curPos.x;
				this.targetPos.y = this.targetRat.curPos.y;
			}
			var dx = this.targetPos.x - this.curPos.x
			var dy = this.targetPos.y - this.curPos.y
			var ratio = Math.abs(dx) + Math.abs(dy)

			var xInc = dx/(ratio) * 0.2;
			var yInc = dy/(ratio) * 0.2;

			this.velocity.x += xInc;
			this.velocity.y += yInc;

			// If cat is scared accelerate at greater speed
			if (this.isScared) {
				this.velocity.x += xInc*3;
				this.velocity.y += yInc*3;
			}

			this.velocity.x *= accelerationFactor;
			this.velocity.y *= accelerationFactor;

			this.curPos.x += this.velocity.x;
			this.curPos.y += this.velocity.y;

			//If chased out the block:
			var chasedOut = false;

			if (this.curPos.x < -20) {
				this.curPos.x = -20;
				chasedOut = true;
			}
			if (this.curPos.x > canvasWidth+20) {
				this.curPos.x = canvasWidth+20;
				chasedOut = true;
			}
			if (this.curPos.y < -20) {
				this.curPos.y = -20;
				chasedOut = true;
			}
			if (this.curPos.y > canvasHeight+20) {
				this.curPos.y = canvasHeight+20;
				chasedOut = true;
			}
			if (chasedOut) {
				this.velocity = new Vector(0,0)
				this.timeRunning = 0
			}

		};

		this.draw = function() {

			if (this.timeBeforeAlive >= 0) {
				var scale = 1 + (this.timeBeforeAlive / 50) * 10;

				ctx.save()
				ctx.translate(this.curPos.x, this.curPos.y)
				ctx.scale(scale, scale)
				ctx.globalAlpha =  1 - (this.timeBeforeAlive / 50);

				// FF throws weird errors on its first attempt to draw an image
				try {
					ctx.drawImage(imgCat, -imgCat.width / 2, -imgCat.height / 2);
				} catch(e) {
					if (window.console != undefined) {
				        console.log(e);
				    }
				}
				ctx.restore();

			}
			else {
				ctx.save()
				ctx.translate(this.curPos.x, this.curPos.y)

				if (this.targetPos.x < this.curPos.x) {
					ctx.scale(-1, 1)
				}
				var theta = Math.atan( ( this.targetPos.y - this.curPos.y) / Math.abs(this.targetPos.x - this.curPos.x)  )

				if (!isNaN(theta)) {
					ctx.rotate(theta);
				}

				ctx.drawImage(imgCat, - imgCat.width / 2, - imgCat.height / 2);

				ctx.restore();
			}
		};
	};


	init();
});
