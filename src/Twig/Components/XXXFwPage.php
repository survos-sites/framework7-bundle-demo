<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent]
final class FwPage
{
    public string $caller;
    public ?string $name=null;
    public ?string $title=null;

    public function mount(string $caller): void
    {
        $baseName = pathinfo($caller, PATHINFO_FILENAME);
        if (!$this->name) {
            $this->name = $baseName;
        }
        if (!$this->title) {
            $this->title = strtoupper($baseName);
        }
    }
}
