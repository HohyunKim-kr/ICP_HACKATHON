import Mob from "../characters/Mob";
import { getRandomPosition } from "./math";

export function addMobEvent(
  scene,
  repeatGap,
  mobTexture,
  mobAnim,
  mobHp,
  mobDropRate
) {
  let timer = scene.time.addEvent({
    delay: repeatGap,
    callback: () => {
      // mob이 화면 바깥에서 나타나도록 해줍니다.
      let [x, y] = getRandomPosition(scene.m_player.x, scene.m_player.y);
      scene.m_mobs.add(
        new Mob(scene, x, y, mobTexture, mobAnim, mobHp, mobDropRate)
      );
    },
    loop: true,
  });

  scene.m_mobEvents.push(timer);
}

export function addMob(scene, mobTexture, mobAnim, mobHp) {
  let [x, y] = getRandomPosition(scene.m_player.x, scene.m_player.y);
  scene.m_mobs.add(new Mob(scene, x, y, mobTexture, mobAnim, mobHp, 0));
}

// 가장 오래된 mob event를 지우는 함수입니다.
export function removeOldestMobEvent(scene) {
  scene.m_mobEvents[0].remove();
  scene.m_mobEvents.shift();
}
