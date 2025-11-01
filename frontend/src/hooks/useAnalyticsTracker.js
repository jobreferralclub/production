import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      // Send page view event
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    //   console.log(`📊 Tracked page: ${location.pathname}`);
    }
  }, [location]);
};

export default useAnalyticsTracker;