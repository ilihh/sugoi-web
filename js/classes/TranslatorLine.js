'use strict';

class TranslatorLine
{
	/**
	 *
	 * @param {HTMLElement} element
	 */
	constructor(element)
	{
		this.element = element;
		this.original = element.innerHTML.trim() === '<br>' ? '.' : element.innerText.trim();
		this._translation = '';
	}

	/**
	 *
	 * @returns {boolean}
	 */
	get needTranslate()
	{
		return !['.', '', '「', '」'].includes(this.original);
	}

	/**
	 *
	 * @returns {string}
	 */
	get translation()
	{
		return this._translation;
	}

	/**
	 *
	 * @param {string} value
	 */
	set translation(value)
	{
		this._translation = value;
		this.element.innerHTML = this.translation;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	get valid()
	{
		const max_length = 10;

		if (this.translation.length < max_length)
		{
			return true;
		}

		let letter = this.translation[0];
		let length = 0;

		for (let i = 1; i < this.translation.length; i++)
		{
			const checked = this.translation[i];
			if (checked === letter)
			{
				length += 1;
				if (length === max_length)
				{
					return false;
				}
			}
			else
			{
				letter = checked;
				length = 0;
			}
		}

		return true;
	}
}