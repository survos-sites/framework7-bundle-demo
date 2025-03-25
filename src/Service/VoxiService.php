<?php

declare(strict_types=1);

namespace App\Service;

class VoxiService
{
    public function __construct(
        // from yaml configuration?
        private array $configs = [],
    )
    {
    }

    public function getConfigs(): array
    {

        return $this->configs;
    }
}
