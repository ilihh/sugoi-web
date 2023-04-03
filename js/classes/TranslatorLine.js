'use strict';

class TranslatorLine
{
	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} type
	 */
	constructor(element, type)
	{
		this.element = element;
		this.type = this.element.querySelector('img') ? LineTypes.image : type;

		this._raw = (element.innerHTML.trim() === '<br>')
			|| (this.type === LineTypes.image)
			|| ['.', '', '「', '」', '・'].includes(element.innerText.trim());

		this._translation = this._raw ? element.innerHTML : null;
		this.original = (this._raw || (this.type === LineTypes.introduction)) ? element.innerHTML : element.innerText.trim();
	}

	get html()
	{
		return (this._raw) || (this.type === LineTypes.introduction);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	get needTranslate()
	{
		return !this._raw;
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