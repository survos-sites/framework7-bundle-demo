export default (
[
    {
        path: '/',
        url: './',
    },
    {
        path: '/pages/about',
        url: './pages/about', // this is the Symfony route, we can combine this
    },
    {
        path: '/pages/settings',
        url: './pages/settings', // this is the Symfony route, we can combine this
    },
    {
        path: '/pages/map',
        componentUrl: './pages/map',
    },
    {
        path: '/pages/form',
        // url: './pages/form',
        componentUrl: './pages/form',
    },
    {
        path: '/pages/product/:id',
        componentUrl: './pages/product',
    },
    {
        path: '/pages/:page/:id',
        url: './pages/{{page}}',
        // componentUrl: './pages/obra',
    },
    {
        path: '/pages/:page',
        url: './pages/{{page}}',
        // componentUrl: './pages/obra',
    },
    {
        path: '/settings/',
        url: './pages/settings',
    },

    {
        path: '/dynamic-route/blog/:blogId/post/:postId/',
        componentUrl: './pages/dynamic-route.html',
    },
    {
        path: '/request-and-load/user/:userId/',
        async: function ({ router, to, resolve }) {
            // App instance
            var app = router.app;

            // Show Preloader
            app.preloader.show();

            // User ID from request
            var userId = to.params.userId;

            // Simulate Ajax Request
            setTimeout(function () {
                // We got user data from request
                var user = {
                    firstName: 'Vladimir',
                    lastName: 'Kharlampidi',
                    about: 'Hello, i am creator of Framework7! Hope you like it!',
                    links: [
                        {
                            title: 'Framework7 Website',
                            url: 'http://framework7.io',
                        },
                        {
                            title: 'Framework7 Forum',
                            url: 'http://forum.framework7.io',
                        },
                    ]
                };
                // Hide Preloader
                app.preloader.hide();

                // Resolve route to load page
                resolve(
                    {
                        componentUrl: './pages/request-and-load.html',
                    },
                    {
                        props: {
                            user: user,
                        }
                    }
                );
            }, 1000);
        },
    },
    {
        path: '/catalog',
        componentUrl: '/catalog',
    },
    {
        path: '/app/details/:object/:id',
        url: '/app/details/{{object}}/{{id}}',
    },
    // Default route (404 page). MUST BE THE LAST
    {
        path: '(.*)',
        //url: './pages/404.html',
        async : function ({ app, router, to, resolve }) {
            resolve({
                url: './pages/404.html'
            });
        }
    },
]);
