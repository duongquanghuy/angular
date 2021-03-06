/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
* A marker that indicates the start of a segment in a mapping.
*
* The end of a segment is indicated by the the first segment-marker of another mapping whose start
* is greater or equal to this one.
*/
export interface SegmentMarker {
  readonly line: number;
  readonly column: number;
}

/**
 * Compare two segment-markers, for use in a search or sorting algorithm.
 *
 * @returns a positive number if `a` is after `b`, a negative number if `b` is after `a`
 * and zero if they are at the same position.
 */
export function compareSegments(a: SegmentMarker, b: SegmentMarker): number {
  return a.line === b.line ? a.column - b.column : a.line - b.line;
}

// The `1` is to indicate a newline character between the lines.
// Note that in the actual contents there could be more than one character that indicates a newline
// - e.g. \r\n - but that is not important here since segment-markers are in line/column pairs and
// so differences in length due to extra `\r` characters do not affect the algorithms.
const NEWLINE_MARKER_OFFSET = 1;

/**
 * Compute the difference between two segment markers in a source file.
 *
 * @param lineLengths the lengths of each line of content of the source file where we are computing
 * the difference
 * @param a the start marker
 * @param b the end marker
 * @returns the number of characters between the two segments `a` and `b`
 */
export function segmentDiff(lineLengths: number[], a: SegmentMarker, b: SegmentMarker) {
  let diff = b.column - a.column;

  // Deal with `a` being before `b`
  for (let lineIndex = a.line; lineIndex < b.line; lineIndex++) {
    diff += lineLengths[lineIndex] + NEWLINE_MARKER_OFFSET;
  }

  // Deal with `a` being after `b`
  for (let lineIndex = a.line - 1; lineIndex >= b.line; lineIndex--) {
    // The `+ 1` is the newline character between the lines
    diff -= lineLengths[lineIndex] + NEWLINE_MARKER_OFFSET;
  }
  return diff;
}

/**
 * Return a new segment-marker that is offset by the given number of characters.
 *
 * @param lineLengths The length of each line in the source file whose segment-marker we are
 * offsetting.
 * @param marker The segment to offset.
 * @param offset The number of character to offset by.
 */
export function offsetSegment(lineLengths: number[], marker: SegmentMarker, offset: number) {
  if (offset === 0) {
    return marker;
  }

  let line = marker.line;
  let column = marker.column + offset;

  while (line < lineLengths.length - 1 && column > lineLengths[line]) {
    column -= lineLengths[line] + NEWLINE_MARKER_OFFSET;
    line++;
  }
  while (line > 0 && column < 0) {
    line--;
    column += lineLengths[line] + NEWLINE_MARKER_OFFSET;
  }

  return {line, column};
}
