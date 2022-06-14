'use strict';

class ProxySyosetu extends Proxy
{
	constructor()
	{
		super();

		this.content_selectors = ['#novel_honbun', ];
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

		const content = document.querySelectorAll('#novel_honbun > p');
		content.forEach(e => this.addLine(e));

		const notes = document.querySelectorAll('#novel_a > p');
		notes.forEach(e => this.addLine(e));
	}
}