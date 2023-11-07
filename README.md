# Diploma project for the course 'Advanced JavaScript'. Retro Game

# Working result
https://nika-movchanskaya.github.io/js-advanced-diploma/dist/

## 1. Concept

A two-dimensional fantasy game where the player has to put his characters against
the characters of evil spirits. After each round, the life of the surviving characters is restored
the player and their level increases. The maximum level is 4.

The game can be saved and restored from the saved state.

## 2. Classes of characters

The player and the computer can only have certain character classes in their teams

#### Classes

1. Bowman
2. Swordsman
3. Magician

#### Enemy classes

4. Vampire 
5. Undead 
6. Daemon

#### Parameters of character:

1. level - from 1 to 4
2. attack 
3. defence
4. health 
4. type - one of *'swordsman'*, *'bowman'*, *'magician'*, *'daemon'*, *'undead'*, *'vampire'*. 

Initial values for characters' classes:

| Class     | attack | defence |
|-----------|--------|---------|
| Bowman    | 25     | 25      |
| Swordsman | 40     | 10      |
| Magician  | 10     | 40      |
| Vampire   | 25     | 25      |
| Undead    | 40     | 10      |
| Daemon    | 10     | 10      |


### Drawing character teams

Characters are randomly generated in columns 1 and 2 for the player and in columns 7 and 8 for the computer

## 3. Selection of character

### Features of attack and movement of characters

The direction of movement is similar to the queen in chess.
Characters of different types can walk at different distances
(the only rule is that we walk in straight lines and diagonally):

* Swordsman/Undead - 4 cells in any direction
* Bowman/Vampire - 2 cells in any direction
* Magician/Daemon - 1 cell in any direction

The attack range is also limited:
* Swordsman/Undead - can only attack a neighboring cell
* Bowman/Vampire - for the next 2 cells
* Magician/Daemon - for the next 4 cells

## 4. Moving

Moving: A free field is selected, to which you can move the character (to do this, click on the field with the left mouse button)

## 5. Attack

Damage is calculated using the formula: `Math.max(attacker.attack - target.defense, attack.attack * 0.1)`,
where `attacker` is an attacking character, `target` is an attacked character

When making an attack, we reduce the health of the attacked character by the amount of damage.

## 6. Computer attacks

We have such a computer attack strategy on the player's characters:
  enemy team attacks the nearest character. If it can't be done, it moves one its character
The player and the computer consistently perform one game action, after which control is transferred to the opposite side.

## 7. Death, character level-up

1. Characters disappear after death (the field is cleared)
2. If the opponent has no characters left:
  1. Raise the character level
  2. Start the game at a new level

### Increasing Character's level

1. Parameter health becomes: current level + 80 (but not more than 100). 

2. Parameters of attack/defence are connected with the parameter of health: 

    `attackAfter = Math.max(attackBefore, attackBefore * (80 + health) / 100)`
   
### New level of play

After moving to a new level, we change the theme of the game

## 8. Game Over, New Game and statistics

After the end of the game (the player loses) or the completion of all 4 levels, the playing field is blocked (i.e. not react to events occurring on it).

When you click on the `New Game` button, a new game starts, but the maximum number of points scored for previous games is saved in 'GameState'.
