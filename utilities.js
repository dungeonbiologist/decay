var achieve;
function dither(num){ //probabilistic rounding, so the average remains the same
	var a = Math.floor(num);
	var p = Math.random();
	return a + ((p < (num-a))? 1: 0);
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

function randomInt(min, max) {//inclusive
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

function mapcar(vect,fn){
	var result = [];
	for(var i=0; i<vect.length; i++){
		result[i] = fn(vect[i]);
	}
	return result;
} 

function rotate(angle,array){
	var sink = [[],[],[],[]];
	for(var i=0; i<4; i++){
		for(var j=0; j<array.length; j++){
			sink[i][j]  = [];
		}
	}
	for(var i=0; i<array.length; i++){
		for(var j=0; j<array[i].length; j++){
			sink[0][i][i] = array[i][j];
			sink[1][array[i].length-1-j][i] = array[i][j];
			sink[2][array.length-1-i][array[i].length-1-j] = array[i][j];
			sink[3][j][array.length-1-i] = array[i][j];
		}
	}
	return sink[angle%4];
}