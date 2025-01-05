import { StatusBar, StyleSheet, Text, View } from 'react-native';
import Main from '../../components/Main';

export default function Home() {
  return (
    <View style={styles.container}>
      <Main/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
