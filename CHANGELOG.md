# 2.0.0
- Rewritten in TypeScript!
- Breaking changes:
  - easyServer is now a function, not a class constructor
  i.e. to create a new server, you should use `var server = easyServer(options);` instead of
  `var server = new EasyServer(options);`.
  - easyServer is now a subclass of `express.Server`. i.e. You should replace all references
  to `server.server.*` with just `server.*`
- You can now get a reference to the undelying http server when you call `.start` the same
  way you do when you call `express.listen`.

# 1.4.0
- publishing dev version

# 1.3.0
- CORS middleware
- tab title option

# 1.1.0
- recursive search in controllers and middleware directories
