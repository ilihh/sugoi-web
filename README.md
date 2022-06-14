# Sugoi-web
Chrome extension: translates japanese web novels using [Sugoi Offline Translation Server](https://www.patreon.com/mingshiba) 

**To install:**
1. Download the *Source code (zip)* archive from Releases
2. Unpack the archive
3. Open extensions page (*chrome://extensions/*)
4. Enable **Developer Mode**
5. Add extension using the "Load Unpacked" button

**To use:**
1. Open *{Sugoi folder} / backendServer / Program-Backend / Sugoi-Japanese-Translator / offlineTranslation*
2. Run *activateOfflineTranslationServer.bat* to start server.
3. Now **Translate** button is works

**Recommended to update server to correctly translate long lines:**
1. Download the *server* archive from Releases
2. Unpack the archive
3. Copy files with overwrite to *backendServer / Program-Backend / Sugoi-Japanese-Translator / offlineTranslation / fairseq*

**Notes:**
* For now supported only *.syosetu.com.

**Known Problems:**
* Error: *Sugoi Offline Translation Server is not available.*
  - Reasons: 
    - Server not started
    - Access blocked by AdBlock, Brave Shields, or other similar extensions
  - Solutions:
    - Start server
    - Temporarily disable those extensions for the current page or add *http://127.0.0.1:14366* to the whitelist if possible
