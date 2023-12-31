import Phaser from "phaser";
import Config from "../Config";
import Player from "../characters/Player";
import Mob from "../characters/Mob";
import TopBar from "../ui/TopBar";
import ExpBar from "../ui/ExpBar";
import { setBackground } from "../utils/backgroundManager";
import { addMob, addMobEvent, removeOldestMobEvent } from "../utils/mobManager";
import { addAttackEvent } from "../utils/attackManager";
import { pause } from "../utils/pauseManager";
import { createTime } from "../utils/time";

export default class PlayingScene extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  create() {
    this.sound.pauseOnBlur = false;
    this.m_beamSound = this.sound.add("audio_beam");
    this.m_scratchSound = this.sound.add("audio_scratch");
    this.m_hitMobSound = this.sound.add("audio_hitMob");
    this.m_growlSound = this.sound.add("audio_growl");
    this.m_explosionSound = this.sound.add("audio_explosion");
    this.m_expUpSound = this.sound.add("audio_expUp");
    this.m_hurtSound = this.sound.add("audio_hurt");
    this.m_nextLevelSound = this.sound.add("audio_nextLevel");
    this.m_gameOverSound = this.sound.add("audio_gameOver");
    this.m_gameClearSound = this.sound.add("audio_gameClear");
    this.m_pauseInSound = this.sound.add("audio_pauseIn");
    this.m_pauseOutSound = this.sound.add("audio_pauseOut");

    this.m_topBar = new TopBar(this);
    this.m_expBar = new ExpBar(this, 50);

    this.m_player = new Player(this);

    this.cameras.main.startFollow(this.m_player);

    setBackground(this, "background1");

    this.m_cursorKeys = this.input.keyboard.createCursorKeys();

    this.m_mobs = this.physics.add.group();
    // 맨 처음에 등장하는 몹을 수동으로 추가해줍니다.
    // 추가하지 않으면 closest mob을 찾는 부분에서 에러가 발생합니다.
    this.m_mobs.add(new Mob(this, 0, 0, "mob1", "mob1_anim", 10));
    this.m_mobEvents = [];
    addMobEvent(this, 1000, "mob1", "mob1_anim", 10, 0.9);

    // attacks
    // 정적인 공격과 동적인 공격의 동작 방식이 다르므로 따로 group을 만들어줍니다.
    // attack event를 저장하는 객체도 멤버 변수로 만들어줍니다.
    // 이는 공격 강화등에 활용될 것입니다.
    this.m_weaponDynamic = this.add.group();
    this.m_weaponStatic = this.add.group();
    this.m_attackEvents = {};
    // PlayingScene이 실행되면 바로 beam attack event를 추가해줍니다.
    addAttackEvent(this, "beam", 10, 1, 1000);
    addAttackEvent(this, "claw", 10, 2.3, 1500);

    addMob(this, "lion", "lion_anim", 100, 0);

    this.physics.add.overlap(
      this.m_player,
      this.m_mobs,
      () => this.m_player.hitByMob(10),
      null,
      this
    );

    this.physics.add.overlap(
      this.m_weaponDynamic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByDynamic(weapon, weapon.m_damage);
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.m_weaponStatic,
      this.m_mobs,
      (weapon, mob) => {
        mob.hitByStatic(weapon.m_damage);
      },
      null,
      this
    );

    // item
    this.m_expUps = this.physics.add.group();
    this.physics.add.overlap(
      this.m_player,
      this.m_expUps,
      this.pickExpUp,
      null,
      this
    );

    //esc pause
    this.input.keyboard.on("keydown-ESC", () => {
      pause(this, "pause");
      this;
    });

    createTime(this);
  }

  update() {
    this.movePlayerManager();

    this.m_background.setX(this.m_player.x - Config.width / 2);
    this.m_background.setY(this.m_player.y - Config.height / 2);

    this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
    this.m_background.tilePositionY = this.m_player.y - Config.height / 2;

    const closest = this.physics.closest(
      this.m_player,
      this.m_mobs.getChildren()
    );
    this.m_closest = closest;
  }

  // player와 expUp이 접촉했을 때 실행되는 메소드입니다.
  pickExpUp(player, expUp) {
    expUp.disableBody(true, true);
    expUp.destroy();

    this.m_expUpSound.play();
    // expUp item을 먹으면 expBar의 경험치를 아이템의 m_exp 값만큼 증가시켜줍니다.
    this.m_expBar.increase(expUp.m_exp);
    // 만약 현재 경험치가 maxExp 이상이면 레벨을 증가시켜줍니다.
    if (this.m_expBar.m_currentExp >= this.m_expBar.m_maxExp) {
      pause(this, "levelup");
    }
  }

  movePlayerManager() {
    if (
      this.m_cursorKeys.left.isDown ||
      this.m_cursorKeys.right.isDown ||
      this.m_cursorKeys.up.isDown ||
      this.m_cursorKeys.down.isDown
    ) {
      if (!this.m_player.m_moving) {
        this.m_player.play("player_anim");
      }
      this.m_player.m_moving = true;
    } else {
      if (this.m_player.m_moving) {
        this.m_player.play("player_idle");
      }
      this.m_player.m_moving = false;
    }

    let vector = [0, 0];
    if (this.m_cursorKeys.left.isDown) {
      vector[0] += -1;
    } else if (this.m_cursorKeys.right.isDown) {
      vector[0] += 1;
    }
    if (this.m_cursorKeys.up.isDown) {
      vector[1] += -1;
    } else if (this.m_cursorKeys.down.isDown) {
      vector[1] += 1;
    }

    this.m_player.move(vector);
    // static 공격들은 player가 이동하면 그대로 따라오도록 해줍니다.
    this.m_weaponStatic.children.each((weapon) => {
      weapon.move(vector);
    }, this);
  }

  afterLevelUp() {
    this.m_topBar.gainLevel();

    // 레벨이 2, 3, 4, ..가 되면 등장하는 몹을 변경해줍니다.
    // 이전 몹 이벤트를 지우지 않으면 난이도가 너무 어려워지기 때문에 이전 몹 이벤트를 지워줍니다.
    // 레벨이 높아질 수록 강하고 아이텝 드랍율이 낮은 몹을 등장시킵니다.
    // repeatGap은 동일하게 설정했지만 레벨이 올라갈수록 더 짧아지도록 조절하셔도 됩니다.
    switch (this.m_topBar.m_level) {
      case 2:
        removeOldestMobEvent(this);
        addMobEvent(this, 1000, "mob2", "mob2_anim", 20, 0.8);
        break;
      case 3:
        removeOldestMobEvent(this);
        addMobEvent(this, 1000, "mob3", "mob3_anim", 30, 0.7);
        break;
      case 4:
        removeOldestMobEvent(this);
        addMobEvent(this, 1000, "mob4", "mob4_anim", 40, 0.7);
        break;
    }
  }
}
