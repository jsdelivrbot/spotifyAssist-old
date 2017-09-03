package org.julianyang.spotifyAssist.api;

import com.google.gson.TypeAdapterFactory;
import com.ryanharter.auto.value.gson.GsonTypeAdapterFactory;

@GsonTypeAdapterFactory
public abstract class AutoGsonTypeAdapterFactory implements TypeAdapterFactory {
	public static AutoGsonTypeAdapterFactory create () {
		return new AutoValueGson_AutoGsonTypeAdapterFactory();
	}
}
