'use strict';

class ProxyKakuyomu extends Proxy
{
	constructor()
	{
		super();

		this.content_selectors = ['.widget-episodeBody', ];
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