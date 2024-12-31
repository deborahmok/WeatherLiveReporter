package WeatherLiveReporter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JDBCConnector {
	public static int loginUser(String username, String password) {
	    try {
	        Class.forName("com.mysql.cj.jdbc.Driver");
	    } 
	    catch (ClassNotFoundException e) {
	        e.printStackTrace();
	        return -1; 
	    }

	    Connection conn = null;
	    Statement st = null;
	    ResultSet rs = null;

	    try {
	        conn = DriverManager.getConnection("jdbc:mysql://localhost/(projectName)?user=root&password=(password)");

	        st = conn.createStatement();
	        rs = st.executeQuery("SELECT user_id, password FROM users WHERE username = '" + username + "'");

	        if (rs.next()) {
	            String dbPassword = rs.getString("password");
	            if (dbPassword.equals(password)) {
	                return 1;
	            } 
	            else {
	                return -2;
	            }
	        } 
	        else {
	            return -1; 
	        }
	    } 
	    catch (SQLException sqle) {
	        System.out.println("SQLException: " + sqle.getMessage());
	        sqle.printStackTrace();
	        return -1; 
	    } 
	    finally {
	        try {
	            if (rs != null) rs.close();
	            if (st != null) st.close();
	            if (conn != null) conn.close();
	        } 
	        catch (SQLException sqle) {
	            System.out.println("SQLException closing resources: " + sqle.getMessage());
	        }
	    }
	}
	
	public static int registerUser(String username, String password) {
	    try {
	        Class.forName("com.mysql.cj.jdbc.Driver");
	    } catch (ClassNotFoundException e) {
	        e.printStackTrace();
	        return -1;
	    }

	    Connection conn = null;
	    Statement st = null;
	    ResultSet rs = null;
	    int userID = -1;

	    try {
	        conn = DriverManager.getConnection("jdbc:mysql://localhost/(projectName)?user=root&password=(password)");
	        st = conn.createStatement();
	        rs = st.executeQuery("SELECT * FROM users WHERE username='" + username + "'");
	        
	        if (rs.next()) {
	            System.out.println("This username is already taken.");
	            return -1;
	        }
	        
	        rs.close();
	        st.execute("INSERT INTO users (username, password) VALUES ('" + username + "', '" + password + "')");
	        rs = st.executeQuery("SELECT LAST_INSERT_ID()");
	        if (rs.next()) {
	            userID = rs.getInt(1);
	            System.out.println("Successfully created a new account! User ID: " + userID);
	            return 1; 
	        }

	    } 
	    catch (SQLException sqle) {
	        System.out.println("SQLException: " + sqle.getMessage());
	        sqle.printStackTrace();
	    } 
	    finally {
	        try {
	            if (rs != null) rs.close();
	            if (st != null) st.close();
	            if (conn != null) conn.close();
	        } catch (SQLException sqle) {
	            System.out.println("SQLException while closing resources: " + sqle.getMessage());
	        }
	    }
	    return -1;
	}
	
	public static String storeSearchHistory(String username, String searchHistory) {
	    try {
	        Class.forName("com.mysql.cj.jdbc.Driver");
	    } catch (ClassNotFoundException e) {
	        e.printStackTrace();
	        return "";
	    }

	    Connection conn = null;
	    Statement st = null;
	    ResultSet rs = null;
	    String userID = "";

	    try {
	        conn = DriverManager.getConnection("jdbc:mysql://localhost/(projectName)?user=root&password=(password)");

	        st = conn.createStatement();
	        rs = st.executeQuery("SELECT user_id FROM users WHERE username='" + username + "'");

	        if (rs.next()) {
	        	userID = rs.getString("user_id");
	            st.execute("INSERT INTO searches (user_id, search_query, timestamp) " + " VALUES ('" + userID + "', '" + searchHistory + "', NOW())");
//	            rs.next();
	            System.out.println("Storing search history for user: " + username + " - " + searchHistory);
	        }
		    else {
	            System.out.println("User not found.");
	            return "";
	        }
	    } 
	    catch (SQLException sqle) {
	        System.out.println("SQLException: " + sqle.getMessage());
	        sqle.printStackTrace();
	    } 
	    finally {
	        try {
	            if (rs != null) rs.close();
	            if (st != null) st.close();
	            if (conn != null) conn.close();
	        } 
	        catch (SQLException sqle) {
	            System.out.println("sqle closing resources: " + sqle.getMessage());
	        }
	    }
	    return userID;
	}
	
	public static String getUserID(String username) {
		try {
	        Class.forName("com.mysql.cj.jdbc.Driver");
	    } 
		catch (ClassNotFoundException e) {
	        e.printStackTrace();
	        return "";
	    }

	    Connection conn = null;
	    Statement st = null;
	    ResultSet rs = null;
	    String userID = "";

	    try {
	        conn = DriverManager.getConnection("jdbc:mysql://localhost/(projectName)?user=root&password=(password)");

	        st = conn.createStatement();
	        rs = st.executeQuery("SELECT user_id FROM users WHERE username='" + username + "'");

	        if (rs.next()) {
	        	userID = rs.getString("user_id");
//	            rs.next();
	        }
		    else {
	            System.out.println("User not found.");
	            return "";
	        }
	    } 
	    catch (SQLException sqle) {
	        System.out.println("SQLException: " + sqle.getMessage());
	        sqle.printStackTrace();
	    } 
	    finally {
	        try {
	            if (rs != null) rs.close();
	            if (st != null) st.close();
	            if (conn != null) conn.close();
	        } 
	        catch (SQLException sqle) {
	            System.out.println("sqle closing resources: " + sqle.getMessage());
	        }
	    }
	    return userID;
	}
	
	public static List<Map<String, Object>> getSortedSearchHistory(String userID) {
	    List<Map<String, Object>> searchHistory = new ArrayList<>();

	    try {
	        Class.forName("com.mysql.cj.jdbc.Driver");

	        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/(projectName)?user=root&password=(password)");
	             Statement st = conn.createStatement();
	             ResultSet rs = st.executeQuery("SELECT search_query, timestamp FROM searches WHERE user_id = '" + userID + "' ORDER BY timestamp DESC")) {

//	        	System.out.println("Storing search history for user ID: " + userID + " with query: " + searchHistory);

	        	//citation chatgpt "debug: using hashmap to map fix the syntax" line 212-215
	            while (rs.next()) {
	                Map<String, Object> entry = new HashMap<>();
	                entry.put("search_query", rs.getString("search_query"));
	                entry.put("timestamp", rs.getTimestamp("timestamp").toString());
	                searchHistory.add(entry);
	            }

	            //total number of entries found
//	            System.out.println("Total search history entries for user ID " + userID + ": " + searchHistory.size());

	        } catch (SQLException sqle) {
	            System.out.println("SQLException in getSortedSearchHistory: " + sqle.getMessage());
	            sqle.printStackTrace();
	        }

	    } catch (ClassNotFoundException e) {
	        System.out.println("JDBC Driver not found: " + e.getMessage());
	        e.printStackTrace();
	    }

	    return searchHistory;
	}
}
