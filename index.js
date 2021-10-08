const cnv = document.getElementById("cnv");
cnv.width = 500;
cnv.height = 500;
const ctx = cnv.getContext("2d");

const CELL_RADIUS = 5;

const colors = ["red", "green", "blue"];

const rules = [
//	 1,2,3
	[1,0,0, 0,0,0], // 1
	[0,0,0, 0,0,0], // 2
	[0,0,0, 0,0,0], // 3
]

const cells = [];

const new_cell = function(x, y, type) {
	return {x, y, type, dx: 0, dy: 0, connections: []};
}

for (let i = 0; i < 500; i++) {
	cells.push(new_cell(Math.random()*(cnv.width-CELL_RADIUS*2)+CELL_RADIUS, Math.random()*(cnv.height-CELL_RADIUS*2)+CELL_RADIUS, Math.floor(Math.random()*3)));
}

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
				cell.x += (cell.x - cell2.x) * 0.05;
				cell.y += (cell.y - cell2.y) * 0.05;
			}
		}

		if (can_move == true) {
			cell.x += cell.dx * 5;
			cell.y += cell.dy * 5;
		}
		cell.dx *= 0.9;
		cell.dy *= 0.9;
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
		let neighbors = [0,0,0];
		/*cell.dx += (Math.random() - 0.5) * 0.1;
		cell.dy += (Math.random() - 0.5) * 0.1;*/
		for (let j = 0; j < cells.length; j++) {
			if (i == j) continue;
			let cell2 = cells[j];

			let dist = distance(cell.x, cell.y, cell2.x, cell2.y);
			let connect = false;

			if (dist < CELL_RADIUS * 4 && rules[cell.type][cell2.type]) {
				neighbors[cell2.type]++;

				if (rules[cell.type][cell2.type+3] > neighbors[cell2.type]) {
					connect = true;
					line(cell.x, cell.y, cell2.x, cell2.y);
				}
			}

			let [dx, dy] = [(cell2.x - cell.x) * (connect ? 1 : -1), (cell2.y - cell.y) * (connect ? 1 : -1)];
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