// useRef: guarda um valor que NÃO provoca redesenho quando muda (ideal para animações).
import React, { useEffect, useRef } from 'react';
// Animated: sistema de animações do React Native.
import { View, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CORES, FONTE_TITULO, NOME_APP, FRASE_APP } from '../theme';


export default function SplashScreen() {
  // Valores animados: opacidade vai de 0 (invisível) a 1 (visível); escala vai de 0.6 a 1 (tamanho normal).
  // .current pega o valor guardado dentro do useRef.
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.6)).current;

  // Dispara a animação UMA vez, quando a tela aparece (dependências []).
  useEffect(() => {
    // Animated.parallel roda as animações ao mesmo tempo.
    Animated.parallel([
      // timing: muda o valor de forma linear em "duration" milissegundos (aparecer gradualmente).
      Animated.timing(opacidade, { toValue: 1, duration: 900, useNativeDriver: true }),
      // spring: efeito de mola (cresce e dá uma "balançadinha" ao parar).
      Animated.spring(escala, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(); // .start() inicia
    // useNativeDriver: true = a animação roda no lado nativo do celular (mais fluida).
  }, []);

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />

      {/* Animated.View é uma View que aceita valores animados nos estilos. */}
      <Animated.View style={{ alignItems: 'center', opacity: opacidade, transform: [{ scale: escala }] }}>
        <View style={styles.logo}>
          <Ionicons name="library-outline" size={64} color={CORES.vinho} />
        </View>
        <Text style={styles.nome}>{NOME_APP}</Text>
        <Text style={styles.frase}>{FRASE_APP}</Text>
      </Animated.View>

      {/* Rodinha de carregamento na parte de baixo. */}
      <ActivityIndicator style={styles.carregando} color={CORES.bege} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.vinho, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { width: 120, height: 120, borderRadius: 60, backgroundColor: CORES.bege, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  nome: { fontFamily: FONTE_TITULO, fontSize: 30, fontWeight: 'bold', color: '#fff' },
  frase: { color: '#e9d5d8', marginTop: 8, textAlign: 'center' },
  carregando: { position: 'absolute', bottom: 60 },
});