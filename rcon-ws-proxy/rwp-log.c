#include "rwp-log.h"

void rwp_log(const char *message) {
    time_t foo = time(NULL);
    if (foo > 0) printf("[%ld] ", foo);
    printf(message);
}
