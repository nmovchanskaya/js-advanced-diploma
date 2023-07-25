export default class GameState {
  constructor() {
    this.nextStep = 'user';
    this.activeCharacter = null;
    this.level = 1;
    this.positionedCharacters = [];
  }

  setMaxPoints(points) {
    if (this.maxPoints === null || this.maxPoints === undefined) {
      this.maxPoints = points;
      return;
    }
    if (points > this.maxPoints) {
      this.maxPoints = points;
    }
  }

  static from(object) {
    this.nextStep = object.nextStep;
    return this;
  }
}
