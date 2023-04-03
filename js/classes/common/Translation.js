'use strict';

class Translation
{
	chapter = 0;

	url = '';

	/**
	 *
	 * @type {TranslationBlock}
	 */
	title;

	/**
	 *
	 * @type {TranslationBlock[]}
	 */
	content = [];

	/**
	 *
	 * @type {TranslationBlock[]}
	 */
	author_before = [];

	/**
	 *
	 * @type {TranslationBlock[]}
	 */
	author_after = [];
}