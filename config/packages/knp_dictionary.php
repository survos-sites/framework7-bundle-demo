<?php

declare(strict_types=1);

use App\Entity\Catalog;
use App\Entity\Member;
use App\Entity\Owner;
use App\Entity\Sheet;
use App\Entity\Spreadsheet;
use App\Service\ProjectService;
use Survos\PixieBundle\Entity\Category;
use Survos\PixieBundle\Entity\Core;
use Survos\PixieBundle\Entity\CoreInterface;
use Survos\PixieBundle\Entity\Field\CategoryField;
use Survos\PixieBundle\Entity\Field\Field;
use Survos\PixieBundle\Entity\FieldMap;
use Survos\PixieBundle\Entity\Project;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $containerConfigurator): void {
    $containerConfigurator->extension('knp_dictionary', [
        'dictionaries' => [
            'tab_icons' => [
                'type' => 'key_value',
                'content' => [
                    'info' => 'tabler:info-circle',
                    'map' => 'tabler:map',
                    'share' > 'tabler:qrcode',
        'locations' =>  'tabler:list',
        'artists' => 'openmoji:artist',
        'obras' => 'game-icons:porcelain-vase',
                ]
            ],

        ],
    ]);
};
