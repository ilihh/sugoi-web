'use strict';

class ProxyUnavailable extends Proxy
{
	loadLines()
	{
	}

	supported(domain)
	{
		return false;
	}

	/**
	 * @returns {boolean}
	 * @override
	 */
	get isMain()
	{
		return false;
	}

	/**
	 * @returns {boolean}
	 * @override
	 */
	get isChapter()
	{
		return false;
	}
}