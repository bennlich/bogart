var assert = require("test/assert");
var util = require("util");
var Bogart = require("bogart");

var Request = require("jack/request").Request,
        MockRequest = require("jack/mock").MockRequest,
        Response = require("jack").Response;

exports.testTwoInstancesDoNotShareRoutes = function() {
    var bb = new Bogart.Base();
    var bb2 = new Bogart.Base();

    assert.isFalse(bb._routes == bb2._routes, "Two instances of Bogart.Base should not share routes");
};

(function() {
    // get route tests

    var callbackExecuted = false;

    var app = new Bogart.Base(function() {
        this.route("get", "/", function() { callbackExecuted = true; });
    });
    app.log = function() { };

    exports.testGetRouteNotExecutedWhenVerbIsPost = function() {
        var env = MockRequest.envFor("post", "/", {});
        var req = new Request(env);
        callbackExecuted = false;

        app.start(env, req, new Response(env));

        assert.isFalse(callbackExecuted);
    };

    exports.testGetRouteExecuted = function() {
        var env = MockRequest.envFor("get", "/", {});
        callbackExecuted = false;

        app.start(env);

        assert.isTrue(callbackExecuted);
    };


})();

exports.testGetRouteWithParameters = function() {
    var idParamValue = "foo";

    var app = new Bogart.Base(function() {
        with(this) {
            route("get", "/:id", function() {
                assert.isTrue(this.params["id"] == idParamValue);
            });
        }
    });

    var env = MockRequest.envFor("get", "/" + idParamValue, {});
    var req = new Request(env);

    app.start(env, req, new Response(env));
};

exports.testGetRouteWithComplexPath = function() {
    var idParamValue = "foo";
    var showIdParamValue = "bar";

    var app = new Bogart.Base(function() {
        with(this) {
            route("post", "/venue/:id/shows/:show_id", function() {
                assert.isTrue(this.params["id"] == idParamValue, "Expected " + idParamValue + " got " + this.params["id"]);
                assert.isTrue(this.params["show_id"] == showIdParamValue);
            });
        }
    });

    var env = MockRequest.envFor("post", "/venue/" + idParamValue + "/shows/" + showIdParamValue);
    var req = new Request(env);

    app.start(env, req, new Response(env));
};

exports.testParamsAreNotHtmlEscaped = function(){
    var paramValue = escape("this string is escaped");
    var routeHandlerParamValue = "";

    var app = new Bogart.Base(function() {
        this.route("get", "/:id", function() {
            routeHandlerParamValue = this.params["id"];
        });
    });

    var env = MockRequest.envFor("get", "/" + paramValue);
    var req = new Request(env);

    app.start(env, req, new Response(env));

    assert.isEqual(unescape(paramValue), routeHandlerParamValue);
};

exports.testMatchesLongestRouteFirst = function() {
    var longerCalled = false;
    var app1 = new Bogart.Base(function() {
        with(this) {
            route("get", "/venue/:id", function() {
            });
            route("get", "/venue/:id/shows/:show_id", function() {
                longerCalled = true;
            });
        }
    });
    var app2 = new Bogart.Base(function() {
        with(this) {
            route("get", "/venue/:id/shows/:show_id", function() {
                longerCalled = true;
            });
            route("get", "/venue/:id", function() {
            });
        }
    });

    [app1, app2].forEach(function(app) {
        var env = MockRequest.envFor("get", "/venue/foo/shows/bar");
        longerCalled = false;
        app.start(env, new Request(env), new Response(env));
        assert.isTrue(longerCalled);
    });
};

exports.testTemplateIsDefined = function() {
    new Bogart.Base(function() {
        with(this) {
            route("get", "/", function() {
                assert.isTrue(this.template != null);
            });
        }
    });
};

exports.testObjectCreation = function() {
    var obj1 = new Bogart.Base();
    var obj2 = new Bogart.Base();

    assert.isFalse(obj1 == obj2);
};

exports.testRedirectTo = function() {
    var base = new Bogart.Base(function() {
        this.route("get", "/", function() {
            assert.isFalse(this.redirectTo == null, "redirectTo should exist in context of a route handler");
            var rv = this.redirectTo("/test");

            assert.isTrue(rv[0] == 302, "Should return redirect response");

            return rv;
        });
    });

    var env = MockRequest.envFor("get", "/");

    base.start(env);
};

exports.testTemplate = function() {
    var base = new Bogart.Base(function() {
        this.route("get", "/time", function() {
            return this.jsontemplate("index", {});
        });
    });
    var env = MockRequest.envFor("get", "/time");

    base.start(env);
};
