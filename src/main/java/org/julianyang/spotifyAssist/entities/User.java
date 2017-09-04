package org.julianyang.spotifyAssist.entities;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;

@Entity
public class User {
	@Id
	Long id;
	String familyName;

	private User() {}

	public User(String familyName) {
		this.familyName = familyName;
	}

}
