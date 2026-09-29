# Bash URL Cleaner

CLI that removes common tracking parameters and fragments from absolute HTTP(S) URLs. Remaining query keys sort deterministically. Uses Python standard library internally for reliable parsing.

## Run

```sh
./clean.sh "https://example.com/path?utm_source=mail&b=2&a=1#section"
```

Output:

```text
https://example.com/path?a=1&b=2
```

## Test

```sh
./test.sh
```
