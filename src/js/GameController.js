import themes from './themes';
import { initialStates, initialStatesEnemy } from './initialStates';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import Character from './Character';
import GameState from './GameState';
import GameStateService from './GameStateService';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = {};
    this.positionedCharacters = [];
  }

  init() {
    //draw the field
    const themeName = themes.find((item) => item.level === 1).name;
    this.gamePlay.drawUi(themeName);

    //load or create new teams
    const loaded = this.loadGameState();
    if (!loaded) {
      //create new teams
      this.positionedCharacters = [];
      this.gameState = new GameState();

      const playerTypes = [Bowman, Swordsman, Magician];
      const team = generateTeam(playerTypes, 2, 2);
      const playerTypesEnemy = [Undead, Daemon];
      const teamEnemy = generateTeam(playerTypesEnemy, 1, 2);

      this.locateCharacters(team, 'user');
      this.locateCharacters(teamEnemy, 'enemy');
    }

    this.redrawAndUpdateSetOfCharacters();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  // load GameState from localStorage
  // return true if ok
  loadGameState() {
    const gameStateService = new GameStateService(localStorage);
    let obj;
    try {
      obj = gameStateService.load();
    }
    catch(e) {
      alert(e);
    }

    if (obj) {
      this.gameState = new GameState();
      this.gameState.nextStep = obj.nextStep;
      this.gameState.level = obj.level;

      // load teams from localStorage
      this.positionedCharacters = [];
      obj.positionedCharacters.forEach((item) => {
        let char = this.createCharacterCopy(item.character);
        const posChar = new PositionedCharacter(char, item.position);
        this.positionedCharacters.push(posChar);
      });

      this.gameState.positionedCharacters = [];
      this.positionedCharacters.forEach((item) => {
        this.gameState.positionedCharacters.push(item);
      });

      if (obj.activeCharacter) {
        let char = this.createCharacterCopy(obj.activeCharacter.character);
        this.gameState.activeCharacter = new PositionedCharacter(char, obj.activeCharacter.position);
        this.activateNewCharacter(this.gameState.activeCharacter.position);
      }
      return true;
    }
    return false;
  }

  // create character copy with input character
  createCharacterCopy(character) {
    let char;
    switch (character.type) {
      case 'bowman':
        char = new Bowman(character.level);
        break;
      case 'magician':
        char = new Magician(character.level);
        break;
      case 'swordsman':
        char = new Swordsman(character.level);
        break;
      case 'daemon':
        char = new Daemon(character.level);
        break;
      case 'undead':
        char = new Undead(character.level);
        break;
      case 'vampire':
        char = new Vampire(character.level);
        break;
    }
    for (let prop in character) {
      char[prop] = character[prop];
    }
    return char;
  }

  // locate characters in the field
  locateCharacters(team, user) {
    let initialStatesCpy;
    if (user === 'user') {
      initialStatesCpy = Array.from(initialStates);
    } else {
      initialStatesCpy = Array.from(initialStatesEnemy);
    }
    // const positionedCharacters = [];
    team.characters.forEach((item) => {
      const randomIdx = Math.floor(Math.random() * initialStatesCpy.length);
      this.positionedCharacters.push(new PositionedCharacter(item, initialStatesCpy[randomIdx]));
      initialStatesCpy.splice(randomIdx, 1);
    });
  }

  // return user or enemy team
  getTeam(user) {
    if (user === 'user') {
      return this.positionedCharacters.filter((item) => ['bowman', 'swordsman', 'magician'].includes(item.character.type));
    }

    return this.positionedCharacters.filter((item) => ['undead', 'daemon', 'vampire'].includes(item.character.type));
  }

  //find by index positionedCharacter and cell
  //deselect previously active cell
  //select new active cell
  //update gameState.activeCharacter
  activateNewCharacter(index) {
    const character = this.positionedCharacters.find((item) => item.position === index);
    const selectedIndex = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-yellow'));
    if (selectedIndex >= 0) {
      this.gamePlay.deselectCell(selectedIndex);
    }
    this.gamePlay.selectCell(index);
    this.gameState.activeCharacter = character;
  }

  deactivateCharacter(index) {
    this.gamePlay.deselectCell(index);

    //if it was activeCharacter - set to null
    if (index === this.gameState.activeCharacter.position) {
      this.gameState.activeCharacter = null;
    }
  }

  async onCellClick(index) {
    if (this.gameState.nextStep === 'user') {
      if (this.gameState.activeCharacter) {
        if (this.gamePlay.cells[index].children.length !== 0) {
          if (this.gamePlay.cells[index].children[0].classList.contains('character')) {
            const character = this.positionedCharacters.find((item) => item.position === index);

            // set new active character
            if (['bowman', 'swordsman', 'magician'].includes(character.character.type)) {
              this.activateNewCharacter(index);
              this.redrawAndUpdateSetOfCharacters();
            } else if (this.gameState.activeCharacter.inAttackArea(index)) {
              // attack enemy
              const attacker = this.gameState.activeCharacter.character;
              const target = this.positionedCharacters.find((item) => item.position === index).character;
              await this.attack(attacker, target, index, true);
              this.enemyMove();
            } else {
              GamePlay.showError('You can\'t attack so far from your position');
            }
          }
        } else if (this.gameState.activeCharacter.inMovingArea(index)) {
          // deselect previously active character's cell
          this.gamePlay.deselectCell(this.gameState.activeCharacter.position);
          this.gamePlay.selectCell(index);

          // move active Character to another cell
          this.gameState.activeCharacter.move(index);
          console.log(this.positionedCharacters);
          this.redrawAndUpdateSetOfCharacters();
          this.enemyMove();
        }
      } else if (this.gamePlay.cells[index].children.length !== 0) {
        // set active character for the first time
        if (this.gamePlay.cells[index].children[0].classList.contains('character')) {
          const character = this.positionedCharacters.find((item) => item.position === index);
          if (['bowman', 'swordsman', 'magician'].includes(character.character.type)) {
            this.activateNewCharacter(index);
            this.redrawAndUpdateSetOfCharacters();
          } else {
            GamePlay.showError('You can select only cells with your characters');
          }
        }
      } else {
        GamePlay.showError('You can select only cells with your characters');
      }
    }
  }

  // вызывается из GamaPlay с параметром index
  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length !== 0) {
      if (this.gamePlay.cells[index].children[0].classList.contains('character')) {
        const character = this.positionedCharacters.find((item) => item.position === index);
        const message = character.character.getTooltipStr();
        this.gamePlay.showCellTooltip(message, index);

        if (this.gameState.nextStep === 'user') {
          // if we enter cell with another character
          if (['bowman', 'swordsman', 'magician'].includes(character.character.type)) {
            this.gamePlay.setCursor('pointer');
          }

          // if we enter cell with enemy character
          if (['daemon', 'undead', 'vampire'].includes(character.character.type)) {
            if (this.gameState.activeCharacter) {
              this.changeCursorSelection(index, 'attack');
            } else {
              this.gamePlay.setCursor('not-allowed');
            }
          }
        }
      }
    } else if (this.gameState.nextStep === 'user') {
      // if we enter cell that we can move to
      if (this.gameState.activeCharacter) {
        this.changeCursorSelection(index, 'move');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }
  }

  changeCursorSelection(index, action) {
    let color;
    let cursor;
    let haveToChange;

    if (action === 'move') {
      color = 'green';
      cursor = 'pointer';
      haveToChange = this.gameState.activeCharacter.inMovingArea(index);
    }
    else if (action === 'attack') {
      color = 'red';
      cursor = 'crosshair';
      haveToChange = this.gameState.activeCharacter.inAttackArea(index);
    }
    if (haveToChange) {
      this.gamePlay.setCursor(cursor);
      this.gamePlay.selectCell(index, color);
    } else {
      this.gamePlay.setCursor('not-allowed');
    }
  }

  // function on cell leave
  onCellLeave(index) {
    this.gamePlay.setCursor('auto');
    this.gamePlay.hideCellTooltip(index);
    const selectedGrnIndex = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-green'));
    if (selectedGrnIndex >= 0) {
      this.gamePlay.deselectCell(selectedGrnIndex);
    }
    const selectedRedIndex = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-red'));
    if (selectedRedIndex >= 0) {
      this.gamePlay.deselectCell(selectedRedIndex);
    }
  }

  // function on click New game
  onNewGameClick() {
    const gameStateService = new GameStateService(localStorage);
    gameStateService.save(null);

    const points = this.getPoints();
    this.gameState.setMaxPoints(points);
    this.init();
  }

  // function on click Save game
  onSaveGameClick() {
    // save current state in localStorage
    const gameStateService = new GameStateService(localStorage);
    gameStateService.save(this.gameState);
  }

  // function on click Save game
  onLoadGameClick() {
    this.loadGameState();
  }

  // return sum of your points = sum of all characters' health
  getPoints() {
    const team = this.getTeam('user');
    let sum = 0;
    team.forEach((item) => {
      sum += item.character.health;
    });
    return sum;
  }

  // attack target with attacker character, index - position of target, user - is user action or not
  // return true if game is not over
  async attack(attacker, target, index, user = false) {
    if (user) {
      this.gameState.nextStep = 'comp';
    }
    else {
      this.gameState.nextStep = 'user';
    }

    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    await this.gamePlay.showDamage(index, damage);
    target.health -= damage;

    // delete character if health <= 0
    if (target.health <= 0) {
      this.positionedCharacters = this.positionedCharacters.filter((item) => item.character.health > 0);
      
      this.deactivateCharacter(index);
      
      // check if there are no enemies
      // so we need to level up or end the game
      if (this.checkNoEnemies(user)) {
        if (user && this.gameState.level < 4) {
          this.levelUp();
          return true;
        }

        this.gameOver();
        return false;
      }
    }
    this.redrawAndUpdateSetOfCharacters();
  }

  // check, if there are no enemies in another team
  checkNoEnemies(user) {
    let otherTeam;
    if (user) {
      otherTeam = this.getTeam('enemy');
    } else {
      otherTeam = this.getTeam('user');
    }
    if (otherTeam.length === 0) {
      return true;
    }

    return false;
  }

  // function for new level
  // upgrade characters
  // create new enemy team
  levelUp() {
    // new Lavel
    this.gameState.level++;
    // find and set new theme for game
    const themeName = themes.find((item) => item.level === this.gameState.level).name;
    this.gamePlay.drawUi(themeName);

    // upgrade characters
    const team = this.getTeam('user');
    team.forEach((item) => {
      item.character.levelUp();
    });

    // new enemy team
    const playerTypes2 = [Undead, Daemon];
    const teamEnemy = generateTeam(playerTypes2, 1, 2);
    this.locateCharacters(teamEnemy, 'enemy');

    console.log(this.positionedCharacters);
    this.redrawAndUpdateSetOfCharacters();
  }

  // move of enemy team
  async enemyMove() {
    // choose random character from enemy team
    const enemyTeam = this.getTeam('enemy');
    const randomIdx = Math.floor(Math.random() * enemyTeam.length);
    const randCharacter = enemyTeam[randomIdx];
    const xChar = randCharacter.position % 8;
    const yChar = Math.floor(randCharacter.position / 8);

    // choose character to attack with min distance
    const team = this.getTeam('user');
    let attackedCharacter = team[0];
    let minDelta = (this.gamePlay.boardSize * 2) - 2;
    let minDeltaX;
    let minDeltaY;
    let newPosition;

    team.forEach((item) => {
      const x = item.position % 8;
      const y = Math.floor(item.position / 8);
      const deltaX = x - xChar;
      const deltaY = y - yChar;
      const delta = Math.abs(deltaX) + Math.abs(deltaY);

      if (delta < minDelta) {
        attackedCharacter = item;
        minDelta = delta;
        minDeltaX = deltaX;
        minDeltaY = deltaY;
      }
    });

    // if in attackarea - attack
    if (randCharacter.inAttackArea(attackedCharacter.position)) {
      await this.attack(randCharacter.character, attackedCharacter.character, attackedCharacter.position);
    } else {
      // else move:
      // go to max possible distance in X or Y
      let maxDistanse;
      if (Math.abs(minDeltaX) >= Math.abs(minDeltaY)) {
        maxDistanse = Math.min(Math.abs(minDeltaX) - 1, randCharacter.character.distAttack);
        let newX;
        if (minDeltaX > 0) {
          newX = xChar + maxDistanse;
        } else {
          newX = xChar - maxDistanse;
        }
        newPosition = yChar * this.gamePlay.boardSize + newX;
      } else {
        maxDistanse = Math.min(Math.abs(minDeltaY), randCharacter.character.distAttack);
        let newY;
        if (minDeltaY > 0) {
          newY = yChar + maxDistanse;
        } else {
          newY = yChar - maxDistanse;
        }
        newPosition = newY * this.gamePlay.boardSize + xChar;
      }
      // check there is no characters in this cell
      const charIdx = this.positionedCharacters.findIndex((item) => item.position === newPosition);
      if (charIdx === -1) {
        randCharacter.move(newPosition);
        this.redrawAndUpdateSetOfCharacters();
      }
    }
  }

  gameOver() {
    //block all movements ot the field
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.redrawPositions(this.positionedCharacters);

    alert('Game over!');

    this.onNewGameClick();
  }

  // update positionedCharacters in gameState
  // and save current state in localStorage
  redrawAndUpdateSetOfCharacters() {
    this.gamePlay.redrawPositions(this.positionedCharacters);

    // update positionedCharacters in gameState
    this.gameState.positionedCharacters = [];
    this.positionedCharacters.forEach((item) => {
      this.gameState.positionedCharacters.push(item);
    });

    // save current state in localStorage
    const gameStateService = new GameStateService(localStorage);
    gameStateService.save(this.gameState);
  }
}
