import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

export default function Home() {
  const [category, setCategory] = useState('');
  const [expense, setExpense] = useState('');
  const [total, setTotal] = useState(0);
  const [expensesByMonth, setExpensesByMonth] = useState<{ [key: string]: { category: string, value: number }[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const categories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Casa', 'Outros'];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpensesByMonth(parsedExpenses);
        calculateTotal(parsedExpenses[selectedMonth] || []);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async (newExpensesByMonth: { [key: string]: { category: string, value: number }[] }) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpensesByMonth));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const calculateTotal = (expenses: { category: string, value: number }[]) => {
    const totalSum = expenses.reduce((sum, expense) => sum + expense.value, 0);
    setTotal(totalSum);
  };

  const addExpense = () => {
    const numericExpense = parseFloat(expense);

    if (category.trim() !== '' && !isNaN(numericExpense) && numericExpense > 0) {
      const newExpense = { category, value: numericExpense };
      
      const updatedExpenses = { ...expensesByMonth };
      if (!updatedExpenses[selectedMonth]) {
        updatedExpenses[selectedMonth] = [];
      }
      
      updatedExpenses[selectedMonth].push(newExpense);
      setExpensesByMonth(updatedExpenses);
      saveExpenses(updatedExpenses);
      setExpense('');
      setCategory('');
      setModalVisible(false);
      calculateTotal(updatedExpenses[selectedMonth]);
    } else {
      Alert.alert('Erro', 'Por favor, selecione uma categoria e insira um valor numérico válido para a despesa.');
    }
  };

  const deleteExpense = (expenseIndex: number) => {
    const updatedExpenses = { ...expensesByMonth };
    if (updatedExpenses[selectedMonth]) {
      updatedExpenses[selectedMonth] = updatedExpenses[selectedMonth].filter((_, index) => index !== expenseIndex);
      setExpensesByMonth(updatedExpenses);
      saveExpenses(updatedExpenses);
      calculateTotal(updatedExpenses[selectedMonth]);
    }
  };

  const changeMonth = (direction: 'next' | 'prev') => {
    let newMonth = selectedMonth + (direction === 'next' ? 1 : -1);
    if (newMonth > 12) {
      newMonth = 1;
    } else if (newMonth < 1) {
      newMonth = 12;
    }
    setSelectedMonth(newMonth);
    calculateTotal(expensesByMonth[newMonth] || []);
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

  const groupedExpenses = expensesByMonth[selectedMonth] || [];
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Total</Text>
        <Text style={styles.headerText}>R$ {total.toFixed(2)}</Text>
      </View>
      
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity onPress={() => changeMonth('prev')}>
          <Text style={[styles.monthSelectorText, {opacity: 0.5}]}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.monthSelectorText}>
          {monthNames[selectedMonth - 1]}
        </Text>
        <TouchableOpacity onPress={() => changeMonth('next')}>
          <Text style={[styles.monthSelectorText, {opacity: 0.5}]}>Próximo</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Adicionar Despesas</Text>
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
                style={styles.picker}
                onValueChange={(itemValue) => setCategory(itemValue)}
              >
                <Picker.Item label="Categoria" value="" />
                {categories.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} />
                ))}
              </Picker>
              <TextInput
                style={styles.valueBox}
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
        data={groupedExpenses}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.category}</Text>
            <Text style={styles.itemValue}>R$ {item.value.toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteExpense(index)}
            >
              <Image source={require('../../../assets/delete-icon.png')}
              style={{ width: 38, height: 38 }} 
              />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
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
  valueBox: {
    height: 55,
    borderColor: '#fff',
    color: '#fff',
    borderWidth: 1,
    width: '40%',
    paddingLeft: 20,
    marginBottom: 15,
    borderRadius: 20,
    fontSize: 18,
  },
  picker: {
    height: 55,
    color: '#fff',
    width: '55%',
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
  monthSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  monthSelectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    marginLeft: 10,
  }, 
});
