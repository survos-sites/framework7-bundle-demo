<?php

namespace App\Tests;

use Symfony\Component\Panther\PantherTestCase;
use Zenstruck\Browser\Test\HasBrowser;

class PantherTest extends PantherTestCase
{
    use HasBrowser;

//    public function testSomething(): void
//    {
//        $client = static::createPantherClient();
//        $crawler = $client->request('GET', '/');
//        $this->assertSelectorTextContains('h1', 'Hello World');
//    }

    public function testBatsi(): void
    {
        return;
        // the home page that browses projects (not fw7)
        $browser = $this->pantherBrowser()
            ->visit('/')
            ->assertOn('/')
            ->takeScreenshot('home.png');

        $browser
            ->visit('/en/batsi#tab-locations')
            ->takeScreenshot('basti-locations.png');

        $browser
//            ->waitUntilSeeIn('body', '#tab-artists')
            ->click('#tab-artists') // click on the artists
            ->takeScreenshot('artists.png');

        $browser->click('Artwork')
            ->wait(200) // @todo: wait for the tab 'obras' to be visible in the dom, or the tab to be marked as selected.
            ->takeScreenshot('artwork.png')
        ;

    }

    public function testBatsiEs(): void
    {
        return;
        $waitTime = 1500; // actually, we should wait for an element to appear, after the db is synced.
        // the home page that browses projects (not fw7)
        $browser = $this->pantherBrowser()
            ->visit('/es/batsi')
            ->wait($waitTime)
            ->assertOn('/es/batsi')
//            ->assertSee('Batsi')
            ->takeScreenshot('es.batsi.png');

        $browser->click('Obras')
//            ->wait($waitTime) // @todo: wait for the tab 'obras' to be visible in the dom, or the tab to be marked as selected.
            ->takeScreenshot('artwork.png');
    }

}
