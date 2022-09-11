'use strict';

class Utilities
{

	/**
	 *
	 * @param {Number} delay milliseconds
	 * @return {Promise<void>}
	 */
	static wait(delay)
	{
		return new Promise(function (resolve) {
			setTimeout(resolve, delay);
		});
	}
}