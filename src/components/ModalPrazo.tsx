import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Livro } from '../types';
import { CORES, FONTE_TITULO } from '../theme';
import { formatarData, mascaraData, converterParaData, somarDiasA } from '../utils/datas';
import CampoTexto from './CampoTexto';

// Props: a tela de origem (Lista) controla se o modal está aberto.
type Props = {
  visivel: boolean;                       // true = aberto
  livro: Livro | null;                    // livro cujo prazo será alterado
  onCancelar: () => void;                 // fechar sem salvar
  onConfirmar: (novaData: string) => void; // salvar a nova data (texto DD/MM/AAAA)
};

// Quantos dias cada atalho soma.
const ATALHOS_DIAS = [7, 14, 30];

export default function ModalPrazo({ visivel, livro, onCancelar, onConfirmar }: Props) {
  // ESTADOS: a data digitada e a mensagem de erro (undefined = sem erro).
  const [data, setData] = useState('');
  const [erro, setErro] = useState<string | undefined>(undefined);

  // Quando o modal ABRE, o campo já vem preenchido com o prazo atual do livro
  // (assim o usuário só ajusta, em vez de digitar tudo de novo).
  useEffect(() => {
    if (visivel) {
      setData(livro?.devolucaoPrevista ?? ''); // "?? ''" = se não houver prazo, começa vazio
      setErro(undefined);
    }
  }, [visivel]);

  // BASE DOS ATALHOS: de onde contamos os dias.
  // Se o prazo atual ainda não venceu, soma a partir dele (prorrogação de verdade).
  // Se já venceu (ou não existe), soma a partir de hoje.
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // zera a hora para comparar só o dia
  const prazoAtual = livro?.devolucaoPrevista ? converterParaData(livro.devolucaoPrevista) : null;
  const base = prazoAtual !== null && prazoAtual > hoje ? prazoAtual : hoje;

  function confirmar() {
    // 1ª regra: não pode estar vazio.
    if (data.length === 0) {
      setErro('Informe a nova data de devolução.');
      return; // para aqui
    }

    // 2ª regra: a data precisa existir (31/02 não existe).
    const nova = converterParaData(data);
    if (nova === null) {
      setErro('Data inválida. Use o formato DD/MM/AAAA.');
      return;
    }

    // 3ª regra: não pode ser no passado.
    if (nova < hoje) {
      setErro('A nova data não pode ser uma data passada.');
      return;
    }

    // 4ª regra: precisa ser diferente da atual (senão não há o que alterar).
    if (data === livro?.devolucaoPrevista) {
      setErro('Essa já é a data de devolução atual.');
      return;
    }

    // Passou em tudo: entrega a nova data para a tela.
    onConfirmar(data);
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={styles.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.caixa}>
          <View style={styles.topo}>
            <Text style={styles.titulo}>Alterar prazo</Text>
            <TouchableOpacity onPress={onCancelar}>
              <Ionicons name="close" size={24} color={CORES.cinza} />
            </TouchableOpacity>
          </View>

          {/* Resumo: livro, quem está com ele e o prazo atual. */}
          <View style={styles.resumoLivro}>
            <Ionicons name="book-outline" size={26} color={CORES.vinho} />
            <View style={{ flex: 1 }}>
              <Text style={styles.livroTitulo} numberOfLines={1}>{livro?.titulo}</Text>
              <Text style={styles.livroInfo} numberOfLines={1}>
                Com {livro?.emprestadoPara ?? 'não informado'} • prazo atual: {livro?.devolucaoPrevista ?? '-'}
              </Text>
            </View>
          </View>

          <CampoTexto
            rotulo="Nova data de devolução *"
            placeholder="DD/MM/AAAA"
            value={data}
            keyboardType="numeric"
            erro={erro}
            // A máscara coloca as barras enquanto o usuário digita; digitar apaga o erro.
            onChangeText={(t) => { setData(mascaraData(t)); setErro(undefined); }}
          />

          {/* Atalhos: somam dias à data-base calculada acima. */}
          <View style={styles.linhaAtalhos}>
            {ATALHOS_DIAS.map((dias) => (
              <TouchableOpacity
                key={dias}
                style={styles.atalho}
                onPress={() => { setData(formatarData(somarDiasA(base, dias))); setErro(undefined); }}
              >
                <Text style={styles.atalhoTexto}>+{dias} dias</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.dica}>
            Os atalhos somam dias a partir de {formatarData(base)}
            {prazoAtual !== null && prazoAtual > hoje ? ' (prazo atual)' : ' (hoje, pois o prazo já venceu)'}.
          </Text>

          <View style={styles.linhaBotoes}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelar}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmar}>
              <Text style={styles.botaoConfirmarTexto}>Salvar prazo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  caixa: { backgroundColor: CORES.branco, borderRadius: 20, padding: 20 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titulo: { fontFamily: FONTE_TITULO, fontSize: 20, fontWeight: 'bold', color: CORES.marrom },
  resumoLivro: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CORES.bege, borderRadius: 12, padding: 12, marginBottom: 16 },
  livroTitulo: { fontWeight: 'bold', color: CORES.texto },
  livroInfo: { color: CORES.cinza, fontSize: 13 },
  linhaAtalhos: { flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: 8 },
  atalho: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: CORES.bege, borderWidth: 1, borderColor: CORES.begeEscuro },
  atalhoTexto: { color: CORES.marrom, fontWeight: '600', fontSize: 13 },
  dica: { color: CORES.cinza, fontSize: 12, marginBottom: 16 },
  linhaBotoes: { flexDirection: 'row', gap: 10 },
  botaoCancelar: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#f3f4f6' },
  botaoCancelarTexto: { color: CORES.texto, fontWeight: '600' },
  botaoConfirmar: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: CORES.vinho },
  botaoConfirmarTexto: { color: '#fff', fontWeight: '600' },
});