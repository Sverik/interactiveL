var MAX_LINES_PER_FRAME = 200;

var PreView = function(canvas, info, system, iter) {
	this.system = system;
	this.info = info;
	this.lastVersion = 0;
	this.iter = iter;
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	this.nextDrawIdx = 0;
	this.lines = new Array();
	
	info.innerHTML = "iter. " + iter;
}

PreView.prototype.drawLine = function(v1, v2) {
	this.ctx.moveTo(v1.x, v1.y);
	this.ctx.lineTo(v2.x, v2.y);
}

PreView.prototype.frame = function() {
	if (this.lastVersion != this.system.version) {

		this.nextDrawIdx = 0;
		this.lines = new Array();
		var iterLines = this.system.getIterationLines(this.iter);
		var bounds = iterLines.bounds;
		this.lines = iterLines.lines;
		if (this.system.version != this.system.getIterVersion(this.iter)) {
			return;
		}
		this.lastVersion = this.system.version;

		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// TODO do not assume rectangular canvas
		var w = this.ctx.canvas.clientWidth;
		var biggerSize = bounds.maxX - bounds.minX;
		if (bounds.maxY - bounds.minY > biggerSize) {
			biggerSize = bounds.maxY - bounds.minY;
		}
		// add 3% of padding to each side
		var padding = biggerSize * 0.03;
		biggerSize += padding * 2;
		this.ctx.scale(w / biggerSize, w / biggerSize);
		this.ctx.translate(-bounds.minX + padding, -bounds.minY + padding);
	}

	// console.log(this.iter + " -> " + this.lines.length + ", " + this.canvas.id);
	this.ctx.beginPath();
	for (var i = 0 ; i < MAX_LINES_PER_FRAME && this.nextDrawIdx < this.lines.length ; i++) {
		this.drawLine(this.lines[this.nextDrawIdx].v1, this.lines[this.nextDrawIdx].v2);
		this.nextDrawIdx ++;
	}
	this.ctx.stroke();

}
