function drain(x,y,z,amount){
	var drainable = Math.min(amount, map[z].magic[x][y]);
	map[z].magic[x][y] -= drainable;
	amount -= drainable;
	map[z].terrain[x][y].update(x,y,z);
	
	amount = drainTiles(map[z], [[x-1,y],[x+1,y],[x,y-1],[x,y+1]], amount, z);
	amount = drainTiles(map[z], [[x-1,y-1],[x+1,y+1],[x+1,y-1],[x-1,y+1]], amount, z);
	amount = drainTiles(map[z], [[x-2,y],[x+2,y],[x,y-2],[x,y+2]], amount, z);
}

function drainTiles(level, tiles, amount, z){
	shuffle(tiles);
	var neighbors = [];
	for(var i=0; i<tiles.length;i++){
		if(level.legal(tiles[i][0],tiles[i][1])){
			neighbors.push(tiles[i]);
		}
	}
	var total = 0;
	for(var i=0; i<neighbors.length; i++){
		total+=level.magic[neighbors[i][0]][neighbors[i][1]];
	}
	drainable = Math.min(amount, total);
	amount-=drainable;
	for(var i=0; drainable>0 && i<100; i++){
		neighbors.sort(function(a,b){return level.magic[b[0]][b[1]] - level.magic[a[0]][a[1]];});
		var a = neighbors[0];
		if(level.magic[a[0]][a[1]] > 0){
			drainable--;
			level.magic[a[0]][a[1]]--;
		}
	}
	for(var i=0; i<neighbors.length; i++){
		level.terrain[neighbors[i][0]][neighbors[i][1]].update( neighbors[i][0], neighbors[i][1], z);
	}
	return amount;
}

fingerOfDeath = {
	name: intern('finger of death'),
	range: 1,
	level: 0,
	mana: 20,
	target:'directional',
	activate:function(){},
	key:[],
	description:'damages one adjacent target of your choosing for 20 damage. It uses 20 mana.'
}
blight = {
	name: intern('blight'),
	range: 2,
	level: 0,
	mana: 20,
	target:'none',
	activate:function(x,y,z){
		map[z].terrain[x][y]=terrains.blightedGrowth.init(x,y,z);
	},
	key:[]
}