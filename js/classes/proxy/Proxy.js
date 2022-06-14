'use strict';

class Proxy
{
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