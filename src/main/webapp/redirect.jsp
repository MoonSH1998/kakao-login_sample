<%@ page import="java.*" %>
<head>
<title>login</title>
    <div id="a"></div>

    <script src="https://api.jquery.com/jQuery.ajax"></script>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script language="javascript">

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    var code = getParameterByName('code');

    let Token = (new getToken(code));








</script>

</head>
