package org.julianyang.spotifyAssist;

import java.io.IOException;
import java.text.SimpleDateFormat;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
@Singleton
public class SpotifyAssistServlet extends HttpServlet {

	private final TestClass testClass;

	@Inject
	SpotifyAssistServlet(TestClass testClass) {
		this.testClass = testClass;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Hello from SpotifyAssist!");

		SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss.SSS");
		resp.getWriter().println("Date is: " + sdf.format(testClass.getDate()));
	}
}
