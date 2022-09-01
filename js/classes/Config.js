'use strict';

class Config
{
	static MODE_SUGOI = 0;
	static MODE_DEEPL = 1;

	/**
	 *
	 * @type {boolean}
	 */
	enabled = true;

	/**
	 * @type {Number}
	 */
	mode = 0;

	/**
	 *
	 * @type {boolean}
	 */
	alwaysTranslate = false;

	/**
	 * Sugoi
	 * @type {string}
	 */
	port = '14366';

	/**
	 *
	 * @type {number}
	 */
	requests = 10;

	/**
	 * DeepL API key.
	 * @type {string}
	 */
	deepl_key = '';

	/**
	 * DeepL mode.
	 * @type {boolean}
	 */
	deepl_free = false;

	/**
	 * max: 50
	 * https://www.deepl.com/docs-api/translate-text/translate-text/
	 * @type {number}
	 */
	deepl_texts_per_request = 40;
}