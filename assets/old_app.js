var $ = Dom7;
import Framework7 from 'framework7/framework7-bundle';

// import './store.js';
import Dexie from 'dexie';
//var db = new Dexie('MyDatabase');


import routes from "./routes.js";
// Routing.setData(RoutingData);

import {DbUtilities} from './js/lib/dixieDatabase.js';

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
            var tabId = window.location.hash.replace('#', '');
            if (tabId) {
                this.tab.show('#' + tabId);
            }
            console.log('Page initialized');
        },
    }
});

// Attach Dexie database to `app`
app.db = new Dexie("MyDatabase");
// Define database schema
app.db.version(2).stores({
    artists: '++id,name',
    locations: '++id,name',
    obras : '++id,title'
});

//grab data from api in laziest way for now
const tables = ['artists', 'locations', 'obras'];
tables.forEach(async (table) => {
    await DbUtilities.syncTable(app.db, table);
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
