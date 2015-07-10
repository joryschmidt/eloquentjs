//Electronic Life

var plan = ["############################",
            "#      #    #      o      ##",
            "#                          #",
            "#          #####           #",
            "##         #   #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o             #",
            "# o  #         o       ### #",
            "#    #                     #",
            "############################"];

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

function Grid(width, height){
	this.space = new Array(width * height);
	this.width = width;
	this.height = height;
}

Grid.prototype.isInside = function(vector){
	return vector.x >= 0 && vector.x < this.width &&
		   vector.y >= 0 && vector.y < this.height;
}

Grid.prototype.get = function(vector){
	return this.space[vector.x + vector.y * this.width];
}
Grid.prototype.set = function(vector, value){
	this.space[vector.y * this.width + vector.x] = value;
}

var grid = new Grid(5,5);
console.log(grid.get(new Vector(1,1)));
grid.set(new Vector(1,1), "X");
console.log(grid.get(new Vector(1,1)));