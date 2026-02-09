import Phaser from 'phaser';

// El punto '.' significa "busca en la carpeta donde estoy (src)"
// Luego entra en 'scene' y busca el archivo
import Room from './scene/Room.js'; 
import InventoryScene from './scene/InventoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 980,
    
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    roundPixels: true,
    scene: [Room, InventoryScene]
};

new Phaser.Game(config);