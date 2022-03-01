var Config = {
	//url : "https://www.folkschart.com", // release
	//url : "http://14.63.223.233/folkschart", // test
	url: "http://localhost:8080/kakao_login_sample_war_exploded", // local
	platform: null,

	getUserImgUrl: function(mid, file) {
		let url = "users/" + mid + "/images/" + file;
		if (this.platform !== "pc") {
			url = "../" + url
		}
		return url;
	},
};

let AJAX = {
    call: function (url, params, func, isfd) {
		this._call(url, params, func, isfd, "text");
    },

	jsonCall: function (url, params, func, isfd) {
		this._call(url, params, func, isfd, "json");
	},

	_call: function (url, params, func, isfd, dataType) {
		let callobj = {
			url: Config.url+"/"+url,
			type: "post",
			data: params,
			dataType: dataType,
			success: func,
			error: function (xhr, status, error) {
				if (xhr.status === 0) {
					alert("네트워크 접속이 원할하지 않습니다.");
				}
				else {
					console.log(xhr.responseText);
					alert("에러가 발생하였습니다. 관리자에게 문의해주세요.");
				}
			},
		};
		if (isfd) {
			callobj.processData = false;
			callobj.contentType = false;
		}
		jQuery.ajax(callobj);
	},
};

//-----------------------------------------------------------------------------------------
//Cache objects

var CacheFeed = {
	name: "cacheFeed",
	fids: [],

	load: function(addrcode, cbfunc) {
		CacheMgr.init();

		var fids = CacheMgr.getCache(CacheFeed.name);
	    if (fids != null) {
	        console.log("[CacheFeed.load] fetch the existing feed list from the cache ...");

	        this.fids = fids;	// this initialization is required for getNext()

	        var feeds = CacheMgr.getList(fids);
	        if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	    } else {
		    var params = {addrcode: addrcode};
			if (Config.platform === "pc") params.type = "F";
	        AJAX.call("jsp/feedList.jsp", params, function(data) {
	            console.log("[CacheFeed.load] fetch a new feed list from the server ...");
	            var feeds = JSON.parse(data.trim());
	            CacheFeed._addFeeds(cbfunc, feeds);
	        	if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	        });
	    }
	},

	getNext: function(addrcode, cbfunc) {
		if (this.fids.length === 0) {
			cbfunc([]);
			return;
		}

		var length = this.fids.length;
		if (length <= 1) return;

	    var params = {addrcode: addrcode, startNo: length};
		if (Config.platform === "pc") params.type = "F";
	    AJAX.call("jsp/feedList.jsp", params, function(data) {
	        var feeds = JSON.parse(data.trim());
	        if (feeds.length === 0) {
	        	Page.disableScrollHandler();
				cbfunc([]);
	        	return;
	        }

	     CacheFeed._addFeeds(cbfunc, feeds);
	        if (cbfunc != null) cbfunc(feeds);
	    });
	},

	_addFeeds: function(cbfunc, feeds) {
		 for (var i=0; i<feeds.length; i++) {
		 	this.fids.push(feeds[i].fid);
		 }
		CacheMgr.setCache(CacheFeed.name, this.fids);
		CacheMgr.addList(feeds);
	},

	addFirst: function(feed) {
		if (feed.fid == null) return;

		// add an fid of the given feed at the beginning of the cache list
			this.fids.unshift(feed.fid);
	 	CacheMgr.setCache(CacheFeed.name, this.fids);

	 	CacheMgr.addFeed(feed);
	},

	deleteFeed: function(fid) {
			var found = false;
	     for (var i=0; i<this.fids.length; i++) {
	     	if (this.fids[i] == fid) {
	         	this.fids.splice(i, 1);
	         	found = true;
	         	break;
	     	}
	     }
	     if (found) CacheMgr.setCache(CacheMain.name, this.fids);
	},
};

var CacheHall = {
	name: "cacheHall",
	fids: [],

	load: function(addrcode, cbfunc) {
		CacheMgr.init();

		var fids = CacheMgr.getCache(CacheHall.name);
		fids = null;
	    if (fids != null) {
	        console.log("[CacheHall.load] fetch the existing feed list from the cache ...");
	        this.fids = fids;	// this initialization is required for getNext()
	        var feeds = CacheMgr.getList(fids);
	        if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	    } else {
		    var params = {addrcode: addrcode, bstate: -1};
	        AJAX.call("jsp/feedListByBstate.jsp", params, function(data) {
	            console.log("[CacheHall.load] fetch a new feed list from the server ...");
	            var feeds = JSON.parse(data.trim());
	            CacheHall._addFeeds(cbfunc, feeds);
	        	if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	        });
	    }
	},

	getNext: function(addrcode, cbfunc) {
		if (this.fids.length === 0) {
			cbfunc([]);
			return;
		}

		var length = this.fids.length;
		if (length <= 1) return;

	    var params = {addrcode: addrcode, bstate: -1, startNo: length};
	    AJAX.call("jsp/feedListByBstate.jsp", params, function(data) {
	        var feeds = JSON.parse(data.trim());
	        if (feeds.length == 0) {
	        	Page.disableScrollHandler();
	        	cbfunc([]);
	        	return;
	        }

         CacheHall._addFeeds(cbfunc, feeds);
	        if (cbfunc != null) cbfunc(feeds);
	    });
	},

	_addFeeds: function(cbfunc, feeds) {
     for (var i=0; i<feeds.length; i++) {
     	this.fids.push(feeds[i].fid);
     }
 	CacheMgr.setCache(CacheHall.name, this.fids);
 	CacheMgr.addList(feeds);
	},

	deleteFeed: function(fid) {
		var found = false;
     for (var i=0; i<this.fids.length; i++) {
     	if (this.fids[i] == fid) {
         	this.fids.splice(i, 1);
         	found = true;
         	break;
     	}
     }
     if (found) CacheMgr.setCache(CacheMain.name, this.fids);
	},
};

var CacheMain = {
	name: "cacheMain",
	fids: [],

	load: function(addrcode, cbfunc) {
		CacheMgr.init();

		var fids = CacheMgr.getCache(CacheMain.name);
	    if(fids != null) {
	        console.log("[CacheMain.load] fetch the existing feed list from the cache ...");
			this.fids = fids;	// this initialization is required for getNext()
			let feeds = CacheMgr.getList(fids);
			if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	    } else {
		    var params = {addrcode: addrcode};
	        AJAX.call("jsp/feedListByScore.jsp", params, function(data) {
	            console.log("[CacheMain.load] fetch a new feed list from the server ...");
	            var feeds = JSON.parse(data.trim());
	            CacheMain._addFeeds(cbfunc, feeds);
	        	if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
	        });
	    }
	},

	getNext: function(addrcode, cbfunc) {
		if (this.fids.length === 0) {
			cbfunc([]);
			return;
		}

		var length = this.fids.length;
		if (length <= 1) return;

	    var params = {addrcode: addrcode, startNo: length};
	    AJAX.call("jsp/feedListByScore.jsp", params, function(data) {
	    	console.log("[CacheMain.load] fetch a next feed list from the server ...");
	        var feeds = JSON.parse(data.trim());
	        if (feeds.length === 0) {
	        	Page.disableScrollHandler();
	        	cbfunc([]);
	        	return;
	        }

         CacheMain._addFeeds(cbfunc, feeds);
	        if (cbfunc != null) cbfunc(feeds);
	    });
	},

	_addFeeds: function(cbfunc, feeds) {
	     for (let i=0; i<feeds.length; i++) {
	     	this.fids.push(feeds[i].fid);
	     }
	 	CacheMgr.setCache(CacheMain.name, this.fids);
	 	CacheMgr.addList(feeds);
	},

	deleteFeed: function(fid) {
		var found = false;
	     for (var i=0; i<this.fids.length; i++) {
	     	if (this.fids[i] == fid) {
	         	this.fids.splice(i, 1);
	         	found = true;
	         	break;
	     	}
	     }
	     if (found) CacheMgr.setCache(CacheMain.name, this.fids);
	},
};

var CacheMgr = {
	ver: "0.1",
	ts: null,
	feeds: [],

	init: function() {
		var obj = DataCache.get("cacheMgr");
		if (!isValid(obj)) return;

		// check and clean for backward compatibility
		if (!isValid(obj.ver) || !isValid(obj.ts) || obj.ver != this.ver) {
			this._clear();
			return;
		}

		var diff = Math.abs(Date.now() - obj.ts) / 1000;
		if (diff > 10 * 60) { // 10 minutes
			//console.log(diff + " = " + Date.now() + " - " + obj.ts);
			this._clear();
			return;
		}

		this.ts = obj.ts;
		this.feeds = obj.feeds;
	},

	fetch: function (addrcode, cbfunc) {
		this.init();

		let sfids = CacheMgr.getCache(CacheMain.name);
		let ffids = CacheMgr.getCache(CacheFeed.name);
		let pfids = CacheMgr.getCache(CachePoll.name);

		if(sfids !== null && ffids !== null && pfids !== null) {
			console.log("[CacheMain.load] fetch the existing feed list from the cache ...");
			let scores = CacheMgr.getList(sfids)
			let feeds = CacheMgr.getList(ffids);
			let polls = CacheMgr.getList(pfids);

			let res = {
				scores: scores,
				feeds: feeds,
				polls: polls,
			}

			if (cbfunc != null) cbfunc(res, CacheMgr.getTags(scores));
		} else {
			let params = {addrcode: addrcode};
			AJAX.jsonCall("jsp/fetch.jsp", params, function(data) {
				console.log("[CacheMgr.fetch] fetch a new feed list from the server ...");
				let feeds = data.feeds;
				let scores = data.scores;
				let polls = data.polls;
				CacheMain._addFeeds(null, scores);
				CacheFeed._addFeeds(null, feeds);
				CachePoll._addFeeds(null, polls);
				if (cbfunc != null) cbfunc(data, CacheMgr.getTags(scores));
			});
		}

	},

	_clear: function() {
		DataCache.remove("cacheMgr");
		DataCache.remove("cacheMain");
		DataCache.remove("cacheFeed");
		DataCache.remove("cacheHall");
		DataCache.remove("cachePoll");
		this.ts = null;
	},

	_write: function(feeds) {
		if (!isValid(this.ts)) this.ts = Date.now();

		var obj = {};
		obj.ver = this.ver;
		obj.ts = this.ts;
		obj.feeds = this.feeds = feeds;

		DataCache.set("cacheMgr", obj);
		return feeds;
	},

	getCache: function(name) {
		return DataCache.get(name);
	},

	setCache: function(name, val) {
		DataCache.set(name, val);
	},

	addList: function(feeds) {
		var srcls = this.feeds;
		for (var i=0; i<feeds.length; i++) {
			var found = false;
			for (var a=0; a<srcls.length; a++) {
				if (srcls[a].fid === feeds[i].fid) { found = true; break; }
			}
			if (!found) {
				console.log("[CacheMgr.addList] add new item of fid " + feeds[i].fid);
				srcls.push(feeds[i]);
			}
		}
		srcls.sort(function(a, b) {
			return a.fid > b.fid ? -1 : 1;
		});
		this._write(srcls);
	},

	getList: function(fids) {
		var list = [];
		var srcls = this.feeds;
		for (var i=0; i<fids.length; i++) {
			for (var a=0; a<srcls.length; a++) {
				if (srcls[a].fid == fids[i]) {
					list.push(srcls[a]);
					break;
				}
			}
		}
		// something wrong in this case ...
		if (fids != null && list.length == 0) this._clear();

		return list;
	},

	getFeed: function(fid) {
		var srcls = this.feeds;
		for (var i=0; i<srcls.length; i++) {
			if (srcls[i].fid == fid) return srcls[i];
		}
		return null;
	},

	updateFeed: function(feed) {
		var found = false;
		var srcls = this.feeds;
		for (var i=0; i<srcls.length; i++) {
			if (srcls[i].fid === feed.fid) {
				srcls[i] = feed;
				found = true;
				break;
			}
		}
		if (found) this._write(srcls);
	},

	addFeed: function(feed) {
		var srcls = this.feeds;
		srcls.push(feed);
		this._write(srcls);
	},

	deleteFeed: function(fid) {
		var found = false;
		var srcls = this.feeds;
		for (var i=0; i<srcls.length; i++) {
			if (srcls[i].fid == fid) {
				srcls.splice(i, 1);
				CacheMain.deleteFeed(fid);
				CacheFeed.deleteFeed(fid);
				CacheHall.deleteFeed(fid);
				CachePoll.deleteFeed(fid);
				found = true;
				break;
			}
		}
		if (found) this._write(srcls);
	},

	getTags: function(feeds) {
     var htags = [];
     for (var i=0; i<feeds.length; i++) {
     	var tags = feeds[i].tags.replaceAll(" ", "").split("#");
     	for (var a=0; a<tags.length; a++) {
     		if (tags[a] == "") continue;
     		if (htags[tags[a]] == null) htags[tags[a]] = 1;
     		else htags[tags[a]]++;
     	}
     }
     var list = [];
     for (var key in htags) {
     	list.push({k: key, v: htags[key]});
     }
 	list.sort(function(a, b) {
 		return a.v > b.v ? -1 : 1;
 	});
     return list;
	},
};

let CachePoll = {
	name: "cachePoll",
	fids: [],

	load: function(addrcode, cbfunc) {
		CacheMgr.init();

		var fids = CacheMgr.getCache(this.name);
		if (fids != null) {
			console.log("[CachePoll.load] fetch the existing feed list from the cache ...");

			this.fids = fids;	// this initialization is required for getNext()

			var feeds = CacheMgr.getList(fids);
			if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
		}
		else {
			var params = {addrcode: addrcode, type: "P"};
			AJAX.call("jsp/feedList.jsp", params, function(data) {
				console.log("[CachePoll.load] fetch a new feed list from the server ...");
				var feeds = JSON.parse(data.trim());
				CachePoll._addFeeds(cbfunc, feeds);
				if (cbfunc != null) cbfunc(feeds, CacheMgr.getTags(feeds));
			});
		}
	},

	getNext: function(addrcode, cbfunc) {
		if (this.fids.length === 0) {
			cbfunc([]);
			return;
		}

		var length = this.fids.length;
		if (length <= 1) return;

		var params = {addrcode: addrcode, type:"P", startNo: length};
		AJAX.call("jsp/feedList.jsp", params, function(data) {
			var feeds = JSON.parse(data.trim());
			if (feeds.length === 0) {
				Page.disableScrollHandler();
				cbfunc([]);
				return;
			}

			CachePoll._addFeeds(cbfunc, feeds);
			if (cbfunc != null) cbfunc(feeds);
		});
	},

	_addFeeds: function(cbfunc, feeds) {
		for (var i=0; i<feeds.length; i++) {
			this.fids.push(feeds[i].fid);
		}
		CacheMgr.setCache(this.name, this.fids);
		CacheMgr.addList(feeds);
	},

	addFirst: function(feed) {
		if (feed.fid == null) return;

		// add an fid of the given feed at the beginning of the cache list
		this.fids.unshift(feed.fid);
		CacheMgr.setCache(this.name, this.fids);

		CacheMgr.addFeed(feed);
	},

	deleteFeed: function(fid) {
		var found = false;
		for (var i=0; i<this.fids.length; i++) {
			if (this.fids[i] === fid) {
				this.fids.splice(i, 1);
				found = true;
				break;
			}
		}
		if (found) CacheMgr.setCache(this.name, this.fids);
	},
};



var SessionStore = {
    set: function (name, val) {
        name = "nuc:" + name;
        sessionStorage.setItem(name, JSON.stringify(val));
    },

    get: function (name) {
        name = "nuc:" + name;
        var str = sessionStorage.getItem(name);
        return (str == null || str == "null" || str == "undefined") ? null : JSON.parse(str);
    },

    remove: function (name) {
        name = "nuc:" + name;
        sessionStorage.removeItem(name);
    },

    clear: function() {
        sessionStorage.clear();
    },

    log: function () {
        var str = '';
        for(var key in window.sessionStorage) {
            if(window.sessionStorage.hasOwnProperty(key)) {
                var locstr = window.sessionStorage[key];
                var size = (locstr.length*16)/(8*1024);
                if (size >= 1) {
                    console.log(key + ": " + size.toFixed(1) + " KB");
                }
                str += locstr;
            }
        }
        if (isValid(str)) {
            var size = (str.length*16)/(8*1024);
            /* if (size > 2000) */ console.log("---- Session storate TOTAL: " + size.toFixed(1) + " KB");
        }
    },
};

var DataCache = {
    set: function (name, data) {
        var obj = { ts: Date.now(), data: data };
        SessionStore.set(name, obj);
    },

    get: function (name) {
        var obj = SessionStore.get(name);
        if (obj == null) {
            return null;
        }
        var diff = (Date.now() - obj.ts) / 60000;
        if (diff > 30) { // 30 minutes
            SessionStore.remove(name);
            return null;
        }
        return obj.data;
    },

    remove: function (name) {
        SessionStore.remove(name);
    },
};


var DateTime = {
	getTime: function() {
	    var date = new Date();
	    var year = date.getFullYear();
	    var month = ("0" + (1 + date.getMonth())).slice(-2);
	    var day = ("0" + date.getDate()).slice(-2);

	    var hour = ("0" + date.getHours()).slice(-2);
	    var min = ("0" + date.getMinutes()).slice(-2);
	    var sec = ("0" + date.getSeconds()).slice(-2);

	    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
	},

	getDate: function() {
	    var date = new Date();
	    var year = date.getFullYear();
	    var month = ("0" + (1 + date.getMonth())).slice(-2);
	    var day = ("0" + date.getDate()).slice(-2);

	    return year + "-" + month + "-" + day;
	},

	getDateStr: function(showDay) {
	    var date = new Date();
	    var year = date.getFullYear();
	    var month = date.getMonth() + 1;
	    var day = date.getDate();

	    var daystr = year + "년 " + month + "월 " + day + "일";
	    if (showDay) {
		    var week = ["일", "월", "화", "수", "목", "금", "토"];
		    daystr += " " + week[date.getDay()] + "요일";
	    }
	    return daystr;
	},

	getDateStrFrom: function(date) {
	    return date.substring(0, 4) + "년 " + date.substring(5, 7) + "월 " + date.substring(8, 10) + "일";
	},
};

//-----------------------------------------------------------------------------------------
//Dialog object

var Dialog = {
 init: function () {
     $("body").append(this._generate());

     $(window).resize(function() {
         Dialog.resize();
     });
 },

 _generate: function() {
     var str = "<div id='--dialog' class='dialog'><div class='wrapper'>";
     str += "<div id='--dialog-del' class='del-btn hide' onclick='Dialog.reset()'></div>";
     str += "<div id='--dialog-cnt' class='contents'></div>";
     str += "</div></div>";
     return str;
 },

 show: function(timeout) {
     $("#--dialog").css("display", "block");
     Dialog.resize();

     // set focus on the default button after enabling the dialog
     if ($('#--dialog-cancel').length) {
         $('#--dialog-cancel').focus();
     }
     else if ($('#--dialog-ok').length) {
         $('#--dialog-ok').focus();
     }
 },

 resize: function() {
     // set the dialog box to center
     if ($('body').width() > 900) {
         var left = ($('body').width() - 500 - 42) / 2;
         //$("#--dialog .wrapper").css('margin-left', left);
     }
     var height = $("#--dialog .contents").height();
     var top = screen.height / 2 - height / 2 - 10;

     //$("#--dialog .wrapper").css('margin-top', top);
 },

 hide: function() {
     $("#--dialog").css("display", "none");
 },

 set: function(showDel) {
     this.show();
     this.disableScroll();
     this.ignoreHideProgress = true;

     $("body").on('keyup', function(e) {
         if (e.keyCode == 27) {
             Dialog.onCancel();
         }
         else if (e.keyCode == 13) {
             if ($('#--dialog-ok').length) {
                 //Dialog.onConfirm();
             }
         }
     });

     // show delete button on the right top of the dialog
     if (showDel) {
         $("#--dialog-del").removeClass("hide");
     }
     else {
         $("#--dialog-del").addClass("hide");
     }
 },

 reset: function() {
     this.hide();
     this.enableScroll();
     this.ignoreHideProgress = false;
     $("body").off('keyup');
 },


 // Progress dialog ----------------------------------------------------------
 //

 showProgress: function(msg) {
     if (!isValid(msg)) msg = "데이터 처리중입니다.<br>잠시만 기다려주세요.";

     var str = "<div class='desc'>" + msg;
     str += "<div class='inner-center mbot-10'><img src='images/loading.gif' height=50 style='z-index: 100'></div>";
     str += "</div>";

     $('#--dialog-cnt').html(str);

     this.show();
 },

 ignoreHideProgress: false,
 hideProgress: function() {
     if (!this.ignoreHideProgress) this.hide();
 },


 // Other dialogs ---------------------------------------------------------------
 //

 cbFunc: null,
 cbFuncCancel: null,
 alert: function(msg, cbfunc) {
     this.cbFunc = cbfunc;
     this.cbFuncCancel = cbfunc;

     var str = "<div class='desc mbot-25'>" + msg + "</div>";
	 //개선사항_2 여기수정해야함 엔터키 아직 안받음.
     str += "<div id='--dialog-ok' class='button' onclick='Dialog.onConfirm()'>확인</div>";

     $('#--dialog-cnt').html(str);
	 $("#--dialog-cnt").keypress(function (e) {            //<개선사항_2 1번> 엔터 입력 확인 by moon 22.02.20 다른 방법 써야 함...
		 if (e.keyCode === 13) {
			 console.log("aa");
			 Dialog.onConfirm();
		 }
	 });

     this.set();
 },

 confirm: function(msg, cbfunc, cbload, options) {
     this.cbFunc = cbfunc;
     this.cbFuncCancel = cbload;
     if (!isValid(options)) options = {};

     var str = "<div class='desc mbot-25'>" + msg + "</div>";
     str += "<div class='dis-f'>"
	        str += "<div class='section w50'>";
	        	str += "<div id='--dialog-cancel' class='button white' onclick='Dialog.onCancel()'>";
	        	str += (options.yesno ? "아니오" : "취소") + "</div>";
	    	str += "</div>";
	        str += "<div class='section w50'>";
	        	str += "<div id='--dialog-ok' class='button' onclick='Dialog.onConfirm()'>";
	        	str += (options.yesno ? "네" : "확인")  + "</div>";
	    	str += "</div>";
 	str += "</div>";

     $('#--dialog-cnt').html(str);

     this.set();
 },

 onConfirm: function() {
     this.reset();
     if (this.cbFunc != null) {
         var curfunc = this.cbFunc;
         this.cbFunc = null;
         curfunc();
     }
 },

 onCancel: function() {
     this.reset();
     if (this.cbFuncCancel != null) {
         var curfunc = this.cbFuncCancel;
         this.cbFuncCancel = null;
         curfunc();
     }
 },

 cbSelect: null,
 cbDel: null,
 select: function(list, cbfunc, showicn) {
     this.cbSelect = cbfunc;

     var str = "<div class='dialog-sel'>";
     var cnt = 0;
     for (var i=0; i<list.length; i++) {
         if (i == 0) {
             var title = (list[0].icon == "title") ? list[0].text : "선택해 주세요.";
             //str += "<div class='title'><div class='pad-24'></div></div>";
             str += "<div class='section pad-25 mtop-10 mbot-10'>";
         }
         if (list[i].icon == "title") continue;

         var cmd = (list[i].disabled != true) ? " onclick='Dialog.onSelect(" + i + ")'" : "";
         var gray = (list[i].disabled == true) ? " lightgray" : "";
         var bdtop = (cnt++ > 0) ? " bdtop-eee" : "";

         if (list[i].sep == true) {
             str += "<div class='section mtop-7 mbot-7 bdtop-eee'></div>";
             bdtop = "";
         }

         str += "<div class='section dis-f" + bdtop + "'" + cmd + ">";
         if (showicn == true) {
             str += "<div class='text" + gray + " "+list[i].icon+"'>" + list[i].text + "</div>";
             str += "<div class='icon pointer " + list[i].icon + "'></div>";
         }
         else {
             str += "<div class='text wid-100" + gray + "'>" + list[i].text + "</div>";
         }
         str += "</div>";
     }
     if (list.length > 0) {
         str += "</div>";
     }
     str += "</div>";

     $('#--dialog-cnt').html(str);

     setTimeout(function() {
     	$("html").click(function(e) {
         	if($(e.target).hasClass("dialog")) {
         		Dialog.reset();
         		$("html").off("click");
         	}
         });
     }, 50);

     this.set();
 },

 onSelect: function(index) {
     this.reset();
     if (isValid(this.cbSelect)) {
         this.cbSelect(index);
         this.cbSelect = null;
     }
 },


 // Enabling and disabling scroll events ---------------------------------------------------------------
 // left: 37, up: 38, right: 39, down: 40, spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
 keys: {32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1},

 preventDefault: function(e) {
     e = e || window.event;
     if (e.preventDefault) {
         e.preventDefault();
     }
     e.returnValue = false;
 },

 preventDefaultForScrollKeys: function(e) {
     if (Dialog.keys[e.keyCode]) {
         Dialog.preventDefault(e);
         return false;
     }
 },

 disableScroll: function() {
     if (window.addEventListener) { // older FF
         window.addEventListener('DOMMouseScroll', this.preventDefault, false);
     }
     window.onwheel = this.preventDefault; // modern standard
     window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
     window.ontouchmove = this.preventDefault; // mobile
     document.onkeydown = this.preventDefaultForScrollKeys;
 },

 enableScroll: function() {
     if (window.removeEventListener) {
         window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
     }
     window.onmousewheel = document.onmousewheel = null;
     window.onwheel = null;
     window.ontouchmove = null;
     document.onkeydown = null;
 },
};
let Evt = {
	init: function () {
		this._init();
		this._setHeaderEvt();

		$("body").click(function (event) {
			// for this._setHeaderEvt();
			if (!event.target.matches(".page-hdr .icon-box .icon")) {
				$(".page-hdr .icon-box .icon").each(function () {
					$(this).children(".dropdown-content").addClass("hide");
				});
			}
			// for user.html page reporter user
			if (!event.target.matches(".report .ico-dots")) {
				$(".report .ico-dots").each(function () {
					$(this).siblings(".dropdown-content").addClass("hide");
				});
			}
		});
	},

	_init: function () {
		$(".inner-box").click(function(evt) {
			evt.stopPropagation();
		});
		$(".ico-dots").click(function(evt) {
			evt.stopPropagation();
		});
		$(".poll").click(function(evt) {
			evt.stopPropagation();
		});
	},

	_setHeaderEvt: function () {
		$(".page-hdr .icon-box .icon").click(function (event) {
			let content = $(this).children(".dropdown-content");
			if (content.hasClass("hide")) {
				content.removeClass("hide");
			} else {
				content.addClass("hide");
			}
		});

		$(".page-hdr .icon-box .icon").click(function(evt) {
			evt.stopPropagation();
		});

		$("#--srch-btn").click(function(evt) {
			evt.stopPropagation();
		});
	},


}
let ImageList = {
    curidx: 0,
    onload: false,

    init: function () {
        if (!isValid(pagectx)) pagectx = {};
        pagectx.imglist = [];

        this.curidx = 0;
        this.onload = false;
    },

    add: function (vid, url, isback) {
        pagectx.imglist.push({vid: vid, url: url, isback: isback});
    },

    getViewId: function () {
        return "--img-" + pagectx.imglist.length;
    },

    load: function (index, cbfunc) {
        // ignore duplicate requests
        if (this.onload && index > this.curidx) return;

        if (!isValid(index)) index = 0;

        //console.log("ImageList.load(" + this.curidx + "): " + index);
        this._load(index, cbfunc);
    },

    onLoading: function () {
        return this.onload;
    },

    timeout: null,
    _load: function (index, cbfunc) {
        this.onload = true;

        var list = pagectx.imglist;
        if (index >= list.length) {
            this.onload = false;
            if (isValid(cbfunc)) cbfunc(index);
            return;
        }

        var imgobj = list[index];
        if (imgobj == null) {
            console.log(index);
        }
        var elem = "#" + imgobj.vid;

        var img = new Image();
        img.onerror = img.onabort = function() {
            ImageList._onError(elem, index, cbfunc);
        };
        img.onload = function() {
            $(elem + " .loading").addClass("hide");
            if (imgobj.isback) {
                $(elem).css("background-image", "url(\"" + imgobj.url + "\")");
                ImageList._clearTimer();
                ImageList.curidx = index;
                 ImageList._load(index + 1, cbfunc);
            }
            else {
                $(elem).animate({opacity: 0}, 0, function() {
                    $(this).css({'background-image': "url(\"" + imgobj.url + "\")"})
                           .animate({opacity: 1}, 300, function() {
                                ImageList._clearTimer();
                                ImageList.curidx = index;
                                ImageList._load(index + 1, cbfunc);
                           });
                });
            }
        }
        this.timeout = setTimeout(function() {
            ImageList._onError(elem, index, cbfunc);
        }, 3000);
        img.src = imgobj.url;
    },

    _onError: function (elem, index, cbfunc) {
        $(elem + " .loading").addClass("hide");
        $(elem).css("background-image", "url('images/bg_cafe.jpg')");
        this._clearTimer();
        this.curidx = index;
        this._load(index + 1, cbfunc);
    },

    _clearTimer: function () {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    },
};

var ImageValidator = {
    images: null,
    max: 50,

    start: function (list, max, cbfunc) {
        this.images = [];
        this.max = max;
        this.next(list, cbfunc, 0);
    },

    next: function (list, cbfunc, index) {
        if (index >= list.length || index >= this.max) {
            if (isValid(cbfunc)) {
                for (var i=this.max; i<list.length; i++) this.images.push(list[i]);
                cbfunc(this.images);
            }
            return;
        }
        var url = list[index].thumbnail;
        $.ajax({url: url, type: 'HEAD', data: index + "", success: function(response) {
            var uval = unescape($(this).attr('url'));
            var idx = uval.lastIndexOf("&");
            if (idx > 0) {
                var id = parseInt(uval.substring(idx+1));
                ImageValidator.images.push(list[id]);
            }
            console.log("[ImageValidator.ok." + index + "]" + uval);
            ImageValidator.next(list, cbfunc, index + 1);
        },
        error: function() {
            var uval = unescape($(this).attr('url'));
            console.log("[ImageValidator.error." + index + "]" + uval);
            ImageValidator.next(list, cbfunc, index + 1);
        }});
    },
};

let Mpx = {
	MAX: 0,
	pageidx: 0,
	curheight: 0,
	cursecheight: 0,

	init: function () {
		this.MAX = $(".mpx-menu").children().length;
	},

	goTab: function (curidx, max) {
		if (this.MAX === 0) return;
		let preidx = this.pageidx;
		if (curidx - preidx === 0) return;

		this._showPage(curidx, preidx, null, max);
		this.pageidx = curidx;
	},

	_showPage: function (toidx, fromidx, isnew, max) {
		$("#--mnu-" + fromidx).removeClass("selected");
		$("#--mnu-" + toidx).addClass("selected");

		// $("#--tab-" + fromidx).removeClass("selected");
		// $("#--tab-" + toidx).addClass("selected");

		let pane = $("#--pane-"+toidx);
		let width = pane.width();
		let height = 0;
		if (isValid(max)) {
			for(let i=0; i<4; i++) {
				height = Math.max($("#--pane-"+i).height(), height);
			}
		} else {
			height = pane.height();
		}
		this.curheight = height;

		let mleft = width * -1 * toidx;
		let intv = (isnew === true) ? 0 : 300;
		$(".mpx-con").velocity({
			"margin-left": mleft
		}, intv).promise().done(function () {
			//$(".mpx-con").height(height);
			this.pageidx = toidx;
			if (isnew !== true) ScrollPos.goTo();
		});

	}
}

let Page = {
	init: function (url, cbfunc, params) {
		if (Config.platform == null) {
			let cfgDevice = Params.get("cfgDevice", true);
			if (cfgDevice == null) {
				Config.platform = Util.getPlatform();
			} else {
				Config.platform = cfgDevice.platform;
			}
		}

		Dialog.init();
		ScrollPos.init(url);
		SSO.init(url);


		// for pc
		if (Config.platform === "pc") {
			this._setHeader();
			PageMnu.show(".page-mnu");
			Mpx.init();
		}

		Evt.init();

		//

		if (!isValid(params)) params = {};

		AJAX.call("jsp/session.jsp", null, function (data) {
			let ret = data.trim();
			let sesobj = (ret !== "NA") ? JSON.parse(ret) : {};

			if (params.nolog !== true && ret === "NA") {
				Dialog.alert("로그인이 필요한 서비스 입니다.", function () {
					window.location.href = "index.html";
				});
			} else {
				url = url.split("/").find(elem => elem.includes(".html"))
				let param = (url == null) ? null : SessionStore.get(url);

				if (!isValid(param)) param = {};
				param.usrobj = sesobj.usrobj;

				var addrobj = SessionStore.get("global.addrobj");
				if (addrobj != null) param.addrcode = addrobj.code;
				if (param.addrcode == null) param.addrcode = "260100";
				if (isValid(sesobj.usrobj) && isValid(sesobj.usrobj.addrobj)) param.addrcode = sesobj.usrobj.addrobj.code; // 주소이슈 임시해결, TODO_folks global.addrobj 부분 해결

				if (cbfunc != null) {
					cbfunc(param);
				}
			}
		});
	},

	goHome: function () {
		this.move("main.html");
	},

	go: function (url, param) {
		this._go(url, param, false);
	},

	goFeed: function (fid) {
		ScrollPos.set();
		this.go("feedView.html?fid=" + fid);
	},

	goSearch: function () {
		let keys = $("#--srch-key").val().trim();
		if (!isValid(keys)) return;
		Page.go("feedSearch.html", {keys: keys});
	},

	move: function (url, param) {
		this._go(url, param, true);
	},

	back: function (noanim) {
		history.back();
		/*if (noanim) {
            history.back();
            return;
        }
        $("html").fadeOut(300, function() {
            history.back();
        });*/
	},

	_go: function (url, param, jump) {
		if (param != null) SessionStore.set(url, param);
		let platform = Config.platform;
		if (platform === "mobile") {
			url = Config.url + "/mobile/" + url;
		}


		if (jump) {
			window.location.replace(url);
		} else {
			window.location.href = url;
		}

		/*$("html").velocity("fadeOut", 300, function() {
            if (param != null) SessionStore.set(url, param);
            if (jump) {
                window.location.replace(url);
            }
            else {
                window.location.href = url;
            }
        });*/
	},

	setHandler: function (opts, cbfunc) {
		if (opts == null) opts = {};

		SwipeHandler.init();

		if (opts.scroll) {
			$(document).scroll(function (event) {
				Page._hideNewFeed();
				Page._showMenu();
				Page._showLoadingIcon(opts.icovw, cbfunc);
			});
		}
	},

	lastScrollTop: 0,
	_showMenu: function () {
		// by controlling delta, performance improvement can be achieved
		var width = $("body").outerWidth();
		var ratio = 17.8;
		var delta = 20, menuHgt = width >= 720 ? 88 : width * ratio / 100;
		var sctop = $("body").scrollTop();

		// Make sure they scroll more than delta
		if (Math.abs(this.lastScrollTop - sctop) <= delta) return;

		// If they scrolled down and are past the navbar, add class .nav-up.
		// This is necessary so you never see what is "behind" the navbar.
		//console.log(sctop + ", " + this.lastScrollTop + ", " + menuHgt);
		if (sctop > this.lastScrollTop && sctop > menuHgt) {
			$('.page-mnu').css("bottom", "-" + ratio + "vw");
			//$('.ctx-mnu').removeClass("hide");
		} else {
			//console.log(sctop + " + " + $("body").height() + " < " + $(document).height());
			if (sctop + $("body").height() < $(document).height()) {
				$('.page-mnu').css("bottom", "0px");
				//$('.ctx-mnu').addClass("hide");
			}
		}
		this.lastScrollTop = sctop;
	},

	_hideNewFeed: function () {
		if (Config.platform === "pc") {
			$('.page-newfeed').css("display", "none");
		} else {
			$('.page-newfeed').css("bottom", "-51.26vw");
		}

	},

	_showNewFeed: function () {
		if (Config.platform === "pc") {
			$('.page-newfeed').css("display", "block");
		} else {
			$('.page-newfeed').css("bottom", "0px");
		}
	},

	noscroll: false,
	disableScrollHandler: function () {
		this.noscroll = true;
	},

	_showLoadingIcon: function (icovw, cbfunc) {
		if (this.noscroll || pagectx.timeout != null) return;

		if (Config.platform === "pc") {
			if (!($(window).scrollTop() + $(window).height() === $(document).height())) return;
		} else {
			if (!($(window).scrollTop() > $(document).height() - $("body").height() - 50)) return;
		}

		$(icovw).removeClass("hide");

		pagectx.timeout = setTimeout(function () {
			$(icovw).addClass("hide");

			window.clearTimeout(pagectx.timeout);	// remove duplicated timeouts called before;
			pagectx.timeout = null;

			if (cbfunc != null) cbfunc();
		}, 1000);

	},
//<개선사항_2 6번> 우측상단 로그아웃버튼 프로필 이미지 보이게 수정
	_setHeader: function () {
		AJAX.call("jsp/session.jsp", null, function (data) {
			let ret = data.trim();
			let sesobj = JSON.parse(ret);
			let imgurl = sesobj.usrobj.image !== undefined ? Config.getUserImgUrl(sesobj.usrobj.mid, sesobj.usrobj.image) : "NOTIMG";
			localStorage.setItem("url", imgurl);
		})

		let imgurl = localStorage.getItem("url");
		let str = "";
		str += "<div class='contents'>";
		str += "<div class='logo-box'><div class='image hdr' onclick='Page.go(\"main.html\")'></div></div>";
		str += "<div class='srch-box'>";
		str += "<input id='--srch-key' class='srch' type='text' placeholder='검색'>"
		str += "<div id='--srch-btn' class='icon-box' onclick='Page.goSearch()'><div class='ico search'></div></div>";
		str += "</div>";
		str += "<div class='icon-box'>";
		str += "<div class='icon plus'></div>";
		str += "<div class='icon alarm'></div>";
		str += "<div class='icon prof'>";
		//<개선사항_2 6번 수정완료
		if (imgurl === "NOTIMG") {
			str += "<div class='button prof'></div>";
		} else {
			console.log(imgurl)
			str += "<div class='button prof' style='background-image: url(\"" + imgurl + "\"); background-size: cover;'></div>";
		}
		str += "<div class='dropdown-content hide'>";
		str += "<div class='dropdown' onclick='SSO.logout()'>로그아웃</div>";
		str += "</div>";
		str += "</div>";
		str += "</div>";
		str += "</div>";

		$(".page-hdr").html(str);
	}
};



// -----------------------------------------------------------------------------------------
// PageMnu object

var PageMnu = {
    show: function(view, cls) {
		let menus = [
			{cls: "filter", link: "", desc: "", pc: true, mob: false},
			{cls: "home", link: "main.html", desc: "홈", pc: true, mob: true},
			{cls: "doc", link: "feed.html", desc: "이웃글", pc: true, mob: true},
			{cls: "poll", link: "poll.html", desc: "동네투표", pc: true, mob: false},
			{cls: "new", link: "", desc: "", pc: false, mob: true},
			{cls: "bell", link: "hall.html", desc: "동네스타", pc: true, mob: true},
			{cls: "user", link: "user.html", desc: "내정보", pc: false, mob: true},
		]

    	let str = "";
    	for(let i=0; i<menus.length; i++) {
			let menu = menus[i];
			let platform = Config.platform;
			if (platform === "pc") {
				if (!menu.pc) continue;
			} else {
				if (!menu.mob) continue;
			}

    		let selected = (cls === menu.cls) ? " selected" : "";
    		str += "<div class='menu-box"+ selected +"'>"
	    		str += "<div class='menu " + menu.cls  + "'";
    		if (cls === menu.cls) {
    			str += " onclick='ScrollPos.goTop(true)'></div>";
    		} else if (menu.cls === "new") {
    			str += " onclick='Page._showNewFeed()'></div>";
    		} else if (menu.cls === "filter") {
				str += "></div>";
			} else {
				str += " onclick='Page.go(\"" + menu.link + "\")'></div>";
			}
    		if(isValid(menu.desc)) {
    			str += "<div class='desc'>" + menu.desc + "</div>";
    		}

    		str += "</div>";
    	}
    	$(view).html(str);

    	str = "";
    	str += "<div class='nheader'>";
	    	str += "<div>공감 얻기</div>";
			str += "<div class='cancel' onclick='Page._hideNewFeed()'></div>";
    	str += "</div>";
    	str += "<div class='newfeed-box'>";
    		str += "<div class='newfeed' onclick='Page.go(\"feedAdd.html\")'>";
	    		str += "<div class='ico nfeed'></div>";
	    		str += "<div class='desc'>글 작성하기</div>";
    		str += "</div>";
    		str += "<div class='newfeed' onclick='Page.go(\"pollAdd.html\")'>";
	    		str += "<div class='ico npoll'></div>";
	    		str += "<div class='desc'>투표 만들기</div>";
    		str += "</div>";
    	str += "</div>";
    	$(".page-newfeed").html(str);

    },

    hide: function() {

    },
}

var Params = {
	init : function() {
	},

	clear : function(name) {
		localStorage["Params>" + name] = null;
	},

	get : function(name, flag) {
		var str = localStorage["Params>" + name];
		return (isValid(str) && str != "null") ? JSON.parse(str) : (flag ? null : {});

	},

	set : function(name, val, mcode) {
		try {
			localStorage["Params>" + name] = JSON.stringify(val);

		} catch (ex) {
			console.log("Params.set(): " + ex + " onn setting '" + name
					+ "'\n\n" + new Error().stack);
			Audit.showSessionMem();
		}
	},
}

var PhoneNum = {
	check: function (number) {
		if (!isValid(number)) return false;

		var num = number.replaceAll(" ", "").replaceAll("-", "");

		var regex = /^\d+$/;
		if(!regex.test(num)) return false;

		// now, number format check ---------------------------------
		if (num.substring(0,2) == "82") {
			num = "0" + num.substring(2);
		}

		var ncnt = num.length;
		if (num.substring(0,1) != "0" || ncnt < 9 || ncnt > 11) return false;

		if (num.substring(0,2) == "01") {
			if (num.startsWith("0111111")) return true;

			var hdr = num.substring(0,3);
			if ((hdr == "010" || hdr == "011") && ncnt == 11) return true;		// 010-xxxx-xxxx
			else if (ncnt == 10) return true;									// 011-xxx-xxxx
			return false
		}
		return true;	// 031-xxx-xxxx
	},

	getMid: function (mid) {
		if (!isValid(mid)) return "";

		mid = mid.replace(/[^0-9]/g, '');
		if (mid.substring(0, 2) == "82") {
			return mid;
		}
		else if (mid.substring(0, 1) == "0") {
			return "82" + mid.substring(1);
		}
		return mid;
	},

	format: function (mid, format) {
		if (!isValid(mid)) return "";

		// if the given mid is from kakao or google
		if (mid.startsWith("kakao") || mid.startsWith("google")) {
			return mid;
		}

		var num;
		if (mid.indexOf(0) == "0") {
			num = mid.replace(/-/g, '');
		}
		else {
			// if the given mid starts with a country code such as 82~
			num = "0" + mid.substring(2).replace(/-/g, '');
		}

		if (format) {
			var ncnt = num.length;
			if (ncnt == 11) {
				return num.substring(0,3) + "-" + num.substring(3,7) + "-" + num.substring(7);
			}
			else if (ncnt > 8 && ncnt < 11){
				if (num.substring(0,2) == "02") {
					return num.substring(0,2) + "-" + num.substring(2, ncnt-4) + "-" + num.substring(ncnt-4, ncnt);
				}
				else {
					return num.substring(0,3) + "-" + num.substring(3, ncnt-4) + "-" + num.substring(ncnt-4, ncnt);
				}
			}
			else {
				return num.substring(0, ncnt-4) + "-" + num.substring(ncnt-4, ncnt);
			}
		}
		return num;
	}
};


// -----------------------------------------------------------------------------------------
// SwipeHandler and ScrollPos object

var ScrollPos = {
    src: null,
    top: null,

    init: function (source) {
        this.src = source;
    },

    checkInit: function () {
        return isValid(this.src);
    },

    _name: function (source) {
        var src = (isValid(source)) ? source : this.src;
        var idx = src.lastIndexOf(".");
        var fname = (idx > 0) ? src.substring(0, idx) : src;
        return fname + "ScrollPos";
    },

    set: function (tag) {
        var top = $("body").scrollTop();
        console.log("ScrollPos.set: " + this.src + ", " + top);
        SessionStore.set(this._name(), {top: top, tag: tag});
    },

    get: function () {
        return SessionStore.get(this._name());
    },

    getTag: function () {
        var obj = SessionStore.get(this._name());
        return (isValid(obj)) ? obj.tag : null;
    },

    clear: function (source) {
        SessionStore.set(this._name(source), "");
    },

    goTo: function (noAnim) {
        var obj = SessionStore.get(this._name());
        if (isValid(obj)) {
            console.log("ScrollPos.goto: " + this.src + ", " + obj.top);
            if (noAnim) {
                $("body").scrollTop(obj.top);
            }
            else {
                var sec = (obj.top > 1000) ? 800 : 400;
                $("body").stop().animate({ scrollTop: obj.top }, sec);
            }
            this.clear();
        }
    },

    goTop: function (anim) {
        if (anim) {
            $("body").stop().animate({ scrollTop: 0 }, 400);
        }
        else {
            $("body").scrollTop(0);
        }
    }
};

var SwipeHandler = {
    disable: false,

    init: function() {
        document.addEventListener('touchstart', this.handleTouchStart, false);
        document.addEventListener('touchmove', this.handleTouchMove, false);
    },

    xDown: null, yDown: null,
    handleTouchStart: function(evt) {
        const firstTouch = (evt.touches || evt.originalEvent.touches)[0];   // // browser API or jQuery
        this.xDown = firstTouch.clientX;
        this.yDown = firstTouch.clientY;
    },

    handleTouchMove: function(evt) {
        if (!this.xDown || !this.yDown) return;

        // disable swipe if the events occur on .scroll-box
        var pobjs = $(evt.srcElement).parents();
        for (var i=0; i<pobjs.length; i++) {
            if (pobjs[i].className === "scroll-box") return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
            if (xDiff < 0) Page.back();
        }
        else {
            if (yDiff > 0) {
                /* up swipe */
            } else {
                /* down swipe */
            }
        }
        /* reset values */
        this.xDown = null;
        this.yDown = null;
    },
}

let SNS = {
	kakaoJSkey: "ebc5510bd66133520b090cf299a2ec46",
	init: function (src) {
		// pc, 모바일, android, ios에 따라서 불러오는거 다르게 하도록 설정할 것

		//web browser(pc, mobile)
		$.getScript("https://developers.kakao.com/sdk/js/kakao.js", function () {
			Kakao.init(SNS.kakaoJSkey);
			console.log("success kakao connect");
		});
	},

	share: function (fid) {
		let feed = CacheMgr.getFeed(fid);
		if (feed == null) {
			AJAX.call("jsp/feedGet.jsp", {fid: fid}, function(data) {
				console.log("[CacheMgr.getFeed] fetch a new feed from the server for share...");
				let feed = JSON.parse(data.trim());
				if (feed != null) SNS._share(feed);
			});
		} else {
			SNS._share(feed);
		}
	},

	_share: function (feed) {
		let feedObj = {
			objectType: "feed",
		};

		let content = {
			title: feed.title,
			description: feed.content,
			link: {
				mobileWebUrl: Config.url + "/feedViewShared.html?fid="+feed.fid,
				androidExecutionParams: "fid="+feed.fid
			}
		}
		let imgurl = isValid(feed.images) ? Config.getUserImgUrl(feed.mid, feed.images[0]) : "images/fox_logo_b.png";
		content.imageUrl = Config.url + "/" + imgurl;
		feedObj.content = content;
		feedObj.social = {
			likeCount: feed.likes.length,
			commentCount: isValid(feed.comments) ? feed.comments.length : 0,
		}

		Kakao.Link.sendDefault(feedObj);

	},
}

var SSO = {
	src: null,

	init: function(src) {
		this.src = src;
	},

	cbExternAuth : function(platform, auth) {
		var pstr = "platform=" + platform;
		if(platform === "kakao") {
			pstr += "&acctoken=" + auth.access_token
			+ "&reftoken=" + auth.refresh_token;
			var token = Params.get("urltoken", true);
			if (isValid(token)) {
				pstr += "&urltoken=" + token;
				Params.clear("urltoken");
			}
		} else if(platform == "naver") {
			pstr += "&image=" + auth.profile_image
			+ "&name=" + auth.name
			+ "&id=" + auth.id
			// 선택사항;
			+ "&birthday=" + auth.birthday
			+ "&birthyear=" + auth.birthyear
			+ "&email=" + auth.email
			+ "&gender=" + auth.gender
			+ "&mobile=" + auth.mobile;

		} else if(platform == "google") {
			pstr += "&image=" + auth.profile_image
			+ "&name=" + auth.name
			+ "&id=" + auth.id
			// 선택사항
			+ "&email=" + auth.email
		}

		this._login(pstr, function(code) {
			Page.goHome();
		});
	},

	login : function(type, usrobj) {
		if (type == "kakao") {
			this._loginKakao();
		} else {
			this._login2(usrobj);
		}
	},

	_login : function(pstr, cbfunc, type) {
	    AJAX.call("jsp/login.jsp", pstr, function (data) {
	        var code = data.trim();
	        if (code == "NA") {
	            Dialog.alert("입력하신 아이디가 존재하지 않습니다.");
	        } else {
	        	cbfunc(code);
	        }
	    });
	},

	_login2: function(usrobj) {
		if(usrobj == null) return;
	    var pstr = "mid=" + usrobj.mid + "&pass=" + usrobj.pass;
		this._login(pstr, function(code) {
			if (code == "PS") {
	            Dialog.alert("비밀번호가 일치하지 않습니다.");
	        } else if (code == "AD") {
	           	Dialog.confirm("관리자 페이지로 이동하시겠습니까?", function() {
	                Page.move("admin.html");
	           	}, function() {
	                Page.goHome();
	           	});
	        }
	        else {
	            Page.goHome();
	        }
		});
	},

	_loginKakao: function() {
		if (isDevice() && Params.get("cfgDevice").platform != "undefined") {
			// native app
			if (Params.get("cfgDevice").platform === "android") { // Android
				var url = "park://login.kakao";
				window.location.replace(url);
			} else if (Params.get("cfgDevice").platform === "ios") { // IOS
				webkit.messageHandlers.loginKakao.postMessage("");
			}
		} else if (isMobile()) {
			// mobile browser (as well as ios app currently)
			Kakao.Auth.authorize({
				redirectUri : Config.url + "/jsp/oauthKakao.jsp"
			});
		} else {
			// desktop browser
			Kakao.Auth.login({
				success : function(auth) {
					SSO.cbExternAuth("kakao", auth);
				},
				fail : function(err) {
					Dialog.alert("로그인에 실패했습니다. 관리자에게 문의해주세요.");
					console.log(JSON.stringify(err));
				}
			});
		}
	},

	logout: function () {
		Dialog.confirm("로그아웃 하시겠습니까?", function () {
			AJAX.call("jsp/logout.jsp", null, function () {
				Page.go("index.html");
			});
		});
	},
}

var Util = {
	getPlatform: function() {
		let varUA = navigator.userAgent.toLowerCase();
		if ( varUA.indexOf('android') > -1) {
	        //안드로이드
	        return "android";
	    } else if ( varUA.indexOf("iphone") > -1||varUA.indexOf("ipad") > -1||varUA.indexOf("ipod") > -1 ) {
	        //IOS
	        return "ios";
	    } else {
	        //아이폰, 안드로이드 외
	        return "other";
	    }
	},

	goLink: function(link) {
		console.log(link);
		Dialog.confirm("위 링크는 안전하지 않은 페이지 일 수 있습니다.<br>연결하시겠습니까?", function() {
			window.open(link, '_blank');
		})
	},

	timeForToday: function(value) {
		var _value = value.split(" ");
		value = _value[0] + "T" + _value[1];
		const today = new Date();
		const timeValue = new Date(value);
		const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
		if(betweenTime < 1) return "방금전";
		if(betweenTime < 60) return `${betweenTime}분전`;

		const betweenTimeHour = Math.floor(betweenTime / 60);
		if(betweenTimeHour < 24) return `${betweenTimeHour}시간전`;

		const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
		if(betweenTimeDay < 365) return `${betweenTimeDay}일전`;

		return `${Math.floor(betweenTimeDay / 365)}년전`;
	},
};

var WebText = {
	// used to store the text input into the server database
	escape: function (str) {
		if(!isValid(str)) return "";
		str = str.trim();
		str =(!isValid(str)) ? "" : str.replace(/%/g, '%25')
	        .replace(/"/g, '&quot;')
	        .replace(/'/g, '&#39;')
			.replace(/\t/g, '&#9;')
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
			.replace(/\\/g, '&#92;')
			.replace(/\n/g, '<br>');
		return str;
	},

	unescape: function (html, feed) {
		if(!isValid(html)) return "";
		html = html.trim();
		html = (!isValid(html)) ? "" : html.replace(/%25/g, '%')
			.replace(/&amp;/g, '&')
	        .replace(/&quot;/g, '\"')
	        .replace(/&#39;/g, '\'')
	        .replace(/&#9;/g, '\t')
	        .replace(/&lt;/g, '<')
	        .replace(/&gt;/g, '>')
	        .replace(/&#92;/g, '\\')
	        .replace(/&nbsp;/g, ' ')
	        .replace(/%20/g, ' ')
	        .replace(/u2018/g, '\'')
	        .replace(/u2019/g, '\'')
	        .replace(/u201C/g, '"')
	        .replace(/u201D/g, '"')
	        .replace(/u20[0-3][0-F]/g, '');

		if(!feed) {
			html = html.replace(/<br.*?>/g, '\n');
		}
		return html;
	},
};

function formatNum(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

function isDevice() {
	if (typeof _folksChartInterface != "undefined") {
		return true;
	} else {
		let dev = Params.get("cfgDevice", true);
		return (dev === "android" || dev === "ios");
	}
}
function isEmail(val) {
    var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return regExp.test(val);
}

function isMobile() {
	let dev = Params.get("cfgDevic").platform;
	return dev === "mobile";
}

function isValid(param) {
    return (param != null && param != "" && typeof param != "undefined");
}

function Request() {
    var requestParam = null;
    this.getParameter = function (param, utf8) {
        var url = (utf8 == true) ? location.href : unescape(location.href);
        var paramArr = (url.substring(url.indexOf("?") + 1, url.length)).split("&");

        requestParam = null;
        for (var i=0; i < paramArr.length; i++) {
            var temp = paramArr[i].split("=");
            if (temp[0].toUpperCase() == param.toUpperCase()) {
                requestParam = paramArr[i].split("=")[1];
                if (utf8 == true) {
                    requestParam = decodeURIComponent(requestParam);
                }
                break;
            }
        }
        return requestParam;
    }
}

function stripSpcChar(str, params) {
    if (params == null) params = {};
    if (!isValid(str)) return "";

    var str = str.replace(/u2018/g, '\'').replace(/u2019/g, '\'').replace(/u201C/g, '"').replace(/u201D/g, '"')
              .replace(/u20[0-3][0-F]/g, '');

    if (params.saveColon) {
        str = str.replace(/[a-z]|[\[\]{}()<>?|`!@#$%^&*●\-_+=,.;\"'\\]/g, "").replaceAll("/", "");
    }
    else {
        str = str.replace(/[a-z]|[\[\]{}()<>?|`~!@#$%^&*●\_+=,.;:\"'\\]/g, "").replaceAll("/", "");
    }

    if (params.delSpace) str = str.replaceAll(" ", "");
    return str;
}

