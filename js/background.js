'use strict';

function button_toggle(tab_id, enable)
{
	chrome.action.enable(tab_id);
	/*
	chrome.action.setIcon({
		path: enable ? 'images/icon32.png' : 'images/icon32_off.png'
	});
	*/
}

/**
 *
 * @param {any} data
 * @param {MessageSender} sender
 * @param {function} sendResponse
 */
function processMessage(data, sender, sendResponse)
{
	console.log('message:', data, sender);

	let response;
	switch (data.action)
	{
		case 'show':
			button_toggle(sender.tab.id, true);
			response = {success: true};
			break;
		case 'hide':
			button_toggle(sender.tab.id, false);
			response = {success: true};
			break;
		default:
			console.error('Unknown request:', data);
			response = {success: false};
			break;
	}

	sendResponse(response);
}

chrome.runtime.onMessage.addListener(processMessage);