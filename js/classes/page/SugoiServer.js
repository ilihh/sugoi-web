'use strict';

class SugoiServer
{
	/**
	 *
	 * @type {string[]}
	 */
	keys = ['', ];

	/**
	 *
	 * @type {string}
	 */
	key = '';

	/**
	 *
	 * @type {string}
	 * @private
	 */
	_url = '';

	/**
	 *
	 * @param {string} url
	 */
	constructor(url = 'http://127.0.0.1:34366')
	{
		this._url = url;
	}

	/**
	 *
	 * @return {string}
	 */
	get url()
	{
		return this._url;
	}

	/**
	 *
	 * @param {string} value
	 */
	set url(value)
	{
		this._url = value;
		const _ = this.refresh();
	}

	async refresh()
	{
		await this.reloadKeys();
		await this._getKey();
	}

	/***
	 *
	 * @return {Promise<string[]>}
	 */
	async reloadKeys()
	{
		this.keys = await this._get('/api/keys/');
		return this.keys;
	}

	/**
	 *
	 * @return {Promise<string>}
	 */
	async _getKey()
	{
		this.key = await this._get('/api/key/');
		return this.key;
	}

	/**
	 *
	 * @param {string} value
	 * @return {Promise<string>}
	 */
	async setKey(value)
	{
		this.key = value;
		await this._post('/api/key/', {key: value});
		const _ = this.reloadKeys();

		return this.key;
	}

	async save()
	{
		return this._post('/api/save/', {});
	}

	async reload()
	{
		return this._post('/api/reload/', {});
	}

	async shutdown()
	{
		return this._post('/', {message: 'close server'});
	}

	async _get(method)
	{
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		const response = await fetch(this.url + method, options);
		return await response.json();
	}

	async _post(method, data = null)
	{
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		};
		const response = await fetch(this.url + method, options);
		return await response.json();
	}
}
