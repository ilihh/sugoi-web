'use strict';

class TranslationInfo
{
	allowed = false;

	isMain = false;

	isChapter = false;

	googleTranslated = false;

	/**
	 *
	 * @param {boolean} allowed
	 * @param {boolean} isMain
	 * @param {boolean} isChapter
	 * @param {boolean} googleTranslated
	 */
	constructor(allowed, isMain = false, isChapter = false, googleTranslated = false)
	{
		this.allowed = allowed;
		this.isMain = isMain;
		this.isChapter = isChapter;
		this.googleTranslated = googleTranslated;
	}
}