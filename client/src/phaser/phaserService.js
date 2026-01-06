import Phaser from 'phaser';

import MainScene from './scenes/MainScene';

let gameInstance = null;
let sceneInstance = null;

const defaultSettings = {
    scale: {
        mode: Phaser.Scale.FIT,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    parent: null,
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: [MainScene]
}

const init = (container, settings) => {
    if (!container || gameInstance) return;

    //og('init', container, settings)
    const config = {...defaultSettings, ...settings, parent: container}
    gameInstance = new Phaser.Game(config);

    gameInstance.events.on('ready', () => {
        sceneInstance = gameInstance.scene.getScene('MainScene');
    });


}

const destroy = () => {
    if (!gameInstance) return;
    gameInstance.destroy(true);
    gameInstance = null;
    sceneInstance = null;     
}
const setCrosshairPosition = (x, y) => {
    //console.log('setCrosshairPosition', x, y)
    //console.log('sceneInstance', sceneInstance)
    if (!sceneInstance) return;
    sceneInstance.updateCrosshair(x, y);

}

const fire = () => {
    if (!sceneInstance) return;
    const result = sceneInstance.fire();

    return result;
}

const updateCrosshairPosition = () => {}

export default {
    init,
    destroy,
    setCrosshairPosition,
    updateCrosshairPosition,
    fire
}