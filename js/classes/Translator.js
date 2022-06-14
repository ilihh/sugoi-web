'use strict';

class Translator
{
	_domains = {
		'.syosetu.com': () => new ProxySyosetu(),
	};

	/**
	 *
	 * @type {string}
	 * @private
	 */
	_url = 'http://127.0.0.1';

	/**
	 *
	 * @type {string}
	 */
	port = '14366';

	/**
	 *
	 * @type {number}
	 */
	requests = 10;

	/**
	 *
	 * @type {string}
	 */
	get url()
	{
		return this._url + ':' + this.port;
	}

	/**
	 *
	 * @param domain
	 * @returns {null|Proxy}
	 */
	getProxy(domain)
	{
		for (let d in this._domains)
		{
			if ((domain === d) || domain.endsWith(d))
			{
				return this._domains[d]();
			}
		}

		return null;
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
			return false;
		}
	}

	/**
	 *
	 * @param {[TranslatorLine]} lines
	 * @returns {Promise<void>}
	 */
	async run(lines)
	{
		/**
		 *
		 * @type {Promise<void>[]}
		 */
		const promises = [];
		let i = 0;
		for (i = 0; i < lines.length; i++)
		{
			if (i === this.requests)
			{
				break;
			}

			promises.push(this._translate(lines[i]));
		}

		const next = () => {
			const p = this._translate(lines[i]);
			i += 1;

			return i < lines.length ? p.then(next) : p;
		};

		return await Promise.race(promises).then(next);
	}

	/**
	 *
	 * @param {TranslatorLine} line
	 * @returns {Promise<void>}
	 * @private
	 */
	async _translate(line)
	{
		line.translation = line.needTranslate
			? await this._request(line.original)
			: line.original;
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