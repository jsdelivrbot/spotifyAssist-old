package org.julianyang.spotifyAssist.config.guice;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.googlecode.objectify.ObjectifyFilter;
import org.julianyang.spotifyAssist.api.AutoGsonTypeAdapterFactory;

public class BindingModule extends AbstractModule {
	@Override
	protected void configure() {
		bind(ObjectifyFilter.class).in(Singleton.class);
	}

	@Provides
	@Singleton
	Gson provideGson() {
		return new GsonBuilder()
				.registerTypeAdapterFactory(AutoGsonTypeAdapterFactory.create())
				.create();
	}
}
