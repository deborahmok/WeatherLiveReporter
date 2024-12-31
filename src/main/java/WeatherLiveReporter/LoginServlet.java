package WeatherLiveReporter;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import javax.servlet.http.*;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	    PrintWriter pw = response.getWriter();
	    response.setContentType("application/json");
	    response.setCharacterEncoding("UTF-8");
	
	    User user = new Gson().fromJson(request.getReader(), User.class);
	
	    String username = user.username;
	    String password = user.password;
	
	    Gson gson = new Gson();
	
	    if (username == null || username.isBlank() || password == null || password.isBlank()) {
	        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
	        String error = "User info is missing.";
	        pw.write(gson.toJson(error));
	        pw.flush();
	        return;
	    }
	
	    int loginResult = JDBCConnector.loginUser(username, password);
	
	    if (loginResult == 1) { 
	        String userID = JDBCConnector.getUserID(username);
	
	        if (userID.isEmpty()) {
	            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	            String error = "Failed to retrieve user information.";
	            pw.write(gson.toJson(error));
	            return;
	        }
	
	        HttpSession session = request.getSession(true);
	        session.setAttribute("userID", userID);
	        session.setAttribute("username", username);
	        response.setStatus(HttpServletResponse.SC_OK);
	        pw.write(gson.toJson("Successful Login!"));
	        pw.flush();
	    } else if (loginResult == -1) {
	        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
	        String error = "This user does not exist.";
	        pw.write(gson.toJson(error));
	        pw.flush();
	    } else if (loginResult == -2) {
	        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
	        String error = "Incorrect password.";
	        pw.write(gson.toJson(error));
	        pw.flush();
	    } else {
	        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	        String error = "An unexpected error occurred.";
	        pw.write(gson.toJson(error));
	        pw.flush();
	    }
	}
}