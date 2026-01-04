import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { homeOutline, libraryOutline, micOutline, settingsOutline } from 'ionicons/icons';
import { Redirect, Route } from 'react-router-dom';

import Home from './pages/Home';
import Ingest from './pages/Ingest';
import Library from './pages/Library';
import Settings from './pages/Settings';

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/ingest">
              <Ingest />
            </Route>
            <Route exact path="/library">
              <Library />
            </Route>
            <Route exact path="/settings">
              <Settings />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon aria-hidden="true" icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="ingest" href="/ingest">
              <IonIcon aria-hidden="true" icon={micOutline} />
              <IonLabel>Ingest</IonLabel>
            </IonTabButton>
            <IonTabButton tab="library" href="/library">
              <IonIcon aria-hidden="true" icon={libraryOutline} />
              <IonLabel>Library</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon aria-hidden="true" icon={settingsOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

