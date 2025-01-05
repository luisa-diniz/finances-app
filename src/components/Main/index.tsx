import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [category, setCategory] = useState('');
  const [expense, setExpense] = useState('');
  const [total, setTotal] = useState(0);
  const [expensesList, setExpensesList] = useState<{ category: string, value: number }[]>([]);

  const categories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Casa', 'Outros'];

  // Recuperar a lista de despesas ao carregar o app
  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpensesList(parsedExpenses);
        calculateTotal(parsedExpenses);  
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async (newExpensesList: { category: string, value: number }[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpensesList));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const calculateTotal = (expenses: { category: string, value: number }[]) => {
    const totalSum = expenses.reduce((sum, expense) => sum + expense.value, 0);
    setTotal(totalSum);
  };

  const calculateTotalByCategory = (expenses: { category: string, value: number }[]) => {
    return expenses.reduce<{ [key: string]: number }>((acc, expense) => {
      if (acc[expense.category]) {
        acc[expense.category] += expense.value;
      } else {
        acc[expense.category] = expense.value;
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    loadExpenses();  // Carrega as despesas ao iniciar o app
  }, []);

  const addExpense = () => {
    const numericExpense = parseFloat(expense);

    if (category.trim() !== '' && !isNaN(numericExpense) && numericExpense > 0) {
      const newExpense = { category, value: numericExpense };
      const updatedExpenses = [...expensesList, newExpense];
      setExpensesList(updatedExpenses);
      saveExpenses(updatedExpenses);
      setExpense('');
      setCategory('');
      calculateTotal(updatedExpenses);
    } else {
      Alert.alert('Erro', 'Por favor, selecione uma categoria e insira um valor numérico válido para a despesa.');
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

  const groupedExpenses = calculateTotalByCategory(expensesList);  // Agrupa as despesas por categoria para exibição.

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Total</Text>
        <Text style={styles.headerText}>R$ {total.toFixed(2)}</Text>
      </View>
      <Text style={styles.headerText}>Adicionar Despesas</Text>
      <View style={styles.inputContainer}>
        <Picker
          selectedValue={category}
          style={styles.inputBox}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Categoria" value="" />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
        <TextInput
          style={styles.inputBox}
          placeholder="Valor"
          keyboardType="numeric"
          value={expense}
          onChangeText={(text) => setExpense(text.replace(/[^\d.,]/g, '').replace(/,/g, '.'))}
          />
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Adicionar" onPress={addExpense} color="#636363" />
        <Button title="Resetar" onPress={clearList} color="red" />
      </View>
      <FlatList
        data={Object.keys(groupedExpenses)}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item}</Text>
            <Text style={styles.itemValue}>R$ {groupedExpenses[item].toFixed(2)}</Text>
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
    backgroundColor: '#494848',
    paddingTop: 70,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  headerContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#909090',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 40,
    margin: 20,
    minHeight: 70,
    minWidth: '85%',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    display: 'flex',
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  inputBox: {
    height: 55,
    borderColor: '#fff',
    color: '#fff',
    borderWidth: 1,
    width: '50%',
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 20,
  },
  buttonsContainer: {
    display: 'flex',
    gap: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#909090',
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
    color: '#fff',
  },
  itemValue: {
    fontSize: 18,
    color: '#fff',
  },
  picker: {
    height: 40,
    color: '#fff',
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
  },
});
