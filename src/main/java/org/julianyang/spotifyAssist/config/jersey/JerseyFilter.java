package org.julianyang.spotifyAssist.config.jersey;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.glassfish.jersey.servlet.ServletContainer;

public class JerseyFilter extends ServletContainer {
  private static final Logger log = Logger.getLogger(JerseyFilter.class.getName());
  private List<String> pathsToIgnore;

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    super.init(filterConfig);
    String paths = filterConfig.getInitParameter("pathsToIgnore");
    if (paths != null) {
      pathsToIgnore = Arrays.asList(paths.split(","));
    } else {
      pathsToIgnore = Collections.emptyList();
    }
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    String path = ((HttpServletRequest)request).getRequestURI();
    if (pathsToIgnore.stream().anyMatch(path::startsWith)) {
      chain.doFilter(request, response);
    }
    log.info("Request uri: " + ((HttpServletRequest) request).getRequestURI());
    log.info("Request parameters: " + request.getParameterMap());
    super.doFilter(request, response, chain);
  }
}
