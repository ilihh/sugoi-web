'use strict';

class UI
{
	/**
	 *
	 * @type {Proxy}
	 */
	proxy = null;

	/**
	 *
	 * @type {Promise<void>}
	 * @private
	 */
	_translation = null;

	/**
	 *
	 * @type {Translator}
	 */
	translator = new Translator();

	/**
	 * 
	 * @param {string} domain 
	 */
	constructor(domain)
	{
		this.domain = domain;
		this._config = new Config();

		/**
		 * 
		 * @type {HTMLDivElement}
		 */
		this._buttonsBlock = null;

		/**
		 *
		 * @type {HTMLButtonElement}
		 */
		this._buttonTranslate = null;

		this.chromeApi = new ChromeApi();
		this.chromeApi.onStorageChanged(changes => this.config = changes['config'].newValue);
		this.load();

		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => this._processMessage(request, sender, sendResponse));
	}

	/**
	 *
	 * @param {any} request
	 * @param {MessageSender} sender
	 * @param {function} sendResponse
	 */
	async _processMessage(request, sender, sendResponse)
	{
		if (sender.tab)
		{
			return;
		}

		let response;
		switch (request.action)
		{
			case 'canTranslate':
				response = this.proxy.allowed;
				break;
			case 'translate':
				if (this.proxy.allowed)
				{
					await (this._translation || this.translate());
					response = true;
				}
				else
				{
					response = false;
				}
				break;
			default:
				response = null;
				break;
		}

		sendResponse(response);
	}

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
		this.translator = config.mode === Config.MODE_SUGOI
			? new TranslatorSugoi()
			: new TranslatorDeepL(this.chromeApi);
		this.translator.setConfig(config);
		this.updateView();
	}

	async load()
	{
		this.config = (await this.chromeApi.getConfig()) ?? new Config();
	}

	async updateView()
	{
		if (this._buttonsBlock == null)
		{
			return;
		}

		if (this.config.enabled)
		{
			if (this._buttonsBlock.parentElement == null)
			{
				document.body.append(this._buttonsBlock);
			}

			const response = await this.chromeApi.send({action: 'show'});
			this.processResponse(response);

			this.proxy.fixContent();

			if (this.config.alwaysTranslate)
			{
				this.translate();
			}
		}
		else
		{
			if (this._buttonsBlock.parentElement !== null)
			{
				document.body.removeChild(this._buttonsBlock);
			}

			const response = await this.chromeApi.send({action: 'hide'});
			this.processResponse(response);
		}
	}

	async translate()
	{
		this._buttonTranslate.style.display = 'none';

		const enabled = await this.translator.serverAvailable();
		if (!enabled)
		{
			alert('Sugoi Offline Translation Server is not available.\nProbably server not started or access blocked by AdBlock, Brave Shields, or other similar extensions.');
			this._buttonTranslate.style.display = 'block';
			return;
		}

		this.proxy.loadLines();
		this._translation = this.translator.run(this.proxy.lines);
		await this._translation;
		this.proxy.validate();
		this._translation = null;
	}

	createButtons()
	{
		this.proxy = Proxy.get(this.domain);
		const enabled = (this.proxy != null) && this.proxy.allowed;
		if (!enabled)
		{
			return;
		}

		this._buttonsBlock = document.createElement('div');
		$(this._buttonsBlock).css({
			width: '100px',
			display: 'flex',
			'flex-direction': 'column',
			position: 'fixed',
			bottom: '10px',
			right: '10px',
			zIndex: '100000',
		});

		this._buttonTranslate = document.createElement('button');
		this._buttonsBlock.append(this._buttonTranslate);

		const $btn_translate = $(this._buttonTranslate).css({
			width: '100%',
			height: '25px',
			fontWeight: 'bold',
			color: 'black',

			border: '1px solid black',
			backgroundColor: 'white',
			cursor: 'pointer',
		}).html('TRANSLATE');

		$btn_translate.on('click', () => this.translate());
	}

	processResponse(response)
	{
		console.log(response);
	}
}