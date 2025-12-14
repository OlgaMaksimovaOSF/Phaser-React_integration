import Phaser from "phaser";

let crosshairBody = null;
const radius = 18;

const createTarget = (scene, x, y, size, color, stroke) => {
    const square = scene.add.rectangle(x, y, size, size, color);
    square.setStrokeStyle(2, stroke);
    scene.physics.add.existing(square);
    square.body.setCollideWorldBounds(true);
    square.body.setBounce(1, 1);
    return square;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '0x';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.crosshair = null;
        this.crosshairTarget = { 
            x: 0,
            y: 0
        };
        this.targets = [];
    }

    preload() {}

    create() {
        const startX = this.scale.width / 2;
        const startY = this.scale.height / 2;
        this.crosshair = this.add.circle(
            startX,
            startY,
            radius,
            0xffffff,
            0.3
        );
        this.crosshair.setStrokeStyle(2, 0xffffff);
        this.crosshairTarget.x = startX;
        this.crosshairTarget.y = startY;


        this.physics.add.existing(this.crosshair);
        crosshairBody = this.crosshair.body;
        crosshairBody.setCircle(radius);
        crosshairBody.setCollideWorldBounds(true);
        

        for (let i = 0; i < 5; i++) {
            const randomX = Phaser.Math.Between(50, this.scale.width - 50);
            const randomY = Phaser.Math.Between(50, this.scale.height - 50);

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(80, 140); // px/sec
            const velocity = new Phaser.Math.Vector2(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            this.targets.push({ sprite: createTarget(this, randomX, randomY, 40, getRandomColor(), 0xffffff), velocity });
        }
            
    }

    updateCrosshair = (x,y) => {
        this.crosshairTarget.x = x;
        this.crosshairTarget.y = y;
    }

    update() {
        if (!this.crosshair) return;
        const t = 0.15;
        this.crosshair.x = Phaser.Math.Linear(this.crosshair.x, this.crosshairTarget.x, t);
        this.crosshair.y = Phaser.Math.Linear(this.crosshair.y, this.crosshairTarget.y, t);
        this.crosshair.depth = 1;
        const dt = this.game.loop.delta * 0.001;
        const bounds = { left: 20, right: this.scale.width - 20, top: 20, bottom: this.scale.height - 20 };

        this.targets.forEach(target => {
            const { sprite, velocity } = target;

            sprite.x += velocity.x * dt;
            sprite.y += velocity.y * dt;

            if (sprite.x <= bounds.left || sprite.x >= bounds.right) {
                sprite.x = Phaser.Math.Clamp(sprite.x, bounds.left, bounds.right);
                velocity.x *= -1;
            }
            if (sprite.y <= bounds.top || sprite.y >= bounds.bottom) {
                sprite.y = Phaser.Math.Clamp(sprite.y, bounds.top, bounds.bottom);
                velocity.y *= -1;
            }
        });

    }
}

export default MainScene;
  
