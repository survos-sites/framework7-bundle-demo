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
