import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export default function Settings() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <IonList inset>
            <IonItem>
              <IonLabel>
                <h2>Backend</h2>
                <p>Configure API base URL, auth, keys.</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <h2>AI provider</h2>
                <p>OpenAI/Anthropic/local models (via env on backend).</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <h2>Music providers</h2>
                <p>YouTube + Spotify connection status.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}

