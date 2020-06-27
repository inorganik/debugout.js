# Changelog

### v 1.0.0 (06/27/20)

- Rewritten in typescript
- Modularized
- More options
- Tests with jest
- Improved logging (multiple args, better formatting)

### v 0.5.0 (9/02/14)

- Added `search()` 
- Added `getSlice()` 
- Removed logging of `getLog()`
- Improved demo, README

### v 0.4.0 (8/26/14)

- Added Auto-trim feature to keep the log capped at the most recent 2500 lines
- Added `tail()` to just get just the last 100 lines
- Added `downloadLog()`
- Fixed a bug where nested zeroes wouldn't log

### v 0.3.0 (6/19/14)

- Added changelog
- fixed a bug where determineType() would try to evaluate a null object
- added recordLogs option so that log recording could be turned off when going to production, to avoid the log eating up memory.