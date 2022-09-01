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
	get allowed()
	{
		return document.getElementById('novel_honbun') != null;
	}

	/**
	 *
	 * @override
	 */
	loadLines()
	{
		this.addLine(document.querySelector('#novel_contents p.novel_title'));
		this.addLine(document.querySelector('#novel_contents p.novel_subtitle'));

		const before = document.querySelectorAll('#novel_p > p');
		before.forEach(e => this.addLine(e));

		const content = document.querySelectorAll('#novel_honbun > p');
		content.forEach(e => this.addLine(e));

		const after = document.querySelectorAll('#novel_a > p');
		after.forEach(e => this.addLine(e));
	}
}