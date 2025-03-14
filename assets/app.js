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

// import 'framework7-icons/css/framework7-icons.min.css'
// import 'framework7-icons';

// let store = [];

var $ = Dom7;

// import './store.js';
import Dexie from 'dexie';
var db = new Dexie('MyDatabase');
db.version(1).stores({
    products: '++id, title, category'
});
const count = await db.products.count();
// await db.delete('friends');

if (count === 0)
{
    fetch('https://dummyjson.com/products')
        .then(res => res.json())
        .then(data => {
            data.products.forEach(function(product) {
                console.log(product);
                db.products.add(product);
                //store.push(product);
            })
        });
    // await db.friends.add({
    //     name: 'Camilla',
    //     age: 25,
    //     street: 'East 13:th Street'
    //     // picture: await getBlob('camilla.png')
    // });
    const products = await db.products
        // .where('age').below(75)
        .toArray();
        //console.log("products   :  ");
    //console.log(products);
}



import routes from "./routes.js";
// Routing.setData(RoutingData);

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
            let eventName = 'pokemon';
            // app.emit(eventName, el);
            const event = new CustomEvent(eventName, { detail: el.dataset });
            document.dispatchEvent(event);
            console.warn("tab switch Dispatched: ", event)
            console.log('showing ' + el.id);
            
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

// Attach Dexie database to `app`
app.db = new Dexie("MyDatabase");
// Define database schema
app.db.version(1).stores({
    products: '++id, title, category'
});

app.on('pageInit', function (page) {
    console.error('page', page);
    // do something on page init
});
app.on('pageAfterIn', function (page) {
    console.log("Current url: ");
    console.log(page.route.url);
});

app.emit('myCustomEvent', 'foo', 'bar');


// Login Screen Demo
$('#my-login-screen .login-button').on('click', function () {
    var username = $('#my-login-screen [name="username"]').val();
    var password = $('#my-login-screen [name="password"]').val();

    // Close login screen
    app.loginScreen.close('#my-login-screen');

    // Alert username and password
    app.dialog.alert('Username: ' + username + '<br/>Password: ' + password);
});
