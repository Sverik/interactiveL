var PreView = function(canvas, system, iter) {
	this.system = system;
	this.iter = iter;
	this.canvas = canvas;
	this.lines = new Array();
	this.ctx = this.canvas.getContext("2d");
}

PreView.prototype.drawLine = function(v1, v2) {
	this.ctx.moveTo(v1.x, v1.y);
	this.ctx.lineTo(v2.x, v2.y);
}

PreView.prototype.frame = function() {
	var bounds = this.system.getIterationLines(this.iter, new Array(), this.lines);
	console.log(bounds);
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.beginPath();
	for (var i = 0 ; i < this.lines.length ; i++) {
		this.drawLine(this.lines[i].v1, this.lines[i].v2);
	}
	this.ctx.stroke();
}
