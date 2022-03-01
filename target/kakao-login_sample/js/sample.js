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