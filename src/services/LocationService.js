import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

const LocationService = {
  async getCurrentPosition() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },

  getDistanceKm(pointA, pointB) {
    const dLat = toRad(pointB.latitude - pointA.latitude);
    const dLon = toRad(pointB.longitude - pointA.longitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h =
      sinDLat * sinDLat +
      Math.cos(toRad(pointA.latitude)) * Math.cos(toRad(pointB.latitude)) * sinDLon * sinDLon;

    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  },

  // URL do Google Maps com o ponto do trecho — funciona em qualquer aparelho
  // (abre o app de mapas se instalado, ou o navegador).
  getMapaUrl({ latitude, longitude }) {
    return 'https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude;
  },

  // Sprint 4 (P9): abre o trecho no app de mapas para o operador traçar a rota.
  // No Android tenta primeiro o esquema geo:, que oferece todos os apps de mapa.
  async abrirNoMapa({ latitude, longitude, nomeTrecho = 'Trecho' }) {
    const web = this.getMapaUrl({ latitude, longitude });
    if (Platform.OS === 'android') {
      const geo =
        'geo:' + latitude + ',' + longitude + '?q=' + latitude + ',' + longitude + '(' + encodeURIComponent(nomeTrecho) + ')';
      try {
        await Linking.openURL(geo);
        return geo;
      } catch (e) {
        // Sem app que trate geo: — cai para o link web.
      }
    }
    await Linking.openURL(web);
    return web;
  },
};

export default LocationService;
