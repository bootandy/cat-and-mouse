
	
$(window).load(function() {

	var canvas = $("#c");
	var canvasHeight;
	var canvasWidth;
	var ctx;

	var catCollection;
	var ratCollection;
	var messageCollection
	var ratBoxX
	var ratBoxY
	var ratBoxWidth
	var ratBoxHeight
	var toRunDistance
	
	var score = 0;
	var counter = 0;
	var gameFirst = true
	var gameOver = true
	var messages
	
	function init() {
		initEventListeners();
		updateCanvasDimensions();
		//resetGame();
		timeout();
	};
	
	
	function resetGame() {
		updateCanvasDimensions();
		
		ratCollection = new RatCollection();
		ratCollection.newRat();

		catCollection = new CatCollection();
		catCollection.newCat();
	
		messageCollection = new MessageCollection();
		messageCollection.newMessage('Protect the mouse!!', new Vector(canvasWidth/2 , 100))
		
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

		ratBoxX = canvasWidth/2 - canvasWidth/8 - 10;
		ratBoxY = canvasHeight/2 - canvasHeight/8 - 10;
		ratBoxWidth = canvasWidth/4 + 20;
		ratBoxHeight = canvasHeight/4 + 20;
	
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
		if (counter % 500 == 250) {
			var cat = catCollection.newCat()
			messageCollection.newMessage("     New Cat   ", cat.curPos);
		}
		if (counter % 500 == 0) {
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
		ctx.strokeRect(ratBoxX - 5, ratBoxY - 5, ratBoxWidth + 10, ratBoxHeight + 10);
		
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
			ctx.fillText("Game Over", canvasWidth/2 -200, 100  );
			ctx.font = '20pt Helvetica Neue';
			ctx.fillText("Click to play again", canvasWidth/2 - 110, 170  );
		}
	};

	
	function update() {		
		if (!gameOver) {
			doScore();
			
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
		
		// xAndY Vector object is a POINTER
		//this.curPos = xAndY
		
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
				if (Math.random() < 0.01) {
					rat.targetPos = this.setNewTargetPos(i)
				}
				rat.update()
			}
		}
		
		this.setNewTargetPos = function(ratIndex) {
			// Generate 10 possible new locations
			var possibleTargets = new Array();
			for (var i = 0; i < 10; i++) {
				v = new Vector( 
						parseInt( ratBoxX + Math.random() * ratBoxWidth),
						parseInt( ratBoxY + Math.random() * ratBoxHeight))
				possibleTargets.push(v);
			}
			
			var furthestAway = 0
			var index = 0
			for (var i = 0; i < 10; i++) {
				var pos = possibleTargets[i]
				var minDist = canvasWidth + canvasHeight;
				
				// Find the nearest rat to this possible destination
				for (var j = 0; j < this.rats.length; j++) {
					var rat = this.rats[j];
				
					// dont look at this rat's own position
					if (rat == null || ratIndex == j){
						continue;
					}
					
					var dx = rat.curPos.x - pos.x;
					var dy = rat.curPos.y - pos.y;
					var dd = (dx * dx) + (dy * dy);
					var d = Math.sqrt(dd);
					if (minDist > d){
						minDist = d;
					}
				}
				
				// Of the 10 possibles we will take the one furthest away from the nearest rat
				if (furthestAway < minDist) {
					furthestAway = minDist;
					index = i;
				}
			}
			return possibleTargets[index]
		};


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
			// 20% chance of a random rat
			if (Math.random() < 0.2) {
				var i = Math.random() * this.rats.length
				return this.rats[parseInt(i)]
			}
			
			// 80% chance of nearest rat
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
					score += 20;
					messageCollection.newMessage("Terrified Cat! + 20", cat.curPos);
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
		//imgCat.ready( function() { alert('cat here'); } );

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
			if ((this.curPos.x < -20) || (this.curPos.x > canvasWidth + 20) 
					|| (this.curPos.y < -20) || (this.curPos.y > canvasHeight + 20)) {
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
