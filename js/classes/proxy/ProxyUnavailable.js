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
}