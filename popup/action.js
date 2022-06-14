'use strict';

let page;
window.onload = () => {
	page = new ActionPopup(viewRender);
	window.onload = null;
};