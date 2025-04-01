import { Controller } from '@hotwired/stimulus';
import MobileController from '@survos-mobile/mobile';

import Framework7 from 'framework7/framework7-bundle';
import 'framework7/framework7-bundle.min.css';
// @todo: make conditional
import routes from "./../routes.js";
// import routes from "./routes.js";

var $ = Dom7;

// import './store.js';
import Dexie from 'dexie';


// import 'framework7-icons/css/framework7-icons.min.css'
// import 'framework7-icons';


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
    }
    // targets are defined in mobile_controller, e.g. title, page_title

    connect() {
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

        var createStore = Framework7.createStore;
        const store = createStore({
            state: {
                products: []
            },
            getters: {
                products({ state }) {
                    return state.products;
                }
            },
            actions: {
                setProduct({ state }, product) {
                    state.product = product;
                },
                getProducts({ state }) {
                    //get products from dixie db
                    // let products = db.products.toArray().then(products => {
                    //     state.products = products;
                    // });
                },
                addProduct({ state }, product) {
                    state.products = [...state.products, product];
                },
            },
        })
        store.dispatch('getProducts');
//console.log(routes, store);

        var app = new Framework7({
            name: 'My App', // App name
            theme: 'auto', // Automatic theme detection
            el: '#app', // App root element
            view: {
                transition: "f7-parallax", // Change transition effect here
            },

            // App store
            store: store,
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
                    console.log('App initialized');
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
                            }, 600);
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

//event dispatch for first tab
// var tabs = document.querySelectorAll('.tabs')[0];
// var firstTab = tabs.children[0];
// var eventDispatched = false;
// firstTab.addEventListener("DOMNodeInserted", function (ev) {
//     if (!eventDispatched) {
//         document.dispatchEvent(new Event(firstTab.id + '-show'));
//         eventDispatched = true;
//     }
// }, false);


// app.emit('myCustomEvent', 'foo', 'bar');
        window.app = app;

// Login Screen Demo
        $('#my-login-screen .login-button').on('click', function () {
            var username = $('#my-login-screen [name="username"]').val();
            var password = $('#my-login-screen [name="password"]').val();

            // Close login screen
            app.loginScreen.close('#my-login-screen');

            // Alert username and password
            app.dialog.alert('Username: ' + username + '<br/>Password: ' + password);
        });


    }


    // ...
}
