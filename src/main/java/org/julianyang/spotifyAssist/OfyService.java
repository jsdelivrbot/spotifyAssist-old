package org.julianyang.spotifyAssist;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;
import org.julianyang.spotifyAssist.entity.Authorization;
import org.julianyang.spotifyAssist.entity.User;

public class OfyService {
  static {
    ObjectifyService.register(User.class);
    ObjectifyService.register(Authorization.class);
  }

  public static Objectify ofy() {
    return ObjectifyService.ofy();
  }

  public static ObjectifyFactory factory() {
    return ObjectifyService.factory();
  }
}
