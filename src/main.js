import Phaser from 'phaser'

class Room1 extends Phaser.Scene {
  constructor() {
    super()
    this.player = null
    this.cursors = null
    this.breatheTween = null

    // 🔧 Con frames 580x1062, 0.6 es gigante. Ajusta a gusto.
    this.BASE_SCALE = 0.30

    this.baseY = 0

    // offsets calculados para que el “suelo” no baile
    this.idleYOffsetByFrame = new Array(8).fill(0)
    this.walkYOffsetByFrame = new Array(8).fill(0)
  }

  preload() {
    this.load.image('room', '/assets/room.png')

    // ✅ NUEVOS SHEETS: 4640x1062 => 8 frames => 580x1062
    this.load.spritesheet('heroIdle', '/assets/personaje/respirar2.png', {
      frameWidth: 580,
      frameHeight: 1062
    })

    this.load.spritesheet('heroWalk', '/assets/personaje/andar2.png', {
      frameWidth: 580,
      frameHeight: 1062
    })
  }

  create() {
    this.add.image(0, 0, 'room').setOrigin(0)

    // Animaciones
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

    // Player
    this.player = this.add.sprite(200, 560, 'heroIdle', 0)
    this.player.setOrigin(0.5, 1)
    this.player.setScale(this.BASE_SCALE)
    this.player.play('idle')

    this.baseY = this.player.y

    this.cursors = this.input.keyboard.createCursorKeys()

    // Calcula offsets de suelo (idle y walk) una vez
    this.idleYOffsetByFrame = this.computeBaselineOffsets('heroIdle', 8)
    this.walkYOffsetByFrame = this.computeBaselineOffsets('heroWalk', 8)

    // Aplica corrección de Y en cada frame renderizado
    this.player.on('animationupdate', (anim, frame) => {
      const i = frame.index ?? 0
      const offsets = anim.key === 'walk' ? this.walkYOffsetByFrame : this.idleYOffsetByFrame
      this.player.y = this.baseY + (offsets[i] || 0)

      // evita subpixeles
      this.player.x = Math.round(this.player.x)
      this.player.y = Math.round(this.player.y)
    })

    // Respiración (solo escala, no toca Y)
    this.startBreathe()
  }

  update() {
    if (!this.player || !this.cursors) return

    const speed = 2.6
    let moving = false

    // movimiento X
    if (this.cursors.left.isDown) {
      this.player.x -= speed

      // ✅ si al andar te va al revés, invierte estos 2
      this.player.setFlipX(false)

      moving = true
    } else if (this.cursors.right.isDown) {
      this.player.x += speed
      this.player.setFlipX(true)
      moving = true
    }

    // movimiento Y opcional
    if (this.cursors.up.isDown) {
      this.baseY -= speed
      moving = true
    } else if (this.cursors.down.isDown) {
      this.baseY += speed
      moving = true
    }

    // Animación + respiración
    if (moving) {
      if (this.player.anims.currentAnim?.key !== 'walk') this.player.play('walk', true)
      this.stopBreathe()
    } else {
      if (this.player.anims.currentAnim?.key !== 'idle') this.player.play('idle', true)
      this.startBreathe()
    }

    // límites (x y baseY)
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, 800)
    this.baseY = Phaser.Math.Clamp(this.baseY, 0, 600)
  }

  // Respirar (solo escala)
  startBreathe() {
    if (this.breatheTween) return
    this.player.setScale(this.BASE_SCALE)

    this.breatheTween = this.tweens.add({
      targets: this.player,
     
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
    this.player.setScale(this.BASE_SCALE)
  }

  /**
   * Calcula offsets por frame para alinear el “suelo” (alpha>0 más bajo)
   */
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
      const fx = frame.cutX
      const fy = frame.cutY
      const fw = frame.cutWidth
      const fh = frame.cutHeight

      const img = ctx.getImageData(fx, fy, fw, fh).data

      let bottom = -1
      for (let y = fh - 1; y >= 0; y--) {
        for (let x = 0; x < fw; x++) {
          const a = img[(y * fw + x) * 4 + 3]
          if (a > 0) {
            bottom = y
            break
          }
        }
        if (bottom !== -1) break
      }

      baselines.push(bottom === -1 ? fh - 1 : bottom)
    }

    const target = Math.max(...baselines)

    for (let i = 0; i < frameCount; i++) {
      offsets[i] = target - baselines[i]
    }

    console.log(textureKey, { baselines, offsets, target })

    return offsets
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  roundPixels: true,
  scene: Room1
})
