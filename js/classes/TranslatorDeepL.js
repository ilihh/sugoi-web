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
		const request = [];

		for (let i = 0; i < lines.length; i++)
		{
			const line = lines[i];
			if (!line.needTranslate)
			{
				continue;
			}

			request.push(line);

			if (request.length === this._texts_per_request)
			{
				await this._batchTranslate(request);
				request.length = 0;
			}
		}

		if (request.length > 0)
		{
			await this._batchTranslate(request);
			request.length = 0;
		}
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

		/**
		 *
		 * @type {string[]}
		 */
		const r = this._chromeApi.send(request);
		console.log('r: ', r);
		const response = await r;
		console.log('response: ', response);

		for (let i = 0; i < response.length; i++)
		{
			lines[i].translation = response[i];
		}
	}
}