package org.julianyang.spotifyAssist.resources;

import com.google.gson.Gson;
import org.julianyang.spotifyAssist.SecondTest;
import org.julianyang.spotifyAssist.TestClass;
import org.julianyang.spotifyAssist.api.SimpleReturnObject;
import org.julianyang.spotifyAssist.api.SimpleResponse;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.text.SimpleDateFormat;

@Path("/Hey")
public class HeyResource {

	TestClass first;
	SecondTest second;
	Gson gson;

	@Inject
	HeyResource(TestClass first, SecondTest second, Gson gson) {
		this.first = first;
		this.second = second;
		this.gson = gson;
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

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/json")
	public Object json() {
		SimpleReturnObject ret = new SimpleReturnObject();
		ret.setFruit("Apple");
		ret.setHome("Hong Kong");
		return ret;
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Object post(String json) {
		SimpleResponse resp = SimpleResponse.builder()
				.setSpeech("hello there!")
				.setDisplayText("hello there reader!")
				.build();
		
		return gson.toJson(resp, SimpleResponse.class);
	}
}
