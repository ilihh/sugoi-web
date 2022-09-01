'use strict';

class Translator
{
	/**
	 * @abstract
	 * @param {Config} config
	 */
	setConfig(config)
	{

	}

	/**
	 * @abstract
	 * @returns {Promise<boolean>}
	 */
	async serverAvailable()
	{
		return false;
	}

	/**
	 * @abstract
	 * @param {TranslatorLine[]} lines
	 * @returns {Promise<void>}
	 */
	async run(lines)
	{
	}
}