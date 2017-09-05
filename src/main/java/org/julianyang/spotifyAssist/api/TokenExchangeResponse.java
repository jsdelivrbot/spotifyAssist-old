package org.julianyang.spotifyAssist.api;

import com.google.auto.value.AutoValue;
import com.google.gson.Gson;
import com.google.gson.TypeAdapter;
import javax.annotation.Nullable;

@AutoValue
public abstract class TokenExchangeResponse {
	public abstract String token_type();
	public abstract String access_token();
	@Nullable
	public abstract String refresh_token();
	public abstract long expires_in();

	public static TypeAdapter<TokenExchangeResponse> typeAdapter(Gson gson) {
		return new AutoValue_TokenExchangeResponse.GsonTypeAdapter(gson);
	}

	public static Builder builder() {
		return new AutoValue_TokenExchangeResponse.Builder();
	}

	@AutoValue.Builder
	public abstract static class Builder {
		abstract Builder settoken_type(String value);
		public abstract Builder setaccess_token(String value);
		public abstract Builder setrefresh_token(String value);
		public abstract Builder setexpires_in(long value);

		abstract TokenExchangeResponse autoBuild();
		public TokenExchangeResponse build() {
			settoken_type("bearer");
			return autoBuild();
		}
	}
}
