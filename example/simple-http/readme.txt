# Simple HTTP application server example

## Start

    cd example/simple-http
    wirez

This command will start wirez. No application is installed in the server by default, so to test the `app1` sample, open a new terminal and type:

    cd example/simple-http
    wirez install app1

Now you can point your browser to `http://localhost:9090/hello` and see that the `app1` was installed.
You can also install other applications (create them using app1 as a template), or modify the `example/simple-http/app1.js` and see that is is reloaded into the server, without the server being closed. 