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
	get allowed()
	{
		return document.querySelector('.widget-episodeBody') != null;
	}

	/**
	 *
	 * @override
	 */
	loadLines()
	{
		this.addLine(document.querySelector('#contentMain-header .widget-episodeTitle'));

		const content = document.querySelectorAll('.widget-episodeBody > p');
		content.forEach(e => this.addLine(e));
	}
}