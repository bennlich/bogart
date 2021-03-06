var
  bogart = require("../../lib/bogart");

var router = bogart.router();

router.get("/", function(req) {
  return bogart.html("<html><body><img src='/images/ninja-cat.jpg' /></body></html>");
});

var root = require("path").join(__dirname, "public");

var app = bogart.app();
app.use(bogart.middleware.directory(root));
app.use(router);

app.start();
