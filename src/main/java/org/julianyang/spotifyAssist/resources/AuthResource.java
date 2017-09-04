package org.julianyang.spotifyAssist.resources;

import com.fasterxml.jackson.core.JsonParseException;
import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.gson.Gson;
import java.security.GeneralSecurityException;
import java.util.Collections;
import org.julianyang.spotifyAssist.SecondTest;
import org.julianyang.spotifyAssist.TestClass;
import org.julianyang.spotifyAssist.api.SimpleResponse;
import org.julianyang.spotifyAssist.api.SimpleReturnObject;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.logging.Logger;

@Path("/auth")
public class AuthResource {

	private static final Logger log = Logger.getLogger(AuthResource.class.getName());
	GoogleIdTokenVerifier verifier;
	TestClass first;
	SecondTest second;
	Gson gson;

	@Inject
	AuthResource(TestClass first, SecondTest second, Gson gson) {
		this.first = first;
		this.second = second;
		this.gson = gson;
    verifier = new GoogleIdTokenVerifier
        .Builder(UrlFetchTransport.getDefaultInstance(), JacksonFactory.getDefaultInstance())
        .setAudience(Collections.singletonList("459108910569-8g7sdom2iutcp2v2mvg1ab7hvkhm4c10.apps.googleusercontent.com"))
        .build();
  }

	@POST
	@Path("tokensignin")
	@Produces(MediaType.TEXT_PLAIN)
	public String post(@FormParam("idtoken") String token, @FormParam("state") String state) {
	  try {
      GoogleIdToken idToken = verifier.verify(token);
      if (idToken != null) {
        Payload payload = idToken.getPayload();

        // Print user identifier
        String userId = payload.getSubject();
        System.out.println("User ID: " + userId);
        System.out.println("state: " + state);

        // Get profile information from payload
        String email = payload.getEmail();
        boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");
        String locale = (String) payload.get("locale");
        String familyName = (String) payload.get("family_name");
        String givenName = (String) payload.get("given_name");
        return String.format("id: %s, email: %s, name: %s, locale: %s", userId, email, name, locale);
      }
    } catch (GeneralSecurityException e) {
      System.out.println(e.toString());
      System.out.println(e.getLocalizedMessage());
    } catch (Exception e) {
      System.out.println(e.getMessage());
    }
    return "";
	}

//	@GET
//	@Produces(MediaType.TEXT_PLAIN)
//	public String get(
//			@QueryParam("client_id") String clientId,
//			@QueryParam("redirect_uri") String redirectUri,
//			@QueryParam("state") String state,
//			@QueryParam("response_type") String responseType) {
//		return ("Hey there from auth!");
//	}

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

//	@POST
//	@Produces(MediaType.APPLICATION_JSON)
//	public Object post(String json) {
//		log.info("Received request: " + json);
//		SimpleResponse resp = SimpleResponse.builder()
//				.setSpeech("hello there!")
//				.setDisplayText("hello there reader!")
//				.setData("")
//				.setContextOut(new ArrayList<String>())
//				.setSource("webhook")
//				.build();
//
//		return gson.toJson(resp, SimpleResponse.class);
//		String response = "{\"speech\":\"hello there\",\"displayText\":\"hello there reader!\",\"contextOut\":[],\"source\":\"webhook\"}";
//		log.info("Sending response: " + response);
//		return response;
//	}
}
