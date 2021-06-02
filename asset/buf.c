#include <stdlib.h>
#include <string.h>

#include "emscripten.h"
#include "./mem.h"

EMSCRIPTEN_KEEPALIVE
BYTE *create_buffer(int size)
{
    return malloc(size);
}

EMSCRIPTEN_KEEPALIVE
void destroy_buffer(BYTE *p, int size)
{
    free(p);
    memset(p, 0, size);
}
