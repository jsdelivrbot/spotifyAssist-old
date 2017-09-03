package org.julianyang.spotifyAssist.config.guice;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;

public class SpotifyAssistGuiceServletContextListener extends GuiceServletContextListener {
	@Override
	protected Injector getInjector() {
		return Guice.createInjector(new SpotifyAssistServletModule(), new GsonTypeAdapterModule());
	}
}
