package org.julianyang.spotifyAssist.config.guice;

import com.google.inject.servlet.ServletModule;
import org.julianyang.spotifyAssist.SpotifyAssistServlet;

public class SpotifyAssistServletModule extends ServletModule {
	@Override
	protected void configureServlets() {
		serve("/hi").with(SpotifyAssistServlet.class);
	}
}
