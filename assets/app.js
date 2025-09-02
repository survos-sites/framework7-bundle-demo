import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');
//import './debug-overlay.js';

// Debug configuration
const ENABLE_DEBUG = true; // Set to false in production

if (ENABLE_DEBUG) {
    localStorage.debug = 'app:*,mobile:*,dexie:*';
    console.log('Debug enabled');

    // Enhanced event logging
    const originalDispatchEvent = document.dispatchEvent;
    document.dispatchEvent = function(event) {
        if (event.type.includes('refresh')) {
            console.log('🔔', event.type, event.detail);
        }
        return originalDispatchEvent.call(this, event);
    };

    // Listen for location.refresh specifically
// Add this to your app.js debug section (replace the current location.refresh listener):

    document.addEventListener('location.refresh', function(e) {
        console.log('🎯 location.refresh received!');
        console.log('Event detail type:', typeof e.detail);
        console.log('Event detail keys:', Object.keys(e.detail));
        console.log('Event detail:', e.detail);

        // Check for route information in different possible locations
        if (e.detail.route) {
            console.log('✅ Found route:', e.detail.route);
            console.log('Route params:', e.detail.route.params);
        } else if (e.detail.$el && e.detail.$el.length) {
            console.log('Checking page element data...');
        } else {
            console.log('❌ No route found in event detail');
        }

        // Try to extract from URL as backup
        const url = window.location.pathname;
        const match = url.match(/\/pages\/(\w+)\/(\w+)/);
        if (match) {
            console.log('🔍 Extracted from URL:', { type: match[1], id: match[2] });
        }
    });

    // Monitor if dexie controller receives events
    document.addEventListener('location.refresh', function(e) {
        console.log('🎯 location.refresh received in app.js debug');

        // Check after a short delay if dexie processed it
        setTimeout(() => {
            const dexieElements = document.querySelectorAll('[data-controller*="dexie"]');
            console.log('🔧 Found dexie controller elements:', dexieElements.length);

            // Check if content was updated
            const locationContent = document.querySelector('[data-survos--js-twig-bundle--dexie-target="content"]');
            if (locationContent) {
                console.log('📄 Dexie content element found, innerHTML length:', locationContent.innerHTML.length);
                console.log('📋 Content preview:', locationContent.innerHTML.substring(0, 200));
            } else {
                console.log('❌ No dexie content target found');
            }
        }, 1000);
    }, { once: false });

    // Test dexie controllers directly
    setTimeout(() => {
        console.log('🧪 Testing dexie controllers...');

        // Find all dexie controller elements
        const dexieElements = document.querySelectorAll('[data-controller*="dexie"]');
        console.log('🔧 Found dexie elements:', dexieElements.length);

        dexieElements.forEach((element, index) => {
            console.log(`📋 Dexie element ${index}:`, {
                controller: element.dataset.controller,
                refreshEvent: element.dataset.survosJsTwigBundleDexieRefreshEventValue,
                store: element.dataset.survosJsTwigBundleDexieStoreValue,
                queries: element.dataset.survosJsTwigBundleDexieQueriesValue
            });
        });

        // Try to manually trigger the location controller
        const locationElements = Array.from(dexieElements).filter(el =>
            el.dataset.survosJsTwigBundleDexieRefreshEventValue === 'location.refresh'
        );

        if (locationElements.length > 0) {
            console.log('🎯 Found location dexie controller, manually triggering...');

            // Create a synthetic event with the correct structure
            const syntheticEvent = new CustomEvent('location.refresh', {
                detail: {
                    route: {
                        params: {
                            page: 'location',
                            id: 'ccj'
                        }
                    }
                }
            });

            document.dispatchEvent(syntheticEvent);
            console.log('🚀 Synthetic location.refresh dispatched');
        }
    }, 2000); // Wait 2 seconds for everything to load

}
