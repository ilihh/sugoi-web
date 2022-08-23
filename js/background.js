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
 * Duplication because service worker supports only es6 import, but content scripts do not.
 * @param domain
 * @returns {boolean}
 */
function is_supported(domain)
{
	const domains = {
		'.syosetu.com': true,
		'kakuyomu.jp': true,
		'.kakuyomu.jp': true,
	};

	for (let d in domains)
	{
		if ((domain === d) || domain.endsWith(d))
		{
			return true;
		}
	}

	return false;
}

/**
 *
 * @param {any} request
 * @param {MessageSender} sender
 * @param {function} sendResponse
 */
function processMessage(request, sender, sendResponse)
{
	console.log('message:', request, sender);

	let response;
	switch (request.action)
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
			console.error('Unknown request:', request);
			response = {success: false};
			break;
	}

	sendResponse(response);
}

/**
 *
 * @param {any} request
 * @param {MessageSender} sender
 * @param {function} sendResponse
 */
async function processExternalMessage(request, sender, sendResponse)
{
	const domain = sender.url ? (new URL(sender.url)).host : '';
	const supported = is_supported(domain);

	let response;
	switch (request.action)
	{
		case 'translate':
			if (supported)
			{
				response = await chrome.tabs.sendMessage(sender.tab.id, {action: 'canTranslate'});
				if (response)
				{
					await chrome.tabs.sendMessage(sender.tab.id, {action: 'translate'});
				}
			}
			break;
		case 'canTranslate':
			response = supported && (await chrome.tabs.sendMessage(sender.tab.id, {action: 'canTranslate'}));
			break;
		default:
			response = null;
			break;
	}

	sendResponse(response);
}

chrome.runtime.onMessage.addListener(processMessage);
chrome.runtime.onMessageExternal.addListener(processExternalMessage);