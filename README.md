# Cynch

Asynchronous synchronization in a cinch. Multi-target file uploading with rsync!

**Note:** Cynch takes advantage of several ES6 features (promises, generators, arrow functions, etc). You may need to run Node with Harmony flags (or upgrade to a newer version).

## What is this?
Certain IDEs (I won't name any) have pretty lame remote development support, especially if you have a need to sync with multiple remote environments. Cynch fixes that. Just specify your source and target(s) and you're ready to go.

## Installation
```bash
npm install -g cynch
```

## Usage
```bash
cynch /path/to/my/config.json
```

If no config file is provided, Cynch will look for `cynch.json` in the current working directory.

## Configuration
The following are possible configuration values.

Name | Required? | Type | Description
---- | --------- | ---- | -----------
source | x | string | Source directory to sync. May be relative to the configuration path.
targets | x | string[] | Target objects (see below)
exclusions | | string[] | Patterns to exclude from the sync (equivalent to passing `--exclude` options to rsync)
inclusions | | string[] | Patterns to include in the sync (equivalent to passing `--include` options to rsync)
rsyncOptions | | string[] | Any additional options to pass to rsync
watch | | boolean | Start a watch to watch for file changes and trigger sync
watchOptions | | object | Watcher Options, See [Chokidar](https://www.npmjs.com/package/chokidar)
watchOptions.waitTimeout | | int | Number of milliseconds to wait for all file change events to finish (default: 300)
debug | | bool | Debug mode
growl | | bool | Allow [Growl Notifications](#growl-notifications) (default: true)

### Target objects
**Tip:** rsync uses your machine's ssh config; you may substitute full `user@host` strings with an entry from your ssh config. (e.g.: `"host": "mybox"`)

```json
{
  "host": "somebody@somewhere.example.com",
  "path": "/some/example/deployment/path"
}
```

### Example config
```json
{
  "source": "~/src/myProject",
  "targets": [
    {
      "host": "pinky",
      "path": "/srv/myProject"
    },
    {
      "host": "jewel",
      "path": "/srv/myProject"
    },
    {
      "host": "arvinne",
      "path": "/srv/myProject"
    }
  ],
  "exclusions": [
    ".git",
    ".idea",
    "node_modules/*"
  ]
}
```

## The Watch Mode

The watch mode is a long running process that watches for file changes in your `source` directory. This can be used with any daemon tool (i.e. launchd, systemd) to ease deployment.

## Growl Notifications

With growl notifications, you can not get notified when `Cynch` succesffully uploads or errors out. In order for notifications to work you will need to install a notifier library.

### Mac OSX (Darwin)

Install [growlnotify(1)](http://growl.info/extras.php#growlnotify). On OS X 10.8, Notification Center is supported using [terminal-notifier](https://github.com/alloy/terminal-notifier). To install:

```
  $ sudo gem install terminal-notifier
```

### Ubuntu (Linux)
Install notify-send through the [libnotify-bin](http://packages.ubuntu.com/libnotify-bin) package:

```
  $ sudo apt-get install libnotify-bin
```

### Windows
Download and install [Growl for Windows](http://www.growlforwindows.com/gfw/default.aspx)

Download [growlnotify](http://www.growlforwindows.com/gfw/help/growlnotify.aspx) - IMPORTANT : Unpack growlnotify to a folder that is present in your path!



##License
ISC




