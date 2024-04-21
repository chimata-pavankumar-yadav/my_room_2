import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, StyleSheet, ScrollView, FlatList, View, Text, TouchableOpacity , Alert} from 'react-native';
import { DataTable } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import ModalDropdown from 'react-native-modal-dropdown';

const TableExample = ({ route, navigation }) => {
  const db = SQLite.openDatabase('my_room_1.db');
  const [data, setData] = useState([]);
  

  const DEMO_OPTIONS_1 = ['option 1', 'option 2', 'option 3', 'option 4', 'option 5', 'option 6', 'option 7', 'option 8', 'option 9'];


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(() => {
    db.transaction(tx => {
      
        
      tx.executeSql(
        `select * from room_amount;`,
        [],
        (_, { rows: { _array } }) => setData(_array),
        (tx, error) => {
          console.error(error);
        }
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  
  const deleteFun = (item) => {
    console.log(item.groceries,'delete amount')
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => confirmDelete(item.id,item.groceries)
        }
      ]
    );
  };

  const confirmDelete = (id, groceriesAmount) => {
   
    db.transaction(tx => {
      tx.executeSql(
        "DELETE FROM room_amount WHERE id = ?;",
        [id],
        (_, deleteResult) => {
          console.log("Row deleted successfully");
           // Refresh data after deletion
        },
        (_, error) => {
          console.error("Error deleting row:", error);
        }
      );

      tx.executeSql(
        'update groceries_amount set totalAmount = totalAmount - ? where id = 1',
        [groceriesAmount],
        (_, updateResult) => { 
          // Handle successful update
          
          fetchData();
        },
        (_, updateError) => {
          // Handle error updating groceries_amount
          console.error('Error updating groceries_amount:', updateError);
        }
      );
      
    });
  };
  
  const month = () => {
    return <ModalDropdown style={styles.dropdown_1}
    options={DEMO_OPTIONS_1} defaultValue={'Month'}
/> 
  }
  
  return (
    <View style={styles.container}>
      {data.length === 0 ? (
        <View style={{ alignItems: 'center', marginVertical: 300 }}>
          <Text style={{ fontSize: 20, color: 'gray' }}>No data Added</Text>
        </View>
      ) : (
        <>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title> Month</DataTable.Title>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Rent</DataTable.Title>
            <DataTable.Title>Bills</DataTable.Title>
            <DataTable.Title>Groceries</DataTable.Title>
            <DataTable.Title>Total</DataTable.Title>
          </DataTable.Header>
          <FlatList
            data={data}
            renderItem={({ item }) => (
              
              <DataTable>
              <TouchableOpacity onLongPress={() => {deleteFun(item)}}>
                <DataTable.Row>
               
                  <DataTable.Cell>{item.date}</DataTable.Cell>
                  <DataTable.Cell>{item.Name}</DataTable.Cell>
                  <DataTable.Cell>{item.rent}</DataTable.Cell>
                  <DataTable.Cell>{item.bills}</DataTable.Cell>
                  <DataTable.Cell>{item.groceries}</DataTable.Cell>
                  <DataTable.Cell>{item.total}</DataTable.Cell>
                </DataTable.Row>
              </TouchableOpacity>
              </DataTable> 
        
            )}
            keyExtractor={(item, index) => index.toString()} // Use keyExtractor instead of key prop
          />
        </>
      )}
    </View>
  );
};

export default TableExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
   
  },
  tableHeader: {
    backgroundColor: '#DCDCDC',
  },dropdown_1: {
    flex: 1,
    top: 32,
    left: 8,
    justifyContent:'center',
    paddingTop:5,
    
  },
});