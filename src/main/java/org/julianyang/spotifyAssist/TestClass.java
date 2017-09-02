package org.julianyang.spotifyAssist;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.Date;

@Singleton
public class TestClass {
	private final Date date;

	@Inject
	public TestClass(Date date) {
		this.date = date;
	}

	public Date getDate() {
		return date;
	}
}
