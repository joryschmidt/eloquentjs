//Electronic Life Project from Eloquent Javascript

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

//Grid and vector definitions
function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.plus = function(vec){
      return new Vector(this.x + vec.x, this.y + vec.y);
};

function Grid(width, height){
	this.space = new Array(width * height);
	this.width = width;
	this.height = height;
}

Grid.prototype.isInside = function(vector){
	return vector.x >= 0 && vector.x < this.width &&
		   vector.y >= 0 && vector.y < this.height;
};

Grid.prototype.get = function(vector){
	return this.space[vector.x + vector.y * this.width];
};

Grid.prototype.set = function(vector, value){
	this.space[vector.y * this.width + vector.x] = value;
};

//directions defintions and functions
var directions = {
	"n": new Vector(0, -1),
	"ne": new Vector(1, -1),
	"e": new Vector(1, 0),
	"se": new Vector(1, 1),
	"s": new Vector(0, 1),
	"sw": new Vector(-1, 1),
	"w": new Vector(-1, 0),
	"nw": new Vector(-1, -1)
};

var direction_names = "n ne e se s sw w nw".split(" ");

function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

//critter definition
function AimlessCritter(){
	this.direction = randomElement(direction_names);
}

AimlessCritter.prototype.act = function(view){
	if(view.look(this.direction) != " ")
		this.direction = view.find(" ") || "s";
	return {type: "move", direction: this.direction};
}

//definitions of the world space and legend
function elementFromChar(legend, ch) {
      if (ch == " ")
            return null;
      var element = new legend[ch]();
      element.originChar = ch;
      return element;
}

function World(map, legend){
      var grid = new Grid(map[0].length, map.length);
      this.grid = grid;
      this.legend = legend;

      map.forEach(function(line, y){
            for(var x=0; x<line.length; x++){
                  grid.set(new Vector(x, y), elementFromChar(legend, line[x]));
            }
      });
}

function charFromElement(element){
      if (element == null)
            return " ";
      else
            return element.originChar;
}

World.prototype.toString = function(){
      var output = "";
      for (var y=0; y<this.grid.height; y++){
            for (var x=0; x<this.grid.width; x++){
                  var element = this.grid.get(new Vector(x, y));
                  output += charFromElement(element);
            }
            output += "\n";
      }
      return output;
}

function Wall() {}

var world = new World(plan, {"#": Wall, "o": AimlessCritter});

//Animating the critters

Grid.prototype.forEach = function(f, context) {
      for (var y=0; y< this.height; y++){
            for (var x=0; x<this.width; x++){
                  var value = this.space[x + y * this.width];
                  if (value != null)
                        f.call(context, value, new Vector(x, y));
            }
      }
};

World.prototype.turn = function() {
      var acted = [];
      this.grid.forEach(function(critter, vector){
            if (critter.act && acted.indexOf(critter) == -1){
                  acted.push(critter);
                  this.letAct(critter, vector);
            }
      }, this);
};

World.prototype.letAct = function(critter, vector){
      var action = critter.act(new View(this, vector));
      if (action && action.type == 'move') {
            var dest = this.checkDestination(action, vector);
            if (dest && this.grid.get(dest) == null){
                  this.grid.set(vector, null);
                  this.grid.set(dest, critter);
            }
      }
};

World.prototype.checkDestination = function(action, vector){
      if (directions.hasOwnProperty(action.direction)) {
            var dest = vector.plus(directions[action.direction]);
            if(this.grid.isInside(dest))
                  return dest;
      }
};

//View object and methods
function View(world, vector) {
      this.world = world;
      this.vector = vector;
}

View.prototype.look = function(dir) {
      var target = this.vector.plus(directions[dir]);
      if(this.world.grid.isInside(target))
            return charFromElement(this.world.grid.get(target));
      else
            return '#';
};

View.prototype.findAll = function(ch) {
      var found = [];
      for (var dir in directions){
            if (this.look(dir) == ch)
                  found.push(dir);
      }
      return found;
};

View.prototype.find = function(ch){
      var found = this.findAll(ch);
      if (found.length == 0)
            return null;
      return randomElement(found);
};

var far_places = {
      "n": new Vector(0, -2),
      "ne": new Vector(2, -2),
      "e": new Vector(2, 0),
      "se": new Vector(2, 2),
      "s": new Vector(0, 2),
      "sw": new Vector(-2, 2),
      "w": new Vector(-2, 0),
      "nw": new Vector(-2, -2)
};

View.prototype.lookFar = function(){
      var target = this.vector.plus(far_places[dir]);
      if(this.world.grid.isInside(target))
            return charFromElement(this.world.grid.get(target));
      else
            return '#';
}

View.prototype.findAllFar = function(ch) {
      var found = [];
      for (var dir in far_places){
            if (this.look(dir) == ch)
                  found.push(dir);
      }
      return found;
};

View.prototype.findFar = function(ch){
      var found = this.findAllFar(ch);
      if (found.length == 0)
            return null;
      return randomElement(found);
};

View.prototype.moveable = function(dir){
      if (view.look(dir) == " ")
            return true;
};

function dirPlus(dir, n){
      var index = direction_names.indexOf(dir);
      return direction_names[(index + n + 8) % 8];
}

function WallFlower(){
      this.dir = 'n';
}

// WallFlower checks back left corner of direction, and if that space
// is a wall or other creature, WF swings clockwise from there until it finds an empty space to move into.
WallFlower.prototype.act = function(view){
      var start = this.dir;
      if(view.look(dirPlus(this.dir, -3)) != " ")
            start = this.dir = dirPlus(this.dir, -2);
      while(view.look(this.dir) != " "){
            this.dir = dirPlus(this.dir, 1);
            if(this.dir == start) break;
      }
      return {type: "move", direction: this.dir};
};

//Let's make a more interesting World using inheritence

function LifelikeWorld(map, legend){
      World.call(this, map, legend);
}

LifelikeWorld.prototype = Object.create(World.prototype);

var actionTypes = Object.create(null);

LifelikeWorld.prototype.letAct = function(critter, vector){
      var action = critter.act(new View(this, vector));
      var handled = action && action.type in actionTypes
            && actionTypes[action.type].call(this, critter, vector, action);
      if(!handled){
            critter.energy -= 0.2;
            if(critter.energy <= 0)
                  this.grid.set(vector, null);
      }
};

actionTypes.grow = function(critter){
      critter.energy += 0.5;
      return true;
};

actionTypes.move = function(critter, vector, action){
      var dest = this.checkDestination(action, vector);
      if (dest == null || critter.energy <= 1 || this.grid.get(dest) != null)
            return false;
      critter.energy -= 1;
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
      return true;
};

actionTypes.eat = function(critter, vector, action){
      var dest = this.checkDestination(action, vector);
      var atDest = dest != null && this.grid.get(dest);
      if (!atDest || atDest.energy == null)
            return false;
      critter.energy += atDest.energy;
      this.grid.set(dest, null);
      return true;
};

actionTypes.reproduce = function(critter, vector, action){
      var baby = elementFromChar(this.legend, critter.originChar);
      var dest = this.checkDestination(action, vector);
      if (dest == null || critter.energy <= 2 * baby.energy ||
            this.grid.get(dest) != null)
            return false;
      critter.energy -= 2 * baby.energy;
      this.grid.set(dest, baby);
      return true;
};

function Plant(){
      this.energy = 3 + Math.random() * 4;
}

Plant.prototype.act = function(context){
      if(this.energy > 15){
            var space = context.find(" ");
            if(space)
                  return {type: "reproduce", direction: space};
      }
      if(this.energy < 20)
            return {type: 'grow'};
}

function PlantEater(){
      this.energy = 20;
}

PlantEater.prototype.act = function(context){
      var space = context.find(" ");
      if (this.energy > 60 && space)
            return {type: "reproduce", direction: space};
      var plant = context.find("*");
      if (plant)
            return {type: "eat", direction: plant};
      if (space)
            return {type: "move", direction: space};
};

//Let's make a smarter, non-asexual plant eater

function SmartPlantEater(){
      this.energy = 25;
      this.direction = randomElement(direction_names);
}

SmartPlantEater.prototype.act = function(view){
      var space = view.find(" ");
      if (view.look(this.direction) != " ")
            this.direction = space || "n";
      var met_someone = view.find("O");
      var plant = view.find("*");
      var go = randomElement([true, false]);
      if (this.energy >= 60 && space && met_someone)
            return {type: "reproduce", direction: space};
      if(plant && this.energy < 80)
            return {type: "eat", direction: plant}
      if(this.energy < 30)
            return {type: "move", direction: this.direction}
      if(space && go)
            return {type: "move", direction: space}
};

//Let's add a predator. He can see farther than the herbivores

function Predator(){
      this.energy = 50;
      this.direction = randomElement(direction_names);
}

Predator.prototype.act = function(view){
      var space = view.find(" ");
      if (view.look(this.direction) != " ")
            this.direction = space || "n";
      var met_someone = view.find("@");
      var see_partner = view.findFar("@");
      var food = view.find("O");
      var see_food = view.findFar("O");
      var go = randomElement([true, false]);
      if (this.energy >= 150 && space && met_someone)
            return {type: "reproduce", direction: space}
      if (this.energy >= 151 && see_partner && view.moveable(see_partner))
            return {type: "move", direction: see_partner};
      if (this.energy < 350 && food)
            return {type: "eat", direction: food};
      if (this.energy < 250 && see_food && view.moveable(see_food))
            return {type: "move", direction: see_food}
      if (this.energy < 150)
            return {type: "move", direction: this.direction}
      if(space && go)
            return {type: "move", direction: space}
};

var plan2 =
  ["####################################################",
   "#                 ####         ****              ###",
   "#   *  @  ##                 ########       OO    ##",
   "#   *    ##        O O                 ****       *#",
   "#       ##*                        ##########     *#",
   "#      ##***  *         ****                     **#",
   "#* **  #  *  ***      #########                  **#",
   "#* **  #      *               #   *              **#",
   "#     ##              #   O   #  ***          ######",
   "#*            @       #       #   *        O  #    #",
   "#*                    #  ######                 ** #",
   "###          ****          ***                  ** #",
   "#       O                        @         O       #",
   "#   *     ##  ##  ##  ##               ###      *  #",
   "#   **         #              *       #####  O     #",
   "##  **  O   O  #  #    ***  ***        ###      ** #",
   "###               #   *****                    ****#",
   "####################################################"];

var key =
     {"#": Wall,
      "@": Predator,
      "O": SmartPlantEater, 
      "*": Plant};
