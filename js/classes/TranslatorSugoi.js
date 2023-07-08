'use strict';

class TranslatorSugoi extends Translator
{
	/**
	 *
	 * @type {string}
	 * @private
	 */
	_url = 'http://localhost';

	/**
	 *
	 * @type {string}
	 * @private
	 */
	_port = '14366';

	/**
	 *
	 * @type {number}
	 * @private
	 */
	_concurrentRequests = 10;

	/**
	 * @param {Config} config
	 */
	setConfig(config)
	{
		this._port = config.port;
		this._concurrentRequests = config.requests;
	}

	/**
	 *
	 * @type {string}
	 */
	get url()
	{
		return this._url + ':' + this._port;
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	async serverAvailable()
	{
		try
		{
			await this._request('test', 10000);
			return true;
		}
		catch (e)
		{
			console.error(e);
			console.error(e.message);
			return false;
		}
	}

	/**
	 *
	 * @param {TranslatorLine[]} lines
	 * @returns {Promise<void>}
	 */
	async run(lines)
	{
		const filtered = lines.filter(x => x.needTranslate);
		const total = filtered.length;

		this._triggerProgress(0, total);

		/**
		 *
		 * @type {Promise<void>[]}
		 */
		const requests = [];
		let translated = 0;

		const translate = async () => {
			while (filtered.length > 0)
			{
				const line = filtered.shift();
				line.translation = await this._request(line.original);
				translated += 1;
				this._triggerProgress(translated, total);
			}
		};

		for (let i = 0; i < this._concurrentRequests; i++)
		{
			requests.push(translate());
		}

		await Promise.all(requests);
	}

	/**
	 *
	 * @param {string} jpn
	 * @return {Promise<string>}
	 */
	async translate(jpn)
	{
		return await this._request(jpn)
	}

	/**
	 *
	 * @param {string} jpn
	 * @param {number} timeout milliseconds
	 * @returns {Promise<string>}
	 * @private
	 */
	async _request(jpn, timeout = 0)
	{
		const data = {
			message: 'translate sentences',
			content: jpn
		};

		const body = JSON.stringify(data);
		const options = {
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/json'
			}
		};

		let timeout_id = 0;
		if (timeout > 0)
		{
			const controller = new AbortController();
			timeout_id = setTimeout(() => controller.abort(), timeout)
			options.signal = controller.signal;
		}

		const response = await fetch(this.url, options);
		if (timeout_id)
		{
			clearTimeout(timeout_id);
		}

		if (!response.ok)
		{
			console.error(body, JSON.stringify(response), await response.text());
			return jpn;
		}

		return await response.json();
	}
}