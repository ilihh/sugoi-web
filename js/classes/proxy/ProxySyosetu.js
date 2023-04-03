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

		this.content_selectors = ['#novel_p', '#novel_honbun', '#novel_a', ];
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
		const has_title = document.querySelector('#novel_contents p.novel_title') != null;
		const has_menu = document.querySelector('#novel_contents .index_box') != null;
		return has_title && (has_menu || this.chapter === 0);
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isChapter()
	{
		return document.querySelector('#novel_honbun') != null;
	}

	/**
	 *
	 * @returns {number}
	 * @override
	 */
	get chapter()
	{
		const chapters = document.querySelector('#novel_no');
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
			return document.querySelectorAll('#novel_contents .index_box a').length;
		}

		const chapters = document.querySelector('#novel_no');
		if (chapters == null)
		{
			return 0;
		}

		const chapter = chapters.textContent.split('/')[1].trim();
		return parseInt(chapter);
	}

	loadAuthor()
	{
		const block = document.querySelector('.novel_writername')
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
		this.addLine(document.querySelector('#novel_contents p.novel_title'), LineTypes.title);
		this.addLine(document.querySelector('#novel_contents p.novel_subtitle'), LineTypes.title);

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
			const before = document.querySelectorAll('#novel_p > p');
			before.forEach(e => this.addLine(e, LineTypes.author_before));

			const content = document.querySelectorAll('#novel_honbun > p');
			content.forEach(e => this.addLine(e, LineTypes.content));

			const after = document.querySelectorAll('#novel_a > p');
			after.forEach(e => this.addLine(e, LineTypes.author_after));
		}
	}
}