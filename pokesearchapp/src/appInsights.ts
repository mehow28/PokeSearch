import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'
import { createBrowserHistory } from "history";

const browserHistory = createBrowserHistory();
var reactPlugin = new ReactPlugin();
var appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: 'e3a1254c-f6be-43cf-a5db-3d91765b39df',//process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        enableAutoRouteTracking: false,
        extensions: [reactPlugin],
        extensionConfig: {
            [reactPlugin.identifier]: { history: browserHistory }
        }
    }
});
appInsights.loadAppInsights();
export { reactPlugin, appInsights }