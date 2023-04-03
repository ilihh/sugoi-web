'use strict';

class LineTypes
{
	static get title()
	{
		return 'title';
	}

	static get author()
	{
		return 'author';
	}

	static get introduction()
	{
		return 'introduction';
	}

	static get content()
	{
		return 'content';
	}

	static get author_before()
	{
		return 'author_before';
	}

	static get author_after()
	{
		return 'author_after';
	}

	static get image()
	{
		return 'image';
	}

	/**
	 *
	 * @param {string} type
	 */
	static isContent(type)
	{
		return (type === 'content') || (type === 'image');
	}
}