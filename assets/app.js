import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

// import Framework7 from 'framework7/framework7-bundle'
import Framework7 from 'framework7/framework7-bundle';
import 'framework7/framework7-bundle.min.css';
import routes from "./routes.js";

import Dexie from 'dexie';
const db = new Dexie("MyDatabase");


// import 'framework7-icons/css/framework7-icons.min.css'
// import 'framework7-icons';

// let store = [];

var $ = Dom7;


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
            let products = db.products.toArray().then(products => {
                state.products = products;
            });
        },
        addProduct({ state }, product) {
            state.products = [...state.products, product];
        },
    },
})
//store.dispatch('getProducts');
//console.log(routes, store);

var app = new Framework7({
    name: 'My App', // App name
    theme: 'auto', // Automatic theme detection
    el: '#app', // App root element

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
            console.log('hiding ' + el.id);
        },
        pageTabShow: (el) => {
            console.log('pageTabShow ' + el.id);
        },
        pageBeforeIn: (x) => {
            console.log('before ' + x.route.url);
            console.warn('pageInBefore: %o', x);
        },
        init: function () {
            console.log('App initialized');
        },
        pageInit: function () {
            console.log('Page initialized');
        },
    }
});

// Attach Dexie database to `app` and sync data if not there yet
app.db = db;
// Define database schema
app.db.version(1).stores({
    artists: '++id,name',
    locations: '++id,name',
    obras : 'title'
});

//grab data from api in laziest way for now 
const artistsCount = await db.artists.count();
const locationsCount = await db.locations.count();
const obrasCount = await db.obras.count();

if (artistsCount == 0) {
    let page = 1;
    const maxPages = 20;
    let fetchArtists = async () => {
        if (page > maxPages) return;
        let res = await fetch(`https://pgsc.wip/api/artists?page=${page}`);
        let data = await res.json();
        if (data.member.length > 0) {
            data.member.forEach(function(artist) {
                app.db.artists.add(artist);
            });
            page++;
            fetchArtists(); // Fetch next page
        }
    };
    fetchArtists();
}

if (locationsCount == 0) {
    let page = 1;
    const maxPages = 20;
    let fetchLocations = async () => {
        if (page > maxPages) return;
        let res = await fetch(`https://pgsc.wip/api/locations?page=${page}`);
        let data = await res.json();
        if (data.member.length > 0) {
            data.member.forEach(function(location) {
                app.db.locations.add(location);
            });
            page++;
            fetchLocations(); // Fetch next page
        }
    };
    fetchLocations();
}

if (obrasCount == 0) {
    let page = 1;
    const maxPages = 20;
    let fetchObras = async () => {
        if (page > maxPages) return;
        let res = await fetch(`https://pgsc.wip/api/obras?page=${page}`);
        let data = await res.json();
        if (data.member.length > 0) {
            data.member.forEach(function(obra) {
                app.db.obras.add(obra);
            });
            page++;
            fetchObras(); // Fetch next page
        }
    };
    fetchObras();
}

app.on('pageInit', function (page) {
    console.error('page', page);
    // do something on page init
});
app.on('pageAfterIn', function (page) {
    console.log("Current url: ");
    console.log(page.route.url);
});

app.emit('myCustomEvent', 'foo', 'bar');
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
