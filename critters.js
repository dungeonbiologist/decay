var critters ={};
function initCritters(){
	var critterData = {
		unicorn: {
			name:intern('unicorn'),
			maxHealth: 10,
			speed: 1,
			damage:10,
			speed: 1,
			xp:400,
			drop: item.unicornHorn,
			tiles: [tile(white,black,151)],
			explain: 'The vicious unicorn is a merciless beast.  They gain powers by sacrificing innocent vigin wizards to their vile deities.'
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
		attacked: function(point, thing, damage, explosive) {
			if(explosive && this.drop){
				this.drop = undefined;
				message('The '+interned[this.name]+' is too bloodied by the explosion to leave a trophy', red);
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
			for(var i=0; i<this.speed + ((this.vengeful && this.enemy)?1:0); i++){
				if(this.enemy && this.withinRange(this.enemy.place,this.place, this)){
					this.attack(this.enemy);
				} else {
					this.chooseMove();
					this.move(); 
				}
			}
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
					this.huntingRadius
				);
				this.path.shift();
			}
		},
		die: function(){
			map[this.place.z].mobiles.remove(this);
			var self = this;
			this.forAllPositions( function(p){
					map[self.place.z].terrain[self.place.x +p.x][self.place.y +p.y] = terrains.guts.init();
				}
			)
			if(this.drop){
				map[this.place.z].items.add(this.drop.init(this.place.add(new Direction(0,0)))); //to get a fresh point
			}
			message('The '+interned[this.name]+' dies',darkYellow);
			player.levelUp(this.xp);
			player.fine(this.fine,this);
			achieve.crittersKilled[this.name] = achieve.crittersKilled[this.name]+1 || 1;
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
			if(this.path.length == 0){
				this.hunt();
				if(this.path.length == 0){ 
					var d = new Direction(Math.floor(Math.random()*11-5), Math.floor(Math.random()*11-5));
					if(this.homebody){
						var goal = this.home.add(d);
					} else if(this.herder){
						var herders = [];
						map[this.place.z].mobiles.forall(function(c){
							if(c.herder){ herders.push(c) }
						});
						var goal = randomElt(herders).place.add(d);
					} else {
						var goal = this.place.add(d);
					}
					var self = this;
					this.path = astar(
						this.place,
						function(p){ return (self.unBlocked(p,self))?1:20; }, 
						function(p){ return self.withinRange(goal,p,self); },
						goal,
						15
					);
					if(this.path.length > 0){
						if(this.place.distance(this.path[0]) == 0)
							this.path.shift();
					}
				}
			}
		},
		attack: function(critter){
			critter.attacked(critter.place,this,this.damage);
		},
		init: function(x,y,level){
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
				if( !map[self.place.z].unBlocked(p,self) )
					return false;
			}
			return true;
		},
		withinRange: function(point1,point2,self){
		return point1.distance(point2) <=1;
		}
	};
	for(var animal in critterData){
		if(critterData.hasOwnProperty( animal )){
			var t = Object.create(animalPrototype);
			critters[animal] = copyInto(t,critterData[animal]);
		}
	}
}