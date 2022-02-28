<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="org.json.simple.parser.*"%>
<%@ page import="org.json.simple.*"%>
<%@ page import="User.Core" %>
<%
    String code = request.getParameter("code");

    String result = (new Core().getTokenStart(code));

    JSONObject jsonobj = (JSONObject) (new JSONParser().parse(result));

    String url =  "http://localhost:8080/kakao_login_sample_war_exploded/getToken.html";
    if (jsonobj.get("access_token") != null) {
        url += "?oauth=kakao&access_token=" + jsonobj.get("access_token");
        url += "&refresh_token=" + jsonobj.get("refresh_token");
        url += "&caller=" + request.getParameter("caller");
    }
    else {
        url = "http://localhost:8080/kakao_login_sample_war_exploded/main.html";
    }
    response.sendRedirect(url);


%>