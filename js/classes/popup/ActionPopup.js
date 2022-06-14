class ActionPopup
{
	/**
	 *
	 * @type {object}
	 */
	app;

	/**
	 *
	 * @type {Config}
	 */
	config;

	/**
	 *
	 * @type {function}
	 */
	viewRender;

	/**
	 *
	 * @param {function} viewRender
	 */
	constructor(viewRender)
	{
		this.viewRender = viewRender;
		this.chromeApi = new ChromeApi();

		this._init();
	}

	/**
	 *
	 * @returns {Vue}
	 * @private
	 */
	_createApp()
	{
		const page = this;

		const data = {
			el: '#app',
			render: this.viewRender,
			data: page.config,
			updated()
			{
				page.chromeApi.setConfig(this.$data);
			},
		};

		return new Vue(data);
	}

	/**
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	async _init()
	{
		const response = await this.chromeApi.getConfig();
		this.config = response ?? new Config();

		this.app = this._createApp();
	}
}