'use strict';

class ProxyKakuyomu extends Proxy
{
	static
	{
		Proxy.derived.add(this)
	}

	constructor()
	{
		super();

		this.content_selectors = ['.widget-episodeBody', ];
	}

	/**
	 *
	 * @param {string} domain
	 * @abstract
	 * @returns {boolean}
	 */
	supported(domain)
	{
		return (domain === 'kakuyomu.jp') || domain.endsWith('.kakuyomu.jp');
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isMain()
	{
		const has_title = document.querySelector('#workTitle a') != null;
		const has_menu = document.querySelector('#table-of-contents') != null;
		return has_title && (has_menu || this.chapter === 0);
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isChapter()
	{
		return document.querySelector('.widget-episodeBody') != null;
	}

	/**
	 * @override
	 * @returns {number}
	 */
	get chapter()
	{
		const selected = document.querySelector('#contentAside-episodeInfo .contentAside-sectionBody .widget-toc-items .isHighlighted');
		if (!selected)
		{
			return 0;
		}

		return [...selected.parentElement.children].indexOf(selected);
	}

	/**
	 * @override
	 * @returns {number}
	 */
	get chapters()
	{
		if (this.isMain)
		{
			return document.querySelectorAll('#table-of-contents a').length;
		}

		return document.querySelectorAll('#contentAside-episodeInfo .contentAside-sectionBody .widget-toc-items a').length;
	}

	/**
	 *
	 * @override
	 */
	loadLines()
	{
		this.addLine(document.querySelector('#novel_contents p.novel_subtitle'), LineTypes.title);

		// can be main and chapter at same time if only one chapter
		if (this.isMain)
		{
			this.addLine(document.querySelector('#workTitle a'), LineTypes.title);
			this.addLine(document.querySelector('#workAuthor-activityName a'), LineTypes.author);
			this.addLine(document.querySelector('#introduction'), LineTypes.introduction);
		}

		if (this.isChapter)
		{
			this.addLine(document.querySelector('#contentMain-header .widget-episodeTitle'), LineTypes.title);

			const content = document.querySelectorAll('.widget-episodeBody > p');
			content.forEach(e => this.addLine(e, LineTypes.content));
		}
	}
}