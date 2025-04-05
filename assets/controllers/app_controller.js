import { Controller } from '@hotwired/stimulus';
import MobileController from '@survos-mobile/mobile';

import Framework7 from 'framework7/framework7-bundle';
import 'framework7/framework7-bundle.min.css';
// import { DbUtilities } from "../lib/dexieDatabase.js";
//@survos-js-twig/database
import { DbUtilities } from "@survos-js-twig/database";
// @todo: make conditional
import routes from "./../routes.js";


// are these needed?
import Dexie from 'dexie';
var $ = Dom7;


/*
* The following line makes this controller "lazy": it won't be downloaded until needed
* See https://github.com/symfony/stimulus-bridge#lazy-controllers
*/
// /* stimulusFetch: 'lazy' */
export default class extends MobileController {
    static values = {
        name: String,
        theme: String,
        locale: String,
        configCode: String,
        config: Object // @todo: move to mobile_controller and merge the values
    }
    // targets are defined in mobile_controller, e.g. title, page_title

    connect() {
        console.log("Hi from " . this.identifier);
        super.connect();
        let el = this.element;
        // this.start();

    }

    async isPopulated(table) {
        // @todo: check database in window.app.db?
        const count = await table.count();
        return count > 0;
    }

    initialize() {
        var appController = this;
        console.log("config values" , this.configValue);
        console.log("config values app" , appController.configValue);
        var app = new Framework7({
            name: 'My App', // App name
            theme: 'auto', // Automatic theme detection
            el: '#app', // App root element
            view: {
                transition: "f7-parallax", // Change transition effect here
            },
            // App routes
            routes: routes,
            // Register service worker
            // serviceWorker: {
            //     path: '/service-worker.js',
            // },
            on: {
                tabShow: (el) => {
                    let eventName = el.id + '-show';
                    console.error(eventName);
                    // app.emit(eventName, el);
                    const event = new CustomEvent(eventName, { detail: el.dataset });
                    console.warn("Dispatching: " + eventName);
                    document.dispatchEvent(event);

                },
                tabHide: (el) => {
                    //console.log('hiding ' + el.id);
                },
                pageTabShow: (el) => {
                    this.setTitle('&nbsp'); // set to blank for now.
                    //console.log('pageTabShow ' + el.id);
                },
                pageBeforeOut: (x) => {
                    this.setTitle(''); // set to blank when leaving. @todo: stack?

                },
                pageBeforeIn: (x) => {
                    console.log('before ' + x.route.url);
                    console.warn('pageInBefore: %o', x);
                },
                init: function () {
                    //bind to dbready event
                    document.addEventListener('dbready', function (event) {
                        let pageContent = document.querySelector('.page-content');
                        pageContent.remove();
                        let tabLink = document.querySelector('.tab-link');
                        tabLink.click();
                    });
                    let dbUtils = new DbUtilities(appController.configValue.projects[appController.configCodeValue],appController.localeValue);
                },
                pageInit: function (event) {
                    //console.log('Page initialized');

                },
                pageAfterIn: function (event) {
                    console.log('Page after in',event);
                    var tabId = window.location.hash.replace('#', '');
                    if (tabId) {
                        if (!this.tabShown) {
                            this.tabShown = true;
                            setTimeout(() => {
                                // Handle tab navigation based on tabId
                                var navElement = document.querySelector('a[href="#' + tabId + '"]');
                                this.tab.show('#' + tabId, navElement);

                                // Extract current query params as object
                                var queryParams = app.views.main.router.currentRoute.query;
                                console.log('queryParams', queryParams);

                                // Handle navigation based on query params.  Hacky
                                if (queryParams.artistId && tabId === 'tab-artists') {
                                    app.views.main.router.navigate('/pages/artist/' + queryParams.artistId);
                                } else if (queryParams.locationId && tabId === 'tab-locations') {
                                    app.views.main.router.navigate('/pages/location/' + queryParams.locationId);
                                } else if (queryParams.obraId && tabId === 'tab-obras') {
                                    app.views.main.router.navigate('/pages/obra/' + queryParams.obraId);
                                }
                            }, 800);
                        }
                    }
                },
            }
        });

        app.on('pageInit', function (page) {
            console.error('page', page);
            // do something on page init
        });
        app.on('pageAfterIn', function (page) {
            console.log("Current url: ");
            console.log(page.route.url);
        });
        window.app = app;
    }
}
