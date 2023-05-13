# map-service (C implementation)

Serves the latest map (a PNG image file) matching given parameters over HTTP.
The parameters are e.g. map seed and size.

## build

```bash
cd map-service/c/
make clean
make main
```

## development workflow

```bash
cd map-service/c/
make clean
make debug
gdb -tui ./build/main
```
