# simple framework7

## Developers only


```bash
git clone git@github.com:survos/fw-bundle.git 
git clone git@github.com:survos-sites/framework7-bundle-demo.git fw-demo
cd fw-demo
composer config repositories.fw7 '{"type": "path", "url": "../fw-bundle"}'
composer req survos/fw-bundle:dev-main
composer install
```

```bash
git clone git@github.com:survos-sites/framework7-bundle-demo.git
cd framework7-bundle-demo
composer install
symfony server:start -d
symfony open:local
```

run proxy server
```bash
symfony proxy:start
```

# Testing on Mobile

Install and configure ngrok (github auth token)

https://dashboard.ngrok.com/get-started/setup/

https://dashboard.ngrok.com/get-started/your-authtoken

Start ngrok on whatever PORT the symfony CLI uses
```bash
symfony server:status | grep List
grok http 8004
```

Now go to the forwarding link

![ngrok](assets/images/ngrok.png)

You can now access the app remotely.

Now edit the .env.local file in pgsc and set the MOBILE_APP_URL to the ngrok url

```
MOBILE_BASE_URL=https://fw.wip

```
MOBILE_BASE_URL=https://fw.wip

## Creating details views using automated queries :
(let's do an Artist details for example and show his related objects)

1. Create a new (Artist) view : templates/pages/artist.html.twig
2. the openning tag should be : <twig:SurvosFw:Framework7Page .... >
3. add a title placeholder : 
```html
    <twig:block name="title">
        @@title@@
    </twig:block*>
```
4. Reference the queries :
```html
    {% set queries = {
      artist: {store: 'artists', type: 'find' , id : '{{event.details.id}}' , templateName: 'artist'},
      objects: {store: 'objects', filters : {artistCode: '{{artist.code}}' }, filterType: 'where' , templateName: 'objects'},
    }%}
```
5. Pass the queries to the Dexie component :
```html
    <twig:dexie
            ...
            ...
            :queries="queries"
            ...
        >
```
6. Add the templates (reference by the name="..." attribute ) foreach block :
```html
    <twig:block name="artist" id="twig_artist_template">
       {% set locale = globals.locale %}
        <h1>Artist</h1>
        <sup>
          <div class="artist-detail">
          <h1>{{ data.name|title }}</h1>
        </div>
        </sup>
        <!-- twig_artist_template -->
      </twig:block>
```

