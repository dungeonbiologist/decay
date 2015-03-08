function initObject(point){
	var t = Object.create(this);
	t.place = point;
	t.at = function(point){
		return this.place.same(point);
	};
	t.recordLocation = function(array){
		array[this.place.x][this.place.y].push(this);
	};
	t.carried = false;
	t.item = true;
	t.size = 0;
	return t;
}

var items;
function initItems(){
	at:
	item = {
		unicornHorn:{
			name: intern('Alicorn'),
			draw: drawCritter(tile(white,black,92),4),
			explain: 'This unicorn horn gives proof of your success',
			init: initObject
		}
	};
}