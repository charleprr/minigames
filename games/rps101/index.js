    //DON'T FUCKING MERGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let valid = false
    let element = "dynamite.tornado.quicksand.pit.chain.gun.law.whip.sword.rock.death.wall.sun.camera.fire.chainsaw.school.scissors.poison.cage.axe.peace.computer.castle.snake.blood.porcupine.vulture.monkey.king.queen.prince.princess.police.woman.woman.baby.man.home.train.car.noise.bicycle.tree.turnip.duck.wolf.cat.bird.fish.spider.cockroach.brain.community.cross.money.vampire.sponge.church.butter.book.paper.cloud.airplane.moon.grass.film.toilet.air.planet.guitar.bowl.cup.beer.rain.water.tv.rainbow.ufo.alien.prayer.mountain.satan.dragon.diamond.platinum.gold.devil.fence.video game.math.robot.heart.electricity.lightning.medusa.power.laser.nuke.sky.tank.helicopter"
    let elements = element.split `.`
    let computer = new Date % 101 //Date mod 101 pseudo-random
    let player = elements.indexOf(second) //Return index of element
    player < 0 || player > 100 ? (m.reply("invalid choice"), valid = !1) : valid = !0
    //This is absolutely horrible.
    if (valid) {
      let playerloss = player + 52
      playerloss >= 101 && (playerloss -= 101)
      let computerloss = computer + 52
      computerloss >= 101 && (computerloss -= 101),
        player == computer ?
        m.reply("draw") :
        computer > player &&
        computer <= playerloss ?
        m.reply(`${elements[player]} overpowered ${elements[computer]}. player wins.`) :
        player > computer &&
        player <= computerloss ?
        m.reply(`${elements[computer]} overpowered ${elements[player]}. player loses.`) :
        m.reply(`${elements[player]} overpowered ${elements[computer]}. player wins.`);
    }
