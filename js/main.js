'use strict';

const domain = document.location.host;
const ui = new UI(domain);
ui.createButtons();
ui.updateView();