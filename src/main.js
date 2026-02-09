import Phaser from 'phaser'

// --- ESCENA DEL INVENTARIO (Se mantiene igual) ---
class InventoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InventoryScene' })
    this.isOpen = false
  }
  preload() {
    this.load.image('inv_icono', '/assets/seleccion_icono.png')
    this.load.image('inv_fondo', '/assets/inventario1.png')
  }
  create() {
    this.panelAbierto = this.add.image(10, 10, 'inv_fondo').setOrigin(0, 0)
    this.panelAbierto.setScale(0.5)
    this.panelAbierto.setVisible(false)
    this.panelAbierto.setInteractive()

    this.botonCerrado = this.add.image(10, 10, 'inv_icono').setOrigin(0, 0)
    this.botonCerrado.setInteractive({ useHandCursor: true })

    this.botonCerrado.on('pointerdown', () => this.abrirInventario())
    this.panelAbierto.on('pointerdown', () => this.cerrarInventario())
  }
  abrirInventario() {
    this.panelAbierto.setVisible(true)
    this.botonCerrado.setVisible(false)
  }
  cerrarInventario() {
    this.panelAbierto.setVisible(false)
    this.botonCerrado.setVisible(true)
  }
}

// --- ESCENA DE LA HABITACIÓN ---
class Room1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Room1' })
    this.player = null
    this.cursors = null
    this.BASE_SCALE = 0.30
    this.baseY = 0
  }

  preload() {
    this.load.image('room', '/assets/room.png')
    this.load.spritesheet('heroIdle', '/assets/personaje/respirar2.png', { frameWidth: 580, frameHeight: 1062 })
    this.load.spritesheet('heroWalk', '/assets/personaje/andar2.png', { frameWidth: 580, frameHeight: 1062 })
  }

  create() {
    this.scene.launch('InventoryScene')
    
    // Añadimos el fondo y guardamos referencia para límites
    const roomBg = this.add.image(0, 0, 'room').setOrigin(0)

    // Ajustamos la cámara a los límites de la imagen de la habitación
    this.cameras.main.setBounds(0, 0, roomBg.width, roomBg.height)

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('heroIdle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    })

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('heroWalk', { start: 0, end: 7 }),
      frameRate: 14,
      repeat: -1
    })

    this.player = this.add.sprite(200, 560, 'heroIdle', 0)
    this.player.setOrigin(0.5, 1) // El "suelo" del personaje es su base
    this.player.setScale(this.BASE_SCALE)
    this.player.play('idle')

    this.baseY = this.player.y
    this.cursors = this.input.keyboard.createCursorKeys()

    this.idleYOffsetByFrame = this.computeBaselineOffsets('heroIdle', 8)
    this.walkYOffsetByFrame = this.computeBaselineOffsets('heroWalk', 8)

    this.player.on('animationupdate', (anim, frame) => {
      const i = frame.index ?? 0
      const offsets = anim.key === 'walk' ? this.walkYOffsetByFrame : this.idleYOffsetByFrame
      this.player.y = this.baseY + (offsets[i] || 0)
    })
  }

  update() {
    if (!this.player || !this.cursors) return
    const speed = 4 // Un poco más rápido para pantallas grandes
    let moving = false

    if (this.cursors.left.isDown) {
      this.player.x -= speed
      this.player.setFlipX(false)
      moving = true
    } else if (this.cursors.right.isDown) {
      this.player.x += speed
      this.player.setFlipX(true)
      moving = true
    }

    // LÍMITES VERTICALES: Para que no "vuele" al cielo ni se salga por abajo
    // Ajusta el 450 y 580 según donde esté el suelo en tu dibujo 'room.png'
    if (this.cursors.up.isDown) {
      this.baseY -= speed
      moving = true
    } else if (this.cursors.down.isDown) {
      this.baseY += speed
      moving = true
    }

    if (moving) {
      if (this.player.anims.currentAnim?.key !== 'walk') this.player.play('walk', true)
    } else {
      if (this.player.anims.currentAnim?.key !== 'idle') this.player.play('idle', true)
    }

    // LIMITAR MOVIMIENTO (Constraints)
    // X: Entre 50 y 750 (para que no se pegue al borde)
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750)
    
    // Y: Aquí limitas el "suelo". 
    // Suponiendo que tu suelo está entre la Y=400 y Y=580 de tu imagen
    this.baseY = Phaser.Math.Clamp(this.baseY, 400, 580)
  }

  // ... (se mantiene computeBaselineOffsets igual)
  computeBaselineOffsets(textureKey, frameCount) {
    const tex = this.textures.get(textureKey)
    const offsets = new Array(frameCount).fill(0)
    const canvas = document.createElement('canvas')
    canvas.width = tex.source[0].width
    canvas.height = tex.source[0].height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(tex.source[0].image, 0, 0)
    const baselines = []
    for (let i = 0; i < frameCount; i++) {
      const frame = tex.get(i)
      const fx = frame.cutX; const fy = frame.cutY; const fw = frame.cutWidth; const fh = frame.cutHeight
      const img = ctx.getImageData(fx, fy, fw, fh).data
      let bottom = -1
      for (let y = fh - 1; y >= 0; y--) {
        for (let x = 0; x < fw; x++) {
          const a = img[(y * fw + x) * 4 + 3]
          if (a > 0) { bottom = y; break }
        }
        if (bottom !== -1) break
      }
      baselines.push(bottom === -1 ? fh - 1 : bottom)
    }
    const target = Math.max(...baselines)
    for (let i = 0; i < frameCount; i++) { offsets[i] = target - baselines[i] }
    return offsets
  }
}

// --- CONFIGURACIÓN ACTUALIZADA PARA PANTALLA ---
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT, // Ajusta el juego a la ventana
    autoCenter: Phaser.Scale.CENTER_BOTH // Lo centra en el navegador
  },
  roundPixels: true,
  scene: [Room1, InventoryScene]
})