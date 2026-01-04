import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useMemo, useState } from 'react';

export default function Ingest() {
  const [text, setText] = useState('');
  const canSubmit = useMemo(() => text.trim().length > 0, [text]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ingest</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <IonItem>
            <IonLabel position="stacked">Paste text</IonLabel>
            <IonTextarea
              autoGrow
              value={text}
              onIonInput={(e) => setText(String(e.detail.value ?? ''))}
              placeholder="Paste notes, docs, summaries, transcripts…"
            />
          </IonItem>
          <div style={{ height: 12 }} />
          <IonButton expand="block" disabled={!canSubmit}>
            Add to knowledge base
          </IonButton>
          <div style={{ height: 8 }} />
          <IonButton expand="block" fill="outline" disabled={!canSubmit}>
            Generate a radio episode from this
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

