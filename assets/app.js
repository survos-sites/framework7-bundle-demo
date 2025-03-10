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
const db = new Dexie('MyDatabase');
db.version(1).stores({
    products: '++id, title, category'
});
const count = await db.products.count();
// await db.delete('friends');

if (0)
{
    fetch('https://dummyjson.com/products')
        .then(res => res.json())
        .then(data => {
            data.products.forEach(function(product) {
                console.log(product);
                db.products.add(product);
                store.push(product);
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
    // console.log(products);
}



import routes from "./routes.js";
// Routing.setData(RoutingData);


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
})
console.log(routes, store);


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
        init: function () {
            console.log('App initialized');
        },
        pageInit: function () {
            console.log('Page initialized');
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
