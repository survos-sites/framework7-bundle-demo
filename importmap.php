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
    '@hotwired/stimulus' => [
        'version' => '3.2.2',
    ],
    'dom7' => [
        'version' => '4.0.6',
    ],
    'ssr-window' => [
        'version' => '5.0.0',
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
        'version' => '11.2.5',
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
];
