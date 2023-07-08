'use strict';

let page;
window.onload = () => {
	page = new PageOptions(viewRender);
	window.onload = null;
};