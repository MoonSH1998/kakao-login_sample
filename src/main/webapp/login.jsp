<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="org.json.simple.*" %>
<%@ page import="org.json.simple.parser.*" %>
<%@ page import="java.io.*" %>
<%@ page import="User.Core" %>
<% 
	request.setCharacterEncoding("UTF-8");
	JSONObject usrobj = null;
	String mid = null, pass = null;
	String result = (new Core().getTokenFinish(request.getParameter("acctoken"), request.getParameter("reftoken")));
	String urltoken = request.getParameter("urltoken");
	JSONObject jsonobj = (JSONObject) (new JSONParser().parse(result));

	if (jsonobj.get("id") != null) {
			mid = "kakao" + (jsonobj.get("id"));
			pass = mid;
	}
	out.print(jsonobj);
%>