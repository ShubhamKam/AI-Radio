import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export default function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Radio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* TODO: Stations feed + now-playing radio player */}
        <div style={{ padding: 16 }}>
          <p>Stations and live AI radio will appear here.</p>
        </div>
      </IonContent>
    </IonPage>
  );
}

