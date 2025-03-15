import { Controller } from '@hotwired/stimulus';
import MobileController from '@survos-mobile/mobile';

import Framework7 from 'framework7/framework7-bundle';
import 'framework7/framework7-bundle.min.css';
import routes from "./../routes.js";

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

    connect() {
        super.connect();
        let el = this.element;
        console.error('hello from ' + this.identifier);
        // this.start();

    }

    isPopulated() {
        // @todo: check database in window.app.db?
        return true;
    }

    start() {
        console.log('starting F7...');
        var app = new Framework7({
            // name: this.nameValue,
            // theme: this.themeValue,

            el: this.element, // App root element

            // App store
            store: this.store,
            // App routes
            routes: routes,
            // Register service worker
            // serviceWorker: {
            //     path: '/service-worker.js',
            // },
        });

    }

    store() {
        // if this returns a promise, wait for the response.
        var createStore = Framework7.createStore;
        const store = createStore({
            state: {
                products: [
                    {
                        id: '1',
                        title: 'Apple iPhone 8',
                        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
                    },
                    {
                        id: '2',
                        title: 'Apple iPhone 8 Plus',
                        description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
                    },
                    {
                        id: '3',
                        title: 'Apple iPhone X',
                        description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
                    },
                ]
            },
            getters: {
                products({ state }) {
                    return state.products;
                }
            },
            actions: {
                addProduct({ state }, product) {
                    state.products = [...state.products, product];
                },
            },
        });
        return store;

    }

    // ...
}
