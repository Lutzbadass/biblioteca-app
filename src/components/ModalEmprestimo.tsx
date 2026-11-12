import React, { useState, useEffect } from 'react';
// Modal = janela que aparece POR CIMA da tela atual (o fundo fica escurecido).
import { Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Livro } from '../types';
import { CORES, FONTE_TITULO } from '../theme';
import { formatarData, mascaraData, converterParaData, somarDias } from '../utils/datas';
import CampoTexto from './CampoTexto';

// Props: quem controla se o modal está aberto é a tela que o usa (a Lista).
type Props = {
  visivel: boolean;                                              // true = aberto
  livro: Livro | null;                                           // livro que será emprestado
  onCancelar: () => void;                                        // chamada ao fechar sem confirmar
  onConfirmar: (nome: string, devolucaoPrevista: string) => void; // chamada ao confirmar, com os dados
};

type Erros = { nome?: string; devolucao?: string };

// Atalhos de prazo: tocar neles preenche a data automaticamente.
const ATALHOS_DIAS = [7, 14, 30];

export default function ModalEmprestimo({ visivel, livro, onCancelar, onConfirmar }: Props) {
  const [nome, setNome] = useState('');
  const [devolucao, setDevolucao] = useState('');
  const [erros, setErros] = useState<Erros>({});

  // Sempre que o modal ABRE (visivel vira true), limpamos os campos.
  // Sem isso, o texto do empréstimo anterior apareceria no próximo.
  useEffect(() => {
    if (visivel) {
      setNome('');
      setDevolucao('');
      setErros({});
    }
  }, [visivel]);

  function confirmar() {
    const novosErros: Erros = {};

    // Nome: obrigatório, com pelo menos 2 letras.
    if (nome.trim().length < 2) {
      novosErros.nome = 'Informe o nome de quem vai levar o livro.';
    }

    // Data de devolução: obrigatória, existente e não pode estar no passado.
    if (devolucao.length === 0) {
      novosErros.devolucao = 'Informe a data de devolução prevista.';
    } else {
      const data = converterParaData(devolucao); // null se a data for inválida
      if (data === null) {
        novosErros.devolucao = 'Data inválida. Use o formato DD/MM/AAAA.';
      } else {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // zera a hora: compara só o DIA
        if (data < hoje) {
          novosErros.devolucao = 'A devolução não pode ser uma data passada.';
        }
      }
    }

    setErros(novosErros);

    // Se houver erro, para aqui. O modal continua aberto mostrando os avisos.
    if (Object.keys(novosErros).length > 0) {
      return;
    }

    // Tudo certo: entrega os dados para a tela (que avisa o App).
    onConfirmar(nome.trim(), devolucao);
  }

  return (
    // transparent: deixa ver a tela por trás | animationType="fade": aparece suavemente
    // onRequestClose: obrigatório no Android, trata o botão "voltar" do celular.
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={styles.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.caixa}>
          <View style={styles.topo}>
            <Text style={styles.titulo}>Emprestar livro</Text>
            <TouchableOpacity onPress={onCancelar}>
              <Ionicons name="close" size={24} color={CORES.cinza} />
            </TouchableOpacity>
          </View>

          {/* Resumo do livro (livro?.titulo: o "?" evita erro se livro for null). */}
          <View style={styles.resumoLivro}>
            <Ionicons name="book-outline" size={26} color={CORES.vinho} />
            <View style={{ flex: 1 }}>
              <Text style={styles.livroTitulo} numberOfLines={1}>{livro?.titulo}</Text>
              <Text style={styles.livroAutor} numberOfLines={1}>{livro?.autor}</Text>
            </View>
          </View>

          <CampoTexto
            rotulo="Nome da pessoa *"
            placeholder="Ex.: Maria Antonieta"
            value={nome}
            erro={erros.nome}
            onChangeText={(t) => { setNome(t); setErros({ ...erros, nome: undefined }); }}
          />

          <CampoTexto
            rotulo="Devolução prevista *"
            placeholder="DD/MM/AAAA"
            value={devolucao}
            keyboardType="numeric"
            erro={erros.devolucao}
            // mascaraData formata a digitação: o usuário digita só números e as barras aparecem.
            onChangeText={(t) => { setDevolucao(mascaraData(t)); setErros({ ...erros, devolucao: undefined }); }}
          />

          {/* Atalhos: cada botão preenche a data com "hoje + N dias". */}
          <View style={styles.linhaAtalhos}>
            {ATALHOS_DIAS.map((dias) => (
              <TouchableOpacity
                key={dias}
                style={styles.atalho}
                onPress={() => { setDevolucao(formatarData(somarDias(dias))); setErros({ ...erros, devolucao: undefined }); }}
              >
                <Text style={styles.atalhoTexto}>+{dias} dias</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* A data do empréstimo é automática: hoje. */}
          <Text style={styles.dataHoje}>Data do empréstimo: hoje ({formatarData(new Date())})</Text>

          <View style={styles.linhaBotoes}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelar}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmar}>
              <Text style={styles.botaoConfirmarTexto}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }, // fundo escurecido
  caixa: { backgroundColor: CORES.branco, borderRadius: 20, padding: 20 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titulo: { fontFamily: FONTE_TITULO, fontSize: 20, fontWeight: 'bold', color: CORES.marrom },
  resumoLivro: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CORES.bege, borderRadius: 12, padding: 12, marginBottom: 16 },
  livroTitulo: { fontWeight: 'bold', color: CORES.texto },
  livroAutor: { color: CORES.cinza, fontSize: 13 },
  linhaAtalhos: { flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: 12 },
  atalho: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: CORES.bege, borderWidth: 1, borderColor: CORES.begeEscuro },
  atalhoTexto: { color: CORES.marrom, fontWeight: '600', fontSize: 13 },
  dataHoje: { color: CORES.cinza, fontSize: 13, marginBottom: 16 },
  linhaBotoes: { flexDirection: 'row', gap: 10 },
  botaoCancelar: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#f3f4f6' },
  botaoCancelarTexto: { color: CORES.texto, fontWeight: '600' },
  botaoConfirmar: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: CORES.vinho },
  botaoConfirmarTexto: { color: '#fff', fontWeight: '600' },
});