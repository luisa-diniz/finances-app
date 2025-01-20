import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Alert, Modal, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

export default function Home() {
  const [category, setCategory] = useState('');
  const [expense, setExpense] = useState('');
  const [total, setTotal] = useState(0);
  const [expensesByMonth, setExpensesByMonth] = useState<{ [key: string]: { category: string, value: number }[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const groupExpensesByCategory = () => {
    const grouped: { [key: string]: { category: string, value: number }[] } = {};
    const expenses = expensesByMonth[selectedMonth] || [];
    
    expenses.forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = [];
      }
      grouped[expense.category].push(expense);
    });

    return grouped;
  };

  const groupedExpenses = groupExpensesByCategory();

  const showCategoryDetails = (category: string) => {
    setSelectedCategory(category);
  };

  const deleteCategoryExpenses = () => {
    const updatedExpenses = { ...expensesByMonth };
    if (updatedExpenses[selectedMonth]) {
      updatedExpenses[selectedMonth] = updatedExpenses[selectedMonth].filter(
        expense => expense.category !== selectedCategory
      );
      setExpensesByMonth(updatedExpenses);
      saveExpenses(updatedExpenses);
      calculateTotal(updatedExpenses[selectedMonth]);
    }
    setSelectedCategory(null);
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth]);

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
        style={styles.defaultButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.defaultButtonText}>Adicionar Despesas</Text>
      </TouchableOpacity>

      <FlatList
          data={Object.keys(groupedExpenses)
            .sort((a, b) => {
              const totalA = groupedExpenses[a].reduce((sum, expense) => sum + expense.value, 0);
              const totalB = groupedExpenses[b].reduce((sum, expense) => sum + expense.value, 0);
              return totalB - totalA;
            })}        
          renderItem={({ item }) => {
          const categoryTotal = groupedExpenses[item].reduce((sum, expense) => sum + expense.value, 0);
          return (
            <TouchableOpacity onPress={() => showCategoryDetails(item)}>
              <View style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item}</Text>
                <Text style={styles.itemValue}>R$ {categoryTotal.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

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
              <TouchableOpacity style={styles.defaultButton} onPress={addExpense}>
                <Text style={styles.defaultButtonText}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.defaultButton, { backgroundColor: '#171718' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.defaultButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedCategory !== null}
        onRequestClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={[styles.headerText, , { marginBottom: 20 }]}>{selectedCategory}</Text>

            <FlatList<{ category: string; value: number }>
              data={groupedExpenses[selectedCategory || ''] || []}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemTitle}>{item.category}</Text>
                  <Text style={styles.itemValue}>R$ {item.value.toFixed(2)}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.detailsListContainer}
            />

            <View style={[styles.buttonsContainer , { marginTop: 15, marginBottom: 5,}]}>
              <TouchableOpacity 
                style={[styles.defaultButton, { backgroundColor: '#2e2e2e' }]} 
                onPress={deleteCategoryExpenses}
              >
                <Image source={require('../../../assets/delete-icon.png')} style={{ width: 22, height: 22 }} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.defaultButton, { backgroundColor: '#171718' }]} 
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.defaultButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
