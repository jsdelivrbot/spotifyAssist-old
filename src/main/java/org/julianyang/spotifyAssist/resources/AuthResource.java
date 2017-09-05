package org.julianyang.spotifyAssist.resources;

import com.google.api.client.extensions.appengine.http.UrlFetchTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.gson.Gson;
import com.googlecode.objectify.Key;
import java.net.URI;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Base64;
import static org.julianyang.spotifyAssist.OfyService.ofy;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriBuilder;
import org.glassfish.jersey.server.mvc.Viewable;
import org.julianyang.spotifyAssist.AuthType;
import org.julianyang.spotifyAssist.SecondTest;
import org.julianyang.spotifyAssist.TestClass;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.text.SimpleDateFormat;
import java.util.logging.Logger;
import org.julianyang.spotifyAssist.api.TokenExchangeResponse;
import org.julianyang.spotifyAssist.entity.Authorization;

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

  private String generateCode() {
	  byte bytes[] = new byte[16];
    secureRandom.nextBytes(bytes);
    return Base64.getEncoder().encodeToString(bytes);
  }

  private LocalDateTime getTimeNow () {
	  return LocalDateTime.now(ZoneId.of("America/Los_Angeles"));
  }

  @GET
  public Viewable index() {
	  return new Viewable("auth.html");
  }

	@POST
	@Path("signin")
	public Response post(
	    @FormParam("idtoken") String idToken,
      @FormParam("state") String state,
      @FormParam("redirectUri") String redirectUri) {
	  try {
      GoogleIdToken googleIdToken = verifier.verify(idToken);
      if (googleIdToken != null && redirectUri != null) {
        Payload payload = googleIdToken.getPayload();

        // Print user identifier
        String userId = payload.getSubject();
        System.out.println("User ID: " + userId);
        System.out.println("state: " + state);
        System.out.println("redirectUri: " + redirectUri);

        // Attempt to fetch user
//        User user = ofy().load().key(Key.create(User.class, userId)).now();
//        if (user == null) {
//          System.out.println("Creating new user");
        LocalDateTime expiration = getTimeNow().plusMinutes(10);
        Authorization auth = new Authorization(
            generateCode(), AuthType.AUTH_CODE, userId, "google", expiration);
        System.out.println("Authorization: " + auth);

        ofy().save().entity(auth).now();
        URI uri = UriBuilder.fromUri(redirectUri)
            .queryParam("code", auth.id)
            .queryParam("state", state)
            .build();
        return Response.seeOther(uri).build();
      } else {
        System.out.println("Google id token was not verified (null value)");
      }
    } catch (GeneralSecurityException e) {
      System.out.println(e.toString());
      System.out.println(e.getLocalizedMessage());
    } catch (Exception e) {
      System.out.println("caught exception e: " + e.getMessage());
    }
    return Response.status(Status.BAD_REQUEST).tag("We could not process this request.").build();
	}

	@POST
  @Path("token")
  @Produces(MediaType.APPLICATION_JSON)
  public Object getToken(
      @FormParam("client_id") String clientId,
      @FormParam("client_secret") String clientSecret,
      @FormParam("grant_type") String grantType,
      @FormParam("code") String code,
      @FormParam("refresh_token") String refreshToken) {
	  String expectedClientSecret = "secret";
	  String authId = grantType.equals("authorization_code") ? code : refreshToken;
	  Authorization auth = ofy().load().key(Key.create(Authorization.class, authId)).now();
    TokenExchangeResponse tokenExchangeResponse;
	  if (clientId.equals("google") && clientSecret.equals(expectedClientSecret) && auth != null) {
	    if (grantType.equals("authorization_code") && auth.type == AuthType.AUTH_CODE &&
          getTimeNow().isBefore(auth.getExpiresAt()) && auth.clientId.equals(clientId)) {
          // generate access token
        Authorization accessToken = new Authorization(
            generateCode(), AuthType.ACCESS, auth.userId, auth.clientId, getTimeNow().plusHours(1));
        Authorization newRefreshToken = new Authorization(
            generateCode(), AuthType.REFRESH, auth.userId, auth.clientId, null);
        ofy().save().entities(accessToken, newRefreshToken).now();
        tokenExchangeResponse = TokenExchangeResponse.builder()
            .setaccess_token(accessToken.id)
            .setrefresh_token(newRefreshToken.id)
            .setexpires_in(getTimeNow().until(accessToken.getExpiresAt(), ChronoUnit.SECONDS))
            .build();
        return gson.toJson(tokenExchangeResponse, TokenExchangeResponse.class);

      } else if (grantType.equals("refresh_token") && auth.type == AuthType.REFRESH &&
          auth.clientId.equals(clientId)) {
        Authorization accessToken = new Authorization(
            generateCode(), AuthType.ACCESS, auth.userId, auth.clientId, getTimeNow().plusHours(1));
        tokenExchangeResponse = TokenExchangeResponse.builder()
              .setaccess_token(accessToken.id)
              .setexpires_in(getTimeNow().until(accessToken.getExpiresAt(), ChronoUnit.SECONDS))
              .build();
        return gson.toJson(tokenExchangeResponse, TokenExchangeResponse.class);
      }
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
