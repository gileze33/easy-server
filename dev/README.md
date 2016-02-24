# EasyServer-Dev

Really lightweight wrapper around express to help you make a neat app from day one.

## Important
This is dev version of [`easy-server`]((https://github.com/urbanmassage/easy-server)) that hot-reloads controllers when they change.
It's not meant to be used in production environment.

Options are identical to `easy-server`, so you can check the documentation [here](https://github.com/urbanmassage/easy-server).

To use, just swap easy-server with easy-server-dev when needed.

```
var EasyServer = require('easy-server');
if (process.env.HOT) {
  EasyServer = require('easy-server-dev');
}

var app = new EasyServer({
  // ...
});
```
