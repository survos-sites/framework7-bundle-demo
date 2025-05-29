<?php

namespace App\Controller;

use App\Tests\PantherTest;
use Roave\BetterReflection\BetterReflection;
use Symfony\Bridge\Twig\Attribute\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use PhpParser\Error;
use PhpParser\ParserFactory;

final class ScreenshotController extends AbstractController
{
    #[Route('/screenshots', name: 'app_screenshots')]
    #[Template('app/screenshots.html.twig')]
    public function index(): array
    {
        $reflection = new \ReflectionClass(PantherTest::class);

        $methods = [];
        $classInfo = (new BetterReflection())
            ->reflector()
            ->reflectClass(PantherTest::class);


        foreach ($classInfo->getMethods() as $method) {
            if (!str_starts_with($method->getName(), 'test')) {
                continue;
            }
            $source = $method->getLocatedSource()->getSource();

            $statements = $this->astWalker($source);

            $content = join("\n", array_slice($statements, $method->getStartLine() + 1, $method->getEndLine() - $method->getStartLine()));
            $php = array_slice($statements, $method->getStartLine() - 1, $method->getEndLine() - $method->getStartLine());
            foreach (explode("\n\n", $content) as $statement) {
                $url = null;
                if (preg_match("/Screenshot\('(.*?)\'\)/", $statement, $matches)) {
                    $url = $matches[1];
                }
                $methods[$method->getName()][] = [
                    'content' => $statement,
                    'url' => $url
                ];
            }
        }

        return [
            'methods' => $methods,
        ];
    }

    /**
     * the better way is to parse the PHP into an AST,
     *
     */
    private function astWalker(string $code): array
    {
        // hacky way:
        // this is hacky and depends on formatting.
        return explode("\n", $code);

        // better is an actual AST parser: https://github.com/nikic/PHP-Parser/blob/master/doc/component/Walking_the_AST.markdown
        $parser = (new ParserFactory())->createForHostVersion();

        try {
            $stmts = $parser->parse($code);
            // $stmts is an array of statement nodes
            foreach ($stmts as $stmt) {
                dump($stmt);
            }
        } catch (Error $e) {
            dd($e);
            echo 'Parse Error: ', $e->getMessage(), "\n";
        }
    }
}
