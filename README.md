# Sugoi-web
Chrome extension: translates pages using [Sugoi Offline Translation Server](https://www.patreon.com/mingshiba) 

To install:
1. Download the *sugoi-web* archive from Releases
2. Unpack the archive
3. Open extensions page (*chrome://extensions/*)
4. Enable **Developer Mode**
5. Add extension using the "Load Unpacked" button

Recommended to update server to support long lines:
1. Download the *server* archive from Releases
2. Unpack the archive
3. Copy files with overwrite to *backendServer / Program-Backend / Sugoi-Japanese-Translator / offlineTranslation / fairseq*

Translation server should be started with *backendServer / Program-Backend / Sugoi-Japanese-Translator / offlineTranslation / activateOfflineTranslationServer.bat*.