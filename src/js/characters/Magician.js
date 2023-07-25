import Character from '../Character';

export default class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.dist = 1;
    this.distAttack = 4;
    super.updateCharacteristics();
  }
}
