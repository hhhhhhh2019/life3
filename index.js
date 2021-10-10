const cnv = document.getElementById("cnv");
cnv.width = 360;
cnv.height = 360;
const ctx = cnv.getContext("2d");
ctx.lineWidth = 0.5;

var cell_type = 0;

cnv.onmousedown = function(e) {
	cells.push(new_cell(e.offsetX, e.offsetY, cell_type));
}

const CELL_RADIUS = 5;

const colors = ["red", "green", "blue"];

const rand = function(min, max) {
	return Math.round(Math.random()*(max-min)) + min;
}

var rules = [
	[1,1,0, 0,1,1, 1],
	[1,1,1, 1,2,1, 3],
	[1,1,1, 1,1,2, 2]
];

const generate_rules = function() {
	rules = [
		[rand(0,1),rand(0,1),rand(0,1), rand(0,4),rand(0,4),rand(0,4), rand(0,7)], // 1
		[rand(0,1),rand(0,1),rand(0,1), rand(0,4),rand(0,4),rand(0,4), rand(0,7)], // 2
		[rand(0,1),rand(0,1),rand(0,1), rand(0,4),rand(0,4),rand(0,4), rand(0,7)], // 3
	];
}

//generate_rules();
 
var cells = [];

const new_cell = function(x, y, type) {
	return {x, y, type, dx: 0, dy: 0, connected: [0,0,0], connections: []};
}

const restart = function() {
	cells = [];
	
	for (let i = 0; i < 200; i++) {
		cells.push(new_cell(Math.random()*(cnv.width-CELL_RADIUS*2)+CELL_RADIUS, Math.random()*(cnv.height-CELL_RADIUS*2)+CELL_RADIUS, rand(0,2)));
	}
}

//restart();

const circle = function(x, y, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, CELL_RADIUS, 0, 6.28);
	ctx.fill();
}

const line = function(x1, y1, x2, y2) {
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const distance = function(x1, y1, x2, y2) {
	return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

const normalize = function(x, y) {
	let l = distance(0, 0, x, y);
	return [x / l, y / l];
}

const inArray = function(arr, val) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == val) return true;
	}
	return false;
}

const collision = function() {
	for (let i = 0; i < cells.length; i++) {
		let cell = cells[i];

		let can_move = true;

		if (cell.x < CELL_RADIUS) {
			cell.x = CELL_RADIUS;
		}

		if (cell.x > cnv.width - CELL_RADIUS) {
			cell.x = cnv.width - CELL_RADIUS;
		}

		if (cell.y < CELL_RADIUS) {
			cell.y = CELL_RADIUS;
		}

		if (cell.y > cnv.height - CELL_RADIUS) {
			cell.y = cnv.height - CELL_RADIUS;
		}
		
		for (let j = 0; j < cells.length; j++) {
			if (i == j) continue;
			let cell2 = cells[j];

			let dist = distance(cell.x + cell.dx, cell.y + cell.dy, cell2.x, cell2.y);

			if (dist <= CELL_RADIUS * 2) {
				can_move = false;
				cell.x += (cell.x - cell2.x) * 0.1;
				cell.y += (cell.y - cell2.y) * 0.1;
			}
		}

		if (can_move == true) {
			cell.x += cell.dx * 5;
			cell.y += cell.dy * 5;
		}
		cell.dx *= 0.95;
		cell.dy *= 0.95;
	}
}

const update = function() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	for (let i = 0; i < cells.length; i++) {
		let cell = cells[i];
		circle(cell.x, cell.y, colors[cell.type]);
	}

	for (let i = 0; i < cells.length; i++) {
		let cell = cells[i];
		cell.connected = [0,0,0, 0];
		cell.connections = [];
		cell.dx += (Math.random() - 0.5) * 0.01;
		cell.dy += (Math.random() - 0.5) * 0.01;
		for (let j = 0; j < cells.length; j++) {
			if (i == j) continue;
			let cell2 = cells[j];

			let dist = distance(cell.x, cell.y, cell2.x, cell2.y);
			let connect = false;
			let attract = false;
			let can_connect = (rules[cell.type][cell2.type+3] > cell.connected[cell2.type] && rules[cell2.type][cell.type+3] > cell2.connected[cell.type]
				&& rules[cell.type][6] > cell.connected[3] && rules[cell2.type][6] > cell2.connected[3])
				//|| inArray(cell2.connections, cell);

			if (dist < CELL_RADIUS * 3 && can_connect) {// && !inArray(cell.connections, cell2)) {
				connect = true;
				line(cell.x, cell.y, cell2.x, cell2.y);
				cell.connected[cell2.type]++;
				cell2.connected[cell.type]++;
				cell.connected[3]++;
				cell2.connected[3]++;
				cell.connections.push(cell2);
				cell2.connections.push(cell);
			}
			
			//console.log(cell.connected);
			attract = connect || (rules[cell.type][cell2.type] && can_connect) || inArray(cell2.connections, cell);
			
			let [dx, dy] = [(cell2.x - cell.x) * (attract ? 1 : -1), (cell2.y - cell.y) * (attract ? 1 : -1)];
			[dx, dy] = normalize(dx, dy);
			[dx, dy] = [dx / (dist ** 2) || 0, dy / (dist ** 2) || 0];

			cell.dx += dx;
			cell.dy += dy;
		}
	}

	collision();

	requestAnimationFrame(update);
}

update();