package org.julianyang.spotifyAssist;

import com.google.inject.servlet.RequestScoped;

import javax.inject.Inject;
import java.util.Date;

@RequestScoped
public class SecondTest {
	private Date date;

	@Inject
	public SecondTest(Date date) {
		this.date = date;
	}

	public Date getDate() {
		return date;
	}
}
