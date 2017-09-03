package org.julianyang.spotifyAssist.resources;

import org.julianyang.spotifyAssist.SecondTest;
import org.julianyang.spotifyAssist.TestClass;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.text.SimpleDateFormat;

@Path("/Hey")
public class HeyResource {

	TestClass first;
	SecondTest second;

	@Inject
	HeyResource(TestClass first, SecondTest second) {
		this.first = first;
		this.second = second;
	}

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String get() {
		return ("Hey there");
	}

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/foo")
	public String foo(@QueryParam("test") String test) {
		SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss.SSS");
		StringBuilder builder = new StringBuilder();

		builder.append("Hi there. You entered ").append(test).append("\n");
		builder.append("The first date is:").append(sdf.format(first.getDate())).append("\n");
		builder.append("The second date is:").append(sdf.format(second.getDate())).append("\n");
		return builder.toString();
	}
}
