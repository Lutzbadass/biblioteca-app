import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Usuario } from '../types';
import { CORES, FONTE_TITULO, SOMBRA } from '../theme';
import CampoTexto from '../components/CampoTexto';

// onCadastrar recebe os dados da conta e devolve: null (criou) ou texto com o erro (ex.: e-mail repetido).
type Props = NativeStackScreenProps<RootStackParamList, 'CadastroUsuario'> & {
  onCadastrar: (dados: Usuario) => string | null;
};

type Erros = { nome?: string; email?: string; senha?: string; confirmar?: string };

export default function CadastroUsuarioScreen({ navigation, onCadastrar }: Props) {
  // Um estado para cada campo do formulário + um para os erros.
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erros, setErros] = useState<Erros>({});

  // Confere todos os campos. Devolve true se tudo estiver certo.
  function validar(): boolean {
    const novosErros: Erros = {};

    if (nome.trim().length === 0) {
      novosErros.nome = 'Informe seu nome.';
    }

    // Expressão regular de e-mail: algo + @ + algo + . + algo (sem espaços).
    // /^[^\s@]+@[^\s@]+\.[^\s@]+$/  -> [^\s@] significa "qualquer caractere que não seja espaço nem @".
    if (email.trim().length === 0) {
      novosErros.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = 'Digite um e-mail válido (ex.: nome@email.com).';
    }

    // Senha: obrigatória e com no mínimo 6 caracteres.
    if (senha.length === 0) {
      novosErros.senha = 'Crie uma senha.';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres.';
    }

    // Confirmação: precisa ser idêntica à senha digitada.
    if (confirmar.length === 0) {
      novosErros.confirmar = 'Repita a senha.';
    } else if (confirmar !== senha) {
      novosErros.confirmar = 'As senhas não conferem.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function criarConta() {
    // Se a validação falhar, para aqui; as mensagens já estão na tela.
    if (!validar()) {
      return;
    }

    // Pede ao App para criar a conta. Se vier texto, é um erro vindo do App (e-mail já existe).
    const erro = onCadastrar({ nome, email, senha });
    if (erro !== null) {
      setErros({ email: erro }); // mostra o erro embaixo do campo de e-mail
      return;
    }

    // Deu certo: avisa e volta para o login.
    Alert.alert('Conta criada', 'Agora é só entrar com seu e-mail e senha.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <View style={styles.logo}>
            <Ionicons name="person-add-outline" size={44} color={CORES.vinho} />
          </View>
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>Cadastre-se para organizar seu acervo</Text>

          <CampoTexto
            rotulo="Nome *"
            placeholder="Seu nome"
            value={nome}
            erro={erros.nome}
            onChangeText={(t) => { setNome(t); setErros({ ...erros, nome: undefined }); }}
          />
          <CampoTexto
            rotulo="E-mail *"
            placeholder="seu@email.com"
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            erro={erros.email}
            onChangeText={(t) => { setEmail(t); setErros({ ...erros, email: undefined }); }}
          />
          <CampoTexto
            rotulo="Senha *"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            senha
            erro={erros.senha}
            onChangeText={(t) => { setSenha(t); setErros({ ...erros, senha: undefined }); }}
          />
          <CampoTexto
            rotulo="Confirmar senha *"
            placeholder="Repita a senha"
            value={confirmar}
            senha
            erro={erros.confirmar}
            onChangeText={(t) => { setConfirmar(t); setErros({ ...erros, confirmar: undefined }); }}
          />

          <TouchableOpacity style={styles.botao} onPress={criarConta}>
            <Text style={styles.botaoTexto}>Criar conta</Text>
          </TouchableOpacity>

          {/* goBack() desempilha esta tela e volta ao login. */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Já tem conta? <Text style={styles.linkForte}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.bege },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  cartao: { backgroundColor: CORES.branco, borderRadius: 20, padding: 24, ...SOMBRA },
  logo: { alignItems: 'center', marginBottom: 8 },
  titulo: { fontFamily: FONTE_TITULO, fontSize: 26, fontWeight: '600', color: CORES.marrom, textAlign: 'center' },
  subtitulo: { color: CORES.cinza, textAlign: 'center', marginBottom: 24, marginTop: 4 },
  botao: { backgroundColor: CORES.vinho, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  botaoTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', color: CORES.cinza, marginTop: 18 },
  linkForte: { color: CORES.vinho, fontWeight: '700' },
});