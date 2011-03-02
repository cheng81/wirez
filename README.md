# Wirez: runtime management of module dependencies for node

## Dependencies

### Wirez 0.0.1/2

  - [wu](http://fitzgen.github.com/wu.js/ wu), 0.1.8

## Install

`npm install wirez`

## Features

 - Simple programming model
 - Reload modules dynamically (hot code reloading)
 - Reload dependent modules
 - Script version for start an application

## When to use Wirez

First and most important: you do not use Wirez to handle system modules (such as `http` or other npm-installed modules). Instead, you want to use Wirez to handle runtime objects, and relationships between them.

As a simple example, imagine that you have an application server that exposes two functions, `register` and `remove`, to manage simple `HTTP` applications. One wirez-module is the one that creates the http-server, and each application requires this module.

Now, if you use Wirez to manage the application modules, you will be able to add, remove and restart http applications without bringing down the http server. See `example/simple-http`.

## How to use it

Instead of calling `require(module)`, call `require('wirez').r(module)`. This way, Wirez will link `module` as a dependency for the current module. If the dependency is at a certain point stopped, the calling module will be stopped too.

If you have an application and want to use Wirez to enjoy the dynamic module reloading, create an `index.js` file in the root directory, in which you will call the main module, like this:

    require('wirez').r('./main')

Then navigate on the directory and type

    wirez

This will start node and Wirez. If you change one of the module of your application, Wirez will notice this, and reload the changed module. Dependent modules will be reloaded too.

A *very* simple example is in the `example/simple` directory. Just go there and type wirez.

## Wirez CLI interface

Wirez can be used to query and modify running wirez processes. Each wirez app starts a control server automatically. As of version 0.0.2, there is a single transport for the command server (unix domain).
In the directory where you started wirez, you can issue the following commands:

 - `wirez list` displays the current installed wirez modules and their status (active, stopped)
 - `wirez info` displays various info. As of versions 0.0.2, only the module dependencies are showed
 - `wirez start <module>` start a stopped module
 - `wirez stop <module>` stop an active module
 - `wirez reload <module>` reload a module. Does not delete the code cache
 - `wirez hotreload <module>` remove the code cache and reload the module
 - `wirez install <module>` install a module
 - `wirez shutdown` stop all modules and wirez itself

The "module" argument for some command is the file name of the module (without the .js extension), relative to the app directory; e.g. if wirez is running in the directory `/Users/foo/myapp/` and you want to install the module `/Users/foo/myapp/mylib/bar.js`, then the right command is: `wirez install mylib/bar`.

## Gotchas

I just started to build this "thing" (as of 23/02/2011), and for my needs is quite good. Of course there must be dozens of cases that I have not handled yet. If so and you badly want some feature, please either file a request or even better, collaborate on the project.

I currently managed to force a reload of a module code by deleting the cache in the `require` function. This is not very well supported by the node guys, and it might broke anytime. Also the way I get the "calling" module (the module where you write `require`) is rather tricky (I navigate through the function callers and find the `require` caller, in which I know where to find the filename of the module). If you want to see this, have a look at `lib/wirez/misc.js` and `lib/reloader/misc.js`)

## Wish list

 - Handle directory module dependencies
 - Asynchronous start/stop of modules
 - A decent CLI interface
 - Supervisor behavior: if a module cause the app to crash, it should be stopped and uninstalled
  - currently, if a module crashes, the entire app and wirez will crash too
