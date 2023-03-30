'use strict';

class TranslationBlock
{
	/**
	 *
	 * @param {TranslatorLine} line
	 */
	constructor(line)
	{
		this.jpn = line.original;
		this.eng = line.translation;
		this.html = line.html;
	}
}