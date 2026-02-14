/**
 * Subtitle Interval Splitting & SRT Generation
 *
 * Processes transcription chunks into properly segmented subtitles
 * and generates SRT or plain text output.
 */

/**
 * Re-segment transcription chunks based on max interval.
 * Splits long chunks at sentence boundaries without exceeding maxInterval.
 *
 * @param {Array<{start: number, end: number, text: string}>} chunks
 * @param {number} maxInterval - max seconds per subtitle segment
 * @returns {Array<{start: number, end: number, text: string}>}
 */
export function resegment(chunks, maxInterval) {
  const result = [];

  for (const chunk of chunks) {
    const duration = chunk.end - chunk.start;

    if (duration <= maxInterval) {
      result.push(chunk);
      continue;
    }

    // Split long chunks proportionally by character count
    const sentenceBreaks = /([。.!?！？\n])/g;
    const parts = chunk.text
      .split(sentenceBreaks)
      .reduce((acc, part, i, arr) => {
        if (i % 2 === 0) {
          acc.push(part + (arr[i + 1] || ''));
        }
        return acc;
      }, [])
      .filter(Boolean);

    if (parts.length <= 1) {
      result.push(chunk);
      continue;
    }

    const totalLen = parts.reduce((sum, p) => sum + p.length, 0);
    let currentTime = chunk.start;

    let buffer = '';
    let segStart = currentTime;

    for (const part of parts) {
      const partDuration = (part.length / totalLen) * duration;
      buffer += part;
      currentTime += partDuration;

      if (
        currentTime - segStart >= maxInterval ||
        part === parts[parts.length - 1]
      ) {
        result.push({
          start: segStart,
          end: Math.min(currentTime, chunk.end),
          text: buffer.trim(),
        });
        buffer = '';
        segStart = currentTime;
      }
    }
  }

  return result;
}

/**
 * Format seconds to SRT timestamp: HH:MM:SS,mmm
 *
 * @param {number} seconds
 * @returns {string}
 */
function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/**
 * Generate SRT format string from subtitle segments.
 *
 * @param {Array<{start: number, end: number, text: string}>} segments
 * @returns {string}
 */
export function generateSRT(segments) {
  return segments
    .map(
      (seg, i) =>
        `${i + 1}\n${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n${seg.text}\n`
    )
    .join('\n');
}

/**
 * Generate plain text transcript from subtitle segments.
 *
 * @param {Array<{start: number, end: number, text: string}>} segments
 * @returns {string}
 */
export function generateText(segments) {
  return segments.map((seg) => seg.text).join('\n');
}
