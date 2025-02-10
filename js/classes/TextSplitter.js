'use strict';

class TextSplitter
{
	/**
	 *
	 * @type {string[]}
	 * @private
	 */
	_repeatable = ['※', '♡', '☆', '♪', '\n', '❤', '♥', ' ', '#', '◆', '◇', '■', ];

	/**
	 *
	 * @type {string[]}
	 * @private
	 */
	_end_symbols = ['.', '。', '!', '！', '?', '？', '…', '♡', '☆', '♪', '\n', '❤', '♥', ' ', '■', ];

	/**
	 *
	 * @type {string[]}
	 * @private
	 */
	_forced_end_symbols = ['、', ];

	/**
	 *
	 * @param {function(string): number} pos
	 * @param {string[]} symbols
	 * @returns {number}
	 * @private
	 */
	static _pos_of(pos, symbols)
	{
		/**
		 * @type {number[]}
		 */
		const positions = [];
		for (const symbol of symbols)
		{
			positions.push(pos(symbol));
		}

		return Math.max(...positions) + 1;
	}

	/**
	 *
	 * @param {function(string): number} pos
	 * @returns {number}
	 * @private
	 */
	_pos(pos)
	{
		return this.constructor._pos_of(pos, this._end_symbols);
	}

	/**
	 *
	 * @param {function(string): number} pos
	 * @returns {number}
	 * @private
	 */
	_forced_pos(pos)
	{
		return this.constructor._pos_of(pos, this._forced_end_symbols);
	}

	/**
	 *
	 * @param {string} line
	 * @param {number} length
	 * @returns {string[]}
	 */
	split(line, length = 350)
	{
		line = line.trim();
		if (line === '')
		{
			return [line, ];
		}

		for (const symbol of this._repeatable)
		{
			if (line.endsWith(symbol))
			{
				const result = this.split(line.slice(0, -symbol.length), length);
				result.push(symbol);
				return result;
			}

			if (line.startsWith(symbol))
			{
				const result = this.split(line.slice(symbol.length), length);
				result.unshift(symbol);
				return result;
			}
		}

		/**
		 *
		 * @type {string[]}
		 */
		const sentences = [];
		while (line.length > length)
		{
			const block = line.substring(0, length);
			const find = x => block.lastIndexOf(x);

			const end = this._pos(find)
			if (end === 0)
			{
				break;
			}

			sentences.push(line.substring(0, end));
			line = line.substring(end);
		}

		while (line.length > length)
		{
			const block = line.substring(0, length);
			const find = x => block.lastIndexOf(x);

			const end = this._forced_pos(find);
			if (end === 0)
			{
				break;
			}

			sentences.push(line.substring(0, end));
			line = line.substring(end);
		}

		if (line.length)
		{
			sentences.push(line);
		}

		return sentences;
	}
}