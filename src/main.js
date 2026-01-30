import Phaser from 'phaser'

// ✅ IMPORTA LOS FRAMES (Vite los empaqueta)
import frame01 from '/Users/usuario/Code-Lab/juegos/mi-primer-juego/src/aseet/frame01.png'
import frame02 from '/Users/usuario/Code-Lab/juegos/mi-primer-juego/src/aseet/frame02.png'
import frame03 from '/Users/usuario/Code-Lab/juegos/mi-primer-juego/src/aseet/frame03.png'

class Room1 extends Phaser.Scene {
  constructor() {
    super()
    this.keys = []
    this.selectedKey = null

    this.player = null
    this.cursors = null
  }

  preload() {
    this.load.image('room', '/assets/room.jpg')

    // ✅ Cargamos cada frame como imagen independiente
    this.load.image('capitan_01', frame01)
    this.load.image('capitan_02', frame02)
    this.load.image('capitan_03', frame03)
  }

  create() {
    // 🔄 Cargar estado
    this.keys = JSON.parse(localStorage.getItem('keys')) || []
    this.selectedKey = localStorage.getItem('selectedKey')

    // Fondo
    this.add.image(0, 0, 'room').setOrigin(0)

    // Texto
    this.text = this.add.text(40, 40, '', {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: 720 }
    })

    this.updateText('Estás en la habitación.')

    // ---------- PUERTA ----------
    this.add.rectangle(570, 50, 150, 300).setOrigin(0)

    const door = this.add
      .rectangle(600, 150, 150, 300, 0x00ff00, 0.001)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })

    door.on('pointerdown', () => {
      if (this.selectedKey === 'key2') {
        this.updateText('La llave correcta abre la puerta.')
      } else if (this.selectedKey) {
        this.updateText('Esta llave no sirve.')
      } else {
        this.updateText('Necesitas una llave.')
      }
    })

    // ---------- LLAVE 1 ----------
    if (!this.keys.includes('key1')) this.createKey(200, 400, 'key1')

    // ---------- LLAVE 2 (la buena) ----------
    if (!this.keys.includes('key2')) this.createKey(300, 400, 'key2')

    // ---------- SELECTOR ----------
    this.selector = this.add.text(40, 520, '', {
      fontSize: '16px',
      color: '#aaaaaa'
    })
    this.updateSelector()

    // =========================
    // 👤 PERSONAJE (ANIMACIÓN FRAMES SUELTOS)
    // =========================

    // Creamos animación usando frames sueltos (cada uno es una textura)
    this.anims.create({
      key: 'capitan-walk',
      frames: [
        { key: 'capitan_01' },
        { key: 'capitan_02' },
        { key: 'capitan_03' },
        { key: 'capitan_02' } // 👈 para que haga loop más suave
      ],
      frameRate: 8,
      repeat: -1
    })

    // Sprite: empieza con el primer frame
    this.player = this.add.sprite(140, 500, 'capitan_01')
    this.player.setOrigin(0.5, 1)
    this.player.setDepth(999)
    this.player.setScale(0.6) // AJUSTA si lo ves grande/pequeño

    this.player.play('capitan-walk')

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  update() {
    if (!this.player || !this.cursors) return

    const speed = 2.2
    let moving = false

    if (this.cursors.left.isDown) {
      this.player.x -= speed
      this.player.setFlipX(true)
      moving = true
    } else if (this.cursors.right.isDown) {
      this.player.x += speed
      this.player.setFlipX(false)
      moving = true
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed
      moving = true
    } else if (this.cursors.down.isDown) {
      this.player.y += speed
      moving = true
    }

    // Si no se mueve: lo dejo quieto en el frame 1
    if (!moving) {
      this.player.anims.stop()
      this.player.setTexture('capitan_01')
    } else {
      if (!this.player.anims.isPlaying) this.player.play('capitan-walk')
    }

    // límites pantalla
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800)
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 600)
  }

  createKey(x, y, id) {
    this.add
      .rectangle(x, y, 60, 30)
      .setOrigin(0)
      .setStrokeStyle(2, 0xffffff)

    const key = this.add
      .rectangle(x, y, 60, 30, 0xff0000, 0.001)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })

    key.on('pointerdown', () => {
      this.keys.push(id)
      this.selectedKey = id

      localStorage.setItem('keys', JSON.stringify(this.keys))
      localStorage.setItem('selectedKey', id)

      this.updateText(`Coges ${id}.`)
      this.updateSelector()
      key.destroy()
    })
  }

  updateText(message) {
    this.text.setText(
      `${message}\n\nLlaves: ${this.keys.join(', ') || 'ninguna'}\nSeleccionada: ${this.selectedKey || 'ninguna'}`
    )
  }

  updateSelector() {
    if (this.keys.length === 0) {
      this.selector.setText('')
      return
    }

    this.selector.setText('Click aquí para cambiar llave')
    this.selector.setInteractive({ useHandCursor: true })

    this.selector.once('pointerdown', () => {
      const index = this.keys.indexOf(this.selectedKey)
      const next = (index + 1) % this.keys.length
      this.selectedKey = this.keys[next]

      localStorage.setItem('selectedKey', this.selectedKey)
      this.updateText('Cambias la llave seleccionada.')
      this.updateSelector()
    })
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Room1
})
