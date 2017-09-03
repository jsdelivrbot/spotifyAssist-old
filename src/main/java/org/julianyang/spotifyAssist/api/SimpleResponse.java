package org.julianyang.spotifyAssist.api;

import com.google.auto.value.AutoValue;
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;

@AutoValue
public abstract class SimpleResponse {
	public abstract String speech();
	public abstract String displayText();

	public static Builder builder() {
		return new AutoValue_SimpleResponse.Builder();
	}

	public static TypeAdapter<SimpleResponse> typeAdapter(Gson gson) {
		return new AutoValue_SimpleResponse.GsonTypeAdapter(gson);
	}

	@AutoValue.Builder
	public abstract static class Builder {
		public abstract Builder setSpeech(String value);
		public abstract Builder setDisplayText(String value);
		public abstract SimpleResponse build();
	}
}
