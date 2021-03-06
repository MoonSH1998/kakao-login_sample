package User;

import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.SQLException;
import javax.naming.NamingException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Core {
    public String getTokenStart(String code) throws Exception {
        String redirectUrl =  "http://localhost:8080/kakao_login_sample_war_exploded/redirect.jsp";
        String url = "https://kauth.kakao.com/oauth/token";
        url += "?grant_type=authorization_code";

        url += "&client_id=4c5319b0b1dd1d28fb72f456eb20a542";
        url += "&redirect_uri=" + redirectUrl;
        url += "&code=" + code;

        HttpURLConnection con = (HttpURLConnection) (new URL(url)).openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        con.setInstanceFollowRedirects(false);

        return response("getKakaoUserInfoWithCode : ", con);
    }
    public String response(String TAG, HttpURLConnection con) {
        return response(TAG, con, "UTF-8"); // default UTF-8
    }
    public String response(String TAG, HttpURLConnection con, String encoding) {
        try {
            int responseCode = con.getResponseCode();
            BufferedReader br;
            if (responseCode == 200) {
                br = new BufferedReader(new InputStreamReader(con.getInputStream(), encoding));
            }
            else {
                br = new BufferedReader(new InputStreamReader(con.getErrorStream(), encoding));
            }

            String line;
            StringBuffer sbuf = new StringBuffer();
            while ((line = br.readLine()) != null) {
                sbuf.append(line);
            }
            br.close();
            //System.out.println( TAG + sbuf.toString());
            return sbuf.toString();

        } catch (Exception ex) {
            ex.printStackTrace();;
            return ex.getLocalizedMessage();
        }
    }

    public String getTokenFinish(String acctoken, String reftoken) throws Exception {
        String url = "https://kapi.kakao.com/v2/user/me";
        url += "?secure_resource=true";

        HttpURLConnection con = (HttpURLConnection) (new URL(url)).openConnection();
        con.setRequestMethod("GET");
        con.setRequestProperty("Authorization", "Bearer " + acctoken);
        return fixJSON(response("getKakaoUserInfo : ", con));
    }


    public static String fixJSON(String str) {
        if (str == null) return str;

        str = str.trim().replace("{\"","@$lb"); // for {"
        str = str.replace("\"}","@$rb"); // for "}

        str = str.replace("\",\"","@$cm"); // for ","
        str = str.replace("\":\"","@$cl"); // for ":"

        str = str.replace(":\"", "@$rdqc"); // for :"
        str = str.replace("\":", "@$ldqc"); // for ":
        str = str.replace(",\"", "@$rdqo"); // for ,"
        str = str.replace("\",", "@$ldqo"); // for ",

        str = str.replace("'", "").replace("\"", "").replace("\\","");

        str = str.replace("@$rdqo",",\"" ); // for ,"
        str = str.replace("@$ldqo", "\"," ); // for ",
        str = str.replace("@$rdqc", ":\""); // for :"
        str = str.replace("@$ldqc","\":"); // for ":

        str = str.replace("@$lb", "{\"");
        str = str.replace("@$rb","\"}");

        str = str.replace("@$cm","\",\"");
        str = str.replace("@$cl","\":\"");

        return str;
    }

}