'use strict';

class TranslatorSugoi extends Translator
{
	/**
	 *
	 * @type {string}
	 * @private
	 */
	_url = 'http://127.0.0.1';

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
	 *
	 * @type {number}
	 * @private
	 */
	_currentRequests = 0;

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
			const response = await this._request('test');
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
		let i = 0;
		let promises;

		[i, promises] = this._batchTranslate(i, lines);

		const next = () => {
			let next_promises;
			[i, next_promises] = this._batchTranslate(i, lines);
			const p = Promise.race(next_promises);

			return i < lines.length ? p.then(next) : p;
		};

		return await Promise.race(promises).then(next);
	}

	/**
	 *
	 * @param {number} i
	 * @param {TranslatorLine[]} lines
	 * @returns [{number}, {Promise<void>[]]
	 * @private
	 */
	_batchTranslate(i, lines)
	{
		/**
		 *
		 * @type {Promise<void>[]}
		 */
		const promises = [];
		for (; i < lines.length; i++)
		{
			if (this._currentRequests === this._concurrentRequests)
			{
				break;
			}

			if (lines[i].needTranslate)
			{
				promises.push(this._translate(lines[i]));
			}
		}

		return [i, promises];
	}

	/**
	 *
	 * @param {TranslatorLine} line
	 * @returns {Promise<void>}
	 * @private
	 */
	async _translate(line)
	{
		this._currentRequests += 1;

		line.translation = await this._request(line.original);

		this._currentRequests -= 1;
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

		return await response.json();
	}
}