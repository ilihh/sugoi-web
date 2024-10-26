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

	get translationInfo()
	{
		return new TranslationInfo(this.allowed, this.isMain, this.isChapter, this.googleTranslated);
	}

	get googleTranslated()
	{
		const html = document.querySelector('html');
		return (html.lang === 'en') && html.classList.contains('translated-ltr')
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
		for (const cls of this.derived)
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

	hasContent()
	{
		for (const selector of this.content_selectors)
		{
			if (document.querySelectorAll(selector).length > 0)
			{
				return true;
			}
		}

		return false;
	}

	fixContent()
	{
		for (const selector of this.content_selectors)
		{
			const elements = document.querySelectorAll(selector);
			for (const element of elements)
			{
				this.replaceEmoji(element);
				this._replaceRubyAll(element);
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
		let start = 0, end = str.length;

		while (start < end && chars.indexOf(str[start]) >= 0)
		{
			++start;
		}

		while (end > start && chars.indexOf(str[end - 1]) >= 0)
		{
			--end;
		}

		return (start > 0 || end < str.length) ? str.substring(start, end) : str;
	}

	/**
	 *
	 * @param {HTMLElement} element
	 */
	replaceEmoji(element)
	{
		const images = element.querySelectorAll('img.emoji[alt]');
		for (const img of images)
		{
			img.after(img.attributes.getNamedItem('alt').value);
			img.remove();
		}
	}

	/**
	 *
	 * @param {HTMLElement} element
	 * @private
	 */
	_replaceRubyAll(element)
	{
		const ruby = element.querySelectorAll('ruby');
		for (const r of ruby)
		{
			this._replaceRuby(r);
		}
	}

	/**
	 * Convert Ruby tag:
	 * <ruby> <rb>明日</rb> <rp>(</rp><rt>Ashita</rt><rp>)</rp> </ruby>
	 * to text:
	 * 明日 (Ashita)
	 * @param {HTMLElement} ruby
	 * @private
	 */
	_replaceRuby(ruby)
	{
		if (ruby.innerHTML.trim() === '')
		{
			ruby.remove();
			return;
		}

		// replace <rp> - brackets ()
		const brackets = ruby.querySelectorAll('rp');
		for (const e of brackets)
		{
			e.after(' ' + e.innerHTML + ' ');
			e.remove();
		}

		// replace <rb> - legacy tag for the main text
		const main_text = ruby.querySelectorAll('rb');
		for (const e of main_text)
		{
			e.after(e.innerHTML);
			e.remove();
		}

		// replace <rt> - tag for the upper text
		const upper_text = ruby.querySelectorAll('rt');
		for (const e of upper_text)
		{
			const prefix = e.previousSibling.nodeValue.trim().endsWith('(') ? '' : ' (';
			const suffix = e.nextSibling.nodeValue.trim().startsWith(')') ? '' : ') ';
			e.after(prefix + e.innerHTML + suffix);
			e.remove();
		}

		let html = ruby.innerHTML;
		html = html.replaceAll('  ', ' ');
		html = html.replaceAll('( ', '(');
		html = html.replaceAll(' )', ')');
		ruby.after(html);
		ruby.remove();
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
		result.filename = this._name2filename(result.title.eng);

		result.author = this._findLine(LineTypes.author);
		result.introduction = this._findLine(LineTypes.introduction);
		if (result.introduction == null)
		{
			result.introduction = {
				jpn: '',
				eng: '',
				html: false,
			}
		}

		return result;
	}

	/**+
	 *
	 * @param {string} name
	 * @return {string}
	 * @private
	 */
	_name2filename(name)
	{
		name = name.replaceAll('<unk>', '.')

		const symbols = ['\\', '/', ':', '*', '?', '"', '<', '>', '|', ];
		symbols.forEach(x => name = name.replaceAll(x, ''));

		return this._trim(name, ' .~');
	}

	_trim(str, characters)
	{
		str = str.trim();

		let start = 0;
		let end = str.length;

		while (start < end && characters.includes(str[start]))
		{
			start += 1;
		}

		while (end > start && characters.includes(str[end - 1]))
		{
			end -= 1;
		}

		return (start > 0 || end < str.length) ? str.substring(start, end) : str;
	}

	static _test()
	{
		const div = document.createElement('div');
		div.innerHTML = '<ruby> <rb>明日</rb> <rp>(</rp><rt>Ashita</rt><rp>)</rp> </ruby>';
		const tl = new Proxy();
		tl._replaceRubyAll(div);
		const expected = '明日 (Ashita)';
		const result = div.innerHTML.trim();
		console.assert(result === expected, '\nExpected: %o\nGot: %o', expected, result);
	}
}