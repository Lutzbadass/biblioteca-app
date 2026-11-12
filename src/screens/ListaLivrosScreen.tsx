import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Livro, Usuario, RootStackParamList } from '../types';
import { CORES, FONTE_TITULO, SOMBRA } from '../theme';
import { converterParaData } from '../utils/datas';
import ModalEmprestimo from '../components/ModalEmprestimo';
import ModalPrazo from '../components/ModalPrazo';
import { FRASE_APP } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Lista'> & {
  usuario: Usuario;
  livros: Livro[];
  onEmprestar: (id: string, nome: string, devolucaoPrevista: string) => void; // registra empréstimo
  onDevolver: (id: string) => void; 
  onAlterarPrazo: (id: string, novaData: string) => void; // altera a data de devolução                                          // registra devolução
  onExcluir: (id: string) => void;
  onSair: () => void;
};

type Filtro = 'todos' | 'disponiveis' | 'emprestados';

const OPCOES_FILTRO: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'disponiveis', rotulo: 'Disponíveis' },
  { valor: 'emprestados', rotulo: 'Emprestados' },
];

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];

function CartaoResumo(props: { icone: NomeIcone; cor: string; fundo: string; rotulo: string; valor: number }) {
  return (
    <View style={styles.resumo}>
      <View style={[styles.resumoIcone, { backgroundColor: props.fundo }]}>
        <Ionicons name={props.icone} size={20} color={props.cor} />
      </View>
      <Text style={styles.resumoValor}>{props.valor}</Text>
      <Text style={styles.resumoRotulo}>{props.rotulo}</Text>
    </View>
  );
}

// NOVA FUNÇÃO: diz se um livro emprestado já passou do prazo de devolução.
function estaAtrasado(livro: Livro): boolean {
  // Se não está emprestado ou não tem data prevista, não há como estar atrasado.
  if (!livro.emprestado || !livro.devolucaoPrevista) {
    return false;
  }
  const prazo = converterParaData(livro.devolucaoPrevista); // texto -> Date (ou null)
  if (prazo === null) {
    return false;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // zera a hora para comparar só o dia
  return prazo < hoje;       // prazo anterior a hoje = atrasado
}

export default function ListaLivrosScreen({
  navigation, usuario, livros, onEmprestar, onDevolver, onAlterarPrazo, onExcluir, onSair,
}: Props) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // NOVO ESTADO: livro que está sendo emprestado agora.
  // null = nenhum, e o modal fica fechado. Quando guarda um livro, o modal abre.
  const [livroParaEmprestar, setLivroParaEmprestar] = useState<Livro | null>(null);

    // Livro cujo prazo está sendo alterado agora (null = modal fechado). Mesmo padrão do empréstimo.
  const [livroParaPrazo, setLivroParaPrazo] = useState<Livro | null>(null);

  const totalEmprestados = livros.filter((l) => l.emprestado).length;
  const totalDisponiveis = livros.length - totalEmprestados;

  const livrosFiltrados = livros.filter((livro) => {
    const passaNoFiltro =
      filtro === 'todos' ||
      (filtro === 'disponiveis' && !livro.emprestado) ||
      (filtro === 'emprestados' && livro.emprestado);

    const termo = busca.trim().toLowerCase();
    // NOVO: a busca também olha o nome de quem pegou o livro.
    // "livro.emprestadoPara ?? ''" significa: se for undefined, usa texto vazio (evita erro).
    const passaNaBusca =
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo) ||
      (livro.emprestadoPara ?? '').toLowerCase().includes(termo);

    return passaNoFiltro && passaNaBusca;
  });

  function confirmarExclusao(livro: Livro) {
    if (livro.emprestado) {
      Alert.alert('Não é possível excluir', 'Registre a devolução do livro antes de excluí-lo.');
      return;
    }
    Alert.alert('Excluir livro', `Deseja realmente excluir "${livro.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onExcluir(livro.id) },
    ]);
  }

  const primeiroNome = usuario.nome.split(' ')[0];

  const cabecalho = (
    <View>
      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerSaudacao}>Olá, {primeiroNome}!</Text>
          <Text style={styles.bannerFrase}>{FRASE_APP}</Text>
        </View>
        <TouchableOpacity style={styles.botaoSair} onPress={onSair}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.botaoSairTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linhaResumo}>
        <CartaoResumo icone="library-outline" cor={CORES.cinza} fundo="#f3f4f6" rotulo="Total" valor={livros.length} />
        <CartaoResumo icone="checkmark-circle-outline" cor={CORES.verde} fundo={CORES.verdeClaro} rotulo="Disponíveis" valor={totalDisponiveis} />
        <CartaoResumo icone="person-outline" cor={CORES.laranja} fundo={CORES.laranjaClaro} rotulo="Emprestados" valor={totalEmprestados} />
      </View>

      <View style={styles.buscaBox}>
        <Ionicons name="search-outline" size={18} color={CORES.cinzaClaro} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por título, autor ou pessoa"
          placeholderTextColor={CORES.cinzaClaro}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.linhaFiltros}>
        {OPCOES_FILTRO.map((opcao) => (
          <TouchableOpacity
            key={opcao.valor}
            style={[styles.chip, filtro === opcao.valor && styles.chipAtivo]}
            onPress={() => setFiltro(opcao.valor)}
          >
            <Text style={[styles.chipTexto, filtro === opcao.valor && styles.chipTextoAtivo]}>{opcao.rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.contador}>{livrosFiltrados.length} livro(s) encontrado(s)</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={livrosFiltrados}
        keyExtractor={(livro) => livro.id}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="book-outline" size={44} color={CORES.cinzaClaro} />
            <Text style={styles.vazioTexto}>Nenhum livro encontrado.</Text>
          </View>
        }
        contentContainerStyle={styles.listaConteudo}
        keyboardShouldPersistTaps="handled"
        // Agora o renderItem usa chaves { } e "return" porque precisa calcular
        // o valor "atrasado" antes de desenhar o cartão.
        renderItem={({ item }) => {
          const atrasado = estaAtrasado(item);

          return (
            <View style={styles.cartao}>
              <View style={styles.cartaoTopo}>
                <View style={styles.capa}>
                  <Ionicons name="book-outline" size={28} color={CORES.vinho} />
                </View>

                <View style={styles.cartaoInfo}>
                  <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={styles.autor}>{item.autor} • {item.ano}</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagTexto}>{item.genero}</Text>
                  </View>
                </View>

                <View style={[styles.selo, item.emprestado ? styles.seloEmprestado : styles.seloDisponivel]}>
                  <Text style={[styles.seloTexto, item.emprestado ? styles.seloTextoEmprestado : styles.seloTextoDisponivel]}>
                    {item.emprestado ? 'Emprestado' : 'Disponível'}
                  </Text>
                </View>
              </View>

              {/* NOVO: caixa com os dados do empréstimo. Só aparece se o livro estiver emprestado. */}
              {item.emprestado ? (
                <View style={[styles.caixaEmprestimo, atrasado && styles.caixaAtrasada]}>
                  <View style={styles.linhaInfo}>
                    <Ionicons name="person-outline" size={15} color="#991b1b" />
                    <Text style={styles.infoTexto}>
                      Emprestado para <Text style={styles.infoNome}>{item.emprestadoPara ?? 'Não informado'}</Text>
                    </Text>
                  </View>

                  {/* Só mostra a linha se o campo existir (livros antigos podem não ter). */}
                  {item.dataEmprestimo ? (
                    <View style={styles.linhaInfo}>
                      <Ionicons name="calendar-outline" size={15} color="#991b1b" />
                      <Text style={styles.infoTexto}>Retirado em {item.dataEmprestimo}</Text>
                    </View>
                  ) : null}

                  {item.devolucaoPrevista ? (
                    <View style={styles.linhaInfo}>
                      <Ionicons name="time-outline" size={15} color="#991b1b" />
                      <Text style={styles.infoTexto}>
                        Devolução prevista: {item.devolucaoPrevista}
                        {/* Se estiver atrasado, acrescenta o aviso em negrito. */}
                        {atrasado ? <Text style={styles.atrasadoTexto}>  ATRASADO</Text> : null}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.cartaoAcoes}>
                <TouchableOpacity
                  style={[styles.botaoAcao, item.emprestado ? styles.botaoDevolver : styles.botaoEmprestar]}
                  // Emprestado: devolve direto. Disponível: guarda o livro no estado, o que ABRE o modal.
                  onPress={() => (item.emprestado ? onDevolver(item.id) : setLivroParaEmprestar(item))}
                >
                  <Text style={[styles.botaoAcaoTexto, { color: item.emprestado ? CORES.marrom : '#fff' }]}>
                    {item.emprestado ? 'Registrar devolução' : 'Emprestar'}
                  </Text>
                </TouchableOpacity>

                                {/* Só aparece em livros emprestados: abre o modal de alteração de prazo. */}
                {item.emprestado ? (
                  <TouchableOpacity style={styles.botaoPrazo} onPress={() => setLivroParaPrazo(item)}>
                    <Ionicons name="calendar-outline" size={18} color={CORES.marrom} />
                    <Text style={styles.botaoPrazoTexto}>Prazo</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity style={styles.botaoLixeira} onPress={() => confirmarExclusao(item)}>
                  <Ionicons name="trash-outline" size={20} color={CORES.cinzaClaro} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Cadastro')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* NOVO: o modal fica "montado" aqui, mas só aparece quando visivel é true. */}
      <ModalEmprestimo
        visivel={livroParaEmprestar !== null}  // aberto se existe um livro selecionado
        livro={livroParaEmprestar}
        onCancelar={() => setLivroParaEmprestar(null)} // fechar = limpar a seleção
        onConfirmar={(nome, devolucao) => {
          // Se há livro selecionado, avisa o App para registrar o empréstimo.
          if (livroParaEmprestar) {
            onEmprestar(livroParaEmprestar.id, nome, devolucao);
          }
          setLivroParaEmprestar(null); // e fecha o modal
        }}
      />

            <ModalPrazo
        visivel={livroParaPrazo !== null}
        livro={livroParaPrazo}
        onCancelar={() => setLivroParaPrazo(null)}
        onConfirmar={(novaData) => {
          if (livroParaPrazo) {
            onAlterarPrazo(livroParaPrazo.id, novaData); // avisa o App para gravar
          }
          setLivroParaPrazo(null); // fecha o modal
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  listaConteudo: { padding: 16, paddingBottom: 100 },

  banner: { backgroundColor: CORES.vinho, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bannerSaudacao: { color: '#fff', fontFamily: FONTE_TITULO, fontSize: 20, fontWeight: 'bold' },
  bannerFrase: { color: '#e9d5d8', marginTop: 4, fontSize: 13 },
  botaoSair: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.25)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  botaoSairTexto: { color: '#fff', fontWeight: '600' },

  linhaResumo: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  resumo: { flex: 1, backgroundColor: CORES.branco, borderRadius: 14, padding: 12, alignItems: 'center', ...SOMBRA },
  resumoIcone: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  resumoValor: { fontSize: 22, fontWeight: 'bold', color: CORES.texto },
  resumoRotulo: { fontSize: 12, color: CORES.cinza },

  buscaBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: CORES.branco, borderWidth: 1, borderColor: CORES.borda, borderRadius: 24, paddingHorizontal: 14, marginBottom: 12, gap: 8 },
  buscaInput: { flex: 1, paddingVertical: 10, color: CORES.texto },

  linhaFiltros: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: CORES.branco, borderWidth: 1, borderColor: CORES.borda, alignItems: 'center' },
  chipAtivo: { backgroundColor: CORES.vinho, borderColor: CORES.vinho },
  chipTexto: { color: CORES.cinza, fontWeight: '600', fontSize: 13 },
  chipTextoAtivo: { color: '#fff' },
  contador: { color: CORES.cinza, marginBottom: 10 },

  vazio: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  vazioTexto: { color: CORES.cinza },

  cartao: { backgroundColor: CORES.branco, borderRadius: 16, padding: 14, marginBottom: 12, ...SOMBRA },
  cartaoTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  capa: { width: 52, height: 68, borderRadius: 8, backgroundColor: CORES.bege, alignItems: 'center', justifyContent: 'center' },
  cartaoInfo: { flex: 1 },
  titulo: { fontFamily: FONTE_TITULO, fontSize: 16, fontWeight: 'bold', color: CORES.marrom },
  autor: { color: CORES.cinza, marginTop: 2, fontSize: 13 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, marginTop: 8 },
  tagTexto: { color: CORES.cinza, fontSize: 12 },

  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  seloDisponivel: { backgroundColor: CORES.verdeClaro },
  seloEmprestado: { backgroundColor: CORES.vermelhoClaro },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  seloTextoDisponivel: { color: '#166534' },
  seloTextoEmprestado: { color: '#991b1b' },

  // Estilos novos da caixa de empréstimo:
  caixaEmprestimo: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 10, marginTop: 12, gap: 4 },
  caixaAtrasada: { backgroundColor: '#fee2e2', borderColor: '#f87171' }, // um tom mais forte se atrasado
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTexto: { color: '#7f1d1d', fontSize: 13, flexShrink: 1 },
  infoNome: { fontWeight: 'bold' },
  atrasadoTexto: { color: '#b91c1c', fontWeight: 'bold' },

  cartaoAcoes: { flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  botaoAcao: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  botaoEmprestar: { backgroundColor: CORES.vinho },
  botaoDevolver: { backgroundColor: CORES.bege, borderWidth: 1, borderColor: CORES.begeEscuro },
  botaoAcaoTexto: { fontWeight: '600', fontSize: 14 },
  botaoLixeira: { width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: CORES.vinho, alignItems: 'center', justifyContent: 'center', ...SOMBRA, elevation: 6 },
    botaoPrazo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, borderRadius: 10, backgroundColor: CORES.bege, borderWidth: 1, borderColor: CORES.begeEscuro },
  botaoPrazoTexto: { color: CORES.marrom, fontWeight: '600', fontSize: 14 },
});