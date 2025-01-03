import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [category, setCategory] = useState('');
  const [expense, setExpense] = useState('');
  const [total, setTotal] = useState(0);
  const [expensesList, setExpensesList] = useState<{ category: string, value: string }[]>([]);

  // Lista de categorias pré-definidas
  const categories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Outros'];

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
  const saveExpenses = async (newExpensesList: { category: string, value: string }[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpensesList));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  // Função para calcular o total das despesas
  const calculateTotal = (expenses: { category: string, value: string }[]) => {
    const totalSum = expenses.reduce((sum, expense) => sum + parseFloat(expense.value), 0);
    setTotal(totalSum);
  };

  useEffect(() => {
    loadExpenses();  // Carrega as despesas ao iniciar o app
  }, []);

  const addExpense = () => {
    if (!isNaN(Number(expense)) && expense.trim() !== '') {
      const newExpense = { category, value: expense };
      const updatedExpenses = [...expensesList, newExpense];
      setExpensesList(updatedExpenses);
      saveExpenses(updatedExpenses); // Salva a lista atualizada no AsyncStorage
      setExpense('');
      setCategory('');
      calculateTotal(updatedExpenses);
    } else {
      alert('Por favor, selecione uma categoria e insira um valor numérico válido para a despesa.');
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Despesas</Text>
        <Text style={styles.itemTitle}>R$ {total}</Text>
      </View>
      <Text style={styles.headerText}>Adicionar Despesas</Text>
      <View style={styles.inputContainer}>
        <Picker
          selectedValue={category}
          style={styles.inputBox}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Selecione a categoria" value="" />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
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
            <Text style={styles.itemTitle}>{item.category}</Text>
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
    paddingTop: 70,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  headerContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputBox: {
    height: 55,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '50%',
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  buttonsContainer: {
    display: 'flex',
    gap: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#e9e9e9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 18,
    color: '#800080',
  },
  picker: {
    width: '70%',  // Ajusta a largura do Picker para não ser cortado
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
  },
});
