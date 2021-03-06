import Ground from '../objects/Ground';
import Car from '../objects/Car';
import LampGroup from '../objects/LampGroup';
import ScoreBoard from '../objects/ScoreBoard';

export default class Play extends Phaser.State{
	create(){
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.gravity.y = 500;
		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.background = this.game.add.sprite(0,0,'background');

		this.car = new Car(this.game, this.game.width/2,400,85,35);
		this.game.add.existing(this.car);

		this.ground = new Ground(this.game,0,495,600,110);
		this.game.add.existing(this.ground);

		this.LampGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.generateLamp, this);
		this.LampGenerator.timer.start();

		this.lamps = this.game.add.group();
		this.score = 0;

		this.scoreSound = this.game.add.audio('score');
		this.hitSound = this.game.add.audio('hit');
	}
	update(){
		this.game.physics.arcade.collide(this.car,this.ground);

		if(this.cursors.left.isDown) this.car.slow();
		if(this.cursors.right.isDown) this.car.fast();
		if(this.car.body.wasTouching.down && this.cursors.up.isDown) this.car.jump();
		this.car.body.velocity.x *=0.9;

		this.lamps.forEach(lampGroup => { 
			this.game.physics.arcade.collide(this.car, lampGroup, this.deathHandler, this.checkScore(lampGroup), this);
		});
	}

	generateLamp(){
		let lampGroup = this.lamps.getFirstExists(false); 
		if(!lampGroup) lampGroup = new LampGroup(this.game, this.lamps);
		lampGroup.reset(this.game.width + lampGroup.width/2, 0);
	}
	deathHandler(){
		this.hitSound.play();

		this.scoreboard = new ScoreBoard(this.game); 
		this.game.add.existing(this.scoreboard); 
		this.scoreboard.show(this.score);

		this.lamps.callAll('stop'); 
		this.LampGenerator.timer.stop(); 
		this.ground.stopScroll();
		this.car.kill(); 
	}

	checkScore(lampGroup) {
		if(lampGroup.exists && !lampGroup.hasScored && lampGroup.lamp.world.x <= this.car.world.x) { 
			lampGroup.hasScored = true;
			this.score++;
			this.scoreSound.play();
		} 
	}
	shutdown() { 
		this.car.destroy(); 
		this.lamps.destroy(); 
		this.scoreboard.destroy();
	}

}