import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Livro, RootStackParamList } from '../types';
import { CORES, SOMBRA } from '../theme';
import CampoTexto from '../components/CampoTexto';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'> & {
  onAdicionarLivro: (dados: Omit<Livro, 'id' | 'emprestado'>) => void;
};

type Erros = { titulo?: string; autor?: string; ano?: string; genero?: string };

const GENEROS = ['Romance', 'Ficção', 'Fantasia', 'Terror', 'Biografia', 'Técnico', 'Outro'];

export default function CadastroLivroScreen({ navigation, onAdicionarLivro }: Props) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [erros, setErros] = useState<Erros>({});

  // Validação (igual à Etapa 3): confere cada campo e guarda as mensagens em "novosErros".
  function validar(): boolean {
    const novosErros: Erros = {};

    if (titulo.trim().length === 0) novosErros.titulo = 'Informe o título do livro.';
    if (autor.trim().length === 0) novosErros.autor = 'Informe o nome do autor.';

    const anoLimpo = ano.trim();
    const anoAtual = new Date().getFullYear();
    if (anoLimpo.length === 0) {
      novosErros.ano = 'Informe o ano de publicação.';
    } else if (!/^\d{4}$/.test(anoLimpo)) {
      novosErros.ano = 'O ano deve ter 4 números (ex.: 1999).';
    } else if (Number(anoLimpo) > anoAtual) {
      novosErros.ano = `O ano não pode ser maior que ${anoAtual}.`;
    }

    if (genero === '') novosErros.genero = 'Selecione um gênero.';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function salvar() {
    if (!validar()) return; // com erro, para aqui

    onAdicionarLivro({ titulo: titulo.trim(), autor: autor.trim(), ano: ano.trim(), genero });

    Alert.alert('Sucesso', 'Livro cadastrado com sucesso!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <CampoTexto
            rotulo="Título *"
            placeholder="Ex.: Memórias Póstumas de Brás Cubas"
            value={titulo}
            erro={erros.titulo}
            onChangeText={(t) => { setTitulo(t); setErros({ ...erros, titulo: undefined }); }}
          />
          <CampoTexto
            rotulo="Autor *"
            placeholder="Ex.: Machado de Assis"
            value={autor}
            erro={erros.autor}
            onChangeText={(t) => { setAutor(t); setErros({ ...erros, autor: undefined }); }}
          />
          <CampoTexto
            rotulo="Ano de publicação *"
            placeholder="Ex.: 1881"
            value={ano}
            keyboardType="numeric"
            maxLength={4}
            erro={erros.ano}
            onChangeText={(t) => { setAno(t); setErros({ ...erros, ano: undefined }); }}
          />

          <Text style={styles.rotulo}>Gênero *</Text>
          <View style={styles.linhaGeneros}>
            {GENEROS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, genero === g && styles.chipAtivo]}
                onPress={() => { setGenero(g); setErros({ ...erros, genero: undefined }); }}
              >
                <Text style={[styles.chipTexto, genero === g && styles.chipTextoAtivo]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {erros.genero ? <Text style={styles.textoErro}>{erros.genero}</Text> : null}

          <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
            <Text style={styles.botaoSalvarTexto}>Cadastrar livro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: CORES.fundo, flexGrow: 1 },
  cartao: { backgroundColor: CORES.branco, borderRadius: 16, padding: 20, ...SOMBRA },
  rotulo: { fontWeight: '600', marginBottom: 8, color: CORES.texto },
  linhaGeneros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, // flexWrap: quebra de linha
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: CORES.branco, borderWidth: 1, borderColor: CORES.borda },
  chipAtivo: { backgroundColor: CORES.vinho, borderColor: CORES.vinho },
  chipTexto: { color: CORES.cinza, fontWeight: '600' },
  chipTextoAtivo: { color: '#fff' },
  textoErro: { color: CORES.erro, marginTop: 6, fontSize: 13 },
  botaoSalvar: { backgroundColor: CORES.vinho, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  botaoSalvarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: { padding: 14, alignItems: 'center', marginTop: 4 },
  botaoCancelarTexto: { color: CORES.cinza, fontWeight: '600' },
});