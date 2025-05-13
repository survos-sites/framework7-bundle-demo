<?php

namespace App\Controller;

use Knp\Menu\FactoryInterface;
use Survos\FwBundle\Event\KnpMenuEvent;
use Survos\FwBundle\Service\FwService;
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
        private FwService $fwService,
    )
    {

    }

    #[Route('/', name: 'app_index', options: ['expose' => true], methods: ['GET'])]
    #[Route('/', name: 'app_homepage', options: ['expose' => true], methods: ['GET'])]
    #[Template('app/index.html.twig')]
    public function mobile(Request $request): Response|array
    {
        $configs = $this->fwService->getConfigs();
        return [
            'configs' => $configs,
        ];
    }




    #[Route('/{_locale}/{configCode}', name: 'project_start', options: ['expose' => true], methods: ['GET'])]
    public function project(Request $request, string $configCode): Response
    {
        $templates = [];
        // iterate through the page and tab routes to create templates, which will be rendered in the main page.
        $menu = $this->factory->createItem($options['name'] ?? KnpMenuEvent::class);
        foreach ([
            KnpMenuEvent::MOBILE_TAB_MENU  => 'tab',
//                     KnpMenuEvent::MOBILE_PAGE_MENU => 'page',
                     KnpMenuEvent::MOBILE_UNLINKED_MENU => 'page',
                 ] as $eventName=>$type) {
            $options = [];
            $options = (new OptionsResolver())
                ->setDefaults([

                ])
                ->resolve($options);
            $this->eventDispatcher->dispatch(new KnpMenuEvent($menu, $this->factory, options: $options, configCode: $configCode), $eventName);
            foreach ($menu->getChildren() as $route=>$child) {
                    $template = "pages/$route.html.twig";
                    $params = [
                        'configCode' => $configCode,
                        'config' => $this->fwService->getConfigs()[strtolower($configCode)],
                        'type' => $type,
                        'route' => $route,
                        'template' => $template,
                        'debug' => $request->get('debug', false),
                    ];
//                    $templates[$route]  = $this->twig->render($template, $params);
                    $templates[$route] = $this->renderView($template, $params);
                try {
                } catch (\Exception $e) {
                    dd($route, $template, $e->getMessage(), $e);
                }
            }
        }
//        dd($templates);

        return $this->render('@SurvosFw/start.html.twig', [
            'templates' => $templates,
            'appConfig' => $this->fwService->getConfig(),
            'config' => $this->fwService->getConfigs()[strtolower($configCode)],
            'locale' => $request->getLocale(),
            'configCode' => $configCode,
            'tabs' => ['tabs']??['info'],
            'playNow' => $request->get('playNow', true),
            ''
        ]);
    }


//    #[Route('/pages/settings.html', name: 'app_settings', priority: 500)]
//    public function settings(): Response
//    {
//        return $this->render('pages/settings.html.twig', [
//
//        ]);
//    }

    #[Route('/{_locale}/pages/{page}', name: 'app_page', priority: 400, defaults: ['_locale' => 'en'])]
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
