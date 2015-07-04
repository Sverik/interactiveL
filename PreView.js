var PreView = function(canvas, vertices, lines) {
	this.canvas = canvas;
	this.vertices = vertices;
	this.lines = lines;
	this.ctx = this.canvas.getContext("2d");
}

PreView.prototype.drawLine = function(v1, v2) {
	this.ctx.beginPath();
	this.ctx.moveTo(v1.x, v1.y);
	this.ctx.lineTo(v2.x, v2.y);
	this.ctx.stroke();
}

PreView.prototype.frame = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for (var i = 0 ; i < this.lines.length ; i++) {
		this.drawLine(this.lines[i].v1, this.lines[i].v2);
	}
}
