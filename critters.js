var critters ={};
function initCritters(){
	var critterData = {
		unicorn: {
			name:intern('unicorn'),
			maxHealth: 1,
			speed: 1,
			damage:3,
			xp:30,
			unicorn:true,
			drop: item.unicornHorn,
			tiles: [tile(white,black,151)],
			explain: 'The vicious unicorn is a merciless beast.  They gain powers by sacrificing innocent vigin wizards to their vile deities. Any single attack is no matter how powerful does only 1 damage.'
		},
		dryad: {
			name:intern('dryad'),
			maxHealth: 20,
			speed: 1,
			damage:3,
			xp:10,
			planter:true,
			tiles: [tile(darkYellow,black,100)],
			explain: 'Dryads plant saplings that protect the surrounding vegetation from your mana drain. Kill the dryad to remove the sapling.'
		},
		pixie: {
			name:intern('pixie'),
			maxHealth: 10,
			speed: 1,
			flutters:true,
			damage:2,
			attackRange:1.5,
			hostile:true,
			xp:10,
			tiles: [tile(cyan,black,112)],
			explain: 'pixies can attack diagonally'
		},
		gnome: {
			name:intern('gnome'),
			maxHealth: 20,
			speed: 1,
			damage:5,
			climber:true,
			xp:10,
			toadstoolplanter:true,
			tiles: [tile(blue,black,103)],
			explain: 'a gnome no more than 3 apples high.  It has a habit of planting toadstools where ever it goes.'
		},
		fairy: {
			name:intern('fairy'),
			maxHealth: 5,
			speed: 1.5,
			damage:1,
			hostile:true,
			xp:7,
			sleepy:true,
			tiles: [tile(yellow,black,102)],
			explain: 'Fairies love fresh flowers and the laughter of children.',
			wakeup:function(silent){
				if(!silent){
					message('with a tinkle of laughter a fairy wakes up');
				}
				var self = this;
				map[this.place.z].actionlist.add(map.turnNumber,function(){self.tick();});
			}
		}
	};
	var animalPrototype = {
		maxHealth: 5,
		size: 3,
		speed: 1,
		damage:5,
		xp:50,
		fine: 0,
		critter: true,
		huntingRadius: 15,
		positions: [new Direction(0,0)],
		intangables: [],
		priority: 6,
		forAllPositions: function(fn){
			for(var i=0; i<this.positions.length; i++){
				fn(this.positions[i]);
			}
		},
		attacked: function(point, thing, damage) {
			if(this.unicorn){
				damage = Math.min(1,damage);
			}
			this.health -= damage;
			this.enrage(thing);
			if(thing && this.stampedes){
				map[this.place.z].mobiles.forall(
					function(critter){
						if(critter.stampedes){
							critter.enrage(thing);
						}
					}
				);
			}
			return damage;
		},
		enrage: function(thing){
			if(!this.enemy && thing){
				message('The '+interned[this.name]+' became enraged.');
			}
			if(thing){
				this.enemy = thing;
				this.hunt();
			}
		},
		tick: function() {
			if (this.health <= 0) {
				this.die();
				return;
			}
			var speed = dither(this.speed) + ((this.vengeful && this.enemy)?1:0);
			for(var i=0; i<speed; i++){
				if(this.enemy && this.withinRange(this.enemy.place,this.place, this)){
					this.attack(this.enemy);
				} else {
					this.chooseMove();
					this.move(); 
				}
			}
			if(this.planter && this.place.manaAt() >= 2 && onein(8)){
				this.planted.push( plants.sapling.init(this.place.x,this.place.y,this.place.z) );
			}
			if(this.toadstoolplanter && this.place.unBlocked(this) && onein(8)){
				var neighbors = this.place.neighbors();
				var touching = 0;
				for(var i=0; i<neighbors.length; i++){
					if(!neighbors[i].unBlocked({size:3})){
						touching++;
					}
				}
				if(touching<=2){
					this.place.setPlants(plants.toadstool.init());
				}
			}
			if(this.unicorn && this.place.magicAt() == 0 && this.place.terrainAt().name == terrains.drained.name){
				this.place.setMana(4);
				critters.fairy.init(this.place.x,this.place.y,map[this.place.z],true);
				message('The unicorn sheds a single tear on the despoiled land, bringing it back to life');
			}
			var self=this;
			map[this.place.z].actionlist.add(map.turnNumber,function(){self.tick();});
		},
		hunt: function(){
			if(this.enemy && this.enemy.health >0){
				var goal = this.enemy.place;
				var self = this;
				this.path = astar(
					this.place,
					function(p){ return (self.unBlocked(p,self))?1:20; }, 
					function(p){ return self.withinRange(goal,p,self); },
					goal,
					this.huntingRadius);
				this.path.shift();
			}
		},
		die: function(){
			map[this.place.z].mobiles.remove(this);
			message('The '+interned[this.name]+' dies',darkYellow);
			if(this.drop){
				map[this.place.z].items.add(this.drop.init(this.place.add(new Direction(0,0)))); //to get a fresh point
			}
			if(this.unicorn){
				message('You are cursed to lose one health point every 20 turns',magenta);
				player.curses.push({tick:function(turn){
					if(turn%20==0){
						player.health--;
						message('The curse steals one health point.',red);
					}
				}});
			}
			player.levelUp(this.xp);
			achieve.crittersKilled[this.name] = achieve.crittersKilled[this.name]+1 || 1;
			if(this.planted){
				for(var i=0; i< this.planted.length; i++){
					this.planted[i].die();
				}
			}
		},
		at: function(point){
			for(var i=0; i<this.positions.length; i++){
				var p = this.place.add(this.positions[i]);
				if( point.same(p)){
					return true;
				}
			}
			return false;
		},
		recordLocation: function(array){
			for(var i=0; i<this.positions.length; i++){
				var p = this.place.add(this.positions[i]);
				array[p.x][p.y].push(this);
			}
		},
		move: function() {
			var p = this.path.shift();
			if( p && this.unBlocked(p, this) ){	
				this.place.move(p.x, p.y, this.place.z, this);
			} else {
				this.path = [];
			}
		},
		chooseMove: function(){ 
			if(this.path.length === 0){
				this.hunt();
				if(this.path.length === 0){ 
					var d = new Direction(Math.floor(Math.random()*11-5), Math.floor(Math.random()*11-5));
					var goal;
					if(this.homebody){
						goal = this.home.add(d);
					} else if(this.herder){
						var herders = [];
						map[this.place.z].mobiles.forall(function(c){
							if(c.herder){ herders.push(c); }
						});
						goal = randomElt(herders).place.add(d);
					} else {
						goal = this.place.add(d);
					}
					var self = this;
					this.path = astar(
						this.place,
						function(p){ return (self.unBlocked(p,self))?1:20; }, 
						function(p){ return self.withinRange(goal,p,self); },
						goal,
						15);
					if(this.path.length > 0){
						if(this.place.distance(this.path[0]) === 0){
							this.path.shift();
						}
					}
				}
			}
		},
		attack: function(critter){
			critter.attacked(critter.place,this,this.damage);
		},
		init: function(x,y,level,awake){
			var t = Object.create(this);
			t.place = level.newPoint(x, y);
			t.home = level.newPoint(x, y);
			t.health = this.maxHealth;
			t.enemy = undefined;
			level.mobiles.add(t);
			t.path = [];
			var pos = [];
			for(var i=0; i<this.positions.length; i++){
				pos[i] = this.positions[i];
			}
			t.positions = pos;
			if(t.hostile){
				t.enemy = player;
			}
			if(t.planter){
				t.planted = [];
			}
			if(!t.sleepy || awake){
				map[t.place.z].actionlist.add(map.turnNumber,function(){t.tick();});
			}
			return t;
		},
		draw: function(context){
			var p = this.positions.concat(this.intangables);
			for(var i=0; i<p.length; i++){
				if(view[hudWidth+this.place.x + p[i].x][this.place.y + p[i].y] < this.priority){
					context.drawImage(this.tiles[i], (hudWidth + this.place.x + p[i].x) * tileWidth, (this.place.y +p[i].y) * tileHeight);
					view[hudWidth+this.place.x+p[i].x][this.place.y+p[i].y] = this.priority;
				}
			}
		},
		unBlocked: function(point,self){
			for(var i=0; i<self.positions.length; i++){
				var p = point.add(self.positions[i]);
				if( !map[self.place.z].unBlocked(p,self) ){
					return false;
				}
			}
			return true;
		},
		withinRange: function(point1,point2,self){
		return point1.distance(point2) <= (this.attackRange || 1);
		}
	};
	for(var animal in critterData){
		if(critterData.hasOwnProperty( animal )){
			var t = Object.create(animalPrototype);
			critters[animal] = copyInto(t,critterData[animal]);
		}
	}
}

var gnomenames = ['Papa Gnome', 'Actor Gnome', 'Timid Gnome', 'Dreamy Gnome', 'Baby Gnome', 'Baker Gnome', 'Barber Gnome', 'Blacksmith Gnome', 'Brainy Gnome', 'Carpenter Gnome', 'Chef Gnome', 'Clueless Gnome', 'Clumsy Gnome', 'Cobbler Gnome', 'Crazy Gnome', 'Dabbler Gnome', 'Farmer Gnome', 'Fisher Gnome', 'Flighty Gnome', 'Grandpa Gnome', 'Greedy Gnome', 'Sweety Gnome', 'Grouchy Gnome', 'Gutsy Gnome', 'Handy Gnome', 'Hefty Gnome', 'Hunter Gnome', 'Jokey Gnome', 'Brainy Gnome', 'Lazy Gnome', 'Liar Gnome', 'Lucky Gnome', 'Nanny Gnome', 'Nosey Gnome', 'Painter Gnome', 'Panicky Gnome', 'Poet Gnome', 'Postman Gnome', 'Potter Gnome', 'Pushover Gnome', 'Reporter Gnome', 'Scaredy Gnome', 'Sculptor Gnome', 'Showoff Gnome', 'Sickly Gnome', 'Chilly, Gnome', 'Sloppy Gnome', 'Stinky, Gnome', 'Smelly Gnome', 'Slouchy Gnome', 'Snappy Gnome', 'Social Gnome', 'Suspicious Gnome', 'Tailor Gnome', 'Timber Gnome', 'Tracker Gnome', 'Traveling Gnome', 'Vanity Gnome', 'Weepy Gnome', 'Doc Gnome', 'Happy Gnome', 'Sneezy Gnome', 'Bashful Gnome', 'Dopey Gnome', 'Sleepy Gnome', 'Grumpy Gnome'];
