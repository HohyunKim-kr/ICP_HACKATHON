export function loseGame(playingScene) {
  playingScene.m_gameOverSound.play();
  playingScene.scene.start("gameOverScene");
}

export function winGame(playingScene) {
  playingScene.m_gameClearSound.play();
  playingScene.scene.start("gameClearScene", {
    mobsKilled: playingScene.m_topBar.m_mobsKilled,
    level: playingScene.m_topBar.m_level,
    secondElapsed: playingScene.m_secondElapsed,
  });
}
