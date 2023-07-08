'use strict';

class PageOptions
{
	/**
	 *
	 * @type {Config}
	 * @private
	 */
	_config;

	/**
	 *
	 * @param {function} viewRender
	 */
	constructor(viewRender)
	{
		this.chromeApi = new ChromeApi();
		this.chromeApi.onStorageChanged(changes => this.config = changes['config'].newValue);

		this._sugoi = new TranslatorSugoi();
		this._deepl = new TranslatorDeepL(this.chromeApi);
		this._config = new Config();

		this.viewRender = viewRender;
		const _ = this._init();
	}

	get translator()
	{
		return this.config.mode === Config.MODE_SUGOI
			? this._sugoi
			: this._deepl;
	}

	/**
	 *
	 * @return {Config}
	 */
	get config()
	{
		return this._config;
	}

	/**
	 *
	 * @param {Config} config
	 */
	set config(config)
	{
		this._config = config;
		this._sugoi.setConfig(config);
		this._deepl.setConfig(config);

		if (this.app)
		{
			this.app.mode = config.mode === Config.MODE_SUGOI ? 'Sugoi' : 'DeepL'
		}
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
			data: {
				mode: 'Sugoi',
				text_original: '',
				text_translated: '',
			},
			methods: {
				async translate()
				{
					this.text_translated = await page.translator.translate(this.text_original);
				},
				clear()
				{
					if (confirm('Clear text?'))
					{
						this.text_original = '';
						this.text_translated = '';
					}
				},
			},
			computed: {
			}
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
		this.config = await this.chromeApi.getConfig();

		this.app = this._createApp();
	}
}