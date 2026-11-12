import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { Livro, Usuario, RootStackParamList } from './src/types';
import { CORES, FONTE_TITULO, NOME_APP } from './src/theme';
import { CONTA_TESTE, LIVROS_INICIAIS } from './src/dadosDemo';
import { formatarData } from './src/utils/datas';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CadastroUsuarioScreen from './src/screens/CadastroUsuarioScreen';
import ListaLivrosScreen from './src/screens/ListaLivrosScreen';
import CadastroLivroScreen from './src/screens/CadastroLivroScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

// Chave dos livros com sufixo ":v2". Mudamos o nome porque o FORMATO do livro mudou
// (ganhou emprestadoPara etc.). Chave nova = começa limpo, sem misturar com o formato antigo.
const CHAVE_LIVROS = '@biblioteca:livros:v2';
const CHAVE_USUARIOS = '@biblioteca:usuarios';

export default function App() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [carregado, setCarregado] = useState(false);

  // NOVO ESTADO: a tela de abertura está visível? Começa true.
  const [splashVisivel, setSplashVisivel] = useState(true);

  // EFEITO 0 (NOVO): esconde a tela de abertura após 2,5 segundos.
  useEffect(() => {
    // setTimeout executa a função depois de X milissegundos.
    const temporizador = setTimeout(() => setSplashVisivel(false), 2500);
    // A função devolvida é a "limpeza": cancela o temporizador se o componente for desmontado.
    return () => clearTimeout(temporizador);
  }, []);

  // EFEITO 1: carrega livros e contas salvos.
  useEffect(() => {
    async function carregarDados() {
      try {
        const livrosSalvos = await AsyncStorage.getItem(CHAVE_LIVROS);
        const usuariosSalvos = await AsyncStorage.getItem(CHAVE_USUARIOS);

        setLivros(livrosSalvos !== null ? JSON.parse(livrosSalvos) : LIVROS_INICIAIS);

        // Lista de contas salvas (ou vazia se não houver).
        let listaUsuarios: Usuario[] = usuariosSalvos !== null ? JSON.parse(usuariosSalvos) : [];

        // NOVO: garante que a CONTA DE TESTE sempre exista.
        // .some devolve true se alguma conta tem o e-mail de teste; se NÃO tiver (!), adicionamos.
        if (!listaUsuarios.some((u) => u.email === CONTA_TESTE.email)) {
          listaUsuarios = [...listaUsuarios, CONTA_TESTE];
        }
        setUsuarios(listaUsuarios);
      } catch (erro) {
        setLivros(LIVROS_INICIAIS);
        setUsuarios([CONTA_TESTE]); // mesmo com falha, a conta de teste continua disponível
      } finally {
        setCarregado(true);
      }
    }
    carregarDados();
  }, []);

  // EFEITOS 2 e 3: salvam automaticamente quando livros ou contas mudam.
  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(CHAVE_LIVROS, JSON.stringify(livros)).catch(() => {});
  }, [livros, carregado]);

  useEffect(() => {
    if (!carregado) return;
    AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios)).catch(() => {});
  }, [usuarios, carregado]);

  // ---------- CONTAS ----------
  function cadastrarUsuario(dados: Usuario): string | null {
    const emailLimpo = dados.email.trim().toLowerCase();
    if (usuarios.some((u) => u.email === emailLimpo)) {
      return 'Este e-mail já está cadastrado.';
    }
    setUsuarios([...usuarios, { nome: dados.nome.trim(), email: emailLimpo, senha: dados.senha }]);
    return null;
  }

  function entrar(email: string, senha: string): string | null {
    const emailLimpo = email.trim().toLowerCase();
    const encontrado = usuarios.find((u) => u.email === emailLimpo && u.senha === senha);
    if (!encontrado) {
      return 'E-mail ou senha incorretos.';
    }
    setUsuarioLogado(encontrado);
    return null;
  }

  function sair() {
    setUsuarioLogado(null);
  }

  // ---------- LIVROS ----------

  // NOVA: registra um empréstimo. Recebe o id do livro, o nome da pessoa e a data de devolução.
  function emprestarLivro(id: string, nome: string, devolucaoPrevista: string) {
    setLivros(
      livros.map((livro) =>
        livro.id === id
          ? {
              ...livro,                                 // mantém título, autor etc.
              emprestado: true,                         // agora está emprestado
              emprestadoPara: nome,                     // guarda para quem
              dataEmprestimo: formatarData(new Date()), // data de hoje
              devolucaoPrevista: devolucaoPrevista,     // data combinada
            }
          : livro
      )
    );
  }

  // NOVA: registra a devolução, voltando o livro a "disponível" e apagando os dados do empréstimo.
  function devolverLivro(id: string) {
    setLivros(
      livros.map((livro) =>
        livro.id === id
          ? {
              ...livro,
              emprestado: false,
              emprestadoPara: undefined, // undefined faz o campo sumir do objeto salvo
              dataEmprestimo: undefined,
              devolucaoPrevista: undefined,
            }
          : livro
      )
    );
  }

    // NOVA: altera só a data de devolução prevista de um livro emprestado.
  function alterarPrazo(id: string, novaData: string) {
    setLivros(
      livros.map((livro) =>
        // No livro certo, copia tudo (...livro) e troca apenas devolucaoPrevista.
        livro.id === id ? { ...livro, devolucaoPrevista: novaData } : livro
      )
    );
  }

  function excluirLivro(id: string) {
    setLivros(livros.filter((l) => l.id !== id));
  }

  function adicionarLivro(dados: Omit<Livro, 'id' | 'emprestado'>) {
    const novoLivro: Livro = { ...dados, id: Date.now().toString(), emprestado: false };
    setLivros([...livros, novoLivro]);
  }

  // Enquanto carrega os dados OU a abertura estiver no tempo mínimo, mostra a tela de abertura.
  // "||" = ou: basta uma das condições ser verdadeira.
  if (!carregado || splashVisivel) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />

      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: CORES.vinho },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: FONTE_TITULO, fontWeight: 'bold' },
        }}
      >
        {usuarioLogado === null ? (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onEntrar={entrar} />}
            </Stack.Screen>
            <Stack.Screen name="CadastroUsuario" options={{ headerShown: false }}>
              {(props) => <CadastroUsuarioScreen {...props} onCadastrar={cadastrarUsuario} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Lista" options={{ title: NOME_APP }}>
              {(props) => (
                <ListaLivrosScreen
                  {...props}
                  usuario={usuarioLogado}
                  livros={livros}
                  onEmprestar={emprestarLivro}
                  onDevolver={devolverLivro}
                  onAlterarPrazo={alterarPrazo}   // NOVO
                  onExcluir={excluirLivro}
                  onSair={sair}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Cadastro" options={{ title: 'Novo Livro' }}>
              {(props) => <CadastroLivroScreen {...props} onAdicionarLivro={adicionarLivro} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}