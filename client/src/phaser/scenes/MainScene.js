import Phaser from "phaser";

let crosshairBody = null;
const radius = 18;

const targetTypes = [
    {
        type: 'scout',
        hits: 1,
        reward: 30,
        size: 40,
        speed: Phaser.Math.Between(120, 200)
    },
    {
        type: 'fighter',
        hits: 3,
        reward: 20,
        size: 60,
        speed: Phaser.Math.Between(100, 160)
    },
    {
        type: 'bomber',
        hits: 5,
        reward: 10,
        size: 80,
        speed: Phaser.Math.Between(80, 120)
    }
];

let crosshairTimeout = null;

const createTarget = (scene, x, y, size, color, stroke) => {
    const square = scene.add.rectangle(x, y, size, size, color);
    square.setStrokeStyle(2, stroke);
    scene.physics.add.existing(square);
    square.body.setCollideWorldBounds(true);
    square.body.setBounce(1, 1);
    return square;
}

const checkTargetRelease = (_this) => {
    if (_this.activeTarget && _this.physics.world.overlap(_this.crosshair, _this.targetGroup)) return;

    _this.activeTarget = null;
    _this.crosshair.setFillStyle(0xffffff, 0.3);
    _this.crosshair.setStrokeStyle(2, 0xffffff);
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
        this.activeTarget = null;
        this.targetGroup = null;
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
        this.targetGroup = this.physics.add.group();
        
        

        for (let i = 0; i < 5; i++) {
            const randomX = Phaser.Math.Between(50, this.scale.width - 50);
            const randomY = Phaser.Math.Between(50, this.scale.height - 50);

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

            // get random target type
            const type = Phaser.Utils.Array.GetRandom(targetTypes);
            
            const velocity = new Phaser.Math.Vector2(
                Math.cos(angle) * type.speed,
                Math.sin(angle) * type.speed
            );

            const sprite = createTarget(this, randomX, randomY, type.size, getRandomColor(), 0xffffff);
            console.log(type);

            sprite.setData('type', type.type);
            sprite.setData('hits', type.hits);
            sprite.setData('reward', type.reward);
            sprite.setData('velocity', velocity);
            sprite.setData('bounds', {
                left: type.size / 2,
                right: this.scale.width - type.size / 2,
                top: type.size / 2,
                bottom: this.scale.height - type.size / 2
            });

            this.targets.push(sprite);
    
            this.targetGroup.add(sprite);
        }

        this.physics.add.overlap(
            this.crosshair,
            this.targetGroup,
            (crosshair, target) => {
                this.handleOverlap(crosshair, target);
            },
            null,
            this
        );
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
        crosshairBody.reset(this.crosshair.x, this.crosshair.y);
        this.crosshair.depth = 1;
        const dt = this.game.loop.delta * 0.001;

        this.targets.forEach(target => {
            const velocity = target.getData('velocity');
            const bounds = target.getData('bounds');

            target.x += velocity.x * dt;
            target.y += velocity.y * dt;

            if (target.x <= bounds.left || target.x >= bounds.right) {
                target.x = Phaser.Math.Clamp(target.x, bounds.left, bounds.right);
                velocity.x *= -1;
            }
            if (target.y <= bounds.top || target.y >= bounds.bottom) {
                target.y = Phaser.Math.Clamp(target.y, bounds.top, bounds.bottom);
                velocity.y *= -1;
            }
        });

        checkTargetRelease(this);

    }

    handleOverlap(crosshair, target) {
        crosshair.setStrokeStyle(2, 0xff0000);
        this.activeTarget = target;
    }

    fire() {
        this.crosshair.setFillStyle(0xff0000, 0.3);

        const result = {
            hit: false,
            killed: false,
            type: null,
            reward: 0
        }

        if (this.activeTarget) {
            const hits = this.activeTarget.getData('hits') - 1;
            this.activeTarget.setData('hits', hits);
            result.hit = true;
            result.type = this.activeTarget.getData('type');

            if (hits <= 0) {
                result.reward = this.activeTarget.getData('reward');
                result.killed = true;
                this.targetGroup.remove(this.activeTarget, true, true);
                Phaser.Utils.Array.Remove(this.targets, this.activeTarget);
                this.activeTarget = null;
            }
        }

        crosshairTimeout = clearTimeout(crosshairTimeout);
        crosshairTimeout = setTimeout(() => {
            this.crosshair && this.crosshair.setFillStyle(0xffffff, 0.3);
        }, 100);

        return result;
    }

    destroy() {
        this.crosshair && this.crosshair.destroy();
        this.targetGroup && this.targetGroup.clear(true, true);
        this.targets.forEach(target => target.destroy());
        clearTimeout(crosshairTimeout);
        crosshairBody = null;
    }
}

export default MainScene;
  
