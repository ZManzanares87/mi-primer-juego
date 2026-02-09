import Phaser from 'phaser';

export default class Room extends Phaser.Scene {
    constructor() {
        super({ key: 'Room' }); // Coincide con el nombre del archivo Room.js
        this.player = null;
        this.baseY = 0;
    }

    preload() {
        // 1. Cargamos el fondo de la nave
        this.load.image('room', 'assets/nave.png');
        
        // 2. Cargamos el vaso (Ruta corregida según tu carpeta de objetos)
        this.load.image('vaso_suelo', 'assets/objetos/vaso.png');
        
        // 3. SPRITESHEET PLANTA: Medidas reales de tu imagen (196x250)
        this.load.spritesheet('planta_sheet', 'assets/extras/demoplantasheet.png', { 
            frameWidth: 196, 
            frameHeight: 250 
        });

        // 4. PERSONAJE: Eliminamos 'public/' para que Vite no se líe
        this.load.spritesheet('heroIdle', 'assets/personaje/respirar2.png', { frameWidth: 580, frameHeight: 1062 });
        this.load.spritesheet('heroWalk', 'assets/personaje/andar2.png', { frameWidth: 580, frameHeight: 1062 });
    }

    create() {
        // Lanzamos la escena del inventario en paralelo
        this.scene.launch('InventoryScene');
        
        // Colocamos el fondo
        this.add.image(0, 0, 'room').setOrigin(0);

        // --- LÓGICA PLANTA ---
        // La dibujamos en su sitio original
        this.planta = this.add.sprite(600, 480, 'planta_sheet', 0).setInteractive({ useHandCursor: true });

        // Animación de 5 frames (índices 0, 1, 2, 3, 4)
        this.anims.create({
            key: 'crecer',
            frames: this.anims.generateFrameNumbers('planta_sheet', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: 0
        });

        this.planta.on('pointerdown', () => {
            // Comprobamos si el jugador recogió el vaso
            if (this.registry.get('tieneVaso')) {
                this.planta.play('crecer');
                console.log("¡La planta mutante está creciendo!");
            } else {
                console.log("Necesito regarla con algo... quizá ese vaso de café.");
            }
        });

        // --- LÓGICA VASO ---
        this.vaso = this.add.sprite(150, 520, 'vaso_suelo').setScale(0.7).setInteractive({ useHandCursor: true });
        
        this.vaso.on('pointerdown', () => {
            // Mandamos el aviso al inventario
            this.game.events.emit('COGER_VASO');
            // Quitamos el vaso de la escena
            this.vaso.destroy();
        });

        // --- PERSONAJE ---
        this.player = this.add.sprite(200, 560, 'heroIdle', 0).setOrigin(0.5, 1).setScale(0.3);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Animaciones del héroe
        this.anims.create({ 
            key: 'idle', 
            frames: this.anims.generateFrameNumbers('heroIdle', { start: 0, end: 7 }), 
            frameRate: 8, 
            repeat: -1 
        });
        
        this.anims.create({ 
            key: 'walk', 
            frames: this.anims.generateFrameNumbers('heroWalk', { start: 0, end: 7 }), 
            frameRate: 14, 
            repeat: -1 
        });

        this.player.play('idle');
        this.baseY = this.player.y;
    }

    update() {
        if (!this.player) return;
        const speed = 4;
        let moving = false;

        // Control de movimiento
        if (this.cursors.left.isDown) { 
            this.player.x -= speed; 
            this.player.setFlipX(false); 
            moving = true; 
        } else if (this.cursors.right.isDown) { 
            this.player.x += speed; 
            this.player.setFlipX(true); 
            moving = true; 
        }
        
        if (this.cursors.up.isDown) { 
            this.baseY -= speed; 
            moving = true; 
        } else if (this.cursors.down.isDown) { 
            this.baseY += speed; 
            moving = true; 
        }

        // Cambio de animación según movimiento
        if (moving) {
            if (this.player.anims.currentAnim?.key !== 'walk') this.player.play('walk', true);
        } else {
            if (this.player.anims.currentAnim?.key !== 'idle') this.player.play('idle', true);
        }

        // Limitamos al personaje dentro de la pantalla y el suelo de la nave
        this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
        this.baseY = Phaser.Math.Clamp(this.baseY, 450, 580);
        this.player.y = this.baseY; 
    }
}