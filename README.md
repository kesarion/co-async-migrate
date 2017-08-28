# co-async-migrate
Migrate a project from co/yield to async/await

## Install
```
npm i co-async-migrate -g
```

## Usage

```bash
co-async-migrate /path
```

### Options

`--noyield` Don't replace yield;
`--co string` Replace 'string(...)', instead of 'co(...)'; same behaviour otherwise;

> Note: Options should come before the path string.

Example with options:
```bash
co-async-migrate --noyield --co coexpress /path
```
