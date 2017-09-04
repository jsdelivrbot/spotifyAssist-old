package org.julianyang.spotifyAssist.entity;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

@Entity
public class User {
	@Id
	public String id;
	public String accessToken;
	public String clientId;

	private User() {}

	public User(String id, String accessToken, String clientId) {
		this.id = id;
		this.accessToken = accessToken;
		this.clientId = clientId;
	}

	@Override
	public String toString() {
		return ReflectionToStringBuilder.toString(this, ToStringStyle.MULTI_LINE_STYLE);
	}

}
