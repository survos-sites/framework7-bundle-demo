<?php

namespace App\Menu;

use Survos\FwBundle\Event\KnpMenuEvent;
use Survos\FwBundle\Menu\KnpMenuHelperInterface;
use Survos\FwBundle\Menu\KnpMenuHelperTrait;
use Survos\FwBundle\Menu\MenuService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

// events are
/*
// #[AsEventListener(event: KnpMenuEvent::NAVBAR_MENU2)]
#[AsEventListener(event: KnpMenuEvent::SIDEBAR_MENU, method: 'sidebarMenu')]
#[AsEventListener(event: KnpMenuEvent::PAGE_MENU, method: 'pageMenu')]
#[AsEventListener(event: KnpMenuEvent::FOOTER_MENU, method: 'footerMenu')]
#[AsEventListener(event: KnpMenuEvent::AUTH_MENU, method: 'appAuthMenu')]
*/

final class AppMenu implements KnpMenuHelperInterface
{
    use KnpMenuHelperTrait;

    public function __construct(
        #[Autowire('%kernel.environment%')] protected string $env,
        private ?MenuService $menuService=null,
        private ?Security $security=null,
        private ?AuthorizationCheckerInterface $authorizationChecker = null
    ) {
    }

    public function appAuthMenu(KnpMenuEvent $event): void
    {
        $menu = $event->getMenu();
        $this->menuService->addAuthMenu($menu);
    }

    #[AsEventListener(event: KnpMenuEvent::MOBILE_PAGE_MENU)]
    public function pageMenu(KnpMenuEvent $event): void
    {
        $menu = $event->getMenu();
        $this->add($menu, id: 'about', icon: 'fa-info');
    }

    #[AsEventListener(event: KnpMenuEvent::MOBILE_TAB_MENU)]
    public function tabMenu(KnpMenuEvent $event): void
    {
        $menu = $event->getMenu();
        // the id is for getting the template directly in app/{id} during SPA, the route is for testing.  both are needed.
        //$this->add($menu, id: 'about', route: 'app_about', label: 'about', icon: 'tabler:help');
        //$this->add($menu, id: 'products', label: 'products', icon: 'tabler:list');
        
        $this->add($menu, id: 'map',route: "app_map", label: 'Map', icon: 'tabler:list');
        $this->add($menu, id: 'catalog',route: "app_catalog", label: 'Catalog D', icon: 'tabler:list');


    }
}
