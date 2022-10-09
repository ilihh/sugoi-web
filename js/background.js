'use strict';

class DeepL
{
	/**
	 *
	 * @type {string}
	 * @private
	 */
	_api_key = '';

	/**
	 *
	 * @type {boolean}
	 * @private
	 */
	_api_free = true;

	/***
	 * limit: 500 000 symbols per month
	 * @type {string}
	 * @private
	 */
	_url_free = 'https://api-free.deepl.com/v2/translate';

	/**
	 *
	 * @type {string}
	 * @private
	 */
	_url_pro = 'https://api.deepl.com/v2/translate';

	/**
	 * @param {Config} config
	 */
	constructor(config)
	{
		this._api_key = config.deepl_key;
		this._api_free = config.deepl_free;
	}

	/**
	 *
	 * @type {string}
	 */
	get url()
	{
		return this._api_free ? this._url_free : this._url_pro;
	}

	/**
	 *
	 * @param {string[]} lines
	 * @returns {Promise<string[]>}
	 */
	async translate(lines)
	{
		let data = 'source_lang=JA&target_lang=EN';
		for (let i = 0; i < lines.length; i++)
		{
			data += '&text=' + encodeURIComponent(lines[i]);
		}

		const response = await fetch(this.url, {
			method: 'POST',
			body: data,
			headers: {
				'Authorization': 'DeepL-Auth-Key ' + this._api_key,
				'Content-Type': 'application/x-www-form-urlencoded',
			}
		});

		const result = [];

		if (!response.ok)
		{
			console.error('Status: ' + response.status + ' // ' + response.statusText);
			return result;
		}

		const json = await response.json();

		for (let i = 0; i < lines.length; i++)
		{
			result.push(json.translations[i].text);
		}

		return result;
	}
}

function button_toggle(tab_id, enable)
{
	if (chrome.action)
	{
		chrome.action.enable(tab_id);
	}
	else
	{
		chrome.browserAction.enable(tab_id);
	}
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
 * @param {string} key
 * @returns {Promise<Config>}
 */
async function storage_get(key)
{
	return new Promise(resolve => {
		chrome.storage.local.get([key], response => {
			resolve(response[key] ?? null);
		});
	});
}

/**
 *
 * @param {string[]} lines
 */
async function deepl_translate(lines)
{
	const config = await storage_get('config');
	const t = new DeepL(config);
	return await t.translate(lines);
}

/**
 *
 * @param {any} request
 * @param {MessageSender} sender
 * @param {function} sendResponse
 */
async function processMessage(request, sender)
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
		case 'deepl':
			response = await deepl_translate(request.data);
			break;
		default:
			console.error('Unknown request:', request);
			response = {success: false};
			break;
	}

	return response;
}

/**
 *
 * @param {any} request
 * @param {MessageSender} sender
 * @param {function} sendResponse
 */
async function processExternalMessage(request, sender)
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

	return response;
}

function is_firefox()
{
	return typeof browser !== 'undefined';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const promise = processMessage(request, sender).then(sendResponse);
	return is_firefox ? promise : true;
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
	const promise = processExternalMessage(request, sender).then(sendResponse);
	return is_firefox ? promise : true;
});