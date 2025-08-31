import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');
import './debug-overlay.js';

// import Framework7 from 'framework7/framework7-bundle'
// import 'framework7/framework7-bundle.min.css';
import routes from "./routes.js";

// import Dexie from 'dexie';
// const db = new Dexie("MyDatabase");


// import './old_app.js';

// import './fw.js';
