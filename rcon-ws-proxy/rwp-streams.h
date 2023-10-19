#ifndef RWP_STREAMS_H
#define RWP_STREAMS_H

typedef struct {
	char *seq;
	int offset;
	int seq_size;
} RWP_DetectableCharacterSequence;

/**
 * Match given character against given sequence of characters.
 *
 * @return 1 if match, 0 otherwise
 */
int rwp_sequence_match(char c, RWP_DetectableCharacterSequence *seq);

#endif
