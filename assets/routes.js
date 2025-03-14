

export default (
[
    {
        path: '/',
        url: './index',
    },
    {
        path: '/about',
        url: './pages/about', // this is the Symfony route, we can combine this
    },
    {
        path: '/map',
        componentUrl: './pages/map',
    },
    {
        path: '/form',
        // url: './pages/form',
        componentUrl: './pages/form',
    },
    // {
    //     path: '/catalog/',
    //     componentUrl: './pages/catalog.html',
    // },
    {
        path: '/product/:id/',
        componentUrl: './pages/product',
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
    // Default route (404 page). MUST BE THE LAST
    // {
    //     path: '(.*)',
    //     //url: './pages/404.html',
    //     async : function ({ app, router, to, resolve }) {
    //         // Requested route
    //         console.log('asking for');
    //         console.log(to.path);
    //         // Get external data and return page content
    //         fetch('https://fw.wip' + to.path)
    //             .then((res) => {
    //                 if (res.status === 404) {
    //                     resolve({
    //                         url: './pages/404.html'
    //                     });
    //                 } else {
    //                     return res.text().then(function (data) {
    //                         resolve({
    //                             componentUrl:'https://fw.wip' + to.path
    //                         });
    //                     });
    //                 }
    //             });
    //     }
    // },
]);
