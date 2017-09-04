package org.julianyang.spotifyAssist.config.jersey;

import com.google.inject.Injector;
import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.mvc.freemarker.FreemarkerMvcFeature;
import org.jvnet.hk2.guice.bridge.api.GuiceBridge;
import org.jvnet.hk2.guice.bridge.api.GuiceIntoHK2Bridge;

import javax.inject.Inject;
import javax.servlet.ServletContext;
import java.util.logging.Logger;

public class JerseyConfiguration extends ResourceConfig {
	private final Logger log = Logger.getLogger(getClass().getName());

	@Inject
	public JerseyConfiguration(ServiceLocator serviceLocator, ServletContext servletContext) {
		log.info("Creating JerseyConfiguration");
		packages("org.julianyang.spotifyAssist.resources");

		register(FreemarkerMvcFeature.class);

		GuiceBridge.getGuiceBridge().initializeGuiceBridge(serviceLocator);
		GuiceIntoHK2Bridge guiceBridge = serviceLocator.getService(GuiceIntoHK2Bridge.class);
		guiceBridge.bridgeGuiceInjector((Injector) servletContext.getAttribute(Injector.class.getName()));
		log.info("Finish JerseyConfiguration");
	}

}
