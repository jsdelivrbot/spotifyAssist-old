package org.julianyang.spotifyAssist.entity;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import java.time.LocalDateTime;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.julianyang.spotifyAssist.AuthType;

@Entity
public class Authorization {
	@Id
	public String id;
	public AuthType type;
	public String userId;
	public String clientId;
	private String expiresAt;

	private Authorization() {}

	public Authorization(String id, AuthType type, String userId, String clientId, LocalDateTime expiresAt) {
		this.id = id;
		this.type = type;
		this.userId = userId;
		this.clientId = clientId;
		this.expiresAt = expiresAt != null ? expiresAt.format(ISO_LOCAL_DATE_TIME) : null;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt != null ? LocalDateTime.parse(expiresAt, ISO_LOCAL_DATE_TIME) : null;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this);
	}

}
