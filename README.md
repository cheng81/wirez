# Wirez: runtime management of module dependencies for node

## Install

I am going to publish on npm, in the mean time you can download the code and npm-link it.

## Features

 - Simple programming model
 - Reload modules dynamically (hot code reloading)
 - Reload dependent modules
 - Script version for start an application

## How to use it

Instead of calling `require(module)`, call `require('wirez').r(module)`. This way, Wirez will link `module` as a dependency for the current module. If the dependency is at a certain point stopped, the calling module will be stopped too.

If you have an application and want to use Wirez to enjoy the dynamic module reloading, create an `index.js` file in the root directory, in which you will call the main module, like this:

    require('wirez').r('./main')

Then navigate on the directory and type

    wirez

This will start node and Wirez. If you change one of the module of your application, Wirez will notice this, and reload the changed module. Dependent modules will be reloaded too.

A *very* simple example is in the example directory. Just go there and type wirez.

## Gotchas

I just started to build this "thing" (as of 23/02/2011), and for my needs is quite good. Of course there must be dozens of cases that I have not handled yet. If so and you badly want some feature, please either file a request or even better, collaborate on the project.

I currently managed to force a reload of a module code by deleting the cache in the `require` function. This is not very well supported by the node guys, and it might broke anytime. Also the way I get the "calling" module (the module where you write `require`) is rather tricky (I navigate through the function callers and find the `require` caller, in which I know where to find the filename of the module). If you want to see this, have a look at `lib/wirez/misc.js` and `lib/reloader/misc.js`)