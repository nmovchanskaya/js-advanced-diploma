import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  inMovingArea(index) {
    const x = this.position % 8;
    const y = Math.floor(this.position / 8);

    const xNew = index % 8;
    const yNew = Math.floor(index / 8);

    if (
      (x - xNew) === 0 && Math.abs(y - yNew) <= this.character.dist
      || (y - yNew) === 0 && Math.abs(x - xNew) <= this.character.dist
      || Math.abs(x - xNew) === Math.abs(y - yNew) && Math.abs(x - xNew) <= this.character.dist
    ) {
      return true;
    }

    return false;
  }

  inAttackArea(index) {
    const x = this.position % 8;
    const y = Math.floor(this.position / 8);

    const xNew = index % 8;
    const yNew = Math.floor(index / 8);

    if (Math.abs(x - xNew) <= this.character.distAttack && Math.abs(y - yNew) <= this.character.distAttack) {
      return true;
    }

    return false;
  }

  move(position) {
    this.position = position;
  }
}
