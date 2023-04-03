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
			await this._request('test');
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
	 * @returns {Promise<string>}
	 * @private
	 */
	async _request(jpn)
	{
		const data = {
			message: 'translate sentences',
			content: jpn
		};

		const response = await fetch(this.url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok)
		{
			console.error(data, response);
		}

		return await response.json();
	}
}