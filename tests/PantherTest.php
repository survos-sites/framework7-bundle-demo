<?php

namespace App\Tests;

use Symfony\Component\Panther\PantherTestCase;
use Zenstruck\Browser\Test\HasBrowser;

class PantherTest extends PantherTestCase
{
    use HasBrowser;

    public function testChijal(): void
    {

        //fw apps listing / home page
        $browser = $this->pantherBrowser()
            ->visit('/')
            ->assertOn('/')
            ->takeScreenshot('home.png');

        //go to Chijal in English (defaults to locations tab)
        $browser
            ->visit('/en/chijal#tab-locations')
            ->waitUntilVisible("#tab-locations")
            ->waitUntilNotVisible(".gauge")
            ->waitUntilVisible(".custom-list-content")
            ->assertOn('/en/chijal#tab-locations')
            ->takeScreenshot('en.chijal.locations.png');

        // click on the 'artists' tab
        $browser
            ->click('#tab-artists') // click on the artists
            ->waitUntilVisible("#tab-artists")
            ->wait(1200)
            ->takeScreenshot('en.chijal.artists.png');

        // click on the 'artwork' tab
        $browser->client()->executeScript(
            "document.querySelector(\"a.tab-link[href='#tab-obras']\").click();"
        );
        $browser
            ->waitUntilNotVisible("#tab-artists")
            ->waitUntilVisible("a.tab-link.tab-link-active[href='#tab-obras']")
            ->wait(1200)
            ->takeScreenshot('en.chijal.artwork.png');
    }

    public function testChijalEs(): void
    {
        //go to Chijal in Spanish (defaults to locations tab)
        $browser = $this->pantherBrowser()
            ->visit('/es/chijal')
            ->waitUntilVisible(".custom-list-content")
            ->assertOn('/es/chijal')
            ->takeScreenshot('es.chijal.locations.png');


        // click on the 'artists' tab
        $browser
            ->click('#tab-artists') // click on the artists
            ->waitUntilVisible("#tab-artists")
            ->wait(1200)
            ->takeScreenshot('es.chijal.artists.png');

        // click on the 'artwork' tab
        $browser->client()->executeScript(
            "document.querySelector(\"a.tab-link[href='#tab-obras']\").click();"
        );
        $browser
            ->waitUntilNotVisible("#tab-artists")
            ->waitUntilVisible("a.tab-link.tab-link-active[href='#tab-obras']")
            ->wait(1200)
            ->takeScreenshot('es.chijal.artwork.png');
    }

}
