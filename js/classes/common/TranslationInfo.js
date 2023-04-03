'use strict';

class TranslationInfo
{
	allowed = false;

	isMain = false;

	isChapter = false;

	/**
	 *
	 * @param {boolean} allowed
	 * @param {boolean} isMain
	 * @param {boolean} isChapter
	 */
	constructor(allowed, isMain = false, isChapter = false)
	{
		this.allowed = allowed;
		this.isMain = isMain;
		this.isChapter = isChapter;
	}
}