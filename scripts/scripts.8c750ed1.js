"use strict";
var app = angular.module("roMvpTrackerApp", ["ngAnimate", "ngCookies", "ngResource", "ngRoute", "ngSanitize", "ngTouch", "LocalStorageModule", "firebase", "angularMoment", "ui.router", "ui.bootstrap", "angular-loading-bar", "angular-web-notification", "ngAnimate-animate.css"]);
app.config(["$stateProvider", "$urlRouterProvider", "localStorageServiceProvider", "cfpLoadingBarProvider", function(a, b, c, d) {
  c.setPrefix("roMvpTrackerApp"), d.includeSpinner = !1, a.state("mvp", {
    url: "/mvp",
    templateUrl: "views/mvp.html"
  }), a.state("share", {
    url: "/share",
    templateUrl: "views/share.html"
  }), a.state("login", {
    url: "/login",
    templateUrl: "views/login.html"
  }), a.state("signup", {
    url: "/signup",
    templateUrl: "views/signup.html"
  }), b.otherwise("/mvp")
}]), app.run(["$rootScope", "$state", "firebase", function(a, b, c) {
  a.settings = {}, a.$state = b;
  var d = {
    apiKey: "AIzaSyAR0s-aKQn23_igJ99kE82Fjms2e7B4bBU",
    authDomain: "willbo-kulet.firebaseapp.com",
    databaseURL: "https://willbo-kulet.firebaseio.com",
    storageBucket: "willbo-kulet.appspot.com"
  };
  c.initializeApp(d)
}]), app.controller("MvpCtrl", ["$scope", "$rootScope", "$timeout", "$state", "DataSrv", "webNotification", "time", function(a, b, c, d, e, f, g) {
  var h, i, j = function() {
    a.notifications = {}, a.updateTimer = null, b.$watch("settings.group", function(b, d) {
      c.cancel(h), b !== d && (h = c(a.getTrackList, 2500))
    }), b.$watchGroup(["login.authenticating", "login.authenticated"], function(a, c) {
      b.login.authenticating === !1 && b.login.authenticated === !1 && d.go("login")
    }), a.$watchGroup(["mvpList", "trackList"], function() {
      if ("object" == typeof a.mvpList && "object" == typeof a.trackList) {
        var b, c, d;
        for (var e in a.mvpList) c = a.mvpList[e], c && (b = c.id + c.map, d = a.trackList[b], c.$track = d || {});
        a.update()
      }
    }), angular.element(window).bind("keyup", function(b) {
      17 === b.keyCode && (a.ctrlDown = !1)
    }), angular.element(window).bind("keydown", function(b) {
      17 === b.keyCode && (a.ctrlDown = !0), a.ctrlDown && 70 === b.keyCode && (b.preventDefault(), angular.element("#mvpFilter").select(), window.scrollTo(0, 0))
    }), a.mvpList = e.getMvpList(), g.sync().then(function() {
      a.getTrackList(), a.update()
    }), c(function() {
      a.initialized = !0
    }, 1500)
  };
  a.orderTrackList = function(a) {
    return a && "object" == typeof a && a.$track ? (a.$track.$highlight = "", a.$track.$respawn ? a.$track.$respawn.min < 0 && a.$track.$respawn.max < 0 && -1 * a.$track.$respawn.min > 3600 ? (a.$track.$highlight = "stale", -a.$track.$respawn.min) : (a.$track.$respawn.min > 0 && a.$track.$respawn.min <= 300 ? a.$track.$highlight = "warning" : a.$track.$respawn.min > 0 ? a.$track.$highlight = "" : a.$track.$highlight = "danger", a.$track.$respawn.min <= 0 && a.$track.$respawn.max <= 0 ? Number.MIN_SAFE_INTEGER + a.$track.$respawn.min : Number.MIN_SAFE_INTEGER + a.$track.$respawn.min + 1e4) : (a.$track.$highlight = "", Number.MAX_SAFE_INTEGER)) : void 0
  }, a.getTrackList = function() {
    b.settings.group && (i && i(), a.trackList = e.getObj("tracks/" + b.settings.group), a.trackList.$bindTo(a, "trackList").then(function(a) {
      i = a
    }))
  }, a.getTrack = function(b) {
    if ("object" == typeof a.trackList) {
      var c = b.id + b.map;
      return a.trackList[c] || null
    }
    return null
  }, a.setTrack = function(c, d) {
    if (!g.isSynced()) return void window.alert("Can't set track. Time not synchronized. Please reload the page.");
    var e = c.id + c.map,
      f = g.unix();
    d = d || 0, a.trackList[e] = {
      id: c.id,
      map: c.map,
      name: b.login.userData.username || "",
      time: f - d
    }
  }, a.removeTrack = function(a) {
    var c = window.confirm("Do you want to remove this entry?");
    if (c) {
      var d = a.id + a.map,
        f = e.get("tracks/" + b.settings.group + "/" + d);
      f.remove(), a.$track = {}
    }
  }, a.isValid = function() {
    return a.login.authenticated && a.login.userData.activated && a.login.userData.username && a.settings.group
  }, a.update = function() {
    var d = g.unix();
    if (g.isSynced())
      for (var e = function(a, b) {
          a && window.alert("Unable to show notification: " + a.message)
        }, h = 0; h < a.mvpList.length; h++) {
        var i = a.mvpList[h],
          j = i.id + i.map;
        if (i && i.$track && i.$track.time) {
          var k = Math.round(i.respawn.min - (d - i.$track.time)),
            l = Math.round(i.respawn.max - (d - i.$track.time));
          i.$state = !1;
          var m = 60 * (b.settings.notificationTime || 0);
          if (0 >= k && 0 >= l) {
            i.$state = !0;
            var n = l;
            l = k, k = n
          } else m >= k && b.settings.notificationEnabled && a.notifications[j] !== i.$track.time && (f.showNotification("Ragnarok MVP Tracker", {
            body: i.name + " (" + i.map + ") spawns in " + Math.round(k / 60) + " to " + Math.round(l / 60) + " minutes",
            icon: "images/mvp.be44a668.png",
            autoClose: 3e4
          }, e), a.notifications[j] = i.$track.time);
          i.$track.$respawn = i.$track.$respawn || {}, i.$track.$respawn.min = k, i.$track.$respawn.max = l, -1 * l > 3.2 * i.respawn.max && (i.$track.$respawn = null)
        }
      }
    c.cancel(a.updateTimer), a.updateTimer = c(a.update, 1e3 * (20 - d % 20))
  }, j()
}]), app.controller("SettingsCtrl", ["$scope", "$rootScope", "$timeout", "$state", "$transitions", "$firebaseAuth", "localStorageService", function(a, b, c, d, e, f, g) {
  var h = function() {
    a.settingsDropdown = a.settingsDropdown || {}, a.notificationTimeList = [1, 2, 3, 4, 5];
    var d;
    b.$watch("settings", function() {
      c.cancel(d), d = c(a.save, 2e3)
    }, !0), b.$watch("settings.notificationEnabled", function() {
      Notification && b.settings.notificationEnabled && Notification.requestPermission(function(a) {
        "granted" === a ? b.settings.notificationEnabled = !0 : b.settings.notificationEnabled = !1
      })
    }), a.load()
  };
  a.load = function() {
    b.settings = g.get("settings") || null, b.settings && "object" == typeof b.settings || (b.settings = {
      authKey: "",
      group: "",
      name: "",
      notificationEnabled: !1,
      notificationTime: 1
    })
  }, a.save = function() {
    g.set("settings", b.settings)
  }, b.isValidSettings = function() {
    return b.settings.authKey && b.settings.group && b.settings.name ? !0 : !1
  }, h()
}]), app.service("DataSrv", ["firebase", "$firebaseObject", "$firebaseArray", function(a, b, c) {
  var d = {};
  return d.getMvpList = function() {
    return [{
      id: 1511,
      map: "moc_pryd06",
      name: "Amon Ra (Daydream)",
      respawn: {
        min: 2700,
        max: 4500
      }
    },{
      id: 2362,
      map: "moc_prydn2",
      name: "Amon Ra (Nightmare)",
      respawn: {
        min: 2700,
        max: 4500
      }
    },{
      id: 1096,
      map: "pay_fild04",
      name: "Angeling",
      respawn: {
        min: 3600,
        max: 5400
      }
    }, {
      id: 1096,
      map: "xmas_dun01",
      name: "Angeling",
      respawn: {
        min: 3600,
        max: 5400
      }
    }, {
      id: 1096,
      map: "yuno_fild03",
      name: "Angeling",
      respawn: {
        min: 3600,
        max: 5400
      }
    }, {
      id: 1388,
      map: "yuno_fild05",
      name: "Archangeling",
      respawn: {
        min: 3600,
        max: 3780
      }
    }, {
      id: 1785,
      map: "ra_fild02",
      name: "Atroce",
      respawn: {
        min: 14400,
        max: 15e3
      }
    }, {
      id: 1785,
      map: "ra_fild03",
      name: "Atroce",
      respawn: {
        min: 10800,
        max: 11400
      }
    }, {
      id: 1785,
      map: "ra_fild04",
      name: "Atroce",
      respawn: {
        min: 18e3,
        max: 18600
      }
    }, {
      id: 1785,
      map: "ve_fild01",
      name: "Atroce",
      respawn: {
        min: 10800,
        max: 11400
      }
    }, {
      id: 1785,
      map: "ve_fild02",
      name: "Atroce",
      respawn: {
        min: 21600,
        max: 22200
      }
    }, {
      id: 1630,
      map: "lou_dun03",
      name: "White Lady",
      respawn: {
        min: 7020,
        max: 7620
      }
    }, {
      id: 1039,
      map: "prt_maze03",
      name: "Baphomet",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1873,
      map: "abbey03",
      name: "Beelzebub",
      respawn: {
        min: 36000,
        max: 50400
      }
    }, {
      id: 1646,
      map: "lhz_dun03",
      name: "Bio 3 MVP",
      respawn: {
        min: 6e3,
        max: 7800
      }
    }, {
      id: 2231,
      map: "lhz_dun04",
      name: "Bio 4 MVP",
      respawn: {
        min: 6e3,
        max: 7800
      }
    }, {
      id: 2068,
      map: "bra_dun02",
      name: "Boitata",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1272,
      map: "gl_chyard",
      name: "Dark Lord [DL]",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1719,
      map: "abyss_03",
      name: "Detale",
      respawn: {
        min: 9900,
        max: 11700
      }
    }, {
      id: 1582,
      map: "pay_fild04",
      name: "Deviling",
      respawn: {
        min: 7200,
        max: 10800
      }
    }, {
      id: 1582,
      map: "yuno_fild03",
      name: "Deviling",
      respawn: {
        min: 3600,
        max: 5400
      }
    }, {
      id: 1046,
      map: "gef_dun02",
      name: "Doppelganger",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1389,
      map: "gef_dun01",
      name: "Dracula",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1112,
      map: "treasure02",
      name: "Drake",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1115,
      map: "pay_fild11",
      name: "Eddga",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1652,
      map: "lhz_dun02",
      name: "Egnigem Cenia [GEC]",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1418,
      map: "gon_dun03",
      name: "Evil Snake Lord [ESL]",
      respawn: {
        min: 5640,
        max: 6240
      }
    }, {
      id: 1871,
      map: "abbey02",
      name: "Fallen Bishop Hibram [FBH]",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1252,
      map: "xmas_fild01",
      name: "Garm",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1120,
      map: "pay_fild04",
      name: "Ghostring",
      respawn: {
        min: 3600,
        max: 5400
      }
    }, {
      id: 1120,
      map: "prt_maze03",
      name: "Ghostring",
      respawn: {
        min: 6780,
        max: 10200
      }
    }, {
      id: 1120,
      map: "treasure02",
      name: "Ghostring",
      respawn: {
        min: 1980,
        max: 3180
      }
    }, {
      id: 1768,
      map: "ra_san05",
      name: "Gloom Under Night",
      respawn: {
        min: 17100,
        max: 18900
      }
    }, {
      id: 1086,
      map: "prt_sewb4",
      name: "Golden Thief Bug [GTB]",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1885,
      map: "mosk_dun03",
      name: "Gopinich",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1990,
      map: "man_fild03",
      name: "Hardrock Mammoth",
      respawn: {
        min: 14400,
        max: 14460
      }
    }, {
      id: 1832,
      map: "thor_v03",
      name: "Ifrit",
      respawn: {
        min: 32400,
        max: 46800
      }
    }, {
      id: 1492,
      map: "ama_dun03",
      name: "Incantation Samurai",
      respawn: {
        min: 5460,
        max: 6060
      }
    }, {
      id: 1734,
      map: "kh_dun02",
      name: "Kiel D-01",
      respawn: {
        min: 7200,
        max: 10800
      }
    }, {
      id: 2202,
      map: "iz_dun05",
      name: "Kraken",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1779,
      map: "ice_dun03",
      name: "Ktullanux",
      respawn: {
        min: 7200,
        max: 7260
      }
    }, {
      id: 1688,
      map: "ayo_dun02",
      name: "Lady Tanee",
      respawn: {
        min: 21600,
        max: 28800
      }
    }, {
      id: 2156,
      map: "dew_dun01",
      name: "Leak",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1373,
      map: "niflheim",
      name: "Lord of Death [LOD]",
      respawn: {
        min: 7980,
        max: 8040
      }
    }, {
      id: 1147,
      map: "anthell02",
      name: "Maya",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1289,
      map: "anthell01",
      name: "Maya Purple",
      respawn: {
        min: 7200,
        max: 10800
      }
    }, {
      id: 1059,
      map: "mjolnir_04",
      name: "Mistress",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1150,
      map: "pay_dun04",
      name: "Moonlight Flower",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1087,
      map: "gef_fild02",
      name: "Orc Hero",
      respawn: {
        min: 86400,
        max: 87e3
      }
    }, {
      id: 1087,
      map: "gef_fild14",
      name: "Orc Hero",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1190,
      map: "gef_fild10",
      name: "Orc Lord",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1038,
      map: "moc_pryd04",
      name: "Osiris",
      respawn: {
        min: 3600,
        max: 10800
      }
    }, {
      id: 1157,
      map: "in_sphinx5",
      name: "Pharaoh",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1159,
      map: "moc_fild17",
      name: "Phreeoni",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 2087,
      map: "dic_dun02",
      name: "Queen Scaraba",
      respawn: {
        min: 7200,
        max: 7260
      }
    }, {
      id: 2165,
      map: "dic_dun03",
      name: "Gold Queen Scaraba",
      respawn: {
        min: 7200,
        max: 7260
      }
    }, {
      id: 1623,
      map: "ein_dun02",
      name: "RSX-0806",
      respawn: {
        min: 6600,
        max: 8400
      }
    }, {
      id: 1916,
      map: "moc_fild21",
      name: "Satan Morroc [SM]",
      respawn: {
        min: 43200,
        max: 54e3
      }
    }, {
      id: 1251,
      map: "xmas_dun02",
      name: "Stormy Knight [SK]",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1583,
      map: "beach_dun",
      name: "Tao Gunka (West) [TGK]",
      respawn: {
        min: 17100,
        max: 18900
      }
    }, {
      id: 1583,
      map: "beach_dun2",
      name: "Tao Gunka (North) [TGK]",
      respawn: {
        min: 17100,
        max: 18900
      }
    }, {
      id: 1583,
      map: "beach_dun3",
      name: "Tao Gunka (East) [TGK]",
      respawn: {
        min: 17100,
        max: 18900
      }
    }, {
      id: 1991,
      map: "spl_fild03",
      name: "Tendrillion",
      respawn: {
        min: 3600,
        max: 3660
      }
    }, {
      id: 1708,
      map: "thana_boss",
      name: "Thanatos",
      respawn: {
        min: 7200,
        max: 7260
      }
    }, {
      id: 1312,
      map: "tur_dun04",
      name: "Turtle General [TG]",
      respawn: {
        min: 2700,
        max: 4500
      }
    }, {
      id: 1751,
      map: "odin_tem03",
      name: "Valkyrie Randgris [VR]",
      respawn: {
        min: 28800,
        max: 50400
      }
    }, {
      id: 1685,
      map: "jupe_core",
      name: "Vesper",
      respawn: {
        min: 6300,
        max: 8100
      }
    }, {
      id: 1917,
      map: "moc_fild22",
      name: "Wounded Morroc [WM]",
      respawn: {
        min: 43200,
        max: 54e3
      }
    }]
  }, d.get = function(b) {
    var c = a.database().ref(b);
    return c
  }, d.getObj = function(a) {
    var c = d.get(a),
      e = b(c);
    return e
  }, d.getArr = function(a) {
    var b = d.get(a),
      e = c(b);
    return e
  }, d
}]), app.filter("ceil", function() {
  return function(a) {
    return Math.ceil(a)
  }
}), app.service("time", ["$rootScope", "$http", function(a, b) {
  var c = {},
    d = 0,
    e = 0,
    f = !1;
  return c.sync = function() {
    return b.get("https://ntp-a1.nict.go.jp/cgi-bin/json").then(function(a) {
      e = Math.floor(a.data.st), d = Math.floor((new Date).getTime() / 1e3), f = !0
    })["catch"](function(a) {
      f = !1
    })
  }, c.isSynced = function() {
    return f
  }, c.unix = function() {
    var a = Math.floor((new Date).getTime() / 1e3);
    if (!f) return a;
    var b = a - d,
      c = e + b;
    return c
  }, c
}]), app.controller("UsersCtrl", ["$rootScope", "$scope", "$timeout", "localStorageService", "DataSrv", "time", function(a, b, c, d, e, f) {
  var g, h = function() {
    b.updateTimeTimer = null, b.updateUsersTimer = null, b.usersOnline = [], b.$watch("usersList", function(a, c) {
      b.updateUsers()
    }), b.getUsersList(), b.updateTime(), b.updateUsers()
  };
  b.getUsersList = function() {
    g && g(), a.usersList = e.getObj("users"), a.usersList.$bindTo(b, "usersList").then(function(a) {
      g = a
    })
  }, b.updateTime = function() {
    c.cancel(b.updateTimeTimer), b.updateTimeTimer = c(b.updateTime, 1e4);
    var d = f.unix();
    f.isSynced() && a.login.authenticated && (a.login.userData.lastOnline = d)
  }, b.updateUsers = function() {
    c.cancel(b.updateUsersTimer), b.updateUsersTimer = c(b.updateUsers, 5e3);
    var d = f.unix();
    if (b.usersOnline.length = 0, a.usersList && "object" == typeof a.usersList) {
      var e;
      for (var g in a.usersList) e = a.usersList[g], e && "object" == typeof e && e.lastOnline >= d - 20 && b.usersOnline.push(e)
    }
  }, h()
}]), app.controller("SignupCtrl", ["$rootScope", "$scope", "$timeout", "$element", "$state", "AuthSrv", "DataSrv", function(a, b, c, d, e, f, g) {
  var h = function() {
    b.form = d.find("#signupForm"), b.signup = {
      $active: !1,
      password1: "",
      password2: "",
      username: ""
    }, a.$watch("login.authenticated", function(b, c) {
      a.login.authenticated === !0 && e.go("mvp")
    }), b.$watch("signup.email", function(a, c) {
      b.signup.$emailValid = b.validateEmail()
    }), b.$watchGroup(["signup.password1", "signup.password2"], function(a, c) {
      b.signup.$passwordValid = b.validatePassword()
    })
  };
  b.isValid = function() {
    return b.signup.$emailValid && b.signup.email && b.signup.$passwordValid && b.signup.password1 && b.signup.password2
  }, b.validateEmail = function() {
    var a = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return a.test(b.signup.email)
  }, b.validatePassword = function() {
    return b.signup.password1 && b.signup.password1 === b.signup.password2 && b.signup.password1.length > 5
  }, b.submit = function() {
    b.form.removeClass("animated shake");
    var d = b.signup.email,
      g = b.signup.password1,
      h = {
        username: b.signup.username
      };
    b.signup.$active = !0, f.create(d, g, h).then(function() {
      return a.login.credentials.email = d, a.login.credentials.password = g, b.authenticate()
    }).then(function() {
      b.signup.$active = !1, e.go("mvp")
    })["catch"](function(a) {
      b.form.addClass("animated shake"), c(function() {
        b.form.removeClass("animated shake")
      }, 1e3), b.errorMessage = a.message, b.signup.$active = !1
    })
  }, h()
}]), app.controller("AuthCtrl", ["$rootScope", "$scope", "$state", "$timeout", "localStorageService", "AuthSrv", "DataSrv", function(a, b, c, d, e, f, g) {
  var h, i = function() {
    a.login = {};
    var c;
    a.$watch("login.credentials", function() {
      d.cancel(c), c = d(b.save, 2e3)
    }, !0), f.onStateChange(function(b) {
      b || (a.login.user = null, a.login.authenticated = !1, h && h(), a.login.userData = {})
    }), b.load(), b.authenticate()
  };
  b.load = function() {
    a.login.credentials = e.get("credentials") || null, a.login.credentials && "object" == typeof a.login.credentials || (a.login.credentials = {
      email: "",
      password: ""
    })
  }, b.save = function() {
    e.set("credentials", a.login.credentials)
  }, b.authenticate = function() {
    return a.login.credentials.email && a.login.credentials.password ? (a.login.authenticated = !1, a.login.authenticating = !0, f.login(a.login.credentials.email, a.login.credentials.password).then(function(c) {
      return a.login.user = c, b.getUserData()
    }).then(function() {
      console.log("authenticate OK", a.login.user), a.login.authenticated = !0
    })["catch"](function(b) {
      throw console.log("authenticate ERROR", b), a.login.user = null, a.login.authenticated = !1, b
    })["finally"](function() {
      a.login.authenticating = !1
    })) : (a.login.authenticated = !1, void(a.login.authenticating = !1))
  }, b.logout = function() {
    a.login.credentials.email = null, a.login.credentials.password = null, b.save(), f.logout().then(function() {
      c.go("login")
    })["catch"](function() {})
  }, b.getUserData = function() {
    return h && h(), a.login.userData = g.getObj("users/" + a.login.user.uid), a.login.userData.$bindTo(a, "login.userData").then(function(a) {
      h = a
    }), a.login.userData.$loaded()
  }, i()
}]), app.controller("LoginCtrl", ["$rootScope", "$scope", "$timeout", "$state", "$element", function(a, b, c, d, e) {
  var f = function() {
    b.form = e.find("#loginForm"), b.credentials = {
      email: "",
      password: ""
    }, a.$watch("login.authenticated", function(b, c) {
      a.login.authenticated === !0 && d.go("mvp")
    })
  };
  b.isValid = function() {
    return b.validateEmail() && b.validatePassword()
  }, b.validateEmail = function() {
    var a = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return a.test(b.credentials.email)
  }, b.validatePassword = function() {
    return b.credentials.password && b.credentials.password.length > 0
  }, b.submit = function() {
    b.form.removeClass("animated shake"), a.login.credentials.email = b.credentials.email, a.login.credentials.password = b.credentials.password, b.authenticate().then(function() {
      d.go("mvp")
    })["catch"](function(d) {
      a.login.credentials.email = null, a.login.credentials.password = null, b.form.addClass("animated shake"), c(function() {
        b.form.removeClass("animated shake")
      }, 1e3), b.errorMessage = "Couldn't login. Please verify your E-Mail address and password."
    })
  }, f()
}]), app.service("AuthSrv", ["$firebaseAuth", "DataSrv", function(a, b) {
  var c = {};
  return c.create = function(c, d, e) {
    return a().$createUserWithEmailAndPassword(c, d).then(function(a) {
      var c = b.getObj("users/" + a.uid);
      for (var d in e) c[d] = e[d];
      c.$save()
    })["catch"](function(a) {
      throw console.log(a), a
    })
  }, c.login = function(b, c) {
    return a().$signInWithEmailAndPassword(b, c)
  }, c.logout = function() {
    return a().$signOut()
  }, c.onStateChange = function(b) {
    a().$onAuthStateChanged(b)
  }, c
}]), app.controller("ShareCtrl", ["$scope", "$rootScope", "$timeout", "$state", "DataSrv", "time", function(a, b, c, d, e, f) {
  var g, h, i = function() {
    a.shareListLoaded = !1, a.editShare = null, b.$watch("settings.group", function(b, d) {
      c.cancel(g), b !== d && (g = c(a.getShareList, 2500))
    }), b.$watchGroup(["login.authenticating", "login.authenticated"], function(a, c) {
      b.login.authenticating === !1 && b.login.authenticated === !1 && d.go("login")
    }), a.$watchCollection("shareList", function() {
      "object" == typeof a.shareList && null === a.editShare && a.update()
    }), angular.element(window).bind("keyup", function(b) {
      17 === b.keyCode && (a.ctrlDown = !1)
    }), angular.element(window).bind("keydown", function(b) {
      17 === b.keyCode && (a.ctrlDown = !0), a.ctrlDown && 70 === b.keyCode && (b.preventDefault(), angular.element("#shareFilter").select(), window.scrollTo(0, 0))
    }), f.sync().then(function() {
      a.getShareList()
    }), c(function() {
      a.initialized = !0
    }, 1500)
  };
  a.randStr = function(a) {
    for (var b = "", c = "abcdefghijklmnopqrstuvwxyz", d = 0; a > d; d++) b += c.charAt(Math.floor(Math.random() * c.length));
    return b
  }, a.getShareList = function() {
    b.settings.group && (h && h(), a.shareListLoaded = !1, a.shareList = e.getObj("shares/" + b.settings.group), a.shareList.$loaded()["finally"](function() {
      a.shareListLoaded = !0
    }), a.shareList.$bindTo(a, "shareList").then(function(a) {
      h = a
    }))
  }, a.addShare = function() {
    var c = f.unix();
    a.editShare = {
      $id: "NEW",
      owner: b.login.user.uid,
      items: [{
        name: "",
        amount: 1,
        price: 0,
        sold: !1
      }],
      users: [{
        name: "",
        send: !1
      }],
      seller: b.login.userData.username,
      date: c
    }
  }, a.removeShare = function(a) {
    var c = window.confirm("Do you want to remove this entry?");
    if (c) {
      var d = e.get("shares/" + b.settings.group + "/" + a.$id);
      d.remove()
    }
  }, a.addUser = function(a) {
    angular.isArray(a.users) || (a.users = []), a.users.push({
      name: "",
      send: !1
    })
  }, a.removeUser = function(a, b) {
    a.users.splice(b, 1)
  }, a.addItem = function(a) {
    angular.isArray(a.items) || (a.items = []), a.items.push({
      name: "",
      amount: 1,
      price: 0,
      sold: !1
    })
  }, a.removeItem = function(a, b) {
    a.items.splice(b, 1)
  }, a.edit = function(b) {
    null !== b && "object" == typeof b ? a.editShare = angular.copy(b) : a.editShare = null
  }, a.save = function(b) {
    if ("NEW" === b.$id) {
      var c = f.unix(),
        d = c + a.randStr(5);
      b.$id = d, b.date = c, a.shareList[b.$id] = {}
    }
    angular.copy(b, a.shareList[b.$id]), a.editShare = null, a.update()
  }, a.cancel = function(b) {
    a.editShare = null, a.update()
  }, a.shareItemsAll = function(a, b) {
    for (var c = a.items || [], d = 0; d < c.length; d++) c[d].sold = b
  }, a.isShareItemsAll = function(a, b) {
    for (var c = a.items || [], d = 0; d < c.length; d++)
      if (c[d].sold !== b) return !1;
    return !0
  }, a.shareUsersAll = function(a, b) {
    for (var c = a.users || [], d = 0; d < c.length; d++) c[d].send = b
  }, a.isShareUsersAll = function(a, b) {
    for (var c = a.users || [], d = 0; d < c.length; d++)
      if (c[d].send !== b) return !1;
    return !0
  }, a.onShareAmountChange = function(a, b) {
    b.amount = parseInt(b.amount)
  }, a.onSharePriceChange = function(a, b) {
    var c = b.price + "";
    if (c.length > 1) {
      var d = c.substr(c.length - 1),
        e = c.substr(0, c.length - 1),
        f = parseFloat(e);
      "k" === d ? b.price = 1e3 * f : "m" === d && (b.price = 1e6 * f)
    }
    b.price = parseFloat(b.price)
  }, a.filterShareList = function(a, c, d) {
    return null === b.settings.shareFilter || void 0 === b.settings.shareFilter ? !0 : b.settings.shareFilter === !0 ? !a.$sold || !a.$send : b.settings.shareFilter === !1 ? a.$sold === !0 && a.$send === !0 : !1
  }, a.orderShareList = function(a) {
    return a.$sold === !0 && a.$send === !0 ? Number.MAX_SAFE_INTEGER - a.date : -a.date
  }, a.update = function() {
    a.shareListArr = [];
    var b, c, d;
    for (var e in a.shareList)
      if (b = a.shareList[e], b && "object" == typeof b) {
        if (b.$id = e, a.shareListArr.push(b), b.$highlight = "", b.$total = 0, b.$sold = !0, c = b.items)
          for (var f = 0; f < c.length; f++) b.$total += c[f].price * c[f].amount, b.$sold = b.$sold && c[f].sold;
        if (b.$send = !0, d = b.users)
          for (var g = 0; g < d.length; g++) b.$send = b.$send && d[g].send;
        b.$sold === !0 && b.$send === !0 ? b.$highlight = "fade2" : b.$highlight = "danger"
      }
  }, i()
}]), app.filter("toArray", function() {
  return function(a) {
    var b, c = [];
    for (var d in a) b = a[d], b && "object" == typeof b && (b.$id = d, c.push(b));
    return c
  }
}), app.directive("includeReplace", function() {
  return {
    require: "ngInclude",
    restrict: "A",
    link: function(a, b, c) {
      var d = b.attr("class"),
        e = b.children();
      e.each(function(a) {
        $(this).addClass(d)
      }), b.replaceWith(e)
    }
  }
}), angular.module("roMvpTrackerApp").run(["$templateCache", function(a) {
  a.put("views/login.html", '<div class="form-login-container" ng-controller="LoginCtrl"> <form id="loginForm" class="form-horizontal form-login"> <div class="form-login-header" ng-class="isValid() ? \'valid\' : \'invalid\'"></div> <div class="form-login-content"> <h4>Login</h4> <!-- email --> <div class="form-group"> <label class="col-md-12 control-label" for="email">E-Mail</label> <div class="col-md-12"> <input id="email" name="email" type="text" placeholder="" class="form-control input-md" ng-model="credentials.email" ng-disabled="login.authenticating"> </div> </div> <!-- password1 --> <div class="form-group"> <label class="col-md-12 control-label" for="password1">Password</label> <div class="col-md-12"> <input id="password1" name="password1" type="password" placeholder="" class="form-control input-md" ng-model="credentials.password" ng-disabled="login.authenticating"> </div> </div> <!-- submit --> <div class="form-group"> <div class="col-md-12"> <button name="submit" class="btn btn-default" ng-click="submit()" ng-disabled="!isValid() || login.authenticating">Login</button> <a ui-sref="signup">Create Account</a> </div> </div> <!-- error --> <div class="text-danger"><strong>{{errorMessage}}</strong></div> </div> </form> </div>'), a.put("views/mvp.html", '<div class="mvp" ng-controller="MvpCtrl" ng-ifs="initialized"> <div ng-if="login.authenticated"> <div class="alert alert-danger animate-out-hide animated fadeIn" ng-if="!login.userData.activated"> <strong>Authentication Error!</strong> Your account is waiting for activation by a moderator. </div> <div class="alert alert-danger animate-out-hide animated fadeIn" ng-if="!login.userData.username"> <strong>Settings Error!</strong> Please set a display name in the settings. </div> <div class="alert alert-danger animate-out-hide animated fadeIn" ng-if="!settings.group"> <strong>Settings Error!</strong> Please set a tracker group in the settings. </div> </div> <div class="animate-out-hide animated fadeIn" ng-if="isValid()"> <div class="input-group search-filter pull-right"> <input id="mvpFilter" type="text" class="form-control form-control-sm" placeholder="Search" ng-class="{\'rounded\': !mvpFilter}" ng-model="mvpFilter"> <span class="input-group-btn" ng-show="mvpFilter"> <button class="btn btn-default" type="button" ng-click="mvpFilter=\'\'"> <span class="fas fa-times"></span> </button> </span> </div> <table class="table table-striped table-bordered mvp-list"> <thead> <tr> <td>MVP</td> <td>Spawn Time</td> <td>Update</td> </tr> </thead> <tbody> <tr ng-repeat="mvp in (mvpList | filter:mvpFilter | orderBy:orderTrackList)" ng-class="mvp.$track.$highlight"> <td> <div> <span class="mvp-name"><a href="https://panel.talonro.com/mobdb/{{mvp.id}}/" target="_blank">{{mvp.name}}</a></span> <small>(<a href="http://ratemyserver.net/index.php?page=npc_shop_warp&map={{mvp.map}}" target="_blank">{{mvp.map}}</a>)</small> </div> <div><small>{{mvp.respawn.min / 60 | ceil | number:0}} – {{mvp.respawn.max / 60 | ceil | number:0}} Minutes</small></div> </td> <td> <div ng-if="mvp.$track.$respawn"> <div> <span>{{mvp.$state ? \'\' : \'in\'}}</span> <strong> <span ng-class="mvp.$track.$respawn.min > 0 ? \'text-success\' : \'text-danger\'"> {{mvp.$state ? (((-1 * mvp.$track.$respawn.min) / 60) | ceil | number:0) : ((mvp.$track.$respawn.min / 60) | ceil | number:0)}} </span> </strong> minutes to <strong> <span ng-class="mvp.$track.$respawn.max > 0 ? \'text-success\' : \'text-danger\'"> {{mvp.$state ? (((-1 * mvp.$track.$respawn.max) / 60) | ceil | number:0) : ((mvp.$track.$respawn.max / 60) | ceil | number:0)}} </span> </strong> minutes <span>{{mvp.$state ? \'ago\' : \'\'}}</span> </div> <div>last tracked <span am-time-ago="mvp.$track.time * 1000"></span> by <strong>{{mvp.$track.name}}</strong></div> </div> <div ng-if="!mvp.$track.$respawn">–</div> </td> <td> <center> <form class="form-inline"> <div class="form-group input-group input-group-sm group-track"> <input type="text" class="form-control form-control-sm" ng-init="ago=0" ng-blur="!ago ? ago=0 : ago=ago" ng-model="ago"> <span class="ago"></span> <span class="input-group-btn"> <button class="btn btn-default btn-sm" type="button" ng-click="setTrack(mvp, ago * 60); ago=0;"> <span class="fas fa-share"></span> </button> </span> </div> <div class="form-group" ng-if="mvp.$track.$respawn"> <button class="btn btn-default btn-sm" type="button" ng-click="removeTrack(mvp)"> <span class="fas fa-times"></span> </button> </div> </form> </center> </td> </tr> </tbody> </table> </div> </div>'), a.put("views/settings.html", '<form class="form-horizontal" ng-controller="SettingsCtrl"> <!-- email --> <div class="form-group"> <label class="col-md-12 control-label" for="authKey">E-Mail</label> <div class="col-md-12"> <div class="input-group"> <input id="settings-email" name="settings-email" type="text" placeholder="" class="form-control input-md" ng-model="login.user.email" disabled> <span class="input-group-btn"> <span name="auth" class="btn btn-default" uib-tooltip="Logout" ng-click="settingsDropdown.open=false;logout();"> <i class="fas fa-sign-out-alt"></i> </span> </span> </div> </div> </div> <!-- username --> <div class="form-group"> <label class="col-md-12 control-label" for="username">Display Name</label> <div class="col-md-12"> <input id="settings-username" name="settings-username" type="text" placeholder="" class="form-control input-md" ng-model="login.userData.username"> </div> </div> <!-- group --> <div class="form-group"> <label class="col-md-12 control-label" for="group">Tracker Group</label> <div class="col-md-12"> <input id="settings-group" name="settings-group" type="text" placeholder="" class="form-control input-md" ng-model="settings.group"> </div> </div> <!-- notification--> <div class="form-group"> <label class="col-md-12 control-label" for="">Notification</label> <div class="col-md-12"> <label class="checkbox-inline" for="notification"> <input type="checkbox" id="notification" name="notification" value="1" ng-model="settings.notificationEnabled"> Notify <span class="form-inline"> <select class="form-control input-xs notification-time" ng-model="settings.notificationTime" ng-options="value*1 for (key, value) in notificationTimeList"></select> </span> minute(s) before spawn </label> </div> </div> </form>'), a.put("views/share-edit.html", '<td> <div class="items" ng-repeat="item in editShare.items | toArray"> <div class="input-group input-group-sm"> <span class="input-group-btn"> <input type="text" class="form-control input-sm input-amount" placeholder="#" ng-change="onShareAmountChange(share, item)" ng-model="item.amount"> </span> <input type="text" class="form-control input-sm" placeholder="Item" ng-model="item.name"> <span class="input-group-btn" ng-if="item.sold"> <input type="text" class="form-control input-sm input-price" placeholder="Price" ng-change="onSharePriceChange(share, item)" ng-model="item.price"> </span> <span class="input-group-btn"> <button class="btn btn-danger" type="button" uib-tooltip="Not sold" ng-click="item.sold=true" ng-if="item.sold===false"> <span class="fas fa-times fa-fw"></span> </button> <button class="btn btn-success" type="button" uib-tooltip="Sold" ng-click="item.sold=false" ng-if="item.sold===true"> <span class="fas fa-check fa-fw"></span> </button> <button class="btn btn-default" type="button" uib-tooltip="Remove" ng-click="removeItem(editShare, item.$id)"> <span class="fas fa-trash"></span> </button> </span> </div> </div> <div class="pull-right"> <div class="input-group input-group-sm input-group-btn-rounded"> <input type="text" class="form-control"> <span class="input-group-btn"> <button type="button" class="btn btn-danger" uib-tooltip="Not sold (all)" ng-click="shareItemsAll(editShare, true)" ng-if="!isShareItemsAll(editShare, true) && editShare.items.length > 0"> <span class="fas fa-times fa-fw"></span> </button> <button type="button" class="btn btn-success" uib-tooltip="Sold (all)" ng-click="shareItemsAll(editShare, false)" ng-if="isShareItemsAll(editShare, true) && editShare.items.length > 0"> <span class="fas fa-check fa-fw"></span> </button> <button type="button" class="btn btn-default" ng-click="addItem(editShare)"> <span class="fas fa-plus"></span> </button> </span> </div> </div> </td> <td> <div class="users" ng-repeat="user in editShare.users | toArray"> <div class="input-group input-group-sm"> <div class="input-group-btn" uib-dropdown dropdown-append-to-body> <button type="button" class="btn btn-default" uib-dropdown-toggle> <span class="caret"></span> </button> <ul class="scrollable-menu" uib-dropdown-menu> <li class="dropdown-filter" ng-click="$event.stopPropagation()"> <input type="text" placeholder="Filter" class="form-control input-sm" ng-model="filterUsers"> </li> <li class="dropdown-filter-spacer"></li> <li ng-repeat="u in usersList | toArray | filter:{username: filterUsers}"> <a href="javascript:void(0);" ng-click="user.name=u.username">{{u.username}}</a> </li> </ul> </div> <input type="text" class="form-control" placeholder="Username" ng-model="user.name"> <span class="input-group-btn"> <button class="btn btn-danger" type="button" uib-tooltip="Share not send" ng-click="user.send=true" ng-if="user.send===false"> <span class="fas fa-times fa-fw"></span> </button> <button class="btn btn-success" type="button" uib-tooltip="Share send" ng-click="user.send=false" ng-if="user.send===true"> <span class="fas fa-check fa-fw"></span> </button> <button class="btn btn-default" type="button" uib-tooltip="Remove" ng-click="removeUser(editShare, user.$id)"> <span class="fas fa-trash fa-fw"></span> </button> </span> </div> </div> <div class="pull-right"> <div class="input-group input-group-sm input-group-btn-rounded"> <input type="text" class="form-control"> <span class="input-group-btn"> <button type="button" class="btn btn-danger" uib-tooltip="Share not send (all)" ng-click="shareUsersAll(editShare, true)" ng-if="!isShareUsersAll(editShare, true) && editShare.users.length > 0"> <span class="fas fa-times fa-fw"></span> </button> <button type="button" class="btn btn-success" uib-tooltip="Share send (all)" ng-click="shareUsersAll(editShare, false)" ng-if="isShareUsersAll(editShare, true) && editShare.users.length > 0"> <span class="fas fa-check fa-fw"></span> </button> <button type="button" class="btn btn-default" ng-click="addUser(editShare)"> <span class="fas fa-plus fa-fw"></span> </button> </span> </div> </div> </td> <td> <input type="text" class="form-control input-sm" placeholder="Username" ng-model="editShare.seller"> </td> <td> <span class="added" am-time-ago="editShare.date * 1000" uib-tooltip="{{editShare.date | amFromUnix | amDateFormat:\'DD.MM.YYYY HH:mm\'}}"></span> </td> <td class="actions"> <center> <button type="button" class="btn btn-sm btn-success" uib-tooltip="Save changes" ng-click="save(editShare)"> <span class="fas fa-check"></span> </button> <button type="button" class="btn btn-sm btn-danger" uib-tooltip="Discard changes" ng-click="cancel()"> <span class="fas fa-ban"></span> </button> </center> </td>'), a.put("views/share-view.html", '<td> <div class="items" ng-repeat="item in share.items | toArray"> <span uib-tooltip="Not sold"> <span class="fas fa-times-circle fa-fw text-danger" ng-if="item.sold===false"></span> </span> <span uib-tooltip="Sold"> <span class="fas fa-check-circle fa-fw text-success" ng-if="item.sold===true"></span> </span> <span ng-class="{\'strike-through\': item.sold===true}">{{item.amount}} × {{item.name || \'(item)\'}}</span> <span ng-if="item.sold===true && item.price > 0">{{item.price * item.amount | number}}</span> </div> <div ng-if="share.$sold===true && share.$total > 0"> <hr> <div>Total: {{share.$total | number}}</div> <div>Share: {{share.$total / share.users.length | number}}</div> </div> </td> <td> <div class="users" ng-repeat="user in share.users | toArray"> <span uib-tooltip="Share not send"> <span class="fas fa-times-circle fa-fw text-danger" ng-if="user.send===false"></span> </span> <span uib-tooltip="Share send"> <span class="fas fa-check-circle fa-fw text-success" ng-if="user.send===true"></span> </span> <span ng-class="{\'strike-through\': user.send===true}">{{user.name || \'(username)\'}}</span> </div> </td> <td> {{share.seller || \'(username)\'}} </td> <td> <span class="added" am-time-ago="share.date * 1000" uib-tooltip="{{share.date | amFromUnix | amDateFormat:\'DD.MM.YYYY HH:mm\'}}"></span> </td> <td class="actions"> <center> <span ng-if="share.owner === login.user.uid"> <button type="button" class="btn btn-sm btn-default" uib-tooltip="Edit" ng-click="edit(share)"> <span class="fas fa-edit fa-fw"></span> </button> <button type="button" class="btn btn-sm btn-default" uib-tooltip="Remove" ng-click="removeShare(share)"> <span class="fas fa-trash fa-fw"></span> </button> </span> </center> </td>'),
    a.put("views/share.html", '<div class="share" ng-controller="ShareCtrl" ng-ifs="initialized"> <button type="button" class="btn btn-default" ng-click="addShare()"> <span class="fas fa-plus"></span> Add </button> <div class="btn-group"> <button type="button" class="btn btn-default" ng-class="{\'active\': settings.shareFilter === null || settings.shareFilter === undefined}" ng-click="settings.shareFilter=null">All</button> <button type="button" class="btn btn-default" ng-class="{\'active\': settings.shareFilter === true}" ng-click="settings.shareFilter=true">Open</button> <button type="button" class="btn btn-default" ng-class="{\'active\': settings.shareFilter === false}" ng-click="settings.shareFilter=false">Closed</button> </div> <div class="input-group search-filter pull-right"> <input id="shareFilter" type="text" class="form-control form-control-sm" placeholder="Search" ng-class="{\'rounded\': !shareFilter}" ng-model="shareFilter"> <span class="input-group-btn" ng-show="shareFilter"> <button class="btn btn-default" type="button" ng-click="shareFilter=\'\'"> <span class="fas fa-times"></span> </button> </span> </div> <div class="share-list-ontainer"> <table class="table table-striped table-bordered share-list"> <thead> <tr> <td>Items</td> <td>Share</td> <td>Seller</td> <td>Added</td> <td></td> </tr> </thead> <tbody ng-if="shareListLoaded"> <tr ng-if="editShare.$id === \'NEW\'"> <td ng-include="\'views/share-edit.html\'" include-replace></td> </tr> <tr ng-repeat="share in $parent.shareListArrFiltered = (shareListArr | orderBy:orderShareList | filter:shareFilter | filter:filterShareList)" ng-class="share.$highlight"> <td ng-include="\'views/share-view.html\'" include-replace ng-if="editShare.$id !== share.$id"></td> <td ng-include="\'views/share-edit.html\'" include-replace ng-if="editShare.$id === share.$id"></td> </tr> </tbody> <tbody ng-if="!shareListLoaded"> <tr> <td colspan="5"> <center class="loading-content"> <i class="fas fa-circle-notch fa-spin"></i> Loading Content... </center> </td> </tr> </tbody> <tbody ng-if="!shareListArrFiltered.length && shareListLoaded && !editShare"> <tr> <td colspan="5"> <center class="loading-content"> <i class="fas fa-exclamation-triangle"></i> No Entries found </center> </td> </tr> </tbody> </table> </div> </div>'), a.put("views/signup.html", '<div class="form-login-container" ng-controller="SignupCtrl"> <form id="signupForm" class="form-horizontal form-login"> <div class="form-login-header" ng-class="isValid() ? \'valid\' : \'invalid\'"></div> <div class="form-login-content"><br><span class="text-warning">**use <b>NOT</b> real email address.<br> Kindly use the format: (ign/name/nickname)@tro.com.<br>Example: ellie@tro.com <br>It accepts non existing email address.</span><br><br><h4>Create Account</h4> <!-- email--> <div class="form-group"> <label class="col-md-12 control-label" for="email">E-Mail</label> <div class="col-md-12"> <input id="email" name="email" type="text" placeholder="" class="form-control input-md" ng-model="signup.email" ng-disabled="signup.$active"> </div> </div> <!-- password1--> <div class="form-group"> <label class="col-md-12 control-label" for="password1">Password</label> <div class="col-md-12"> <input id="password1" name="password1" type="password" class="form-control input-md" ng-model="signup.password1" ng-disabled="signup.$active"> </div> </div> <!-- password2--> <div class="form-group"> <label class="col-md-12 control-label" for="password2">Verify Password</label> <div class="col-md-12"> <input id="password2" name="password2" type="password" class="form-control input-md" ng-model="signup.password2" ng-disabled="signup.$active"> </div> </div> <!-- username--> <div class="form-group"> <label class="col-md-12 control-label" for="username">Display Name</label> <div class="col-md-12"> <input id="username" name="username" type="text" class="form-control input-md" ng-model="signup.username" ng-disabled="signup.$active"> </div> </div> <!-- submit--> <div class="form-group"> <div class="col-md-12"> <button name="submit" class="btn btn-default" ng-click="submit()" ng-disabled="!isValid() || signup.$active">Signup</button> <a ui-sref="login">Login</a> </div> </div> <!-- error --> <div class="text-danger"><strong>{{errorMessage}}</strong></div> </div> </form> </div>'), a.put("views/users.html", '<div><div ng-repeat="(uid, user) in usersOnline | orderBy:\'username\'" class="user"> <i class="fas fa-circle fa-xs"></i><span class="username">{{user.username || user.$uid}}</span> </div> </div>')
}]);
