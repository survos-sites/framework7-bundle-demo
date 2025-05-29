<?php

namespace App\Tests;

use Symfony\Component\Panther\PantherTestCase;
use Zenstruck\Browser\Test\HasBrowser;

class PantherTest extends PantherTestCase
{
    use HasBrowser;

    public function testBatsi(): void
    {

        //fw apps listing / home page
        $browser = $this->pantherBrowser()
            ->visit('/')
            ->assertOn('/')
            ->takeScreenshot('home.png');

        //go to batsi en (defaults to locations tab)
        $browser
            ->visit('/en/batsi#tab-locations')
            ->waitUntilVisible("#tab-locations")
            ->waitUntilNotVisible(".gauge")
            ->waitUntilVisible(".custom-list-content")
            ->assertOn('/en/batsi#tab-locations')
            ->takeScreenshot('en.basti.locations.png');

        // click on the 'artists' tab
        $browser
            ->click('#tab-artists') // click on the artists
            ->waitUntilVisible("#tab-artists")
            ->wait(1200)
            ->takeScreenshot('en.basti.artists.png');

        // click on the 'artwork' tab
        $browser->click('Artwork')
            ->waitUntilNotVisible("#tab-artists")
            ->waitUntilVisible("a.tab-link.tab-link-active[href='#tab-obras']")
            ->wait(1200)
            ->takeScreenshot('en.basti.artwork.png');
    }

    public function testBatsiEs(): void
    {
        //go to batsi es (defaults to locations tab)
        $browser = $this->pantherBrowser()
            ->visit('/es/batsi')
            ->waitUntilVisible(".custom-list-content")
            ->assertOn('/es/batsi')
            ->takeScreenshot('es.batsi.locations.png');


        // click on the 'artists' tab
        $browser
            ->click('#tab-artists') // click on the artists
            ->waitUntilVisible("#tab-artists")
            ->wait(1200)
            ->takeScreenshot('es.basti.artists.png');

        // click on the 'artwork' tab
        $browser->click('Obras')
            ->waitUntilNotVisible("#tab-artists")
            ->waitUntilVisible("a.tab-link.tab-link-active[href='#tab-obras']")
            ->wait(1200)
            ->takeScreenshot('es.basti.artwork.png');
    }

}
