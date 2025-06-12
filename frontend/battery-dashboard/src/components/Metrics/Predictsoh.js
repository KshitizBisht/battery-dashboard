import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const displaytext = ({predict}) => {
    return (
        <div>
            {predict}
        </div>
    )
}
const Predictsoh = () => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [predictData, setPredictData] = useState({
    soh_future: 0
  });
  const clientRef = useRef(null);


  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');

        stompClient.subscribe('/topic/B0006/predict-soh-future', (response) => {
          try {
            const data = JSON.parse(response.body);
            // console.log('Received SOH data:', data);
            setPredictData(prev => ({
              ...prev,
              soh_future: data.predicted_soh_50_cycles,
            }));
          } catch (error) {
            console.error('Error parsing SOH message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message);
        setConnectionStatus(`Error: ${frame.headers.message}`);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        setConnectionStatus('Connection error');
      },
      onDisconnect: () => {
        setConnectionStatus('Disconnected');
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <displaytext 
    predict={predictData.soh_future}
    />
  );
};

export default Predictsoh;