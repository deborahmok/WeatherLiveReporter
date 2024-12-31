package WeatherLiveReporter;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import javax.servlet.http.*;

@WebServlet("/Weather")
public class Weather extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        PrintWriter pw = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Gson gson = new Gson();

        try {
            BufferedReader reader = request.getReader();
            StringBuilder rawRequestBody = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                rawRequestBody.append(line);
            }
            System.out.println("Received raw JSON: " + rawRequestBody.toString());

            JsonObject input = gson.fromJson(rawRequestBody.toString(), JsonObject.class);
            
            String username = input.get("username").getAsString();
            String type = input.get("type").getAsString();
            String searchHistory;

            if ("city".equals(type)) {
                String city = input.get("input").getAsString();
                if (city == null || city.isBlank()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    pw.write(gson.toJson("City input is missing."));
                    return;
                }
                searchHistory = city;
            } 
            else if ("latlong".equals(type)) {
            	String latLongInput = input.get("input").getAsString();

            	if (latLongInput == null || latLongInput.isBlank()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    pw.write(gson.toJson("Latitude and Longitude input is missing."));
                    return;
                }
                searchHistory = latLongInput;
            } 
            else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                pw.write(gson.toJson("Invalid search type."));
                return;
            }

            String userID = JDBCConnector.storeSearchHistory(username, searchHistory);

            if (userID.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                pw.write(gson.toJson("An error occurred while storing search history."));
            } 
            else {
                response.setStatus(HttpServletResponse.SC_OK);
                pw.write(gson.toJson("Search history stored successfully for user ID: " + userID));
            }

        } 
        catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            pw.write(gson.toJson("An internal error occurred: " + e.getMessage()));
            e.printStackTrace();
        } 
        finally {
            pw.flush();
        }
    }
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter pw = response.getWriter();

        Gson gson = new Gson();

        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                pw.write(gson.toJson("Session not found. User not logged in."));
                return;
            }
            if (session.getAttribute("userID") == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                pw.write(gson.toJson("Session exists but userID is missing. User not logged in."));
                return;
            }

            String userID = (String) session.getAttribute("userID");
            System.out.println("UserID from session: " + userID);

            List<Map<String, Object>> searchHistory = JDBCConnector.getSortedSearchHistory(userID);
            
            System.out.println("Returned search history size: " + (searchHistory != null ? searchHistory.size() : "null"));
            
            if (searchHistory == null || searchHistory.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                pw.write(gson.toJson("No search history found."));
            } 
            else {
                response.setStatus(HttpServletResponse.SC_OK);
                pw.write(gson.toJson(searchHistory));
            }

        } 
        catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String errorMessage = "An error occurred: " + e.getMessage();
            System.err.println(errorMessage);
            pw.write(gson.toJson("An error occurred: " + e.getMessage()));
            e.printStackTrace();
        } 
        finally {
            pw.flush();
        }
    }
}