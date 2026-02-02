import Phaser from 'phaser'

class Room1 extends Phaser.Scene {
  constructor() {
    super()
    this.player = null
    this.cursors = null
    this.breatheTween = null
  }

  preload() {
    // Fondo
    this.load.image('room', '/assets/room.png')

    // Spritesheets (8 columnas x 1 fila)
    this.load.spritesheet('heroIdle', '/assets/personaje/respirar.png', {
      frameWidth: 218,
      frameHeight: 400
    })

    this.load.spritesheet('heroWalk', '/assets/personaje/andar.png', {
      frameWidth: 218,
      frameHeight: 400
    })
  }

  create() {
    // Fondo
    this.add.image(0, 0, 'room').setOrigin(0)

    // =========================
    // ANIMACIONES
    // =========================

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('heroIdle', {
        start: 0,
        end: 7   // 8 frames → 0 a 7
      }),
      frameRate: 8,
      repeat: -1
    })

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('heroWalk', {
        start: 0,
        end: 7
      }),
      frameRate: 14,
      repeat: -1
    })

    // =========================
    // PERSONAJE
    // =========================

    this.player = this.add.sprite(200, 560, 'heroIdle', 0)
    this.player.setOrigin(0.5, 1)
    this.player.setScale(0.6)
    this.player.play('idle')

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys()

    // Respiración suave
    this.startBreathe()
  }

  update() {
    if (!this.player || !this.cursors) return

    const speed = 2.6
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

    // Si quieres mantener movimiento vertical, lo dejas
    if (this.cursors.up.isDown) {
      this.player.y -= speed
      moving = true
    } else if (this.cursors.down.isDown) {
      this.player.y += speed
      moving = true
    }

    // Cambiar animación
    if (moving) {
      if (this.player.anims.currentAnim?.key !== 'walk') {
        this.player.play('walk', true)
      }
      this.stopBreathe()
    } else {
      if (this.player.anims.currentAnim?.key !== 'idle') {
        this.player.play('idle', true)
      }
      this.startBreathe()
    }

    // límites pantalla
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800)
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, 600)
  }

  // =========================
  // RESPIRAR
  // =========================

  startBreathe() {
    if (this.breatheTween) return

    this.breatheTween = this.tweens.add({
      targets: this.player,
      y: this.player.y - 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  stopBreathe() {
    if (!this.breatheTween) return
    this.breatheTween.stop()
    this.breatheTween = null
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: Room1
})
