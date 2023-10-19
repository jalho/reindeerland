#include "rwp-streams.h"

int rwp_sequence_match(char c, RWP_DetectableCharacterSequence *seq) {
	if (seq->seq[seq->offset] == c) seq->offset++;
	else seq->offset = 0;

	if (seq->seq_size == seq->offset) return 1;
	else return 0;
}
