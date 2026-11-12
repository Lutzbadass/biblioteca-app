import React, { useState } from 'react';
// TextInputProps: o tipo com TODAS as propriedades que um TextInput aceita (value, placeholder...).
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CORES } from '../theme';

// Props deste componente = tudo que um TextInput aceita (TextInputProps)
// + três extras nossos: rotulo (texto acima), erro (mensagem) e senha (liga o "olhinho").
type Props = TextInputProps & {
  rotulo: string;
  erro?: string;   // "?" = opcional
  senha?: boolean; // se true, o campo esconde o texto e mostra o botão de olho
};

// "...resto" junta todas as outras props (value, onChangeText, placeholder...) em um objeto
// para repassarmos direto ao TextInput, sem precisar listar uma por uma.
export default function CampoTexto({ rotulo, erro, senha = false, ...resto }: Props) {
  // ESTADO: o texto da senha está visível? Começa false (escondido).
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>

      <View>
        <TextInput
          {...resto} // repassa value, onChangeText, placeholder, keyboardType etc.
          // Estilo base + borda vermelha se houver erro + espaço extra à direita se tiver o olho.
          style={[styles.input, erro ? styles.inputErro : null, senha ? styles.inputSenha : null]}
          placeholderTextColor={CORES.cinzaClaro}
          // Esconde os caracteres só se for campo de senha E ela não estiver visível.
          secureTextEntry={senha && !visivel}
        />

        {/* Renderização condicional: o botão de olho só existe em campos de senha. */}
        {senha ? (
          <TouchableOpacity style={styles.olho} onPress={() => setVisivel(!visivel)}>
            <Ionicons
              name={visivel ? 'eye-off-outline' : 'eye-outline'} // troca o ícone conforme o estado
              size={20}
              color={CORES.cinza}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Mensagem de erro em vermelho, só se existir. */}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 14 },
  rotulo: { fontWeight: '600', marginBottom: 6, color: CORES.texto },
  input: {
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: CORES.texto,
  },
  inputErro: { borderColor: CORES.erro },
  inputSenha: { paddingRight: 44 }, // deixa espaço para o ícone do olho não cobrir o texto
  olho: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }, // cola o ícone à direita
  erro: { color: CORES.erro, marginTop: 4, fontSize: 13 },
});