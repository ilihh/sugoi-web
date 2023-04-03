'use strict';

class Proxy
{
	static derived = new Set();

	/**
	 *
	 * @type {TranslatorLine[]}
	 * @private
	 */
	_lines = [];

	/**
	 *
	 * @type {string[]}
	 */
	content_selectors = [];

	/**
	 *
	 * @returns {boolean}
	 */
	get allowed()
	{
		return this.isMain || this.isChapter;
	}

	/**
	 * @abstract
	 * @returns {boolean}
	 */
	get isMain()
	{
		return false;
	}

	/**
	 * @abstract
	 * @returns {boolean}
	 */
	get isChapter()
	{
		return false;
	}

	/**
	 *
	 * @type {number}
	 */
	get chapter()
	{
		return 0;
	}

	/**
	 *
	 * @type {number}
	 */
	get chapters()
	{
		return 0;
	}

	/**
	 *
	 * @returns {TranslatorLine[]}
	 */
	get lines()
	{
		return this._lines;
	}

	/**
	 *
	 * @param {string} domain
	 * @abstract
	 * @returns {boolean}
	 */
	supported(domain)
	{
		return false;
	}

	/**
	 *
	 * @param domain
	 * @returns {Proxy}
	 */
	static get(domain)
	{
		for (let cls of this.derived)
		{
			const proxy = new cls();
			if (proxy.supported(domain))
			{
				return proxy;
			}
		}

		return new ProxyUnavailable();
	}

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} type
	 */
	addLine(element, type)
	{
		if (element)
		{
			this._lines.push(new TranslatorLine(element, type));
		}
	}

	/**
	 *
	 * @abstract
	 */
	loadLines()
	{
	}

	/**
	 *
	 * @returns {boolean}
	 */
	validate()
	{
		const invalid = this._lines.filter(x => !x.valid);
		invalid.forEach(line => {
			console.log(line.original, ' => ', line.translation);
		});

		return invalid.length === 0;
	}

	fixContent()
	{
		for (let i = 0; i < this.content_selectors.length; i++)
		{
			const $content = $(this.content_selectors[i]);
			if ($content.length > 0)
			{
				this.replaceEmoji($content);
				this.replaceRuby($content);
			}
		}
	}

	/**
	 *
	 * @param {string} str
	 * @param {string} chars
	 * @returns {string}
	 */
	trim(str, chars)
	{
		let start = 0,
			end = str.length;

		while(start < end && chars.indexOf(str[start]) >= 0)
		{
			++start;
		}

		while(end > start && chars.indexOf(str[end - 1]) >= 0)
		{
			--end;
		}

		return (start > 0 || end < str.length) ? str.substring(start, end) : str;
	}

	/**
	 *
	 * @param {jQuery} $content
	 */
	replaceEmoji($content)
	{
		const $images = $content.find('img.emoji');
		$images.each(function(index, elem){
			const $e = $(elem);
			const span = '<span>' + $e.attr('alt') + '</span>';
			$e.after(span);
			$e.remove();
		});
	}

	/**
	 *
	 * @param {jQuery} $content
	 */
	replaceRuby($content)
	{
		const $ruby = $content.find('ruby');
		const self = this;
		$ruby.each(function(index, elem){
			const $e = $(elem);
			if ($e.html() === '')
			{
				$e.remove();
				return;
			}

			const $rb = $e.find('rb');
			const $rt = $e.find('rt');
			if (($rb.length === 0) && ($rt.length === 0))
			{
				$e.replaceWith($e.html());
				return;
			}

			if ($rb.length > 0)
			{
				const rb = $rb.html()
				let rt = self.trim($rt.html(), '・');
				if (rt)
				{
					rt = ' (' + rt + ') ';
				}

				$e.replaceWith(rb + rt);
			}
			else
			{
				const rt = $rt.html();
				$rt.remove();

				const rb = $e.html();

				$e.replaceWith(rb + ' (' + rt + ')');
			}
		});
	}

	/**
	 *
	 * @param {function(TranslatorLine): boolean} predicate
	 * @returns {TranslationBlock[]}
	 * @private
	 */
	_filterLines(predicate)
	{
		return this.lines.filter(predicate).map(line => new TranslationBlock(line));
	}

	/**
	 *
	 * @param {string} type
	 * @return {TranslationBlock|null}
	 * @private
	 */
	_findLine(type)
	{
		const line = this.lines.find(line => line.type === type);
		if (typeof line === 'undefined')
		{
			return null;
		}

		return new TranslationBlock(line);
	}

	/**
	 *
	 * @returns {Translation}
	 */
	data()
	{
		const result = new Translation();
		result.url = document.location.toString();
		result.chapter = this.chapter;
		result.title = this._findLine(LineTypes.title);
		result.content = this._filterLines(line => LineTypes.isContent(line.type));
		result.author_before = this._filterLines(line => line.type === LineTypes.author_before);
		result.author_after = this._filterLines(line => line.type === LineTypes.author_after);

		return result;
	}

	meta()
	{
		const result = new TranslationMeta();
		result.url = document.location.toString();
		result.chapters = this.chapters;
		result.title = this._findLine(LineTypes.title);
		result.title.eng = this.trim(result.title.eng.trim(), '.')

		result.author = this._findLine(LineTypes.author);
		result.introduction = this._findLine(LineTypes.introduction);

		return result;
	}
}