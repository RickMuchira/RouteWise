import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const StudentPicker = ({ students, onSelect, onClose }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.studentItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.studentName}>
        {item.first_name} {item.last_name}
      </Text>
      <Text style={styles.studentGrade}>{item.grade}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Student</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.list}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  studentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentGrade: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentPicker;