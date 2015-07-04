var MOUSE_CLOSE_THRESHOLD_2 = 20*20;

function dst2(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	return dx*dx + dy*dy;
}



var DesignView = function (canvas, vertices, lines) {
	this.canvas = canvas;
	this.vertices = vertices;
	this.lines = lines;
	this.ctx = this.canvas.getContext("2d");
	this.mX = 0;
	this.mY = 0;
	this.mD = false;
	var self = this;
	canvas.addEventListener('mousemove', function(evt){self.mouseMove(evt);});
	canvas.addEventListener('mousedown', function(evt){self.mD = true;});
	canvas.addEventListener('mouseup', function(evt){self.mD = false;});
};

DesignView.prototype.mouseMove = function(evt) {
	var rect = this.canvas.getBoundingClientRect();
	this.mX = evt.clientX - rect.left;
	this.mY = evt.clientY - rect.top;
}

DesignView.prototype.drawLine = function(v1, v2) {
	this.ctx.beginPath();
	this.ctx.moveTo(v1.x, v1.y);
	this.ctx.lineTo(v2.x, v2.y);
	this.ctx.stroke();
}

DesignView.prototype.frame = function() {
	if (this.mD) {
		var closestV = this.vertices[0];
		var closestD2 = 1000000000;
		for (var i = 0 ; i < this.vertices.length ; i++) {
			var v = this.vertices[i];
			var d2 = dst2(v.x, v.y, this.mX, this.mY);
			if (d2 < closestD2) {
				closestD2 = d2;
				closestV = v;
			}
		}
		closestV.x = this.mX;
		closestV.y = this.mY;
	}
	
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for (var i = 0 ; i < this.lines.length ; i++) {
		this.drawLine(this.lines[i].v1, this.lines[i].v2);
	}
}
