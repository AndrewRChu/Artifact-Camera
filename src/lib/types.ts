export interface Rectangle {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Resolution {
	full: Rectangle;
	preview: Rectangle;
	piece: Rectangle;
	stats: Rectangle;
	set: Rectangle;
}
