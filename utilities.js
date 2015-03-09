var achieve;
var actionlist = [];
actionlist.tick = function(turn){
	this.sort(function(a,b){return a.turn-b.turn;});
	while(this.length>0){
		var a = this.shift();
		if(a.turn > turn){
			this.push(a);
			break;
		}
		a.tick();
	}
}
actionlist.add = function(turn,tick){
	this.push({turn:turn, tick:tick});
}
function dither(num){ //probabilistic rounding, so the average remains the same
	return Math.floor(num) + (Math.random()< (num-Math.floor(num)))? 1: 0;
}

function copyInto(thinga, thingb){
	for(var a in thingb){
		if(thingb.hasOwnProperty(a)){
			thinga[a] = thingb[a];
		}
	}
	return thinga;
}

function assert(t, msg) {
	if (!t) {
		alert(msg);
		return t;
	}
}

function sign(a){ if(a<0){ return -1;} if(a>0){ return 1} return 0; }
function randomElt(list) {
	var elt = Math.floor(Math.random() * list.length);
	return list[elt];
}

function shuffle(list) {
	var length = list.length;
	for (var i = 0; i < length; i++) {
		var j = randomInt(i, length - 1);
		var temp = list[i];
		list[i] = list[j];
		list[j] = temp;
	}
	return list;
}

function remove(list, elt) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] == elt) {
			list.splice(i, 1);
			i--;
		}
	}
	return list;
}

function addUnique(list, elt, eq){
//add item to list, or return the duplicate so that maybe you can combine them
	if(eq == undefined){
		eq = function(a,b){ return a === b; };
	}
	for(var i=0; i< list.length; i++){
		if( eq(list[i], elt)){
			return list[i];
		}
	}
	list.push(elt);
}

function find(list, elt){
	for(var i=0; i<list.length; i++){
		if(list[i] == elt){ return list[i]; }
	}
	return false;
}

var interned = []; //makes it so we compare indexes instead of strings
function intern(strng) {
	for (var i = 0; i < interned.length; i++) {
		if (strng == interned[i]) {
			return i;
		}
	}
	interned.push(strng);
	return interned.length - 1;
}

function onein(n) {
	return Math.random() < 1 / n;
}

function makenum(maybe,num){
	if(typeof maybe == 'number'){
		return maybe;
	}
	return num;
}

function randomInt(min, max) {
//	assert(min <= max, 'min ' + min + ' greater than max ' + max);
	var diff = max + 1 - min;
	return Math.floor(min + Math.random() * diff);
}

function makeVect(n,elt){ 
	var arry = []; 
	for(var i=0; i<n; i++){ 
		arry[i]=elt; 
	} 
	return arry; 
}
