package org.julianyang.spotifyAssist.resources;

import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.Objectify;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.Base64;
import static org.julianyang.spotifyAssist.OfyService.ofy;
import org.julianyang.spotifyAssist.SecondTest;
import org.julianyang.spotifyAssist.TestClass;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.text.SimpleDateFormat;
import java.util.logging.Logger;
import org.julianyang.spotifyAssist.entity.User;

@Path("/auth")
public class AuthResource {

	private static final Logger log = Logger.getLogger(AuthResource.class.getName());
	GoogleIdTokenVerifier verifier;
	TestClass first;
	SecondTest second;
	Gson gson;
	SecureRandom secureRandom;

	@Inject
	AuthResource(TestClass first, SecondTest second, Gson gson, SecureRandom secureRandom) {
		this.first = first;
		this.second = second;
		this.gson = gson;
		this.secureRandom = secureRandom;
    verifier = new GoogleIdTokenVerifier
        .Builder(UrlFetchTransport.getDefaultInstance(), JacksonFactory.getDefaultInstance())
        .setAudience(Collections.singletonList("459108910569-8g7sdom2iutcp2v2mvg1ab7hvkhm4c10.apps.googleusercontent.com"))
        .build();
  }

	@POST
	@Path("tokensignin")
	@Produces(MediaType.TEXT_PLAIN)
	public String post(
	    @FormParam("idtoken") String idToken,
      @FormParam("state") String state,
      @FormParam("redirectUri") String redirectUri) {
	  try {
      GoogleIdToken googleIdToken = verifier.verify(idToken);
      if (googleIdToken != null) {
        Payload payload = googleIdToken.getPayload();

        // Print user identifier
        String userId = payload.getSubject();
        System.out.println("User ID: " + userId);
        System.out.println("state: " + state);
        System.out.println("redirectUri: " + redirectUri);

        // Attempt to fetch user
        User user = ofy().load().key(Key.create(User.class, userId)).now();
        if (user == null) {
          System.out.println("Creating new user");
          byte bytes[] = new byte[16];
          secureRandom.nextBytes(bytes);
          String accessToken = Base64.getEncoder().encodeToString(bytes);
          System.out.println("accessToken: " + accessToken);
          user = new User(userId, accessToken, "google");
          ofy().save().entity(user).now();
        } else {
          System.out.println("User already signed in!");
        }

        System.out.println(user);


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
