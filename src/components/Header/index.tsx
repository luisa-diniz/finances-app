import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState(0);
  const [expense, setExpense] = useState('');
  const [expensesList, setExpensesList] = useState<{ title: string, value: string }[]>([]);

  // Recuperar a lista de despesas ao carregar o app
  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        setExpensesList(JSON.parse(savedExpenses));  // Converte de volta para o formato de lista
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  // Salvar lista de despesas no AsyncStorage
  const saveExpenses = async (newExpensesList: { title: string, value: string }[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpensesList));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  // Função para calcular o total das despesas
  const calculateTotal = (expenses: { title: string, value: string }[]) => {
    const totalSum = expenses.reduce((sum, expense) => sum + parseFloat(expense.value), 0);
    setTotal(totalSum);
  };

  useEffect(() => {
    loadExpenses();  // Carrega as despesas ao iniciar o app
  }, []);

  const addExpense = () => {
    if (title.trim() !== '' && !isNaN(Number(expense)) && expense.trim() !== '') {
      const newExpense = { title, value: expense };
      const updatedExpenses = [...expensesList, newExpense];
      setExpensesList(updatedExpenses);
      saveExpenses(updatedExpenses); // Salva a lista atualizada no AsyncStorage
      setTitle('');
      setExpense('');
      calculateTotal(updatedExpenses);
    } else {
      alert('Por favor, insira um título válido e um valor numérico válido para a despesa.');
    }
  };
  const clearList = async () => {
    try {
      await AsyncStorage.clear();      
      setExpensesList([]);
      setTotal(0);
    } catch (error) {
      console.error('Error clearing expenses:', error);
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Despesas</Text>
        <Text>R$ {total}</Text>
      </View>
      <Text style={styles.headerText}>Adicionar Despesas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Título da despesa"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="Valor"
          keyboardType="numeric"
          value={expense}
          onChangeText={setExpense}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Adicionar" onPress={addExpense} color="#800080" />
        <Button title="Resetar" onPress={clearList} color="red" /> 
      </View>
      <FlatList
        data={expensesList}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemValue}>R$ {item.value}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    display: 'flex',
    gap: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  inputBox: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '50%',
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 18,
    color: '#800080',
  },
  buttonsContainer: {
    display: 'flex',
    gap: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
