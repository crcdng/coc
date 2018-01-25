# Conflict of Character

## Version 0.1

Conflict of Character is playground and testbed for the student projects of the Plymouth University ILLGA400PP Character module.

To test your animations:

1. Download and unzip the Zip file.
2. Put your files (see below) into the directory `assets/fighterXY` where `XY` is your assigned number.
3. In the main directory start a webserver: If you already have Atom with live-server installed (GAD), use that. On university machines or on your own Mac you can start a terminal, then type:
  1. `cd [the directory that was created unpacking the Zip file]` [Enter]
  2. `python SimpleHTTPServer` [Enter]
  3. Open a browser window and type `localhost:8000` [Enter] into the address bar

Ask in class for other setups or if you have problems.

### Required files

1. name.txt: the name of your character
1. portrait.png: a portrait
1. idle.png: This animation is played when your character is standing.
1. walk.png: This animation is played when your 1 character is walking (the same animation to walk towards and away from the opponent).
1. attack.png: This animation is played when your character executes an attack.
1. defense.png: This animation is played when your character does a defense / block.
1. special.png: This animation is played when your character makes a special move.
1. gothit.png: This animation is played when your character got hit.
1. win.png: This animation is played when your character wins.
1. lose.png: This animation is played when your character loses.

### Optional files (not marked)

1. background.png: a background image  
1. attack.mp3: This very short sound is played during an attack.
1. defense.mp3: This very short sound is played during an defense.
1. special.mp3: This short sound is played during the special move.
1. gothit.png: This very short sound is played when your character got hit.
1. win.mp3: This (max. 4 seconds) sound / melody is when the character wins.
1. lose.mp3: This (max. 4 seconds) sound / melody is played when the character loses.

Details are in the Brief.

## Licenses

* code: MIT License (see LICENSE)
* mountain background: CC0
* crying sound: User hinsinger, freesound.crg, CC BY 3.0
* fighter artworks and sounds are copyright of their respective creators and cannot be used without explicit permission.

## Changelog
### version 0.1

* OK screenflow
* OK main screen elements
* OK asset loader
* OK test animations
* OK setup fighters (incl. mirroring)
* OK complete set of test animations
* OK input
* OK trigger animations
* OK squashed nasty bug (must load texture before adding animation)
* OK adaptive frame rate for animations
* OK got hit animation
* OK collision handling
* OK animation timing
* OK defense move handling
* OK winning and losing
* OK health
* OK game over screen
* OK fighter selection
* OK ready screen
* OK names
* OK display text
* OK backgrounds
* OK health bar
* OK iterate placement of titles, sprites
* OK fix up/down selection
* OK attack specific bodies / bounding boxes
* OK audio
* OK fix transition to gameOverScreen
* OK fix keymashing after win

### nice to have

* webfonts? https://fonts.google.com/featured/High-Impact+Vernacular+Display?category=Serif,Sans+Serif,Display,Monospace&selection.family=Montserrat
* all kinds of ui effects / tweens
* all kinds of fighting effects / shaders
* get ready...fight dynamic display
* winner dynamic display
* separate bodies? (collision instead of overlap)
* help / options screen
* gamepad support
* game get focus at the beginning
* blocking attacks for a certain time after hit

### ongoing

code improvements, bug fixes
