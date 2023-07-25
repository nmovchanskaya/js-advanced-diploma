import { calcTileType } from '../js/utils';
import Bowman from '../js/characters/Bowman';
import Swordsman from '../js/characters/Swordsman';
import Magician from '../js/characters/Magician';
import Daemon from '../js/characters/Daemon';
import Undead from '../js/characters/Undead';
import Vampire from '../js/characters/Vampire';
import { characterGenerator, generateTeam } from '../js/generators';
import Character, { getTooltipStr } from '../js/Character';
import PositionedCharacter from '../js/PositionedCharacter';
import GameStateService, { load } from '../js/GameStateService';

// tests of cell types
test('top-left', () => {
  const type = calcTileType(0, 8);
  expect(type).toBe('top-left');
});
test('top-right', () => {
  const type = calcTileType(7, 8);
  expect(type).toBe('top-right');
});
test('bottom-left', () => {
  const type = calcTileType(56, 8);
  expect(type).toBe('bottom-left');
});
test('bottom-right', () => {
  const type = calcTileType(63, 8);
  expect(type).toBe('bottom-right');
});
test('top', () => {
  const type = calcTileType(2, 8);
  expect(type).toBe('top');
});
test('left', () => {
  const type = calcTileType(16, 8);
  expect(type).toBe('left');
});
test('right', () => {
  const type = calcTileType(23, 8);
  expect(type).toBe('right');
});
test('bottom', () => {
  const type = calcTileType(58, 8);
  expect(type).toBe('bottom');
});
test('center', () => {
  const type = calcTileType(50, 8);
  expect(type).toBe('center');
});

// tests for creation
test.each([
  [Bowman, 'level', 1],
  [Bowman, 'attack', 25],
  [Bowman, 'defence', 25],
  [Bowman, 'type', 'bowman'],
  [Bowman, 'dist', 2],
  [Bowman, 'distAttack', 2],
  [Swordsman, 'attack', 40],
  [Swordsman, 'defence', 10],
  [Swordsman, 'type', 'swordsman'],
  [Swordsman, 'dist', 4],
  [Swordsman, 'distAttack', 1],
  [Magician, 'attack', 10],
  [Magician, 'defence', 40],
  [Magician, 'type', 'magician'],
  [Magician, 'dist', 1],
  [Magician, 'distAttack', 4],
  [Vampire, 'attack', 25],
  [Vampire, 'defence', 25],
  [Vampire, 'type', 'vampire'],
  [Vampire, 'dist', 2],
  [Vampire, 'distAttack', 2],
  [Undead, 'attack', 40],
  [Undead, 'defence', 10],
  [Undead, 'type', 'undead'],
  [Undead, 'dist', 4],
  [Undead, 'distAttack', 1],
  [Daemon, 'attack', 10],
  [Daemon, 'defence', 10],
  [Daemon, 'type', 'daemon'],
  [Daemon, 'dist', 1],
  [Daemon, 'distAttack', 4],
])(
  ('test'),
  (type, par, expected) => {
    const pers = new type(1);
    expect(pers[par]).toBe(expected);
  },
);

// test level up for character
test.each([
  ['level', 2],
  ['attack', 32.5],
  ['defence', 32.5],
  ['health', 100],
])(
  ('level up for character'),
  (par, expected) => {
    const pers = new Bowman(2);
    expect(pers[par]).toBe(expected);
  },
);

// test for not calling new Character
test('test for not calling new Character', () => {
  const char = new Character(2);
  expect(char).toBeInstanceOf(Error);
});

test('characterGenerator', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;
  const playerGenerator = characterGenerator(playerTypes, maxLevel);
  const player = playerGenerator.next().value;
  expect(player instanceof Bowman || player instanceof Swordsman || player instanceof Magician).toBeTruthy();
});

test('characterGenerator 3 times', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;
  const playerGenerator = characterGenerator(playerTypes, maxLevel);
  let player = playerGenerator.next().value;
  player = playerGenerator.next().value;
  player = playerGenerator.next().value;
  expect(player instanceof Bowman || player instanceof Swordsman || player instanceof Magician).toBeTruthy();
});

test('generateTeam count', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;
  const charCount = 5;
  const team = generateTeam(playerTypes, maxLevel, charCount);
  expect(team.characters.length).toBe(charCount);
});

const playerTypes = [Bowman, Swordsman, Magician];
const maxLevel = 3;
const charCount = 5;
const team = generateTeam(playerTypes, maxLevel, charCount);
console.log(team);
test.each(team.characters)(
  ('generateTeam level'),
  (character) => {
    const { level } = character;
    expect(level).toBeLessThanOrEqual(maxLevel);
  },
);

test('getTooltipStr', () => {
  const pers = new Swordsman(1);
  const tooltip = pers.getTooltipStr();
  expect(tooltip).toBe('\u{1F396}1\u{2694}40\u{1F6E1}10\u{2764}50');
});

test('test inMovingArea', () => {
  const bowman = new Bowman(2);
  const bowmanPositioned = new PositionedCharacter(bowman, 8);
  const canMove = bowmanPositioned.inMovingArea(10);
  expect(canMove).toBe(true);
});

test('test inMovingArea', () => {
  const bowman = new Bowman(2);
  const bowmanPositioned = new PositionedCharacter(bowman, 8);
  const canMove = bowmanPositioned.inMovingArea(26);
  expect(canMove).toBe(true);
});

test('test inMovingArea', () => {
  const bowman = new Bowman(2);
  const bowmanPositioned = new PositionedCharacter(bowman, 8);
  const canMove = bowmanPositioned.inMovingArea(25);
  expect(canMove).toBe(false);
});

test('test inAttackArea', () => {
  const bowman = new Bowman(2);
  const bowmanPositioned = new PositionedCharacter(bowman, 8);
  const canMove = bowmanPositioned.inAttackArea(25);
  expect(canMove).toBe(true);
});

test('test inAttackArea', () => {
  const bowman = new Bowman(2);
  const bowmanPositioned = new PositionedCharacter(bowman, 8);
  const canMove = bowmanPositioned.inMovingArea(32);
  expect(canMove).toBe(false);
});

const gameStateService = new GameStateService();
jest.mock('../js/GameStateService.js');
test('error in load game state', () => {
  gameStateService.load.mockReturnValue(new Error('Invalid state'));
  const obj = gameStateService.load();
  expect(obj).toBeInstanceOf(Error);
});
