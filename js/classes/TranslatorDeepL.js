'use strict';

class TranslatorDeepL extends Translator
{
	/**
	 *
	 * max: 50
	 * https://www.deepl.com/docs-api/translate-text/translate-text/
	 * @type {number}
	 * @private
	 */
	_texts_per_request = 40;

	/**
	 *
	 * @param {ChromeApi} chromeApi
	 */
	constructor(chromeApi)
	{
		super();
		this._chromeApi = chromeApi;
	}

	/**
	 * @param {Config} config
	 */
	setConfig(config)
	{
		this._texts_per_request = config.deepl_texts_per_request;
	}

	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	async serverAvailable()
	{
		return true;
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

		for (let i = 0; i < total; i += this._texts_per_request)
		{
			const end = Math.min(total, i + this._texts_per_request);
			const request = filtered.slice(i, end);
			await this._batchTranslate(request);

			this._triggerProgress(end, total);
		}
	}

	/**
	 *
	 * @param {string} jpn
	 * @return {Promise<string>}
	 */
	async translate(jpn)
	{
		const request = {
			'action': 'deepl',
			'data': [jpn, ],
		};

		/**
		 *
		 * @type {string[]}
		 */
		const response = await this._chromeApi.send(request);
		return response[0];
	}

	/**
	 *
	 * @param {TranslatorLine[]} lines
	 * @returns {Promise<void>}
	 * @private
	 */
	async _batchTranslate(lines)
	{
		const request = {
			'action': 'deepl',
			'data': [],
		};

		for (let i = 0; i < lines.length; i++)
		{
			request.data.push(lines[i].original);
		}

		const r = this._chromeApi.send(request);

		/**
		 *
		 * @type {string[]}
		 */
		const response = await r;

		for (let i = 0; i < response.length; i++)
		{
			lines[i].translation = response[i];
		}
	}
}