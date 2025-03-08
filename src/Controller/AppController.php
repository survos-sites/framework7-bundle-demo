<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class AppController extends AbstractController
{
    #[Route('/', name: 'app_homepage')]
    public function homepage(): Response
    {
        return $this->render('app/index.html.twig', [
            'controller_name' => 'AppController',
        ]);
    }

//    #[Route('/pages/settings.html', name: 'app_settings', priority: 500)]
//    public function settings(): Response
//    {
//        return $this->render('pages/settings.html.twig', [
//
//        ]);
//    }

    #[Route('/pages/{page}.html', name: 'app_page', priority: 400)]
    public function page(string $page): Response
    {
        return $this->render("pages/$page.html", [

        ]);
    }
}
