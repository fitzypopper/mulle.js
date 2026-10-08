/**
 * Junk pile data - port of JunkViewHandler (reference/lingo00/
 * ParentScript 27).
 *
 * The original keeps, per pile:
 *   floorList     the lines parts settle on (shelf boards / ground)
 *   maxList       how many parts fit before Mulle refuses
 *   maxSoundList  the "pile is full" chatter per pile
 *
 * Pile names are the original save keys: Shelf1..Shelf6 (the six junk
 * shelves, all sharing the #Shelf geometry), Quay (the pile shown in
 * 04.DXR) and Yard (the pile shown in 03.DXR).
 *
 * @module struct/junkview
 */
'use strict'

/** Rest lines per pile kind: [left, top, right, bottom] */
export const FLOORS = {
  Quay: [[4, 475, 544, 476]],
  Yard: [[4, 475, 636, 476]],
  Shelf: [
    [145, 94, 632, 95],
    [145, 209, 632, 210],
    [145, 314, 632, 315],
    [145, 409, 632, 410]
  ]
}

/** Parts per pile before the pile counts as full */
export const MAX = { Quay: 30, Yard: 10, Shelf: 80 }

/** Random "the pile is full" voice lines (JunkViewHandler.getMaxSound) */
export const MAX_SOUNDS = {
  Quay: ['00d007v0', '00d008v0'],
  Yard: ['00d009v0', '03d008v0', '03d009v0', '03d010v0'],
  Shelf: ['03d011v0', '03d012v0', '03d014v0'],
  AllFull: ['03d015v0']
}

/** Every pile a save can carry (InitialJunkDB) */
export const PILES = ['Shelf1', 'Shelf2', 'Shelf3', 'Shelf4', 'Shelf5', 'Shelf6', 'Quay', 'Yard']

/**
 * Shelf1..Shelf6 share the #Shelf geometry, every other name is used
 * as-is (original: `if char 1 to 5 of string(argWhere) = "Shelf"`).
 *
 * @param  {string} pile Pile name
 * @return {string}      'Shelf' | 'Quay' | 'Yard'
 */
export function pileKind (pile) {
  return String(pile).substr(0, 5) === 'Shelf' ? 'Shelf' : String(pile)
}
