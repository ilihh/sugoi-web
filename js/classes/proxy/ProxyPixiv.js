'use strict';

class ProxyPixiv extends Proxy
{
	static
	{
		Proxy.derived.add(this);
	}

	constructor()
	{
		super();
	}

	/**
	 *
	 * @param {string} domain
	 * @abstract
	 * @returns {boolean}
	 */
	supported(domain)
	{
		return domain.endsWith('.pixiv.net');
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isMain()
	{
		return document.location.pathname.startsWith('/novel/series/');
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isChapter()
	{
		return (document.location.pathname === '/novel/show.php') && document.location.search.startsWith('?id=');
	}

	/**
	 *
	 * @returns {number}
	 * @override
	 */
	get chapter()
	{
		const chapters = document.querySelector('header > a[href^="/novel/series/"]')?.parentNode?.nextSibling?.querySelector('ol') ?? null;
		if (chapters == null)
		{
			return 0;
		}

		const chapter = chapters.querySelector('a[aria-current=true]')?.parentNode;
		if (chapter == null)
		{
			return 0;
		}

		return Array.prototype.slice.call(chapters.children).indexOf(chapter);
	}

	/**
	 * @override
	 * @returns {number}
	 */
	get chapters()
	{
		if (this.isMain)
		{
			const t = document.querySelector('.sc-eoqmwo-0')?.innerText ?? '';
			return parseInt(t.replace(' episode(s)', ''));
		}

		const chapters = document.querySelector('header > a[href^="/novel/series/"]')?.parentNode?.nextSibling?.querySelector('ol') ?? null;
		if (chapters == null)
		{
			return 0;
		}

		return chapters.children.length;
	}

	loadAuthor()
	{
		const block = document.querySelector('aside h2');
		if (block == null)
		{
			return;
		}

		let author = block.querySelectorAll('a');
		if (author.length === 0)
		{
			return;
		}

		this.addLine(author[author.length - 1], LineTypes.author);
	}

	/**
	 *
	 * @override
	 */
	loadLines()
	{
		this._lines.length = 0;
		this.addLine(document.querySelector('h1'), LineTypes.title);

		const info = document.querySelector('[id^="expandable-paragraph"]');
		if (info !== null)
		{
			this.addLine(info, LineTypes.introduction);
		}

		if (this.isMain)
		{
			if (info != null)
			{
				const title = info.parentNode?.parentNode?.previousSibling;
				if (title != null)
				{
					this.addLine(title, LineTypes.title);
				}
			}

			this.loadAuthor();
		}

		if (this.isChapter)
		{
			const content = document.querySelectorAll('main span.text-count');
			content.forEach(e => this.addLine(e, LineTypes.content));
		}
	}
}