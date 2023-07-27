/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    try {
      if (new.target.name === 'Character') throw new Error('Character can`t be called with new');

      this.level = level;
      this.attack = 0;
      this.defence = 0;
      this.health = 50;
      this.type = type;
    } catch (e) {
      alert(e);
      return e;
    }
  }

  levelUp() {
    this.level++;

    this.attack = Math.max(this.attack, this.attack * ((80 + this.health) / 100));
    this.defence = Math.max(this.defence, this.defence * ((80 + this.health) / 100));

    this.health += 80;
    if (this.health >= 100) {
      this.health = 100;
    }
  }

  updateCharacteristics() {
    const targetLevel = this.level;
    if (targetLevel > 1) {
      this.level = 1;
      for (let i = 2; i <= targetLevel; i++) {
        this.levelUp();
      }
    }
  }

  getTooltipStr() {
    return `\u{1F396}${this.level}\u{2694}${this.attack}\u{1F6E1}${this.defence}\u{2764}${this.health}`;
  }
}
