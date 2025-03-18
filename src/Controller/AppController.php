<?php

namespace App\Controller;

use Knp\Menu\FactoryInterface;
use Survos\FwBundle\Event\KnpMenuEvent;
use Symfony\Bridge\Twig\Attribute\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Routing\Attribute\Route;

final class AppController extends AbstractController
{
    public function __construct(
        private EventDispatcherInterface $eventDispatcher,
        protected FactoryInterface $factory,
    )
    {

    }
    #[Route('/basic', name: 'app_basic')]
    #[Template('examples/basic.html.twig')]
    public function basic(): Response|array
    {
        return [];
    }

    #[Route('/home', name: 'app_homepage')]
    public function homepage(): Response
    {
        return $this->render('app/index.html.twig', [
            'controller_name' => 'AppController',
        ]);
    }

//    #[Route('/about', name: 'app_about')]
//    #[Template('app/about.html.twig')]
//    public function about(): Response|array
//    {
//        return [];
//    }

    #[Route('/', name: 'app_index', options: ['expose' => true], methods: ['GET'])]
    public function mobile(Request $request): Response
    {

        $templates = [];
        // iterate through the page and tab routes to create templates, which will be rendered in the main page.
        $menu = $this->factory->createItem($options['name'] ?? KnpMenuEvent::class);
        foreach ([KnpMenuEvent::MOBILE_TAB_MENU  => 'tab',
//                     KnpMenuEvent::MOBILE_PAGE_MENU => 'page',
                     KnpMenuEvent::MOBILE_UNLINKED_MENU => 'page',
                 ] as $eventName=>$type) {
            $options = [];
            $options = (new OptionsResolver())
                ->setDefaults([

                ])
                ->resolve($options);
            $this->eventDispatcher->dispatch(new KnpMenuEvent($menu, $this->factory, $options), $eventName);
            foreach ($menu->getChildren() as $route=>$child) {
                try {
                    $template = "pages/$route.html.twig";
                    $params = [
                        'type' => $type,
                        'route' => $route,
                        'template' => $template,
                        'debug' => $request->get('debug', false),
                    ];
//                    $templates[$route]  = $this->twig->render($template, $params);
                    $templates[$route] = $this->renderView($template, $params);
                } catch (\Exception $e) {
                    dd($route, $template, $e->getMessage(), $e);
                }
            }
        }
//        dd($templates);
        return $this->render('@SurvosFw/start.html.twig', [
            'templates' => $templates,
            'playNow' => $request->get('playNow', true),
        ]);
    }


//    #[Route('/pages/settings.html', name: 'app_settings', priority: 500)]
//    public function settings(): Response
//    {
//        return $this->render('pages/settings.html.twig', [
//
//        ]);
//    }

    #[Route('/pages/{page}', name: 'app_page', priority: 400)]
    public function page(string $page): Response
    {
        return $this->render("pages/$page.html.twig", [

        ]);
    }

    #[Route('/app/details/{object}/{id}', name: 'app_details', priority: 400)]
    public function details($object,$id): Response
    {
        return $this->render("pages/about.html.twig", [

        ]);
    }

//    #[Route('/catalog', name: 'app_catalog')]
//    public function catalog(): Response
//    {
//
//        return $this->render('app/catalog.html.twig', [
//            //'controller_name' => 'AppController',
//            //'products' => $products,
//        ]);
//    }


}
