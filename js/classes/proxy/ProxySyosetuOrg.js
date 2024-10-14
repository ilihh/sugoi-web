'use strict';

class ProxySyosetuOrg extends Proxy {
	static
	{
		Proxy.derived.add(this)
	}

	constructor() {
		super();

	}

	/**
	 *
	 * @param {string} domain
	 * @abstract
	 * @returns {boolean}
	 */
	supported(domain) {
		return domain.endsWith('syosetu.org');
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isMain() {
		return document.querySelector('#honbun') == null;
	}

	/**
	 *
	 * @returns {boolean}
	 * @override
	 */
	get isChapter() {
		return document.querySelector('#honbun') != null;
	}

	/**
	 *
	 * @returns {number}
	 * @override
	 */
	/*
	get chapter()
	{
  
	}
	*/

	/**
	 * @override
	 * @returns {number}
	 */
	/*
	get chapters()
	{
  
	}
	*/

	loadAuthor() {
		const block = document.querySelector('[itemprop="author"]');
		if (block == null) {
			return;
		}

		let author = block.querySelector('a');
		if (author == null) {
			return;
		}

		this.addLine(author, LineTypes.author);
	}

	/**
	 *
	 * @override
	 */
	loadLines() {
		if (this.isMain) {
			let title = document.querySelector('[itemprop="name"]');
			if (title != null) {
				this.addLine(title, LineTypes.title);
			}

			this.loadAuthor();

			this.addLineHasTags(document.querySelectorAll('#maind > .ss')[1], LineTypes.introduction);
		}

		if (this.isChapter) {
			if (document.querySelector('.novelnavi + p + div + span') != null) {
				this.addLine(document.querySelector('.novelnavi + p + div + span'), LineTypes.title);
			} else if (document.querySelector('#maegaki_open + span') != null) {
				this.addLine(document.querySelector('#maegaki_open + span'), LineTypes.title);
			}

			this.addLineHasTags(document.querySelector('#maegaki'), LineTypes.author_before);

			const content = document.querySelectorAll('#honbun > p');
			content.forEach(e => this.addLine(e, LineTypes.content));

			this.addLineHasTags(document.querySelector('#atogaki'), LineTypes.author_after);
		}
	}

	addLineHasTags(element, type) {
		if (element != null) {
			let content = element.innerHTML;

			const hasTags = /<[^>]+>/g.test(content);
			if (hasTags) {

				// Step 1: Regular expression to find text outside of tags and wrap it in <p> tags
				content = content.replace(/([^<>]+)(?=<|$)/g, function (match) {
					// Trim the match to avoid wrapping spaces or empty strings
					const trimmedMatch = match.trim();
					return trimmedMatch ? `<p>${trimmedMatch}</p>` : match;
				});

				// Step 2: Remove <br> tags that are immediately after a </p> tag
				content = content.replace(/<\/p>\s*<br\s*\/?>/g, '</p>');

				element.innerHTML = content;

				if (element.querySelectorAll('*').length) {
					element.querySelectorAll('*').forEach(e => this.addLine(e, type));
				} else {
					this.addLine(element, type);
				}
			} else {
				this.addLine(element, type);
			}
		}
	}
}