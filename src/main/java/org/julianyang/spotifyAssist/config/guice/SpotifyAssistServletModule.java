package org.julianyang.spotifyAssist.config.guice;

import com.google.inject.servlet.ServletModule;
import com.googlecode.objectify.ObjectifyFilter;
import org.julianyang.spotifyAssist.SpotifyAssistServlet;

public class SpotifyAssistServletModule extends ServletModule {
	@Override
	protected void configureServlets() {
		serveRegex("^/(!_ah.*)").with(SpotifyAssistServlet.class);
		filter("/*").through(ObjectifyFilter.class);
	}
}
