import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [category, setCategory] = useState('');
  const [expense, setExpense] = useState('');
  const [total, setTotal] = useState(0);
  const [expensesList, setExpensesList] = useState<{ category: string, value: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Casa', 'Outros'];

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
    loadExpenses();
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
      setModalVisible(false);
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
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Adicionar Despesas</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: '#171718' }]} 
        onPress={() => clearList()}
      >
        <Text style={styles.addButtonText}>Resetar</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
              <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: '#171718' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.addButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={Object.keys(groupedExpenses)}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item}</Text>
            <Text style={styles.itemValue}>R$ {groupedExpenses[item].toFixed(2)}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}  // Aplica o estilo de alinhamento da lista
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#494848',
    paddingTop: 70,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  listContainer: {
    flex: 1,  
    justifyContent: 'flex-end',  
    width: '100%',
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#909090',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 40,
    margin: 20,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
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
    flexDirection: 'row',
    gap: 15,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#494848',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#636363',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
