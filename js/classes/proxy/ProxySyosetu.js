'use strict';

class ProxySyosetu extends Proxy
{
	static
	{
		Proxy.derived.add(this)
	}

	constructor()
	{
		super();

		this.content_selectors = [
			'article.p-novel .p-novel__body .js-novel-text.p-novel__text',
			'article.p-novel .p-novel__body .js-novel-text.p-novel__text.p-novel__text--preface',
			'article.p-novel .p-novel__body .js-novel-text.p-novel__text.p-novel__text--afterword',
		];
	}

	/**
	 *
	 * @param {string} domain
	 * @abstract
	 * @returns {boolean}
	 */
	supported(domain)
	{
		return domain.endsWith('.syosetu.com');
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isMain()
	{
		const has_introduction = document.querySelector('#novel_ex') != null;
		if (has_introduction)
		{
			return true;
		}

		const has_menu = document.querySelector('article.p-novel .p-eplist') != null;
		return has_menu || this.chapter === 0;
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isChapter()
	{
		return this.hasContent();
	}

	/**
	 *
	 * @returns {number}
	 * @override
	 */
	get chapter()
	{
		const chapters = document.querySelector('article.p-novel .p-novel__number.js-siori');
		if (chapters == null)
		{
			return 0;
		}

		const chapter = chapters.textContent.split('/')[0].trim();
		return parseInt(chapter);
	}

	/**
	 * @override
	 * @returns {number}
	 */
	get chapters()
	{
		if (this.isMain)
		{
			return document.querySelectorAll('article.p-novel .p-eplist a').length;
		}

		const chapters = document.querySelector('article.p-novel .p-novel__number.js-siori');
		if (chapters == null)
		{
			return 0;
		}

		const chapter = chapters.textContent.split('/')[1].trim();
		return parseInt(chapter);
	}

	loadAuthor()
	{
		const block = document.querySelector('article.p-novel .p-novel__author')
		if (block == null)
		{
			return;
		}

		let author = block.querySelector('a');
		if (author == null)
		{
			const prefix = '作者：';
			const name = block.innerText.split(prefix)[1];
			block.innerHTML = prefix + '<a>' + name + '</a>';
		}

		this.addLine(block.querySelector('a'), LineTypes.author);
	}

	/**
	 *
	 * @override
	 */
	loadLines()
	{
		this.addLine(document.querySelector('article.p-novel h1.p-novel__title'), LineTypes.title);
		//this.addLine(document.querySelector('#novel_contents p.novel_subtitle'), LineTypes.title);

		// can be main and chapter at same time if only one chapter
		if (this.isMain)
		{
			const more = document.querySelector('#novel_ex a.more');
			if (more != null)
			{
				more.dispatchEvent(new Event('click'));
			}

			this.loadAuthor();

			this.addLine(document.querySelector('#novel_ex'), LineTypes.introduction);
		}

		if (this.isChapter)
		{
			const before = document.querySelectorAll('article.p-novel.p-novel__body .js-novel-text.p-novel__text.p-novel__text--preface > p');
			before.forEach(e => this.addLine(e, LineTypes.author_before));

			const content = document.querySelectorAll('article.p-novel .p-novel__body .js-novel-text.p-novel__text > p');
			content.forEach(e => this.addLine(e, LineTypes.content));

			const after = document.querySelectorAll('article.p-novel .p-novel__body .js-novel-text.p-novel__text.p-novel__text--afterword > p');
			after.forEach(e => this.addLine(e, LineTypes.author_after));
		}
	}
}