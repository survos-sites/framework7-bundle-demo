<?php

namespace App\Tests\Crawl;

use PHPUnit\Framework\Attributes\TestDox;
use PHPUnit\Framework\Attributes\TestWith;
use Survos\CrawlerBundle\Tests\BaseVisitLinksTest;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CrawlAsVisitorTest extends BaseVisitLinksTest
{
	#[TestDox('/$method $url ($route)')]
	#[TestWith(['', '/', 200])]
	#[TestWith(['', '/screenshots', 200])]
	#[TestWith(['', '/login', 200])]
	#[TestWith(['', 'en/batsi', 200])]
	#[TestWith(['', 'es/batsi', 200])]
	#[TestWith(['', '/en/batsi', 200])]
	#[TestWith(['', 'en/modo', 200])]
	#[TestWith(['', 'es/modo', 200])]
	#[TestWith(['', '/en/modo', 200])]
	#[TestWith(['', 'en/cmas', 200])]
	#[TestWith(['', 'es/cmas', 200])]
	#[TestWith(['', '/en/cmas', 200])]

    #[TestWith(['GET', '/js/routing', 'fos_js_routing_js'])]
    #[TestWith(['GET', '/auth/profile', 'oauth_profile'])]
    #[TestWith(['GET', '/auth/providers', 'oauth_providers'])]
    #[TestWith(['GET', '/admin/commands/', 'survos_commands'])]
    #[TestWith(['GET', '/crawler/crawlerdata', 'survos_crawler_data'])]
    #[TestWith(['GET', '/basic', 'app_basic'])]
    #[TestWith(['GET', '/', 'app_index'])]
    #[TestWith(['GET', '/screenshots', 'app_screenshots'])]
    #[TestWith(['GET', '/login', 'app_login'])]
    #[TestWith(['GET', '/logout', 'app_logout'])]

	public function testRoute(string $username, string $url, string|int|null $expected): void
	{
		parent::testWithLogin($username, $url, (int)$expected);
	}
}
