import Phaser from 'phaser';

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
        this.objetosEnInventario = [];
    } 

    preload() {
        this.load.image('inv_icono', 'assets/seleccion_icono.png');
        this.load.image('inv_fondo', 'assets/inventario1.png');
        // USAMOS LA RUTA CORRECTA QUE CONFIRMAMOS
        this.load.image('vaso_inv', 'assets/objetos/vaso.png'); 
    }

    create() {
        // Panel del inventario (empieza invisible)
        this.panelAbierto = this.add.image(10, 10, 'inv_fondo').setOrigin(0, 0).setScale(0.5).setVisible(false).setInteractive();
        
        // Botón para abrir el inventario
        this.botonCerrado = this.add.image(10, 10, 'inv_icono').setOrigin(0, 0).setInteractive({ useHandCursor: true });

        // ESCUCHA EL EVENTO: Cuando en Room.js haces emit('COGER_VASO')
        this.game.events.on('COGER_VASO', () => {
            // 1. Guardamos en el registro global para que la planta lo sepa
            this.registry.set('tieneVaso', true);

            // 2. Creamos el icono dentro del inventario
            // Lo ponemos en una posición relativa al panel (ej: x: 65, y: 65)
            const vasoIcono = this.add.image(65, 65, 'vaso_inv').setScale(0.6);
            
            // 3. Muy importante: Si el panel está cerrado, el icono también debe ser invisible
            vasoIcono.setVisible(this.panelAbierto.visible);
            
            // 4. Lo guardamos en nuestra lista para poder ocultarlo/mostrarlo luego
            this.objetosEnInventario.push(vasoIcono);
            
            console.log("Vaso añadido al inventario visual");
        });

        // Eventos para abrir y cerrar
        this.botonCerrado.on('pointerdown', () => this.alternar(true));
        this.panelAbierto.on('pointerdown', () => this.alternar(false));
    }

    alternar(abrir) {
        this.panelAbierto.setVisible(abrir);
        this.botonCerrado.setVisible(!abrir);
        
        // Hacemos que todos los objetos recogidos sigan el estado del panel
        this.objetosEnInventario.forEach(obj => {
            obj.setVisible(abrir);
        });
    }
}