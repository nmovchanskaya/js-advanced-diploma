import Character from '../Character';

export default class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
    this.dist = 2;
    this.distAttack = 2;
    super.updateCharacteristics();
  }
}
