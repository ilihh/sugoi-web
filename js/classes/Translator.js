'use strict';

class Translator
{
	/**
	 * @callback statusCallback
	 * @param {number} translated
	 * @param {number} total
	 * @return {void}
	 */

	/**
	 *
	 * @type {statusCallback[]}
	 * @private
	 */
	_statusListeners = [];

	/**
	 * @type {AbortController}
	 * @private
	 */
	_abort = null;

	get isCanceled()
	{
		return this._abort?.signal.aborted ?? true;
	}

	/**
	 *
	 * @param {statusCallback} callback
	 */
	onProgress(callback)
	{
		this._statusListeners.push(callback);
	}

	/**
	 *
	 * @param {statusCallback} callback
	 */
	offTranslate(callback)
	{
		const index = this._statusListeners.indexOf(callback);
		if (index > -1)
		{
			this._statusListeners.splice(index, 1);
		}
	}

	/**
	 *
	 * @param {Number} translated
	 * @param {Number} total
	 * @protected
	 */
	_triggerProgress(translated, total)
	{
		this._statusListeners.forEach(listener => listener(translated, total));
	}

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

	/**
	 *
	 * @abstract
	 * @param {string} jpn
	 * @return {Promise<string>}
	 */
	async translate(jpn)
	{
	}

	cancel()
	{
		this._abort?.abort();
		this._statusListeners.length = 0;
	}
}