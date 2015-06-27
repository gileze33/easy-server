#Easy server

Really lightweight wrapper around express to help you make a neat app from day one

##Options
```
{
    "controllers": "./controllers", // folder containing your controller files
    "middleware": "./middleware", // folder containing your middleware files
    "autoStart": true, // if set to false, you need to call setup()
    "debug": Function, // pass a function to be used as the debug logger
    "cluster": Number // optional - leaving out will run 1 instance of express
}
```

##Example app
```
server.js
|  - app/
|  |  - controllers/
|  |  |  - account.js
|  |  - middleware/
|  |  |  - auth.js
```
```
// server.js
var server = new Server({
    controllers: "./app/controllers",
    middleware: "./app/middleware",
    autoStart: false,
    debug: console.log,
    cluster: 4
});
server.use(require('cookie-parser'));
server.start();
```
```
// app/controllers/account.js
module.exports = {
    controller: function(app) {
        app.get('/account', app.middleware.get('auth'), function(req, res) {
            res.send('Welcome to your account');
        });
    }
};
```
```
// app/middleware/auth.js
module.exports = function(req, res, next) {
    if(!req.cookies['auth']) {
        return res.status(401).send('Unauthorized');
    }
    
    next();
};
```