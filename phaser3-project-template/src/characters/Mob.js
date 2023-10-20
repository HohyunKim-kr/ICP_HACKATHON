import Phaser from "phaser";
import Explosion from "../effects/Explosion";
import ExpUp from "../items/ExpUp";
import { removeAttack } from "../utils/attackManager";
import { winGame } from "../utils/sceneManager";

export default class Mob extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, animKey, initHp, dropRate) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play(animKey);
    this.setDepth(10);
    this.scale = 2;

    this.m_speed = 50;
    this.m_hp = initHp;
    this.m_dropRate = dropRate;
    this.m_isDead = false;

    if (texture === "mob1") {
      // mob 1만 바닥을 기준으로 움직이고 있습니다. 움직일 때 중심을 기준으로 움직이지 않고 오프셋을 설정한 곳에 기준으로 움직이게 해두었습니다. 아주 미묘한 차이입니다.
      this.setBodySize(24, 14, false);
      this.setOffset(0, 14);
    } else if (texture === "mob2") {
      this.setBodySize(24, 32);
    } else if (texture === "mob3") {
      this.setBodySize(24, 32);
    } else if (texture === "mob4") {
      this.setBodySize(24, 32);
    } else if (texture === "lion") {
      this.m_speed = 60;
      this.setBodySize(40, 64);
    }

    // Mob이 계속해서(0.1초마다) player 방향으로 움직이도록 해줍니다.
    this.m_events = [];
    this.m_events.push(
      this.scene.time.addEvent({
        delay: 100,
        callback: () => {
          scene.physics.moveToObject(this, scene.m_player, this.m_speed);
        },
        loop: true,
      })
    );

    // Phaser.Scene에는 update 함수가 있지만
    // Mob은 Phaser.Physics.Arcade.Sprite를 상속한 클래스로 update 함수가 없기 때문에
    // Scene의 update가 실행될 때마다 mob도 update 함수가 실행되게 구현해준 부분입니다.
    // https://newdocs.phaser.io/docs/3.60.0-beta.20/Phaser.Scenes.Events.UPDATE
    scene.events.on("update", (time, delta) => {
      this.update(time, delta); // 현재 시간, FPS(Frame per Sec, 1초당 보여주는 프레임 수) 평활화(급격한 변화를 제외) 값
    });

    this.m_canBeAttacked = true;
  }

  update() {
    // mob이 없을 경우의 예외처리입니다.
    if (!this.body) return;

    // 오른쪽으로 향할 때는 오른쪽을, 왼쪽으로 향할 때는 왼쪽을 바라보도록 해줍니다.
    if (this.x < this.scene.m_player.x) this.flipX = true;
    else this.flipX = false;

    if (this.m_hp <= 0 && !this.m_isDead) {
      this.die();
    }
  }

  // mob이 dynamic attack에 맞을 경우 실행되는 함수입니다.
  hitByDynamic(weaponDynamic, damage) {
    // 공격에 맞은 소리를 재생합니다.
    this.scene.m_hitMobSound.play();
    // 몹의 hp에서 damage만큼 감소시킵니다.
    this.m_hp -= damage;
    // 공격받은 몹의 투명도를 1초간 조절함으로써 공격받은 것을 표시합니다.
    this.displayHit();

    // dynamic 공격을 제거합니다.
    weaponDynamic.destroy();
  }

  // mob이 static attack에 맞을 경우 실행되는 함수입니다.
  hitByStatic(damage) {
    // 쿨타임인 경우 바로 리턴합니다.
    if (!this.m_canBeAttacked) return;

    // 공격에 맞은 소리를 재생합니다.
    this.scene.m_hitMobSound.play();
    // 몹의 hp에서 damage만큼 감소시킵니다.
    this.m_hp -= damage;
    // 공격받은 몹의 투명도를 1초간 조절함으로써 공격받은 것을 표시합니다.
    this.displayHit();
    // 쿨타임을 갖습니다.
    this.getCoolDown();
  }

  // 공격받은 mob을 투명도를 1초간 조절함으로써 공격받은 것을 표시합니다.
  displayHit() {
    // 몹의 투명도를 0.5로 변경하고,
    // 1초 후 1로 변경합니다.
    if (this.texture.key === "lion") return;
    this.alpha = 0.5;
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.alpha = 1;
      },
      loop: false,
    });
  }

  // 1초 쿨타임을 갖는 함수입니다.
  getCoolDown() {
    // 공격받을 수 있는지 여부를 false로 변경하고,
    // 1초 후 true로 변경합니다.
    this.m_canBeAttacked = false;
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.m_canBeAttacked = true;
      },
      loop: false,
    });
  }

  die() {
    this.m_isDead = true;

    new Explosion(this.scene, this.x, this.y);
    this.scene.m_explosionSound.play();

    if (Math.random() < this.m_dropRate) {
      const expUp = new ExpUp(this.scene, this);
      this.scene.m_expUps.add(expUp);
    }

    // 몹이 죽으면 TopBar의 mobs killed에 1을 더해줍니다.
    this.scene.m_topBar.gainMobsKilled();
    this.scene.time.removeEvent(this.m_events);

    // 보스몹이 죽었을 때
    if (this.texture.key === "lion") {
      // 공격을 제거합니다. (attackManager.js 참고)
      removeAttack(this.scene, "catnip");
      removeAttack(this.scene, "beam");
      removeAttack(this.scene, "claw");
      // 플레이어가 보스몹과 접촉해도 HP가 깎이지 않도록 만듭니다.
      this.disableBody(true, false);
      // 보스몹이 움직이던 애니메이션을 멉춥니다.
      this.play("lion_idle");
      // 모든 몹의 움직임을 멈춥니다.
      this.scene.m_mobs.children.each((mob) => {
        mob.m_speed = 0;
      });

      // 보스몹이 서서히 투멍해지도록 합니다.
      this.scene.time.addEvent({
        delay: 30,
        callback: () => {
          this.alpha -= 0.01;
        },
        repeat: 100,
      });
      // 보스몹이 투명해진 후, GameClearScene으로 화면을 전환합니다.
      this.scene.time.addEvent({
        delay: 4000,
        callback: () => {
          winGame(this.scene);
        },
        loop: false,
      });
    }
    // 보스몹이 아닌 몹이 죽었을 때
    else {
      // 몹이 사라집니다.
      this.destroy();
    }
  }
}
