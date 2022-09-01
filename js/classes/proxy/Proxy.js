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
		return false;
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
	 */
	addLine(element)
	{
		if (element)
		{
			this._lines.push(new TranslatorLine(element));
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
				this.ReplaceEmoji($content);
				this.ReplaceRuby($content);
			}
		}
	}

	/**
	 *
	 * @param {string} str
	 * @param {string} chars
	 * @returns {string}
	 */
	Trim(str, chars)
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
	ReplaceEmoji($content)
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
	ReplaceRuby($content)
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
				let rt = self.Trim($rt.html(), '・');
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
}