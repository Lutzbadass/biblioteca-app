import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { CORES, FONTE_TITULO, SOMBRA, NOME_APP, FRASE_APP } from '../theme'; // <- UMA linha só
import CampoTexto from '../components/CampoTexto';
import { CONTA_TESTE } from '../dadosDemo';

// Props: navegação + a função "onEntrar" que o App.tsx entrega.
// Ela recebe e-mail e senha e devolve: null (deu certo) ou um texto com o motivo do erro.
type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onEntrar: (email: string, senha: string) => string | null;
};

// Erros possíveis: um por campo + um "geral" (ex.: senha incorreta).
type Erros = { email?: string; senha?: string; geral?: string };

export default function LoginScreen({ navigation, onEntrar }: Props) {
  // Estados dos campos (começam vazios) e dos erros (começam sem nenhum).
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Erros>({});

  // Roda ao tocar em "Entrar".
  function entrar() {
    const novosErros: Erros = {};

    // Validação de campos obrigatórios (trim remove espaços das pontas).
    if (email.trim().length === 0) {
      novosErros.email = 'Informe seu e-mail.';
    }
    if (senha.length === 0) {
      novosErros.senha = 'Informe sua senha.';
    }

    // Se existe algum erro, mostra e PARA aqui (return).
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    // Campos preenchidos: pede ao App para conferir e-mail e senha.
    const erro = onEntrar(email, senha);

    // Se voltou um texto (≠ null), o login falhou: mostra a mensagem.
    // Se voltou null, o App já marcou o usuário como logado e o navegador
    // troca as telas sozinho, então não precisamos navegar manualmente.
    if (erro !== null) {
      setErros({ geral: erro });
    }
  }

    // Preenche e-mail e senha com a conta de teste (atalho para a apresentação).
  function preencherContaTeste() {
    setEmail(CONTA_TESTE.email);   // escreve o e-mail de teste no estado (o campo atualiza sozinho)
    setSenha(CONTA_TESTE.senha);   // idem para a senha
    setErros({});                  // apaga avisos de erro que estivessem na tela
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Esta tela tem fundo bege (claro), então a barra de status usa ícones escuros. */}
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <View style={styles.logo}>
            <Ionicons name="library-outline" size={48} color={CORES.vinho} />
          </View>
          <Text style={styles.titulo}>{NOME_APP}</Text>
          <Text style={styles.subtitulo}>{FRASE_APP}</Text>

          <CampoTexto
            rotulo="E-mail"
            placeholder="seu@email.com"
            value={email}
            keyboardType="email-address" // teclado com "@"
            autoCapitalize="none"        // não coloca a 1ª letra em maiúscula
            erro={erros.email}
            onChangeText={(t) => {
              setEmail(t);
              setErros({ ...erros, email: undefined, geral: undefined }); // limpa erros ao digitar
            }}
          />

          <CampoTexto
            rotulo="Senha"
            placeholder="••••••••"
            value={senha}
            senha // liga o modo senha (esconde o texto + botão do olho)
            erro={erros.senha}
            onChangeText={(t) => {
              setSenha(t);
              setErros({ ...erros, senha: undefined, geral: undefined });
            }}
          />

          {/* Erro geral (ex.: "E-mail ou senha incorretos."). */}
          {erros.geral ? <Text style={styles.erroGeral}>{erros.geral}</Text> : null}

          <TouchableOpacity style={styles.botao} onPress={entrar}>
            <Text style={styles.botaoTexto}>Entrar</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>

                 {/* Botão que preenche os campos com a conta de teste. */}
          <TouchableOpacity style={styles.botaoTeste} onPress={preencherContaTeste}>
            <Ionicons name="flash-outline" size={16} color={CORES.vinho} />
            <Text style={styles.botaoTesteTexto}>Usar conta de teste</Text>
          </TouchableOpacity>


          {/* Navega para a tela de criar conta. */}
          <TouchableOpacity onPress={() => navigation.navigate('CadastroUsuario')}>
            <Text style={styles.link}>Não tem conta? <Text style={styles.linkForte}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.bege },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 16 }, // centraliza o cartão na vertical
  cartao: { backgroundColor: CORES.branco, borderRadius: 20, padding: 24, ...SOMBRA },
  logo: { alignItems: 'center', marginBottom: 8 },
  titulo: { fontFamily: FONTE_TITULO, fontSize: 26, fontWeight: '600', color: CORES.marrom, textAlign: 'center' },
  subtitulo: { color: CORES.cinza, textAlign: 'center', marginBottom: 24, marginTop: 4 },
  erroGeral: { color: CORES.erro, textAlign: 'center', marginBottom: 12 },
  botao: {
    backgroundColor: CORES.vinho,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  botaoTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', color: CORES.cinza, marginTop: 18 },
  linkForte: { color: CORES.vinho, fontWeight: '700' },
    botaoTeste: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    marginTop: 12, padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: CORES.vinho, borderStyle: 'dashed', // borda tracejada
  },
  botaoTesteTexto: { color: CORES.vinho, fontWeight: '600' },
});