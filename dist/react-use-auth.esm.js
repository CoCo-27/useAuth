import t, {
    useCallback as e,
    useEffect as n,
    createElement as o,
    Fragment as r
} from "react";
import { useService as i } from "@xstate/react";
import {
    addSeconds as a,
    isAfter as u,
    differenceInSeconds as c
} from "date-fns";
import { Machine as s, assign as l, interpret as h } from "xstate";
import { choose as d } from "xstate/lib/actions";
function f() {
    return (f =
        Object.assign ||
        function(t) {
            for (var e = 1; e < arguments.length; e++) {
                var n = arguments[e];
                for (var o in n)
                    Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
            }
            return t;
        }).apply(this, arguments);
}
var g = h(
    s(
        {
            id: "useAuth",
            initial: "unauthenticated",
            context: {
                user: {},
                expiresAt: null,
                authResult: null,
                isAuthenticating: !1,
                error: void 0,
                errorType: void 0,
                config: {
                    navigate: function() {
                        return console.error(
                            "Please specify a navigation method that works with your router"
                        );
                    },
                    callbackDomain: "http://localhost:8000"
                }
            },
            states: {
                unauthenticated: {
                    on: {
                        LOGIN: "authenticating",
                        CHECK_SESSION: "verifying",
                        SET_CONFIG: { actions: ["setConfig"] }
                    }
                },
                authenticating: {
                    on: {
                        ERROR: "error",
                        AUTHENTICATED: "authenticated",
                        SET_CONFIG: { actions: ["setConfig"] }
                    },
                    entry: ["startAuthenticating"],
                    exit: ["stopAuthenticating"]
                },
                verifying: {
                    invoke: {
                        id: "checkSession",
                        src: function(t, e) {
                            return t.config.authProvider.checkSession();
                        },
                        onDone: { target: "authenticated" },
                        onError: {
                            target: "unauthenticated",
                            actions: [
                                "clearUserFromContext",
                                "clearLocalStorage"
                            ]
                        }
                    },
                    entry: ["startAuthenticating"],
                    exit: ["stopAuthenticating"]
                },
                authenticated: {
                    on: {
                        LOGOUT: "unauthenticated",
                        SET_CONFIG: { actions: ["setConfig"] },
                        CHECK_SESSION: "verifying"
                    },
                    entry: ["saveUserToContext", "saveToLocalStorage"],
                    exit: d([
                        {
                            cond: function(t, e) {
                                return "CHECK_SESSION" !== e.type;
                            },
                            actions: [
                                "clearUserFromContext",
                                "clearLocalStorage"
                            ]
                        }
                    ])
                },
                error: {
                    entry: [
                        "saveErrorToContext",
                        "clearUserFromContext",
                        "clearLocalStorage"
                    ]
                }
            }
        },
        {
            actions: {
                startAuthenticating: l(function(t) {
                    return { isAuthenticating: !0 };
                }),
                stopAuthenticating: l(function(t) {
                    return { isAuthenticating: !1 };
                }),
                saveUserToContext: l(function(t, e) {
                    var n = e.data ? e.data : e,
                        o = n.authResult;
                    return {
                        user: n.user,
                        authResult: o,
                        expiresAt: a(new Date(), o.expiresIn)
                    };
                }),
                clearUserFromContext: l(function(t) {
                    return { user: {}, expiresAt: null, authResult: null };
                }),
                saveToLocalStorage: function(t, e) {
                    var n = t.expiresAt,
                        o = t.user;
                    "undefined" != typeof localStorage &&
                        (localStorage.setItem(
                            "useAuth:expires_at",
                            n ? n.toISOString() : "0"
                        ),
                        localStorage.setItem(
                            "useAuth:user",
                            JSON.stringify(o)
                        ));
                },
                clearLocalStorage: function() {
                    "undefined" != typeof localStorage &&
                        (localStorage.removeItem("useAuth:expires_at"),
                        localStorage.removeItem("useAuth:user"));
                },
                saveErrorToContext: l(function(t, e) {
                    return { errorType: e.errorType, error: e.error };
                }),
                setConfig: l(function(t, e) {
                    return { config: f({}, t.config, e) };
                })
            }
        }
    )
);
g.start(),
    (function(t) {
        if ("undefined" != typeof localStorage) {
            var e = new Date(localStorage.getItem("useAuth:expires_at") || "0"),
                n = new Date();
            if (u(e, n)) {
                var o = JSON.parse(
                    localStorage.getItem("useAuth:user") || "{}"
                );
                t("LOGIN"),
                    t("AUTHENTICATED", {
                        user: o,
                        authResult: { expiresIn: c(e, n) }
                    });
            }
        }
    })(g.send);
var p = function() {
        var t = i(g),
            n = t[0],
            o = t[1],
            r = n.context.config,
            a = r.authProvider,
            c = r.navigate,
            s = r.callbackDomain,
            l = e(
                function(t) {
                    var e = (void 0 === t ? {} : t).postLoginRoute,
                        n = void 0 === e ? "/" : e;
                    try {
                        if (!a || !c)
                            return (
                                console.warn("authProvider not configured yet"),
                                Promise.resolve()
                            );
                        var r = (function() {
                            if ("undefined" != typeof window)
                                return (
                                    o("LOGIN"),
                                    Promise.resolve(
                                        a.handleLoginCallback(o)
                                    ).then(function(t) {
                                        t && c(n);
                                    })
                                );
                        })();
                        return Promise.resolve(
                            r && r.then ? r.then(function() {}) : void 0
                        );
                    } catch (t) {
                        return Promise.reject(t);
                    }
                },
                [a, c]
            ),
            h = function() {
                return !(
                    !n.context.expiresAt || !u(n.context.expiresAt, new Date())
                );
            };
        return {
            isAuthenticating: n.context.isAuthenticating,
            isAuthenticated: h,
            isAuthorized: function(t) {
                var e = Array.isArray(t) ? t : [t],
                    o = null == a ? void 0 : a.userRoles(n.context.user);
                return (
                    !(!h() || !o) &&
                    e.some(function(t) {
                        return o.includes(t);
                    })
                );
            },
            user: n.context.user,
            userId: null == a ? void 0 : a.userId(n.context.user),
            authResult: n.context.authResult,
            login: function() {
                null == a || a.authorize();
            },
            signup: function() {
                null == a || a.signup();
            },
            logout: function(t) {
                "string" == typeof t
                    ? null == a || a.logout("" + s + t)
                    : null == a || a.logout(),
                    o("LOGOUT"),
                    c("string" == typeof t ? t : "/");
            },
            handleAuthentication: l,
            dispatch: o
        };
    },
    v = function(e) {
        var o = e.children,
            r = e.navigate,
            i = e.auth0_domain,
            a = e.auth0_params,
            u = void 0 === a ? {} : a,
            c = e.customPropertyNamespace,
            s = {
                domain: i,
                clientID: e.auth0_client_id,
                redirectUri:
                    ("undefined" != typeof window
                        ? window.location.protocol + "//" + window.location.host
                        : "http://localhost:8000") + "/auth0_callback",
                audience:
                    "https://" + (e.auth0_audience_domain || i) + "/api/v2/",
                responseType: "token id_token",
                scope: "openid profile email"
            },
            l = p().dispatch;
        return (
            n(
                function() {
                    import("react-use-auth/auth0").then(function(t) {
                        var e = new (0, t.Auth0)(
                            f({ dispatch: l, customPropertyNamespace: c }, s, u)
                        );
                        l("SET_CONFIG", { authProvider: e, navigate: r }),
                            l("CHECK_SESSION");
                    });
                },
                [r, c]
            ),
            n(function() {
                console.warn(
                    "Using the AuthProvider root component is deprecated. Migrate to AuthConfig or manual dispatching. Takes 5min."
                );
            }, []),
            t.createElement(t.Fragment, null, o)
        );
    },
    m = function(t) {
        var e = t.authProvider,
            i = t.params,
            a = t.navigate,
            u = t.children,
            c = p().dispatch,
            s =
                "undefined" != typeof window
                    ? window.location.protocol + "//" + window.location.host
                    : "http://localhost:8000";
        return (
            n(
                function() {
                    var t = new e(f({ dispatch: c }, e.addDefaultParams(i, s)));
                    c("SET_CONFIG", {
                        authProvider: t,
                        navigate: a,
                        callbackDomain: s
                    }),
                        c("CHECK_SESSION");
                },
                [c, e, i, a]
            ),
            o(r, null, u)
        );
    };
export { m as AuthConfig, v as AuthProvider, p as useAuth };
//# sourceMappingURL=react-use-auth.esm.js.map
