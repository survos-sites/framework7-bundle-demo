<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 */
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    '@symfony/stimulus-bundle' => [
        'path' => './vendor/symfony/stimulus-bundle/assets/dist/loader.js',
    ],
    '@survos-mobile/mobile' => [
        'path' => './vendor/survos/fw-bundle/assets/src/controllers/mobile_controller.js',
    ],
    '@survos-js-twig/locale' => [
        'path' => './vendor/survos/js-twig-bundle/assets/src/lib/localeUtilities.js',
    ],
    '@survos-js-twig/database' => [
        'path' => './vendor/survos/js-twig-bundle/assets/src/lib/dexieDatabase.js',
    ],
    '@symfony/ux-leaflet-map' => [
        'path' => './vendor/symfony/ux-leaflet-map/assets/dist/map_controller.js',
    ],
    '@hotwired/stimulus' => [
        'version' => '3.2.2',
    ],
    'dom7' => [
        'version' => '4.0.6',
    ],
    'ssr-window' => [
        'version' => '5.0.1',
    ],
    'framework7' => [
        'version' => '8.3.4',
    ],
    'path-to-regexp' => [
        'version' => '8.2.0',
    ],
    'htm' => [
        'version' => '3.1.1',
    ],
    'swiper' => [
        'version' => '11.2.10',
    ],
    '@hotwired/turbo' => [
        'version' => '8.0.13',
    ],
    'framework7/framework7-bundle' => [
        'version' => '8.3.4',
    ],
    'framework7/framework7-bundle.min.css' => [
        'version' => '8.3.4',
        'type' => 'css',
    ],
    'unlazy' => [
        'version' => '0.12.4',
    ],
    '@unlazy/core' => [
        'version' => '0.12.4',
    ],
    'twig' => [
        'version' => '1.17.1',
    ],
    'locutus/php/strings/sprintf' => [
        'version' => '2.0.32',
    ],
    'locutus/php/strings/vsprintf' => [
        'version' => '2.0.32',
    ],
    'locutus/php/math/round' => [
        'version' => '2.0.32',
    ],
    'locutus/php/math/max' => [
        'version' => '2.0.32',
    ],
    'locutus/php/math/min' => [
        'version' => '2.0.32',
    ],
    'locutus/php/strings/strip_tags' => [
        'version' => '2.0.32',
    ],
    'locutus/php/datetime/strtotime' => [
        'version' => '2.0.32',
    ],
    'locutus/php/datetime/date' => [
        'version' => '2.0.32',
    ],
    'locutus/php/var/boolval' => [
        'version' => '2.0.32',
    ],
    'dexie' => [
        'version' => '4.0.11',
    ],
    'stimulus-attributes' => [
        'version' => '1.0.2',
    ],
    'escape-html' => [
        'version' => '1.0.3',
    ],
    'fos-routing' => [
        'version' => '0.0.6',
    ],
    'leaflet' => [
        'version' => '1.9.4',
    ],
    'leaflet/dist/leaflet.min.css' => [
        'version' => '1.9.4',
        'type' => 'css',
    ],
    'idb' => [
        'version' => '8.0.3',
    ],
    'idb-keyval' => [
        'version' => '6.2.2',
    ],
    'framework7-icons' => [
        'version' => '5.0.5',
    ],
    'framework7-icons/css/framework7-icons.min.css' => [
        'version' => '5.0.5',
        'type' => 'css',
    ],
    '@spomky-labs/pwa/helpers' => [
        'path' => './vendor/spomky-labs/pwa-bundle/assets/src/helpers.js',
    ],
    'debug' => [
        'version' => '4.4.1',
    ],
    'ms' => [
        'version' => '2.1.3',
    ],
];
