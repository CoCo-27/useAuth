function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=require("react"),r=e(t),n=e(require("auth0-js")),o=require("@xstate/react"),a=require("date-fns"),i=require("xstate");function u(){return(u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}var s=i.Machine({id:"useAuth",initial:"unauthenticated",context:{user:{},expiresAt:null,authResult:null,isAuthenticating:!1,error:void 0,errorType:void 0,config:{navigate:function(){return console.error("Please specify a navigation method that works with your router")},callbackDomain:"http://localhost:8000",customPropertyNamespace:"http://localhost:8000"}},states:{unauthenticated:{on:{LOGIN:"authenticating",SET_CONFIG:{actions:["setConfig"]}}},authenticating:{on:{ERROR:"error",AUTHENTICATED:"authenticated",SET_CONFIG:{actions:["setConfig"]}},entry:["startAuthenticating"],exit:["stopAuthenticating"]},authenticated:{on:{LOGOUT:"unauthenticated",SET_CONFIG:{actions:["setConfig"]}},entry:["saveUserToContext","saveToLocalStorage"],exit:["clearUserFromContext","clearLocalStorage"]},error:{entry:["saveErrorToContext","clearUserFromContext","clearLocalStorage"]}}},{actions:{startAuthenticating:i.assign(function(e){return{isAuthenticating:!0}}),stopAuthenticating:i.assign(function(e){return{isAuthenticating:!1}}),saveUserToContext:i.assign(function(e,t){var r=t.authResult;return{user:t.user,authResult:r,expiresAt:a.addSeconds(new Date,r.expiresIn)}}),clearUserFromContext:i.assign(function(e){return{user:{},expiresAt:null,authResult:null}}),saveToLocalStorage:function(e,t){var r=e.expiresAt,n=e.user;"undefined"!=typeof localStorage&&(localStorage.setItem("useAuth:expires_at",r?r.toISOString():"0"),localStorage.setItem("useAuth:user",JSON.stringify(n)))},clearLocalStorage:function(){"undefined"!=typeof localStorage&&(localStorage.removeItem("useAuth:expires_at"),localStorage.removeItem("useAuth:user"))},saveErrorToContext:i.assign(function(e,t){return{errorType:t.errorType,error:t.error}}),setConfig:i.assign(function(e,t){return{config:u({},e.config,t)}})}}),c=i.interpret(s);c.start(),function(e){if("undefined"!=typeof localStorage){var t=new Date(localStorage.getItem("useAuth:expires_at")||"0"),r=new Date;if(console.log("HYDRATING",t,t>=r),a.isAfter(t,r)){console.log("Yes authing");var n=JSON.parse(localStorage.getItem("useAuth:user")||"{}");console.log(n),e("LOGIN"),e("AUTHENTICATED",{user:n,authResult:{expiresIn:a.differenceInSeconds(t,r)}}),console.log(c.state)}}}(c.send);var l=function(){var e=o.useService(c),r=e[0],n=e[1],i=r.context.config,u=i.authProvider,s=i.navigate,l=i.callbackDomain,h=i.customPropertyNamespace,d=t.useCallback(function(e){var t=(void 0===e?{}:e).postLoginRoute,r=void 0===t?"/":t;u&&s&&l?"undefined"!=typeof window&&(n("LOGIN"),u.parseHash(function(e,t){try{return Promise.resolve(function(e){var t=e.err,r=e.dispatch,n=e.authProvider,o=e.authResult;try{return o&&o.accessToken&&o.idToken?Promise.resolve(function(e,t){try{var a=Promise.resolve(function(e){var t=e.dispatch,r=e.authProvider,n=e.authResult;try{return Promise.resolve(new Promise(function(e,o){r.client.userInfo(n.accessToken||"",function(r,a){r?(t("ERROR",{errorType:"userInfo",error:r}),o(r)):(t("AUTHENTICATED",{authResult:n,user:a}),e(a))})}))}catch(e){return Promise.reject(e)}}({dispatch:r,authProvider:n,authResult:o})).then(function(){return!0})}catch(e){return!1}return a&&a.then?a.then(void 0,function(){return!1}):a}()):t?(console.error(t),r("ERROR",{error:t,errorType:"authResult"}),Promise.resolve(!1)):Promise.resolve(!1)}catch(e){return Promise.reject(e)}}({err:e,authResult:t,dispatch:n,authProvider:u})).then(function(){s(r)})}catch(e){return Promise.reject(e)}})):console.warn("authProvider not configured yet")},[u,s,l]),f=function(){return!(!r.context.expiresAt||!a.isAfter(r.context.expiresAt,new Date))};return{isAuthenticating:r.context.isAuthenticating,isAuthenticated:f,isAuthorized:function(e){var t=Array.isArray(e)?e:[e],n=r.context.user[(h+"/user_metadata").replace(/\/+user_metadata/,"/user_metadata")];return!(!f()||!n)&&t.some(function(e){return n.roles.includes(e)})},user:r.context.user,userId:r.context.user?r.context.user.sub:null,authResult:r.context.authResult,login:function(){u&&u.authorize()},signup:function(){u&&u.authorize({mode:"signUp",screen_hint:"signup"})},logout:function(){u&&u.logout({returnTo:l}),n("LOGOUT"),s("/")},handleAuthentication:d,dispatch:n}};exports.AuthProvider=function(e){var o=e.children,a=e.navigate,i=e.auth0_domain,s=e.auth0_params,c=void 0===s?{}:s,h=e.customPropertyNamespace,d="undefined"!=typeof window?window.location.protocol+"//"+window.location.host:"http://localhost:8000",f={domain:i,clientID:e.auth0_client_id,redirectUri:d+"/auth0_callback",audience:"https://"+(e.auth0_audience_domain||i)+"/api/v2/",responseType:"token id_token",scope:"openid profile email"},p=l().dispatch;return t.useEffect(function(){var e=new n.WebAuth(u({},f,c));p("SET_CONFIG",{authProvider:e,navigate:a,customPropertyNamespace:h,callbackDomain:d})},[a,h,d]),r.createElement(r.Fragment,null,o)},exports.useAuth=l;
//# sourceMappingURL=index.js.map
